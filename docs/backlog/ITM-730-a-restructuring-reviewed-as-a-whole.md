---
id: ITM-730
title: A restructuring of the architecture reviewed as a whole
level: module
realises:
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
modules:
  - MOD-review-pages
  - MOD-approvals
builds_on:
  - ITM-729
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-730 A restructuring of the architecture reviewed as a whole

**REGISTER**

## Outcome

UC-023 step 5: a change that touches many files is accepted on the architecture's review page — "every changed file
with its difference and its impact list, every new file in full, every removed decision with its impact list, and
**Accept all N shown** for all of them in one commit". `decision/all` (ITM-441) shows the changed files with their
difference and the new ones in full; it shows no impact list and no removed decision.

This item adds to `decision/all` the impact list of ITM-729 beside each changed file, and each decision or module file
removed since its last acceptance — an approval record names it and the default branch no longer holds it — with its
impact list (`architectureImpact` with `after: null`). *Accept all N shown* is unchanged.

## Acceptance

- In a small DOM with a fixture snapshot holding a changed decision, a new module file and a removed module file: each
  changed and removed file with its impact list, the new file in full, and one commit with one record per file shown.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Readiness

Not ready for implementation under the current accepted input contract. MOD-review-pages and MOD-approvals are
accepted, at blobs `bbc12381f9904a9220daba458baa247e7041301e` and
`09dfab85e7e1abd1a0607ec370eeeb40ceb33eda`; waiting for acceptance of those texts is not the blocker.

MOD-approvals, Interfaces, requires `removedFiles(snapshot)` to return `path` and `lastBlob` from the most recent
approval record of each removed identifier. MOD-repository-hosts, Snapshot, supplies the tree and asynchronous file
reads, but no record history or commit order. Approval filenames contain only the blob's first twelve hex digits;
reading a record's body supplies its full forty-digit blob and file path, but does not identify which record is most
recent. Neither filename/hash order nor snapshot iteration order supplies that missing chronology.

The existing path in `src/approvals/status.mjs:142` demonstrates the required information: `lastAcceptedText(id, host)`
reads the default snapshot, calls `host.readHistory` for the records, selects the most recently committed record,
then reads its `file` and full `blob`. The accepted `removedFiles(snapshot)` input cannot follow that history path.
UC-023's whole-architecture outcome and the Acceptance above remain unchanged; a guessed record would not satisfy them.

Before a new implementation assignment, the interface input gap needs a contract correction through the repository's
formal approval path, accepted by the human akmaier. This REGISTER neither chooses a replacement interface nor changes
or accepts architecture, SPEC, use cases, test expectations or approval records. One responsibility keeps removal
discovery with Approvals; nothing twice and KISS rule out a second, guessed chronology in the review page.
