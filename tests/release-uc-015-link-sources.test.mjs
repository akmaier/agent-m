// Independent release tests of UC-015 Link requirement sources to a product (main flow, 2a, 2b and 3a), through MOD-site-frame's frame and MOD-settings-pages' route `sources`, against MOD-repository-hosts'
// real GitHub host answered by a fake of fetch. Written by developer-sonnet-b, who built none of the route (ITM-590). Each test states its input and its expected result in its own text (given / input /
// expect); every expected value is taken from the use case's step as quoted in the test or from the fixture the test builds, none from the code and none read from a document when the test runs. The page is found
// by what the use case names - the heading "Requirement sources", a source by its title, the box to tick, the version, the part, the button "Save", the folded "What is this?" - never by the route's class names or ids.
// The harness is the helpers of the module's own tests: tests/settings-pages-harness.mjs, tests/settings-pages-setup.d/dom.mjs, tests/settings-pages-sources.d/github.mjs and tests/settings-pages-sources.d/frame.mjs (a fixture DOM, a fake localStorage, GitHub, the frame opened at a fragment).
// Run: node --test tests/release-uc-015-link-sources.test.mjs
//
// Module: MOD-settings-pages; MOD-site-frame
// Guards: UC-015; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A REQUIREMENT HAS A REGISTERED SOURCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byTag } from "./settings-pages-harness.mjs";
import { tick, untick } from "./settings-pages-setup.d/dom.mjs";
import { isWrite, registerEntry } from "./settings-pages-sources.d/github.mjs";
import { visit as visitFrame, click, go } from "./settings-pages-sources.d/frame.mjs";

installDocument();

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "https://github.com/alice/thesis-tool";
const PRODUCT_REPO = "alice/thesis-tool";
const PRODUCT_FRAGMENT = `product=${encodeURIComponent(PRODUCT)}`;
const PRIVATE_CONTENT_REPO = "acme/restricted-standards";
const H = { ai1: "1".repeat(64), ai2: "2".repeat(64), iec: "3".repeat(64), dp: "4".repeat(64) };
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";

// The library the author finds: the EU AI Act in two versions with a risk category as its part, IEC 62304 (restricted, content in a repository the author cannot read) with safety class A, B or C, and the
// faculty's data-protection guideline (restricted) with no known parts.
const LIBRARY = {
  "docs/sources/SRC-ai-act.md": registerEntry({ id: "SRC-ai-act", title: "EU AI Act", kind: "regulation", authority: "normative", licence: "may be republished - EU law",
    versions: [{ version: "v1", date: "2025-08-02", hash: H.ai1 }, { version: "v2", date: "2026-02-02", hash: H.ai2 }], parts: ["risk category: high-risk", "risk category: limited risk"] }),
  "docs/sources/SRC-iec-62304.md": registerEntry({ id: "SRC-iec-62304", title: "IEC 62304", kind: "standard", authority: "normative", licence: "restricted - the publisher's terms",
    designation: "IEC 62304:2006+AMD1:2015", content_repository: PRIVATE_CONTENT_REPO, versions: [{ version: "IEC 62304:2006+AMD1:2015", date: "2026-10-02", hash: H.iec }],
    parts: ["safety class A", "safety class B", "safety class C"] }),
  "docs/sources/SRC-faculty-dp.md": registerEntry({ id: "SRC-faculty-dp", title: "Faculty data-protection guideline", kind: "document", authority: "informational", licence: "restricted - internal",
    versions: [{ version: "2026", date: "2026-09-01", hash: H.dp }] }),
};
// The product's SPEC: two requirements name the EU AI Act (one by its identifier, one by its title), one names IEC 62304 by nothing, one names no source.
const SPEC = [
  "# Thesis tool - Specification", "", "## 1. Export", "",
  "**EXPORT IS A PDF** *(SRC-ai-act, Art. 13; PO B. Example)*", "The export is one PDF file.", "*Check:* `tests/export.test.mjs`", "",
  "**RETENTION IS 30 DAYS** *(EU AI Act, Art. 10; PO B. Example)*", "Exports are deleted after 30 days.", "*Check:* `tests/retention.test.mjs`", "",
  "**NOTHING IS NAMED** *(PO B. Example)*", "The tool starts.", "*Check:* `tests/start.test.mjs`", ""].join("\n");
const SOURCES_FILE = (...rows) => ["# Requirement sources of thesis-tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", ...rows, ""].join("\n");

// A person opens the page at `fragment`: the frame started on the module view of MOD-settings-pages, over this browser's store with the instance's token and the product with its own.
const visit = (t, fragment, { productFiles = { "SPEC.md": SPEC } } = {}) => visitFrame(t, fragment, {
  repositories: { [INSTANCE]: { files: LIBRARY }, [PRODUCT_REPO]: { files: productFiles } },
  settings: { "github-token": { value: TOKEN, name: "Agent M - akmaier/agent-m", expires: "2027-01-01" }, products: [PRODUCT],
    [`github-token:${PRODUCT_REPO}`]: { value: PRODUCT_TOKEN, name: "Agent M - alice/thesis-tool", expires: "2027-01-01" } },
});

// What the use case names, found by what a person sees.
const heading = (page) => byTag(page.main(), "h2")[0]?.textContent;
const sectionOf = (page, title) => byTag(page.main(), "section").find((section) => byTag(section, "h3")[0]?.textContent.includes(title));
const boxOf = (page, title) => byTag(sectionOf(page, title), "input").find((input) => input.type === "checkbox");
const versionOf = (page, title) => byTag(sectionOf(page, title), "select")[0];
const partOf = (page, title) => byTag(sectionOf(page, title), "input").find((input) => input.type !== "checkbox");
const suggestionsOf = (page, title) => byTag(sectionOf(page, title), "button").map((button) => button.textContent);
const buttonLabelled = (page, text) => byTag(page.main(), "button").find((button) => button.textContent === text);
const pressSuggestion = (page, title, text) => click(byTag(sectionOf(page, title), "button").find((button) => button.textContent === text));
const commitsOf = (page, repository) => page.world.commits(repository);
// The source lines of a links file as [source, version, hash, part], in the order of the source's identifier; a part not given may stand as an empty cell or as the dash "—", and reads as "".
const rowsOf = (text) => text.split("\n").filter((line) => line.startsWith("|")).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim().replaceAll("`", "")))
  .filter(([first]) => first !== "Source" && !/^-+$/.test(first)).map(([source, version, hash, part]) => [source, version, hash, part === "—" ? "" : part])
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const leftTheRepositories = (page) => page.world.requests.filter((request) => request.url.origin !== "https://api.github.com" || ![INSTANCE, PRODUCT_REPO].includes(request.repository));

// TST-639001 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 step 1; ONE CLICK PER DECISION
// given: this browser keeps the product https://github.com/alice/thesis-tool with its token; the library holds the EU AI Act (regulation, normative, versions v1 and v2), IEC 62304 (standard, normative) and the Faculty data-protection guideline (document, informational); the product has no docs/sources.md
// input: open the address #sources/product=<the product>
// expect: UC-015 step 1 "Agent M shows the library, each source with kind, authority (normative, advisory, informational) and its versions": the page is headed "Requirement sources" and shows, for each of the three sources, its title, its kind, its authority and a box to tick that is not ticked; the EU AI Act offers the versions v1 and v2 in that order; nothing was written
test("release · UC-015 1: the page shows the library, each source with its kind, its authority and its versions", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  assert.equal(heading(page), "Requirement sources");
  for (const [title, kind, authority] of [["EU AI Act", "regulation", "normative"], ["IEC 62304", "standard", "normative"], ["Faculty data-protection guideline", "document", "informational"]]) {
    const section = sectionOf(page, title);
    assert.ok(section, `${title} is shown`);
    assert.ok(section.textContent.includes(kind), `${title}: kind ${kind}`);
    assert.ok(section.textContent.includes(authority), `${title}: authority ${authority}`);
    assert.equal(boxOf(page, title)?.checked, false, `${title}: a box to tick, not ticked`);
  }
  assert.deepEqual(byTag(versionOf(page, "EU AI Act"), "option").map((option) => option.textContent.split(" ")[0]), ["v1", "v2"]);
  assert.deepEqual(page.world.requests.filter(isWrite), []);
});

// TST-639002 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 steps 2 to 4; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION
// given: the page of TST-639001 (known positive: three boxes to tick)
// input: tick the EU AI Act, choose its older version v1, type the part "Art. 6 and Annex III"; tick IEC 62304 and leave its version as preset, pressing the suggested part "safety class B"; leave the Faculty data-protection guideline unticked; press Save once
// expect: before Save nothing is committed; one press of Save gives exactly one commit, to alice/thesis-tool, made with the product's token, changing only docs/sources.md; UC-015 step 4 "one line per source with its identifier, version, the version's hash, and the part": the file holds exactly two source lines, [SRC-ai-act, v1, the digits 1, "Art. 6 and Annex III"] and [SRC-iec-62304, "IEC 62304:2006+AMD1:2015", the digits 3, "safety class B"], none for the Faculty guideline; nothing is committed to the instance; every request went to the API of the instance's or the product's repository
test("release · UC-015 2–4: ticked sources with their chosen version and part are committed to the product as docs/sources.md, one line each, in one click", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  assert.equal(byTag(page.main(), "input").filter((input) => input.type === "checkbox").length, 3, "known positive: three boxes to tick");
  await tick(boxOf(page, "EU AI Act"));
  versionOf(page, "EU AI Act").value = "v1";
  versionOf(page, "EU AI Act").dispatchEvent(new Event("change"));
  partOf(page, "EU AI Act").value = "Art. 6 and Annex III";
  await tick(boxOf(page, "IEC 62304"));
  await pressSuggestion(page, "IEC 62304", "safety class B");
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 0, "ticking, choosing and naming write nothing");
  await click(buttonLabelled(page, "Save"));
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 1, "one click, one commit");
  assert.deepEqual(Object.keys(commitsOf(page, PRODUCT_REPO)[0].files), ["docs/sources.md"]);
  assert.equal(commitsOf(page, PRODUCT_REPO)[0].authorization, `Bearer ${PRODUCT_TOKEN}`);
  assert.deepEqual(rowsOf(commitsOf(page, PRODUCT_REPO)[0].files["docs/sources.md"]), [
    ["SRC-ai-act", "v1", H.ai1, "Art. 6 and Annex III"],
    ["SRC-iec-62304", "IEC 62304:2006+AMD1:2015", H.iec, "safety class B"],
  ]);
  assert.equal(commitsOf(page, INSTANCE).length, 0);
  assert.deepEqual(leftTheRepositories(page), []);
});

// TST-639003 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 step 3; A LINK NAMES THE PART THAT APPLIES
// given: the page of TST-639001; the library entries name known parts for the EU AI Act (risk category: high-risk, risk category: limited risk) and for IEC 62304 (safety class A, B, C) and none for the Faculty guideline
// input: read each source's version and the parts offered; tick the EU AI Act and the Faculty guideline and press Save without choosing anything
// expect: UC-015 step 3 "the version - preset to the newest": the EU AI Act is preset to v2, not v1; "Agent M suggests parts where the source has known ones: safety class A, B or C for IEC 62304, a risk category for the EU AI Act": IEC 62304 offers exactly safety class A, safety class B, safety class C, the EU AI Act exactly its two risk categories, the Faculty guideline none; the file Save commits holds, in the order of the identifiers, [SRC-ai-act, v2, the digits 2, ""] and [SRC-faculty-dp, 2026, the digits 4, ""] - the newest version, its hash, and no part
test("release · UC-015 3: the version is preset to the newest, and parts are suggested where the source has known ones", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  assert.equal(versionOf(page, "EU AI Act").value, "v2", "preset to the newest");
  assert.deepEqual(suggestionsOf(page, "IEC 62304"), ["safety class A", "safety class B", "safety class C"]);
  assert.deepEqual(suggestionsOf(page, "EU AI Act"), ["risk category: high-risk", "risk category: limited risk"]);
  assert.deepEqual(suggestionsOf(page, "Faculty data-protection guideline"), []);
  await tick(boxOf(page, "EU AI Act"));
  await tick(boxOf(page, "Faculty data-protection guideline"));
  await click(buttonLabelled(page, "Save"));
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 1);
  assert.deepEqual(rowsOf(commitsOf(page, PRODUCT_REPO)[0].files["docs/sources.md"]), [
    ["SRC-ai-act", "v2", H.ai2, ""],
    ["SRC-faculty-dp", "2026", H.dp, ""],
  ]);
});

// TST-639004 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015; EVERY STEP EXPLAINS ITSELF
// given: the page of TST-639001
// input: read the details elements of the page
// expect: UC-015 "A folded What is this? explains three differences": the page holds exactly one details element, folded (no open attribute), whose summary reads "What is this?" and whose body speaks of the library against this list, of a source against a resource, and of why the version is fixed (the words library, resource, version and fixed all stand in it)
test("release · UC-015: the page carries one folded What is this? that explains library against list, source against resource and why the version is fixed", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  const folded = byTag(page.main(), "details");
  assert.equal(folded.length, 1);
  assert.equal(folded[0].hasAttribute("open"), false);
  assert.equal(byTag(folded[0], "summary")[0]?.textContent, "What is this?");
  for (const word of [/library/i, /resource/i, /version/i, /fixed/i]) assert.match(folded[0].textContent, word);
});

// TST-639005 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 2a; EVERY STEP EXPLAINS ITSELF
// given: the page of TST-639001
// input: press the button that leads to the library; the fragment changes as the frame writes it; press the button on the library that leads back to Requirement sources; the fragment changes again
// expect: UC-015 2a "A needed source is not in the library: A link opens UC-004; afterwards the author returns here": the first press sets the fragment #library/product=<the product>; the frame shows the Library, headed "Library", with a button to register a source (UC-004, "+ Register source") and a button "Back to Requirement sources"; its press sets #sources/product=<the product>, and the frame shows Requirement sources again for the same product
test("release · UC-015 2a: a source that is not in the library is registered there, and the library leads back to the product's Requirement sources", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  await click(byTag(page.main(), "button").find((button) => /library/i.test(button.textContent)));
  assert.equal(page.location.hash, `#library/${PRODUCT_FRAGMENT}`);
  await go(page, page.location.hash);
  assert.equal(heading(page), "Library");
  assert.ok(byTag(page.main(), "button").some((button) => /Register source/.test(button.textContent)), "the library offers to register a source");
  await click(buttonLabelled(page, "Back to Requirement sources"));
  assert.equal(page.location.hash, `#sources/${PRODUCT_FRAGMENT}`);
  await go(page, page.location.hash);
  assert.equal(heading(page), "Requirement sources");
  assert.ok(page.main().textContent.includes(PRODUCT), "the same product");
});

// TST-639006 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 2b; A REQUIREMENT HAS A REGISTERED SOURCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the product's docs/sources.md links the EU AI Act (v1) and IEC 62304; its SPEC.md has the requirements EXPORT IS A PDF (naming SRC-ai-act), RETENTION IS 30 DAYS (naming the EU AI Act by its title) and NOTHING IS NAMED (naming no source)
// input: open #sources/product=<the product>; untick the EU AI Act; read the page; press Save
// expect: UC-015 2b "Agent M lists the product's requirements that name this source before saving; they would lose their source, so they are listed, not deleted": before Save, with nothing committed, the page lists EXPORT IS A PDF and RETENTION IS 30 DAYS and not NOTHING IS NAMED, and says they are not deleted; Save commits docs/sources.md with the IEC 62304 line only; SPEC.md is as it was and no commit touched it
test("release · UC-015 2b: before a link is removed, the requirements that name its source are listed, not deleted", async (t) => {
  const linked = SOURCES_FILE(`| SRC-ai-act | v1 | ${H.ai1} | Art. 13 |`, `| SRC-iec-62304 | IEC 62304:2006+AMD1:2015 | ${H.iec} | safety class B |`);
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`, { productFiles: { "SPEC.md": SPEC, "docs/sources.md": linked } });
  assert.equal(boxOf(page, "EU AI Act").checked, true, "known positive: the linked source stands ticked");
  await untick(boxOf(page, "EU AI Act"));
  const listed = sectionOf(page, "EU AI Act").textContent;
  assert.ok(listed.includes("EXPORT IS A PDF"), "the requirement that names the identifier is listed");
  assert.ok(listed.includes("RETENTION IS 30 DAYS"), "the requirement that names the title is listed");
  assert.ok(!page.main().textContent.includes("NOTHING IS NAMED"), "a requirement that names no source is not listed");
  assert.match(listed, /not deleted/);
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 0, "listed before saving, nothing written");
  await click(buttonLabelled(page, "Save"));
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 1);
  assert.deepEqual(Object.keys(commitsOf(page, PRODUCT_REPO)[0].files), ["docs/sources.md"]);
  assert.deepEqual(rowsOf(page.world.files(PRODUCT_REPO)["docs/sources.md"]), [["SRC-iec-62304", "IEC 62304:2006+AMD1:2015", H.iec, "safety class B"]]);
  assert.equal(page.world.files(PRODUCT_REPO)["SPEC.md"], SPEC);
});

// TST-639007 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 3a; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: IEC 62304 and the Faculty data-protection guideline are restricted in the library; IEC 62304's content lies in the repository acme/restricted-standards, which neither the instance's nor the product's token reaches and the fixture does not serve
// input: open #sources/product=<the product>; tick IEC 62304 and the Faculty guideline; press Save
// expect: UC-015 3a "The link is still possible; register entry, version and hash are public, only the content needs access": both boxes can be ticked (they are not disabled), each section says its content is restricted; one commit holds both lines with their version and hash, in the order of the identifiers ([SRC-faculty-dp, 2026, the digits 4, no part], [SRC-iec-62304, "IEC 62304:2006+AMD1:2015", the digits 3, no part]); no request names acme/restricted-standards or reads a file below docs/sources/SRC-iec-62304/ or docs/sources/SRC-faculty-dp/; known positive: the register entry docs/sources/SRC-iec-62304.md was read; none went beyond the two repositories
test("release · UC-015 3a: a restricted source is linked with its version and hash, and its content is not read", async (t) => {
  const page = await visit(t, `#sources/${PRODUCT_FRAGMENT}`);
  for (const title of ["IEC 62304", "Faculty data-protection guideline"]) {
    assert.equal(boxOf(page, title).disabled, false, `${title}: can be ticked`);
    assert.match(sectionOf(page, title).textContent, /[Rr]estricted/, `${title}: stated as restricted`);
    await tick(boxOf(page, title));
  }
  await click(buttonLabelled(page, "Save"));
  assert.equal(commitsOf(page, PRODUCT_REPO).length, 1);
  assert.deepEqual(rowsOf(commitsOf(page, PRODUCT_REPO)[0].files["docs/sources.md"]), [
    ["SRC-faculty-dp", "2026", H.dp, ""],
    ["SRC-iec-62304", "IEC 62304:2006+AMD1:2015", H.iec, ""],
  ]);
  const touchesContent = (request) => request.repository === PRIVATE_CONTENT_REPO || [request.url.pathname, ...request.named].some((path) => /docs\/sources\/SRC-(iec-62304|faculty-dp)\//.test(path));
  assert.deepEqual(page.world.requests.filter(touchesContent), [], "no content is read");
  assert.ok(page.world.requests.some((request) => request.url.pathname.endsWith("/docs/sources/SRC-iec-62304.md") || request.named.includes("docs/sources/SRC-iec-62304.md")), "known positive: the register entry is read");
  assert.deepEqual(leftTheRepositories(page), []);
});

// TST-639008 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-015 step 1
// given: this browser keeps the product https://github.com/alice/thesis-tool; the instance's library is as in TST-639001; the page of the product, at #settings/product=<the product>, headed "Settings" (known positive)
// input: look on the product's Settings view for the way UC-015 step 1 names, "In the product's view, the author opens Requirement sources"; press it
// expect: a button or link reading "Requirement sources" stands on the product's view, and pressing it sets the fragment #sources/product=<the product>
test("release · UC-015 1: the author opens Requirement sources from the product's view", async (t) => {
  const page = await visit(t, `#settings/${PRODUCT_FRAGMENT}`);
  assert.equal(heading(page), "Settings", "known positive: the product's Settings view is drawn");
  const way = [...byTag(page.main(), "button"), ...byTag(page.main(), "a")].find((candidate) => candidate.textContent.trim() === "Requirement sources");
  assert.ok(way, "Requirement sources is offered on the product's view");
  await click(way);
  assert.equal(page.location.hash, `#sources/${PRODUCT_FRAGMENT}`);
});
