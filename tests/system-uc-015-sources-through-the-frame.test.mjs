// System tests of UC-015 Link requirement sources to a product: each path of the main flow (steps 1 to 4) and of the alternatives 2a, 2b, 2c and 3a runs through MOD-site-frame's frame —
// startPage over the module view of MOD-settings-pages, the route `sources` named by the address's fragment, the product the fragment names connected by the frame from this browser's
// store with its own token — against MOD-repository-hosts' real GitHub host for the instance and for the product (connect, readSnapshot, saveFile's commit), answered by a fake of fetch
// over repositories that hold files (tests/settings-pages-sources.d/github.mjs), and each reached by a person's input: a tick, a chosen version, a typed part, Save, an untick, a press of a
// button. Nothing reaches the network: every request is recorded, and each is one to the API of the instance's or the product's repository.
// Run: node --test tests/system-uc-015-sources-through-the-frame.test.mjs
//
// Module: MOD-settings-pages; MOD-site-frame
// Guards: UC-015; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// Each test names its input and states its expected result in its own text (given / input / expect) before it runs; none reads an expected value from a document. The instance is
// akmaier/agent-m, whose Pages address is https://akmaier.github.io/agent-m/docs/index.html; the product is https://github.com/alice/thesis-tool. The counter-proofs are recorded in
// the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byTag } from "./settings-pages-harness.mjs";
import { tick, untick } from "./settings-pages-setup.d/dom.mjs";
import { isWrite, registerEntry, sectionOf, withClass } from "./settings-pages-sources.d/github.mjs";
import { visit as visitFrame, click, go } from "./settings-pages-sources.d/frame.mjs";

installDocument();

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "https://github.com/alice/thesis-tool";
const PRODUCT_REPO = "alice/thesis-tool";
const PRODUCT_FRAGMENT = `product=${encodeURIComponent(PRODUCT)}`;
const H = { v1: "1".repeat(64), v2: "2".repeat(64), iec: "3".repeat(64), handbook: "4".repeat(64) };

const REGISTER = {
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
  "**NOTHING IS NAMED** *(PO B. Example)*", "The tool starts.", "*Check:* `tests/start.test.mjs`", ""].join("\n");
const links = (...rows) => ["# Requirement sources of thesis-tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", ...rows, ""].join("\n");
const AI_V1 = `| SRC-ai-act | v1 | ${H.v1} | risk category: high-risk |`;
const IEC_B = `| SRC-iec-62304 | IEC 62304:2006+AMD1:2015 | ${H.iec} | safety class B |`;
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";

// A person opens the page at `fragment`: the frame started on the module view of MOD-settings-pages, over this browser's store with the instance's token and the product with its own.
const visit = (t, fragment, { productFiles = { "SPEC.md": SPEC } } = {}) => visitFrame(t, fragment, {
  repositories: { [INSTANCE]: { files: REGISTER }, [PRODUCT_REPO]: { files: productFiles } },
  settings: { "github-token": { value: TOKEN, name: "Agent M · akmaier/agent-m", expires: "2027-01-01" }, products: [PRODUCT],
    [`github-token:${PRODUCT_REPO}`]: { value: PRODUCT_TOKEN, name: "Agent M · alice/thesis-tool", expires: "2027-01-01" } },
});
const field = (page, id, className) => withClass(sectionOf(page.main(), id), className)[0];
const save = (page) => withClass(page.main(), "sources-save")[0];
const result = (page) => withClass(page.main(), "sources-result")[0].textContent;
const labelled = (page, text) => byTag(page.main(), "button").find((button) => button.textContent === text);
const productCommits = (page) => page.world.commits(PRODUCT_REPO);
const leftTheRepositories = (page) => page.world.requests.filter((request) => request.url.origin !== "https://api.github.com"
  || ![INSTANCE, PRODUCT_REPO].includes(request.repository));

// TST-590401 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 steps 1 to 4; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION
// given: this browser keeps the product https://github.com/alice/thesis-tool with its token; the library holds SRC-ai-act (v1, v2), SRC-handbook and SRC-iec-62304; the product has SPEC.md and no docs/sources.md
// input: open the address #sources/product=<the product>; tick SRC-ai-act, choose v1, type the part "risk category: high-risk"; tick SRC-iec-62304 and press its suggested part "safety class B"; press Save
// expect: the frame shows the route in its main area, headed "Requirement sources", with the menu entry Settings the active one, and the three sources of the library; one commit lands in alice/thesis-tool, made with the product's token, holding only docs/sources.md with the two rows (SRC-ai-act, v1, the digits 1, "risk category: high-risk"; SRC-iec-62304, "IEC 62304:2006+AMD1:2015", the digits 3, "safety class B"); nothing is committed to the instance; every request went to the API of the instance's or the product's repository
test("UC-015 steps 1 to 4 — through the frame, ticking sources, choosing a version and a part and pressing Save write docs/sources.md in the product in one commit", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  assert.equal(byTag(page.main(), "h2")[0].textContent, "Requirement sources");
  const menu = byTag(document.body, "nav")[0];
  assert.deepEqual(byTag(menu, "a").filter((entry) => entry.className === "active").map((entry) => entry.textContent), ["Settings"]);
  assert.deepEqual(withClass(page.main(), "sources-entry").map((section) => section.getAttribute("data-source")), ["SRC-ai-act", "SRC-handbook", "SRC-iec-62304"]);
  await tick(field(page, "SRC-ai-act", "sources-tick"));
  field(page, "SRC-ai-act", "sources-version").value = "v1";
  field(page, "SRC-ai-act", "sources-version").dispatchEvent(new Event("change"));
  field(page, "SRC-ai-act", "sources-part").value = "risk category: high-risk";
  await tick(field(page, "SRC-iec-62304", "sources-tick"));
  await click(withClass(sectionOf(page.main(), "SRC-iec-62304"), "sources-part-suggestion").find((button) => button.textContent === "safety class B"));
  await click(save(page));
  assert.equal(productCommits(page).length, 1);
  assert.equal(page.world.commits(INSTANCE).length, 0);
  assert.deepEqual(Object.keys(productCommits(page)[0].files), ["docs/sources.md"]);
  assert.equal(productCommits(page)[0].files["docs/sources.md"], links(AI_V1, IEC_B));
  assert.equal(productCommits(page)[0].authorization, `Bearer ${PRODUCT_TOKEN}`);
  assert.deepEqual(leftTheRepositories(page), []);
});

// TST-590402 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 2b; A REQUIREMENT HAS A REGISTERED SOURCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the product's docs/sources.md links SRC-ai-act (v1, "risk category: high-risk") and SRC-iec-62304 ("safety class B"); its SPEC.md has the requirement EXPORT IS A PDF, which names "SRC-ai-act, Art. 13", and NOTHING IS NAMED
// input: open #sources/product=<the product>; untick SRC-ai-act; untick SRC-iec-62304; press Save
// expect: after the first untick the page lists "EXPORT IS A PDF" for SRC-ai-act ("Removing SRC-ai-act: the requirements that name it — EXPORT IS A PDF — would lose that source. They are listed, not deleted."); after the second it says "Removing SRC-iec-62304: no requirement of this product names it."; before Save nothing is committed; Save commits docs/sources.md with the table and no row, and SPEC.md is as it was
test("UC-015 2b — through the frame, the requirements that name a source are listed before its link is removed, and the removal is one commit that leaves them alone", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(AI_V1, IEC_B) } });
  await untick(field(page, "SRC-ai-act", "sources-tick"));
  assert.equal(field(page, "SRC-ai-act", "sources-removal").textContent,
    "Removing SRC-ai-act: the requirements that name it — EXPORT IS A PDF — would lose that source. They are listed, not deleted.");
  await untick(field(page, "SRC-iec-62304", "sources-tick"));
  assert.equal(field(page, "SRC-iec-62304", "sources-removal").textContent, "Removing SRC-iec-62304: no requirement of this product names it.");
  assert.equal(productCommits(page).length, 0);
  await click(save(page));
  assert.equal(productCommits(page).length, 1);
  assert.equal(page.world.files(PRODUCT_REPO)["docs/sources.md"], links());
  assert.equal(page.world.files(PRODUCT_REPO)["SPEC.md"], SPEC);
});

// TST-590403 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 2a, 2c; EVERY STEP EXPLAINS ITSELF
// given: the page of the product at #sources/product=<the product>
// input: press "Open the library"; the fragment changes as the frame writes it; press "Back to Requirement sources"
// expect: the first press sets the fragment #library/product=<the product> and the frame shows the Library with the button "Back to Requirement sources"; its press sets #sources/product=<the product> and the frame shows Requirement sources again; the sources page holds exactly one folded What is this? whose text names UC-040 as a link to #use-case/id=UC-040
test("UC-015 2a and 2c — through the frame, the page links the library and the library links back; the folded explanation links UC-040", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  const folded = byTag(page.main(), "details");
  assert.equal(folded.length, 1);
  assert.equal(folded[0].hasAttribute("open"), false);
  assert.deepEqual(byTag(folded[0], "a").map((anchor) => [anchor.getAttribute("href"), anchor.textContent]), [["#use-case/id=UC-040", "UC-040"]]);
  await click(labelled(page, "Open the library"));
  assert.equal(page.location.hash, `#library/${PRODUCT_FRAGMENT}`);
  await go(page, page.location.hash);
  assert.equal(byTag(page.main(), "h2")[0].textContent, "Library");
  await click(labelled(page, "Back to Requirement sources"));
  assert.equal(page.location.hash, `#sources/${PRODUCT_FRAGMENT}`);
  await go(page, page.location.hash);
  assert.equal(byTag(page.main(), "h2")[0].textContent, "Requirement sources");
});

// TST-590404 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 3a; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: SRC-handbook and SRC-iec-62304 are restricted in the library; the token of the person reaches the instance and the product only
// input: open #sources/product=<the product>; tick SRC-handbook and SRC-iec-62304; press Save
// expect: both carry the note "Restricted: its content needs access. Linking needs none — the entry, its versions and their hashes are public."; one commit holds both rows with their versions and hashes (SRC-handbook, 1, the digits 4; SRC-iec-62304, its designation, the digits 3); no request read the content of a source, and none went beyond the two repositories
test("UC-015 3a — through the frame, a restricted source is linked like any other", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  const note = "Restricted: its content needs access. Linking needs none — the entry, its versions and their hashes are public.";
  for (const id of ["SRC-handbook", "SRC-iec-62304"]) assert.deepEqual(withClass(sectionOf(page.main(), id), "sources-restricted").map((node) => node.textContent), [note]);
  assert.deepEqual([field(page, "SRC-handbook", "sources-tick").disabled, field(page, "SRC-iec-62304", "sources-tick").disabled], [false, false], "a restricted source can be ticked");
  await tick(field(page, "SRC-handbook", "sources-tick"));
  await tick(field(page, "SRC-iec-62304", "sources-tick"));
  await click(save(page));
  assert.equal(productCommits(page).length, 1);
  assert.equal(productCommits(page)[0].files["docs/sources.md"],
    links(`| SRC-handbook | 1 | ${H.handbook} | — |`, `| SRC-iec-62304 | IEC 62304:2006+AMD1:2015 | ${H.iec} | — |`));
  // The content of a version lies in docs/sources/<source>/<version>/; the entries of the register, docs/sources/<source>.md, are read.
  assert.deepEqual(page.world.requests.filter((request) => /\/contents\/docs\/sources\/SRC-[^/]+\//.test(request.url.pathname) || request.named.some((path) => /^docs\/sources\/SRC-[^/]+\//.test(path))), [], "no content of a source is read");
  assert.ok(page.world.requests.some((request) => request.url.pathname.endsWith("/contents/docs/sources/SRC-handbook.md") || request.named.includes("docs/sources/SRC-handbook.md")), "known positive: the entry of the register is read, by its own request or in a batch");
  assert.deepEqual(leftTheRepositories(page), []);
});

// TST-590405 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 step 4; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: the page of the product is open on a docs/sources.md that links SRC-iec-62304; another person then commits another docs/sources.md to the product
// input: tick SRC-ai-act; press Save
// expect: nothing is committed by the page; the result says "docs/sources.md changed since this page read it; nothing was written. Your choices stay here; open the page again to read the newer file."; opening the address again shows the other person's file: SRC-handbook ticked, SRC-iec-62304 not
test("UC-015 step 4 — through the frame, a save on a file that changed meanwhile writes nothing, and opening the page again reads the newer file", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": links(IEC_B) } });
  const other = links(`| SRC-handbook | 1 | ${H.handbook} | all |`);
  page.world.change(PRODUCT_REPO, "docs/sources.md", other);
  await tick(field(page, "SRC-ai-act", "sources-tick"));
  await click(save(page));
  assert.equal(productCommits(page).length, 0);
  assert.equal(result(page), "docs/sources.md changed since this page read it; nothing was written. Your choices stay here; open the page again to read the newer file.");
  await go(page, `#library/${PRODUCT_FRAGMENT}`);
  await go(page, `#sources/${PRODUCT_FRAGMENT}`);
  assert.deepEqual([field(page, "SRC-handbook", "sources-tick").checked, field(page, "SRC-iec-62304", "sources-tick").checked, field(page, "SRC-ai-act", "sources-tick").checked], [true, false, false]);
});

// TST-590406 · level: system · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 step 1
// given: this browser keeps the product; the address names no product, or a product this browser does not keep
// input: open #sources; open #sources/product=https://github.com/alice/other
// expect: with no product the frame shows the route's sentence "Choose a product: the sources a product must meet are linked in the product's own repository, so this page is drawn for one." and no Save; with an unknown product the frame shows the same sentence and, in its notices, that this browser does not keep the product; nothing was written
test("UC-015 step 1 — through the frame, without a product the page asks for one, and a product this browser does not keep is not drawn", async (t) => {
  const none = await visit(t, "#sources");
  const sentence = "Choose a product: the sources a product must meet are linked in the product's own repository, so this page is drawn for one.";
  assert.equal(withClass(none.main(), "sources-no-product")[0].textContent, sentence);
  assert.equal(withClass(none.main(), "sources-save").length, 0);
  const unknown = await visit(t, `#sources/product=${encodeURIComponent("https://github.com/alice/other")}`);
  assert.equal(withClass(unknown.main(), "sources-no-product")[0].textContent, sentence);
  assert.ok(withClass(document.body, "notice").some((notice) => notice.textContent.includes("This browser does not keep the product https://github.com/alice/other")));
  assert.deepEqual(unknown.world.requests.filter(isWrite), []);
});
