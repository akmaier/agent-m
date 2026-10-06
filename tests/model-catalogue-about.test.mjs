// What each model of the catalogue is for (ITM-229) — MOD-model-catalogue's `## About` and Model.about, as the accepted text
// of docs/architecture/MOD-model-catalogue.md states them, for UC-002 step 2: beside each model, the risk it manages well,
// the risk it accepts, an example project it suits and the chapter of the book that explains it.
// Run: node --test tests/model-catalogue-about.test.mjs
//
// Module: MOD-model-catalogue
// Guards: UC-002; AGENT M CARRIES THE BOOK'S CATALOGUE
// Level: unit
//
// What ITM-229 builds, and these tests state:
// - the model schema's optional section `## About`, before `## Phases`, with its lines `manages:`, `accepts:`, `example:`
//   and `chapter:`; every shipped model has it, taken from the book as the instance's source register holds it;
// - Model.about, read from that section — { manages, accepts, example, chapter } —, and null for a model without one.
//
// Each test states its input and its expected result before it runs (given / input / expect). The test that expects null
// first shows the same reading giving the section's lines on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { catalogue } from "../src/model-catalogue/index.mjs";

// The shipped models, and the four lines of a model's `## About`.
const MODELS = ["waterfall", "v-model", "reuse-oriented", "scrum", "kanban"];
const LINES = ["manages", "accepts", "example", "chapter"];

const modelPath = (name) => `src/model-catalogue/models/${name}.md`;
const fileText = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// The snapshot of an instance repository holding these files, { path: text }, as MOD-repository-hosts' Snapshot gives it:
// its paths, read(path) -> Promise<string | null>, blob(path) -> string | null, a blob of its own for each path it holds.
function snapshotOf(files) {
  const texts = new Map(Object.entries(files));
  return {
    repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" },
    ref: "main",
    commit: "0123456789abcdef0123456789abcdef01234567",
    paths: [...texts.keys()],
    read: async (path) => texts.get(path) ?? null,
    blob: (path) => (texts.has(path) ? createHash("sha1").update(path).digest("hex") : null),
  };
}

// The four lines of a model file's `## About` as its text writes them: for each of manages, accepts, example and chapter,
// the text after `<key>:` on the line that begins with it, between the heading `## About` and the next heading — undefined
// where no line begins with it —; null for a file without the section.
function aboutIn(text) {
  const lines = text.split("\n");
  const from = lines.indexOf("## About");
  if (from < 0) return null;
  const next = lines.findIndex((line, i) => i > from && line.startsWith("#"));
  const section = lines.slice(from + 1, next < 0 ? lines.length : next);
  return Object.fromEntries(LINES.map((key) =>
    [key, section.find((line) => line.startsWith(`${key}:`))?.slice(key.length + 1).trim()]));
}

// guards: UC-002; AGENT M CARRIES THE BOOK'S CATALOGUE
// given: the snapshot of an instance that holds no model of its own; the five shipped models waterfall, v-model,
//        reuse-oriented, scrum and kanban, each the file src/model-catalogue/models/<name>.md
// input: await catalogue(snapshot)
// expect: each of the five files has a section ## About with its four lines manages:, accepts:, example: and chapter:, none
//         of them empty; and the model read from it has as its about exactly these lines — { manages, accepts, example,
//         chapter }, each the text after its key, as the file writes it
test("Model.about — every shipped model's ## About is read with its four lines", async () => {
  const got = await catalogue(snapshotOf({}));
  for (const name of MODELS) {
    const path = modelPath(name);
    const written = aboutIn(fileText(path));
    assert.notEqual(written, null, `${path} has a section ## About`);
    for (const key of LINES) assert.ok(written[key], `${path}: its ## About has a line ${key}: that is not empty`);
    assert.deepEqual(got.models.find((model) => model.path === path)?.about, written, path);
  }
});

// Two models of an instance, docs/process-models/<name>.md, alike but for a section ## About before ## Phases: their front
// matter, their title and the table of their phases. Whether they are complete definitions is not the question here.
const WITH_PATH = "docs/process-models/with-about.md";
const WITH = [
  "---",
  "name: with-about",
  "kind: planned",
  "measure: plan entries per phase",
  "---",
  "# A planned fixture model",
  "",
  "## About",
  "",
  "manages: the risk it manages well",
  "accepts: the risk it accepts",
  "example: an example project it suits",
  "chapter: 6, the chapter that explains it",
  "",
  "## Phases",
  "",
  "| Name | Role | Produces |",
  "|---|---|---|",
  "| Building | Builder | MOD |",
  "",
].join("\n");
const WITHOUT_PATH = "docs/process-models/without-about.md";
const WITHOUT = WITH.replace("name: with-about", "name: without-about")
  .replace("## About\n\nmanages: the risk it manages well\naccepts: the risk it accepts\nexample: an example project it suits\n"
    + "chapter: 6, the chapter that explains it\n\n", "");

// guards: UC-002
// given: the snapshot of an instance holding its two models WITH, whose ## About has the lines `manages: the risk it manages
//        well`, `accepts: the risk it accepts`, `example: an example project it suits` and `chapter: 6, the chapter that
//        explains it`, and WITHOUT, the same model without that section
// input: await catalogue(snapshot)
// expect: known positive first — WITH's model has as its about { manages: "the risk it manages well", accepts: "the risk it
//         accepts", example: "an example project it suits", chapter: "6, the chapter that explains it" }; then WITHOUT's
//         model has as its about null
test("Model.about — a model without ## About is read with about null", async () => {
  assert.ok(!WITHOUT.includes("## About") && WITHOUT.includes("## Phases"), "WITHOUT is WITH without its section ## About");
  const got = await catalogue(snapshotOf({ [WITH_PATH]: WITH, [WITHOUT_PATH]: WITHOUT }));
  const about = (path) => got.models.find((model) => model.path === path)?.about;
  assert.deepEqual(about(WITH_PATH), { manages: "the risk it manages well", accepts: "the risk it accepts",
    example: "an example project it suits", chapter: "6, the chapter that explains it" }, "known positive: the lines are read");
  assert.equal(about(WITHOUT_PATH), null);
});
