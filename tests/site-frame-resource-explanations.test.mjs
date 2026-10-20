// The folded explanations of declaring a resource (ITM-1040) — MOD-site-frame's file src/site-frame/explanations.md holds, for UC-040's resources page, the topics
// `resources`, `resource-kind` and `resource-licence` that src/settings-pages/resources.mjs names. This test reads those sections of the file under test.
// Run: node --test tests/site-frame-resource-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// Every expected phrase is written in this file's own text; no expected result is read from the SPEC, a use case or an architecture file when it runs. The only file read is
// the one under test: explanations.md (the data). That the frame's check finds every topic a view names and reports a missing one is tests/site-frame-topics-check.test.mjs's.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const LINES = readFileSync(`${ROOT}src/site-frame/explanations.md`, "utf8").split("\n");

// The body of the section `## <topic>`, up to the next section heading.
const section = (topic) => {
  const start = LINES.findIndex((line) => line === `## ${topic}`);
  if (start < 0) return "";
  const rest = LINES.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return rest.slice(0, end < 0 ? rest.length : end).join("\n");
};

// TST-1040001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the topic `resources`, the folded explanation of the three-way difference
// input: read its section
// expect: it names an example of each of the three: a resource (speech-dlls, meta-llama/Llama-3.1-8B, the cluster Alex, a vLLM endpoint), a requirement source (EU AI Act, IEC 62304) and a participant (Claude Code, a CI agent); and it links UC-017 for the participant and UC-015 for the source
test("the topic resources gives examples of a resource, a requirement source and a participant, and links UC-017 and UC-015", () => {
  const text = section("resources");
  assert.ok(text.length > 0, "known positive: the section is held");
  for (const phrase of ["speech-dlls", "meta-llama/Llama-3.1-8B", "Alex", "vLLM", "EU AI Act", "IEC 62304", "Claude Code", "CI agent", "(#use-case/id=UC-017)", "(#use-case/id=UC-015)"]) {
    assert.ok(text.includes(phrase), `${phrase} in the topic resources`);
  }
});

// TST-1040002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the topic `resource-kind`, which says what is written down for each of the six kinds
// input: read its section
// expect: each kind carries an example: a private repository of binaries (speech-dlls), a group share for data, a checkpoint file for a model, a SLURM cluster for compute, Ollama for an endpoint and an agent service the product delegates to for an agent
test("the topic resource-kind gives each of the six kinds an example", () => {
  const text = section("resource-kind");
  assert.ok(text.includes("pinned"), "known positive: the section is held");
  for (const phrase of ["speech-dlls", "group share", "checkpoint file", "SLURM", "Ollama", "delegates to"]) assert.ok(text.includes(phrase), `${phrase} in the topic resource-kind`);
});

// TST-1040003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the topic `resource-licence`, which explains the licence, the maintainer and the key
// input: read its section
// expect: it links UC-004 and UC-015 for a licence that imposes rules, tells the PEAKS example and the bus factor of one for a maintainer who is a single person, and keeps the warning that a leaked key is like a published credit-card number
test("the topic resource-licence links UC-004 and UC-015, tells the PEAKS example for a single maintainer and keeps the warning on a leaked key", () => {
  const text = section("resource-licence");
  assert.ok(text.includes("credit-card number"), "known positive: the warning on a leaked key is held");
  for (const phrase of ["(#use-case/id=UC-004)", "(#use-case/id=UC-015)", "PEAKS", "bus factor"]) assert.ok(text.includes(phrase), `${phrase} in the topic resource-licence`);
});

// TST-1125001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-040
// given: the topic `resource-check`, the folded explanation of Check on a resource (the page makes a check through the Bridge a resource's route names: one harmless request, shown, nothing written)
// input: read its section
// expect: it keeps the sentence that a check makes one harmless request, and says of a resource reached through a Bridge that the page asks that Bridge, which lists a cluster's partitions, the models an endpoint serves or gets an answer from an agent, and that the page shows the answer; it does not say that the page does not make that request
// Planted fault: the old sentence "which this page does not make yet" fails the last assertion; a section without the Bridge's three answers fails the third.
test("the topic resource-check says what the page does through a Bridge and no longer says it does not make that request", () => {
  const text = section("resource-check").replace(/\s+/g, " ");
  assert.match(text, /A check makes one harmless request to the resource/, "known positive: the section is held");
  assert.match(text, /through a Bridge is checked by a request through the Bridge/);
  for (const phrase of ["partitions", "models", "answer from"]) assert.ok(text.includes(phrase), `${phrase} in the topic resource-check`);
  assert.match(text, /shows the answer/);
  assert.doesNotMatch(text, /does not make (that request )?yet/);
});
