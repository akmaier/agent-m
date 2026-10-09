// Canonical tunnel plans and HTTPS proxy configuration for the Bridge client.
//
// Module: MOD-bridge-client
// Guards: UC-003; UC-011; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE;
// A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; THE DASHBOARD WRITES THE TUNNEL COMMANDS;
// THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN;
// THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
// Level: unit
//
// Run: node --test tests/bridge-client-tunnel-plans.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { allocatePort, tunnelCommands, proxyConfiguration } from "../src/bridge-client/index.mjs";

const jumpHost = {
  hostname: "jump.example.test",
  user: "bridge-user",
  sshPort: 2222,
  portRange: [40100, 40103],
  httpsAddress: "https://jump.example.test",
  login: { user: "proxy-user", password: "jump-host-password" },
};

const sessions = [
  { name: "gpu-box", port: 40100, token: "session-token-1" },
  { name: "lab-mac", port: 40102, token: "session-token-2" },
];

// TST-282001 · level: unit · module: MOD-bridge-client
// guards: UC-011; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
// given: a configured jump host has an inclusive range with two occupied ports
// input: allocatePort([40100, 40103], sessions), then an exhausted two-port range
// expect: the lowest unoccupied port is returned; exhaustion throws NoFreePort and names its range
test("TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion", () => {
  assert.equal(allocatePort([40100, 40103], sessions), 40101);
  assert.throws(() => allocatePort([40100, 40101], [{ name: "one", port: 40100, token: "a" }, { name: "two", port: 40101, token: "b" }]),
    (error) => error?.name === "NoFreePort" && /40100.*40101/.test(error.message));
});

// TST-282002 · level: unit · module: MOD-bridge-client
// guards: UC-011; THE DASHBOARD WRITES THE TUNNEL COMMANDS; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
// given: one remote Bridge and one local Bridge have distinct key-file names
// input: tunnelCommands(jumpHost, gpu-box, 4715, { remote, local })
// expect: reverse and forward commands and their two plans agree on supplied ports and key files, use loopback-only ends and keep-alives, omit the token, and retain the reverse command in the service description
test("TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned", () => {
  const result = tunnelCommands(jumpHost, sessions[0], 4715, {
    remote: "~/.ssh/agent-m-remote",
    local: "~/.ssh/agent-m-local",
  });
  assert.match(result.reverse, /ssh -N/);
  assert.match(result.reverse, /-p 2222/);
  assert.match(result.reverse, /-R 127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
  assert.match(result.reverse, /ServerAliveInterval=/);
  assert.match(result.reverse, /ServerAliveCountMax=/);
  assert.match(result.reverse, /agent-m-remote/);
  assert.match(result.forward, /-L 127\.0\.0\.1:40100:127\.0\.0\.1:40100/);
  assert.match(result.forward, /-p 2222/);
  assert.match(result.forward, /ServerAliveInterval=/);
  assert.match(result.forward, /ServerAliveCountMax=/);
  assert.match(result.forward, /agent-m-local/);
  assert.doesNotMatch(result.reverse + result.forward + result.service, /session-token-1/);
  assert.deepEqual(result.plans, [
    { direction: "reverse", jumpHost: "jump.example.test", user: "bridge-user", sshPort: 2222, remotePort: 40100,
      bind: "127.0.0.1", bridgePort: 4715, keyFile: "~/.ssh/agent-m-remote" },
    { direction: "forward", jumpHost: "jump.example.test", user: "bridge-user", sshPort: 2222, remotePort: 40100,
      bind: "127.0.0.1", bridgePort: 4715, keyFile: "~/.ssh/agent-m-local" },
  ]);
  assert.match(result.service, /agent-m-remote/);
  assert.match(result.service, /127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
});

// TST-282003 · level: unit · module: MOD-bridge-client
// guards: UC-003; UC-011; UC-044; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN; THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE; A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
// given: two remote sessions are reached at the jump host's trusted HTTPS address
// input: proxyConfiguration for Apache and nginx with the instance Pages origin
// expect: both configurations require TLS/login before proxying, answer preflights locally, allow only that origin, and forward each session path to its loopback port without tokens or the supplied jump-host password
test("TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans", () => {
  for (const server of ["apache", "nginx"]) {
    const configuration = proxyConfiguration(jumpHost, sessions, "https://owner.github.io", server);
    assert.match(configuration, /trusted certificate/i);
    assert.match(configuration, /https/i);
    assert.match(configuration, /127\.0\.0\.1:40100/);
    assert.match(configuration, /127\.0\.0\.1:40102/);
    assert.match(configuration, /gpu-box/);
    assert.match(configuration, /lab-mac/);
    assert.doesNotMatch(configuration, /session-token-[12]/);
    assert.doesNotMatch(configuration, new RegExp(jumpHost.login.password));

    for (const session of sessions) {
      const path = `/bridge/${session.name}/`;
      const at = configuration.indexOf(path);
      const end = server === "apache" ? configuration.indexOf("</Location>", at) : configuration.indexOf("\n}", at);
      const block = configuration.slice(at, end < 0 ? configuration.length : end);
      assert.ok(at >= 0, `${server} names ${path}`);
      assert.match(block, server === "apache" ? /AuthType Basic[\s\S]*Require valid-user/ : /auth_basic[\s\S]*auth_basic_user_file/,
        `${server} protects ${path} before handling it`);
      assert.doesNotMatch(configuration, /Access-Control-Allow-Origin[^\n]*\*/, `${server} does not wildcard ${path}'s CORS`);
      if (server === "apache") {
        assert.match(configuration, /SSLCertificateFile[\s\S]*SSLCertificateKeyFile/, "Apache names both TLS certificate files");
        assert.match(configuration, /Header always set Access-Control-Allow-Origin "https:\/\/owner\.github\.io" "expr=%\{HTTP:Origin\} == 'https:\/\/owner\.github\.io'"/,
          `Apache allows only the configured instance origin for ${path}`);
        assert.match(configuration, /RewriteCond %\{HTTP:Origin\} !\^https:\\\/\\\/owner\\\.github\\\.io\$[\s\S]*RewriteRule \^\/bridge\/ - \[R=403,L\]/,
          "Apache refuses a foreign OPTIONS origin before proxy mapping");
        assert.match(configuration, /RewriteCond %\{HTTP:Origin\} \^https:\\\/\\\/owner\\\.github\\\.io\$[\s\S]*RewriteCond %\{REQUEST_METHOD\} =OPTIONS[\s\S]*RewriteRule \^\/bridge\/ - \[R=204,L\]/,
          `Apache returns ${path}'s allowed OPTIONS preflight in vhost context`);
        assert.match(configuration, new RegExp(`ProxyPass "${path}" "http://127\\.0\\.0\\.1:${session.port}/"`),
          `Apache strips ${path} before forwarding the /v1 suffix`);
      } else {
        assert.match(configuration, new RegExp(`location ${path.replace(/[/.]/g, "\\$&")} \\{`),
          `nginx uses a prefix location so ${path} accepts /v1 route suffixes`);
        assert.match(block, /Access-Control-Allow-Origin "https:\/\/owner\.github\.io"/,
          `nginx allows only the configured instance origin for ${path}`);
        assert.match(block, /if \(\$request_method = OPTIONS\) \{[\s\S]*return 204;/,
          `nginx returns ${path}'s OPTIONS preflight itself`);
        assert.match(block, /if \(\$http_origin != "https:\/\/owner\.github\.io"\) \{ return 403; \}/,
          `nginx refuses ${path}'s foreign OPTIONS preflight`);
        assert.ok(block.indexOf("return 204;") < block.indexOf("proxy_pass"),
          `nginx ends ${path}'s OPTIONS request before proxy forwarding`);
        assert.match(block, new RegExp(`proxy_pass http://127\\.0\\.0\\.1:${session.port}/;`),
          `nginx strips ${path} before forwarding the /v1 suffix`);
      }
    }
    assert.doesNotMatch(configuration, /https:\/\/evil\.example/);
  }
});
