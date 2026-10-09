// Module: MOD-bridge-client
// Level: release
// Guards: UC-003; UC-011; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
import assert from "node:assert/strict";
import test from "node:test";
import { allocatePort, proxyConfiguration, tunnelCommands } from "../src/bridge-client/index.mjs";

// TST-282901
// level: release
// module: MOD-bridge-client
// guards: UC-003; UC-011; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN; THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
// given: constructed jump-host and two named remote-session settings with occupied ports and separate key-file names
// input: public allocatePort, tunnelCommands and proxyConfiguration for Apache and nginx
// expect: the lowest inclusive free port and NoFreePort exhaustion are public, commands/plans agree on loopback ports and keepalives, and both proxy texts protect each /v1 prefix with TLS, login and configured-origin-only local preflight
test("TST-282901: public canonical plans allocate, command and proxy each configured Bridge session", () => {
  const host = { hostname: "jump.example.test", user: "bridge", sshPort: 2222, portRange: [40100, 40102], login: { user: "web", password: "constructed-password" } };
  const sessions = [{ name: "alpha", port: 40100, token: "constructed-token-a" }, { name: "beta", port: 40102, token: "constructed-token-b" }];
  assert.equal(allocatePort(host.portRange, sessions), 40101, "failure node: public allocator returns the lowest free inclusive port");
  assert.throws(() => allocatePort([40100, 40100], sessions), (error) => error?.name === "NoFreePort" && /40100/.test(error.message));
  const commands = tunnelCommands(host, sessions[0], 4715, { remote: "remote.key", local: "local.key" });
  assert.match(commands.reverse, /-R 127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
  assert.match(commands.forward, /-L 127\.0\.0\.1:40100:127\.0\.0\.1:40100/);
  assert.match(commands.reverse + commands.forward, /ServerAliveInterval/);
  assert.deepEqual(commands.plans, [
    { direction: "reverse", jumpHost: "jump.example.test", user: "bridge", sshPort: 2222, remotePort: 40100, bind: "127.0.0.1", bridgePort: 4715, keyFile: "remote.key" },
    { direction: "forward", jumpHost: "jump.example.test", user: "bridge", sshPort: 2222, remotePort: 40100, bind: "127.0.0.1", bridgePort: 4715, keyFile: "local.key" },
  ]);
  assert.match(commands.service, /remote\.key[\s\S]*127\.0\.0\.1:40100:127\.0\.0\.1:4715/);
  assert.equal(JSON.stringify(commands.plans).includes("constructed-token-a"), false);
  for (const server of ["apache", "nginx"]) {
    const text = proxyConfiguration(host, sessions, "https://owner.github.io", server);
    for (const session of sessions) {
      assert.match(text, new RegExp(`/bridge/${session.name}/`));
      assert.match(text, new RegExp(`127\\.0\\.0\\.1:${session.port}`));
    }
    assert.match(text, /certificate/i); assert.match(text, /key/i); assert.match(text, /https/i);
    assert.match(text, /https:\/\/owner\.github\.io/); assert.doesNotMatch(text, /Access-Control-Allow-Origin[^\n]*\*/);
    assert.match(text, /OPTIONS/); assert.match(text, /204/); assert.match(text, /403/);
    assert.match(text, server === "apache" ? /AuthType Basic[\s\S]*Require valid-user/ : /auth_basic[\s\S]*auth_basic_user_file/);
    assert.match(text, server === "apache" ? /ProxyPass "\/bridge\/alpha\/" "http:\/\/127\.0\.0\.1:40100\// : /location \/bridge\/alpha\/ \{[\s\S]*proxy_pass http:\/\/127\.0\.0\.1:40100\//);
    assert.equal(text.includes("constructed-token-a") || text.includes("constructed-password"), false);
  }
});
