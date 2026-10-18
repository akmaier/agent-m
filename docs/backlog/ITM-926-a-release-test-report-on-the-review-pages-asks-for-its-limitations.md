---
id: ITM-926
title: A release test report on the review pages asks for its limitations and shows its changelog entry
level: module
realises:
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
  - UC-030
modules:
  - MOD-review-pages
builds_on:
  - ITM-910
tests:
  - unit
origin:
  - the review of sprint team2/92, from the gate of ITM-910 (#896, 122c64c6)
---
# ITM-926 A release test report on the review pages asks for its limitations and shows its changelog entry

**REGISTER**

## Outcome

MOD-review-pages' accepted text gives the release test report extra sections: "the limitations — a reason for every
failing test and every worse rate — and the changelog entry the person confirms" (MOD-review-pages.md, the table of
kinds). MOD-release-evidence's `acceptAndRelease` takes `decision: { limitations: Record<string, string> }` and refuses
with `LimitationMissing` while a failing test or a worse rate has no recorded reason. It commits the changelog entry the
report holds, and "the person is not asked for it again".

**The path, on `sprint/team2/92` at `5eb07e90`.**
- `src/review-pages/flow.mjs`, `releaseShown`, calls `acceptAndRelease(where.host, { path, blob }, { limitations: {} },
  person, today)`.
- The page has no field for a reason. A report with a failing test or a worse rate therefore cannot be accepted on
  `release-report/<id>` or `release-report/all`. The page shows only LimitationMissing's message.
- The known positive: MOD-test-pages' release panel (`src/test-pages/release.mjs`, `paintAccept`) asks for a reason for
  every failing test and every worse rate before *Accept and release*, and hands them over as `limitations`.

The fix: on `release-report/<id>` and in `release-report/all`, each report shows its changelog entry and, for every failing
test and every worse rate it names, a field for the reason. *Accept* and *Accept all N shown* hand the reasons to
`acceptAndRelease` as `limitations`. MOD-review-pages does not use MOD-test-pages, so it does not import
`paintAccept`.

## Acceptance

- A unit test naming MOD-review-pages, over a fixture with a red report that names one failing test and one worse rate:
  - `release-report/<id>` shows the report's changelog entry and one reason field for each of the two;
  - with both reasons filled in, *Accept* calls `acceptAndRelease` with exactly these two `limitations`, and the approval
    record holds one `limitation:` line for each;
  - with one reason empty, nothing is written, and the page names the test whose reason is missing.
  - Counter-proof: with `limitations: {}` again, the test fails.
- A green report is accepted as before, with no reason field.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
