// A Bridge keeps its agents' declarations — MOD-desktop-shell (the declarations in the settings, its handler of PUT /v1/agents/{agent}),
// MOD-bridge-http (the route), MOD-bridge-client (declareAgent) and MOD-prompt-bar (sessionsOffered reads them from the Bridge's agent list),
// as UC-044 step 5 and UC-049 Precondition state them.
// Run: node --test tests/bridge-agent-declarations.test.mjs
//
// Module: MOD-desktop-shell; MOD-bridge-http; MOD-bridge-client
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; A CONNECTION DECLARES ITS CAPABILITIES; THE LOCAL BRIDGE REQUIRES A TOKEN; UC-044
// Level: unit

import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { serveBridge } from "../src/bridge-http/index.mjs";
import { bridgeAt, declareAgent as declareThrough } from "../src/bridge-client/index.mjs";
import { CAPABILITIES, composeSettingsHandlers, declareAgent, loadSettings, saveSettings } from "../src/desktop-shell/settings.mjs";

const ORIGIN = "https://akmaier.github.io";
const DECLARATION = { place: "Anthropic, USA", capabilities: ["draft text", "use tools"], models: [{ model: "claude-opus-5-5", context: 200000 }] };
const folder = () => mkdtemp(join(tmpdir(), "agent-m-declarations-"));

// TST-20261109304 · level: unit · module: MOD-desktop-shell
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; A CONNECTION DECLARES ITS CAPABILITIES; UC-044
// given: Bridge settings that offer claude, working in /work/claude of the one folder /work, and no declaration yet
// input: loadSettings; then declareAgent(folder, "claude", a declaration); declareAgent for codex, which is not offered; a declaration whose model names no context
// expect: the agent read back with the place "this machine" and every capability preset and no model; then with the declaration kept in the settings file; NotOffered for codex and InvalidSettings for the model without its context, the file unchanged
test("declareAgent — the Bridge's settings keep an offered agent's declaration, preset with this machine and every capability", async () => {
  const data = await folder();
  saveSettings(data, { ...loadSettings(data), folder: "/work", agents: [{ name: "claude" }] });
  assert.deepEqual(loadSettings(data).agents, [{ name: "claude", folder: "/work/claude", place: "this machine", capabilities: CAPABILITIES, models: [] }]);
  declareAgent(data, "claude", DECLARATION);
  assert.deepEqual(JSON.parse(await readFile(join(data, "settings.json"), "utf8")).agents, [{ name: "claude", ...DECLARATION }], "the file keeps no folder of the agent's own");
  const before = await readFile(join(data, "settings.json"), "utf8");
  assert.throws(() => declareAgent(data, "codex", DECLARATION), { name: "NotOffered" });
  assert.throws(() => declareAgent(data, "claude", { ...DECLARATION, models: [{ model: "claude-opus-5-5" }] }), { name: "InvalidSettings" });
  assert.equal(await readFile(join(data, "settings.json"), "utf8"), before);
});

// TST-20261109305 · level: unit · module: MOD-bridge-http; MOD-bridge-client; MOD-desktop-shell
// guards: THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-044
// given: a Bridge served on loopback with the shell's settings handler, its settings offering claude
// input: MOD-bridge-client's declareAgent(bridge, "claude", declaration); then declareAgent for codex; then PUT /v1/agents/claude with a wrong token
// expect: it resolves; the settings file and the agents the Bridge holds keep the declaration; codex is refused with the failure not-found; the wrong token is refused with 401 and nothing changes
test("PUT /v1/agents/{agent} — declareAgent keeps the declaration in the Bridge's settings and in the agents it holds", async (t) => {
  const data = await folder();
  const settings = saveSettings(data, { ...loadSettings(data), folder: "/work", agents: [{ name: "claude" }] });
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: data, paused: () => false },
    { jobs: {}, mail: {}, tunnels: {}, settings: composeSettingsHandlers(settings, data) });
  t.after(() => bridge.close());
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, init) => realFetch(url, { ...init, headers: { ...init.headers, Origin: ORIGIN } });
  t.after(() => { globalThis.fetch = realFetch; });
  const at = bridgeAt({ address: bridge.address, token: bridge.token });
  await declareThrough(at, "claude", DECLARATION);
  assert.deepEqual(loadSettings(data).agents, [{ name: "claude", folder: "/work/claude", ...DECLARATION }]);
  assert.deepEqual(settings.agents, [{ name: "claude", folder: "/work/claude", ...DECLARATION }]);
  await assert.rejects(declareThrough(at, "codex", DECLARATION), (error) => /not-found/.test(`${error.name} ${error.code} ${error.message} ${JSON.stringify(error)}`));
  const refused = await realFetch(`${bridge.address}/v1/agents/claude`, { method: "PUT", headers: { Origin: ORIGIN, "X-Agent-M-Bridge-Token": "wrong", "content-type": "application/json" },
    body: JSON.stringify({ ...DECLARATION, place: "elsewhere" }) });
  assert.equal(refused.status, 401);
  assert.equal(loadSettings(data).agents[0].place, "Anthropic, USA");
});
