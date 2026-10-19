// The Bridge's app entry takes the jump host the window sends (ITM-1053), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:64-65: "It keeps the Bridge's settings, set in the window or taken
// from the dashboard's export") and UC-044 6a.1 (docs/use-cases/UC-044*.md:123-124): "In the bridge's window the person enters the jump host — hostname, SSH user". This file starts the app's real entry, src/desktop-shell/main.mjs,
// over a constructed Electron (tests/desktop-shell.d/entry.mjs) and sends it, over the ipc request the window makes, the action `save-jump-host`; the window's side of it is tests/mod-desktop-shell-jump-host.test.mjs.
// Run: node --test tests/mod-desktop-shell-jump-host-entry.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The Bridge's server is the real one on loopback (tests/desktop-shell.d/entry.mjs); the tunnels are its double; nothing reaches the
// network. Readings taken, named in the pull request: "the Bridge restarted" is read off the Bridge's own answers: the origin it was paired with is forgotten (a restarted server has seen no request since its start) and the
// request the new server answers carries the same address; a refused entry restarts nothing. The branch of main.mjs was built with the item and is green on the first run of this file: its counter-proofs are the planted faults of the
// pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeAsks, bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const ORIGIN = "https://carol.github.io";

async function started() {
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const entry = await startEntry({ resources, appData, argv: ["--instance=carol/product-x", `--origin=${ORIGIN}`, `--port=${port}`, `--data-folder=${data}`] });
  assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
  const token = () => readFileSync(join(data, "pairing-token"), "utf8").trim();
  const ask = (action, value) => entry.fake.handlers["bridge-state"]({}, action, value);
  const settingsFile = () => JSON.parse(readFileSync(join(data, "settings.json"), "utf8"));
  const done = async () => { await stopEntry(entry); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); };
  return { port, token, ask, settingsFile, done, data };
}

// TST-1053104 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044 (6a.1)
// given: the app started over a Bridge whose settings hold no jump host, and a request from https://carol.github.io that has paired it
// input: the window's request save-jump-host with hostname "  jump.example.test ", user "agentm" and SSH port "2222"; then the state and the Bridge's own answer
// expect: before: settings.json's jumpHost is null and the state says paired with the origin; after: settings.json's jumpHost is { hostname: "jump.example.test", user: "agentm", sshPort: 2222 }, the answer to the request is the state of the restarted Bridge — its settings hold the jump host and it is not paired with any origin since its start —, and the Bridge answers on the same port with the same token
test("save-jump-host keeps the jump host in settings.json and restarts the Bridge", async () => {
  const app = await started();
  try {
    assert.equal(app.settingsFile().jumpHost, null, "known positive: no jump host at first");
    const token = app.token();
    assert.equal((await bridgeAsks(app.port, ORIGIN, token)).status, 200);
    assert.equal((await app.ask()).pairedWith, ORIGIN, "known positive: the Bridge is paired before");
    const answer = await app.ask("save-jump-host", { hostname: "  jump.example.test ", user: "agentm", sshPort: "2222" });
    assert.deepEqual(app.settingsFile().jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
    assert.deepEqual(answer.settings.jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
    assert.equal(answer.pairedWith, null, "the Bridge was restarted: it has seen no request since its start");
    assert.equal(app.token(), token, "the pairing token is kept");
    assert.equal((await bridgeAsks(app.port, ORIGIN, token)).status, 200, "the restarted Bridge answers on the same port with the same token");
    assert.deepEqual((await app.ask("settings")).settings.jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
  } finally { await app.done(); }
});

// TST-1053105 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: the app started over a Bridge whose settings hold no jump host and that a request from https://carol.github.io has paired
// input: the request save-jump-host with an empty hostname; with an empty user; with SSH port "70000"; the state after each
// expect: each request is refused with an error named InvalidSettings; settings.json still holds a null jump host; the Bridge was not restarted — it is still paired with the origin
test("save-jump-host refuses an empty hostname, an empty user and a port outside 1 to 65535, and restarts nothing", async () => {
  const app = await started();
  try {
    assert.equal((await bridgeAsks(app.port, ORIGIN, app.token())).status, 200);
    for (const value of [{ hostname: "", user: "agentm", sshPort: "22" }, { hostname: "jump.example.test", user: "", sshPort: "22" }, { hostname: "jump.example.test", user: "agentm", sshPort: "70000" }]) {
      await assert.rejects(app.ask("save-jump-host", value), (error) => error.name === "InvalidSettings", JSON.stringify(value));
      assert.equal(app.settingsFile().jumpHost, null);
      assert.equal((await app.ask()).pairedWith, ORIGIN, "not restarted");
    }
    assert.equal(existsSync(join(app.data, "settings.json")), true);
  } finally { await app.done(); }
});
