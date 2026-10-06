---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 27a63d4bafaa944cb57017927198fb78a738b9c0
  - https://github.com/akmaier/agent-m/pull/99
date: 2026-10-06 07:02 UTC
---
# Development → Release testing: ITM-205

**REGISTER**

## Reason

ITM-205, pull request #99 by developer-opus-c, on head `27a63d4`, after its rejection on `b72e5ae`
(`docs/gates/20261006-0654-development-release-testing-1c77.md`). What that rejection found missing is there:
- `27a63d4` reads the branch's head again just before the write on a GitLab server. If the head moved, it refuses with
  `Moved`, naming the newer head, before anything is written.
- `dee94dc` tests that race: a commit touching none of the change's files lands while the files are read, and the result
  is `Moved`, no write, and the branch keeping that head. A known positive shows the race took place.
- Its counter-proof, the new read taken out, is recorded. It holds because the fake GitLab refuses a write only for a
  changed file of the change, as GitLab does.

The Definition of Done holds:
- The first commit, `d0b8307`, holds only tests and was red.
- CI is green on `27a63d4` (run 37426846517).
- Only `src/repository-hosts/` and its test change.
- Each of the thirteen tests has a recorded counter-proof.
- The Acceptance holds.

The second request of a GitHub snapshot, and the window GitLab leaves after its last read, stay akmaier's findings on the
module file.
