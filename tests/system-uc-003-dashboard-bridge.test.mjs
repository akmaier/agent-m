// UC-003 public-dashboard system coverage for alternative 2a (ITM-266).
// Module: MOD-settings-pages -> MOD-browser-store -> MOD-bridge-client -> MOD-bridge-http -> MOD-bridge-jobs -> MOD-desktop-shell
// Level: system
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE;
//         A CREDENTIAL IS NEVER PLACED IN A URL; NO SECRET IN THE REPOSITORY
//
// The model is a controlled loopback HTTP server. compose(), serveBridge(), jobHandlers(), and the dashboard are real.
// No Electron process, paid endpoint, TLS endpoint, or tunnel is launched by this test.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { openDashboard, press, repoServer, richDocument } from "./app-harness.mjs";
import { compose } from "../src/desktop-shell/compose.mjs";

const ORIGIN = "https://akmaier.github.io";
const PREFIX = "agent-m:akmaier/agent-m:";
const nativeFetch = globalThis.fetch;
const listen = (server) => new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", () => resolve(server.address().port)); });
const close = (server) => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

async function dashboardFor(t, bridge, endpointOrigin) {
  const server = await repoServer({ files: {}, handlers: [async (url, init) => {
    if (url.origin !== bridge.address || url.pathname !== "/v1/probes/endpoint-test") return null;
    return nativeFetch(url.href, { ...init, headers: { ...init.headers, Origin: ORIGIN } });
  }, async (url, init) => {
    if (url.origin !== endpointOrigin) return null;
    return nativeFetch(url.href, init);
  }] });
  const page = await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}bridge`]: JSON.stringify({ address: bridge.address, token: bridge.token }) } });
  const dom = richDocument(), main = dom.byId("main"), original = main.querySelector.bind(main);
  let section = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]' ? { replaceChildren(...children) { section = children; } } : original(selector);
  await page.go("#settings");
  assert.equal(section.length, 2, "known positive: Settings mounts the public endpoint Configure control");
  await press(server, section[0]);
  assert.equal(globalThis.location.hash, "#endpoints", "failure node: Settings Configure selected the public endpoint route");
  await page.go("#endpoints");
  return { server, page, main };
}

// TST-266001
// Precondition: a dashboard browser has a paired real composed Bridge and a controlled own-model server.
// Input: Settings -> Configure, enter a local OpenAI-compatible model, select Bridge, and Save and test.
// Expected: the canonical browser record is saved before one Bridge probe; compose's real HTTP server dispatches through
// jobHandlers to the controlled model, which receives the short request exactly once; all credentials stay out of URLs and repository writes.
// Planted fault: replacing `jobHandlers()` with `{}` in src/desktop-shell/compose.mjs makes the visible working assertion fail
// with "Bridge could not test"; restoring source blob 04986a73ed6e23112d0db46668874d39e858eb2f restores this positive.
test("TST-266001: public Settings sends a local model test through the real composed Bridge", async (t) => {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-266-system-"));
  const received = [];
  let expectedStored;
  const endpoint = http.createServer(async (request, response) => {
    let body = ""; for await (const chunk of request) body += chunk;
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}endpoint:local`)), expectedStored, "failure node: canonical browser storage exists before the Bridge's model request");
    received.push({ path: request.url, authorization: request.headers.authorization, body: JSON.parse(body) });
    response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ choices: [{ message: { content: "ok" } }] }));
  });
  const port = await listen(endpoint);
  const bridge = await compose({ instance: "akmaier/agent-m", origin: ORIGIN, dataFolder: folder, port: 0 });
  t.after(async () => { await bridge.close(); await close(endpoint); await rm(folder, { recursive: true, force: true }); });
  const { server, main } = await dashboardFor(t, bridge, `http://127.0.0.1:${port}`);
  const endpointUrl = `http://127.0.0.1:${port}/v1`, key = "system-local-key";
  globalThis.document.cookie = "";
  main.querySelector(".endpoint-name").value = "local";
  main.querySelector(".endpoint-url").value = endpointUrl;
  main.querySelector(".endpoint-model").value = "controlled-model";
  main.querySelector(".endpoint-key").value = key;
  main.querySelector(".endpoint-through-bridge").checked = true;
  expectedStored = { url: endpointUrl, kind: "openai-compatible", model: "controlled-model", key, throughBridge: true };
  await press(server, main.querySelector(".endpoint-test"));
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}endpoint:local`)), expectedStored, "the saved record persists after the completed request");
  assert.match(main.querySelector(".endpoint-result").textContent, /controlled-model is working/, "failure node: public dashboard renders the composed Bridge answer");
  assert.deepEqual(received, [{ path: "/v1/chat/completions", authorization: `Bearer ${key}`, body: { model: "controlled-model", messages: [{ role: "user", content: "Reply with one word: ok." }], max_tokens: 1 } }], "failure node: real jobHandlers made exactly one short controlled-model request");
  assert.equal(server.requests.some((request) => request.includes(key)), false, "the dashboard request ledger contains no endpoint credential");
  assert.equal(bridge.address.includes(key), false, "the Bridge address contains no credential");
  assert.equal(globalThis.document.cookie, "", "endpoint configuration did not create a cookie");
  assert.equal(server.writes.length, 0, "the system flow made no repository write");
});
