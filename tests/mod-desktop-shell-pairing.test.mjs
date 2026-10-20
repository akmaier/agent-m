// The Bridge's Pairing view says which origin the Bridge is paired with (ITM-1004), as the accepted text of
// docs/architecture/MOD-desktop-shell.md states it: "*Pairing* — ... *paired with* the origin MOD-bridge-http's `pairedWith()` gives,
// or *not yet paired since this start*; and *Pair anew*, a decision that names that every paired browser must pair again", and UC-044
// step 4 ("the bridge's window shows *paired with `<owner>.github.io`*"). This file starts the app's real entry over a constructed
// Electron and asks it, over the ipc request the window makes, for the state the Pairing view draws; the view's text is TST-1004003's, in
// tests/mod-desktop-shell-window.test.mjs.
// Run: node --test tests/mod-desktop-shell-pairing.test.mjs
//
// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE IS PAIRED ONCE; THE LOCAL BRIDGE REQUIRES A TOKEN
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The Bridge's server is the real one on
// loopback (tests/desktop-shell.d/entry.mjs); nothing reaches the network. The counter-proofs are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { bridgeAsks, bridgeSettings, startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

const ORIGIN = "https://carol.github.io";

// Starts the entry from the source folder for ORIGIN, over a data folder whose settings name a free port.
async function started() {
  const appData = temporary(), data = temporary(), resources = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const entry = await startEntry({ resources, appData, argv: ["--instance=carol/product-x", `--origin=${ORIGIN}`, `--port=${port}`, `--data-folder=${data}`] });
  assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
  const token = () => readFileSync(join(data, "pairing-token"), "utf8").trim();
  const state = () => entry.fake.handlers["bridge-state"]({}, undefined);
  const done = async () => { await stopEntry(entry); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); };
  return { entry, port, token, state, done, pairAnew: () => entry.fake.handlers["pair-anew"]({}) };
}

// TST-1004001 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS PAIRED ONCE
// given: the app started for the origin https://carol.github.io, over a served Bridge no request has reached
// input: the window's state request; then a request to the Bridge with its token from that origin; the state request again; Pair anew; the state request; a request with the new token from that origin; the state request
// expect: the state's pairedWith is null at first; the origin after the request; null again after Pair anew; the origin again after the next request with the new token
// Planted fault: leaving pairedWith out of the state, or reading it once at start, makes the second answer null or the third still the origin.
test("TST-1004001: MOD-desktop-shell's state names the origin the Bridge is paired with, until Pair anew", async () => {
  const app = await started();
  try {
    assert.equal((await app.state()).pairedWith, null, "not yet paired since this start");
    assert.equal((await bridgeAsks(app.port, ORIGIN, app.token())).status, 200);
    assert.equal((await app.state()).pairedWith, ORIGIN, "failure node: pairedWith after a request with the token from the origin");
    const before = app.token();
    await app.pairAnew();
    assert.notEqual(app.token(), before, "the token was replaced");
    assert.equal((await app.state()).pairedWith, null, "not yet paired since Pair anew");
    assert.equal((await bridgeAsks(app.port, ORIGIN, app.token())).status, 200);
    assert.equal((await app.state()).pairedWith, ORIGIN);
  } finally { await app.done(); }
});

// TST-1004002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: the app started for the origin https://carol.github.io, over a served Bridge no request has reached
// input: a request with the token from another origin (answered 403); a request from the origin without the token (answered 401); a request from the origin with a wrong token (answered 401); the state request after each
// expect: the answers are 403, 401 and 401, and pairedWith stays null after each
// Planted fault: marking the pairing before the origin or the token is checked sets pairedWith after the first of them.
test("TST-1004002: MOD-desktop-shell's state stays unpaired after a request from another origin or without the token", async () => {
  const app = await started();
  try {
    const token = app.token();
    assert.equal((await bridgeAsks(app.port, "https://mallory.github.io", token)).status, 403);
    assert.equal((await app.state()).pairedWith, null, "another origin");
    assert.equal((await bridgeAsks(app.port, ORIGIN, null)).status, 401);
    assert.equal((await app.state()).pairedWith, null, "no token");
    assert.equal((await bridgeAsks(app.port, ORIGIN, `${token}x`)).status, 401);
    assert.equal((await app.state()).pairedWith, null, "a wrong token");
  } finally { await app.done(); }
});
