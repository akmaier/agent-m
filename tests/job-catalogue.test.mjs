// Every kind of job, as data — MOD-job-catalogue's interface as docs/architecture/MOD-job-catalogue.md states it: the index
// `kinds.md`, one folder per kind with its definition `kind.md`, its prompt `prompt.md` and the schema of its draft
// `answer.schema.json`, the schema every definition follows `definition.schema.md`; kindNames and kindOf.
// Run: node --test tests/job-catalogue.test.mjs
//
// Module: MOD-job-catalogue
// Guards: ONE DEFINITION, THREE DRIVERS; THE CATALOGUE IS DATA; THE CORRECTION LOOP HAS A FIXED LIMIT
// Level: component
//
// The expected kinds are read from the module file: its table of kinds — name, the use cases it serves, what its participant
// needs, its preconditions, recipes, checks, reviewers, steps, review and writer —, and the sentences under it that name the
// kinds with product resources, with gate points, and with the rule a person decides. Every kind has the limit of rounds
// UC-019 states as the default, 5, which the module file's example definition also gives.
//
// The catalogue is read as every caller reads it, through its index.mjs. Where a test needs a definition the catalogue does
// not ship, the module is loaded anew with a disk that gives that text for one file and the real text for every other, as
// tests/participant-list.test.mjs loads MOD-participant-list; the shipped files are never changed. Each test states its
// input and its expected result before it runs (given / input / expect); where a test asserts a refusal, the same call is
// first shown to succeed on a known positive. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { kindNames, kindOf } from "../src/job-catalogue/index.mjs";

const MODULE = new URL("../src/job-catalogue/index.mjs", import.meta.url);
const MODULE_FILE = new URL("../docs/architecture/MOD-job-catalogue.md", import.meta.url);
const KINDS = new URL("../src/job-catalogue/kinds/", import.meta.url);
const ONE_DEFINITION = "ONE DEFINITION, THREE DRIVERS";

// ---------------------------------------------------------------- the module file

const moduleText = readFileSync(MODULE_FILE, "utf8");

// The names a cell lists: the text of each `…` in it, or, without any, its comma-separated words; none for "—" or blank.
const named = (cell) => {
  const quoted = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (quoted.length) return quoted;
  return cell.trim() === "—" || cell.trim() === "" ? [] : cell.split(",").map((part) => part.trim());
};

// The table of kinds — the rows under its header `| Kind | Serves | …` —, one object per row, as the module file writes it.
const lines = moduleText.split("\n");
const header = lines.findIndex((line) => line.startsWith("| Kind | Serves |"));
const tableRows = [];
for (let at = header + 2; header >= 0 && at < lines.length && lines[at].startsWith("|"); at += 1) tableRows.push(lines[at]);
const TABLE = tableRows.map((line) => {
  const cells = line.split("|").slice(1, -1);
  const [kind, serves, needs, preconditions, recipes, checks, reviewers, steps, reviewWriter] = cells;
  const [review, writer] = named(reviewWriter);
  const reviewer = reviewers.trim() ? { kind: named(reviewers)[0], count: Number(reviewers.match(/× (\d+)/)[1]) } : null;
  return { name: named(kind)[0], serves: named(serves), needs: named(needs), preconditions: named(preconditions),
    recipes: named(recipes), checks: named(checks), reviewer, steps: named(steps), review, writer };
});

// The sentence of the module file that holds `marker`, its white space made single.
const sentence = (marker) => moduleText.replace(/\s+/g, " ").split(/(?<=\.) /).find((text) => text.includes(marker)) ?? "";
// "`implement`, `refactor`, `fix-bug`, `write-tests` and `run-tests` have `resources: product`."
const PRODUCT_RESOURCES = named(sentence("have `resources: product`").split(" have ")[0]);
// "For `implement`, `refactor` and `fix-bug`, `gate_points` names `before-merge` and `question`, …; for `write-tests`,
// `before-merge`."
const gatePoints = sentence("`gate_points` names `before-merge` and `question`");
const MERGE_AND_QUESTION = named(gatePoints.split(", `gate_points`")[0]);
const MERGE_ONLY = named(gatePoints.split("; for ")[1]?.split(", `before-merge`")[0] ?? "");
// "For `derive-requirements`, `change-requirements` and the architecture kinds, `person_decides` names …": the
// architecture kinds are the two that draft architecture files, derive-architecture and change-architecture.
const PERSON_DECIDES = [...named(sentence("`person_decides` names").split(" and the architecture kinds")[0]),
  "derive-architecture", "change-architecture"];

const promptPlaces = (prompt) => [...new Set([...prompt.matchAll(/\{\{([a-z-]+)\}\}/g)].map((m) => m[1]))].sort();

// The keywords of a schema of a draft, at every depth.
function keywords(schema, found = new Set()) {
  if (schema && typeof schema === "object" && !Array.isArray(schema)) {
    for (const [key, value] of Object.entries(schema)) {
      found.add(key);
      if (key === "properties") for (const property of Object.values(value)) keywords(property, found);
      if (key === "items") keywords(value, found);
    }
  }
  return found;
}

// ---------------------------------------------------------------- loading the module anew

// One load of the module, anew, with `disk` as what process.getBuiltinModule("node:fs") gives it and `fetch` as the
// browser's fetch — as tests/participant-list.test.mjs loads MOD-participant-list. -> { module, reads }
let loads = 0;
async function load({ disk, fetch }) {
  const saved = { getBuiltinModule: process.getBuiltinModule, fetch: globalThis.fetch };
  const reads = [];
  process.getBuiltinModule = (name) => (name === "node:fs" ? disk?.(reads) : saved.getBuiltinModule.call(process, name));
  globalThis.fetch = fetch ? (url) => { reads.push(`fetch ${url}`); return fetch(url); } : undefined;
  try {
    loads += 1;
    return { module: await import(new URL(`?load=${loads}`, MODULE)), reads };
  } finally {
    process.getBuiltinModule = saved.getBuiltinModule;
    globalThis.fetch = saved.fetch;
  }
}

// A disk that gives the real text of every file, except `changed` for the file whose address ends with `ending`.
const diskWith = (ending, changed) => (reads) => ({
  readFileSync: (url, encoding) => {
    reads.push(`disk ${url}`);
    return String(url).endsWith(ending) ? changed : readFileSync(url, encoding);
  },
});

// ---------------------------------------------------------------- kindNames

// guards: ONE DEFINITION, THREE DRIVERS; THE CATALOGUE IS DATA
// given: the catalogue as shipped; the module file's table of kinds; the folders under src/job-catalogue/kinds/
// input: kindNames()
// expect: the names of the table's rows, in the table's order, and exactly one folder for each name
test("kindNames — every kind of the module file's table, in its order, each with a folder of its own", async () => {
  assert.ok(TABLE.length > 20 && TABLE.every((row) => row.writer), "known positive: the module file's table is read");
  assert.deepEqual([PRODUCT_RESOURCES.length, MERGE_AND_QUESTION.length, MERGE_ONLY, PERSON_DECIDES.length],
    [5, 3, ["write-tests"], 4], "known positive: the sentences under the table are read");
  const names = await kindNames();
  assert.deepEqual(names, TABLE.map((row) => row.name));
  const folders = readdirSync(KINDS, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  assert.deepEqual([...folders].sort(), [...names].sort());
});

// ---------------------------------------------------------------- kindOf: the shipped definitions

// guards: ONE DEFINITION, THREE DRIVERS; THE CATALOGUE IS DATA; THE CORRECTION LOOP HAS A FIXED LIMIT
// given: each kind of the catalogue; the row of the module file's table with its name
// input: kindOf(name)
// expect: a definition read without an error, whose name is its folder's; the use cases it serves, what its participant
//         needs — and `participant: none` exactly where the table names nothing —, its preconditions, recipes — none of
//         them one that may be left out —, checks, reviewer kind and number of reviewers, steps, review and writer as the
//         row gives them; `resources: product` and the
//         gate points before-merge and question exactly for the kinds the module file names, before-merge alone for
//         write-tests; A CONFLICT IS DECIDED BY A PERSON exactly for the requirement and architecture kinds; the limit 5;
//         a purpose in a paragraph
test("kindOf — every shipped definition is read without an error and says what the module file's table says", async () => {
  for (const row of TABLE) {
    const kind = await kindOf(row.name);
    const expected = {
      name: row.name, serves: row.serves, participant: row.needs.length ? "one" : "none", needs: row.needs,
      resources: PRODUCT_RESOURCES.includes(row.name) ? "product" : "none", preconditions: row.preconditions,
      recipes: row.recipes.map((name) => ({ name, optional: false })), checks: row.checks, personDecides: PERSON_DECIDES.includes(row.name) ? ["A CONFLICT IS DECIDED BY A PERSON"] : [],
      reviewer: row.reviewer?.kind ?? null, reviewers: row.reviewer?.count ?? 0, steps: row.steps,
      gatePoints: MERGE_AND_QUESTION.includes(row.name) ? ["before-merge", "question"]
        : MERGE_ONLY.includes(row.name) ? ["before-merge"] : [],
      review: row.review, writer: row.writer, limit: 5,
    };
    const got = Object.fromEntries(Object.keys(expected).map((key) => [key, kind[key]]));
    assert.deepEqual(got, expected, row.name);
    assert.match(kind.purpose, /\S/, `${row.name} states its purpose`);
  }
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: each kind of the catalogue
// input: kindOf(name)
// expect: a kind with a participant has a prompt with a named place `{{recipe}}` for exactly each of its recipes, and a
//         schema of its draft written with type, properties, required, items and enum only, describing an object; a kind
//         without a participant has neither a prompt nor a schema of a draft
test("kindOf — each prompt has a named place for exactly its kind's recipes, and each draft's schema uses the five keywords", async () => {
  for (const name of await kindNames()) {
    const kind = await kindOf(name);
    if (kind.participant === "none") {
      assert.deepEqual([kind.prompt, kind.answer, kind.recipes], ["", null, []], name);
      continue;
    }
    assert.deepEqual(promptPlaces(kind.prompt), kind.recipes.map((recipe) => recipe.name).sort(), name);
    assert.equal(kind.answer.type, "object", name);
    assert.deepEqual([...keywords(kind.answer)].filter((key) => !["type", "properties", "required", "items", "enum"]
      .includes(key)), [], name);
  }
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: each kind of the catalogue that names a reviewer
// input: kindOf of it and of its reviewer
// expect: the reviewer is a kind of the catalogue with a participant, and the number of reviewers is at least one; a kind
//         that names no reviewer has none
test("kindOf — a reviewer is a kind of the catalogue, with at least one reviewing participant", async () => {
  const names = await kindNames();
  let reviewed = 0;
  for (const name of names) {
    const kind = await kindOf(name);
    if (kind.reviewer === null) { assert.equal(kind.reviewers, 0, name); continue; }
    reviewed += 1;
    assert.ok(names.includes(kind.reviewer), `${name} names the reviewer ${kind.reviewer}`);
    assert.equal((await kindOf(kind.reviewer)).participant, "one", name);
    assert.ok(kind.reviewers >= 1, name);
  }
  assert.ok(reviewed >= 2, "known positive: the catalogue has reviewed kinds");
});

// guards: THE CATALOGUE IS DATA
// given: the catalogue as shipped
// input: kindOf("derive-architecture") twice
// expect: the same definition both times — read once per program and kept
test("kindOf — a kind is read once per program and kept", async () => {
  assert.equal(await kindOf("derive-architecture"), await kindOf("derive-architecture"));
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: known positive first — kindOf of the shipped kind derive-requirements; then a name the index does not hold
// input: kindOf("no-such-kind")
// expect: the known positive is read; the unknown name is refused with UnknownKind naming it
test("kindOf — a name the index does not hold is refused as UnknownKind, naming it", async () => {
  assert.equal((await kindOf("derive-requirements")).name, "derive-requirements");
  await assert.rejects(kindOf("no-such-kind"), (error) => error.name === "UnknownKind" && error.kind === "no-such-kind"
    && error.message.includes("no-such-kind"));
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: the module loaded anew three times with a disk that gives the real files — (a) unchanged, the known positive;
//        (b) derive-requirements' definition without its line `writer: queue-entries`; (c) its definition naming itself
//        `derive-something`
// input: kindOf("derive-requirements") of each load
// expect: (a) read; (b), (c) refused with InvalidKind naming the kind, carrying error findings on its definition's path
//         under ONE DEFINITION, THREE DRIVERS — for (b) one naming the key writer, for (c) one naming both names
test("kindOf — a definition at odds with the definition schema, or not named as its folder, is refused as InvalidKind with its findings", async () => {
  const path = "kinds/derive-requirements/kind.md";
  const real = readFileSync(new URL(path, new URL("../src/job-catalogue/", import.meta.url)), "utf8");
  assert.ok(real.includes("\nwriter: queue-entries\n") && real.includes("\nname: derive-requirements\n"));

  const unchanged = await load({ disk: diskWith(path, real) });
  assert.equal((await unchanged.module.kindOf("derive-requirements")).writer, "queue-entries");

  for (const [changed, word] of [[real.replace("\nwriter: queue-entries\n", "\n"), "writer"],
    [real.replace("\nname: derive-requirements\n", "\nname: derive-something\n"), "derive-something"]]) {
    const { module } = await load({ disk: diskWith(path, changed) });
    await assert.rejects(module.kindOf("derive-requirements"), (error) => {
      assert.equal(error.name, "InvalidKind");
      assert.equal(error.kind, "derive-requirements");
      assert.ok(error.findings.length >= 1);
      for (const f of error.findings) {
        assert.deepEqual([f.artifact, f.kind, f.rule], [`src/job-catalogue/${path}`, "error", ONE_DEFINITION]);
      }
      assert.ok(error.findings.some((f) => f.what.includes(word)), word);
      return true;
    });
  }
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: the module loaded anew with a disk that gives derive-requirements' definition with its recipe source-excerpt
//        written `source-excerpt?` — a part that may be left out with its reason, as the module file's Data says
// input: kindOf("derive-requirements")
// expect: its recipes read as source-excerpt that may be left out, then the others as they stand
test("kindOf — a recipe whose name ends with ? is read as one whose part may be left out", async () => {
  const path = "kinds/derive-requirements/kind.md";
  const real = readFileSync(new URL(path, new URL("../src/job-catalogue/", import.meta.url)), "utf8");
  assert.ok(real.includes("\n  - source-excerpt\n"), "known positive: the definition lists source-excerpt");
  const { module } = await load({ disk: diskWith(path, real.replace("\n  - source-excerpt\n", "\n  - source-excerpt?\n")) });
  assert.deepEqual((await module.kindOf("derive-requirements")).recipes, [{ name: "source-excerpt", optional: true },
    { name: "spec-with-queues", optional: false }, { name: "chapters-for-requirements", optional: false }]);
});

// guards: ONE DEFINITION, THREE DRIVERS
// given: the module loaded anew as in a browser — no disk, and a fetch that serves the module's own files
// input: kindNames(), and kindOf("propose-items")
// expect: the same names as in Node, and the definition read; every read a fetch of an address under the module's own
//         folder, the index and the kind's three files among them
test("kindNames and kindOf — in a browser, the catalogue reads its own files from its own address", async () => {
  const serve = async (url) => ({ ok: true, status: 200, text: async () => readFileSync(new URL(url), "utf8") });
  const { module, reads } = await load({ disk: undefined, fetch: serve });
  assert.deepEqual(await module.kindNames(), await kindNames());
  assert.equal((await module.kindOf("propose-items")).name, "propose-items");
  const folder = new URL("../src/job-catalogue/", import.meta.url).href;
  assert.ok(reads.length > 0 && reads.every((read) => read.startsWith(`fetch ${folder}`)), reads.join("\n"));
  for (const file of ["kinds.md", "kinds/propose-items/kind.md", "kinds/propose-items/prompt.md",
    "kinds/propose-items/answer.schema.json"]) {
    assert.ok(reads.includes(`fetch ${folder}${file}`), file);
  }
});
