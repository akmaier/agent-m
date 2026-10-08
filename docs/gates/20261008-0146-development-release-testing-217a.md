---
gate: Development → Release testing
job: JOB-20261008-0140-286a
decider: po-sol
role: Product Owner
decision: passed
on:
  - f45cd15d3e36ef968a7226efe8fbdff61f8bf558
  - https://github.com/akmaier/agent-m/pull/217
date: 2026-10-08 01:46 UTC
---
# Development → Release testing: the release test report that waits

**REGISTER**

## Decision

Passed for ITM-239 on exact head f45cd15d3e36ef968a7226efe8fbdff61f8bf558 of PR217 into sprint/13,
base 244377a72b03e1e96abc102a9738d43d522209d0. scrum-master-session may merge only this unchanged head
with live green CI. ITM-271's independent system and release tests follow its merge; this gate does not claim
complete UC-047 delivery, UC-013 execution, browser reachability, or acceptance of SPEC, use cases or architecture.

## Original basis and independence

Read original AGENTS.md, the applicable SPEC rules, Team2 process and full participant declaration, pinned scrum-wip,
Sprint13, ITM-239, UC-047, the affected accepted module originals, current jobs, all twelve changed-file diffs and
changed functions and their existing callers, complete six-commit history, current PR body and actual CI logs.
Bounded rereads repaired truncated outputs. The full SPEC, all 46 use cases plus README and all 70 architecture files
were personally read in the preceding whole-corpus job. Their current pins remain SPEC
1de56e76de63bfe5f3f4bb98820adad801041def, use-case tree 108d9ff406b1386f60e9bbe78607f1864b9457dd and
architecture tree 72079a3affe0be70b398afe89fa32c6ad063364a; no summary replaces those originals.
The deciding job was recorded before dispatch, with limit 3 and implementation input blob
0698a54a7ee014523601573365e1f78196799483 at 84d6051. Neither job limit is raised or reset by this decision.
This is the decider's first gate review round. The implementation record retains the actual premature-edit,
helper-scope and numeric-ordering correction events rather than recasting them as an ideal first execution.

All six submitted commits carry unreleased/developer-terra-b/gpt-5.6-terra provenance. po-sol authored none of the
implementation, tests or fakes. Terra-e, including predecessor Sonnet-e provenance, remains reserved for 271's
independent release tests. No source or test was edited by the decider outside a disposable fault archive, and no
mutant was committed. No paid endpoint calls were made; usage/cost is not inferred as zero.

## Acceptance and actual data path

SPEC §11 requires a tests-only first commit with red CI and owned module scope; §12 requires readable cases,
one level and a recorded planted-fault counterproof for every new case. ITM239's original Acceptance further requires
waiting only after done and before acceptance, unchanged old expected results, empty-tags fake answers, and no
notifications source changes. The new cases declare unit level through their module-named files and state their
fixture input, precondition and expected outcome before execution.

Actual path: src/notifications/checks.mjs:90–97 reads the default-branch snapshot → waitingForAcceptance at
src/progress-measures/stages.mjs:35 → reportsAwaitingAcceptance at src/release-evidence/report.mjs:259 →
newestPendingCandidate at:243 reads the host's tags once, excludes released/reported versions and orders numeric
calendar components at:252 → recordsNewestFirst at src/job-ledger/index.mjs:400–405 reads matching job paths lazily
in descending timestamp order → report.mjs:263–265 stops at the first candidate run, returns nothing if different or
not done, otherwise returns version/tag/record/blob → stages.mjs:53–57 emits release-v<version> with the run's path/blob.
Existing notifications maps the release-report kind to its release route and deduplicates path/blob. Its source stays
unchanged. The unit fixture deliberately supplies the run record; actual complete-run execution is separate work.
The combined report case checks no entry before End, the exact entry after done, and no entry once the report exists.
The implementation also excludes a release-tagged version, as the accepted interface requires.

## First red and scope history

First commit 2c88071911733af501499291cf63f2dd8fcf6fb7 changes only three module-named test files.
Actual run 37712840460 on that exact head finished at 01:25:58 UTC: Node 113102480494 failed and Python 113102480719
passed. The Node log contains two missing public exports, recordsNewestFirst and reportsAwaitingAcceptance, and the
new waitingForAcceptance case at tests/progress-measures-waiting-for-acceptance.test.mjs:164 returning [] instead of
the report entry. Totals were 915 tests, 904 pass, 3 fail, 8 TODO. First production commit b1e62342c7e008643f5c362c3c988cb1b36211da
was committed at 01:30:35 UTC, after that actual red run. Earlier uncommitted production edits were stopped and remain
recorded in JOB 0119; the gate does not assert that they never happened.

The unowned tests/app-harness.mjs edit was removed. Its base and submitted blobs both equal
ccb83108b276ed86332329996b8b2d86fe2dfc9a. The complete submitted diff contains only four source files in
job-ledger/progress-measures/release-evidence and eight tests naming an assigned module. All touched old fakes only
answer the newly requested tags with []; their existing expected results stay unchanged. No helper is relabelled,
notifications source changes, or approval/declaration changes appear in this PR. The numeric 9→10 defect and its
correction remain in normal commit history; final comments/fake corrections introduce no additional behaviour.

## Independent per-case counterproofs

In an independent archive of the exact submitted head at /private/tmp/po-217-wwivch4_, the three focused files first
passed all 33 cases. Each following planted fault was executed on its named new case, then restored byte-for-byte;
each fault exited 1 with one failing case and each restored named case exited 0.

| New case and failure node | Deliberate guarded fault and actual versus expected |
|---|---|
| tests/job-ledger.test.mjs:539, assertion:548 — recordsNewestFirst yields only the newest until asked again | Remove reverse() at ledger:401: actual JOB-20261007-0900-aaaa versus expected JOB-20261008-0900-bbbb. The positive also verifies only the newest path was read. |
| tests/release-evidence.test.mjs:554, assertion:563 — complete run waits, unfinished/accepted does not | Replace report:265's completed report return by null: actual null versus the exact 2026.4.0 candidate/path/blob object. |
| tests/progress-measures-waiting-for-acceptance.test.mjs:155, assertion:164 — completed run adds its report | Remove releaseReport from stages:57's return: actual [] versus the release-v2026.4.0 entry with its record/blob. |
| tests/release-evidence.test.mjs:575, assertion:586 — 2026.10.0 newer than 2026.9.0 | Replace report:252's numeric comparator by a.version.localeCompare(b.version) || a.number-b.number: actual null versus the completed 2026.10.0 report. |

After all restorations, the same focused three-file command again passed 33/33, zero failures. Restored source blobs
match submitted bytes: job-ledger/index.mjs 8452048c4fcf6b44eca8282f24a607833f1b69f8,
release-evidence/report.mjs 7e47227df7087b9cb3edea590f1bfd4de67ede53 and
progress-measures/stages.mjs 37c30b5299e23b46fff393a31aa52d80ad4b5ba9.
The current PR body separately records the author's ascending-order fault, completed-run fault covering both unit and
progress cases, and planted lexical comparator after a known positive, with byte restoration and 30 restored cases.
Its completed-run wording accurately distinguishes unit null from progress []; its head remains unchanged.

## Exact-head whole CI and disposition

Live run https://github.com/akmaier/agent-m/actions/runs/37713915887 is completed SUCCESS on the exact approved head.
Node 113105912037 finished 01:38:55 UTC: 942 tests, 934 pass,zero failures,8 TODO. Python 113105912291 finished 01:39:20 UTC:
397 tests run, OK with 5 skips and 6 expected failures. These are actual current-head CI results, not author local claims.
No unresolved finding remains within 239's assigned contract. Only scrum-master-session merges; a changed head needs
another exact-head decision. The independent 271 testing and later whole-sprint gates remain separate.
