// Release tests of sprint 02, strand C — the artifact kernel's requirement checks and its reader of requirement names (ITM-144).
// Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of the strand's items,
// from the SPEC rules and use cases they realise; started on sprint/02 at a7b4b9f, 2026-10-01.
//
// Module: MOD-artifacts
// Guards: A REQUIREMENT HAS A REGISTERED SOURCE; A REQUIREMENT HAS FIVE FIELDS; A RESOURCE'S TERMS ENTER AS A SOURCE; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
// Level: release
//
// ITM-127 (A REQUIREMENT HAS A REGISTERED SOURCE · A REQUIREMENT HAS FIVE FIELDS) and the reader half of ITM-128 (UC-022 10a ·
// ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS). The input is a fixture SPEC of a made-up product, written in this file from the
// SPEC's own form of a requirement — "a name in capitals …, a source with a date, one rule …, an occasion …, and the check" —
// never Agent M's SPEC.md. Each expectation is stated before its case runs, from the rule it names.

import test from "node:test";
import assert from "node:assert/strict";
import { formatChecks } from "../docs/assets/artifacts/checks.mjs";
import { specRequirements } from "../docs/assets/artifacts.mjs";

// One requirement in the SPEC's form; `source` null leaves the source out of the name line.
const req = (name, source, rule = "The export is one PDF file.", check = "`tests/test_export.py`") =>
  `**${name}**${source === null ? "" : ` *(${source})*`}\n${rule}\n*Occasion:* reviewers print it.\n*Check:* ${check}\n`;

const spec = (...requirements) => `# Thesis tool — Specification\n\n**VERBINDLICH (SPEC)**\n\n## 1. Export\n\n${requirements.join("\n")}`;
const findingsOf = (text, linkedSources = []) => formatChecks("requirement", text, { linkedSources });
const about = (fs, name) => fs.filter((f) => f.artifact === name);
const errors = (fs, name, rule) => about(fs, name).filter((f) => f.kind === "error" && (!rule || f.rule === rule));

// ------------------------------------------------------------------------------------------------ ITM-127

// A REQUIREMENT HAS A REGISTERED SOURCE, as the Product Owner reads it (ITM-127, akmaier 2026-10-01): a source named as it is
// written — a person with the date, a book with the date, a source whose text wraps onto a second line — needs no SRC-
// identifier. Expected: no finding at all for any of these complete requirements, with no source linked to the product.
test("release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier", () => {
  const text = spec(
    req("EXPORT IS A PDF", "PO B. Example, 2026-09-24"),
    req("THE TITLE PAGE NAMES THE AUTHOR", "Vibe Coding, ch. 7 §5; PO B. Example, 2026-09-25", "The title page names the author."),
    req("THE TABLE OF CONTENTS IS LINKED", "PO B. Example, 2026-09-23; after \"JEDE\nREGEL\", reworded 2026-09-24",
      "Every entry of the table of contents is a link."),
  );
  const fs = findingsOf(text);
  assert.deepEqual(fs, [], JSON.stringify(fs));
});

// A REQUIREMENT HAS A REGISTERED SOURCE — where a source is named by its identifier, it must be one the product links.
// Expected: a linked SRC- gives no finding; an SRC- the product does not link is an error under that rule, naming the
// identifier, at the requirement's own name and line.
test("release · requirements: an SRC- identifier must be linked to the product; a linked one passes", () => {
  const text = spec(req("EXPORT IS A PDF", "SRC-print-office, 2026-09-24"), req("COVER IS GREEN", "SRC-brand-office, 2026-09-24", "The cover is green."));
  const fs = findingsOf(text, ["SRC-print-office"]);
  assert.deepEqual(about(fs, "EXPORT IS A PDF"), [], "the linked source passes");
  const e = errors(fs, "COVER IS GREEN", "A REQUIREMENT HAS A REGISTERED SOURCE");
  assert.equal(e.length, 1, JSON.stringify(fs));
  assert.match(e[0].what, /SRC-brand-office/);
  assert.equal(e[0].line, text.split("\n").findIndex((l) => l.startsWith("**COVER IS GREEN**")) + 1);
  // The same source, now linked, passes — the error came from the missing link and from nothing else.
  assert.deepEqual(about(findingsOf(text, ["SRC-print-office", { source: "SRC-brand-office" }]), "COVER IS GREEN"), []);
});

// A RESOURCE'S TERMS ENTER AS A SOURCE — "a requirement naming a resource entry as its source is rejected", even with a date.
// Expected: an error under that rule naming the RES- entry.
test("release · requirements: a resource entry named as source is an error", () => {
  const fs = findingsOf(spec(req("EXPORT IS A PDF", "RES-print-server, 2026-09-24")), ["RES-print-server"]);
  const e = errors(fs, "EXPORT IS A PDF", "A RESOURCE'S TERMS ENTER AS A SOURCE");
  assert.equal(e.length, 1, JSON.stringify(fs));
  assert.match(e[0].what, /RES-print-server/);
});

// A REQUIREMENT HAS FIVE FIELDS — "a name, a source with a date, a rule, an occasion, and a check". Expected: a source with no
// date, an empty source and a source that is only a date are each an error under that rule; the same requirement with a
// dated source is not.
test("release · requirements: a source without a date, an empty source and a date alone are errors", () => {
  const text = spec(
    req("UNDATED", "Vibe Coding, ch. 9 §6"),
    req("EMPTY", ""),
    req("DATE ALONE", "2026-09-24"),
    req("DATED", "Vibe Coding, ch. 9 §6; PO B. Example, 2026-09-24"),
  );
  const fs = findingsOf(text);
  for (const name of ["UNDATED", "EMPTY", "DATE ALONE"]) {
    assert.equal(errors(fs, name, "A REQUIREMENT HAS FIVE FIELDS").length, 1, `${name}: ${JSON.stringify(about(fs, name))}`);
  }
  assert.match(errors(fs, "UNDATED")[0].what, /date/);
  assert.deepEqual(about(fs, "DATED"), []);
});

// A REQUIREMENT HAS FIVE FIELDS — a requirement written with its name in capitals, its rule, its occasion and its check, but
// without the source after its name. Expected: an error under that rule at that requirement — a missing source is still an
// error (ITM-127, *Outcome*). Finding C1 (back to Development: ITM-127): the checker does not see the requirement at all and
// reports nothing.
test("release · requirements: a requirement written without any source is an error", () => {
  const fs = findingsOf(spec(req("NO SOURCE GIVEN", null), req("EXPORT IS A PDF", "PO B. Example, 2026-09-24")));
  assert.equal(errors(fs, "NO SOURCE GIVEN", "A REQUIREMENT HAS FIVE FIELDS").length, 1, JSON.stringify(fs));
});

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
