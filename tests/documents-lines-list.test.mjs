// A list in a record of `key: value` lines (the shape `lines`) stands one line per item — MOD-documents' writeDocument and
// readDocument, for the approval record whose `limitation` MOD-approvals' file states as "one line per failing test or worse
// rate". The key: value lines of a section are not part of this item and are not tested here.
// Run: node --test tests/documents-lines-list.test.mjs
//
// Module: MOD-documents
// Guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The schema is the one
// MOD-approvals keeps (approvalSchema). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";

const BLOB = "2699e35d0c413d3a814286dec77c49ad7598b4b1";
const PATH = `docs/approvals/release-v2026.4.0-${BLOB.slice(0, 12)}.md`;
const REPORT = "docs/tests/releases/v2026.4.0.md";
const record = (limitation) => ({ fields: { kind: "release-report", file: REPORT, blob: BLOB, ...(limitation === undefined ? {} : { limitation }) } });
const HEAD = `kind: release-report\nfile: ${REPORT}\nblob: ${BLOB}\n`;

// TST-911001 · level: unit · module: MOD-documents
// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the approval record schema, and a release-report record with the two limitations "TST-001 — flaky network" and "TST-002 — known bug"
// input: writeDocument of the record, then readDocument of the text it gave
// expect: the text is the three lines of kind, file and blob, then one `limitation:` line for each limitation, in order; read back, the limitations are the two, in order
test("TST-911001 two limitations are written as two limitation lines and read back in order", () => {
  const items = ["TST-001 — flaky network", "TST-002 — known bug"];
  const text = writeDocument(approvalSchema, record(items));
  assert.equal(text, `${HEAD}limitation: ${items[0]}\nlimitation: ${items[1]}\n`);
  assert.deepEqual(readDocument(approvalSchema, PATH, text).fields.limitation, items);
});

// TST-911002 · level: unit · module: MOD-documents
// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the approval record schema, and a release-report record whose limitations are "TST-001 — slow, on CI only" (a reason holding a comma) and "TST-002 — known bug"
// input: writeDocument of the record, then readDocument of the text it gave
// expect: writeDocument does not throw; the limitations read back are exactly the two given, the comma kept in the first
test("TST-911002 a reason that holds a comma is written and read back unchanged", () => {
  const items = ["TST-001 — slow, on CI only", "TST-002 — known bug"];
  const text = writeDocument(approvalSchema, record(items));
  assert.equal(text, `${HEAD}limitation: ${items[0]}\nlimitation: ${items[1]}\n`);
  assert.deepEqual(readDocument(approvalSchema, PATH, text).fields.limitation, items);
});

// TST-911003 · level: unit · module: MOD-documents
// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the approval record schema, and release-report records with one limitation, with an empty list, and with no limitation key
// input: writeDocument of each, then readDocument of the text it gave
// expect: one limitation: one `limitation:` line, read back as a list of that one; an empty list: the line `limitation:` with nothing after it, read back as the empty list; no key: no limitation line, and no limitation read back
test("TST-911003 a record with one limitation, and one with none, are written and read as before", () => {
  const one = writeDocument(approvalSchema, record(["TST-001 — flaky network"]));
  assert.equal(one, `${HEAD}limitation: TST-001 — flaky network\n`);
  assert.deepEqual(readDocument(approvalSchema, PATH, one).fields.limitation, ["TST-001 — flaky network"]);
  const empty = writeDocument(approvalSchema, record([]));
  assert.equal(empty, `${HEAD}limitation:\n`);
  assert.deepEqual(readDocument(approvalSchema, PATH, empty).fields.limitation, []);
  const none = writeDocument(approvalSchema, record());
  assert.equal(none, HEAD);
  assert.equal(readDocument(approvalSchema, PATH, none).fields.limitation, undefined);
});

// TST-911004 · level: unit · module: MOD-documents
// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: every record under docs/approvals/ of this repository (known positive: the folder holds records of each kind, and the first is read to a kind, a blob and a path)
// input: readDocument of each with the approval record schema
// expect: each field read is the single text on its own line in the file (as the reader read it before), the record's kind and blob among them, and no record has a limitation
test("TST-911004 every record under docs/approvals reads as before", () => {
  const dir = new URL("../docs/approvals/", import.meta.url);
  const names = readdirSync(dir).filter((name) => /-[0-9a-f]{12}\.md$/.test(name));
  assert.ok(names.length > 0);
  for (const name of names) {
    const text = readFileSync(new URL(name, dir), "utf8");
    const fields = readDocument(approvalSchema, `docs/approvals/${name}`, text).fields;
    assert.match(fields.blob, /^[0-9a-f]{40}$/, name);
    assert.ok(fields.kind, name);
    for (const line of text.split("\n")) {
      const m = /^([a-z]+): ?(.*)$/.exec(line);
      if (m) assert.equal(fields[m[1]], m[2].trim(), `${name} ${m[1]}`);
    }
    assert.equal(fields.limitation, undefined, name);
  }
});
