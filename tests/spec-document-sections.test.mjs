// A SPEC section's exact bytes, its replacement, and the names it holds (ITM-302) — MOD-spec-document's sectionText,
// replaceSection, requirementNamesIn and renamedRequirements, as docs/architecture/MOD-spec-document.md states them: the exact
// bytes of the section whose heading line is given, or null; the SPEC with that section's bytes replaced by the text given,
// byte for byte, every other byte unchanged — a heading not yet in the SPEC added as a new section after the preceding section
// that the text passed holds, SectionNotFound where neither is possible —; the names of the requirements a text holds as head
// lines, in order; and, for two versions of a section, the names the second no longer holds and the names it holds new.
// requirementFindings and parseSpec are not part of ITM-302 and are not tested here.
// Run: node --test tests/spec-document-sections.test.mjs
//
// Module: MOD-spec-document
// Guards: THE APPROVED TEXT IS TAKEN VERBATIM; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; UC-006; UC-018
// Level: unit
//
// Every text read here is a fixture SPEC written out below, line by line with its line end; no test opens Agent M's own SPEC.md
// (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). The expected values are built from the same pieces the SPEC is, never from the code: a
// replacement is the pieces before the section, the text given, and the pieces after it. Each test names the requirements it
// guards and states its input and its expected result before it runs (given / input / expect); where a test expects something not
// to be found, the same call is first shown to find it on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { sectionText, replaceSection, requirementNamesIn, renamedRequirements } from "../src/spec-document/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

// ---------------------------------------------------------------- the SPEC of the fixtures
//
// Four pieces, in the order they stand: a preamble; section 1, in line feeds; section 2, in CR LF, with trailing spaces, a line of
// blanks, a subheading and two empty lines at its end; and section 3, the last, without a line end at the end of the text.

const PREAMBLE = lines("# Fixture product — Specification", "", "**VERBINDLICH (SPEC)**", "", "The binding document of a fixture.", "");
const GATES = lines(
  "## 1. Gates",
  "",
  "**A GATE IS REVIEWED** *(Product Owner)*",
  "A gate is reviewed by a person.",
  "*Check:* `tests/test_gate.py`",
  "",
);
const RECORDS = [
  "## 2. Records\r\n",
  "\r\n",
  "**A GATE DECISION IS KEPT** *(Product Owner)*  \r\n",
  "Every decision at a gate is kept as a record.  \r\n",
  "*Check:* no automatic check; at review.\r\n",
  "   \r\n",
  "### 2.1 Notes\r\n",
  "\r\n",
  "A subheading stays inside its section.\r\n",
  "\r\n",
  "\r\n",
].join("");
const EXPORT = [
  "## 3. Export\n",
  "\n",
  "**THE EXPORT IS A PDF** *(Product Owner)*\n",
  "The export of a report is one PDF file.\n",
  "*Check:* `tests/export.test.mjs`",
].join("");
const SPEC = PREAMBLE + GATES + RECORDS + EXPORT;

// ---------------------------------------------------------------- a section's exact bytes

// guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; UC-006 (step 2, the current section is shown); UC-018 (step 2, its blob SHA is noted)
// given: SPEC — a preamble, section 1 in line feeds, section 2 in CR LF with trailing spaces after two of its lines, a line of three
//        blanks, a subheading `### 2.1 Notes` and two empty lines at its end, and section 3, the last, with no line end at the end
//        of the text
// input: sectionText(SPEC, heading) for `## 1. Gates`, `## 2. Records` and `## 3. Export`
// expect: for each, exactly the bytes of the section — from its heading line to the byte before the next heading of level two, or to
//         the end of the text —: GATES; RECORDS, every CR, every trailing space, the line of blanks, the subheading and the two
//         empty lines kept; EXPORT, with no line end added at its end
test("sectionText — the exact bytes of a section, from its heading line to the next heading of level two or the end of the text", () => {
  assert.equal(sectionText(SPEC, "## 1. Gates"), GATES);
  assert.equal(sectionText(SPEC, "## 2. Records"), RECORDS);
  assert.equal(sectionText(SPEC, "## 3. Export"), EXPORT);
});

// guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; UC-006 (step 2)
// given: SPEC; and headings it lacks — a section 4, the heading `## 1. Gat`, which only begins a heading line of SPEC, the title
//        line of level one, and `### 2.1 Notes`, a subheading, which is no section
// input: sectionText(SPEC, heading) for each; and, to show that the same call finds a section that is there, for `## 1. Gates`
// expect: null for each of the four headings the text lacks; for `## 1. Gates` its bytes, not null
test("sectionText — null for a heading the text lacks", () => {
  // Known positive: the same call returns a section that is there.
  assert.equal(sectionText(SPEC, "## 1. Gates"), GATES);
  for (const heading of ["## 4. Missing", "## 1. Gat", "# Fixture product — Specification", "### 2.1 Notes"]) {
    assert.equal(sectionText(SPEC, heading), null, heading);
  }
});

// ---------------------------------------------------------------- a section's replacement

// A replacement for section 2: in line feeds and in CR LF, with a trailing space, and ending in one empty line.
const NEW_RECORDS = "## 2. Records\n\n**A GATE DECISION IS KEPT** *(Product Owner)*\r\nEvery decision at a gate is kept, signed. \r\n" +
  "*Check:* no automatic check; at review.\n\n";

// guards: THE APPROVED TEXT IS TAKEN VERBATIM; UC-006 (step 6, the section is replaced byte for byte); UC-018 (step 6)
// given: SPEC; NEW_RECORDS — a text for section 2 in line feeds and CR LF, with a trailing space and one empty line at its end
// input: replaceSection(SPEC, "## 2. Records", NEW_RECORDS); and replaceSection(SPEC, heading, sectionText(SPEC, heading)) for each
//        of the three sections
// expect: PREAMBLE + GATES + NEW_RECORDS + EXPORT — the bytes of section 2 replaced by NEW_RECORDS exactly, every other byte of
//         SPEC, the CR LF of none of them touched, as they were; and, for the section's own bytes given back, SPEC unchanged
test("replaceSection — the bytes of the section replaced by the text given, byte for byte, every other byte unchanged", () => {
  assert.equal(replaceSection(SPEC, "## 2. Records", NEW_RECORDS), PREAMBLE + GATES + NEW_RECORDS + EXPORT);
  for (const heading of ["## 1. Gates", "## 2. Records", "## 3. Export"]) {
    assert.equal(replaceSection(SPEC, heading, sectionText(SPEC, heading)), SPEC, heading);
  }
});

// A replacement for the last section: one line without a line end, and one that ends in three line feeds.
const NEW_EXPORT = "## 3. Export\n\n**THE EXPORT IS A PDF** *(Product Owner)*\nThe export of a report is one PDF file, signed.\n*Check:* `tests/export.test.mjs`";
const NEW_EXPORT_ENDED = `${NEW_EXPORT}\n\n\n`;

// guards: THE APPROVED TEXT IS TAKEN VERBATIM; UC-006 (step 6)
// given: SPEC, whose last section, section 3, has no line end at the end of the text; NEW_EXPORT, a text for it with no line end at
//        its end, and NEW_EXPORT_ENDED, the same ending in three line feeds
// input: replaceSection(SPEC, "## 3. Export", text) for each of the two
// expect: PREAMBLE + GATES + RECORDS + the text, exactly — no line end added to the first, none of the three taken from the second
test("replaceSection — the last section is replaced up to the end of the text, nothing added or taken", () => {
  assert.equal(replaceSection(SPEC, "## 3. Export", NEW_EXPORT), PREAMBLE + GATES + RECORDS + NEW_EXPORT);
  assert.equal(replaceSection(SPEC, "## 3. Export", NEW_EXPORT_ENDED), PREAMBLE + GATES + RECORDS + NEW_EXPORT_ENDED);
});

// A new section, to stand after section 1.
const ARCHIVE = lines("## 1a. Archive", "", "**A RECORD IS ARCHIVED** *(Product Owner)*", "A record is archived once.", "*Check:* no automatic check; at review.", "");

// guards: THE APPROVED TEXT IS TAKEN VERBATIM; UC-006 (step 6, alternative 4d: a heading that another entry creates)
// given: SPEC, which holds no heading `## 1a. Archive`; ARCHIVE, a section with that heading; and the text GATES + ARCHIVE, which
//        holds the preceding section, section 1, and after it the new one
// input: replaceSection(SPEC, "## 1a. Archive", GATES + ARCHIVE)
// expect: PREAMBLE + GATES + ARCHIVE + RECORDS + EXPORT — the new section added after section 1, which stands once, and every
//         other byte as it was; sectionText of the result for `## 1a. Archive` is ARCHIVE
test("replaceSection — a heading not yet in the SPEC is added as a new section after the preceding section the text holds", () => {
  const added = replaceSection(SPEC, "## 1a. Archive", GATES + ARCHIVE);
  assert.equal(added, PREAMBLE + GATES + ARCHIVE + RECORDS + EXPORT);
  assert.equal(sectionText(added, "## 1a. Archive"), ARCHIVE);
});

// guards: THE APPROVED TEXT IS TAKEN VERBATIM; UC-006 (step 6, alternative 5a: nothing is written when the section is not there)
// given: SPEC, which holds no heading `## 9. Missing`; and, to be given for it, a text of that section alone, a text that begins
//        with a section SPEC lacks too, and a text with no heading line at all
// input: replaceSection(SPEC, "## 9. Missing", text) for each; and, to show that the same call does not throw where the section is
//        there, replaceSection(SPEC, "## 3. Export", NEW_EXPORT)
// expect: an error named SectionNotFound for each of the three, whose message names the heading `## 9. Missing`; none for the known
//         positive
test("replaceSection — SectionNotFound, naming the heading, where neither the heading nor a preceding section is in the SPEC", () => {
  // Known positive: the same function does not throw where the section is there.
  assert.doesNotThrow(() => replaceSection(SPEC, "## 3. Export", NEW_EXPORT));
  const texts = {
    "the section alone": lines("## 9. Missing", "", "Its text."),
    "a text that begins with a section SPEC lacks": lines("## 8. Also missing", "", "Its text.", "", "## 9. Missing", "", "Its text."),
    "a text with no heading line": lines("No heading here.", "", "Its text."),
  };
  for (const [label, text] of Object.entries(texts)) {
    assert.throws(() => replaceSection(SPEC, "## 9. Missing", text),
      (error) => error instanceof Error && error.name === "SectionNotFound" && error.message.includes("## 9. Missing"), label);
  }
});

// ---------------------------------------------------------------- the names a text holds

// The requirements of a section in the order they stand: one whose name is not in capitals, one with an apostrophe, and two
// whose heads stand among text that is no head line — a bold line of prose and the head line of a use case's identifier.
const NAMED = lines(
  "## 4. Names",
  "",
  "**A bold line of prose** and nothing else.",
  "",
  "**A GATE IS REVIEWED** *(Product Owner)*",
  "A gate is reviewed by a person.",
  "*Check:* `tests/test_gate.py`",
  "",
  "**UC-007** *(a use case is no requirement)*",
  "Its text.",
  "",
  "**A gate is recorded** *(Product Owner)*",
  "Every decision at a gate is kept as a record.",
  "*Check:* no automatic check; at review.",
  "",
  "**DON'T REPEAT YOURSELF** *(Vibe Coding, ch. 10 §3)*",
  "An architecture defines each rule in one place.",
  "*Check:* no automatic check; at review.",
);

// guards: A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; UC-018 (step 3a, the names an edit touches)
// given: NAMED — a section holding three requirements, one of them named `A gate is recorded`, with a bold line of prose and the
//        head line `UC-007` of a use case's identifier among them; and the whole SPEC; and a text with no requirement
// input: requirementNamesIn of each
// expect: for NAMED the three names in the order they stand — `A GATE IS REVIEWED`, `A gate is recorded`, `DON'T REPEAT YOURSELF` —,
//         the prose and the identifier no name; for the whole SPEC its three requirements, in order; for the text with none, none
test("requirementNamesIn — the names of the requirements a text holds as head lines, in order", () => {
  assert.deepEqual(requirementNamesIn(NAMED), ["A GATE IS REVIEWED", "A gate is recorded", "DON'T REPEAT YOURSELF"]);
  assert.deepEqual(requirementNamesIn(SPEC), ["A GATE IS REVIEWED", "A GATE DECISION IS KEPT", "THE EXPORT IS A PDF"]);
  assert.deepEqual(requirementNamesIn(PREAMBLE), []);
});

// ---------------------------------------------------------------- a rename, and a changed rule

// A section in two versions of its one requirement beside two that stay, and a third version in which a rule is changed.
const requirement = (name, rule) => lines(`**${name}** *(Product Owner)*`, rule, "*Check:* no automatic check; at review.", "");
const STAYS = requirement("A GATE IS REVIEWED", "A gate is reviewed by a person.") + requirement("A GATE IS CLOSED", "A gate is closed by a person.");
const BEFORE = lines("## 1. Gates", "") + STAYS + requirement("A GATE IS RECORDED", "Every decision at a gate is kept.");
const RENAMED = lines("## 1. Gates", "") + STAYS + requirement("A GATE DECISION IS RECORDED", "Every decision at a gate is kept.");
const RULE_CHANGED = lines("## 1. Gates", "") + STAYS + requirement("A GATE IS RECORDED", "Every decision at a gate is kept, with its reason.");

// guards: A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; UC-018 (step 3a, a changed name is a withdrawal plus an addition)
// given: BEFORE — a section of three requirements, the third `A GATE IS RECORDED`; RENAMED — the same with the third under the name
//        `A GATE DECISION IS RECORDED` and its rule as it was; and a pair in which the second version drops `A GATE IS CLOSED`,
//        renames the third and adds `A GATE IS REOPENED`
// input: renamedRequirements(BEFORE, RENAMED); and renamedRequirements(BEFORE, the second version of the pair)
// expect: for the rename, `A GATE IS RECORDED` withdrawn and `A GATE DECISION IS RECORDED` added, nothing else; for the pair,
//         withdrawn `A GATE IS CLOSED` and `A GATE IS RECORDED`, in the order they stand in the first version, and added
//         `A GATE DECISION IS RECORDED` and `A GATE IS REOPENED`, in the order they stand in the second
test("renamedRequirements — a rename is one name withdrawn and one added", () => {
  assert.deepEqual(renamedRequirements(BEFORE, RENAMED), { withdrawn: ["A GATE IS RECORDED"], added: ["A GATE DECISION IS RECORDED"] });
  const dropsAndAdds = lines("## 1. Gates", "") + requirement("A GATE IS REVIEWED", "A gate is reviewed by a person.") +
    requirement("A GATE DECISION IS RECORDED", "Every decision at a gate is kept.") + requirement("A GATE IS REOPENED", "A gate is reopened by a person.");
  assert.deepEqual(renamedRequirements(BEFORE, dropsAndAdds), {
    withdrawn: ["A GATE IS CLOSED", "A GATE IS RECORDED"],
    added: ["A GATE DECISION IS RECORDED", "A GATE IS REOPENED"],
  });
});

// guards: A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED; UC-018 (step 3a, a change under the existing name is neither)
// given: BEFORE; RULE_CHANGED — the same section with the rule of `A GATE IS RECORDED` changed and its name as it was; and RENAMED
// input: renamedRequirements(BEFORE, RULE_CHANGED) and renamedRequirements(BEFORE, BEFORE); and, to show that the same call finds a
//        change of name, renamedRequirements(BEFORE, RENAMED)
// expect: nothing withdrawn and nothing added for the changed rule, and for a section compared with itself; for the rename, one
//         name withdrawn and one added
test("renamedRequirements — a changed rule under the same name is neither withdrawn nor added", () => {
  // Known positive: the same call finds a change of name.
  assert.deepEqual(renamedRequirements(BEFORE, RENAMED).withdrawn, ["A GATE IS RECORDED"]);
  assert.deepEqual(renamedRequirements(BEFORE, RULE_CHANGED), { withdrawn: [], added: [] });
  assert.deepEqual(renamedRequirements(BEFORE, BEFORE), { withdrawn: [], added: [] });
});
