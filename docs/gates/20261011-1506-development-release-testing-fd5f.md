---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 277a5392ef162245f256e080b9193068834010c2
  - https://github.com/akmaier/agent-m/pull/371
date: 2026-10-11 15:06 UTC
---
# Development → Release testing: ITM-333

**REGISTER**

## Reason

ITM-333, pull request #371 by developer-sonnet-c into `sprint/team1/16`, on head `277a539`, against the item and
MOD-approvals' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `a5b9948`, holds only `tests/approvals-accept.test.mjs`, and CI was red on it (run 38149337437):
  node failed on exactly its 6 tests — 1402 tests, 6 failed.
- CI is green on the head (run 38149573574): node 1435 tests, 0 failed; python 441 tests, OK.
- Only MOD-approvals' folder — the new `accept.mjs`, the exports and header of `index.mjs` — and the new test whose
  header names the module change; no existing test or expected result changes.
- The 6 new tests name what they guard — among them `AN APPROVAL NAMES THE EXACT TEXT`, `SEVERAL FILES ARE ACCEPTED IN
  ONE CLICK`, `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS` and `A GITLAB PRODUCT IS WRITTEN WITH A TOKEN` — and
  MOD-approvals, with 58 faults planted on the draft first and run again on the code.
- The Acceptance holds: two use cases accepted in one commit, one record each naming the blob shown; one changed after
  it was shown left out and named; one whose `realises` names a requirement that stands only in an open queue left out
  with that name; `Moved` with nothing written, and `PermissionMissing` passed on; the fallback link carrying the path
  and the record and no reviewed text, and refused for GitLab.

Noted for the sprint's review, no condition of this gate: `acceptanceBlockers` returns a Promise, as the file and the SPEC
are read through an asynchronous snapshot, where the module file writes `string[]`; a module's `realises` counts as a
decision's `forced_by` does; `accept.mjs` imports `approvalSchema` from `index.mjs`, a cycle used only at call time,
since a part of its own for the schema needs the module file to name it — the same stands for ITM-334;
`fallbackAcceptLink` reaches `webLinks` through `connect`, which the uses do not name, and builds on `main` until
ITM-452; `NothingToAccept` carries the files left out.
