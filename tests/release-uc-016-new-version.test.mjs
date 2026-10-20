// Independent release tests of UC-016 A source gets a new version (main flow, 1a and 4a), through MOD-site-frame's frame and MOD-settings-pages' route `library/<source>`, against MOD-repository-hosts' real GitHub host
// answered by a fake of fetch. Written by developer-sonnet-b, who built none of the route (ITM-591, ITM-705, ITM-900, ITM-914). Each test states its input and its expected result in its own text (given / input / expect);
// every expected value is taken from the use case's step as quoted in the test or from the fixture the test builds, none from the code and none read from a document when the test runs. The page is found by what the use
// case names - the source's title, the buttons "+ New version", "Move to the new version" and "Move", the fields Version, Date and Files, the products on older versions - never by the route's class names or ids.
// The harness is the helpers of the module's own tests: tests/settings-pages-harness.mjs, tests/settings-pages-sources.d/github.mjs, tests/settings-pages-sources.d/dispatch.mjs and tests/settings-pages-sources.d/frame.mjs.
// Run: node --test tests/release-uc-016-new-version.test.mjs
//
// Module: MOD-settings-pages; MOD-site-frame
// Guards: UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; A LIVING SOURCE IS PINNED; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; ONE CLICK PER DECISION
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { installDocument, byTag, type, until } from "./settings-pages-harness.mjs";
import { isWrite, registerEntry } from "./settings-pages-sources.d/github.mjs";
import { withRuns } from "./settings-pages-sources.d/dispatch.mjs";
import { visit as visitFrame, click, go } from "./settings-pages-sources.d/frame.mjs";

installDocument();

const INSTANCE = "akmaier/agent-m";
const THESIS = "https://github.com/alice/thesis-tool", OTHER = "https://github.com/bob/other-tool", THIRD = "https://github.com/carol/third-tool", DEVICE = "https://github.com/dave/device-tool";
const GUIDE = "https://github.com/erin/guide", GUIDE_REPO = "erin/guide";
const C1 = "96210fa4bf2c1cb0c5bc69339eb4c04c840f7f1b", C2 = "240ddc98fbd96ee987230e72d664cfd892e6574e"; // the heads of erin/guide at its first commit and after one change
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const tokenOf = (letter) => `github_pat_${letter.repeat(30)}`;
const repoOf = (web) => web.replace("https://github.com/", "");

const sha = (text) => createHash("sha256").update(text).digest("hex");
// A version's hash as the register defines it: the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, sorted by name.
const versionHash = (files) => sha([...files].sort((a, b) => (a.name < b.name ? -1 : 1)).map((file) => `${sha(file.text)}  ${file.name}\n`).join(""));
const bytesOf = (text) => new TextEncoder().encode(text);
const fileOf = (name, text) => ({ name, text, size: bytesOf(text).length, arrayBuffer: async () => bytesOf(text).buffer.slice(0) });
const one = (name, text) => [{ name, text }];
const entryOf = (id, title, kind, licence, versions, more = {}) => registerEntry({ id, title, kind, authority: "normative", licence, ...more,
  versions: versions.map(({ version, date, files, ...rest }) => ({ version, date, hash: versionHash(files), files: files.map((file) => ({ name: file.name, sha256: sha(file.text) })), ...rest })) });

// The library. The EU AI Act holds two versions as text, stored in the instance; IEC 62304 two editions that are only hashed; the faculty's guide is a repository at one commit; the AI Act as an EU legal text has
// one fetched version.
const V1 = "Article 1\nArticle 2\nArticle 3\n", V2 = "Article 1\nArticle 2 amended\nArticle 3\nArticle 4\n", V3 = "Article 1\nArticle 5\n";
const AI = entryOf("SRC-ai-act", "EU AI Act", "document", "may be republished - EU law", [
  { version: "v1", date: "2025-08-02", files: one("act.md", V1) }, { version: "v2", date: "2026-02-02", files: one("act.md", V2) }]);
const HASH = { v1: versionHash(one("act.md", V1)), v2: versionHash(one("act.md", V2)), v3: versionHash(one("act.md", V3)) };
const IEC_OLD = "IEC 62304:2006", IEC_NEW = "IEC 62304:2015", IEC_NEXT = "IEC 62304:2026";
const IEC = entryOf("SRC-iec-62304", "IEC 62304", "standard", "restricted - the publisher's terms", [
  { version: IEC_OLD, date: "2026-01-01", files: one("iec.pdf", "pages 2006"), notStored: ["iec.pdf"] }, { version: IEC_NEW, date: "2026-02-01", files: one("iec.pdf", "pages 2015"), notStored: ["iec.pdf"] }],
  { designation: IEC_OLD });
const GUIDE_ENTRY = ["---", "id: SRC-guide", "title: Erin's guide", "kind: system", "authority: normative", "licence: may be republished - MIT", `identifier: ${GUIDE}`, "---", "# SRC-guide Erin's guide", "",
  "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-01\` | 2026-10-01 | - | ${GUIDE} commit ${C1} | 0 files, listed below; version hash \`${sha("")}\` |`, "", "### Files of 2026-10-01", "", "| File | SHA-256 | Kept at |", "|---|---|---|", ""].join("\n");
const LEGAL = ["---", "id: SRC-eu-ai", "title: AI Act text", "kind: regulation", "authority: normative", "licence: may be republished - EU law",
  "identifier: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689", "---", "# SRC-eu-ai AI Act text", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`cellar-existing\` | 2024-07-12 | - | publication repository | 1 file, listed below; version hash \`${"a".repeat(64)}\` |`, "", "### Files of cellar-existing", "", "| File | SHA-256 | Kept at |", "|---|---|---|",
  `| \`32024R1689.xhtml\` | \`${"b".repeat(64)}\` | - |`, ""].join("\n");
const LIBRARY = {
  "docs/sources/SRC-ai-act.md": AI, "docs/sources/SRC-ai-act/v1/act.md": V1, "docs/sources/SRC-ai-act/v2/act.md": V2,
  "docs/sources/SRC-iec-62304.md": IEC, "docs/sources/SRC-guide.md": GUIDE_ENTRY, "docs/sources/SRC-eu-ai.md": LEGAL,
};

// The products. thesis-tool links the AI Act at v1 (part "Art. 13"), other-tool at v2, third-tool links nothing, device-tool links IEC 62304 at its older edition.
const SPEC = [
  "# Thesis tool - Specification", "", "## 1. Export", "",
  "**EXPORT IS A PDF** *(SRC-ai-act, Art. 13; PO B. Example)*", "The export is one PDF file.", "*Check:* `tests/export.test.mjs`", "",
  "**TITLE PAGE NAMES THE AUTHOR** *(SRC-ai-act; SRC-iec-62304, class B)*", "The title page names the author.", "*Check:* `tests/title.test.mjs`", "",
  "**NOTHING IS NAMED** *(PO B. Example)*", "The tool starts.", "*Check:* `tests/start.test.mjs`", ""].join("\n");
const links = (...rows) => ["# Requirement sources of a product", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", ...rows, ""].join("\n");
const ON_V1 = links(`| SRC-ai-act | v1 | ${HASH.v1} | Art. 13 |`), ON_V2 = links(`| SRC-ai-act | v2 | ${HASH.v2} | Art. 13 |`);
const ON_IEC_OLD = links(`| SRC-iec-62304 | ${IEC_OLD} | ${versionHash(one("iec.pdf", "pages 2006"))} | class B |`);
const PRODUCT_FILES = { [THESIS]: { "SPEC.md": SPEC, "docs/sources.md": ON_V1 }, [OTHER]: { "SPEC.md": SPEC, "docs/sources.md": ON_V2 }, [THIRD]: { "SPEC.md": SPEC }, [DEVICE]: { "SPEC.md": SPEC, "docs/sources.md": ON_IEC_OLD } };

// A person opens the page at `fragment`: the frame over this browser's store, which keeps the instance's token, the products named and the token of each.
let runs = null; // the workflow runs and dispatches of the page opened last, where a test asked for them
const visit = (t, fragment, { products = [THESIS, OTHER, THIRD], withFetchRuns = false, alsoViews = [] } = {}) => visitFrame(t, fragment, {
  repositories: { [INSTANCE]: { files: LIBRARY }, [GUIDE_REPO]: { files: { "README.md": "The guide.\n" } }, ...Object.fromEntries(products.map((web) => [repoOf(web), { files: PRODUCT_FILES[web] }])) },
  alsoViews,
  settings: { "github-token": { value: TOKEN, name: "Agent M - akmaier/agent-m", expires: "2027-01-01" }, products,
    ...Object.fromEntries([...products, GUIDE].map((web, index) => [`github-token:${repoOf(web)}`, { value: tokenOf("PQRSTU"[index]), name: `token ${index}`, expires: "2027-01-01" }])) },
  serve: withFetchRuns ? (world) => { runs = withRuns(world, INSTANCE); return runs.fetch; } : undefined,
});

// What the use case names, found by what a person sees.
const buttonLabelled = (page, pattern) => byTag(page.main(), "button").find((button) => pattern.test(button.textContent));
const fieldLabelled = (page, start) => { const label = byTag(page.main(), "label").find((each) => each.textContent.trim().startsWith(start)); return label ? byTag(label, "input")[0] : undefined; };
const commitsOf = (page, repository) => page.world.commits(repository);
const writes = (page) => page.world.requests.filter(isWrite);
const olderHeading = (page) => byTag(page.main(), "h3").find((heading) => heading.textContent === "Products on an older version");
const olderItems = (page) => byTag(olderHeading(page).parentNode, "li");
const olderAddresses = (page) => olderItems(page).map((item) => [THESIS, OTHER, THIRD, DEVICE].find((web) => item.textContent.includes(web))).sort();
const itemOf = (page, web) => olderItems(page).find((item) => item.textContent.includes(web));

// The source opened as a person opens it: from the library's list, by its title.
async function openSource(page, title, id) {
  await go(page, "#library");
  await click(byTag(page.main(), "button").find((button) => button.textContent === title));
  assert.equal(page.location.hash, `#library/source=${id}`);
  await go(page, page.location.hash);
}
// + New version with a version, a date and the files chosen; the hashes are shown once the files are read.
async function startVersion(page, version, date, files) {
  await click(buttonLabelled(page, /^\+ New version$/));
  type(fieldLabelled(page, "Version"), version);
  type(fieldLabelled(page, "Date"), date);
  if (files.length) {
    const input = fieldLabelled(page, "Files");
    input.files = files;
    input.dispatchEvent(new Event("change"));
    await until(() => files.every((file) => page.main().textContent.includes(`${file.name}: ${sha(file.text)}`)), "the files are hashed");
  }
}
const saveVersion = (page) => click(buttonLabelled(page, /^Save new version$/));

// TST-703001 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; ONE CLICK PER DECISION
// given: the library holds the EU AI Act (kind document) with the versions v1 and v2, each of the file act.md stored in the instance; this browser keeps no product
// input: open #library; press the source's title "EU AI Act"; press + New version; type the version v3 and the date 2026-03-03; choose the new file act.md holding "Article 1\nArticle 5\n"; press Save new version once
// expect: UC-016 step 1 "The author opens the source in the library and chooses + New version": pressing the title sets the fragment #library/source=SRC-ai-act and the frame shows the source, listing v1 and v2; before the Save nothing is committed; step 2 "Agent M records the new version with its identifier, date and hashes; earlier versions stay as they were": one Save gives one commit, to the instance only, holding exactly the entry docs/sources/SRC-ai-act.md and the new file docs/sources/SRC-ai-act/v3/act.md (the bytes chosen) and no file of v1 or v2; the entry keeps the rows of v1 and v2 line for line and adds a row of v3 with the date 2026-03-03 and the version hash of its file, and the SHA-256 of act.md; the page lists v1, v2 and v3
test("release · UC-016 1–2: + New version records a version with its identifier, date and hashes in one click, and the earlier versions stay as they were", async (t) => {
  const page = await visit(t, "#library", { products: [] });
  await openSource(page, "EU AI Act", "SRC-ai-act");
  assert.deepEqual(["v1", "v2"].map((version) => page.main().textContent.includes(version)), [true, true], "known positive: the source lists its versions");
  await startVersion(page, "v3", "2026-03-03", [fileOf("act.md", V3)]);
  assert.deepEqual(commitsOf(page, INSTANCE), [], "nothing is committed before Save");
  await saveVersion(page);
  await until(() => commitsOf(page, INSTANCE).length === 1, "the version is committed");
  assert.equal(commitsOf(page, INSTANCE).length, 1, "one click, one commit");
  const commit = commitsOf(page, INSTANCE)[0];
  assert.deepEqual(Object.keys(commit.files).sort(), ["docs/sources/SRC-ai-act.md", "docs/sources/SRC-ai-act/v3/act.md"]);
  assert.equal(commit.files["docs/sources/SRC-ai-act/v3/act.md"], V3);
  const entry = commit.files["docs/sources/SRC-ai-act.md"];
  for (const row of AI.split("\n").filter((line) => line.startsWith("| `v1`") || line.startsWith("| `v2`"))) assert.ok(entry.includes(row), `kept: ${row.slice(0, 24)}`);
  const row3 = entry.split("\n").find((line) => line.startsWith("| `v3`"));
  assert.ok(row3?.includes("2026-03-03") && row3.includes(HASH.v3), "the row of v3 has its date and the version hash");
  assert.ok(entry.includes(sha(V3)), "the SHA-256 of act.md is recorded");
  assert.deepEqual(["v1", "v2", "v3"].map((version) => page.main().textContent.includes(version)), [true, true, true]);
  assert.deepEqual(writes(page).filter((request) => !request.url.pathname.startsWith(`/repos/${INSTANCE}`)), [], "only the instance is written");
});

// TST-703002 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A PRODUCT LINKS THE SOURCES THAT APPLY
// given: this browser keeps thesis-tool (links the AI Act at v1), other-tool (links it at v2, the newest) and third-tool (has no docs/sources.md); the source has v1 and v2
// input: open #library/source=SRC-ai-act; read the products on older versions; record the version v3 (file act.md, "Article 1\nArticle 5\n"); read them again
// expect: UC-016 step 3 "The library shows which products still link to an earlier version": first only thesis-tool is listed, naming v1 as its version and v2 as the newest; after v3 is recorded thesis-tool and other-tool are listed, each naming its version and v3 as the newest, and third-tool is not
test("release · UC-016 3: the library shows which products still link to an earlier version", async (t) => {
  const page = await visit(t, "#library/source=SRC-ai-act");
  assert.ok(olderHeading(page), "known positive: the section of the products on older versions stands on the page");
  assert.deepEqual(olderAddresses(page), [THESIS]);
  assert.match(itemOf(page, THESIS).textContent, /links v1\b.*newest is v2\b/);
  await startVersion(page, "v3", "2026-03-03", [fileOf("act.md", V3)]);
  await saveVersion(page);
  await until(() => commitsOf(page, INSTANCE).length === 1, "the version is committed");
  assert.deepEqual(olderAddresses(page), [OTHER, THESIS].sort());
  assert.match(itemOf(page, THESIS).textContent, /links v1\b.*newest is v3\b/);
  assert.match(itemOf(page, OTHER).textContent, /links v2\b.*newest is v3\b/);
});

// TST-703003 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: the library holds IEC 62304 (kind standard, restricted) with the editions "IEC 62304:2006" and "IEC 62304:2015", each of the file iec.pdf only hashed and stored nowhere
// input: open #library/source=SRC-iec-62304; press + New version; type the designation "IEC 62304:2026" as the version and the date 2026-04-01; choose the file iec.pdf holding "pages 2026"; tick the box that only hashes the file and type the note "cabinet 3, shelf B" where the copy is kept; press Save new version
// expect: UC-016 step 1 "a new designation (for example the next edition of a norm)": one commit to the instance holding exactly the entry docs/sources/SRC-iec-62304.md and no file of the standard; the entry keeps the rows of "IEC 62304:2006" and "IEC 62304:2015" line for line, adds a row of "IEC 62304:2026" dated 2026-04-01 with the version hash of the file, and records the SHA-256 of iec.pdf with the note "cabinet 3, shelf B"
test("release · UC-016 1–2: the next edition of a standard is recorded under its new designation, the file only hashed", async (t) => {
  const page = await visit(t, "#library/source=SRC-iec-62304", { products: [] });
  await startVersion(page, IEC_NEXT, "2026-04-01", [fileOf("iec.pdf", "pages 2026")]);
  const only = byTag(byTag(page.main(), "label").find((label) => label.textContent.includes("Only hash it")), "input")[0];
  only.checked = true;
  only.dispatchEvent(new Event("change"));
  type(fieldLabelled(page, "Where your copy is kept"), "cabinet 3, shelf B");
  await saveVersion(page);
  await until(() => commitsOf(page, INSTANCE).length === 1, "the version is committed");
  const commit = commitsOf(page, INSTANCE)[0];
  assert.deepEqual(Object.keys(commit.files), ["docs/sources/SRC-iec-62304.md"]);
  const entry = commit.files["docs/sources/SRC-iec-62304.md"];
  for (const row of IEC.split("\n").filter((line) => line.startsWith(`| \`${IEC_OLD}\``) || line.startsWith(`| \`${IEC_NEW}\``))) assert.ok(entry.includes(row), `kept: ${row.slice(0, 24)}`);
  const row = entry.split("\n").find((line) => line.startsWith(`| \`${IEC_NEXT}\``));
  assert.ok(row?.includes("2026-04-01") && row.includes(versionHash(one("iec.pdf", "pages 2026"))), "the row of the new edition has its date and the version hash");
  assert.ok(entry.includes(sha("pages 2026")) && entry.includes("cabinet 3, shelf B"), "the SHA-256 of the file and the note are recorded");
});

// TST-703004 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A LIVING SOURCE IS PINNED
// given: the library holds SRC-guide, a repository source (https://github.com/erin/guide) whose one version 2026-10-01 was read at the commit 96210fa4…; the repository then changes, so that its default branch stands at the commit 240ddc98…
// input: open #library/source=SRC-guide; press + New version; type the version 2026-11-01 and the date 2026-11-01; press Save new version
// expect: UC-016 step 1 "a newer commit of a repository": the panel offers no field for files; one commit to the instance holding exactly docs/sources/SRC-guide.md, whose row of 2026-10-01 stays as it was and which adds a row of 2026-11-01 recording the repository https://github.com/erin/guide and the commit 240ddc98fbd96ee987230e72d664cfd892e6574e; nothing is committed to erin/guide
test("release · UC-016 1–2: a newer commit of a repository is recorded as a new version, pinned to that commit", async (t) => {
  const page = await visit(t, "#library/source=SRC-guide", { products: [] });
  page.world.change(GUIDE_REPO, "README.md", "The guide, revised.\n");
  await click(buttonLabelled(page, /^\+ New version$/));
  assert.equal(fieldLabelled(page, "Files"), undefined, "no field for files");
  type(fieldLabelled(page, "Version"), "2026-11-01");
  type(fieldLabelled(page, "Date"), "2026-11-01");
  await saveVersion(page);
  await until(() => commitsOf(page, INSTANCE).length === 1, "the version is committed");
  assert.deepEqual(Object.keys(commitsOf(page, INSTANCE)[0].files), ["docs/sources/SRC-guide.md"]);
  const entry = commitsOf(page, INSTANCE)[0].files["docs/sources/SRC-guide.md"];
  assert.ok(entry.includes(GUIDE_ENTRY.split("\n").find((line) => line.startsWith("| `2026-10-01`"))), "the first version stays as it was");
  const row = entry.split("\n").find((line) => line.startsWith("| `2026-11-01`"));
  assert.ok(row?.includes(GUIDE) && row.includes(C2), "the new row records the repository and the commit");
  assert.deepEqual(commitsOf(page, GUIDE_REPO), []);
});

// TST-703005 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN
// given: the library holds SRC-eu-ai, an EU legal text with an EUR-Lex address as its identifier and one fetched version; the instance has the workflow fetch-sources.yml
// input: open #library/source=SRC-eu-ai; press + New version
// expect: the Fetch workflow actor of UC-016 is started for the source: fetch-sources.yml is dispatched once, on the branch main, with exactly the input source = SRC-eu-ai; the page offers no field for files and says that the workflow was started; the page writes nothing to any repository
test("release · UC-016 1: + New version of a fetched EU legal text starts the fetch workflow for that source", async (t) => {
  const page = await visit(t, "#library/source=SRC-eu-ai", { products: [], withFetchRuns: true });
  await click(buttonLabelled(page, /^\+ New version$/));
  assert.equal(fieldLabelled(page, "Files"), undefined, "no field for files");
  assert.deepEqual(runs.dispatched, [{ ref: "main", inputs: { source: "SRC-eu-ai" } }]);
  assert.match(page.main().textContent, /fetch workflow was started/i);
  assert.deepEqual(writes(page), []);
});

// TST-703006 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN
// given: the AI Act with v1 (act.md holding "Article 1\nArticle 2\nArticle 3\n") and v2 (act.md holding "Article 1\nArticle 2 amended\nArticle 3\nArticle 4\n"); and SRC-guide whose one version 2026-10-01 records the commit 96210fa4…, at which the repository still stands
// input: + New version "v1b" with the file act.md holding the bytes of v1, Save; then "v2b" with the bytes of v2, Save; and on SRC-guide + New version 2026-12-01, Save
// expect: UC-016 1a "The new version has the same bytes as an existing one. Agent M says so and records nothing": for the first, the page says the bytes are the same as those of v1, for the second as those of v2, for the repository as those of 2026-10-01; nothing is committed anywhere and the page sent no write; the AI Act still lists v1 and v2 and no v1b or v2b
test("release · UC-016 1a: a new version with the same bytes as an existing one is refused by saying so, and nothing is recorded", async (t) => {
  const page = await visit(t, "#library/source=SRC-ai-act", { products: [] });
  await startVersion(page, "v1b", "2026-03-03", [fileOf("act.md", V1)]);
  await saveVersion(page);
  assert.match(page.main().textContent, /same bytes as v1\b/);
  await startVersion(page, "v2b", "2026-03-04", [fileOf("act.md", V2)]);
  await saveVersion(page);
  assert.match(page.main().textContent, /same bytes as v2\b/);
  assert.deepEqual(commitsOf(page, INSTANCE), []);
  assert.deepEqual(writes(page), []);
  assert.ok(!byTag(page.main(), "li").some((item) => item.textContent.startsWith("v1b") || item.textContent.startsWith("v2b")), "no version v1b or v2b is listed");
  const repository = await visit(t, "#library/source=SRC-guide", { products: [] });
  await startVersion(repository, "2026-12-01", "2026-12-01", []);
  await saveVersion(repository);
  assert.match(repository.main().textContent, /same bytes as 2026-10-01\b/);
  assert.deepEqual(commitsOf(repository, INSTANCE), []);
  assert.deepEqual(writes(repository), []);
});

// TST-703007 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; ONE CLICK PER DECISION
// given: thesis-tool links the AI Act at v1 with the part "Art. 13"; its SPEC.md has the requirements EXPORT IS A PDF (naming SRC-ai-act) and TITLE PAGE NAMES THE AUTHOR (naming SRC-ai-act and SRC-iec-62304) and NOTHING IS NAMED (naming no source); v1 holds act.md "Article 1\nArticle 2\nArticle 3\n", v2 "Article 1\nArticle 2 amended\nArticle 3\nArticle 4\n"
// input: open #library/source=SRC-ai-act; press "Move to the new version" of thesis-tool; read what is listed; press Move once
// expect: UC-016 step 4 "Agent M lists the product's requirements that came from this source, and - where both versions are text - which passages changed": the listing names EXPORT IS A PDF and TITLE PAGE NAMES THE AUTHOR and not NOTHING IS NAMED, and the passages that changed - "Article 2 amended" and "Article 4" - and not the lines that did not ("Article 1", "Article 3"); the listing wrote nothing; step 5 "The author presses Move - one click. Agent M updates the product's docs/sources.md": one commit to thesis-tool, with the product's token, holding exactly docs/sources.md, whose row of SRC-ai-act is now at v2 with the version hash of v2 and the part "Art. 13" kept; SPEC.md is not committed and stays as it was; nothing is committed to the instance; UC-016's postcondition "a move is visible in the product's history together with the requirements it affected": the commit's message names SRC-ai-act, v1 and v2, EXPORT IS A PDF and TITLE PAGE NAMES THE AUTHOR; thesis-tool is no longer listed as on an older version
test("release · UC-016 4–5: Move lists the affected requirements and the changed passages, then one click updates the product's docs/sources.md", async (t) => {
  const page = await visit(t, "#library/source=SRC-ai-act");
  await click(buttonLabelled(page, /^Move to the new version$/));
  await until(() => buttonLabelled(page, /^Move$/) !== undefined, "the move is prepared");
  const listing = itemOf(page, THESIS).textContent;
  for (const name of ["EXPORT IS A PDF", "TITLE PAGE NAMES THE AUTHOR", "Article 2 amended", "Article 4"]) assert.ok(listing.includes(name), `listed: ${name}`);
  for (const name of ["NOTHING IS NAMED", "Article 1", "Article 3"]) assert.ok(!listing.includes(name), `not listed: ${name}`);
  assert.deepEqual(writes(page), [], "listing writes nothing");
  await click(buttonLabelled(page, /^Move$/));
  await until(() => commitsOf(page, repoOf(THESIS)).length === 1, "the move is committed");
  assert.equal(commitsOf(page, repoOf(THESIS)).length, 1, "one click, one commit");
  const commit = commitsOf(page, repoOf(THESIS))[0];
  assert.deepEqual(Object.keys(commit.files), ["docs/sources.md"]);
  assert.equal(commit.authorization, `Bearer ${tokenOf("P")}`);
  assert.deepEqual(links(`| SRC-ai-act | v2 | ${HASH.v2} | Art. 13 |`).split("\n").filter((line) => line.startsWith("| SRC")), commit.files["docs/sources.md"].split("\n").filter((line) => line.startsWith("| SRC")));
  for (const name of ["SRC-ai-act", "v1", "v2", "EXPORT IS A PDF", "TITLE PAGE NAMES THE AUTHOR"]) assert.ok(commit.message.includes(name), `the message names ${name}`);
  assert.equal(page.world.files(repoOf(THESIS))["SPEC.md"], SPEC);
  assert.deepEqual([commitsOf(page, INSTANCE).length, commitsOf(page, repoOf(OTHER)).length], [0, 0]);
  assert.ok(!olderAddresses(page).includes(THESIS), "thesis-tool is no longer on an older version");
});

// TST-703008 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the move of TST-703007 done
// input: after the click on Move, open the dashboard's current requirements of thesis-tool (#trace/key=specification/ref=main/product=<the product>)
// expect: UC-016 step 5 "the listed requirements are marked source changed on the dashboard until each is looked at again": the page lists EXPORT IS A PDF and TITLE PAGE NAMES THE AUTHOR (known positive) and marks them as source changed
test("release · UC-016 5: the requirements a move affected are marked source changed", { todo: "FINDING ITM-657 - the specification page does not mark a requirement as source changed after a move; the move names the requirements in its listing and in the commit message only, and ITM-657 (MOD-trace-pages) builds the mark" }, async (t) => {
  const page = await visit(t, "#library/source=SRC-ai-act", { alsoViews: ["trace-pages"] });
  await click(buttonLabelled(page, /^Move to the new version$/));
  await until(() => buttonLabelled(page, /^Move$/) !== undefined, "the move is prepared");
  await click(buttonLabelled(page, /^Move$/));
  await until(() => commitsOf(page, repoOf(THESIS)).length === 1, "known positive: the move is committed");
  await go(page, `#trace/key=specification/ref=main/product=${encodeURIComponent(THESIS)}`);
  assert.ok(["EXPORT IS A PDF", "TITLE PAGE NAMES THE AUTHOR"].every((name) => page.main().textContent.includes(name)), "known positive: the specification page lists the requirements");
  assert.match(page.main().textContent, /source changed/i, "the requirements are marked source changed");
});

// TST-703009 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: device-tool links IEC 62304 at "IEC 62304:2006" (part "class B"); both editions' file iec.pdf are only hashed, stored nowhere; its SPEC.md has TITLE PAGE NAMES THE AUTHOR, which names SRC-iec-62304
// input: open #library/source=SRC-iec-62304; press "Move to the new version" of device-tool; press Move
// expect: UC-016 step 4 "where both versions are text - which passages changed": the listing names TITLE PAGE NAMES THE AUTHOR, says that the passages are not listed and names iec.pdf as the file that is not stored, and offers Move all the same; Move commits docs/sources.md of device-tool alone, now at "IEC 62304:2015" with its version hash and the part "class B" kept
test("release · UC-016 4: where the versions are not stored text no passages are listed, and the product can still move", async (t) => {
  const page = await visit(t, "#library/source=SRC-iec-62304", { products: [DEVICE] });
  await click(buttonLabelled(page, /^Move to the new version$/));
  await until(() => buttonLabelled(page, /^Move$/) !== undefined, "the move is prepared");
  const listing = itemOf(page, DEVICE).textContent;
  assert.ok(listing.includes("TITLE PAGE NAMES THE AUTHOR"));
  assert.match(listing, /passages are not listed/);
  assert.ok(listing.includes("iec.pdf"), "the file that is not stored is named");
  await click(buttonLabelled(page, /^Move$/));
  await until(() => commitsOf(page, repoOf(DEVICE)).length === 1, "the move is committed");
  assert.deepEqual(Object.keys(commitsOf(page, repoOf(DEVICE))[0].files), ["docs/sources.md"]);
  const row = commitsOf(page, repoOf(DEVICE))[0].files["docs/sources.md"].split("\n").find((line) => line.startsWith("| SRC-iec-62304"));
  assert.ok(row?.includes(IEC_NEW) && !row.includes(IEC_OLD) && row.includes(versionHash(one("iec.pdf", "pages 2015"))) && row.includes("class B"), row);
});

// TST-703010 · level: release · module: MOD-settings-pages; MOD-site-frame
// guards: UC-016; ONE CLICK PER DECISION
// given: thesis-tool links the AI Act at v1 while v2 exists
// input: open #library/source=SRC-ai-act; press "Move to the new version" of thesis-tool and read the listing; do not press Move; go to #library; open the source again
// expect: UC-016 4a "The author keeps a product on the old version. Nothing changes; the library keeps showing that a newer version exists": no request wrote anything; thesis-tool's docs/sources.md is as it was (v1); the reopened page lists thesis-tool as on v1 with v2 as the newest
test("release · UC-016 4a: a product the author keeps on the old version is left alone, and the library keeps showing that a newer version exists", async (t) => {
  const page = await visit(t, "#library/source=SRC-ai-act");
  await click(buttonLabelled(page, /^Move to the new version$/));
  await until(() => buttonLabelled(page, /^Move$/) !== undefined, "known positive: the move is prepared, with Move offered");
  assert.deepEqual(writes(page), []);
  await go(page, "#library");
  await openSource(page, "EU AI Act", "SRC-ai-act");
  assert.deepEqual(writes(page), []);
  assert.equal(page.world.files(repoOf(THESIS))["docs/sources.md"], ON_V1);
  assert.deepEqual(olderAddresses(page), [THESIS]);
  assert.match(itemOf(page, THESIS).textContent, /links v1\b.*newest is v2\b/);
});
