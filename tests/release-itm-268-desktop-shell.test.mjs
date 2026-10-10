// Independent release coverage for ITM-268's delivered shell composition.
// Module: MOD-desktop-shell
// Level: release
// Guards: UC-003; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN; NO SECRET IN THE REPOSITORY
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync, lstatSync, mkdirSync, readlinkSync, rmdirSync, symlinkSync, unlinkSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test, { after } from "node:test";
import { bridgeApi } from "../src/bridge-http/index.mjs";

const fixtureRoot = new URL("..", import.meta.url).pathname;
const ssh2Cache = join(tmpdir(), "agent-m-291-release-ssh2-1.17.0");
const fixtureModules = join(fixtureRoot, "node_modules"), fixtureSsh2 = join(fixtureModules, "ssh2");
let fixtureModulesCreated = false, fixtureSsh2Owned = false;
function ssh2Runtime() {
  if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) {
    const installed = spawnSync("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
    if (installed.status !== 0) throw new Error(`ssh2 staging failed: ${installed.stderr}`);
  }
  return join(ssh2Cache, "node_modules");
}
function stageSsh2() {
  const target = join(ssh2Runtime(), "ssh2");
  if (!existsSync(fixtureModules)) { mkdirSync(fixtureModules); fixtureModulesCreated = true; }
  if (existsSync(fixtureSsh2)) {
    if (!lstatSync(fixtureSsh2).isSymbolicLink() || readlinkSync(fixtureSsh2) !== target) throw new Error("existing fixture ssh2 link differs");
  } else { symlinkSync(target, fixtureSsh2); fixtureSsh2Owned = true; }
}
stageSsh2();
after(() => { if (fixtureSsh2Owned) unlinkSync(fixtureSsh2); if (fixtureModulesCreated) rmdirSync(fixtureModules); });

const { compose } = await import("../src/desktop-shell/compose.mjs");

const ORIGIN = "https://release-shell-owner.github.io";
const KEY = "transient-release-endpoint-key";
const listen = (server) => new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", () => resolve(server.address().port)); });
const close = (server) => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
const request = (bridge, token, args, origin = ORIGIN) => fetch(`${bridge.address}/v1/probes/endpoint-test`, { method: "POST", headers: { Origin: origin, "content-type": "application/json", [bridgeApi.tokenHeader]: token }, body: JSON.stringify({ args }) });

// TST-268901
// Precondition: production compose.mjs and the real public loopback server start with an empty private folder; a
// controlled own-model endpoint accepts one OpenAI-compatible short request.
// Input: send an unpaired probe, a cross-origin probe, then one paired configured-origin endpoint-test probe.
// Expected: both boundary refusals arrive before dispatch; the paired request reaches jobHandlers and the endpoint once,
// unwraps its answer, and its key/base URL are absent from private retained data and bridge logs.
// Planted fault: temporarily replacing `jobHandlers()` with `{}` in src/desktop-shell/compose.mjs makes the paired
// 200/one-arrival guard fail with 404; byte-exact restoration makes this positive pass.
test("TST-268901: real public compose pairs before dispatch and unwraps one controlled endpoint answer", async (t) => {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-release-268-"));
  const received = [], lines = [], previousInfo = console.info;
  const endpoint = http.createServer(async (incoming, outgoing) => {
    let body = ""; for await (const chunk of incoming) body += chunk;
    received.push({ url: incoming.url, authorization: incoming.headers.authorization, body: JSON.parse(body) });
    outgoing.writeHead(200, { "content-type": "application/json" });
    outgoing.end(JSON.stringify({ choices: [{ message: { content: "ok" } }] }));
  });
  const endpointPort = await listen(endpoint);
  const bridge = await compose({ instance: "release-shell-owner/agent-m", origin: ORIGIN, dataFolder: folder, port: 0 });
  console.info = (...values) => lines.push(values.join(" "));
  t.after(async () => { console.info = previousInfo; await bridge.close(); await close(endpoint); await rm(folder, { recursive: true, force: true }); });
  const config = { name: "own-model-server", kind: "openai-compatible", baseUrl: `http://127.0.0.1:${endpointPort}/v1`, model: "small", key: KEY };
  assert.match(bridge.address, /^http:\/\/127\.0\.0\.1:\d+$/, "known positive: public compose binds its real server to loopback");
  assert.equal((await request(bridge, "", config)).status, 401, "failure node: pairing refusal precedes job-handler dispatch");
  assert.equal((await request(bridge, bridge.token, config, "https://other.example")).status, 403, "failure node: origin refusal precedes job-handler dispatch");
  assert.deepEqual(received, [], "boundary refusals make no own-model request");
  const response = await request(bridge, bridge.token, config);
  assert.equal(response.status, 200, "failure node: paired public request reaches registered jobHandlers");
  assert.deepEqual(await response.json(), { answer: { works: true, model: "small" } }, "the public protocol unwraps the short endpoint answer");
  assert.deepEqual(received, [{ url: "/v1/chat/completions", authorization: `Bearer ${KEY}`, body: { model: "small", messages: [{ role: "user", content: "Reply with one word: ok." }], max_tokens: 1 } }], "one paired probe reaches the controlled own-model endpoint once");
  assert.equal((await readFile(join(folder, "pairing-token"), "utf8")).includes(KEY), false, "endpoint key is absent from retained shell data");
  assert.equal(lines.join("\n").includes(KEY) || lines.join("\n").includes(config.baseUrl), false, "endpoint credentials are absent from bridge logs");
});
