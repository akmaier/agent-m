---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 482fc5c7d15c7b479bc3aec30d61063e0bddfdf0
  - https://github.com/akmaier/agent-m/pull/200
date: 2026-10-07 20:16 UTC
---
# Development → Release testing: ITM-254

**REGISTER**

## Reason

ITM-254, versions, release candidates and the release: pull request #200 by developer-sonnet-c, on head `482fc5c`.
What holds:
- The first commit, `692909a`, holds only `tests/release-evidence.test.mjs`, and CI was red on it (run 37679218036),
  on exactly that file.
- CI is green on the head (run 37680147211).
- Only `src/release-evidence/` and the new test, whose header names MOD-release-evidence, changed; 17 counter-proofs are
  recorded.

Why it is rejected: check 5. Two statements of the Acceptance do not hold, read on the head:
- "the report: its parts as the module's file gives them, its limitations first". `releaseReport` calls
  `rateComparison` with no last release, so its `## Limitations` never names a rate worse than the last release's, and
  the test pins `worse` to `[]`. The pull request calls the last release's commit unreachable from the signature, but
  `at`, the product at the candidate's commit, holds the last release's report `docs/tests/releases/v<version>.md`,
  whose front matter names its tested `commit` (MOD-release-evidence, Data).
- "the release: one commit of the report, its approval record and the changelog entry". `acceptAndRelease` reads the
  report as already committed and commits only the approval record and the changelog entry.

The item is not done. Its developer may rework it once within the sprint, on exactly this condition (`docs/process.md`,
Sprint).
