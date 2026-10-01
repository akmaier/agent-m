// The SPEC change entry shows the impact list of the requirements it changes or withdraws (UC-006 3b): the use cases, decisions,
// modules and tests that name each one, derived with MOD-traceability (linkGraph, requirementImpact) from the files of the commit
// shown, beside the current section, the proposal and the difference, before Accept. The real app (docs/assets/dashboard-app.mjs)
// runs in tests/app-harness.mjs against a GitHub fake that records every request. Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-006
// Level: component
//
// Counter-proofs (a planted fault for each test): docs/measurements/2026-10-02_spec-entry-impact-list.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard } from "./app-harness.mjs";

// ---------------------------------------------------------------- the fixture product
//
// Three sections of one rule each. Entry 01 rewords RULE ONE, which two use cases realise and one test guards; entry 02 adds
// RULE NEW beside RULE THREE, unchanged; entry 03 withdraws RULE TWO, which a use case realises, a decision is forced by and a
// module realises.

const QD = "docs/spec-freigaben/2026-10-01_rules", QNAME = "2026-10-01_rules";
const rule = (name, text, check = "none") => `**${name}** *(PO, 2026-09-30)*\n${text}\n*Check:* ${check}\n`;
const S1 = `## 1. One\n\n${rule("RULE ONE", "The first rule.", "`tests/one.test.mjs`")}`;
const S2 = `## 2. Two\n\n${rule("RULE TWO", "The second rule.")}`;
const S3 = `## 3. Three\n\n${rule("RULE THREE", "The third rule.")}`;
const SPEC = `# S\n\n**VERBINDLICH (SPEC)**\n\n${S1}\n${S2}\n${S3}`;
const P01 = `## 1. One\n\n${rule("RULE ONE", "The first rule, reworded.", "`tests/one.test.mjs`")}`;
const P02 = `## 3. Three\n\n${rule("RULE THREE", "The third rule.")}\n${rule("RULE NEW", "A rule nobody names yet.")}`;
const P03 = "## 2. Two\n\n**RULE TWO** *(PO, 2026-09-30 — withdrawn 2026-10-01)*\n*Withdrawn:* folded into `RULE ONE`. The name is not reused.\n";
const INDEX = "**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n"
  + "| 01 | `SPEC.md` | ## 1. One | — | — |\n| 02 | `SPEC.md` | ## 3. Three | — | — |\n| 03 | `SPEC.md` | ## 2. Two | — | — |\n";

const uc = (id, realises) => `---\nid: ${id}\ntitle: Case ${id}\narea: review\nactors:\n  - Reviewer\nrealises:\n${realises.map((r) => `  - ${r}\n`).join("")}---\n`
  + `# ${id} Case ${id}\n\n## Main flow\n\n1. The reviewer reads.\n`;
const UC1 = "docs/use-cases/UC-001-one.md", UC2 = "docs/use-cases/UC-002-two.md", UC3 = "docs/use-cases/UC-003-three.md";
const UC4 = "docs/use-cases/UC-004-four.md";
const ARC1 = "docs/architecture/ARC-001-static.md", MODR = "docs/architecture/MOD-reader.md";
const ARC1_TEXT = "---\nid: ARC-001\ntitle: Static\nforced_by:\n  - RULE TWO\n---\n# ARC-001 Static\n\n## Context\n\nNo server.\n\n"
  + "## Decision\n\nA static page.\n\n## Alternatives\n\n- A server — rejected.\n\n## Consequences\n\nNone.\n";
const MODR_TEXT = "---\nid: MOD-reader\ntitle: Reads files\nrealises:\n  - RULE TWO\nfollows:\n  - ARC-001\nuses:\nprovides:\n  - readFile\n---\n"
  + "# MOD-reader Reads files\n\n## Responsibility\n\nReads files.\n\n## Interfaces\n\n- `readFile(path) -> text` — one file.\n";
const T1 = "tests/one.test.mjs", T3 = "tests/three.test.mjs";
const testText = (guards) => `// A test.\n//\n// Module: MOD-reader\n// Guards: ${guards}\n// Level: unit\n\nimport test from "node:test";\n`;

const FILES = {
  "SPEC.md": SPEC,
  [`${QD}/index.md`]: INDEX, [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  [`${QD}/01-one.md`]: P01, [`${QD}/01-one.begruendung.md`]: "# Why 01\n\nClearer.\n",
  [`${QD}/02-new.md`]: P02, [`${QD}/03-two.md`]: P03,
  [UC1]: uc("UC-001", ["RULE ONE"]), [UC2]: uc("UC-002", ["RULE ONE", "RULE TWO"]), [UC3]: uc("UC-003", ["RULE THREE"]),
  [ARC1]: ARC1_TEXT, [MODR]: MODR_TEXT,
  [T1]: testText("RULE ONE"), [T3]: testText("RULE THREE"),
  "src/reader.mjs": "// Module: MOD-reader\nexport const read = () => '';\n",
};

// ---------------------------------------------------------------- reading the page

// The impact section of the entry page, or null.
const impactOf = (html) => /<section class="panel impact" id="spec-impact">[^]*?<\/section>/.exec(html)?.[0] ?? null;
// The artifacts the section lists, per requirement it names: { [name]: { change, ids } }.
function listed(section) {
  const out = {};
  for (const m of section.matchAll(/<div class="impact-req" data-requirement="([^"]+)" data-change="([^"]+)">([^]*?)<\/div>/g)) {
    out[m[1].replace(/&#39;/g, "'")] = { change: m[2], ids: [...m[3].matchAll(/<li data-impact="([^"]+)"/g)].map((x) => x[1]) };
  }
  return out;
}
const fileReads = (requests) => requests.filter((r) => r.startsWith("file "));
const graphReads = (requests) => fileReads(requests).filter((r) => /^file (docs\/use-cases|docs\/architecture|tests)\//.test(r));

// ---------------------------------------------------------------- UC-006 3b

test("UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept", async () => {
  const srv = await repoServer({ files: FILES });
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/01` });
  const html = page.main(), section = impactOf(html);
  assert.ok(section, "the entry shows an impact list");
  assert.deepEqual(listed(section), { "RULE ONE": { change: "change", ids: ["UC-001", "UC-002", T1] } });
  assert.match(section, new RegExp(`${UC1.replace(/[.]/g, "\\.")}`), "each artifact with its file");
  // Beside the current section, the proposal and the difference — and before Accept.
  const at = html.indexOf('id="spec-impact"');
  assert.ok(html.indexOf("In the SPEC now") < at && html.indexOf("<h3>Proposed</h3>") < at && html.indexOf("<h3>Difference</h3>") < at);
  const accept = html.indexOf("data-accept-key");
  assert.ok(accept > at, "Accept comes after the impact list");
  assert.deepEqual(srv.writes, [], "opening writes nothing");
  // Derived from the commit shown, not stored: a later commit with a fourth artifact naming RULE ONE, read by a new page load.
  await srv.change(UC4, uc("UC-004", ["RULE ONE"]));
  const later = await openDashboard({ server: srv, hash: `#spec/${QNAME}/01` });
  assert.deepEqual(listed(impactOf(later.main()))["RULE ONE"].ids, ["UC-001", "UC-002", "UC-004", T1]);
});

test("UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test", async () => {
  const srv = await repoServer({ files: FILES });
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/02` });
  assert.equal(impactOf(page.main()), null, "no list: the entry touches no existing requirement");
  assert.match(page.main(), /data-accept-key/, "Accept is offered as before");
  assert.deepEqual(graphReads(page.requests), [], "nothing read for a list that is not shown");
});

test("UC-006 3b: a withdrawn requirement's entry lists what still names it", async () => {
  const srv = await repoServer({ files: FILES });
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/03` });
  const section = impactOf(page.main());
  assert.ok(section, "the entry shows an impact list");
  assert.deepEqual(listed(section), { "RULE TWO": { change: "withdraw", ids: ["UC-002", "ARC-001", "MOD-reader"] } });
  assert.match(section, /withdraw/i);
});

test("UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why", async () => {
  // The server fails on one of the tests the list reads.
  const failing = (url) => (url.pathname.endsWith(`/contents/${T3}`) ? new Response("{}", { status: 500 }) : undefined);
  const srv = await repoServer({ files: FILES, handlers: [failing] });
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/01` });
  const section = impactOf(page.main());
  assert.ok(section, "the place of the list is shown");
  assert.match(section, /<p class="warn">The impact list could not be derived:[^]*cannot be\s+accepted/);
  assert.doesNotMatch(page.main(), /data-accept-key/, "no Accept without the list");
  assert.match(page.main(), /In the SPEC now[^]*<h3>Proposed<\/h3>/, "the entry itself is still shown");
});

// ---------------------------------------------------------------- an entry that takes a requirement out of its section
//
// UC-006 step 6 replaces the entry's section byte for byte: a requirement of that section the entry no longer states — renamed in
// place, or left out — leaves the SPEC when the entry is accepted, while what names it still does. The graph learns the section
// an entry replaces from the queue's index.md among its files (MOD-traceability linkGraph); the view hands it the index the queue
// view has read already and, for an entry whose heading another entry of the queue creates, that entry too.

const RENAMED = `## 1. One\n\n${rule("RULE ONE RENAMED", "The first rule, under a new name.", "`tests/one.test.mjs`")}`;
const LEFT_OUT = "## 1. One\n\nThe first section states no rule any more.\n";

test("UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept", async () => {
  for (const [what, text] of [["renamed in place", RENAMED], ["left out", LEFT_OUT]]) {
    const srv = await repoServer({ files: { ...FILES, [`${QD}/01-one.md`]: text } });
    const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/01` });
    const html = page.main(), section = impactOf(html);
    assert.ok(section, `${what}: the entry shows an impact list`);
    assert.deepEqual(listed(section), { "RULE ONE": { change: "withdraw", ids: ["UC-001", "UC-002", T1] } }, what);
    const at = html.indexOf('id="spec-impact"');
    assert.ok(html.indexOf("data-accept-key") > at, `${what}: Accept comes after the impact list`);
    // The index is the one the queue view read: one read per load, none of the list's own.
    assert.equal(fileReads(page.requests).filter((r) => r === `file ${QD}/index.md`).length, 1, `${what}: the index is read once`);
    assert.deepEqual(srv.writes, [], `${what}: opening writes nothing`);
  }
});

// Entry 04 splits "## 3. Three" and moves RULE THREE under a heading of its own, "## 3a. Sub"; entry 05 replaces that sub-section
// with a text that states no rule. Accepted after 04, entry 05 takes RULE THREE out of the SPEC.
const P04 = `## 3. Three\n\nThe third section, split.\n\n## 3a. Sub\n\n${rule("RULE THREE", "The third rule.")}`;
const P05 = "## 3a. Sub\n\nNothing is required here any more.\n";
const SPLIT = { ...FILES, [`${QD}/04-split.md`]: P04, [`${QD}/05-sub.md`]: P05,
  [`${QD}/index.md`]: `${INDEX}| 04 | \`SPEC.md\` | ## 3. Three | — | — |\n| 05 | \`SPEC.md\` | ## 3a. Sub | — | — |\n` };

test("UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out", async () => {
  const srv = await repoServer({ files: SPLIT });
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  const html = page.main(), section = impactOf(html);
  assert.match(html, /after entry 04|created by entry 04/, "the entry waits for entry 04, as before");
  assert.ok(section, "the entry shows an impact list");
  assert.deepEqual(listed(section), { "RULE THREE": { change: "withdraw", ids: ["UC-003", T3] } });
  assert.ok(html.indexOf("Accept entry 05") > html.indexOf('id="spec-impact"'), "the list stands before the accept panel");
});

// ---------------------------------------------------------------- the requests a load of an entry makes

test("UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache", async (t) => {
  const srv = await repoServer({ files: FILES });
  const caches = fakeCaches();
  const count = async (nn) => {
    const cold = (await openDashboard({ server: srv, hash: `#spec/${QNAME}/${nn}`, caches })).requests;
    const warm = (await openDashboard({ server: srv, hash: `#spec/${QNAME}/${nn}`, caches })).requests;
    t.diagnostic(`SPEC entry ${nn}: cold ${cold.length} requests (${fileReads(cold).length} files, ${graphReads(cold).length} of them `
      + `use cases, architecture or tests); warm ${warm.length} (${warm.join(", ")})`);
    return { cold, warm };
  };
  const two = await count("02");
  const one = await count("01");
  // Every file is read once and kept by its blob SHA: a second load reads no file.
  assert.deepEqual(fileReads(one.warm), []);
  assert.deepEqual(fileReads(two.warm), []);
  // The list reads the use cases, the architecture files and the tests of the commit, each once — and no other code file.
  assert.deepEqual(graphReads(one.cold).sort(), [UC1, UC2, UC3, ARC1, MODR, T1, T3].map((p) => `file ${p}`).sort());
  assert.ok(!one.cold.includes("file src/reader.mjs"), "a code file that is no test names no requirement and is not read");
});
