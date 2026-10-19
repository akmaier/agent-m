// MOD-settings-pages' route `sources` — a product's Requirement sources (ITM-590), as docs/architecture/MOD-settings-pages.md and UC-015 state them: the library's sources with kind,
// authority and versions; ticking the sources that apply, choosing the version — preset to the newest — and naming the part, suggested from the entry's `## Parts`; Save, which
// writes the product's `docs/sources.md` in one commit as the person's own; before a link is removed, the requirements that name its source are listed; a link to the library and
// one back; a restricted source links like any other; the folded What is this? is MOD-site-frame's topic requirement-sources. The route is rendered into the fixture DOM of
// tests/settings-pages-harness.mjs over MOD-repository-hosts' real GitHub host (connect) for the instance and for the product, answered by a fake of fetch over repositories that
// hold files (tests/settings-pages-sources.d/github.mjs); nothing reaches the network. Run: node --test tests/settings-pages-sources.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-015; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A FORM OPENS WITH ITS FIRST FIELD FOCUSED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; THE PAGE NAMES WHERE IT SENDS
// Level: unit
//
// Each test names its input and states its expected result in its own text (given / input / expect) before it runs; no expected value is read from a document, and none from the
// code. Where the texts leave a reading open, the test states the reading it takes, and the pull request names it with its source:
//   - A version can be linked when the register's row for it records its version hash; a source with no such version cannot be ticked.
//   - The version is preset to the version the link names, else to the last row of the entry's `## Versions`.
//   - A part is suggested for each line of the entry's `## Parts` with the marker of its list item taken off; the part is free text; an empty part is written as the empty cell.
//   - A row the person leaves as it is keeps its cells as the file has them; Save with nothing changed writes nothing.
//   - The requirements that name a source are those MOD-source-register's affectedRequirements gives for the register and the entry's identifier: those one of whose source items names the entry by its identifier, title or a standard's designation.
// The counter-proofs (a planted fault in src/settings-pages/ and the test's failing result) are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byTag, click as clickOnce, turn } from "./settings-pages-harness.mjs";
import { attachedTarget, buttonLabelled, freshStore, tick, untick } from "./settings-pages-setup.d/dom.mjs";
import { githubWorld, installWorld, isWrite, registerEntry, sectionOf, settled, withClass } from "./settings-pages-sources.d/github.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { connect, parseAddress } = await import("../src/repository-hosts/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "sources");
const library = view.routes.find((candidate) => candidate.name === "library");

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "https://github.com/alice/thesis-tool";
const PRODUCT_REPO = "alice/thesis-tool";
const H = { v1: "1".repeat(64), v2: "2".repeat(64), iec: "3".repeat(64), handbook: "4".repeat(64), old: "5".repeat(64) };

const REGISTER = {
  "docs/sources/SRC-act-pending.md": registerEntry({ id: "SRC-act-pending", title: "Pending Act", kind: "regulation", authority: "normative", licence: "may be republished — EU law", versions: [] }),
  "docs/sources/SRC-ai-act.md": registerEntry({ id: "SRC-ai-act", title: "EU AI Act", kind: "regulation", authority: "normative", licence: "may be republished — EU law",
    versions: [{ version: "v1", date: "2025-08-02", hash: H.v1 }, { version: "v2", date: "2026-02-02", hash: H.v2 }], parts: ["risk category: high-risk", "risk category: limited risk"] }),
  "docs/sources/SRC-handbook.md": registerEntry({ id: "SRC-handbook", title: "Faculty handbook", kind: "document", authority: "informational", licence: "restricted — internal",
    versions: [{ version: "1", date: "2026-09-01", hash: H.handbook }] }),
  "docs/sources/SRC-iec-62304.md": registerEntry({ id: "SRC-iec-62304", title: "IEC 62304", kind: "standard", authority: "normative", licence: "restricted — the publisher's terms",
    designation: "IEC 62304:2006+AMD1:2015", versions: [{ version: "IEC 62304:2006+AMD1:2015", date: "2026-10-02", hash: H.iec }],
    parts: ["safety class A", "safety class B", "safety class C"] }),
};
const SPEC = [
  "# Thesis tool — Specification", "", "## 1. Export", "",
  "**EXPORT IS A PDF** *(SRC-ai-act, Art. 13; PO B. Example)*", "The export is one PDF file.", "*Check:* `tests/export.test.mjs`", "",
  "**TITLE PAGE NAMES THE AUTHOR** *(SRC-ai-act; SRC-iec-62304, class B)*", "The title page names the author.", "*Check:* `tests/title.test.mjs`", "",
  "**NOTHING IS NAMED** *(PO B. Example)*", "The tool starts.", "*Check:* `tests/start.test.mjs`", ""].join("\n");
const links = (...rows) => ["# Requirement sources of thesis-tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", ...rows, ""].join("\n");
const AI_V1 = `| SRC-ai-act | v1 | ${H.v1} | risk category: high-risk |`;
const IEC_B = `| SRC-iec-62304 | IEC 62304:2006+AMD1:2015 | ${H.iec} | safety class B |`;
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";

// The page: a world of the two repositories, the real hosts over it, a context as the frame hands it, and the route rendered.
async function open(t, { productFiles = { "SPEC.md": SPEC }, register = REGISTER, product = true, instanceKnown = true } = {}) {
  const world = githubWorld({ ...(instanceKnown ? { [INSTANCE]: { files: register } } : {}), [PRODUCT_REPO]: { files: productFiles } });
  installWorld(t, world);
  current = world;
  const went = [];
  const context = { page: "review", instance: { repository: INSTANCE, host: connect(parseAddress(`https://github.com/${INSTANCE}`), { token: TOKEN }) },
    product: product ? { address: PRODUCT, kind: "github", host: connect(parseAddress(PRODUCT), { token: PRODUCT_TOKEN }) } : null,
    store: freshStore(), went, go(name, params) { went.push([name, params]); } };
  const target = attachedTarget();
  await route.render(target, context, {});
  return { world, context, target, went };
}
// A person's click, and the turns a save through the host takes to finish (its reads, its tree, its commit and the move of the branch).
let current = null; // the world of the page opened last
const click = async (button) => { await clickOnce(button); await settled(current); };
const field = (target, id, className) => withClass(sectionOf(target, id), className)[0];
const save = (target) => withClass(target, "sources-save")[0];
const result = (target) => withClass(target, "sources-result")[0].textContent;
const choose = async (select, value) => { select.value = value; select.dispatchEvent(new Event("change")); await turn(); };
const productCommits = (page) => page.world.commits(PRODUCT_REPO);

// TST-590301 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 1; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// given: the library holds SRC-act-pending (no version yet), SRC-ai-act (versions v1 of 2025-08-02 and v2 of 2026-02-02), SRC-handbook and SRC-iec-62304; the product has no docs/sources.md
// input: render the route sources for the product
// expect: the page is headed "Requirement sources"; one section for each source in the order of the register's files, SRC-act-pending, SRC-ai-act, SRC-handbook, SRC-iec-62304, none ticked, each with its line "<id> · <kind> · <authority>"; SRC-ai-act offers the versions "v1 · 2025-08-02" and "v2 · 2026-02-02" and is preset to v2 with the line "Hash of this version: " and the 64 digits 2; SRC-act-pending cannot be ticked and says "No version is recorded yet; a source without a version cannot be linked."; the focus is on the box of SRC-ai-act, the first that can be ticked
test("sources — the library's sources are listed with kind, authority and versions, none ticked, the newest version preset, and the focus on the first box that can be ticked", async (t) => {
  const { target } = await open(t);
  assert.equal(byTag(target, "h2")[0].textContent, "Requirement sources");
  const sections = withClass(target, "sources-entry");
  assert.deepEqual(sections.map((section) => section.getAttribute("data-source")), ["SRC-act-pending", "SRC-ai-act", "SRC-handbook", "SRC-iec-62304"]);
  assert.deepEqual(sections.map((section) => withClass(section, "sources-meta")[0].textContent), [
    "SRC-act-pending · regulation · normative", "SRC-ai-act · regulation · normative", "SRC-handbook · document · informational", "SRC-iec-62304 · standard · normative"]);
  assert.deepEqual(sections.map((section) => withClass(section, "sources-tick")[0].checked), [false, false, false, false]);
  const select = field(target, "SRC-ai-act", "sources-version");
  assert.deepEqual(byTag(select, "option").map((option) => [option.value, option.textContent]), [["v1", "v1 · 2025-08-02"], ["v2", "v2 · 2026-02-02"]]);
  assert.equal(select.value, "v2");
  assert.equal(field(target, "SRC-ai-act", "sources-hash").textContent, `Hash of this version: ${"2".repeat(64)}`);
  assert.equal(field(target, "SRC-act-pending", "sources-tick").disabled, true);
  assert.equal(field(target, "SRC-act-pending", "sources-no-version").textContent, "No version is recorded yet; a source without a version cannot be linked.");
  assert.equal(document.activeElement, field(target, "SRC-ai-act", "sources-tick"));
});

// TST-590302 · level: unit · module: MOD-settings-pages
// guards: UC-015 steps 2 to 4; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION
// given: the same library; the product has SPEC.md and no docs/sources.md
// input: tick SRC-ai-act, choose v1, type the part "risk category: high-risk"; tick SRC-iec-62304 and press the suggested part "safety class B"; press Save
// expect: one commit in the product's repository and none in the instance's, holding exactly the file docs/sources.md, with the text "# Requirement sources of thesis-tool", a blank line, the table "| Source | Version | Hash | Part |" over "|---|---|---|---|" with the row SRC-ai-act, v1, the 64 digits 1, "risk category: high-risk" and the row SRC-iec-62304, "IEC 62304:2006+AMD1:2015", the 64 digits 3, "safety class B", and a line end; the commit is made with the product's token; the result reads "✓ docs/sources.md is saved in https://github.com/alice/thesis-tool (commit " and the first seven characters of the commit and ")."
test("sources — ticking sources, choosing a version and a part and pressing Save write docs/sources.md in one commit with the version's hash", async (t) => {
  const page = await open(t);
  const { target } = page;
  await tick(field(target, "SRC-ai-act", "sources-tick"));
  await choose(field(target, "SRC-ai-act", "sources-version"), "v1");
  field(target, "SRC-ai-act", "sources-part").value = "risk category: high-risk";
  await tick(field(target, "SRC-iec-62304", "sources-tick"));
  const suggested = withClass(sectionOf(target, "SRC-iec-62304"), "sources-part-suggestion").find((button) => button.textContent === "safety class B");
  await click(suggested);
  await click(save(target));
  assert.equal(productCommits(page).length, 1);
  assert.equal(page.world.commits(INSTANCE).length, 0);
  const commit = productCommits(page)[0];
  assert.deepEqual(Object.keys(commit.files), ["docs/sources.md"]);
  assert.equal(commit.files["docs/sources.md"], links(AI_V1, IEC_B));
  assert.equal(commit.authorization, `Bearer ${PRODUCT_TOKEN}`);
  assert.equal(result(target), `✓ docs/sources.md is saved in ${PRODUCT} (commit ${commit.sha.slice(0, 7)}).`);
});

// TST-590303 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 3; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: the library with SRC-ai-act at v1 (the digits 1) and v2 (the digits 2); no docs/sources.md
// input: tick SRC-ai-act, leave the version at its preset v2 and press Save; then, in a second page, choose v1 before pressing Save
// expect: the first page writes the row with v2 and the 64 digits 2; the second writes v1 with the 64 digits 1; choosing a version changes the line "Hash of this version: " to that version's digits
test("sources — the link records the chosen version and that version's hash", async (t) => {
  const first = await open(t);
  await tick(field(first.target, "SRC-ai-act", "sources-tick"));
  await click(save(first.target));
  assert.match(productCommits(first)[0].files["docs/sources.md"], new RegExp(`\\| SRC-ai-act \\| v2 \\| ${"2".repeat(64)} \\| — \\|\\n$`));
  const second = await open(t);
  await tick(field(second.target, "SRC-ai-act", "sources-tick"));
  await choose(field(second.target, "SRC-ai-act", "sources-version"), "v1");
  assert.equal(field(second.target, "SRC-ai-act", "sources-hash").textContent, `Hash of this version: ${"1".repeat(64)}`);
  await click(save(second.target));
  assert.match(productCommits(second)[0].files["docs/sources.md"], new RegExp(`\\| SRC-ai-act \\| v1 \\| ${"1".repeat(64)} \\| — \\|\\n$`));
});

// TST-590304 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 3; A LINK NAMES THE PART THAT APPLIES
// given: SRC-ai-act with the parts "risk category: high-risk" and "risk category: limited risk", SRC-iec-62304 with "safety class A", "safety class B" and "safety class C", SRC-handbook with none
// input: render the route; press the suggestion "safety class C" of SRC-iec-62304; type into SRC-handbook the part "Chapter 3, Annex II" and Save with SRC-iec-62304 and SRC-handbook ticked
// expect: the suggestions of SRC-ai-act read "risk category: high-risk", "risk category: limited risk"; of SRC-iec-62304 "safety class A", "safety class B", "safety class C"; SRC-handbook has none; pressing one puts its text in the part field; the file holds the part "safety class C" for SRC-iec-62304 and "Chapter 3, Annex II" for SRC-handbook, as typed
test("sources — parts are suggested from the entry's Parts, and any text is allowed", async (t) => {
  const page = await open(t);
  const { target } = page;
  const suggestions = (id) => withClass(sectionOf(target, id), "sources-part-suggestion").map((button) => button.textContent);
  assert.deepEqual(suggestions("SRC-ai-act"), ["risk category: high-risk", "risk category: limited risk"]);
  assert.deepEqual(suggestions("SRC-iec-62304"), ["safety class A", "safety class B", "safety class C"]);
  assert.deepEqual(suggestions("SRC-handbook"), []);
  await click(withClass(sectionOf(target, "SRC-iec-62304"), "sources-part-suggestion").find((button) => button.textContent === "safety class C"));
  assert.equal(field(target, "SRC-iec-62304", "sources-part").value, "safety class C");
  field(target, "SRC-handbook", "sources-part").value = "Chapter 3, Annex II";
  await tick(field(target, "SRC-iec-62304", "sources-tick"));
  await tick(field(target, "SRC-handbook", "sources-tick"));
  await click(save(target));
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(`| SRC-handbook | 1 | ${H.handbook} | Chapter 3, Annex II |`,
    `| SRC-iec-62304 | IEC 62304:2006+AMD1:2015 | ${H.iec} | safety class C |`));
});

// TST-590305 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 2, 2b; A REQUIREMENT HAS A REGISTERED SOURCE
// given: the product's docs/sources.md links SRC-ai-act (v1, "risk category: high-risk") and SRC-iec-62304 ("safety class B"); its SPEC.md has the requirements EXPORT IS A PDF (sources "SRC-ai-act, Art. 13" and "PO B. Example"), TITLE PAGE NAMES THE AUTHOR ("SRC-ai-act" and "SRC-iec-62304, class B") and NOTHING IS NAMED
// input: render the route; untick SRC-ai-act; tick it again; untick SRC-iec-62304
// expect: both linked sources are ticked, SRC-ai-act at v1 with its hash and part, SRC-iec-62304 with "safety class B"; on the first untick the note of SRC-ai-act reads "Removing SRC-ai-act: the requirements that name it — EXPORT IS A PDF, TITLE PAGE NAMES THE AUTHOR — would lose that source. They are listed, not deleted."; on the tick again it is empty; on the untick of SRC-iec-62304 its note reads "Removing SRC-iec-62304: the requirements that name it — TITLE PAGE NAMES THE AUTHOR — would lose that source. They are listed, not deleted."; nothing has been committed
test("sources — a linked source is ticked with its version and part, and unticking it lists the requirements that name it before anything is saved", async (t) => {
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(AI_V1, IEC_B) } });
  const { target } = page;
  assert.deepEqual([field(target, "SRC-ai-act", "sources-tick").checked, field(target, "SRC-iec-62304", "sources-tick").checked, field(target, "SRC-handbook", "sources-tick").checked], [true, true, false]);
  assert.equal(field(target, "SRC-ai-act", "sources-version").value, "v1");
  assert.equal(field(target, "SRC-ai-act", "sources-hash").textContent, `Hash of this version: ${"1".repeat(64)}`);
  assert.equal(field(target, "SRC-ai-act", "sources-part").value, "risk category: high-risk");
  assert.equal(field(target, "SRC-iec-62304", "sources-part").value, "safety class B");
  await untick(field(target, "SRC-ai-act", "sources-tick"));
  assert.equal(field(target, "SRC-ai-act", "sources-removal").textContent,
    "Removing SRC-ai-act: the requirements that name it — EXPORT IS A PDF, TITLE PAGE NAMES THE AUTHOR — would lose that source. They are listed, not deleted.");
  await tick(field(target, "SRC-ai-act", "sources-tick"));
  assert.equal(field(target, "SRC-ai-act", "sources-removal").textContent, "");
  await untick(field(target, "SRC-iec-62304", "sources-tick"));
  assert.equal(field(target, "SRC-iec-62304", "sources-removal").textContent,
    "Removing SRC-iec-62304: the requirements that name it — TITLE PAGE NAMES THE AUTHOR — would lose that source. They are listed, not deleted.");
  assert.equal(productCommits(page).length, 0);
});

// TST-590306 · level: unit · module: MOD-settings-pages
// guards: UC-015 2b; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: docs/sources.md links SRC-ai-act and SRC-iec-62304 as in the test before, and SRC-handbook (version 1, part "all") which no requirement names
// input: untick SRC-handbook; then untick SRC-ai-act and press Save
// expect: the note of SRC-handbook reads "Removing SRC-handbook: no requirement of this product names it."; Save writes one commit with the title, the table header and only the row of SRC-iec-62304 as the file had it, and the result reads "✓ docs/sources.md is saved"; the requirements are not touched: SPEC.md is not among the committed files
test("sources — a removed link leaves the file with the other rows as they were, and the requirements untouched", async (t) => {
  const handbook = `| SRC-handbook | 1 | ${H.handbook} | all |`;
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(AI_V1, IEC_B, handbook) } });
  const { target } = page;
  await untick(field(target, "SRC-handbook", "sources-tick"));
  assert.equal(field(target, "SRC-handbook", "sources-removal").textContent, "Removing SRC-handbook: no requirement of this product names it.");
  await untick(field(target, "SRC-ai-act", "sources-tick"));
  await click(save(target));
  assert.equal(productCommits(page).length, 1);
  assert.deepEqual(Object.keys(productCommits(page)[0].files), ["docs/sources.md"]);
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(IEC_B));
  assert.match(result(target), /^✓ docs\/sources\.md is saved/);
  assert.equal(page.world.files(PRODUCT_REPO)["SPEC.md"], SPEC);
});

// TST-590307 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 3; A LINK NAMES THE PART THAT APPLIES
// given: docs/sources.md links SRC-ai-act with the version written in backticks, `v1`, and no part, and SRC-iec-62304 as before
// input: type the part "risk category: limited risk" for SRC-ai-act and press Save
// expect: one commit; SRC-ai-act's row keeps its version as the file had it, `v1`, and its hash, and has the part; SRC-iec-62304's row is as it was
test("sources — a row the person only changes the part of keeps its other cells as the file has them", async (t) => {
  const quoted = `| SRC-ai-act | \`v1\` | ${H.v1} | |`;
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(quoted, IEC_B) } });
  assert.equal(field(page.target, "SRC-ai-act", "sources-part").value, "");
  field(page.target, "SRC-ai-act", "sources-part").value = "risk category: limited risk";
  await click(save(page.target));
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(`| SRC-ai-act | \`v1\` | ${H.v1} | risk category: limited risk |`, IEC_B));
});

// TST-590308 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 3; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: docs/sources.md links SRC-ai-act at "v0" with the digits 5, a version the library does not record, and SRC-iec-62304
// input: render the route; type a part for SRC-ai-act; press Save
// expect: SRC-ai-act offers "v0 · not recorded in the library" besides v1 and v2 and is preset to v0, with the line "Hash of this version: " and the digits 5; the file keeps v0 and the digits 5 with the part
test("sources — a link that names a version the library does not record keeps it as a choice of its own, with the hash its link records", async (t) => {
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(`| SRC-ai-act | v0 | ${H.old} | |`, IEC_B) } });
  const select = field(page.target, "SRC-ai-act", "sources-version");
  assert.deepEqual(byTag(select, "option").map((option) => option.textContent), ["v1 · 2025-08-02", "v2 · 2026-02-02", "v0 · not recorded in the library"]);
  assert.equal(select.value, "v0");
  assert.equal(field(page.target, "SRC-ai-act", "sources-hash").textContent, `Hash of this version: ${"5".repeat(64)}`);
  field(page.target, "SRC-ai-act", "sources-part").value = "Art. 5";
  await click(save(page.target));
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(`| SRC-ai-act | v0 | ${H.old} | Art. 5 |`, IEC_B));
});

// TST-590309 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 2
// given: docs/sources.md also holds a row for SRC-gone, a source the library does not hold
// input: render the route; tick SRC-handbook; press Save
// expect: the page says "Linked, but not in the library: SRC-gone — kept as they are."; the file keeps the row of SRC-gone first, then SRC-ai-act's, and adds SRC-handbook's
test("sources — a link to a source the library does not hold is named and kept as it is", async (t) => {
  const gone = `| SRC-gone | 3 | ${"6".repeat(64)} | x |`;
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(gone, AI_V1) } });
  assert.equal(withClass(page.target, "sources-orphans")[0].textContent, "Linked, but not in the library: SRC-gone — kept as they are.");
  await tick(field(page.target, "SRC-handbook", "sources-tick"));
  await click(save(page.target));
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(gone, AI_V1, `| SRC-handbook | 1 | ${H.handbook} | — |`));
});

// TST-590310 · level: unit · module: MOD-settings-pages
// guards: UC-015 3a; A LINK NAMES THE PART THAT APPLIES
// given: SRC-handbook (licence "restricted — internal") and SRC-iec-62304 (restricted) and SRC-ai-act (may be republished); the product has no docs/sources.md; the token reaches the instance and the product only
// input: tick SRC-handbook and press Save
// expect: SRC-handbook and SRC-iec-62304 say "Restricted: its content needs access. Linking needs none — the entry, its versions and their hashes are public."; SRC-ai-act says none; the row of SRC-handbook with its version 1 and the digits 4 is committed; every request went to the API of the instance's or the product's repository, and none read a source's content
test("sources — a restricted source links like any other: only its content needs access", async (t) => {
  const page = await open(t);
  const note = (id) => withClass(sectionOf(page.target, id), "sources-restricted").map((node) => node.textContent);
  const sentence = "Restricted: its content needs access. Linking needs none — the entry, its versions and their hashes are public.";
  assert.deepEqual([note("SRC-handbook"), note("SRC-iec-62304"), note("SRC-ai-act")], [[sentence], [sentence], []]);
  assert.deepEqual([field(page.target, "SRC-handbook", "sources-tick").disabled, field(page.target, "SRC-iec-62304", "sources-tick").disabled], [false, false], "a restricted source can be ticked");
  await tick(field(page.target, "SRC-handbook", "sources-tick"));
  await click(save(page.target));
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(`| SRC-handbook | 1 | ${H.handbook} | — |`));
  for (const request of page.world.requests) {
    assert.equal(request.url.origin, "https://api.github.com");
    assert.ok([INSTANCE, PRODUCT_REPO].includes(request.repository), `${request.method} ${request.url.pathname}`);
    assert.doesNotMatch(request.url.pathname, /\/contents\/docs\/sources\/SRC-[^/]+\//, "no content of a source is read");
    assert.equal(request.named.some((path) => /^docs\/sources\/SRC-[^/]+\//.test(path)), false, "no content of a source is asked for in a batch");
  }
  assert.ok(page.world.requests.some((request) => request.url.pathname.endsWith("/contents/docs/sources/SRC-handbook.md") || request.named.includes("docs/sources/SRC-handbook.md")), "known positive: the entry of the register is read, by its own request or in a batch");
});

// TST-590311 · level: unit · module: MOD-settings-pages
// guards: UC-015 2a; EVERY STEP EXPLAINS ITSELF
// given: the page of a product; the library route with a product, and without one
// input: press "Open the library" on the sources page; render the library route for the product and press "Back to Requirement sources"; render the library route without a product
// expect: the first press goes to the route library with no parameters; the library of a product has the button "Back to Requirement sources", whose press goes to the route sources with no parameters; the library without a product has no such button and its other controls are as they were (+ Register source)
test("sources — the page links the library and the library links back, for a product", async (t) => {
  const page = await open(t);
  await click(buttonLabelled(page.target, "Open the library"));
  assert.deepEqual(page.went, [["library", {}]]);
  const target = attachedTarget();
  await library.render(target, page.context, {});
  await click(buttonLabelled(target, "Back to Requirement sources"));
  assert.deepEqual(page.went, [["library", {}], ["sources", {}]]);
  const bare = attachedTarget();
  await library.render(bare, { ...page.context, product: null }, {});
  assert.equal(buttonLabelled(bare, "Back to Requirement sources"), undefined);
  assert.ok(buttonLabelled(bare, "+ Register source"));
});

// TST-590312 · level: unit · module: MOD-settings-pages
// guards: UC-015 2c; EVERY STEP EXPLAINS ITSELF
// given: the frame's explain("repository") is a folded details of class explain (a known positive); explain("requirement-sources") is a details with a body
// input: render the route sources
// expect: exactly one <details class="explain"> on the page, folded, not built by the route: its structure and text are explain("requirement-sources")'s
test("sources — the folded What is this? is the frame's topic requirement-sources, called through explain", async (t) => {
  assert.equal(explain("repository").localName, "details", "known positive: the frame gives a folded explanation for a topic it holds");
  const given = explain("requirement-sources");
  assert.equal(given.localName, "details");
  assert.ok(given.textContent.length > "What is this?".length);
  const { target } = await open(t);
  const folded = byTag(target, "details");
  assert.equal(folded.length, 1);
  assert.equal(folded[0].className, "explain");
  assert.equal(folded[0].hasAttribute("open"), false);
  assert.equal(folded[0].innerHTML, given.innerHTML);
});

// TST-590313 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 4; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: SRC-ai-act ticked, no docs/sources.md
// input: a click on Save that the page itself dispatched (untrusted); then nothing ticked and a person's click on Save; then a person's click with SRC-ai-act ticked and the file already as it will be written
// expect: the untrusted click writes nothing and shows nothing; the person's click with nothing ticked in a product without docs/sources.md writes nothing and says "Nothing changed; nothing was written."; so does a Save that would write the file as it is
test("sources — Save acts on a person's click only, and writes nothing when nothing changed", async (t) => {
  const page = await open(t);
  await tick(field(page.target, "SRC-ai-act", "sources-tick"));
  save(page.target).dispatchEvent(new Event("click"));
  await turn();
  assert.equal(productCommits(page).length, 0);
  assert.equal(result(page.target), "");
  await untick(field(page.target, "SRC-ai-act", "sources-tick"));
  await click(save(page.target));
  assert.equal(productCommits(page).length, 0);
  assert.equal(result(page.target), "Nothing changed; nothing was written.");
  const linked = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(AI_V1) } });
  await click(save(linked.target));
  assert.equal(productCommits(linked).length, 0);
  assert.equal(result(linked.target), "Nothing changed; nothing was written.");
});

// TST-590314 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 4; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: the page open on a product whose docs/sources.md links SRC-iec-62304; another person then commits another docs/sources.md to the product
// input: tick SRC-ai-act and press Save
// expect: nothing is written; the result reads "docs/sources.md changed since this page read it; nothing was written. Your choices stay here; open the page again to read the newer file."; SRC-ai-act stays ticked; the product's file is the other person's
test("sources — a save is refused when docs/sources.md changed meanwhile, and the choices stay", async (t) => {
  const page = await open(t, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(IEC_B) } });
  const other = links(`| SRC-handbook | 1 | ${H.handbook} | all |`);
  page.world.change(PRODUCT_REPO, "docs/sources.md", other);
  await tick(field(page.target, "SRC-ai-act", "sources-tick"));
  await click(save(page.target));
  assert.equal(productCommits(page).length, 0);
  assert.equal(result(page.target), "docs/sources.md changed since this page read it; nothing was written. Your choices stay here; open the page again to read the newer file.");
  assert.equal(field(page.target, "SRC-ai-act", "sources-tick").checked, true);
  assert.equal(page.world.files(PRODUCT_REPO)["docs/sources.md"], other);
});

// TST-590315 · level: unit · module: MOD-settings-pages
// guards: UC-015 step 1
// given: a context with no chosen product; a context whose instance repository the server does not hold; an instance whose library holds no source
// input: render the route sources in each
// expect: with no product, the page says "Choose a product: the sources a product must meet are linked in the product's own repository, so this page is drawn for one." and sends no request; with an unreadable library it says "The library could not be read: " and offers no Save; an empty library says "The library holds no source yet." and still offers "Open the library"
test("sources — without a product the page says so; an unreadable or empty library is said, not drawn as a list", async (t) => {
  const none = await open(t, { product: false });
  assert.equal(withClass(none.target, "sources-no-product")[0].textContent,
    "Choose a product: the sources a product must meet are linked in the product's own repository, so this page is drawn for one.");
  assert.deepEqual(none.world.requests, []);
  const unreadable = await open(t, { instanceKnown: false });
  assert.ok(withClass(unreadable.target, "sources-unreadable")[0].textContent.startsWith("The library could not be read: "));
  assert.equal(withClass(unreadable.target, "sources-save").length, 0);
  const empty = await open(t, { register: {} });
  assert.equal(withClass(empty.target, "sources-empty")[0].textContent, "The library holds no source yet.");
  assert.ok(buttonLabelled(empty.target, "Open the library"));
});

// TST-590316 · level: unit · module: MOD-settings-pages
// guards: THE PAGE NAMES WHERE IT SENDS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the page of the product https://github.com/alice/thesis-tool
// input: render the route sources
// expect: before Save the page states "Save writes docs/sources.md in https://github.com/alice/thesis-tool as your own commit, and writes nothing else." and "Product: https://github.com/alice/thesis-tool"; rendering sent no write request (no POST and no PATCH)
test("sources — the page names the repository Save writes to, and rendering writes nothing", async (t) => {
  const page = await open(t);
  assert.equal(withClass(page.target, "sources-where")[0].textContent, `Save writes docs/sources.md in ${PRODUCT} as your own commit, and writes nothing else.`);
  assert.ok(withClass(page.target, "muted").some((node) => node.textContent === `Product: ${PRODUCT}`));
  assert.deepEqual(page.world.requests.filter(isWrite), []);
});

// TST-590317 · level: unit · module: MOD-settings-pages
// guards: UC-015
// given: the view of MOD-settings-pages
// input: read its routes
// expect: exactly one route is named sources, under the menu entry settings, titled "Requirement sources"; the routes settings, setup, add-product, endpoints, participants, bridge, mailbox and library are still there, in this order, before it (routes added after it do not change this)
test("sources — the module's view holds one route sources under the entry settings, after the routes it had", () => {
  assert.deepEqual(view.routes.map((candidate) => candidate.name).slice(0, 9), ["settings", "setup", "add-product", "endpoints", "participants", "bridge", "mailbox", "library", "sources"]);
  const found = view.routes.filter((candidate) => candidate.name === "sources");
  assert.equal(found.length, 1);
  assert.equal(found[0].entry, "settings");
  assert.equal(found[0].title, "Requirement sources");
  assert.equal(typeof found[0].render, "function");
});

// TST-637005 · level: unit · module: MOD-settings-pages
// guards: UC-015 2b; A REQUIREMENT HAS A REGISTERED SOURCE
// given: the library of the tests above and SRC-handbook-annex, titled `Faculty handbook, annex II`; the product's docs/sources.md links SRC-ai-act, SRC-iec-62304 (title `IEC 62304`, designation `IEC 62304:2006+AMD1:2015`), SRC-handbook (title `Faculty handbook`) and SRC-handbook-annex; its SPEC.md has the requirements EXPORT NAMES THE ACT BY ITS TITLE (`EU AI Act, Art. 13`), PAGE NAMES THE ACT BY ITS IDENTIFIER (`SRC-ai-act`), STANDARD BY DESIGNATION (`IEC 62304:2006+AMD1:2015, class B`), STANDARD BY TITLE (`IEC 62304, class C`), HANDBOOK BY TITLE (`Faculty handbook, ch. 3`) and ANNEX BY TITLE (`Faculty handbook, annex II`)
// input: render the route; untick SRC-ai-act; untick SRC-iec-62304; untick SRC-handbook; untick SRC-handbook-annex
// expect: the note of SRC-ai-act reads "Removing SRC-ai-act: the requirements that name it — EXPORT NAMES THE ACT BY ITS TITLE, PAGE NAMES THE ACT BY ITS IDENTIFIER — would lose that source. They are listed, not deleted."; the note of SRC-iec-62304 lists STANDARD BY DESIGNATION, STANDARD BY TITLE; the note of SRC-handbook lists HANDBOOK BY TITLE alone, the longer name of the annex not being the handbook's; the note of SRC-handbook-annex lists ANNEX BY TITLE alone; the four unticks send no request, so the number of requests the page has made is the same after them as before; nothing has been committed
test("sources — unticking a linked source lists the requirements that name it by its title or designation, and sends no request", async (t) => {
  const named = (names, id) => `Removing ${id}: the requirements that name it — ${names} — would lose that source. They are listed, not deleted.`;
  const spec = ["# Thesis tool — Specification", "", "## 1. Names", "",
    ...[["EXPORT NAMES THE ACT BY ITS TITLE", "EU AI Act, Art. 13"], ["PAGE NAMES THE ACT BY ITS IDENTIFIER", "SRC-ai-act"],
      ["STANDARD BY DESIGNATION", "IEC 62304:2006+AMD1:2015, class B"], ["STANDARD BY TITLE", "IEC 62304, class C"],
      ["HANDBOOK BY TITLE", "Faculty handbook, ch. 3"], ["ANNEX BY TITLE", "Faculty handbook, annex II"]]
      .flatMap(([name, source]) => [`**${name}** *(${source})*`, "The rule is one statement.", "*Check:* `tests/a.test.mjs`", ""])].join("\n");
  const register = { ...REGISTER, "docs/sources/SRC-handbook-annex.md": registerEntry({ id: "SRC-handbook-annex", title: "Faculty handbook, annex II", kind: "document",
    authority: "informational", licence: "restricted — internal", versions: [{ version: "1", date: "2026-09-01", hash: "6".repeat(64) }] }) };
  const handbook = `| SRC-handbook | 1 | ${H.handbook} | all |`;
  const annex = `| SRC-handbook-annex | 1 | ${"6".repeat(64)} | |`;
  const page = await open(t, { register, productFiles: { "SPEC.md": spec, "docs/sources.md": links(AI_V1, IEC_B, handbook, annex) } });
  const { target } = page;
  const requested = page.world.requests.length;
  await untick(field(target, "SRC-ai-act", "sources-tick"));
  assert.equal(field(target, "SRC-ai-act", "sources-removal").textContent, named("EXPORT NAMES THE ACT BY ITS TITLE, PAGE NAMES THE ACT BY ITS IDENTIFIER", "SRC-ai-act"));
  await untick(field(target, "SRC-iec-62304", "sources-tick"));
  assert.equal(field(target, "SRC-iec-62304", "sources-removal").textContent, named("STANDARD BY DESIGNATION, STANDARD BY TITLE", "SRC-iec-62304"));
  await untick(field(target, "SRC-handbook", "sources-tick"));
  assert.equal(field(target, "SRC-handbook", "sources-removal").textContent, named("HANDBOOK BY TITLE", "SRC-handbook"));
  await untick(field(target, "SRC-handbook-annex", "sources-tick"));
  assert.equal(field(target, "SRC-handbook-annex", "sources-removal").textContent, named("ANNEX BY TITLE", "SRC-handbook-annex"));
  await settled(page.world);
  assert.equal(page.world.requests.length, requested);
  assert.equal(productCommits(page).length, 0);
});
