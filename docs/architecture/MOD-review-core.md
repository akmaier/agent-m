---
id: MOD-review-core
title: The approval engine — which text of a reviewed file or SPEC entry is accepted, and the one commit that accepts, edits or proposes it
realises:
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - THE REPLACED TEXT STAYS REACHABLE
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - AN APPROVAL NAMES THE EXACT TEXT
  - STATUS IS DERIVED FROM THE RECORDS
  - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A STALE APPROVAL IS NOT APPLIED
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - A QUEUE IS ACCEPTED IN ITS ORDER
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - A REQUIREMENT SHOWS ITS HISTORY
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - UC-006
  - UC-008
  - UC-018
follows:
  - ARC-003
  - ARC-006
uses:
  - MOD-artifacts.parseFrontMatter
  - MOD-artifacts.parseRequirements
  - MOD-artifacts.parseArchitecture
  - MOD-artifacts.reviewedId
provides:
  - gitBlobSha
  - deriveStatus
  - deriveSpecStatus
  - lastAccepted
  - lineDiff
  - reviewSession
  - planAcceptance
  - prerequisites
  - proposeEdit
  - requirementHistory
  - applyApprovals
---
# MOD-review-core The approval engine

## Responsibility

Kernel. Everything about acceptance that can be decided from texts and approval records: the git blob
SHA that names a text, the status of a reviewed file (use case, decision, module) and of a SPEC change
entry, which text was accepted last, the line difference every view shows, and the files of the one
commit that accepts, saves an edit or proposes a SPEC change — computed on the commit it is written on,
so that a text that changed after it was shown is left out and named. The SPEC sections of a queue entry
are read and replaced here, byte for byte. The same engine writes an approval of the instance's own SPEC
that was committed without the dashboard (`applyApprovals`); it never writes itself — it returns the
files, and a shell commits them on its authority (ARC-003).

## Interfaces

- `gitBlobSha(text) -> Promise<sha1hex>` — the git blob SHA of a text, byte for byte as `git hash-object` computes it (Web Crypto SHA-1 over `blob <n>\0` + UTF-8 bytes).
- `deriveStatus(path, currentBlob, records) -> "open" | "accepted" | "changed"` — accepted exactly when a record of the file's kind and path names its current blob; never stored.
- `deriveSpecStatus(entry, specText, decisions, records) -> "open" | "approved" | "stale" | "applied" | "superseded"` — derived; an applied entry is looked up where it wrote its text (its proposal's first line), not at its old anchor.
- `lastAccepted({ records, id, committedAt, read }) -> { record, text, count } | null` — of all records naming this identifier (matched by identifier, not path), the one committed last, and its text read by its blob SHA and refused unless it hashes to that SHA; `committedAt(path)` and `read(blob)` are ports; two records at the same instant raise an error naming both instead of guessing.
- `lineDiff(a, b) -> [[" "|"+"|"-", line]]` — the one line difference used by every view (edits, drafts, last accepted text, SPEC entries).
- `reviewSession() -> { show(item), tick(key, on), items() }` — what the page showed and what the reviewer ticked; only a shown item can be ticked, and it names the exact blob shown.
- `planAcceptance({ items, read, now }) -> { files, accepted, leftOut }` — the files of one acceptance commit, on the commit it is written on: a record per ticked file whose text is unchanged; for SPEC entries, in the order of their queue's index, the record, the replaced section and the decision row; a file or entry changed since it was shown, an entry whose anchor another unticked entry creates, a decision or module whose named requirements and use cases are no longer accepted there, or a changed decision or module whose impact list was not shown — each left out with its reason.
- `prerequisites(arch, requirements, useCaseStates) -> { open, useCases }` — the names a decision or module states that are not accepted; the one blocking rule (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`).
- `proposeEdit({ spec, queues, section, edited, why, impact, author, today }) -> { path, files }` — a SPEC edit as an entry of the author's open queue of today (or a new one), with the current section, the rationale and the impact list it is given; `SPEC.md` is never among the files. A changed name becomes a withdrawal plus a new requirement.
- `requirementHistory(name, records, sectionAt) -> [{ date, person, commit, before, after }]` — every accepted change to a requirement's text, from the approval records and the texts of its section at each accepting commit (`sectionAt` is a port).
- `applyApprovals({ read, now }) -> { files, report, refused }` — what the instance's apply workflow writes for every `kind: spec` record not yet applied: the same checks and the same bytes as `planAcceptance`; a stale or malformed record is refused and named. It replaces `tools/apply_approvals.py`, which a later refactoring job retires; until then the Python tool stays as it is, and a test compares both outputs.

## Testing

Unit tests over fixture repositories held in memory. The seams are `read(path)` — the files of the
commit an acceptance is written on — and `now`; `committedAt`, `read(blob)` and `sectionAt` are ports
the tests answer from fixtures. Each rule has a counter-proof among the recorded mutations
(`docs/measurements/2026-09-30_review-dashboard-mutations.md`): skipping a SHA check, ignoring the index
order, a tickable unshown file. `applyApprovals` and `tools/apply_approvals.py` are run on the same
records and must write byte-identical files. No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the approval engine, taking over MOD-spec-queue and MOD-apply-workflow and giving its format parsing to MOD-artifacts; open until accepted.*
