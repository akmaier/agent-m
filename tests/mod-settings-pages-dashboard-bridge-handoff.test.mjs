// The public dashboard handoff from an endpoint that needs the Bridge (ITM-269).
// Run: node --test tests/mod-settings-pages-dashboard-bridge-handoff.test.mjs
//
// Module: MOD-settings-pages
// Level: component
// Guards: UC-003; UC-044; CONFIGURATION LIVES IN THE BROWSER; AN UNSUPPORTED ENDPOINT SAYS SO
//
// Counter-proof: omitting the endpoint Route's `bridge` mapping from its context.go makes this handoff leave
// #endpoints instead of selecting #bridge; the mapping is restored byte-for-byte after that failure.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const ENDPOINT_KEY = `agent-m:${INSTANCE}:endpoint:local`;
const LOCAL = {
  url: "http://127.0.0.1:11434/v1",
  kind: "openai-compatible",
  model: "local-model",
  key: "local-model-key",
  bridge: "local",
};

// TST-269006 · level: component · module: MOD-settings-pages
// guards: UC-003; UC-044; CONFIGURATION LIVES IN THE BROWSER; AN UNSUPPORTED ENDPOINT SAYS SO
// given: the dashboard browser has an endpoint that names a Bridge this browser does not keep.
// input: the author opens the actual public endpoint address, tests it, then presses its Set up the Bridge action.
// expect: Save retains the canonical endpoint record; the missing Bridge does not directly call the local model and exposes the setup action; its click selects #bridge, where the actual dashboard dispatcher renders the public Bridge setup Route.
test("TST-269006: the public endpoint Route hands absent Bridge setup to the public Bridge Route", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#endpoints/local", entries: { [ENDPOINT_KEY]: JSON.stringify(LOCAL) } });
  const dom = richDocument();
  const main = dom.byId("main");

  const name = main.querySelector("input.endpoint-name");
  const url = main.querySelector("input.endpoint-url");
  const model = main.querySelector("input.endpoint-model");
  const key = main.querySelector("input.endpoint-key");
  const bridge = main.querySelector("select.endpoint-bridge");
  const saveAndTest = main.querySelector("button.endpoint-test");
  assert.ok(name && url && model && key && bridge && saveAndTest, "the actual dashboard address renders the public endpoint controls");
  assert.equal(bridge.value, "local", "the missing stored Bridge name is still selected for setup");
  await saveAndTest.fire("click");

  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(ENDPOINT_KEY)), LOCAL, "Save retains the local endpoint before the missing-Bridge result");
  assert.equal(server.requests.some((request) => request.includes(LOCAL.url)), false, "failure node: an absent Bridge never falls back to a direct local-model request");
  const setup = main.querySelector("button.endpoint-bridge-setup");
  assert.ok(setup, "the saved endpoint exposes the public Bridge setup control");

  await setup.fire("click");
  assert.equal(globalThis.location.hash, "#bridge", "failure node: the endpoint Route delegates setup through the dashboard Bridge dispatcher");
  await page.go("#bridge");
  assert.match(page.main(), /Connect a Bridge/, "the selected public route renders Bridge setup");
});
