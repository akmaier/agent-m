// The places of the requirements an entry adds — MOD-spec-changes, as the accepted text of docs/architecture/MOD-spec-changes.md states it:
// the places file `NN-<package>.plaetze.md` of an entry (Data: "the title line `# Places — <heading>: entry NN` … and the places table; only for
// an entry that proposes at least one place, never part of the section's text"); `entrySections`' `places` ("those of the candidates `classes`
// add to it as `new` that name a place — of merged candidates, the one whose rule it takes —"); `proposeSection`'s `places` ("with its places
// file where `places` holds a place"); `Queue`'s `places`; `entryView`'s `places` ("for each requirement the impact list names `added`, the
// place its places file proposes, `null` where it proposes none; `blob` is the places file's"); `acceptEntries` ("its places written into
// `docs/groups/requirements.md` … applied with MOD-group-document's `placeItems` to the group file as it stands on the head the commit is
// written on — the empty tree where there is none … the group file is in the commit only where a place was applied. A place that does not
// apply there is not written, and `notPlaced` names it … Each record names in its `places` the blob of the places file shown … If any entry's
// proposal, places file … or section no longer has the blob that was shown, nothing is written"); `applyApproved` (the places "as the entry
// holds them applied as `acceptEntries` applies them … named in `notPlaced`"); `rejectEntry` ("its proposal, its rationale and its places file
// are deleted … neither the target nor `docs/groups/requirements.md` is touched"). For UC-005 step 8, UC-006 steps 2, 5, 6, 3c, 4a, 4c, 5a, 5b,
// UC-019 step 9.
// Run: node --test tests/spec-changes-places.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-005; UC-006; UC-019; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A STALE APPROVAL IS NOT APPLIED; A REJECTION REMOVES THE PROPOSAL
// Guards: THE APPROVED TEXT IS TAKEN VERBATIM; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
// Level: unit
//
// The product is a repository this file holds, behind tests/memory-host.mjs: a SPEC whose section "## 3. Requirements" holds A SAMPLE RULE,
// the group file of requirements holding "3. Requirements" with A SAMPLE RULE and the group Export, and the queue `requirements` whose entry 01
// adds three requirements to that section and whose places file proposes a place for two of them. The expected texts are stated here, never
// read off the code. Each test states its input and its expected result before it runs (given / input / expect); every refusal is shown after
// the same call succeeds on a known positive, or beside it. Nothing reaches the network. The counter-proofs are recorded in the commit of the red tests.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import * as specChanges from "../src/spec-changes/index.mjs";
import { memoryHost } from "./memory-host.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { entrySections, proposeSection, queues, entryView, acceptEntries, applyApproved, rejectEntry } = specChanges;

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0`).update(body).digest("hex");
const NOW = new Date("2026-11-08T10:00:00Z");

const SAMPLE = text("**A SAMPLE RULE** *(Fixture PO)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`");
const REQUIREMENTS = text("## 3. Requirements", "", SAMPLE.trimEnd(), "");
const WRITING = text("## 4. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const SPEC = text("# Fixture product — Specification", "") + REQUIREMENTS + WRITING;
const added = (name, rule) => text(`**${name}** *(Fixture PO)*`, rule, "*Check:* no automatic check; at review");
const PROPOSAL = REQUIREMENTS + added("EXPORT HAS A TITLE PAGE", "An export begins with a title page.") + "\n"
  + added("A CANDIDATE NAMES ITS PLACE", "A new candidate names its place.") + "\n" + added("A RULE OF ITS OWN", "A rule stands for itself.") + "\n";
const GROUPS = text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- 3. Requirements", "  - A SAMPLE RULE", "  - Export");
const QUEUE = "docs/spec-freigaben/requirements";
const PLACES_PATH = `${QUEUE}/01-requirements.plaetze.md`;
const PLACES = text("# Places — Requirements: entry 01", "", "| Requirement | Group | New group |", "|---|---|---|",
  "| EXPORT HAS A TITLE PAGE | 3. Requirements / Export | — |", "| A CANDIDATE NAMES ITS PLACE | 3. Requirements | Derivation |");
const ENTRY_PO = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture",
  "---", "# SRC-fixture-po Fixture PO", "", "A fixture source.");
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-fixture-po | 2026-10-05 | ${"0".repeat(64)} | |`);
const sources = () => ({ links: readDocument(sourceSchemas().links, "docs/sources.md", LINKS), register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-fixture-po.md", ENTRY_PO)] });

// The product: the SPEC, the group file, the sources, and the queue `requirements` with entry 01 and its places file, as `with` lays files over them.
function product(over = {}) {
  const files = { "SPEC.md": SPEC, "docs/groups/requirements.md": GROUPS, "docs/sources.md": LINKS, "docs/sources/SRC-fixture-po.md": ENTRY_PO,
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue requirements · Requirements", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 3. Requirements | — | — |"),
    [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue requirements Requirements", "", "Append-only."),
    [`${QUEUE}/01-requirements.md`]: PROPOSAL,
    [`${QUEUE}/01-requirements.begruendung.md`]: text("# Requirements: adds three", "", "**The change.** Adds three.", "", "**Why.** A fixture.", "", "**Impact list.**", "- none", "", "**Origin.** the fixture."),
    [PLACES_PATH]: PLACES, ...over };
  for (const [path, body] of Object.entries(files)) if (body === null) delete files[path];
  return memoryHost(files);
}
const shown = (over = {}) => ({ queue: QUEUE, entry: 1, proposalBlob: blobOf(PROPOSAL), sectionBlob: blobOf(REQUIREMENTS), placesBlob: blobOf(PLACES),
  places: [{ requirement: "EXPORT HAS A TITLE PAGE", place: { group: ["3. Requirements", "Export"], new: null } },
    { requirement: "A CANDIDATE NAMES ITS PLACE", place: { group: ["3. Requirements"], new: "Derivation" } }], ...over });
const GROUPS_AFTER = text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- 3. Requirements", "  - A SAMPLE RULE",
  "  - Export", "    - EXPORT HAS A TITLE PAGE", "  - Derivation", "    - A CANDIDATE NAMES ITS PLACE");

// ---------------------------------------------------------------- entrySections

const candidate = (name, extra = {}) => ({ name, rule: `${name.toLowerCase()} holds.`, check: "no automatic check; at review", constrains: "product", passage: "§ 1", class: "new", ...extra });
const classOf = (item, extra = {}) => ({ refs: [item.name], from: [item.passage], class: item.class, of: item.of ?? null, decidedBy: "participant", ...extra });

// TST-2026110879 · level: unit · module: MOD-spec-changes
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-005; UC-019
// given: the SPEC above; a draft with EXPORT HAS A TITLE PAGE (new, placed in ["3. Requirements", "Export"]), A RULE WITHOUT A PLACE (new, no place), A BETTER WRITE RULE (a change of A WRITE RULE with a place), and two candidates merged into one class whose rule is that of MERGED FIRST (no place) while MERGED SECOND names one
// input: entrySections with the classes as given and the source SRC-policy
// expect: the section "## 3. Requirements" carries one place, EXPORT HAS A TITLE PAGE's, as a Place { group, new: null }; the section "## 4. Writing" — the change and nothing new — carries none; the change keeps the place of the requirement it changes, and the merged class takes the place of the candidate whose rule it takes, which names none
test("TST-2026110879: entrySections — a section's places are those of the new candidates it adds that name one", () => {
  const titled = candidate("EXPORT HAS A TITLE PAGE", { place: { group: ["3. Requirements", "Export"] } });
  const none = candidate("A RULE WITHOUT A PLACE");
  const change = candidate("A BETTER WRITE RULE", { class: "change", of: "A WRITE RULE", place: { group: ["Elsewhere"] } });
  const first = candidate("MERGED FIRST"), second = candidate("MERGED SECOND", { rule: "merged first holds.", place: { group: ["3. Requirements"] } });
  const classes = [classOf(titled, { of: "A SAMPLE RULE" }), classOf(none, { of: "A SAMPLE RULE" }), classOf(change), { ...classOf(first, { of: "A SAMPLE RULE" }), refs: ["MERGED FIRST", "MERGED SECOND"] }];
  const sections = entrySections(SPEC, { candidates: [titled, none, change, first, second] }, classes, "SRC-policy");
  assert.deepEqual(sections.map((section) => section.anchor), ["## 3. Requirements", "## 4. Writing"], "known positive: both sections are composed");
  assert.deepEqual(sections.map((section) => section.places), [[{ requirement: "EXPORT HAS A TITLE PAGE", place: { group: ["3. Requirements", "Export"], new: null } }], []]);
  assert.ok(!sections[0].text.includes("Export\n") && !sections[0].text.includes("3. Requirements / "), "no place stands in the section's text");
});

// ---------------------------------------------------------------- proposeSection and queues

// TST-2026110880 · level: unit · module: MOD-spec-changes
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-019; UC-005
// given: the product without the queue `requirements`; known positive: an edit of "## 3. Requirements" proposed without places writes the entry, its rationale and its index, and no places file
// input: proposeSection of the same edit with places for EXPORT HAS A TITLE PAGE (["3. Requirements", "Export"]) and A CANDIDATE NAMES ITS PLACE (a new group "Derivation" in ["3. Requirements"]); then queues of the head
// expect: the commit holds docs/spec-freigaben/requirements/01-requirements.plaetze.md with the title line "# Places — Requirements: entry 01" and the places table, one row each, "—" for no new group; the proposal is the section's text alone; SPEC.md and docs/groups/requirements.md are unchanged; queues gives the entry's places { path, blob } and its proposal as 01-requirements.md, and the entry proposed without places has places null
test("TST-2026110880: proposeSection writes the places file beside the entry, and queues reads it back", async () => {
  const change = { target: "SPEC.md", anchor: "## 3. Requirements", until: null, text: PROPOSAL, why: "A fixture.", origin: "the fixture", person: "alice", openedBlob: blobOf(REQUIREMENTS) };
  const without = product({ [`${QUEUE}/index.md`]: null, [`${QUEUE}/entscheidungen.md`]: null, [`${QUEUE}/01-requirements.md`]: null, [`${QUEUE}/01-requirements.begruendung.md`]: null, [PLACES_PATH]: null });
  const plain = await proposeSection(without.host, { ...change, openedHead: (await without.host.readSnapshot("main")).commit });
  assert.equal(plain.entry, 1, "known positive: the entry is written");
  assert.ok(!without.commits()[0].files.some((file) => file.path.endsWith(".plaetze.md")), "an entry without places has no places file");
  const listed = (await queues(await without.host.readSnapshot("main")))[0].entries[0];
  assert.deepEqual([listed.proposal.path, listed.places], [`${QUEUE}/01-requirements.md`, null]);

  const f = product({ [`${QUEUE}/index.md`]: null, [`${QUEUE}/entscheidungen.md`]: null, [`${QUEUE}/01-requirements.md`]: null, [`${QUEUE}/01-requirements.begruendung.md`]: null, [PLACES_PATH]: null });
  const result = await proposeSection(f.host, { ...change, openedHead: (await f.host.readSnapshot("main")).commit, places: shown().places });
  assert.equal(result.entry, 1);
  const written = Object.fromEntries(f.commits()[0].files.map((file) => [file.path, file.text]));
  assert.equal(written[PLACES_PATH], PLACES);
  assert.equal(written[`${QUEUE}/01-requirements.md`], PROPOSAL);
  assert.equal(f.files()["SPEC.md"], SPEC);
  assert.equal(f.files()["docs/groups/requirements.md"], GROUPS);
  const entry = (await queues(await f.host.readSnapshot("main")))[0].entries[0];
  assert.deepEqual([entry.proposal.path, entry.places], [`${QUEUE}/01-requirements.md`, { path: PLACES_PATH, blob: blobOf(PLACES) }]);
});

// ---------------------------------------------------------------- entryView

// TST-2026110881 · level: unit · module: MOD-spec-changes
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-006
// given: the product with entry 01 and its places file, the graph stored for its commit; and the same entry without a places file
// input: entryView of entry 01 of the queue requirements, for each
// expect: places.blob is the places file's blob; places.rows name, in the order the impact list names them added, EXPORT HAS A TITLE PAGE in ["3. Requirements", "Export"], A CANDIDATE NAMES ITS PLACE in a new group "Derivation" in ["3. Requirements"], and A RULE OF ITS OWN with no place (null); without the file, blob null and every row's place null
test("TST-2026110881: entryView gives the place its places file proposes for each requirement the entry adds", async () => {
  const view = await entryView(QUEUE, 1, withStoredGraph(await product().host.readSnapshot("main")));
  assert.deepEqual(view.impact.filter((each) => each.change === "added").map((each) => each.name), ["EXPORT HAS A TITLE PAGE", "A CANDIDATE NAMES ITS PLACE", "A RULE OF ITS OWN"], "known positive: the impact list names the three added");
  assert.deepEqual(view.places, { blob: blobOf(PLACES), rows: [
    { requirement: "EXPORT HAS A TITLE PAGE", place: { group: ["3. Requirements", "Export"], new: null } },
    { requirement: "A CANDIDATE NAMES ITS PLACE", place: { group: ["3. Requirements"], new: "Derivation" } },
    { requirement: "A RULE OF ITS OWN", place: null }] });
  const bare = await entryView(QUEUE, 1, withStoredGraph(await product({ [PLACES_PATH]: null }).host.readSnapshot("main")));
  assert.deepEqual(bare.places, { blob: null, rows: ["EXPORT HAS A TITLE PAGE", "A CANDIDATE NAMES ITS PLACE", "A RULE OF ITS OWN"].map((requirement) => ({ requirement, place: null })) });
});

// ---------------------------------------------------------------- acceptEntries

const filesOfCommit = (f) => Object.fromEntries(f.commits().at(-1).files.map((file) => [file.path, file.text]));

// TST-2026110882 · level: unit · module: MOD-spec-changes
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; THE APPROVED TEXT IS TAKEN VERBATIM; UC-006
// given: the product with entry 01 and its places file
// input: acceptEntries of entry 01 as shown — its two places, and, as the person chose, A RULE OF ITS OWN at the top level, and a place for A SAMPLE RULE, which the entry does not add —
// expect: one commit holding the record, SPEC.md, docs/groups/requirements.md and the decisions; SPEC.md is the SPEC with the section replaced by the proposal byte for byte, no place in it; the group file holds EXPORT HAS A TITLE PAGE in Export, the new group Derivation with A CANDIDATE NAMES ITS PLACE, and A RULE OF ITS OWN at the top level, A SAMPLE RULE where it stood; the record names in `places` the blob of the places file shown; notPlaced is empty
test("TST-2026110882: acceptEntries writes the places as shown into docs/groups/requirements.md in the same commit", async () => {
  const f = product();
  const places = [...shown().places, { requirement: "A RULE OF ITS OWN", place: { group: [], new: null } }, { requirement: "A SAMPLE RULE", place: { group: ["3. Requirements", "Export"], new: null } }];
  const result = await acceptEntries(f.host, [shown({ places })], "alice", NOW, sources());
  assert.ok(result.commit, JSON.stringify(result.refused));
  assert.deepEqual(result.notPlaced, []);
  const written = filesOfCommit(f);
  const record = Object.keys(written).find((path) => path.startsWith("docs/approvals/"));
  assert.deepEqual(Object.keys(written).sort(), [record, "SPEC.md", "docs/groups/requirements.md", `${QUEUE}/entscheidungen.md`].sort());
  assert.equal(written["SPEC.md"], SPEC.replace(REQUIREMENTS, PROPOSAL));
  assert.equal(written["docs/groups/requirements.md"], text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "",
    "- A RULE OF ITS OWN", "- 3. Requirements", "  - A SAMPLE RULE", "  - Export", "    - EXPORT HAS A TITLE PAGE", "  - Derivation", "    - A CANDIDATE NAMES ITS PLACE"));
  assert.equal(readDocument(approvalSchema, record, written[record]).fields.places, blobOf(PLACES));
});

// TST-2026110883 · level: unit · module: MOD-spec-changes
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; UC-006
// given: the product, three ways: without docs/groups/requirements.md; with a group file that changed after the entry was shown — the group Export is gone, a group Derivation already stands in "3. Requirements" —; and with entry 01 shown with no place
// input: acceptEntries of entry 01 as shown, on each
// expect: without the file the commit creates it, with "3. Requirements" made by neither place — so both are not placed, `notPlaced` naming each with its reason and the commit written all the same, the group file not in it —; on the changed file, EXPORT HAS A TITLE PAGE is not placed (its group Export is gone) and named in notPlaced with entry 01 and the queue, while A CANDIDATE NAMES ITS PLACE is placed in the Derivation that stands there, no second one made; with no place shown the group file is not in the commit
test("TST-2026110883: acceptEntries applies places to the group file as it stands on the head, names those that do not apply, and leaves the file out where none applies", async () => {
  const none = product({ "docs/groups/requirements.md": null });
  const first = await acceptEntries(none.host, [shown({ places: [{ requirement: "A RULE OF ITS OWN", place: { group: [], new: "Rules" } }, ...shown().places] })], "alice", NOW, sources());
  assert.ok(first.commit, "known positive: the entry is accepted");
  assert.equal(filesOfCommit(none)["docs/groups/requirements.md"], text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- Rules", "  - A RULE OF ITS OWN"),
    "the commit creates the file with the place that applies");
  assert.deepEqual(first.notPlaced.map(({ queue, entry, requirement }) => [queue, entry, requirement]), [[QUEUE, 1, "EXPORT HAS A TITLE PAGE"], [QUEUE, 1, "A CANDIDATE NAMES ITS PLACE"]]);
  assert.ok(first.notPlaced.every((each) => each.reason.includes("3. Requirements") && each.place), JSON.stringify(first.notPlaced));

  const changed = product({ "docs/groups/requirements.md": text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- 3. Requirements", "  - A SAMPLE RULE", "  - Derivation", "    - AN OLDER RULE") });
  const second = await acceptEntries(changed.host, [shown()], "alice", NOW, sources());
  assert.ok(second.commit);
  assert.deepEqual(second.notPlaced.map(({ requirement, place }) => [requirement, place]), [["EXPORT HAS A TITLE PAGE", { group: ["3. Requirements", "Export"], new: null }]]);
  assert.equal(filesOfCommit(changed)["docs/groups/requirements.md"], text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- 3. Requirements", "  - A SAMPLE RULE", "  - Derivation", "    - AN OLDER RULE", "    - A CANDIDATE NAMES ITS PLACE"));

  const unplaced = product();
  const third = await acceptEntries(unplaced.host, [shown({ places: [] })], "alice", NOW, sources());
  assert.ok(third.commit);
  assert.ok(!("docs/groups/requirements.md" in filesOfCommit(unplaced)), "no place applied: the group file is not in the commit");
  assert.equal(unplaced.files()["docs/groups/requirements.md"], GROUPS);
});

// TST-2026110884 · level: unit · module: MOD-spec-changes
// guards: A STALE APPROVAL IS NOT APPLIED; UC-006
// given: the product with entry 01 and its places file; known positive: shown with the places file's blob, it is accepted (TST-2026110882)
// input: acceptEntries of entry 01 shown with the blob of another places text; and shown with no places file (placesBlob null) while the entry has one; and, on a product whose entry has no places file, shown with a places blob
// expect: each refused, entry 01 named with a reason that its places changed after they were shown, and nothing written
test("TST-2026110884: acceptEntries refuses an entry whose places file no longer has the blob shown", async () => {
  for (const [f, each] of [[product(), shown({ placesBlob: blobOf("another text\n") })], [product(), shown({ placesBlob: null })], [product({ [PLACES_PATH]: null }), shown()]]) {
    const result = await acceptEntries(f.host, [each], "alice", NOW, sources());
    assert.deepEqual(result.refused?.map(({ queue, entry }) => [queue, entry]), [[QUEUE, 1]], JSON.stringify(result));
    assert.match(result.refused[0].reason, /places/);
    assert.deepEqual(f.commits(), []);
  }
});

// ---------------------------------------------------------------- applyApproved

const recordText = (placesBlob) => text("kind: spec", `queue: ${QUEUE}`, "entry: 01", `proposal: ${QUEUE}/01-requirements.md`, `blob: ${blobOf(PROPOSAL)}`, "target: SPEC.md",
  "anchor: ## 3. Requirements", `section: ${blobOf(REQUIREMENTS)}`, ...(placesBlob ? [`places: ${placesBlob}`] : []));
const RECORD = `docs/approvals/spec-requirements-01-${blobOf(PROPOSAL).slice(0, 12)}.md`;

// TST-2026110885 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED; UC-006
// given: the product with entry 01, its places file and a record committed without a token naming the places file's blob; the same with a group file whose group Export is gone; with a record naming another places blob; with a record naming none
// input: applyApproved of each snapshot
// expect: the first applies the record: files hold SPEC.md replaced and docs/groups/requirements.md with the entry's places as acceptEntries writes them (GROUPS_AFTER), notPlaced empty; the second names EXPORT HAS A TITLE PAGE in notPlaced with the record and writes A CANDIDATE NAMES ITS PLACE; the third and the fourth are refused, naming the places, and change nothing
test("TST-2026110885: applyApproved writes the places as the entry holds them, names those that do not apply, and refuses a stale places file", async () => {
  const applied = await applyApproved(await product({ [RECORD]: recordText(blobOf(PLACES)) }).host.readSnapshot("main"), NOW);
  assert.deepEqual([applied.applied, applied.refused, applied.notPlaced], [[RECORD], [], []]);
  assert.equal(applied.files["SPEC.md"], SPEC.replace(REQUIREMENTS, PROPOSAL));
  assert.equal(applied.files["docs/groups/requirements.md"], GROUPS_AFTER);

  const gone = await applyApproved(await product({ [RECORD]: recordText(blobOf(PLACES)), "docs/groups/requirements.md": text("# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "", "- 3. Requirements", "  - A SAMPLE RULE") }).host.readSnapshot("main"), NOW);
  assert.deepEqual(gone.applied, [RECORD]);
  assert.deepEqual(gone.notPlaced.map(({ record, requirement }) => [record, requirement]), [[RECORD, "EXPORT HAS A TITLE PAGE"]]);
  assert.match(gone.files["docs/groups/requirements.md"], /  - Derivation\n    - A CANDIDATE NAMES ITS PLACE\n$/);

  for (const record of [recordText(blobOf("another text\n")), recordText(null)]) {
    const stale = await applyApproved(await product({ [RECORD]: record }).host.readSnapshot("main"), NOW);
    assert.deepEqual(stale.applied, []);
    assert.equal(stale.refused.length, 1);
    assert.match(stale.refused[0].reason, /places/);
    assert.deepEqual(stale.files, {});
  }
});

// ---------------------------------------------------------------- rejectEntry

// TST-2026110886 · level: unit · module: MOD-spec-changes
// guards: A REJECTION REMOVES THE PROPOSAL; UC-006
// given: the product whose queue requirements holds entry 01 with its places file, and an entry 02 of another section so that the queue stays
// input: rejectEntry of entry 01 as shown, with a reason
// expect: one commit that deletes the proposal, the rationale and the places file of entry 01 and rewrites the index without its row; SPEC.md and docs/groups/requirements.md are not in it and stay as they were
test("TST-2026110886: rejectEntry deletes the entry's places file with it and touches neither the SPEC nor the group file", async () => {
  const second = text("## 4. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file entirely.", "*Check:* no automatic check; at review");
  const f = product({
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue requirements · Requirements", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 3. Requirements | — | — |", "| 02 | `SPEC.md` | ## 4. Writing | — | — |"),
    [`${QUEUE}/02-requirements.md`]: second });
  const result = await rejectEntry(f.host, { queue: QUEUE, entry: 1, proposalBlob: blobOf(PROPOSAL), sectionBlob: blobOf(REQUIREMENTS) }, "alice", "Not needed.");
  assert.ok(result.commit);
  const [commit] = f.commits();
  assert.deepEqual(commit.files.filter((file) => file.delete).map((file) => file.path).sort(), [`${QUEUE}/01-requirements.begruendung.md`, `${QUEUE}/01-requirements.md`, PLACES_PATH].sort());
  assert.ok(!commit.files.some((file) => file.path === "SPEC.md" || file.path === "docs/groups/requirements.md"));
  assert.deepEqual([f.files()["SPEC.md"], f.files()["docs/groups/requirements.md"], f.files()[PLACES_PATH]], [SPEC, GROUPS, undefined]);
});
