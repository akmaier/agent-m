// Each of UC-002's choices carries a folded "What is this?" that points to a chapter of the book (EVERY STEP EXPLAINS
// ITSELF): the topics of src/site-frame/explanations.md for the model, the roles' holders, a branch, the practices and
// the Definition of Done — the same five ITM-223's system test checks (tests/system-uc-002-choose-a-process-model.
// test.mjs, "UC-002 main flow: every choice carries a folded What is this? with a pointer to the book", todo F7: "the
// explanation of a branch of its own carries no pointer to the book, unlike those of the model, the roles, the practices
// and the Definition of Done").
//
// Read directly from the module's own data file, as MOD-site-frame owns it (docs/architecture/MOD-site-frame.md, ## Data,
// "The explanations file"): no rendering. The rendering of a topic's Markdown through explain() is already covered by
// tests/site-frame.test.mjs's "explain" tests, unaffected by this item.
//
// Run: node --test tests/site-frame-book-pointers.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-002
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);

// UC-002's five choices that carry a folded "What is this?" — the model (step 3), the roles' holders (step 4), a branch
// (step 5), the practices (step 6), the Definition of Done (step 8) — each by the topic explanations.md holds it under.
const CHOICES = [
  ["the model", "process-model"],
  ["the roles' holders", "roles-and-participants"],
  ["a branch", "branch-of-its-own"],
  ["the practices", "practices"],
  ["the Definition of Done", "definition-of-done"],
];

// guards: EVERY STEP EXPLAINS ITSELF; UC-002 (every choice's folded explanation points to the book, as ITM-223-F7 checks it)
// given: explanations.md, and UC-002's five choices, each a topic it holds
// input: the Markdown of each topic
// expect: each names "Vibe Coding" and a chapter
test("explanations.md — each of UC-002's choices points to a chapter of the book", () => {
  for (const [choice, topic] of CHOICES) {
    const text = topicText(topic);
    assert.ok(text?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    // As a person reads it, not as the source wraps its lines (renderArtifact's Markdown may carry the book's name across
    // a line break — tests/system-uc-002-choose-a-process-model.test.mjs's textOf has the same rule for the same reason).
    const read = text.replace(/\s+/g, " ");
    assert.match(read, /Vibe Coding/, `${choice}: its What is this? names the book`);
    assert.match(read, /chapter/i, `${choice}: its What is this? names a chapter`);
  }
});
