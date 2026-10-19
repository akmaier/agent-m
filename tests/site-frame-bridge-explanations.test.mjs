// The folded explanations of getting the Bridge and of its window (ITM-1052) — MOD-site-frame's explanations.md holds, besides `bridge-pairing`, `bridge-own-login` and `bridge-https-route`, the topics of UC-044's page and window: the two levels
// (`bridge-levels`), the warning of a newly signed release (`bridge-signed-warning`, the "Why this warning?"), installing a missing agent (`bridge-install-agent`), the jump host and the public key (`bridge-jump-host-key`), the tunnels
// (`bridge-tunnels`), importing a settings export in the window (`bridge-import-export`) and updates (`bridge-updates`). Each is rendered by explain; what a test pins of a topic is what UC-044 says of its step, in the test's own words.
// Run: node --test tests/site-frame-bridge-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-044
// Level: unit
//
// The document comes from the helper file tests/settings-pages-setup.d/dom.mjs, set up before the dynamic import below. The only data file read is the one under test, explanations.md, and the sources of the page `bridge` and the route
// `bridge`, for the frame's own check (tests/site-frame-topics.mjs). Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are run as mutations and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-setup.d/dom.mjs";
import { topicFindings } from "./site-frame-topics.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");

const ROOT = new URL("..", import.meta.url).pathname;
const EXPLANATIONS = readFileSync(`${ROOT}src/site-frame/explanations.md`, "utf8");
const bodyText = (topic, label) => (explain(topic, label).children[1]?.textContent ?? "").replace(/\s+/g, " ");
const held = (topic) => EXPLANATIONS.split(/^## /m).slice(1).filter((part) => part.startsWith(`${topic}\n`)).length;

// What each topic must say, from UC-044, in this file's words.
const TOPICS = {
  "bridge-levels": ["Level 1", "Level 2", "nothing installed", "own login", "IMAP"],
  "bridge-signed-warning": ["SmartScreen", "newly signed", "publisher", "More info", "Run anyway"],
  "bridge-install-agent": ["How to install", "Check again", "Claude Code", "own login"],
  "bridge-jump-host-key": ["public key", "authorized_keys", "private key", "never leaves"],
  "bridge-tunnels": ["reverse tunnel", "loopback", "reconnect", "tunnel open"],
  "bridge-import-export": ["settings export", "jump host", "its name", "port"],
  "bridge-updates": ["newer release", "release notes", "Update", "signature", "only after your click"],
};

// TST-1052001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-044
// given: explanations.md; known positive — the topic bridge-pairing, which the file holds
// input: explain for each of the seven topics, the signed-release warning under the label "Why this warning?"
// expect: the file holds each heading once; each explanation is a folded <details class="explain"> with a summary ("What is this?", for the warning "Why this warning?") and a body that says, in words of its own, each thing UC-044 gives its step
test("TST-1052001 each topic of getting the Bridge and of its window is held once and says what UC-044 says of its step", () => {
  assert.equal(held("bridge-pairing"), 1, "known positive: the file holds bridge-pairing");
  for (const [topic, phrases] of Object.entries(TOPICS)) {
    assert.equal(held(topic), 1, `the file holds ${topic} exactly once`);
    const label = topic === "bridge-signed-warning" ? "Why this warning?" : undefined;
    const folded = explain(topic, label);
    assert.equal(folded.localName, "details");
    assert.equal(folded.className, "explain");
    assert.equal(folded.hasAttribute("open"), false, "it is folded");
    assert.equal(folded.children[0].textContent, label ?? "What is this?");
    const text = bodyText(topic, label);
    for (const phrase of phrases) assert.equal(text.includes(phrase), true, `${topic} says "${phrase}": ${text}`);
    assert.doesNotMatch(text, /[*`]/, `${topic} shows no stray Markdown`);
  }
});

// TST-1052002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-044
// given: the sources of the Bridge's window (src/desktop-shell/window.mjs) and of the route bridge (src/settings-pages/bridge.mjs), and explanations.md
// input: the frame's own check, topicFindings, over those sources
// expect: no topic they name is missing (known positive: they name bridge-pairing, which the file holds)
test("TST-1052002 the frame's own check finds no topic missing for the page bridge and the route bridge", () => {
  const files = ["src/desktop-shell/window.mjs", "src/settings-pages/bridge.mjs"].map((path) => ({ path, text: readFileSync(`${ROOT}${path}`, "utf8") }));
  assert.equal(files.every(({ text }) => text.includes('explain("bridge-pairing")')), true, "known positive: both name bridge-pairing");
  assert.deepEqual(topicFindings(files, EXPLANATIONS), []);
});

// TST-1052003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-044
// given: a source that names the seven topics, and explanations.md as it is, and with the section bridge-tunnels left out
// input: topicFindings of the source against each
// expect: none for the file as it is; exactly one finding, the topic bridge-tunnels, for the file without it (the counter-proof: a topic left out is found)
test("TST-1052003 a topic of the Bridge's window left out of the file is found by the frame's check", () => {
  const source = { path: "window.mjs", text: Object.keys(TOPICS).map((topic) => `explain("${topic}");`).join("\n") };
  assert.deepEqual(topicFindings([source], EXPLANATIONS), []);
  const without = EXPLANATIONS.replace(/^## bridge-tunnels\n[\s\S]*?(?=^## )/m, "");
  assert.notEqual(without, EXPLANATIONS, "the section was there to leave out");
  assert.deepEqual(topicFindings([source], without), [{ path: "window.mjs", topic: "bridge-tunnels" }]);
});
