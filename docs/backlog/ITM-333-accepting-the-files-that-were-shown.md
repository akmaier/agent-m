---
id: ITM-333
title: Accepting the files that were shown
level: module
realises:
  - UC-008
  - AN APPROVAL NAMES THE EXACT TEXT
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
  - THE GATE IS RECORDED
modules:
  - MOD-approvals
builds_on:
  - ITM-233
  - ITM-310
tests:
  - unit
origin:
  - UC-008 steps 3 to 5, 3b, 3c, 3d, 3e, 4a
  - UC-006 4b
---
# ITM-333 Accepting the files that were shown

**REGISTER**

## Outcome

MOD-approvals' `acceptShown`, `acceptanceBlockers` and `fallbackAcceptLink`, as its file states them, in
`src/approvals/accept.mjs`:

- `acceptShown`: one commit with the person's token on the head it read, one record per file shown, each naming the
  blob shown; a file whose blob on the head differs, or that rests on what is not accepted, gets no record and is
  named with the reason; `Moved`, `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable` and
  `NothingToAccept` as named.
- `acceptanceBlockers`: the requirements and use cases a file names that are not accepted.
- `fallbackAcceptLink`: GitHub's new-file page with the record's path and the record (ITM-310), both also returned for
  a copy button; refused for a GitLab product.

The review pages (ITM-355, ITM-356) call them. `acceptItems` in `docs/assets/dashboard/writes.mjs` and `planAcceptance`
in `docs/assets/review-core.mjs` are the model and stay. `statusOf`, `lastAcceptedText` (ITM-334) and
`approvalStrategies` (ITM-332) are not part of this item; the records of SPEC entries are MOD-spec-changes' (ITM-340).

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, on a fixture repository behind a Host of the
  tests' own: two use cases accepted in one commit, one record each naming the blob shown; one changed after it was
  shown left out and named; one whose `realises` names a requirement that stands only in an open queue left out with
  that name; `Moved` with nothing written, and `PermissionMissing` passed on; the fallback link carrying the path and
  the record and no reviewed text, and refused for GitLab.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
