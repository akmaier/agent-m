---
id: ITM-911
title: An approval record holds one line per limitation
level: unit
realises:
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
modules:
  - MOD-documents
builds_on:
tests:
  - unit
origin:
  - ITM-756's pull request #876, gap 4, and its gate (po-opus-b)
---
# ITM-911 An approval record holds one line per limitation

**REGISTER**

## Outcome

MOD-approvals' accepted Data states `limitation` as "one line per failing test or worse rate, `<TST-<nnn> or rate> —
<reason>`" (`docs/architecture/MOD-approvals.md:75`; `src/approvals/approval-record.schema.md:16`). The approval record is
the one schema of the `lines` shape.

MOD-documents writes a list of a `lines` record on one line, its items joined by `, ` (`src/documents/read-write.mjs:439-442`,
`lineText` at `:97`), and refuses an item that holds a comma (`src/documents/checks.mjs:78-80`). A probe on `0b7990df`:
- two limitations give one line, `limitation: TST-001 — flaky network, TST-002 — known bug`, and read back as two;
- the reason `slow, on CI only` is refused: `DocumentError … holds a comma, which separates the items of a list in a line`.

So `acceptAndRelease` fails with an error its Errors do not name, and a red release whose reason holds a comma cannot be
accepted. MOD-documents' file states a list in front matter one per line and in a table cell separated by commas; it says
nothing of a `lines` record. The reading taken: in a `lines` record, a list stands one `key: value` line per item, read
back in order, as MOD-approvals asks. The `key: value` lines of a section are not changed.

## Acceptance

- `writeDocument` of an approval record with two limitations writes two `limitation:` lines; `readDocument` gives both back
  in order.
- A reason that holds a comma is written and read back unchanged. Counter-proof: with the items joined on one line, the
  test fails.
- A record with one limitation, and one with none, read and write as before. Every record under `docs/approvals/` on
  `main` reads as before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/documents/` and the tests that name MOD-documents change.
