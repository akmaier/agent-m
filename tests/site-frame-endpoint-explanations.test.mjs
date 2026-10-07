// The endpoint configuration explanations (ITM-264) — MOD-site-frame's explain interface, for UC-003's URL, kind,
// model, optional key, direct/Bridge choice, test and Clear steps.
//
// Run: node --test tests/site-frame-endpoint-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-003; EVERY STEP EXPLAINS ITSELF; THE PAGE STATES WHAT IT SENDS WHERE; A CLEAR IS A REAL CLEAR
// Level: unit
// TST-264-01
//
// Given: the seven endpoint topics that UC-003's configuration steps require
// Input: explain(topic) for every endpoint topic
// Expected: each returns the existing folded What is this? element, whose rendered text explains that step; the test
//          explanation discloses the short request's endpoint and credential handling.

// This imports the module's existing browser harness unchanged, then exercises its public explain interface. The harness
// supplies the minimal browser DOM used by MOD-markdown-render; the topics remain this test's only subject.
import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { explain } from "../src/site-frame/index.mjs";

const textOf = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

const TOPICS = [
  ["endpoint-url", /URL.*endpoint/i],
  ["endpoint-kind", /OpenAI-compatible.*Anthropic/i],
  ["endpoint-model", /model/i],
  ["endpoint-key", /optional.*key/i],
  ["endpoint-route", /Bridge.*browser/i],
  ["endpoint-test", /short test request.*endpoint/i],
  ["endpoint-clear", /localStorage.*nothing is stored/i],
];

test("TST-264-01 — explain provides every endpoint configuration step (UC-003)", () => {
  for (const [topic, expected] of TOPICS) {
    const folded = explain(topic);
    assert.equal(folded.localName, "details", `${topic}: the explanation is expandable`);
    assert.equal(folded.className, "explain", `${topic}: it uses the shared explanation presentation`);
    assert.equal(folded.children[0]?.textContent, "What is this?", `${topic}: it has the shared summary`);
    assert.match(textOf(topic), expected, `${topic}: it explains its configuration step`);
  }

  const testRequest = textOf("endpoint-test");
  assert.match(testRequest, /sent only to the endpoint/i, "the test discloses its destination");
  assert.match(testRequest, /authorisation header/i, "the test discloses how an optional key travels");
});
