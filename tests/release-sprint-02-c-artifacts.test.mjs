// Release tests of sprint 02, strand C — the reader of requirement names (ITM-144).
// Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of the strand's items,
// from the SPEC rules and use cases they realise; started on sprint/02 at a7b4b9f, 2026-10-01.
//
// Module: MOD-documents
// Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
// Level: release
//
// The reader half of ITM-128 (UC-022 10a · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS), read by MOD-spec-document's parseSpec. The
// input is a fixture SPEC of a made-up product, written in this file in the SPEC's own form of a requirement — its name in bold
// and in capitals, its source in italics in parentheses, which may wrap onto further lines, its rule and its check —, never Agent
// M's SPEC.md. Each expectation is stated before its case runs, from the rule it names.

import test from "node:test";
import assert from "node:assert/strict";
import { parseSpec } from "../src/spec-document/index.mjs";

// One requirement in the SPEC's form.
const req = (name, source, rule = "The export is one PDF file.", check = "`tests/test_export.py`") =>
  `**${name}** *(${source})*\n${rule}\n*Check:* ${check}\n`;

// ------------------------------------------------------------------------------------------------ ITM-128 (the reader)

// UC-022 10a · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS rest on the reader of requirement names: a requirement is read with its
// whole source, also when the source wraps onto a second line, and prose in bold is no requirement. Expected: exactly the three
// requirements are read; the wrapped source is read whole; the bold prose lines — a status line in capitals, a sentence, a label —
// and a name quoted in backticks are absent.
test("release · reader: a wrapped source is read whole, bold prose and a quoted name are no requirement", () => {
  const text = `# Thesis tool — Specification

**VERBINDLICH (SPEC)**

**No section of this file is written by hand.** Each change is proposed first.

**Form of a requirement** (from the process): a name in capitals, a source.

## 1. Export

${req("EXPORT IS A PDF", "PO B. Example")}
${req("THE COVER IS THE PRINT OFFICE'S", "PO B. Example; after \"EINE\nREGEL\"", "The cover is designed by the print office.")}
${req("THE TITLE PAGE NAMES THE AUTHOR", "PO B. Example; after \"EINE\nANDERE REGEL\"", "The title page names the author.")}
The rule \`EXPORT IS A PDF\` is quoted here, and **THIS IS NO REQUIREMENT** either.
`;
  const reqs = parseSpec(text).requirements;
  assert.deepEqual([...reqs.keys()].sort(), ["EXPORT IS A PDF", "THE COVER IS THE PRINT OFFICE'S", "THE TITLE PAGE NAMES THE AUTHOR"]);
  assert.equal(reqs.get("THE TITLE PAGE NAMES THE AUTHOR").source, "PO B. Example; after \"EINE\nANDERE REGEL\"", "the wrapped source is read whole");
  assert.equal(reqs.get("THE TITLE PAGE NAMES THE AUTHOR").rule, "The title page names the author.", "the rule follows the wrapped source");
  for (const prose of ["VERBINDLICH (SPEC)", "No section of this file is written by hand.", "Form of a requirement", "THIS IS NO REQUIREMENT"]) {
    assert.equal(reqs.has(prose), false, prose);
  }
});
