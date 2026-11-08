// A change of requirements by prompt names the person's account as its source — MOD-spec-changes' precondition `person-source` and writer `queue-entries`, as
// docs/architecture/MOD-spec-changes.md states them: "precondition `person-source` — an error finding under `THE PERSON WHO PROMPTS IS A SOURCE` when the job's
// parameter `source` is missing or blank — the person's account `<server>/<account>` could not be told —, whose `fix` names what is required: an instance repository
// whose address names its owner, the account Agent M takes; none otherwise"; "writer `queue-entries` — … One entry per section the candidates touch, as
// `entrySections` composes it with the job's `source`"; and MOD-source-register's sourceFindings, by which an entry is accepted, over "a source the product links or
// an account". MOD-job-catalogue: "A job of `change-requirements` takes as its parameter `source` the account `<server>/<account>` of the person who starts it".
// Run: node --test tests/spec-changes-account-source.test.mjs
//
// Module: MOD-spec-changes
// Guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE; UC-019
// Level: unit
//
// The product is a fixture this file builds, never Agent M's own: a SPEC of one section, and a links file that links no source; the instance's register holds no
// entry of the account. The writer is called as the job runner calls a writer, with a result and a context; the host records every commit it is asked for. Each
// test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { entrySections, specStrategies } from "../src/spec-changes/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { parseSpec } from "../src/spec-document/index.mjs";
import { sourceFindings, sourceSchemas } from "../src/source-register/index.mjs";

const RULE = "THE PERSON WHO PROMPTS IS A SOURCE";
const ACCOUNT = "github.com/alice";
const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const SPEC = text("# Fixture product — Specification", "", "## 1. Reading", "", "**A SAMPLE RULE** *(Product Owner)*", "A reader reads a file whole.",
  "*Check:* `tests/sample.test.mjs`");
const NO_LINKS = text("# Requirement sources of the fixture", "", "| Source | Version | Hash | Part |", "|---|---|---|---|");
const snapshotOf = (files) => ({ paths: Object.keys(files), blob: (path) => (Object.hasOwn(files, path) ? gitBlob(files[path]) : null),
  read: async (path) => (Object.hasOwn(files, path) ? files[path] : null), commit: "h".repeat(40) });
const hostOf = (name) => {
  const commits = [];
  return { name, commits, repositoryInfo: async () => ({ defaultBranch: "main", canWrite: true }),
    readSnapshot: async () => { throw new Error("the writer reads the snapshots the context carries"); },
    commitFiles: async (change) => { commits.push(change); return { commit: `${name}-commit-${commits.length}`.padEnd(40, "0"), url: "https://example.test/commit" }; } };
};
function contextWith(params) {
  const product = { address: "https://github.com/alice/product", snapshot: snapshotOf({ "SPEC.md": SPEC, "docs/sources.md": NO_LINKS }), host: hostOf("product") };
  const instance = { snapshot: snapshotOf({ "SPEC.md": text("# Fixture instance — Specification") }), host: hostOf("instance"), checkout: null };
  return { kind: { name: "change-requirements" }, params, product, instance, now: new Date("2026-11-08T09:00:00Z"), agentM: { version: "unreleased", commit: "c".repeat(40) },
    jobId: null, person: "alice", participants: [], connect: async () => { throw new Error("no repository is opened here"); } };
}
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, capabilities: ["draft text"], place: "this machine", route: "endpoint ep" };
const CHANGE = { name: "A SAMPLE RULE", rule: "A reader reads a file whole, or says why not.", check: "`tests/sample.test.mjs`", constrains: "product", passage: "the instruction",
  class: "change", of: "A SAMPLE RULE" };
const resultOf = (candidates) => ({ draft: { candidates }, raw: null, drafter: DRAFTER, rounds: [{ number: 1, findings: [] }], remaining: [], forPerson: [], stepFindings: [],
  classes: candidates.map((each) => ({ refs: [each.name], from: [each.passage], class: each.class, of: each.of, decidedBy: "participant" })), stoppedBecause: "passed", gate: null,
  usage: [], written: null });
const precondition = specStrategies.preconditions["person-source"];

// TST-2026110809 · level: unit · module: MOD-spec-changes
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: the precondition person-source
// input: a job whose parameter `source` is the account github.com/alice; and jobs whose `source` is missing, blank, or spaces only
// expect: no finding for the account; for each other, one error under THE PERSON WHO PROMPTS IS A SOURCE whose fix names what is required — an instance repository
//   whose address names its owner — and no longer the register or a link (#library, #sources)
test("TST-2026110809: person-source refuses a change without the person's account, and names the owner of the instance's repository as what is required", async () => {
  assert.equal(await precondition(contextWith({ source: ACCOUNT })), null, "the account is a source");
  for (const params of [{}, { source: "" }, { source: "   " }]) {
    const found = await precondition(contextWith(params));
    assert.equal(found?.kind, "error", JSON.stringify(params));
    assert.equal(found.rule, RULE);
    assert.match(found.fix, /owner/);
    assert.match(found.fix, /repository/);
    assert.doesNotMatch(`${found.what} ${found.fix}`, /#library|#sources|register the person/);
  }
});

// TST-2026110810 · level: unit · module: MOD-spec-changes · MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE; UC-019
// given: the fixture product, which links no source, and an instance whose register holds no entry; a result of change-requirements with one change of A SAMPLE RULE
// input: the writer queue-entries with the job's parameter `source` github.com/alice; then sourceFindings of the requirements of the entry it wrote, over the product's
//   empty links and the empty register; and, as the known positive that the same check refuses, of the entry with the account replaced by SRC-nowhere
// expect: one commit with one entry, whose A SAMPLE RULE names the account github.com/alice alone among its sources — no passage after it, though the draft
//   holds one (MOD-spec-changes, entrySections: "a person's account … stands alone whatever passage the draft holds") —; no finding for it; one error under
//   A REQUIREMENT HAS A REGISTERED SOURCE for SRC-nowhere
test("TST-2026110810: a change by prompt is written with the person's account as its source, and that entry passes the source check without a link", async () => {
  const context = contextWith({ source: ACCOUNT });
  await specStrategies.writers["queue-entries"](resultOf([CHANGE]), context);
  assert.equal(context.product.host.commits.length, 1);
  const entry = context.product.host.commits[0].files.find((file) => /^docs\/spec-freigaben\/reading\/01-reading\.md$/.test(file.path))?.text ?? "";
  assert.ok(entry.includes(`**A SAMPLE RULE** *(Product Owner; ${ACCOUNT})*`), entry);
  assert.ok(!entry.includes(`${ACCOUNT}, `), entry);
  const { links, entry: entrySchema } = sourceSchemas();
  assert.ok(entrySchema);
  const linked = readDocument(links, "docs/sources.md", NO_LINKS);
  const checked = (body) => sourceFindings([...parseSpec(body).requirements.values()], linked, []).map((each) => `${each.kind} ${each.rule}`);
  assert.deepEqual(checked(entry.replace(`Product Owner; ${ACCOUNT}`, "SRC-nowhere").replace(ACCOUNT, "SRC-nowhere")),
    ["error A REQUIREMENT HAS A REGISTERED SOURCE"], "known positive: an item neither linked nor an account fails");
  assert.deepEqual(checked(entry), []);
});

const NEW = { name: "A NEW SAMPLE RULE", rule: "A reader names the file it reads.", check: "`tests/sample.test.mjs`", constrains: "product", passage: "the instruction",
  class: "new", of: null };

// TST-1792040 · level: unit · module: MOD-spec-changes · MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE
// given: the fixture SPEC; a draft of one new candidate whose class names the passage "the instruction"
// input: entrySections with the job's source github.com/alice, the person's account; and, as the counter-proof that a passage stays a locator into a
//   registered source, with the source SRC-sample-book and the passage "ch. 3"
// expect: the account stands alone as the source, *(github.com/alice)*, with no passage; the registered source is followed by its passage, *(SRC-sample-book, ch. 3)*
test("TST-1792040: entrySections writes a person's account alone, whatever passage the draft holds; a registered source keeps its passage", () => {
  const sectionOf = (source, passage) => entrySections(SPEC, { candidates: [{ ...NEW, passage }] },
    [{ refs: [NEW.name], from: [passage], class: "new", of: null, decidedBy: "participant" }], source)[0].text;
  const byPrompt = sectionOf(ACCOUNT, "the instruction");
  assert.ok(byPrompt.includes(`**A NEW SAMPLE RULE** *(${ACCOUNT})*`), byPrompt);
  assert.ok(!byPrompt.includes("the instruction"), byPrompt);
  assert.ok(sectionOf("SRC-sample-book", "ch. 3").includes("**A NEW SAMPLE RULE** *(SRC-sample-book, ch. 3)*"), "a registered source keeps its passage");
});

// TST-1792041 · level: unit · module: MOD-spec-changes
// guards: THE PERSON WHO PROMPTS IS A SOURCE; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the fixture product; a result of change-requirements with one change whose class names the passage "the instruction"
// input: the writer queue-entries with the job's parameter `source` github.com/alice; the rationale of the entry it wrote
// expect: its **Origin.** names the account as the source and names no passage — neither the word "passage" nor "the instruction"
test("TST-1792041: the rationale of a change by prompt names the account as its origin and no passage of the instruction", async () => {
  const context = contextWith({ source: ACCOUNT });
  await specStrategies.writers["queue-entries"](resultOf([CHANGE]), context);
  const rationale = context.product.host.commits[0].files.find((file) => file.path.endsWith(".begruendung.md"))?.text ?? "";
  const origin = rationale.split("\n").find((each) => each.startsWith("**Origin.**")) ?? "";
  assert.ok(origin.includes(`Source ${ACCOUNT}`), rationale);
  assert.doesNotMatch(origin, /passage|the instruction/, origin);
});
