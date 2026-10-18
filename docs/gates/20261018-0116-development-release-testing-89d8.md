---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - be8fcba2a77dc18383057a29dde3aa9d7b138c36
  - https://github.com/akmaier/agent-m/pull/830
date: 2026-10-18 01:16 UTC
---
# Development → Release testing: ITM-722, a group file is saved on the blob it was opened on

## Reason

ITM-722 (MOD-artifact-edits, `saveGroupFile`) is approved on be8fcba. The rework fixes the reason for the rejection on
266febc. `itemsInSeveralPlaces` now takes the `line` of each AN ITEM HAS ONE PLACE IN ITS HIERARCHY finding and returns
the `id` of the member of `hierarchy`'s `tree` on that line. It uses only accepted interfaces: `Hierarchy.tree`,
`GroupTree`/`Group`/`Member { id, line }` (MOD-group-document, Interfaces) and `Finding.line` (MOD-text-tools, Interfaces).

Replayed on the head:
- The failing case: a requirement named "A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE" placed twice is refused with
  `{ refused: "not one place", items: ["A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE"] }`, and nothing is written.
- The same requirement in three places on different lines (top level, a group and a nested group) is named once.
- Two requirements, each placed twice, are both named, each once.
- A requirement placed once under a group is saved: this is no false refusal.

TST-722005 names UC-021, AN ITEM HAS ONE PLACE IN ITS HIERARCHY and the module. Two counter-proofs were replayed, and in
each TST-722005 fails while TST-722001 to TST-722004 pass: `save.mjs` reset to 266febc, and the first word of the
member's `id` taken.

Checks 1 to 4 of the rejection still hold. The red commit f081eaf comes first, and CI is green on be8fcba (12 of 12).
The rework changes only `src/artifact-edits/save.mjs` and adds TST-722005 to `tests/artifact-edits-group-file.test.mjs`.

Release and system tests: the 14 test files importing artifact-edits were run with `node --test` after the CI install
(`npm install --prefix src/bridge-build --omit=dev --ignore-scripts`). There were 113 tests: 112 passed, 0 failed, and 1
is a known TODO finding.

The two other findings of the rejection are left for later and do not block. `docs/groups/<name>.md` of no known kind
throws NotAGroupFile, which is not among `saveFile`'s errors. Items are listed in the order of their repeated lines.
