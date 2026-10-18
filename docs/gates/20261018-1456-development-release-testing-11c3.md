---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9ba6fa26f5796a7a5e5aef44f5b41b806cbae349
  - https://github.com/akmaier/agent-m/pull/905
date: 2026-10-18 14:56 UTC
---
# Development → Release testing: ITM-926, a release test report on the review pages asks for its limitations

**REGISTER**

## Reason

ITM-926, pull request #905 into `sprint/team2/93`, passes on `9ba6fa26`. I checked it in a clone of my own.

1. The first commit, `5514ee33`, holds only `tests/review-pages-release-limitations.test.mjs`, and CI run 39137473192 is
   red on it. CI run 39137748483 is green on the head.
2. Only `src/review-pages/` (`flow.mjs`, `kinds.mjs`, `sections.mjs`) and the new test file, which names MOD-review-pages,
   changed.
3. TST-926001 to TST-926005 name their requirements and MOD-review-pages.
4. The Acceptance holds:
   - `release-report/<id>` shows the changelog entry and one reason field for each failing test and worse rate;
   - *Accept* and *Accept all N shown* hand the typed reasons to `acceptAndRelease` as `limitations`;
   - with one reason empty, nothing is written and the test is named;
   - a green report has no field.
   I replayed the head's tests on the sprint head's `src/`: all five fail.

**The green commit changed one assertion of the red commit's tests.** The red commit asserted that a green report's
approval record holds no `limitation:` text at all. The green commit asserts that it holds no `limitation:` line naming
a test. MOD-release-evidence passes an empty list (`src/release-evidence/report.mjs:383`), and MOD-documents writes an
empty list as `limitation:` with no value. My replay gives
`"kind: release-report\nfile: …\nblob: …\nlimitation:\n"`, read back as `limitation: []`. The item's Acceptance says
only that "a green report is accepted as before". The earlier assertion was about another module's output, which this
item does not change. So the change is admissible. With the changed assertion, TST-926005 still fails on the sprint
head's `src/`, since that has no changelog section.

The empty line itself does not fit MOD-approvals' Data, which states `limitation` as "zero or more" lines of the form
`<TST-<nnn> or rate> — <reason>` (MOD-approvals.md:75). It goes to the review as a finding for a backlog item.

**Agreements 83 and 89.** The head contains the sprint head `b6507672`. On the head, with the Bridge packages and
LC_ALL=C, I ran every release test file and the tests of MOD-review-pages, MOD-release-evidence and MOD-test-pages, and
`tests/site-usability.test.mjs` and `tests/site-accessibility.test.mjs`: 1,019 tests, 975 pass, 1 skipped, 42 todo, and
1 fails. The failure is the known TST-320321902.

**For the review, not conditions of this gate:**
- The report's rendered text already holds its changelog entry and limitations, so the page now shows them twice.
- *Accept ticked* on `release-report` hands no reasons, so a red report ticked there is refused with LimitationMissing,
  and the refusal names its tests. The item names only `<id>` and `/all`.
- TST-905001 to TST-905010 failed once in CI on #905, as they did on #895. They are team 1's tests.
