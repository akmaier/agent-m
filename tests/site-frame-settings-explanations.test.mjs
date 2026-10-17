// The explanations of the Settings page (ITM-643) — MOD-site-frame's explain(<topic>) for the sixteen folded What is this? that
// MOD-settings-pages puts on its lines and sections: what this browser keeps for a Bridge, a jump host, a remote session, a token,
// the product addresses, the notifications, the export and the clear; and what a product's repository keeps (its job workflow, its
// pseudonymisation and collaborator records). Each topic says where the setting is kept and who can read it, in the words the page
// showed before the topics came to the frame.
// Run: node --test tests/site-frame-settings-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-042; UC-047
// Level: unit
//
// This takes the browser harness (the fixture document explain()'s renderer needs) from tests/settings-pages-harness.mjs, the helper
// file of the tests of MOD-settings-pages and MOD-site-frame, and imports no test file. Each test states its input and its expected
// result before it runs (given / input / expect), and every expected sentence is written in this file's own text: no expected result
// is read from the SPEC, a use case or an architecture file when it runs. The only file read is explanations.md, the data under test,
// and only to find out whether it holds a topic. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-harness.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// Each topic, with the claims its rendered text must make: a pattern and what it says.
const TOPICS = {
  "settings-bridge-stored": [
    [/This browser keeps the Bridge address and pairing token so it can reach the Bridge/, "this browser keeps the Bridge address and pairing token so it can reach the Bridge"],
    [/Anyone able to read this browser's Pages storage can read them/, "anyone able to read this browser's Pages storage can read them"],
  ],
  "settings-bridge-named": [
    [/This browser keeps the Bridge's address, or its port on the jump host, and its pairing token under the name the Bridge reports/, "this browser keeps the Bridge's address or its port on the jump host, and its pairing token, under the name the Bridge reports"],
    [/Anyone able to read this browser's Pages storage can read them/, "anyone able to read this browser's Pages storage can read them"],
  ],
  "settings-jump-host": [
    [/This browser keeps the jump-host connection details so the Bridge can prepare remote sessions/, "this browser keeps the jump-host connection details so the Bridge can prepare remote sessions"],
    [/Anyone able to read this browser's Pages storage can read them/, "anyone able to read this browser's Pages storage can read them"],
  ],
  "settings-export-import": [
    [/Export copies this browser's settings, including secrets, into a file for this person to keep or move/, "export copies this browser's settings, including secrets, into a file"],
    [/Import reads that file into this browser/, "import reads that file into this browser"],
    [/whoever holds an unlocked export can read its settings/, "whoever holds an unlocked export can read its settings"],
  ],
  "settings-clear-everything": [
    [/This removes every Agent M setting held in this browser/, "it removes every Agent M setting held in this browser"],
    [/It changes no repository/, "it changes no repository"],
    [/any Pages site under the same owner domain that can read this storage loses access too/, "a Pages site under the same owner domain that can read this storage loses access too"],
  ],
  "settings-products-stored": [
    [/This browser keeps the list of managed product addresses so it can open their repository settings/, "this browser keeps the list of managed product addresses so it can open their repository settings"],
    [/Any Pages site under the same owner domain can read that browser storage/, "any Pages site under the same owner domain can read that browser storage"],
  ],
  "settings-token-stored": [
    [/This browser keeps this token so Agent M can read and write this repository/, "this browser keeps this token so Agent M can read and write this repository"],
    [/Any Pages site under the same owner domain can read it/, "any Pages site under the same owner domain can read it"],
    [/give it only the minimum repository scope needed/, "give it only the minimum repository scope needed"],
  ],
  "settings-product-address": [
    [/This browser keeps this product address and its optional token so it can test and open the repository/, "this browser keeps this product address and its optional token so it can test and open the repository"],
    [/Any Pages site under the same owner domain can read that browser storage/, "any Pages site under the same owner domain can read that browser storage"],
  ],
  "settings-managed-products": [
    [/This browser keeps the managed product list so it can show each repository's settings/, "this browser keeps the managed product list so it can show each repository's settings"],
    [/Any Pages site under the same owner domain can read that browser storage/, "any Pages site under the same owner domain can read that browser storage"],
  ],
  "settings-notifications": [
    [/Notifications let this browser alert you when something needs your attention/, "notifications let this browser alert you when something needs your attention"],
    [/This browser stores whether notifications are switched on; the browser and any Pages site under the same owner domain able to read this storage can read that switch/, "this browser stores whether notifications are on, and the browser and a Pages site under the same owner domain able to read this storage can read that switch"],
    [/checks every five minutes for open SPEC changes, use cases, architecture files, and release test reports waiting for Accept and release/, "while a dashboard page is open it checks every five minutes for open SPEC changes, use cases, architecture files and release test reports waiting for Accept and release"],
    [/Checks go only to repository servers with the tokens of this browser and nowhere else/, "the checks go only to repository servers with the tokens of this browser and nowhere else"],
    [/Nothing is checked while no dashboard page is open/, "nothing is checked while no dashboard page is open"],
  ],
  "settings-remote-session": [
    [/This browser keeps the forwarded port and copied Bridge token for this remote session/, "this browser keeps the forwarded port and copied Bridge token for this remote session"],
    [/Any Pages site under the same owner domain can read them; the Bridge reads its own tunnel settings/, "any Pages site under the same owner domain can read them, and the Bridge reads its own tunnel settings"],
  ],
  "settings-job-workflow": [
    [/The product repository keeps Agent M's job workflow/, "the product repository keeps Agent M's job workflow"],
    [/The files name this instance commit and the CI secrets by name only: AGENT_M_TOKEN for the person's repository token and one key secret for each CI participant/, "the files name this instance commit and the CI secrets by name only: AGENT_M_TOKEN for the person's repository token and one key secret for each CI participant"],
    [/The secret values are entered on the repository server's secrets page, not in Agent M/, "the secret values are entered on the repository server's secrets page, not in Agent M"],
  ],
  "settings-product-none": [
    [/A chosen product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read/, "a chosen product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read"],
    [/This browser reads them to show their current state/, "this browser reads them to show their current state"],
  ],
  "settings-product-unavailable": [
    [/This browser keeps the selected product address and token/, "this browser keeps the selected product address and token"],
    [/Its token remains available in the repository settings above/, "its token remains available in the repository settings above"],
  ],
  "settings-product-read-only": [
    [/This product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read/, "this product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read"],
    [/This browser only reads them to show their current state/, "this browser only reads them to show their current state"],
  ],
  "settings-product-records": [
    [/This product repository keeps pseudonymisation and collaborator consent records for everyone who works on it/, "this product repository keeps pseudonymisation and collaborator consent records for everyone who works on it"],
    [/This browser reads them and writes them only after a person's Save click/, "this browser reads them and writes them only after a person's Save click"],
  ],
};

// TST-643101 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-042 (every line and section of the Settings page has its folded What is this?)
// given: explanations.md, and the sixteen topics the Settings page names; known positive — the topic endpoint-test, which the file held before
// input: explain(<topic>) for each of the sixteen
// expect: for each, the file holds the topic, and the element is a folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then one body with the topic's text; the known positive gives the same shape
test("explain — each topic of the Settings page is a folded What is this? with a text", () => {
  const known = explain("endpoint-test");
  assert.deepEqual([known.localName, known.className, known.hasAttribute("open"), known.children.length], ["details", "explain", false, 2],
    "known positive: the topic endpoint-test is a folded explanation with a summary and a body");
  assert.equal(Object.keys(TOPICS).length, 16, "the Settings page names sixteen topics");
  for (const topic of Object.keys(TOPICS)) {
    assert.ok(topicText(topic)?.trim(), `${topic}: explanations.md holds the topic`);
    const folded = explain(topic);
    assert.equal(folded.localName, "details", `${topic}: it is expandable`);
    assert.equal(folded.className, "explain", `${topic}: it uses the shared explanation presentation`);
    assert.equal(folded.hasAttribute("open"), false, `${topic}: it is folded`);
    const [summary, body, ...more] = folded.children;
    assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0], `${topic}: a summary and one body`);
    assert.notEqual(body.textContent.trim(), "", `${topic}: the body has a text`);
  }
});

// TST-643102 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-042; UC-047
// given: the sixteen topics of the Settings page
// input: explain(<topic>) for each, its rendered text read
// expect: each text makes the claims written in this file's table for it — where the setting is kept and who can read it, and for the notifications what is checked, how often, with whose tokens, and when not
test("explain — each topic of the Settings page says where the setting is kept and who can read it", () => {
  for (const [topic, claims] of Object.entries(TOPICS)) {
    const text = bodyText(topic);
    assert.notEqual(text, "", `${topic}: the folded explanation has a text`);
    for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
  }
  assert.match(bodyText("recording-conversations"), /Switching it off is saved at once/, "known positive: the same reading of a topic the file held before matches its sentence");
});

// TST-643103 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the topic settings-job-workflow, which names the CI secret AGENT_M_TOKEN
// input: explain("settings-job-workflow"), its body's markup read
// expect: the secret's name stands as code — <code>AGENT_M_TOKEN</code> — and no emphasis mark is made of its underscores
test("explain — settings-job-workflow shows the secret's name as code", () => {
  const body = explain("settings-job-workflow").children[1];
  assert.match(body.innerHTML, /<code>AGENT_M_TOKEN<\/code>/, "the name of the secret is code");
  assert.doesNotMatch(body.innerHTML, /<em>|<strong>/, "no underscore of the name became emphasis");
  assert.match(body.textContent, /AGENT_M_TOKEN for the person's repository token/, "the sentence reads on after the name");
});

// TST-643104 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF (a topic the file does not hold shows nothing, and the page goes on)
// given: known positive — explain("settings-notifications") is a folded What is this? with a text —; a topic the file does not hold, settings-notifications-nothing
// input: explain("settings-notifications-nothing")
// expect: no exception; an element without any child, where explain("settings-notifications") has two
test("explain — a topic of the Settings page that the file does not hold gives none", () => {
  assert.equal(explain("settings-notifications").children.length, 2, "known positive: the topic settings-notifications gives a summary and a body");
  assert.equal(topicText("settings-notifications-nothing"), undefined);
  const nothing = explain("settings-notifications-nothing");
  assert.equal(nothing.nodeType, 1, "an element");
  assert.equal(nothing.childNodes.length, 0, "without any child");
});
