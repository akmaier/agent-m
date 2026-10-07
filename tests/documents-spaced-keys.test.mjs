// A field of a section or an appended section whose key holds spaces (ITM-252) — MOD-documents' schema language,
// readDocument and appendSection, as the accepted text of docs/architecture/MOD-documents.md and the corrected
// docs/backlog/ITM-252-the-record-of-a-job.md state them: words of a front matter key's form separated by single
// spaces, such as `gate record`, named in a schema, read, and appended by appendSection, as written; a front matter
// key stays as MOD-text-tools states it (unaffected by this item). Nothing else of MOD-documents is part of this item
// and is not tested here: documentFindings, classifyCandidates, artifactSchemas and the module's own schemas.
// Run: node --test tests/documents-spaced-keys.test.mjs
//
// Module: MOD-documents
// Guards: A DATA FORMAT IS DEFINED ONCE; A RECORD IS EVIDENCE, NOT A PROPOSAL
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The schema below is a
// fixture in the form the module file names, not a schema any module keeps (tests/documents-sections.test.mjs, the same
// convention).

import test from "node:test";
import assert from "node:assert/strict";
import { loadSchema, readDocument, appendSection } from "../src/documents/index.mjs";

const SCHEMA_TEXT = `# Sample record

A fixture schema (not a format any module keeps): a section whose field's key holds a space, and an appended section
whose field's key holds a space too.

\`\`\`json
{
  "schema": "sample-record",
  "shape": "document",
  "rule": "A RECORD IS EVIDENCE, NOT A PROPOSAL",
  "frontMatter": { "id": { "type": "text", "required": true } },
  "sections": [
    { "heading": "## Context", "required": true, "fields": {
      "found by": { "type": "text", "required": false } } }
  ],
  "appended": [
    { "heading": "## Gate reached", "repeat": true, "fields": {
      "at": { "type": "time", "required": true },
      "gate record": { "type": "text", "required": true } } }
  ],
  "otherSections": "forbidden"
}
\`\`\`
`;

// guards: A DATA FORMAT IS DEFINED ONCE
// given: SCHEMA_TEXT, whose section "## Context" names the field "found by" and whose appended section
//        "## Gate reached" names the field "gate record" — each a key of two words of a front matter key's form,
//        separated by one space
// input: loadSchema(SCHEMA_TEXT, "MOD-sample")
// expect: no throw; the schema loads, each field named under its spaced key
test("loadSchema — a schema whose section and appended section name a field whose key holds spaces loads", () => {
  const schema = loadSchema(SCHEMA_TEXT, "MOD-sample");
  assert.equal(schema.schema, "sample-record");
  assert.equal(schema.sections[0].fields["found by"].type, "text");
  assert.equal(schema.appended[0].fields["gate record"].type, "text");
});

// guards: A RECORD IS EVIDENCE, NOT A PROPOSAL
// given: the schema above, and a record whose "## Context" holds the line "found by: a review" and whose appended
//        "## Gate reached" holds "gate record: docs/approvals/x.md" — each line with its key's space
// input: readDocument(schema, path, text)
// expect: the section's field and the appended section's field each hold the line's value, keyed by the spaced form
test("readDocument — such a line is read into that field", () => {
  const schema = loadSchema(SCHEMA_TEXT, "MOD-sample");
  const text = `---
id: SMP-001
---
## Context

found by: a review

## Gate reached

at: 2026-10-07 13:00 UTC
gate record: docs/approvals/x.md
`;
  const doc = readDocument(schema, "docs/sample/SMP-001.md", text);
  assert.equal(doc.sections[0].fields["found by"], "a review");
  assert.equal(doc.appended[0].fields["gate record"], "docs/approvals/x.md");
});

// guards: A RECORD IS EVIDENCE, NOT A PROPOSAL
// given: the schema above, and a record already holding its front matter and "## Context" (no appended section yet)
// input: appendSection(schema, text, "## Gate reached", { at: "2026-10-07 13:30 UTC", "gate record": "docs/approvals/y.md" })
// expect: the text returned holds the record's original bytes first, byte for byte, followed by the new section with
//         its field written as given — the line "gate record: docs/approvals/y.md", with its space —, which reads
//         back into that same field
test("appendSection — writes it as given", () => {
  const schema = loadSchema(SCHEMA_TEXT, "MOD-sample");
  const before = `---
id: SMP-002
---
## Context

found by: a review
`;
  const after = appendSection(schema, before, "## Gate reached",
    { at: "2026-10-07 13:30 UTC", "gate record": "docs/approvals/y.md" });
  assert.ok(after.startsWith(before), "the record's original bytes stay, byte for byte");
  assert.match(after, /^gate record: docs\/approvals\/y\.md$/m);
  const doc = readDocument(schema, "docs/sample/SMP-002.md", after);
  assert.equal(doc.appended[0].fields["gate record"], "docs/approvals/y.md");
});
