// The explanation of the line Recording conversations (ITM-511) — MOD-site-frame's explain("recording-conversations"), the folded
// What is this? that MOD-settings-pages puts on the line (tests/settings-pages-recording.test.mjs, "the line has its folded
// explanation"). The topic says, in a few sentences, four things UC-042 step 3 and 3b state of the switch: what it does (the prompt
// bar's conversations are written to git, off unless switched on); where the records go (every message, under docs/conversations/ of
// the repository of the page the conversation is held on); that a repository its server reports as public publishes them; that
// switching off keeps what was written.
// Run: node --test tests/site-frame-recording-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS; UC-042
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-prompt-bar-explanations.test.mjs does, then
// exercises the public explain interface. Each test states its input and its expected result before it runs (given / input / expect),
// and each expected sentence is written in this file's own text: no expected result is read from the SPEC, a use case or an
// architecture file when it runs. The only file read is explanations.md, the data under test, and only to find out whether it holds
// the topic. The counter-proofs are recorded in the pull request.

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

// TST-511101 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-042 (step 3, every line has its folded What is this?)
// given: explanations.md, and the topic recording-conversations
// input: explain("recording-conversations")
// expect: the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — recording-conversations: a folded What is this? with the topic's text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/,
    "known positive: the renderer leaves a mark that is not closed standing");
  const text = topicText("recording-conversations");
  assert.ok(text?.trim(), "the topic recording-conversations is held by explanations.md");
  const folded = explain("recording-conversations");
  assert.equal(folded.localName, "details", "it is expandable");
  assert.equal(folded.className, "explain", "it uses the shared explanation presentation");
  assert.equal(folded.hasAttribute("open"), false, "it is folded");
  const [summary, body, ...more] = folded.children;
  assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
  assert.equal(body.innerHTML, renderArtifact(text).innerHTML, "its body is its text, rendered");
  assert.doesNotMatch(bodyText("recording-conversations"), /[*`]/, "it shows no stray Markdown");
});

// TST-511102 · level: unit · module: MOD-site-frame
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-042 (step 3: off by default)
// given: the topic recording-conversations
// input: explain("recording-conversations")
// expect: text saying the switch decides whether the conversations of the prompt bar are written to git, and that it is off unless you switch it on
test("explain — recording-conversations: what the switch does, and that it is off unless switched on", () => {
  assertClaims("recording-conversations", [
    [/decides whether the conversations of the prompt bar are written to git/, "it decides whether the conversations of the prompt bar are written to git"],
    [/It is off unless you switch it on/, "it is off unless you switch it on"],
  ]);
});

// TST-511103 · level: unit · module: MOD-site-frame
// guards: A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD; UC-042 (step 3: where the messages are committed)
// given: the topic recording-conversations
// input: explain("recording-conversations")
// expect: text saying every message of a conversation, yours and the participant's, is committed under docs/conversations/ of the repository of the page the conversation is held on
test("explain — recording-conversations: where the records go", () => {
  assertClaims("recording-conversations", [
    [/every message of a conversation, yours and the participant's, is committed under docs\/conversations\/ of the repository of the page the conversation is held on/,
      "every message is committed under docs/conversations/ of the repository of the page the conversation is held on"],
  ]);
});

// TST-511104 · level: unit · module: MOD-site-frame
// guards: SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS; UC-042 (step 3: for each public repository the conversations will be published)
// given: the topic recording-conversations
// input: explain("recording-conversations")
// expect: text saying a repository that its server reports as public publishes what is committed to it, and that the page names such repositories before the switch is saved
test("explain — recording-conversations: a public repository publishes the records", () => {
  assertClaims("recording-conversations", [
    [/A repository that its server reports as public publishes what is committed to it/, "a repository that its server reports as public publishes what is committed to it"],
    [/names each repository it reports as public/, "the page names each repository it reports as public"],
  ]);
});

// TST-511105 · level: unit · module: MOD-site-frame
// guards: UC-042 (step 3b: records already written stay in the repositories' history)
// given: the topic recording-conversations
// input: explain("recording-conversations")
// expect: text saying switching off is saved at once, and that records already written stay in the history of the repositories
test("explain — recording-conversations: switching off keeps what was written", () => {
  assertClaims("recording-conversations", [
    [/Switching it off is saved at once/, "switching it off is saved at once"],
    [/Records already written stay in the history of the repositories/, "records already written stay in the history of the repositories"],
  ]);
});

// TST-511106 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF (a topic the file does not hold shows nothing, and the page goes on)
// given: known positive — explain("recording-conversations") is a folded What is this? with a text —; a topic the file does not hold, recording-conversations-nothing
// input: explain("recording-conversations-nothing")
// expect: no exception; an element without any child, where explain("recording-conversations") has two
test("explain — a topic of the line that the file does not hold gives none", () => {
  const held = explain("recording-conversations");
  assert.equal(held.children.length, 2, "known positive: the topic recording-conversations gives a summary and a body");
  assert.equal(topicText("recording-conversations-nothing"), undefined);
  const nothing = explain("recording-conversations-nothing");
  assert.equal(nothing.nodeType, 1, "an element");
  assert.equal(nothing.childNodes.length, 0, "without any child");
});
