---
id: ITM-1268
title: The last accepted text is read as one file at one commit
level: module
realises:
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-approvals
builds_on: []
tests:
  - unit
origin:
  - akmaier, 2026-10-28: "A lot of the stuff that is loaded on the new pages right now is actually never looked at." Then: "Please follow up. I want all pages fixed this way."
---
# ITM-1268 The last accepted text is read as one file at one commit

**REGISTER**

## Outcome

`lastAcceptedText` (`src/approvals/status.mjs:142-170`), which every changed use case, decision and module shows its
difference against, and which `onMainChanged` calls for every changed architecture file, reads the head
(`readSnapshot`, `:144`), one history per record of the identifier (`:147-150`), the records, and then
`host.readSnapshot(last.commit)` (`:163`): the commit and the whole recursive tree of that older commit — at Agent M's
size about 6,900 entries, ~309 KB gzipped — to compare one blob and read one file. `tests/load-per-view.test.mjs` pins
this today (`#uc/UC-002, changed`: `["era commit","era tree","era file UC2"]`).

The text's own blob is already compared after it is read (`blobSha(text) !== blob`, `:167`), so the tree adds no
check. MOD-repository-hosts' `readFileAt(path, [commit])` reads one file at a commit in one request.

After the change: `lastAcceptedText` reads the file at the commit that added the record with `readFileAt`, and fails
as now when the text's blob is not the one the record names. MOD-approvals' interface text is unchanged: it reads "the
history of the records and of the file through the host".

Design principles (AGENTS.md §2 *Designing*): §2.2 *nothing twice* — the blob is compared once, on the text read,
not on a tree and then on the text; ch. 12 KISS — one request for one file.

## Acceptance

Tests written first, each red on the commit that holds only them:

- `tests/approvals-last-accepted-one-file.test.mjs` (MOD-approvals, unit), over a fake host: for a use case with one
  record, `lastAcceptedText` sends the head, one history, the record and one `readFileAt` of the file, and no
  `readSnapshot` of the older commit; counter-proof: a file whose text at that commit has another blob fails with
  `NotFound` naming it, as today.
- `tests/load-per-view.test.mjs`: `#uc/UC-002, changed` sends no era commit and no era tree, and one read of UC2 at
  that commit.

Measurable outcome: a changed use case, decision or module, opened on the live page, sends two requests fewer and no
older tree (~309 KB gzipped less at Agent M's size); *Review all* saves the same for each changed file it shows.

- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
