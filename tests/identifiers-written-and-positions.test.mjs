// The identifiers a text writes and its references by position (ITM-298) — MOD-identifiers' identifiersIn, positionalReferences
// and pagesAddress, as the accepted text of docs/architecture/MOD-identifiers.md states them. `nextIdentifier` is not part of
// this item.
// Run: node --test tests/identifiers-written-and-positions.test.mjs
//
// Module: MOD-identifiers
// Guards: UC-007; UC-019; EVERY ARTIFACT HAS AN IDENTIFIER; A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION; AN INSTANCE IS A FORK OF AGENT M
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Where a test expects that
// something is not found, not reported or refused, the same call is first shown to find, report or accept a known positive.
// Every text is written in the test; nothing is read from a file or from the network.

import test from "node:test";
import assert from "node:assert/strict";
import { identifiersIn, positionalReferences, pagesAddress } from "../src/identifiers/index.mjs";

const RULE = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";

// TST-472254 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: a Markdown text of 13 lines that writes the nine kinds of the scheme — a requirement in each of the three forms the module file names (a list item of the front matter, line 4; the bold head of a requirement, line 8; backticks, line 13) and a UC, ARC, MOD, SRC, TST, ITM, RES and JOB identifier in the front matter, a heading and running text; UC-022 stands twice, and two identifiers share lines 9, 10 and 11
// input: identifiersIn("docs/example.md", the text)
// expect: one place { id, kind, path: "docs/example.md", line } for every occurrence, in the order of the text, each with the line it stands on: UC-022 on 2 and 6, the three requirement names on 4, 8 and 13, ARC-048 and MOD-identifiers on 9, SRC-eu-ai-act and TST-014 on 10, ITM-202 and RES-alex-cluster on 11, the JOB on 12
test("identifiersIn — every kind of the scheme is found with its line", () => {
  const path = "docs/example.md";
  const text = [
    "---",
    "id: UC-022",
    "realises:",
    "  - THE NAME IS THE ID AND IT SURVIVES",
    "---",
    "# UC-022 Example",
    "",
    "**EVERY ARTIFACT HAS AN IDENTIFIER** *(PO A. Maier)*",
    "It follows ARC-048 and is built in MOD-identifiers.",
    "SRC-eu-ai-act is its source, and TST-014 tests it.",
    "ITM-202 builds RES-alex-cluster.",
    "The job JOB-20261005-0900-a1b2 ran.",
    "It guards `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`.",
  ].join("\n");
  const at = (id, kind, line) => ({ id, kind, path, line });
  assert.deepEqual(identifiersIn(path, text), [
    at("UC-022", "UC", 2),
    at("THE NAME IS THE ID AND IT SURVIVES", "requirement", 4),
    at("UC-022", "UC", 6),
    at("EVERY ARTIFACT HAS AN IDENTIFIER", "requirement", 8),
    at("ARC-048", "ARC", 9),
    at("MOD-identifiers", "MOD", 9),
    at("SRC-eu-ai-act", "SRC", 10),
    at("TST-014", "TST", 10),
    at("ITM-202", "ITM", 11),
    at("RES-alex-cluster", "RES", 11),
    at("JOB-20261005-0900-a1b2", "JOB", 12),
    at("A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION", "requirement", 13),
  ]);
});

// TST-472255 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: a text of 4 lines — the bold word `**REGISTER**` that stands under the title of a document and heads no requirement, a requirement's name and a capitalised word, NOTE, written in plain prose, and — known positive — the same requirement name between backticks on line 4
// input: identifiersIn("docs/prose.md", the text)
// expect: a single place, the name between the backticks on line 4: neither the name written in prose, nor NOTE, nor REGISTER is taken for a requirement
test("identifiersIn — a name written in prose is not taken for a requirement", () => {
  const path = "docs/prose.md";
  const text = [
    "**REGISTER**",
    "",
    "THE NAME IS THE ID AND IT SURVIVES is written here in plain prose, and NOTE is a capitalised word.",
    "Known positive: `THE NAME IS THE ID AND IT SURVIVES` stands between backticks.",
  ].join("\n");
  assert.deepEqual(identifiersIn(path, text), [
    { id: "THE NAME IS THE ID AND IT SURVIVES", kind: "requirement", path, line: 4 },
  ]);
});

// TST-472256 · level: unit · module: MOD-identifiers
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: a text of 6 lines, line 1 its title and each of lines 2 to 6 one sentence that points at a part of an artifact of the product by its position: a step number (line 2, "UC-007 step 5"), a section sign (3, "§3"), a section number in words (4, "section 4"), a line number (5, "line 12") and a file and its line (6, "SPEC.md:7")
// input: positionalReferences("docs/backlog/ITM-901-a-note.md", the text)
// expect: five findings, in the order of the text, one for each of lines 2 to 6, each { artifact: the path, line: that line, kind: "warning", rule: "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION" } whose `what` names the reference as it is written there and whose `fix` is a correction
test("positionalReferences — a step, a section and a line number are each reported, with the line", () => {
  const path = "docs/backlog/ITM-901-a-note.md";
  const cases = [
    ["a step number", "The check is described in UC-007 step 5.", "step 5"],
    ["a section sign", "The rule stands in SPEC §3.", "§3"],
    ["a section number in words", "It is defined in section 4 of the SPEC.", "section 4"],
    ["a line number", "The failure is reported at line 12.", "line 12"],
    ["a file and its line", "The rule stands in SPEC.md:7.", "SPEC.md:7"],
  ];
  const text = ["# A note", ...cases.map(([, sentence]) => sentence)].join("\n");
  const found = positionalReferences(path, text);
  assert.equal(found.length, cases.length, `one finding for each of ${cases.length} references: ${JSON.stringify(found)}`);
  cases.forEach(([label, , reference], i) => {
    const f = found[i];
    assert.equal(f.artifact, path, label);
    assert.equal(f.line, i + 2, label);
    assert.equal(f.kind, "warning", label);
    assert.equal(f.rule, RULE, label);
    assert.ok(f.what.includes(reference), `${label}: what names "${reference}", not ${JSON.stringify(f.what)}`);
    assert.ok(typeof f.fix === "string" && f.fix.length > 0, `${label}: the finding says the correction expected`);
  });
});

// TST-472257 · level: unit · module: MOD-identifiers
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: a text of 3 lines — line 2 names the book's chapters and sections ("ch. 12 §6", "ch. 10 §3") and, in the same line, the product's own "SPEC §3" (known positive); line 3 names "Chapter 9 §6", "chapter 7, section 5" and "chapters 9, 11, 12 and 13" of the book
// input: positionalReferences("docs/note.md", the text)
// expect: a single finding, on line 2, for "§3" of the SPEC: no chapter or section of the book is reported, and the book's chapter in front of a section does not excuse the SPEC's section later in its line
test("positionalReferences — a book's chapter and its sections are not reported", () => {
  const path = "docs/note.md";
  const text = [
    "# A note",
    "The book (Vibe Coding, ch. 12 §6, ch. 10 §3) says so; SPEC §3 does not.",
    "Chapter 9 §6 makes the argument; see chapter 7, section 5, and chapters 9, 11, 12 and 13.",
  ].join("\n");
  const found = positionalReferences(path, text);
  assert.equal(found.length, 1, `only the SPEC's section: ${JSON.stringify(found)}`);
  assert.equal(found[0].line, 2);
  assert.equal(found[0].rule, RULE);
  assert.ok(found[0].what.includes("§3"), `what names the SPEC's §3, not ${JSON.stringify(found[0].what)}`);
});

// TST-472258 · level: unit · module: MOD-identifiers
// guards: AN INSTANCE IS A FORK OF AGENT M
// given: the instances akmaier/agent-m and alice/research-agent, each written owner/name
// input: pagesAddress of each
// expect: the address of its GitHub Pages site, https://<owner>.github.io/<name>/ — the dashboard of the instance
test("pagesAddress — the dashboard's GitHub Pages address of the instance owner/name", () => {
  assert.equal(pagesAddress("akmaier/agent-m"), "https://akmaier.github.io/agent-m/");
  assert.equal(pagesAddress("alice/research-agent"), "https://alice.github.io/research-agent/");
});

// TST-472259 · level: unit · module: MOD-identifiers
// guards: AN INSTANCE IS A FORK OF AGENT M
// given: a known positive, akmaier/agent-m; then eight strings that are not owner/name — the empty string, "agent-m" (no slash), "akmaier/" (no name), "/agent-m" (no owner), "akmaier/agent-m/extra" (three parts), "akmaier agent-m" (a space for the slash), "akmaier/agent m" (a space in the name) and the repository's web address
// input: pagesAddress of each
// expect: the known positive gives its address; each of the eight throws a TypeError
test("pagesAddress — a string that is not owner/name is refused with a TypeError", () => {
  assert.equal(pagesAddress("akmaier/agent-m"), "https://akmaier.github.io/agent-m/", "known positive: owner/name is accepted");
  for (const bad of ["", "agent-m", "akmaier/", "/agent-m", "akmaier/agent-m/extra", "akmaier agent-m", "akmaier/agent m",
    "https://github.com/akmaier/agent-m"]) {
    assert.throws(() => pagesAddress(bad), TypeError, `${JSON.stringify(bad)} is not owner/name`);
  }
});
