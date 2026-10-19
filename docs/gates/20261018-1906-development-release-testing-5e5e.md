---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 4717e3aaa4b3e1710e1b9ac80ee45e7958efe1b6
  - https://github.com/akmaier/agent-m/pull/928
date: 2026-10-18 19:06 UTC
---
# Development → Release testing: ITM-757, the audit document of a release

**REGISTER**

## Reason

ITM-757, pull request #928 into `sprint/team2/94`, is rejected on `4717e3aa`, on one condition. `evidence.records` leaves
out the approval records that name an earlier text of the report.
- MOD-release-evidence.md:151-153, at the accepted blob `8654bba2`: "`evidence` is read from `head`: the report ... with
  its blob; every approval record that names it, `docs/approvals/release-v<version>-<blob12>.md`, with its blob".
- Only the acceptance is bound to "the record naming the report's current blob" (:153-154).
- `acceptance()` in `src/release-evidence/audit.mjs` keeps a record only when `fields.file === reportPath && fields.blob ===
  blob`, so only the records of the current text.
- Replayed with the PR's own fixture, the report changed after its acceptance (TST-756008's second case):
  `evidence.records` is `[]`. The record that named the earlier text is on `head` and names the report, and the audit
  document then lists no approval record.
- The rework lists every record whose `file` is the report, each with its blob. The acceptance still comes only from the
  record of the current blob. A test covers a report changed after its acceptance.

**What holds, and the readings I accept**, so that no further condition comes after the rework:
- **Red first.** The tests-only commit `4a629f99` is red (run 39156264717). On the sprint head's `src/`, the head's
  `tests/release-evidence-audit.test.mjs` fails 16 of 26.
- **Green.** Run 39156476440 is green on the head. Only `src/release-evidence/` and that test file changed.
- **TST-756008's changed expectation: admissible.** It now names the missing record. The accepted text says
  "`summary.limitations` names what is missing" (:157), so it changes the behaviour the test asserted. The item's
  re-reading (`25a88509`) did not name the test, and that omission is the Product Owner's.
- **The cases moved into the existing test file: admissible.** The file names MOD-release-evidence. The move works around
  TST-945005, team 1's ITM-958, and is no fix of it.
- **The readings named:**
  - the `missing:` wording of the limitations;
  - `acceptance: null` without `accepted`;
  - the default `accepted = null`;
  - the gate records alone for a process requirement. `auditRows`' rows type holds no "artifacts it added", so that part of
    the Data's audit document has no input. It goes to the review as a text gap.
  - the document's layout.
