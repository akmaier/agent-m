---
id: MOD-spec-queue
title: Reads SPEC sections and change queues and plans how an accepted entry is written
realises:
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
  - A STALE APPROVAL IS NOT APPLIED
  - A QUEUE IS ACCEPTED IN ITS ORDER
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - THE REPLACED TEXT STAYS REACHABLE
  - A REQUIREMENT HAS FIVE FIELDS
  - ONE STATEMENT PER REQUIREMENT
  - A REQUIREMENT NAMES ITS CHECK
  - A REQUIREMENT NAMES WHAT IT CONSTRAINS
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
  - A REQUIREMENT SHOWS ITS HISTORY
  - THE NAME IS THE ID AND IT SURVIVES
  - UC-006
  - UC-018
follows:
  - ARC-003
  - ARC-006
uses: []
provides:
  - extractSection
  - sectionText
  - replaceSection
  - parseQueueIndex
  - parseDecisions
  - deriveSpecStatus
  - sectionForEntry
  - missingNeeds
  - decisionRow
  - planSpecEntries
  - specRequirements
  - requirementProblems
  - proposeEdit
  - requirementHistory
---
# MOD-spec-queue Reads SPEC sections and change queues and plans how an accepted entry is written

## Responsibility

The SPEC side of review: sections by anchor, queues and their decisions, the status of an entry,
the text an accepted entry writes, and turning a person's edit into a proposal. Pure core. The same
section logic runs in Python in MOD-apply-workflow; a test checks both hash the same bytes.

**Current state.** In `review-core.mjs` today: `extractSection`, `sectionText`, `parseQueueIndex`,
`parseDecisions`, `deriveSpecStatus`, `writtenAnchor`, `decisionRow`, `replaceSection`, `sectionForEntry`,
`needsMessage`, `missingNeeds`, the SPEC half of `planAcceptance`, `specRequirements`.
`requirementProblems`, `proposeEdit` and `requirementHistory` do not exist yet.

## Interfaces

- `extractSection(text, anchor, bis?) -> { lines, from, to } | { error }` — the section starting at the one line equal to `anchor` (outside code fences) up to `bis` or the next heading of the same or higher level; an anchor found other than exactly once is an error.
- `sectionText(section) -> string` — the bytes both the dashboard and `tools/apply_approvals.py` hash: the section's lines, trailing newlines trimmed, one newline added.
- `replaceSection(text, anchor, bis, proposal) -> text` — the proposal byte for byte in place of the section, keeping the file's final newline.
- `parseQueueIndex(text) -> { target, entries: [{ nr, file, anchor, bis }] }` — a queue's `index.md` table.
- `parseDecisions(text) -> Map(nr -> { when, decision, ref })` — a queue's append-only `entscheidungen.md`.
- `deriveSpecStatus(entry, specText, decisions, records) -> "open"|"approved"|"stale"|"applied"|"superseded"` — derived; an applied entry is looked up where it wrote its text (its proposal's first line), not at its old anchor.
- `sectionForEntry({ specText, entries, nr, accepted }) -> { current, needs } | { error }` — the current text an entry replaces and the entries of its queue that must be written first because they create its anchor.
- `missingNeeds(items) -> [{ item, missing, message }]` — ticked entries whose anchor-creating entry is not ticked.
- `decisionRow(nr, recordName, now) -> string` — the row appended to `entscheidungen.md`, identical to the workflow's.
- `planSpecEntries({ items, read, now }) -> { files, accepted, leftOut }` — for ticked SPEC entries, in index order: approval record, replaced SPEC section and decision row per entry, all checked against the blobs shown; a stale entry is left out and named.
- `specRequirements(specText) -> Map(name -> { withdrawn, source, rule, occasion, check, constrains })` — every requirement by its name in capitals, its five fields, withdrawn when its source says so.
- `requirementProblems(requirement) -> [finding]` — a missing field or check is an error; an "and" or "additionally" in the rule is a warning (the decision stays human).
- `proposeEdit({ spec, queues, section, edited, why, author, today }) -> { path, files }` — a SPEC edit as an entry of the author's open queue of today (or a new one), with current section, rationale and impact list; `SPEC.md` is never among the files. A changed name becomes a withdrawal plus a new requirement.
- `requirementHistory(name, records, sectionAt) -> [{ date, person, commit, before, after }]` — every accepted change to a requirement's text, from approval records and the texts of its section at each accepting commit (read by the caller).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
