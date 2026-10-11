// Bridges by name in the Bridge client (ITM-404) — MOD-bridge-client's BridgeEntry, settingsOf and pair, and allocatePort, tunnelCommands and
// proxyConfiguration over Bridge entries, as docs/architecture/MOD-bridge-client.md states them: a Bridge's own address, or for one reached through
// the jump host its HTTPS address with the path `/bridge/<name>` and the web server's login, or the forward of its port without an HTTPS address,
// JumpHostMissing without a jump host; the name the Bridge reports returned by pair; the path made in one place for both settingsOf and
// proxyConfiguration. No request is made but pair's.
// Run: node --test tests/bridge-client-bridges-by-name.test.mjs
//
// Module: MOD-bridge-client
// Guards: UC-011; UC-044
// Guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE BRIDGE IS PAIRED ONCE
// Level: unit
//
// The entries, the jump host and the credentials are constructed; fetch is a stand-in that records its requests. Where the module file leaves a
// reading open, the test states the reading it takes, and the pull request names it:
//   - A Bridge reached directly keeps its own address and carries no login, whatever the jump host holds; settingsOf never gives a login for it.
//   - The jump host's HTTPS address is taken without a closing slash, so the path joins it once; the login is copied, never shared.
//   - Without an HTTPS address the forward of the port is `http://localhost:<port>` and carries no login: the address is not the jump host's.
//   - pair returns the settings it was given, `{ address, token }` with the login if one was given, as before, and in addition the name the Bridge
//     reports as `name` and the settings to store under it, `{ name, address, token, login? }`, as `settings`: the two are not enumerable, so that
//     what the existing tests read of pair's result (ITM-263) is unchanged.
//   - The names of Bridges are taken as path-safe: they stand in a path as they are.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as client from "../src/bridge-client/index.mjs";

const { settingsOf, pair, allocatePort, tunnelCommands, proxyConfiguration, bridgeAt } = client;

const LOGIN = { user: "proxy-user", password: "jump-host-password" };
const JUMP = { hostname: "jump.example.test", user: "bridge-user", sshPort: 2222, portRange: [40100, 40103], httpsAddress: "https://jump.example.test", login: LOGIN };
const FORWARD_ONLY = { hostname: "jump.example.test", user: "bridge-user", sshPort: 2222, portRange: [40100, 40103], login: LOGIN };
const LAPTOP = { name: "laptop", address: "http://127.0.0.1:4711", token: "laptop-token" };
const FORWARDED = { name: "lab-forward", address: "http://localhost:9222", token: "forward-token" };
const GPU = { name: "gpu-box", port: 40100, token: "gpu-token" };
const MAC = { name: "lab-mac", port: 40102, token: "mac-token" };
const ORIGIN = "https://akmaier.github.io";

function withFetch(t, implementation) {
  const prior = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = prior; });
}
const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

// guards: UC-011
// given: a Bridge reached directly on the loopback and one at an SSH forward's address, each with a jump host stored and with none
// input: settingsOf(entry, jumpHost) for each
// expect: the Bridge's name, its own address and its token, nothing else — no login — whatever the jump host
test("settingsOf — a Bridge reached directly keeps its own address and carries no login", () => {
  for (const entry of [LAPTOP, FORWARDED]) {
    for (const jump of [null, JUMP]) assert.deepEqual(settingsOf(entry, jump), { name: entry.name, address: entry.address, token: entry.token });
  }
});

// guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-011
// given: a Bridge at a port of the jump host's range, and a jump host with an HTTPS address and the web server's login; the same with a closing slash
//        on the address, and with no login stored
// input: settingsOf(entry, jumpHost)
// expect: the HTTPS address with the path /bridge/<name> once, the token, a copy of the login; without a login none
test("settingsOf — a Bridge at a port is reached at the jump host's HTTPS address with its path and the web server's login", () => {
  const settings = settingsOf(GPU, JUMP);
  assert.deepEqual(settings, { name: "gpu-box", address: "https://jump.example.test/bridge/gpu-box", token: "gpu-token", login: LOGIN });
  assert.notEqual(settings.login, JUMP.login, "the login is a copy");
  settings.login.password = "changed";
  assert.equal(JUMP.login.password, "jump-host-password");
  assert.equal(settingsOf(MAC, { ...JUMP, httpsAddress: "https://jump.example.test/" }).address, "https://jump.example.test/bridge/lab-mac");
  const { login, ...withoutLogin } = JUMP;
  assert.deepEqual(settingsOf(GPU, withoutLogin), { name: "gpu-box", address: "https://jump.example.test/bridge/gpu-box", token: "gpu-token" });
});

// guards: UC-011
// given: a Bridge at a port, and a jump host with no HTTPS address
// input: settingsOf
// expect: the forward of its port, http://localhost:<port>, the token, and no login
test("settingsOf — without an HTTPS address a Bridge at a port is reached by the forward of its port", () => {
  assert.deepEqual(settingsOf(GPU, FORWARD_ONLY), { name: "gpu-box", address: "http://localhost:40100", token: "gpu-token" });
  assert.deepEqual(settingsOf(MAC, FORWARD_ONLY), { name: "lab-mac", address: "http://localhost:40102", token: "mac-token" });
});

// guards: UC-011
// given: a Bridge at a port with no jump host stored; the same with one
// input: settingsOf(entry, null)
// expect: JumpHostMissing for the first, after the second is shown to give settings; a direct Bridge needs none; no request is made by any
test("settingsOf — a Bridge at a port without a jump host is JumpHostMissing, and no request is made", (t) => {
  let requests = 0;
  withFetch(t, async () => { requests += 1; return json({}); });
  assert.equal(settingsOf(GPU, JUMP).address, "https://jump.example.test/bridge/gpu-box", "known positive");
  assert.equal(settingsOf(LAPTOP, null).address, LAPTOP.address);
  assert.throws(() => settingsOf(GPU, null), (error) => error.name === "JumpHostMissing");
  assert.equal(requests, 0);
});

// guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-011
// given: the settings of a direct, a forwarded and an HTTPS Bridge
// input: bridgeAt(settingsOf(entry, jumpHost))
// expect: the handles' addresses and routes: loopback, forward, jump-host
test("settingsOf — its settings give a handle on the route the Bridge is reached by", () => {
  assert.deepEqual(bridgeAt(settingsOf(LAPTOP, JUMP)), { address: "http://127.0.0.1:4711", route: "loopback" });
  assert.deepEqual(bridgeAt(settingsOf(GPU, FORWARD_ONLY)), { address: "http://localhost:40100", route: "forward" });
  assert.deepEqual(bridgeAt(settingsOf(GPU, JUMP)), { address: "https://jump.example.test/bridge/gpu-box", route: "jump-host" });
});

// guards: THE BRIDGE IS PAIRED ONCE; UC-011
// given: a Bridge at the jump host's HTTPS address with the web server's login that answers /v1/pair with the name "gpu-box"; and one on the
//        loopback that reports "laptop"
// input: pair(address, token, login) and pair(address, token)
// expect: one request, GET /v1/pair, with the token and the Basic login in headers; name is the reported name; settings are { name, address,
//         token, login } and { name, address, token }; the result itself is still { address, token }
test("pair — returns the name the Bridge reports with the settings to store under it", async (t) => {
  const calls = [];
  const reported = { "https://jump.example.test/bridge/gpu-box/v1/pair": "gpu-box", "http://127.0.0.1:4711/v1/pair": "laptop" };
  withFetch(t, async (url, init) => { calls.push({ url: String(url), init }); return json({ bridge: { name: reported[String(url)], version: "1", platform: "linux" }, origin: ORIGIN }); });
  const address = "https://jump.example.test/bridge/gpu-box";
  const answer = await pair(address, "gpu-token", LOGIN);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "gpu-token");
  assert.equal(calls[0].init.headers.Authorization, `Basic ${Buffer.from("proxy-user:jump-host-password").toString("base64")}`);
  assert.equal(answer.name, "gpu-box");
  assert.deepEqual(answer.settings, { name: "gpu-box", address, token: "gpu-token", login: LOGIN });
  assert.deepEqual(answer, { address, token: "gpu-token", login: LOGIN });

  const direct = await pair("http://127.0.0.1:4711", "laptop-token");
  assert.equal(direct.name, "laptop");
  assert.deepEqual(direct.settings, { name: "laptop", address: "http://127.0.0.1:4711", token: "laptop-token" });
  assert.deepEqual(direct, { address: "http://127.0.0.1:4711", token: "laptop-token" });
  assert.equal(calls.length, 2);
});

// guards: EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; UC-011
// given: entries of both forms — two Bridges at a port, two reached directly, which hold no port — and a range of four ports, then of two
// input: allocatePort, then tunnelCommands and settingsOf for the new Bridge at the port allocated
// expect: the lowest port no Bridge at a port holds, the direct ones not counted; NoFreePort naming the range when none is left; the reverse tunnel
//         and the forward both on that port, no token in the commands; the settings of the new entry forward that port
test("allocatePort — the lowest free port over Bridge entries of both forms, the same port in the commands and the settings", () => {
  const entries = [LAPTOP, GPU, FORWARDED, MAC];
  const port = allocatePort([40100, 40103], entries);
  assert.equal(port, 40101);
  assert.equal(allocatePort([40200, 40203], entries), 40200, "a Bridge reached directly holds no port of the range");
  assert.equal(allocatePort([40102, 40103], entries), 40103, "the last port of the range is given when it is the only one free");
  assert.throws(() => allocatePort([40100, 40100], entries), (error) => error.name === "NoFreePort" && /40100/.test(error.message));
  const fresh = { name: "cluster", port, token: "cluster-token" };
  const commands = tunnelCommands(FORWARD_ONLY, fresh, 4711, { remote: "~/.ssh/agent-m-remote", local: "~/.ssh/agent-m-local" });
  assert.match(commands.reverse, /-R 127\.0\.0\.1:40101:127\.0\.0\.1:4711/);
  assert.match(commands.forward, /-L 127\.0\.0\.1:40101:127\.0\.0\.1:40101/);
  assert.ok(!JSON.stringify(commands).includes("cluster-token"));
  assert.equal(settingsOf(fresh, FORWARD_ONLY).address, "http://localhost:40101");
});

// guards: A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; UC-011
// given: two Bridges at a port, and the path their settings carry at the jump host's HTTPS address
// input: proxyConfiguration(jumpHost, entries, origin, "nginx" and "apache")
// expect: for each Bridge the path its settings carry, with a closing slash, forwarded to its port on the loopback — the path from settingsOf, not a
//         copy of it
test("proxyConfiguration — names each Bridge's path as its settings carry it, and its port", () => {
  for (const server of ["nginx", "apache"]) {
    const text = proxyConfiguration(JUMP, [GPU, MAC], ORIGIN, server);
    for (const entry of [GPU, MAC]) {
      const path = new URL(settingsOf(entry, JUMP).address).pathname;
      assert.ok(text.includes(`${path}/`), `${server}: ${path}/`);
      assert.ok(text.includes(`http://127.0.0.1:${entry.port}/`), `${server}: port ${entry.port}`);
      assert.ok(!text.includes(entry.token), "no token in the configuration");
    }
  }
});
