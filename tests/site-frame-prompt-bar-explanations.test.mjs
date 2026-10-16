// The explanation of the prompt bar (ITM-530) — MOD-site-frame's explain("prompt-bar"), the folded What is this? that MOD-prompt-bar's
// startPromptBar puts into the bar (tests/prompt-bar.test.mjs, "both ask the frame to explain the topic prompt-bar"). The topic says,
// in a few sentences, five things UC-049 and MOD-prompt-bar state of the bar: it lets a person talk with a participant about the
// page shown; a message goes only to the participant named, at the processing place named before it is sent; the conversation is
// written to a repository only while recording conversations is switched on in the instance's settings; a draft or an edit the
// participant proposes changes nothing until the person saves it; work the tab cannot do is handed over only on the person's click.
// Run: node --test tests/site-frame-prompt-bar-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; THE PAGE NAMES WHERE IT SENDS; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON;
//   UC-049
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-participant-explanations.test.mjs does, then
// exercises the public explain interface. Each test states its input and its expected result before it runs (given / input / expect),
// and each expected sentence is written in this file's own text: no expected result is read from the SPEC, a use case or a module file
// when it runs. The only file read is explanations.md, the data under test, and only to find out whether it holds the topic. The
// counter-proofs are recorded in the pull request.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderArtifact } from "../src/markdown-render/index.mjs";
import { explain } from "../src/site-frame/index.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  assert.notEqual(text, "", `${topic}: the folded explanation has a text`);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-530101 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-049 (step 1, the folded What is this? of the bar)
// given: explanations.md, and the topic prompt-bar
// input: explain("prompt-bar")
// expect: the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — prompt-bar: a folded What is this? with the topic's text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/,
    "known positive: the renderer leaves a mark that is not closed standing");
  const text = topicText("prompt-bar");
  assert.ok(text?.trim(), "known positive: explanations.md holds the topic prompt-bar");
  const folded = explain("prompt-bar");
  assert.equal(folded.localName, "details", "it is expandable");
  assert.equal(folded.className, "explain", "it uses the shared explanation presentation");
  assert.equal(folded.hasAttribute("open"), false, "it is folded");
  const [summary, body, ...more] = folded.children;
  assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
  assert.equal(body.innerHTML, renderArtifact(text).innerHTML, "its body is its text, rendered");
  assert.doesNotMatch(bodyText("prompt-bar"), /[*`]/, "it shows no stray Markdown");
});

// TST-530102 · level: unit · module: MOD-site-frame
// guards: UC-049 (goal and step 2: the author writes to a participant about what they see)
// given: the topic prompt-bar
// input: explain("prompt-bar")
// expect: text saying the bar is where you talk to a participant about the page you are looking at
test("explain — prompt-bar: the bar lets a person talk with a participant about the page shown", () => {
  assertClaims("prompt-bar", [
    [/talk to a participant about the page you are looking at/, "you talk to a participant about the page you are looking at"],
  ]);
});

// TST-530103 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-049 (step 1, the selector is the statement of where the messages go)
// given: the topic prompt-bar
// input: explain("prompt-bar")
// expect: text saying a message goes only to the participant named above the input, and to the place where that participant processes data, which is named with it before you press Send
test("explain — prompt-bar: a message goes only to the participant named, at the processing place named before it is sent", () => {
  assertClaims("prompt-bar", [
    [/Each message goes only to the participant named above the input/, "a message goes only to the participant named above the input"],
    [/at the place where that participant processes data/, "at the place where that participant processes data"],
    [/named with it before you press Send/, "the place is named with the participant before you press Send"],
  ]);
});

// TST-530104 · level: unit · module: MOD-site-frame
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-049 (step 7 and 6c)
// given: the topic prompt-bar
// input: explain("prompt-bar")
// expect: text saying the conversation stays in this browser tab and is written to a repository only while recording conversations is switched on in the instance's settings
test("explain — prompt-bar: the conversation is written to a repository only while recording is switched on in the instance's settings", () => {
  assertClaims("prompt-bar", [
    [/conversation stays in this browser tab/, "the conversation stays in this browser tab"],
    [/written to a repository only while recording conversations is switched on in the instance's settings/,
      "it is written to a repository only while recording conversations is switched on in the instance's settings"],
  ]);
});

// TST-530105 · level: unit · module: MOD-site-frame
// guards: A GENERATED ARTIFACT IS A PROPOSAL; UC-049 (steps 5 and 6: an edit is held for the author and written only on Save)
// given: the topic prompt-bar
// input: explain("prompt-bar")
// expect: text saying a draft or an edit the participant proposes changes nothing until you save it
test("explain — prompt-bar: a draft or an edit the participant proposes changes nothing until the person saves it", () => {
  assertClaims("prompt-bar", [
    [/A draft or an edit the participant proposes changes nothing until you save it/, "a draft or an edit the participant proposes changes nothing until you save it"],
  ]);
});

// TST-530106 · level: unit · module: MOD-site-frame
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-049 (step 4a: the participant hands its task to GitHub Actions, the person decides)
// given: the topic prompt-bar
// input: explain("prompt-bar")
// expect: text saying work the tab cannot do is handed over only when you click Hand over
test("explain — prompt-bar: work the tab cannot do is handed over only on the person's click", () => {
  assertClaims("prompt-bar", [
    [/Work this tab cannot do is handed over only when you click Hand over/, "work this tab cannot do is handed over only when you click Hand over"],
  ]);
});

// TST-530107 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF (a topic the file does not hold shows nothing, and the page goes on)
// given: known positive — explain("prompt-bar") is a folded What is this? with a text —; a topic the file does not hold, prompt-bar-nothing
// input: explain("prompt-bar-nothing")
// expect: no exception; an element without any child, where explain("prompt-bar") has two
test("explain — a topic of the bar that the file does not hold gives none", () => {
  const held = explain("prompt-bar");
  assert.equal(held.children.length, 2, "known positive: the topic prompt-bar gives a summary and a body");
  assert.equal(topicText("prompt-bar-nothing"), undefined);
  const nothing = explain("prompt-bar-nothing");
  assert.equal(nothing.nodeType, 1, "an element");
  assert.equal(nothing.childNodes.length, 0, "without any child");
});
