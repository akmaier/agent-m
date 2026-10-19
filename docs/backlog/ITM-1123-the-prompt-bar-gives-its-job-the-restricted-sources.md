---
id: ITM-1123
title: The prompt bar gives its job the places of the restricted sources, so read-file refuses what it may not read
level: module
realises:
  - UC-049
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-prompt-bar
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1123 The prompt bar gives its job the places of the restricted sources, so read-file refuses what it may not read

**REGISTER**

## Outcome

**A privacy defect, built first.** UC-049 4e: "The participant asks for content it may not have — a source whose licence
does not allow its processing place." `src/prompt-bar/send.mjs:77` and `src/prompt-bar/hand-over.mjs:121` give the job
`places: { sources: {}, mailbox: null, contents: [] }`, and nothing in `src/` fills `places.contents`. So `read-file`
never refuses a restricted source's content. The bar gives its job the product's sources with the places their licences
allow, as the job runner's other callers do. First read how MOD-job-runner's `JobContext.places` is filled elsewhere
(AGENTS.md §6a.1).

## Acceptance

- TST-513024 passes and its `todo` is removed. Counter-proof: a source whose licence allows the processing place is
  read.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Passed at its gate (#1167); its merge waits for draft `b6b4ccde`.** The code imports what its module's uses do not
name yet. The draft adds the uses, and #1167 merges once an approval record names the draft's blob.
