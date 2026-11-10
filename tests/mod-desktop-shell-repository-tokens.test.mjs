// MOD-desktop-shell — the one folder of the Bridge's agents and the route of the repository tokens, as docs/architecture/MOD-desktop-shell.md states them (Data:
// "`folder` — the one folder the person chooses in the window, which holds the working folder of each agent the Bridge offers, `<folder>/<agent>` ... `null`
// until it is chosen, and then no agent has a working folder. An agent's working folder is no setting of its own: it follows from `folder` and the agent's
// name"; Start: its own handler "for `PUT /v1/repository-tokens`, which keeps the tokens the paired browser hands it through MOD-bridge-jobs'
// `keepRepositoryTokens` and then checks out again"), with MOD-bridge-client's handTokens and MOD-bridge-http's route, as their files state them.
// Run: node --test tests/mod-desktop-shell-repository-tokens.test.mjs
//
// Module: MOD-desktop-shell; MOD-bridge-client; MOD-bridge-http
// Guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE LOCAL BRIDGE REQUIRES A TOKEN; UC-044
// Level: unit
//
// Deterministic: the Bridge's data folder is a temporary folder, its server runs on loopback at a free port, and the page's requests carry the instance's
// origin. Where the module file leaves a reading open, the test states the one it takes:
//   - A settings file that still names an agent's own folder keeps none of it: the agent's working folder is the one folder's.
//   - "then checks out again" is the shell's callback `checkOutAgain`, called once after the tokens are kept and not called for a refused list.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { serveBridge } from "../src/bridge-http/index.mjs";
import { bridgeAt, handTokens } from "../src/bridge-client/index.mjs";
import { composeSettingsHandlers, loadSettings, saveSettings } from "../src/desktop-shell/settings.mjs";

const ORIGIN = "https://akmaier.github.io";
const DECLARED = { place: "this machine", capabilities: ["draft text"], models: [{ model: "claude-opus-5-5", context: 200000 }] };
const folder = () => mkdtemp(join(tmpdir(), "agent-m-shell-tokens-"));

// TST-20261110501 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044
// given: an empty data folder of a Bridge
// input: saveSettings with folder /work/agents and the agents claude and codex with their declarations; loadSettings; then saveSettings with no folder; then a
//   settings file written with an agent's own folder /old/claude and no folder
// expect: the file holds folder /work/agents and the agents without any folder of their own; loaded, claude's working folder is /work/agents/claude and codex's
//   /work/agents/codex; without the folder each agent's working folder is null; counter-proof: the agent's own /old/claude is not its working folder
test("TST-20261110501: the Bridge's settings keep one folder, and each agent's working folder is <folder>/<agent>", async () => {
  const data = await folder();
  saveSettings(data, { ...loadSettings(data), folder: "/work/agents", agents: [{ name: "claude", ...DECLARED }, { name: "codex", ...DECLARED }] });
  const file = JSON.parse(await readFile(join(data, "settings.json"), "utf8"));
  assert.equal(file.folder, "/work/agents");
  assert.deepEqual(file.agents, [{ name: "claude", ...DECLARED }, { name: "codex", ...DECLARED }], "no agent keeps a folder of its own in the file");
  assert.deepEqual(loadSettings(data).agents.map(({ name, folder: working }) => [name, working]), [["claude", "/work/agents/claude"], ["codex", "/work/agents/codex"]]);

  saveSettings(data, { ...loadSettings(data), folder: null });
  assert.deepEqual(loadSettings(data).agents.map(({ folder: working }) => working), [null, null], "without the folder no agent has a working folder");

  await writeFile(join(data, "settings.json"), JSON.stringify({ ...file, folder: null, agents: [{ name: "claude", folder: "/old/claude", ...DECLARED }] }));
  assert.equal(loadSettings(data).agents[0].folder, null, "counter-proof: an agent's own folder is no setting");
});

// TST-20261110502 · level: unit · module: MOD-desktop-shell; MOD-bridge-client; MOD-bridge-http
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE LOCAL BRIDGE REQUIRES A TOKEN; UC-044
// given: a Bridge served on loopback with the shell's settings handlers, whose checkOutAgain is counted
// input: MOD-bridge-client's handTokens with the instance's token; then a list with a GitLab token for a GitHub repository; then PUT /v1/repository-tokens with a
//   wrong pairing token; then handTokens with an empty list
// expect: { kept: 1 }, the file repository-tokens.gitconfig in the data folder naming the instance, and checkOutAgain called once; the refused list rejected with
//   BridgeFailed invalid-request naming the repository and not the token, the file unchanged and no checkout; the wrong pairing token answered 401 and nothing
//   kept; the empty list { kept: 0 }, the file holding no section, and checkOutAgain called a second time
test("TST-20261110502: PUT /v1/repository-tokens keeps the tokens a paired browser hands the Bridge, and the Bridge checks out again", async (t) => {
  const data = await folder();
  const settings = saveSettings(data, { ...loadSettings(data), folder: "/work/agents", agents: [{ name: "claude", ...DECLARED }] });
  let checkouts = 0;
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: data, paused: () => false, name: () => "lab", version: null },
    { jobs: {}, mail: {}, tunnels: {}, settings: composeSettingsHandlers(settings, data, { checkOutAgain: () => { checkouts += 1; } }) });
  t.after(() => bridge.close());
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, init) => realFetch(url, { ...init, headers: { ...init.headers, Origin: ORIGIN } });
  t.after(() => { globalThis.fetch = realFetch; });
  const at = bridgeAt({ address: bridge.address, token: bridge.token });
  const file = join(data, "repository-tokens.gitconfig");

  assert.deepEqual(await handTokens(at, [{ repository: "https://github.com/akmaier/agent-m", token: "github_pat_I" }]), { kept: 1 });
  assert.match(await readFile(file, "utf8"), /\[http "https:\/\/github\.com\/akmaier\/agent-m"\]/);
  assert.equal(checkouts, 1, "the Bridge checks out again with the tokens");
  const kept = await readFile(file, "utf8");

  await assert.rejects(handTokens(at, [{ repository: "https://github.com/akmaier/agent-m", token: "glpat-wrong" }]),
    (error) => error.name === "BridgeFailed" && error.error === "invalid-request" && /akmaier\/agent-m/.test(error.message) && !error.message.includes("glpat-wrong"));
  assert.equal(await readFile(file, "utf8"), kept, "nothing is written for a refused list");
  assert.equal(checkouts, 1, "no checkout for a refused list");

  const refused = await realFetch(`${bridge.address}/v1/repository-tokens`, { method: "PUT", headers: { Origin: ORIGIN, "X-Agent-M-Bridge-Token": "wrong", "content-type": "application/json" },
    body: JSON.stringify({ tokens: [] }) });
  assert.equal(refused.status, 401);
  assert.equal(await readFile(file, "utf8"), kept, "the wrong pairing token changes nothing");

  assert.deepEqual(await handTokens(at, []), { kept: 0 });
  assert.doesNotMatch(await readFile(file, "utf8"), /\[http /, "an empty list forgets every token");
  assert.equal(checkouts, 2);
  assert.equal(existsSync(join(data, "repository-tokens.gitconfig.new")), false, "no half-written file is left");
});
