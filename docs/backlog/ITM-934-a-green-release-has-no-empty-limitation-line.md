---
id: ITM-934
title: The approval record of a green release has no empty limitation line
level: unit
realises:
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
modules:
  - MOD-release-evidence
builds_on:
tests:
  - unit
origin:
  - the review of sprint team2/93, from the gate of ITM-926 (#905, 90f3010d)
---
# ITM-934 The approval record of a green release has no empty limitation line

**REGISTER**

## Outcome

The accepted texts, quoted against their current accepted blobs:
- MOD-approvals.md:75 (blob `b5cbc257`): "| `limitation` | for `release-report`: one line per failing test or worse rate,
  `<TST-<nnn> or rate> — <reason>`; zero or more |".
- MOD-release-evidence.md:116-117 (accepted blob `bb90ed17`; the draft `b67e1631` does not change these lines):
  `acceptAndRelease` "commits the report, its approval record naming the report's blob and every limitation".

So a green release, with no failing test and no worse rate, has zero `limitation` lines.

**The path, on `main` at `c2cb2675`.**
- `src/release-evidence/report.mjs:381-384` writes the record with `limitation: ids.map(…)`, so a green report passes `[]`.
- MOD-documents' `writeDocument` writes an empty list as the key with no value. Its own test, TST-911003, holds this.
- The record of a green release therefore reads `limitation:` as a line of its own. That is a line, but not of the form
  `<TST-<nnn> or rate> — <reason>`.
- The known positive: with one limitation, the record holds one line `limitation: TST-001 — …` (TST-911001).

The fix is in MOD-release-evidence: a green report's record leaves out the key `limitation`. MOD-documents is not
changed. The stale comment at `src/release-evidence/report.mjs:376-379`, which says that a reason is recorded without a
comma, goes in the same change. It has been stale since ITM-911.

## Acceptance

- A unit test naming MOD-release-evidence: `acceptAndRelease` of a green report writes an approval record with no
  `limitation` line at all. A red report with two limitations writes two lines, as before.
- Counter-proof: with `limitation: []` passed again, the test fails.
- The comment at `report.mjs:376-379` is gone.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/release-evidence/` and the tests that name MOD-release-evidence change.
