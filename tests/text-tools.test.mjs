// The text tools of a declaration (ITM-212), and a date is history only as the date of a change (ITM-225) — MOD-text-tools'
// interface as docs/architecture/MOD-text-tools.md states it: the front matter, the finding in its one text form, git's blob
// SHA, the marks of history in a document, and the line difference of two texts. `sha256` is not part of ITM-212 and is not
// tested here.
// Run: node --test tests/text-tools.test.mjs
//
// Module: MOD-text-tools
// Guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE; A DOCUMENT HOLDS NO HISTORY; AN APPROVAL NAMES THE EXACT TEXT; A REFUSED SAVE KEEPS THE EDIT; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// Level: unit
//
// Every expected value is read from the module file's Data and Interfaces. Each test names the requirement it guards and
// states its input and its expected result before it runs (given / input / expect); where a test asserts that nothing is
// found, the same call is first shown to find something on a known positive. The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  parseFrontMatter, formatFrontMatter, finding, formatFinding, parseFinding, blobSha, lineDiff, historyMarks,
} from "../src/text-tools/index.mjs";

// ---------------------------------------------------------------- front matter (Data: Front matter)
//
// Three texts. WITH has front matter written in the form formatFrontMatter writes: a value as text, a list one item per line,
// an empty list as `key:` alone — a declaration of how a product is developed, as UC-002 keeps it. NONE has none. BROKEN
// opens a front matter and never closes it.

const WITH = [
  "---",                                                // 1
  "model: scrum-wip",                                   // 2
  "model_file: docs/process-models/scrum-wip.md",       // 3
  "model_version: 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63", // 4
  "practices:",                                         // 5
  "  - devops",                                         // 6
  "  - prototyping",                                    // 7
  "gates:",                                             // 8
  "sprint_close: scrum-master-session",                 // 9
  "---",                                                // 10
  "# How the product is developed",                     // 11 — the body begins here
  "",
  "**REGISTER**",
  "",
].join("\n");
const WITH_FIELDS = {
  model: "scrum-wip",
  model_file: "docs/process-models/scrum-wip.md",
  model_version: "4c60cfe5a8bc8c00dcf6705b5decb42823b73a63",
  practices: ["devops", "prototyping"],
  gates: [],
  sprint_close: "scrum-master-session",
};
const WITH_ORDER = ["model", "model_file", "model_version", "practices", "gates", "sprint_close"];
const WITH_BODY = "# How the product is developed\n\n**REGISTER**\n";

const NONE = "# How the product is developed\n\n**REGISTER**\n\nThe roles are assigned below.\n";

const BROKEN = "---\nmodel: scrum-wip\npractices:\n  - devops\n# How the product is developed\n\n**REGISTER**\n";

// guards: UC-002 (the declaration is read from its front matter)
// given: WITH, a text whose front matter holds text values, a list of two items and an empty list
// input: parseFrontMatter(WITH)
// expect: the fields by key — the empty `gates:` a list —, the keys in the order they stand, the body as every byte after
//         the closing line, and 11 as the line on which the body begins
test("parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on", () => {
  assert.deepEqual(parseFrontMatter(WITH), { fields: WITH_FIELDS, order: WITH_ORDER, body: WITH_BODY, bodyLine: 11 });
});

// guards: UC-002
// given: WITH with its lines ended by CR LF; and a front matter whose values carry blanks around them and whose empty list is
//        written `[]`
// input: parseFrontMatter of each
// expect: CR LF — the same fields and order as WITH, no value keeping its CR, the body the text's own bytes after the closing
//         line, CRs included; blanks — every value trimmed; `[]` — an empty list, not the text "[]"
test("parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list", () => {
  const crlf = WITH.replace(/\n/g, "\r\n");
  assert.deepEqual(parseFrontMatter(crlf),
    { fields: WITH_FIELDS, order: WITH_ORDER, body: "# How the product is developed\r\n\r\n**REGISTER**\r\n", bodyLine: 11 });
  const text = "---\nid: UC-002\ntitle:   Declare how a product is developed   \nrealises: []\nactors:   \n---\nbody\n";
  assert.deepEqual(parseFrontMatter(text), {
    fields: { id: "UC-002", title: "Declare how a product is developed", realises: [], actors: [] },
    order: ["id", "title", "realises", "actors"], body: "body\n", bodyLine: 7,
  });
});

// guards: UC-002
// given: known positive first — WITH has front matter; then NONE, which has none; BROKEN, whose closing line is missing; and
//        WITH preceded by an empty line, so that it lacks the opening line
// input: parseFrontMatter of each
// expect: none of them throws; each of the three has empty fields and an empty order, and is all body, from line 1
test("parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body", () => {
  assert.notDeepEqual(parseFrontMatter(WITH).order, [], "known positive: WITH has front matter");
  for (const [label, text] of [["no front matter", NONE], ["no closing line", BROKEN], ["no opening line", `\n${WITH}`]]) {
    assert.deepEqual(parseFrontMatter(text), { fields: {}, order: [], body: text, bodyLine: 1 }, label);
  }
});

// guards: UC-002
// given: the three texts WITH, NONE and BROKEN
// input: formatFrontMatter of what parseFrontMatter read from each
// expect: each text back byte for byte — WITH, since it is written in this form; NONE and BROKEN, since they are all body
test("formatFrontMatter — what parseFrontMatter read gives back the same bytes", () => {
  for (const [label, text] of [["front matter", WITH], ["no front matter", NONE], ["broken front matter", BROKEN]]) {
    const { fields, order, body } = parseFrontMatter(text);
    assert.equal(formatFrontMatter(fields, order, body), text, label);
  }
});

// guards: UC-002
// given: fields whose keys stand in another order than `order` names, a list of two items, an empty list, and a body with
//        CR LF line ends
// input: formatFrontMatter(fields, ["a", "b", "c"], body)
// expect: the keys in the order of `order`, the list one item per line as `  - item`, the empty list as `c:` alone, then the
//         body unchanged
test("formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged", () => {
  assert.equal(formatFrontMatter({ c: [], b: ["x", "y"], a: "1" }, ["a", "b", "c"], "# Body\r\n"),
    "---\na: 1\nb:\n  - x\n  - y\nc:\n---\n# Body\r\n");
});

// guards: UC-002
// given: known positive first — a key and a value that may stand in front matter; then keys that are not [a-z][a-z0-9_-]*,
//        and values holding a line break, as a text and as a list item
// input: formatFrontMatter({ [key]: value }, [key], "")
// expect: the known positive is written; every other call throws a TypeError
test("formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError", () => {
  assert.equal(formatFrontMatter({ model_file: "x" }, ["model_file"], ""), "---\nmodel_file: x\n---\n", "known positive");
  for (const key of ["Model", "1st", "model version", "-model", ""]) {
    assert.throws(() => formatFrontMatter({ [key]: "x" }, [key], ""), TypeError, `key ${JSON.stringify(key)}`);
  }
  for (const value of ["scrum\nwip", "scrum\r\nwip", "scrum-wip\r", ["devops", "proto\ntyping"]]) {
    assert.throws(() => formatFrontMatter({ model: value }, ["model"], ""), TypeError, `value ${JSON.stringify(value)}`);
  }
});

// ---------------------------------------------------------------- the finding (Data: The finding)
//
// The module file's own example, as data and as its one line of text.

const EXAMPLE = {
  artifact: "UC-007", line: 12, kind: "error", rule: "A USE CASE REALISES NAMED REQUIREMENTS",
  what: "realises \"EXPORT AS PDF\" matches no requirement", fix: "use an existing name or remove the line",
};
const EXAMPLE_LINE = "UC-007:12: error: realises \"EXPORT AS PDF\" matches no requirement " +
  "[A USE CASE REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.";

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: the module file's example finding
// input: finding(EXAMPLE), then formatFinding of it
// expect: the finding with all six fields as given, and as text exactly the module file's line:
//         `UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE REALISES NAMED REQUIREMENTS] — use an
//         existing name or remove the line.`
test("finding and formatFinding — the module file's example, as data and as its one line of text", () => {
  const f = finding(EXAMPLE);
  assert.deepEqual(f, EXAMPLE);
  assert.equal(formatFinding(f), EXAMPLE_LINE);
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: four findings — the module file's example; a warning on a file without an identifier, named by its path; a finding
//        whose text holds brackets, a dash and a date and whose correction ends in a period of its own; and one under a rule
//        whose name holds an apostrophe and a comma
// input: parseFinding(formatFinding(finding(f))) for each
// expect: each finding read back unchanged
test("parseFinding — a finding written in its one text form is read back unchanged", () => {
  const findings = [
    EXAMPLE,
    { artifact: "docs/process.md", line: 3, kind: "warning", rule: "ONE STATEMENT PER REQUIREMENT",
      what: "the rule contains \"and\"", fix: "split it into two requirements, or keep it with a reason" },
    { artifact: "MOD-text-tools", line: 1, kind: "error", rule: "A DOCUMENT HOLDS NO HISTORY",
      what: "the line \"[withdrawn] — 2026-09-24\" records history", fix: "remove the note; the version history keeps it." },
    { artifact: "UC-005", line: 140, kind: "warning", rule: "THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED",
      what: "a class is taken without its rate", fix: "report the rate" },
  ];
  for (const f of findings) assert.deepEqual(parseFinding(formatFinding(finding(f))), f, `${f.artifact}:${f.line}`);
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — the module file's example passes; then the example with one field broken at a time: a kind
//        other than error or warning, a line that is not a whole number of at least 1, a rule that is not a requirement's
//        name in capitals (in small letters, an identifier, empty)
// input: finding(broken)
// expect: the example is returned; every broken one throws a TypeError
test("finding — a kind, a line or a rule out of its form throws a TypeError", () => {
  assert.deepEqual(finding({ ...EXAMPLE }), EXAMPLE, "known positive");
  const broken = [
    { kind: "info" }, { kind: "Error" }, { kind: undefined },
    { line: 0 }, { line: -3 }, { line: 1.5 }, { line: "12" }, { line: Number.NaN },
    { rule: "a use case realises named requirements" }, { rule: "UC-007" }, { rule: "" }, { rule: undefined },
  ];
  for (const part of broken) assert.throws(() => finding({ ...EXAMPLE, ...part }), TypeError, JSON.stringify(part));
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — the module file's line reads back as its finding; then lines of any other form: empty, prose,
//        the line without its closing period, with the kind `note`, with line 0, without a line, with its rule in small
//        letters, and broken over two lines
// input: parseFinding(line)
// expect: the finding for the known positive; null for every other line
test("parseFinding — null for any line of another form", () => {
  assert.deepEqual(parseFinding(EXAMPLE_LINE), EXAMPLE, "known positive");
  const others = [
    "",
    "The use case realises a name that matches no requirement.",
    EXAMPLE_LINE.slice(0, -1),
    EXAMPLE_LINE.replace(": error: ", ": note: "),
    EXAMPLE_LINE.replace("UC-007:12:", "UC-007:0:"),
    EXAMPLE_LINE.replace("UC-007:12:", "UC-007:"),
    EXAMPLE_LINE.replace("[A USE CASE REALISES NAMED REQUIREMENTS]", "[a use case realises named requirements]"),
    EXAMPLE_LINE.replace("matches no requirement", "matches\nno requirement"),
  ];
  for (const line of others) assert.equal(parseFinding(line), null, JSON.stringify(line));
});

// ---------------------------------------------------------------- git's blob SHA (Interfaces: blobSha)

// The SHA git itself gives for the same bytes.
const gitHashObject = (text) => execFileSync("git", ["hash-object", "--stdin"], { input: Buffer.from(text, "utf8") }).toString().trim();

// guards: AN APPROVAL NAMES THE EXACT TEXT
// given: texts with and without front matter, a broken one, an empty one, one beyond ASCII, one with CR LF line ends, and one
//        without a line end at its end
// input: await blobSha(text)
// expect: for each, 40 lowercase hexadecimal digits, the same as `git hash-object --stdin` gives for the text's UTF-8 bytes
test("blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes", async () => {
  const texts = {
    "front matter": WITH, "no front matter": NONE, "broken front matter": BROKEN, "empty": "",
    "beyond ASCII": "Grüße — „Prüfung“ ✓ 🙂\n", "CR LF": "a\r\nb\r\n", "no line end at the end": "a\nb",
  };
  for (const [label, text] of Object.entries(texts)) {
    const sha = await blobSha(text);
    assert.match(sha, /^[0-9a-f]{40}$/, label);
    assert.equal(sha, gitHashObject(text), label);
  }
});

// guards: AN APPROVAL NAMES THE EXACT TEXT
// given: the empty text and the text "hello\n", whose blob SHAs git names e69de29… (git's empty blob) and ce01362…; and a
//        text with LF line ends beside the same text with CR LF line ends
// input: await blobSha(text)
// expect: the two known SHAs; and two different SHAs for LF and CR LF — the text is hashed as given
test("blobSha — the known blobs, and a text hashed as given, line ends included", async () => {
  assert.equal(await blobSha(""), "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
  assert.equal(await blobSha("hello\n"), "ce013625030ba8dba906f756967f9e9ca394464a");
  const lf = "a\nb\n", crlf = "a\r\nb\r\n";
  assert.notEqual(await blobSha(lf), await blobSha(crlf));
  assert.equal(await blobSha(crlf), gitHashObject(crlf));
});

// ---------------------------------------------------------------- the marks of history (Interfaces: historyMarks)
//
// MARKED carries each kind of mark, in the forms the review layout's documents have carried them — in front matter, in a
// requirement's source, as a note, as a section, as a stamp — a date given as the date of a change, set off by a comma as
// an attribution, and one after the word "decided". It also carries a retrieval date: part of what a document states, and
// since ITM-225 no mark at all (A DOCUMENT HOLDS NO HISTORY — the forms are tested on their own below). UNMARKED states
// rules about withdrawing and changing, names identifiers and versions with digits, and records no history.

const MARKED = [
  "---",                                                                                 // 1
  "id: ARC-099",                                                                         // 2
  "withdrawn: 2026-09-30",                                                               // 3
  "---",                                                                                 // 4
  "# ARC-099 A decision",                                                                // 5
  "",                                                                                    // 6
  "**A RULE** *(PO A. Maier, 2026-09-23, reworded 2026-09-24 — withdrawn 2026-09-25)*", // 7
  "*Withdrawn:* replaced by A BETTER RULE.",                                             // 8
  "",                                                                                    // 9
  "## Withdrawn",                                                                        // 10
  "",                                                                                    // 11
  "Last edited by akmaier",                                                              // 12
  "Updated: 2026-10-02",                                                                 // 13
  "The rule holds as decided on 2026-10-01.",                                            // 14
  "The source was retrieved on 2026-10-03.",                                             // 15
].join("\n");
const MARKS = [
  { line: 3, kind: "withdrawal", text: "withdrawn: 2026-09-30" },
  { line: 7, kind: "dated-change", text: "2026-09-23" },
  { line: 7, kind: "edit-stamp", text: "reworded 2026-09-24" },
  { line: 7, kind: "withdrawal", text: "withdrawn 2026-09-25" },
  { line: 8, kind: "withdrawal", text: "*Withdrawn:* replaced by A BETTER RULE." },
  { line: 10, kind: "withdrawal", text: "## Withdrawn" },
  { line: 12, kind: "edit-stamp", text: "Last edited by akmaier" },
  { line: 13, kind: "edit-stamp", text: "Updated: 2026-10-02" },
  { line: 14, kind: "dated-change", text: "2026-10-01" },
];

const UNMARKED = [
  "---",
  "id: UC-002",
  "title: Declare how a product is developed",
  "realises:",
  "  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED",
  "---",
  "# UC-002 Declare how a product is developed",
  "",
  "An identifier travels with its artifact, and a withdrawn identifier is never reused.",
  "An edit that changes a requirement's name is proposed as the withdrawal of the old name.",
  "A file that no module owns is changed by no implementation job; a configuration edited by hand is shown.",
  "The job JOB-20261005-0900-a1b2 runs Agent M v2026.1.0; a date is written `YYYY-MM-DD`.",
  "",
].join("\n");

// guards: A DOCUMENT HOLDS NO HISTORY
// given: MARKED
// input: historyMarks(MARKED)
// expect: nine marks in the order they stand, each with its line — counted from the text's first line, front matter
//         included —, its kind and its text: the withdrawal of line 3; on line 7 the date 2026-09-23, the stamp
//         "reworded 2026-09-24" and the withdrawal "withdrawn 2026-09-25", their dates not marked again; the note of line 8;
//         the section of line 10; the stamps of lines 12 and 13; the date of line 14; line 15's retrieval date no mark
//         (ITM-225)
test("historyMarks — withdrawals, edit stamps and dates, each with its line and its kind", () => {
  assert.deepEqual(historyMarks(MARKED), MARKS);
});

// guards: A DOCUMENT HOLDS NO HISTORY
// given: MARKED with its lines ended by CR LF
// input: historyMarks of it
// expect: the same nine marks, no text keeping a CR
test("historyMarks — the same marks in a text with CR LF line ends", () => {
  assert.deepEqual(historyMarks(MARKED.replace(/\n/g, "\r\n")), MARKS);
});

// guards: A DOCUMENT HOLDS NO HISTORY
// given: known positive first — MARKED has marks; then UNMARKED, a text that records no history, and the empty text
// input: historyMarks of each
// expect: none in either
test("historyMarks — none in a text without them", () => {
  assert.ok(historyMarks(MARKED).length > 0, "known positive: MARKED has marks");
  assert.deepEqual(historyMarks(UNMARKED), []);
  assert.deepEqual(historyMarks(""), []);
});

// ---------------------------------------------------------------- a date of a change in its three forms (ITM-225)
//
// FORMS carries the three forms the module file names for the date of a change: after a word of decision, set off by a
// comma as a name's attribution, and set off by a comma as the label "PO".

const FORMS = [
  "PO decision 2026-09-23: the rule holds.",          // 1 — after a word of decision
  "A note on the budget (PO A. Maier, 2026-09-24).",  // 2 — set off by a comma, an attribution
  "PO, 2026-09-25: the wording is fine.",              // 3 — set off by a comma, the label "PO"
].join("\n");
const FORMS_MARKS = [
  { line: 1, kind: "dated-change", text: "2026-09-23" },
  { line: 2, kind: "dated-change", text: "2026-09-24" },
  { line: 3, kind: "dated-change", text: "2026-09-25" },
];

// guards: A DOCUMENT HOLDS NO HISTORY
// given: FORMS, one line per form the module file names for the date of a change: `PO decision <date>`,
//        `(PO A. Maier, <date>)` and `PO, <date>: …`
// input: historyMarks(FORMS)
// expect: each date marked dated-change, with its line, as the date alone
test("historyMarks — a date of a change in its three forms, each marked dated-change", () => {
  assert.deepEqual(historyMarks(FORMS), FORMS_MARKS);
});

// ---------------------------------------------------------------- dates that are no mark (ITM-225)
//
// NO_MARK carries a known positive first — a date of a change, so the check is shown to find something before it reports
// that it finds nothing (rule 6a) — then five dates a document states as what they are, with the words that say so: a
// retrieval date, the date of a version, of a release, of a measurement, and a date in a table's cell.

const NO_MARK = [
  "PO decision 2026-09-23: the rule holds.",            // 1 — known positive: this date is a mark
  "The source was retrieved on 2026-09-20.",            // 2 — a retrieval date
  "Model version 2026-09-01 is in use.",                // 3 — the date of a version
  "Release 2026-09-15 shipped the new dashboard.",      // 4 — the date of a release
  "Response time was measured 2026-09-24.",             // 5 — the date of a measurement
  "| Build | Date |",                                   // 6
  "| --- | --- |",                                      // 7
  "| nightly | 2026-09-21 |",                            // 8 — a date in a table's cell
].join("\n");

// guards: A DOCUMENT HOLDS NO HISTORY
// given: NO_MARK
// input: historyMarks(NO_MARK)
// expect: known positive — line 1's date is a mark; the other five dates (lines 2-5 and 8) are no mark, so the only mark
//         found is line 1's
test("historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark", () => {
  const marks = historyMarks(NO_MARK);
  assert.ok(marks.length > 0, "known positive: line 1 is a mark");
  assert.deepEqual(marks, [{ line: 1, kind: "dated-change", text: "2026-09-23" }]);
});

// ---------------------------------------------------------------- the line difference (Interfaces: lineDiff, DiffLine)

const same = (text, before, after) => ({ op: "same", text, before, after });
const added = (text, after) => ({ op: "added", text, before: null, after });
const removed = (text, before) => ({ op: "removed", text, before, after: null });
const linesOf = (text) => (text === "" ? [] : text.replace(/\r?\n$/, "").split(/\r?\n/));

// guards: A REFUSED SAVE KEEPS THE EDIT; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: before "a b c" and after "a B c d", one line each
// input: lineDiff(before, after)
// expect: every line of both, in order, each with its line before and after where it has one: a same (1, 1); B added
//         (–, 2) and b removed (2, –), the added line first where a change leaves the order open, as the dashboard's diff
//         shows it today (docs/assets/review-core.mjs); c same (3, 3); d added (–, 4). Read on one side, the lines are each
//         text's own lines in order.
test("lineDiff — every line of both texts, in order, each with its line before and after", () => {
  const before = "a\nb\nc\n", after = "a\nB\nc\nd\n";
  const diff = lineDiff(before, after);
  assert.deepEqual(diff, [same("a", 1, 1), added("B", 2), removed("b", 2), same("c", 3, 3), added("d", 4)]);
  const side = (ops, at) => diff.filter((d) => ops.includes(d.op)).map((d) => [d[at], d.text]);
  assert.deepEqual(side(["same", "removed"], "before"), linesOf(before).map((t, i) => [i + 1, t]), "the text before");
  assert.deepEqual(side(["same", "added"], "after"), linesOf(after).map((t, i) => [i + 1, t]), "the text after");
});

// guards: A REFUSED SAVE KEEPS THE EDIT; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: pairs of texts whose fewest added and removed lines are known — a line moved from the top to the end; three lines
//        reversed; two lines taken out between three kept; one line changed among six; one value changed in WITH's front
//        matter
// input: lineDiff(before, after)
// expect: exactly that many added and removed lines — for the moved line, the one line removed at the top and added at the
//         end, with the three others the same
test("lineDiff — as few added and removed lines as the two texts allow", () => {
  assert.deepEqual(lineDiff("a\nb\nc\nd\n", "b\nc\nd\na\n"),
    [removed("a", 1), same("b", 2, 1), same("c", 3, 2), same("d", 4, 3), added("a", 4)]);
  const count = (diff, op) => diff.filter((d) => d.op === op).length;
  const pairs = [
    // [label, before, after, removed, added]
    ["three lines reversed", "a\nb\nc\n", "c\nb\na\n", 2, 2],
    ["two lines taken out between three kept", "a\nx\nb\nx\nc\n", "a\nb\nc\n", 2, 0],
    ["one line changed among six", "1\n2\n3\n4\n5\n6\n", "1\n2\n9\n4\n5\n6\n", 1, 1],
    ["one value changed in front matter", WITH, WITH.replace("model: scrum-wip", "model: scrum"), 1, 1],
  ];
  for (const [label, before, after, r, a] of pairs) {
    const diff = lineDiff(before, after);
    assert.deepEqual([count(diff, "removed"), count(diff, "added")], [r, a], label);
  }
});

// guards: A REFUSED SAVE KEEPS THE EDIT; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: known positive first — two texts that differ in one line show that difference; then texts that differ only in their
//        line endings: LF against CR LF, and a last line with and without its line end
// input: lineDiff(before, after)
// expect: no added and no removed line — every line the same, numbered on both sides
test("lineDiff — a text that changed only its line endings shows no difference", () => {
  assert.deepEqual(lineDiff("a\nb\n", "a\nc\n"), [same("a", 1, 1), added("c", 2), removed("b", 2)], "known positive");
  assert.deepEqual(lineDiff("a\r\nb\r\nc", "a\nb\nc\n"), [same("a", 1, 1), same("b", 2, 2), same("c", 3, 3)]);
  assert.deepEqual(lineDiff("a\nb\n", "a\nb"), [same("a", 1, 1), same("b", 2, 2)]);
  assert.deepEqual(lineDiff(WITH, WITH.replace(/\n/g, "\r\n")).filter((d) => d.op !== "same"), []);
});

// guards: A REFUSED SAVE KEEPS THE EDIT; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: the empty text, which has no line, against itself, against one line, and one line against it
// input: lineDiff(before, after)
// expect: nothing; the one line added; the one line removed
test("lineDiff — an empty text has no line", () => {
  assert.deepEqual(lineDiff("", ""), []);
  assert.deepEqual(lineDiff("", "a\n"), [added("a", 1)]);
  assert.deepEqual(lineDiff("a\n", ""), [removed("a", 1)]);
});
