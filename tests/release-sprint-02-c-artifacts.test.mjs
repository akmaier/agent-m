// Release tests of sprint 02, strand C — the artifact kernel's reader of requirement names (ITM-144).
// Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of the strand's items,
// from the SPEC rules and use cases they realise; started on sprint/02 at a7b4b9f, 2026-10-01.
//
// Module: MOD-documents
// Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
// Level: release
//
// The reader half of ITM-128 (UC-022 10a · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS). The input is a fixture SPEC of a made-up
// product, written in this file from the SPEC's own form of a requirement — "a name in capitals …, a source with a date, one
// rule …, an occasion …, and the check" — never Agent M's SPEC.md. Each expectation is stated before its case runs, from the
// rule it names.

import test from "node:test";
import assert from "node:assert/strict";
import { specRequirements } from "../docs/assets/artifacts.mjs";

// One requirement in the SPEC's form; `source` null leaves the source out of the name line.
const req = (name, source, rule = "The export is one PDF file.", check = "`tests/test_export.py`") =>
  `**${name}**${source === null ? "" : ` *(${source})*`}\n${rule}\n*Occasion:* reviewers print it.\n*Check:* ${check}\n`;

// ------------------------------------------------------------------------------------------------ ITM-128 (the reader)

// UC-022 10a · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS rest on the reader of requirement names: a withdrawn requirement is
// marked as withdrawn — also when its source wraps onto a second line, as in the SPEC's own form —, a live one is not, and
// prose in bold is no requirement. Expected: exactly the four requirements are read; the two withdrawn ones say so; the
// bold prose lines — a status line in capitals, a sentence, a label — and a name quoted in backticks are absent.
test("release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement", () => {
  const text = `# Thesis tool — Specification

**VERBINDLICH (SPEC)**

**No section of this file is written by hand.** Each change is proposed first.

**Form of a requirement** (from the process): a name in capitals, a source with a date.

## 1. Export

${req("EXPORT IS A PDF", "PO B. Example, 2026-09-24")}
**OLD EXPORT** *(PO B. Example, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* replaced by \`EXPORT IS A PDF\`. The name is not reused.

**OLD COVER** *(PO B. Example, 2026-09-23; after "EINE
REGEL" — withdrawn 2026-09-24)*
*Withdrawn:* the cover is the print office's. The name is not reused.

${req("THE TITLE PAGE NAMES THE AUTHOR", "PO B. Example, 2026-09-23; after \"EINE\nANDERE REGEL\"", "The title page names the author.")}
The rule \`EXPORT IS A PDF\` is quoted here, and **THIS IS NO REQUIREMENT** either.
`;
  const reqs = specRequirements(text);
  assert.deepEqual([...reqs.keys()].sort(), ["EXPORT IS A PDF", "OLD COVER", "OLD EXPORT", "THE TITLE PAGE NAMES THE AUTHOR"]);
  assert.equal(reqs.get("OLD EXPORT").withdrawn, true);
  assert.equal(reqs.get("OLD COVER").withdrawn, true, "withdrawn although its source wraps");
  assert.equal(reqs.get("EXPORT IS A PDF").withdrawn, false);
  assert.equal(reqs.get("THE TITLE PAGE NAMES THE AUTHOR").withdrawn, false, "a wrapped source is not a withdrawal");
  for (const prose of ["VERBINDLICH (SPEC)", "No section of this file is written by hand.", "Form of a requirement", "THIS IS NO REQUIREMENT"]) {
    assert.equal(reqs.has(prose), false, prose);
  }
});
