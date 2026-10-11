// The requirements that name no linked source (ITM-315) — MOD-source-register's sourceFindings, as the accepted text of
// docs/architecture/MOD-source-register.md states it: an error under A REQUIREMENT HAS A REGISTERED SOURCE for each requirement
// none of whose source items names a source the product links, naming the requirement, its line and its items. An item names
// the register entry whose identifier, title or — for a standard — designation it begins with, the longest such match, followed
// by the end of the item or by `, ` and the part (Data: How a requirement names a source).
// Run: node --test tests/source-register-findings.test.mjs
//
// Module: MOD-source-register
// Guards: UC-006; A REQUIREMENT HAS A REGISTERED SOURCE
// Level: unit
//
// The fixtures are small and ours: a register of six entries — the book, which the product links; SRC-x, a regulation, linked;
// a standard, linked, with its designation; SRC-unlinked, which the product does not link; and two entries whose titles are
// "Medical Devices" and "Medical Devices, Regulation", the second linked —, a links file, and a SPEC whose requirements are
// read by MOD-spec-document's parseSpec, which is where a Requirement and its line come from. The register and the links are
// read through MOD-documents, with the schemas sourceSchemas gives. What a test pins of a finding is what the module file
// states of it: its kind, its rule, its line — the requirement's own — and that it names the requirement and its items; the
// words are the code's, of which a test asks only that `what` and `fix` each say something in one line. Each test states its
// input and its expected result before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { parseSpec } from "../src/spec-document/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { sourceFindings, sourceSchemas } = sourceRegister;

// ---------------------------------------------------------------- the register, the links, the SPEC

const RULE = "A REQUIREMENT HAS A REGISTERED SOURCE";
const text = (...lines) => `${lines.join("\n")}\n`;

const entryText = ({ id, title, kind, extra = [] }) => text("---", `id: ${id}`, `title: ${title}`, `kind: ${kind}`, "authority: normative",
  "licence: may be republished — fixture", ...extra, "---", `# ${id} ${title}`, "", "A fixture source.");
const ENTRIES = [
  { id: "SRC-vibe-coding", title: "Vibe Coding", kind: "document" },
  { id: "SRC-x", title: "A fixture regulation", kind: "regulation" },
  { id: "SRC-iec-62304", title: "Medical device software", kind: "standard", extra: ["designation: IEC 62304:2006+AMD1:2015"] },
  { id: "SRC-unlinked", title: "An unlinked source", kind: "document" },
  { id: "SRC-medical", title: "Medical Devices", kind: "regulation" },
  { id: "SRC-medical-regulation", title: "Medical Devices, Regulation", kind: "regulation" },
];
const register = () => ENTRIES.map((entry) => readDocument(sourceSchemas().entry, `docs/sources/${entry.id}.md`, entryText(entry)));

const SHA = "0".repeat(64);
const linkRow = (id, part = "") => `| ${id} | 2026-10-05 | ${SHA} | ${part} |`;
const links = () => readDocument(sourceSchemas().links, "docs/sources.md", text("# The sources this product meets", "",
  "| Source | Version | Hash | Part |", "|---|---|---|---|", linkRow("SRC-vibe-coding"), linkRow("SRC-x", "Art. 13"),
  linkRow("SRC-iec-62304", "class B"), linkRow("SRC-medical-regulation")));

// A requirement is its head line, its rule and its check; the head line holds the source as written.
const head = (name, source) => (source === null ? `**${name}**` : `**${name}** *(${source})*`);
const REQUIREMENTS = [
  ["NAMES THE BOOK BY ITS TITLE", "Vibe Coding, ch. 9"],
  ["NAMES A SOURCE BY ITS IDENTIFIER", "SRC-x, Art. 13"],
  ["NAMES A STANDARD BY ITS DESIGNATION", "IEC 62304:2006+AMD1:2015, 5.5.5"],
  ["NAMES THE LONGER OF TWO TITLES", "Medical Devices, Regulation, Art. 3"],
  ["NAMES AN ENTRY THE PRODUCT DOES NOT LINK", "SRC-unlinked, Art. 4"],
  ["NAMES NO ENTRY", "Product Owner; Whitepaper X"],
  ["BEGINS LIKE AN ENTRY BUT NAMES NONE", "Vibe Coding Handbook, ch. 1"],
  ["NAMES NO SOURCE", null],
  ["NAMES ONE LINKED SOURCE AMONG OTHERS", "Product Owner; Vibe Coding, ch. 2; SRC-unlinked, Art. 1"],
];
const SPEC_LINES = ["# Fixture product — Specification", "", "## Section", "",
  ...REQUIREMENTS.flatMap(([name, source]) => [head(name, source), "A rule that is one statement.", "*Check:* `tests/a.test.mjs`", ""])];
const SPEC = SPEC_LINES.join("\n");
// The requirements of the SPEC with these names, as parseSpec reads them, and the line each head stands on, counted here.
const requirementsNamed = (...names) => names.map((name) => parseSpec(SPEC).requirements.get(name));
const lineOf = (name) => SPEC_LINES.findIndex((line) => line.startsWith(`**${name}**`)) + 1;
const itemsOf = (name) => (REQUIREMENTS.find(([each]) => each === name)[1] ?? "").split(";").map((item) => item.trim()).filter(Boolean);

// What a test expects of the findings: one error under the rule for each requirement, on its line, naming it and its items.
function assertReported(found, names) {
  assert.deepEqual(found.map((each) => [each.kind, each.rule, each.line]), names.map((name) => ["error", RULE, lineOf(name)]));
  names.forEach((name, at) => {
    const line = formatFinding(found[at]);
    for (const named of [name, ...itemsOf(name)]) assert.ok(line.includes(named), `${named} is named in: ${line}`);
    for (const words of [found[at].what, found[at].fix]) assert.match(words, /^[^\n]+$/, `${name}: ${words}`);
  });
}

// ---------------------------------------------------------------- the check

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-006
// given: the register and the links above — the product links the book, SRC-x, the standard and the longer of the two Medical
//        Devices titles —, and four requirements: one whose item is `Vibe Coding, ch. 9`, one with `SRC-x, Art. 13`, one with
//        the standard's designation and a part, and one with `Medical Devices, Regulation, Art. 3`, which begins with both
//        Medical Devices titles, the longer of which the product links
// input: sourceFindings of the four requirements, the links and the register
// expect: no finding: the first item names the entry titled Vibe Coding, the second SRC-x, the third the standard by its
//         designation, the fourth the longer title, the longest match, and each entry is linked. Known positive: the requirement
//         whose item names SRC-unlinked, an entry the product does not link, is reported by the same call
test("sourceFindings — an item names the entry whose identifier, title or designation it begins with, the longest match", () => {
  const four = ["NAMES THE BOOK BY ITS TITLE", "NAMES A SOURCE BY ITS IDENTIFIER", "NAMES A STANDARD BY ITS DESIGNATION",
    "NAMES THE LONGER OF TWO TITLES"];
  assert.equal(sourceFindings(requirementsNamed("NAMES AN ENTRY THE PRODUCT DOES NOT LINK"), links(), register()).length, 1,
    "known positive: an unlinked entry is reported");

  assert.deepEqual(sourceFindings(requirementsNamed(...four), links(), register()), []);
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-006
// given: the same register and links; a requirement whose only item, `SRC-unlinked, Art. 4`, names an entry the product does
//        not link
// input: sourceFindings of it, the links and the register
// expect: one error under A REQUIREMENT HAS A REGISTERED SOURCE, on the line of the requirement's head, that names the
//         requirement and its item, in one line
test("sourceFindings — a requirement whose only item names an entry the product does not link is reported, with its line and its item", () => {
  const name = "NAMES AN ENTRY THE PRODUCT DOES NOT LINK";

  assertReported(sourceFindings(requirementsNamed(name), links(), register()), [name]);
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-006
// given: the same register and links; three requirements whose items name no entry: one with `Product Owner` and `Whitepaper
//        X`, one with `Vibe Coding Handbook, ch. 1`, which begins with an entry's title but is followed by neither the end of
//        the item nor `, `, and one that names no source at all
// input: sourceFindings of the three, the links and the register
// expect: three errors under A REQUIREMENT HAS A REGISTERED SOURCE, in the order of the requirements, each on the line of its
//         head and naming the requirement and its items — the first two items, the second's one item, the third none —
test("sourceFindings — a requirement whose items name no entry, and one with no item, are reported, with their lines and items", () => {
  const names = ["NAMES NO ENTRY", "BEGINS LIKE AN ENTRY BUT NAMES NONE", "NAMES NO SOURCE"];

  assertReported(sourceFindings(requirementsNamed(...names), links(), register()), names);
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-006
// given: the same register and links; a requirement with three items: `Product Owner`, which names no entry, `Vibe Coding, ch.
//        2`, which names the linked book, and `SRC-unlinked, Art. 1`, which names an entry the product does not link
// input: sourceFindings of it, the links and the register; and, as the known positive, of the same requirement without its
//        linked item
// expect: no finding for the requirement with one linked item among others; the requirement without it is reported
test("sourceFindings — a requirement with one linked item among others is not reported", () => {
  const [linkedAmongOthers] = requirementsNamed("NAMES ONE LINKED SOURCE AMONG OTHERS");
  const without = { ...linkedAmongOthers, source: "Product Owner; SRC-unlinked, Art. 1",
    sources: ["Product Owner", "SRC-unlinked, Art. 1"] };
  assert.equal(sourceFindings([without], links(), register()).length, 1, "known positive: without the linked item, it is reported");

  assert.deepEqual(sourceFindings([linkedAmongOthers], links(), register()), []);
});
