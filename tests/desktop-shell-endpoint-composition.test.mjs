// Module: MOD-desktop-shell
// Guards: UC-003; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN; NO SECRET IN THE REPOSITORY
// Level: unit
//
// This exercises the production compose entry. Its controlled endpoint is an in-process loopback server;
// no endpoint configuration or credential is written outside this test's temporary folder.

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import http from "node:http";
import Module from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bridgeApi } from "../src/bridge-http/index.mjs";

const ssh2Cache = join(tmpdir(), "agent-m-291-desktop-endpoint-ssh2-1.17.0");
let sshRuntimeFailure;
function sshRuntime() {
  if (sshRuntimeFailure) throw sshRuntimeFailure;
  try {
    if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) {
      const installed = spawnSync("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
      assert.equal(installed.status, 0, `ssh2 staging failed: ${installed.stderr}`);
    }
    const nodePath = join(ssh2Cache, "node_modules");
    const positive = spawnSync(process.execPath, ["-e", "const ssh2=require('ssh2');if(require('ssh2/package.json').version!=='1.17.0'||typeof ssh2.utils.generateKeyPairSync!=='function')throw Error('ssh2 known positive');console.log('ssh2-known-positive')"], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: nodePath } });
    assert.equal(positive.status, 0, `ssh2 known positive failed: ${positive.stderr}`);
    assert.match(positive.stdout, /ssh2-known-positive/);
    return nodePath;
  } catch (failure) { sshRuntimeFailure = failure; throw failure; }
}
process.env.NODE_PATH = sshRuntime();
Module._initPaths();
const { compose } = await import("../src/desktop-shell/compose.mjs");

const ORIGIN = "https://shell-owner.github.io";
const KEY = "transient-shell-endpoint-key";

const listen = (server) => new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});
const close = (server) => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
const request = (bridge, token, args, origin = ORIGIN) => fetch(`${bridge.address}/v1/probes/endpoint-test`, {
  method: "POST",
  headers: { Origin: origin, "content-type": "application/json", [bridgeApi.tokenHeader]: token },
  body: JSON.stringify({ args }),
});

// TST-268001
// given: the production shell composition, its real paired loopback server, and a controlled local OpenAI-compatible endpoint
// input: an unpaired request, a cross-origin request, then a paired endpoint-test request through compose.mjs
// expect: pairing and origin refuse before dispatch; the paired request reaches the controlled endpoint once through jobHandlers,
//         returns the endpoint-test result, and neither the endpoint key nor URL is retained in the pairing folder or logs
// Planted fault: leaving compose.mjs with jobs: {} makes the paired assertion fail with 404 before the controlled endpoint receives a request.
test("TST-268001: production compose registers endpoint-test with pairing, origin, loopback, and secret boundaries intact", async (t) => {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-268-shell-"));
  const received = [], lines = [], previousInfo = console.info;
  const endpoint = http.createServer(async (incoming, outgoing) => {
    let body = "";
    for await (const chunk of incoming) body += chunk;
    received.push({ url: incoming.url, authorization: incoming.headers.authorization, body: JSON.parse(body) });
    outgoing.writeHead(200, { "content-type": "application/json" });
    outgoing.end(JSON.stringify({ choices: [{ message: { content: "ok" } }] }));
  });
  const endpointPort = await listen(endpoint);
  const bridge = await compose({ instance: "shell-owner/agent-m", origin: ORIGIN, dataFolder: folder, port: 0 });
  console.info = (...values) => lines.push(values.join(" "));
  t.after(async () => {
    console.info = previousInfo;
    await bridge.close();
    await close(endpoint);
    await rm(folder, { recursive: true, force: true });
  });

  const config = { name: "own-model-server", kind: "openai-compatible", baseUrl: `http://127.0.0.1:${endpointPort}/v1`, model: "small", key: KEY };
  assert.match(bridge.address, /^http:\/\/127\.0\.0\.1:\d+$/, "known positive: compose starts the real server on loopback");
  assert.equal((await request(bridge, "", config)).status, 401, "a missing pairing token is refused before the endpoint handler");
  assert.equal((await request(bridge, bridge.token, config, "https://other.example")).status, 403, "a foreign origin is refused before the endpoint handler");
  assert.deepEqual(received, [], "known positive: boundary refusals make no endpoint request");

  const response = await request(bridge, bridge.token, config);
  assert.equal(response.status, 200, "the paired same-origin request reaches the registered production handler");
  assert.deepEqual(await response.json(), { answer: { works: true, model: "small" } });
  assert.deepEqual(received, [{
    url: "/v1/chat/completions",
    authorization: `Bearer ${KEY}`,
    body: { model: "small", messages: [{ role: "user", content: "Reply with one word: ok." }], max_tokens: 1 },
  }], "one bridge probe makes one controlled endpoint request");
  assert.equal((await readFile(join(folder, "pairing-token"), "utf8")).includes(KEY), false, "the endpoint key is absent from retained shell data");
  assert.equal(lines.join("\n").includes(KEY), false, "the endpoint key is absent from bridge logs");
  assert.equal(lines.join("\n").includes(config.baseUrl), false, "the endpoint URL is absent from bridge logs");
});
