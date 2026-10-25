// The artifact formats as the modules read them — MOD-text-tools' parseFrontMatter, and MOD-documents' readDocument by the
// schema artifactSchemaOf gives for a path — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-documents
// Guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; AN EDITED FILE KEEPS ITS IDENTIFIER; UC-008
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFrontMatter } from "../../src/text-tools/index.mjs";
import { artifactSchemaOf, readDocument } from "../../src/documents/index.mjs";
import { UC_OLD, UC_NEW } from "./helpers.mjs";

// The identifier of a reviewed file: the one its text declares, read by the schema its path names; for an empty text, the one
// its path gives. Null for a path of no schema.
const idOf = (path, text = "") => (artifactSchemaOf(path) ? readDocument(artifactSchemaOf(path), path, text).id : null);

test("front matter: scalars and lists, body separated", () => {
  const { fields, body } = parseFrontMatter(
    "---\nid: UC-001\ntitle: Register a source\nrealises:\n  - NO SERVER\n  - A SOURCE DECLARES ITS AUTHORITY\n---\n# Body\n");
  assert.equal(fields.id, "UC-001");
  assert.deepEqual(fields.realises, ["NO SERVER", "A SOURCE DECLARES ITS AUTHORITY"]);
  assert.equal(body, "# Body\n");
  assert.deepEqual(parseFrontMatter("# no front matter\n").fields, {});
});

// ITM-126, back from Release testing (finding A5): a front matter whose lines end in CR LF (`---\r\n` … `\r\n---\r\n`) is read
// as one with LF line ends. Expected: the same fields as the LF text — each value without its CR, the list items too —, and as
// body the text's own bytes after the closing `---\r\n`, its CRs kept. Known positive: the LF text gives those fields.
test("front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes", () => {
  const lf = "---\nid: UC-001\ntitle: Register a source\nrealises:\n  - NO SERVER\n  - A SOURCE DECLARES ITS AUTHORITY\n---\n# Body\n\nText.\n";
  const crlf = lf.replace(/\n/g, "\r\n");
  const want = { id: "UC-001", title: "Register a source", realises: ["NO SERVER", "A SOURCE DECLARES ITS AUTHORITY"] };
  assert.deepEqual(parseFrontMatter(lf).fields, want, "known positive: the LF text");
  const { fields, body } = parseFrontMatter(crlf);
  assert.deepEqual(fields, want, "CR LF: the same fields, no value keeps its CR");
  assert.equal(body, "# Body\r\n\r\nText.\r\n", "CR LF: the body is the text after the closing ---, byte for byte");
});

// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT finds the records of a renamed file by its identifier (UC-008 2a): the
// identifier of a path here; the records of that identifier are MOD-approvals' (tests/approvals-last-accepted.test.mjs, a renamed
// file; tests/approvals-status-of.test.mjs, a renamed file and a record of another kind).

test("a reviewed file's identifier from its path — the same for a renamed file", () => {
  assert.equal(idOf(UC_OLD), "UC-010");
  assert.equal(idOf(UC_NEW), "UC-010");
  assert.equal(idOf("docs/use-cases/README.md"), null);
});

// ---------------------------------------------------------------- an edited use case keeps its identifier (ITM-126)
// AN EDITED FILE KEEPS ITS IDENTIFIER refuses a text "whose identifier differs from the one it was opened with": MOD-artifact-edits'
// saveFile compares the identifier the text declares, read by MOD-documents, with the one it was opened with
// (tests/artifact-edits-identifier.test.mjs). How the text's lines end is no part of it. Expected: the fixture use case with CR LF
// line ends declares UC-001, as the LF text does; with `id: UC-002` it declares UC-002, without a CR. Known positive: the LF text
// declares UC-001.
test("AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends declares the identifier of its LF text", () => {
  const path = "docs/use-cases/UC-001-complete.md";
  const text = readFileSync(new URL("../fixtures/use-cases/UC-001-complete.md", import.meta.url), "utf8");
  const crlf = (t) => t.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  assert.equal(idOf(path, text), "UC-001", "known positive: LF, the identifier it declares");
  assert.equal(idOf(path, crlf(text)), "UC-001", "CR LF, the same identifier");
  assert.equal(idOf(path, crlf(text.replace("id: UC-001", "id: UC-002"))), "UC-002", "CR LF, another identifier, without a CR");
});
