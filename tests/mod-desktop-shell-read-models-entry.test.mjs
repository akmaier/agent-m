// The app's entry answers the window's Read models — MOD-desktop-shell as docs/architecture/MOD-desktop-shell.md states it: "*Read models* … for an agent the Bridge
// offers, MOD-agent-processes' `agentModels` in the agent's enclosure, in its working folder … Where it reads nothing — the agent not offered with a working folder, its
// enclosure not working, or the `reason` `agentModels` gives —, the panel says that nothing could be read and why" (UC-044 step 5, 5a). The window's side is
// tests/mod-desktop-shell-read-models.test.mjs.
// Run: node --test tests/mod-desktop-shell-read-models-entry.test.mjs
//
// Module: MOD-desktop-shell
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// This file starts the app's real entry, src/desktop-shell/main.mjs, over a constructed Electron (tests/desktop-shell.d/entry.mjs), whose enclosure double starts the
// fixture agents as they are, and sends it the ipc request the window makes, `agent-models`. The PATH of the test holds a fixture codex, which answers `debug models`
// and writes every call to a file, and a git that fails at once, so that the Bridge's checkout reaches nothing. Each test states its input and its expected result
// before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const CODEX_MODELS = JSON.stringify({ models: [{ slug: "gpt-6", context_window: 400000, visibility: "list" }, { slug: "gpt-6-internal", context_window: 1, visibility: "hide" }] });

// TST-20261116151 · level: unit · module: MOD-desktop-shell
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: the app started over a Bridge whose settings offer codex with its working folder; codex installed and logged in, its `debug models` listing gpt-6 (400000) and the hidden gpt-6-internal
// input: the window's request agent-models with { name: "codex" }; then with { name: "claude" }, which the Bridge does not offer
// expect: for codex { models: [{ model: "gpt-6", context: 400000 }] }, after `codex debug models` was started in codex's working folder; for claude { reason } naming that the Bridge does not offer it
//         with a working folder, and no models; counter-proof: the first answer reads models, so the second's reason is not a reading that fails for every agent
test("TST-20261116151: agent-models answers agentModels for an offered agent, in its working folder, and names why for one not offered", async () => {
  const root = realpathSync(temporary());
  const bin = join(root, "bin"), calls = join(root, "calls"), folder = join(root, "work", "codex");
  mkdirSync(bin); mkdirSync(folder, { recursive: true }); writeFileSync(calls, "");
  writeFileSync(join(bin, "codex"), `#!/bin/sh\nprintf '%s %s\\n' "$(pwd)" "$*" >> '${calls}'\ncase "$*" in\n  --version) echo 'codex 1.2.3';;\n  'login status') echo 'Logged in';;\n  'debug models') printf '%s\\n' '${CODEX_MODELS}';;\n  *) exit 64;;\nesac\n`, { mode: 0o755 });
  writeFileSync(join(bin, "git"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, { ...bridgeSettings(port), folder: join(root, "work"), agents: [{ name: "codex", folder, place: "this machine", capabilities: [], models: [] }] });
  const prior = process.env.PATH;
  process.env.PATH = bin;
  let entry;
  try {
    entry = await startEntry({ resources, appData, argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
    assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
    const ask = (value) => entry.fake.handlers["bridge-state"]({}, "agent-models", value);
    assert.deepEqual(await ask({ name: "codex" }), { models: [{ model: "gpt-6", context: 400000 }] });
    assert.ok(readFileSync(calls, "utf8").split("\n").includes(`${folder} debug models`), "codex was asked for its models in its working folder");
    const unoffered = await ask({ name: "claude" });
    assert.equal(unoffered.models, undefined);
    assert.match(unoffered.reason, /working folder/);
  } finally {
    process.env.PATH = prior;
    if (entry) await stopEntry(entry);
    for (const each of [root, appData, data, resources]) rmSync(each, { recursive: true, force: true });
  }
});
