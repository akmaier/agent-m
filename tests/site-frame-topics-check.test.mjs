// The frame's own check of the topics (ITM-646) — MOD-site-frame's file: "A topic that a view or the Bridge's window names and the file does not hold is a finding
// of the frame's own check, which compares the topics named with the file's, never a failure at run time." explain returns an empty element for a topic the file does
// not hold, so a mistyped topic shows nothing; this check lists such a topic, with the file that names it. The check is tests/site-frame-topics.mjs; it reads the
// source text of the files of src/ and the headings of src/site-frame/explanations.md, and runs nothing.
// Run: node --test tests/site-frame-topics-check.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The first three tests give the check fixture texts written in this file; the fourth gives it the files of this repository. Each test states its input and its expected
// result before it runs (given / input / expect), and every expected value is written in this file's own text: no expected result is read from the SPEC, a use case or
// an architecture file when it runs. The only repository files read are the files under test: the source of src/ and explanations.md, the data. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { topicsNamed, topicsHeld, topicFindings, viewFiles } from "./site-frame-topics.mjs";

const ROOT = new URL("..", import.meta.url).pathname;

const VIEW = [
  'import { explain } from "../site-frame/index.mjs";',
  '// explain("named-in-a-comment") names nothing',
  'const kind = { explain: { list: "accepting", draft: { whole: "what-is-an-architecture" } }, route: "use-case" };',
  'const TYPE_TOPIC = { "model endpoint": "participant-model-endpoint" };',
  'target.append(explain("existing-requirements"), folded("linked-version"), sourceExplain("run-panel"), explain(variable));',
  'const label = "not-a-topic";',
].join("\n");
const ALL_HELD = ["accepting", "what-is-an-architecture", "participant-model-endpoint", "existing-requirements", "linked-version", "run-panel"]
  .map((topic) => `## ${topic}\n\nText of ${topic}.\n`).join("\n");

// TST-646001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: a view text that names topics in every form — a literal call of explain, of folded and of sourceExplain, the values of an object bound to explain, the values of a table named TYPE_TOPIC with a quoted key — and also holds a comment that mentions explain("named-in-a-comment"), a call with a variable, a route name and an unrelated literal; and an explanations text holding all the named topics
// input: topicsNamed of the view text, and topicFindings of it against the explanations text
// expect: the topics named are exactly accepting, what-is-an-architecture, participant-model-endpoint, existing-requirements, linked-version and run-panel, in that order; no finding
test("the check — reads every form of naming, ignores comments, keys and unrelated literals, and lists none when all are held", () => {
  assert.deepEqual(topicsNamed(VIEW), ["accepting", "what-is-an-architecture", "participant-model-endpoint", "existing-requirements", "linked-version", "run-panel"]);
  assert.deepEqual([...topicsHeld(ALL_HELD)].sort(), ["accepting", "existing-requirements", "linked-version", "participant-model-endpoint", "run-panel", "what-is-an-architecture"], "known positive: the explanations text holds the six topics");
  assert.deepEqual(topicFindings([{ path: "src/x/view.mjs", text: VIEW }], ALL_HELD), []);
});

// TST-646002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the same view text, and an explanations text that lacks linked-version and run-panel
// input: topicFindings of the view text against it
// expect: exactly two findings, linked-version and run-panel, each with the path src/x/view.mjs; the four held topics are not listed
test("the check — counter-proof: a view naming topics the file lacks has them listed", () => {
  const lacking = ALL_HELD.replace(/## linked-version\n\nText of linked-version\.\n\n/, "").replace(/\n## run-panel\n\nText of run-panel\.\n/, "");
  assert.equal(topicsHeld(lacking).has("linked-version") || topicsHeld(lacking).has("run-panel"), false, "known positive: the two topics are cut out of the text");
  assert.deepEqual(topicFindings([{ path: "src/x/view.mjs", text: VIEW }], lacking), [
    { path: "src/x/view.mjs", topic: "linked-version" },
    { path: "src/x/view.mjs", topic: "run-panel" },
  ]);
});

// TST-646003 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: two files that name the topic accepting-more, one of them also naming accepting, and an explanations text whose headings are `## accepting` and whose body text holds the line `## accepting-more` indented, so that it is no heading
// input: topicFindings of the two files against it
// expect: accepting-more is listed once for each of the two files, in the order of the files; accepting is not listed (a topic is held only as a whole heading, and an indented line is none)
test("the check — lists a missing topic once for each file that names it, and holds a topic only as a whole heading", () => {
  const explanations = "## accepting\n\nA record. Not a heading:\n  ## accepting-more\n";
  const files = [
    { path: "src/a/one.mjs", text: 'explain("accepting-more"); explain("accepting");' },
    { path: "src/b/two.mjs", text: 'const holder = { explain: { list: "accepting-more" } };' },
  ];
  assert.deepEqual(topicFindings(files, explanations), [
    { path: "src/a/one.mjs", topic: "accepting-more" },
    { path: "src/b/two.mjs", topic: "accepting-more" },
  ]);
});

// TST-646004 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the files of src/ of this repository and src/site-frame/explanations.md
// input: topicFindings of them
// expect: no finding — every topic a file of src/ names is held by explanations.md. The scan is alive: it finds src/review-pages/kinds.mjs and src/settings-pages/library.mjs among the files, and names accepting and source-new-version, which explanations.md holds
test("the check — over this repository's src/, no topic a view names is missing from explanations.md", () => {
  const files = viewFiles(ROOT);
  const explanations = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
  const paths = files.map((file) => file.path);
  assert.deepEqual(["src/review-pages/kinds.mjs", "src/settings-pages/library.mjs"].filter((path) => !paths.includes(path)), [], "known positive: the scan reads the files of the views");
  const named = new Set(files.flatMap((file) => topicsNamed(file.text)));
  assert.deepEqual(["accepting", "source-new-version"].filter((topic) => !named.has(topic)), [], "known positive: the scan finds topics that are named");
  assert.deepEqual(topicFindings(files, explanations), []);
});
