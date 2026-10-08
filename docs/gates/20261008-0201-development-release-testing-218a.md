---
gate: Development → Release testing
job: JOB-20261008-0159-3c61
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 1bc37e5f6ea2c626d0123d8548451db8fdc469f2
  - https://github.com/akmaier/agent-m/pull/218
date: 2026-10-08 02:01 UTC
---
# Development → Release testing: independent waiting-report tests

**REGISTER**

## Decision

Rejected on exact head 1bc37e5f6ea2c626d0123d8548451db8fdc469f2 of PR218 into sprint/13,
base 184b65148e557ad5769ccab466756e6f171aa94b. Do not merge this head. Both new tests miss meaningful
coverage of the original ITM271 acceptance before completion and after acceptance, as controlled probes below
establish. Correct only the new test files and their evidence, within the existing fixed job limit; no production
change is requested. A corrected exact head needs another independent decision.

## Original basis, scope and independence

Read the original deciding and write-tests jobs, item271, current UC047, relevant accepted module interfaces and
notification module original, actual dashboard/harness/notification callers, the complete two-file PR diff, its single
commit and current PR body. Team2 process, full participants, Sprint13 and pinned scrum-wip remain at their personally
read original pins: process eb772d456a24c145fe3f98778509f207e34e172d, participants
aba8b680f7df66e2807701294c960a3c29fb0148, sprint 4a08bf56fad2427aa563a495046a193f19e9521b.
The previously personally completed full SPEC, all 46 use cases plus README and all 70 architecture originals remain
unchanged: SPEC 1de56e76de63bfe5f3f4bb98820adad801041def, use-case tree 108d9ff406b1386f60e9bbe78607f1864b9457dd,
architecture tree 72079a3affe0be70b398afe89fa32c6ad063364a. No other agent's summary replaces those originals.

The job is write-tests, not implementation: no tests-only first-red obligation is invented. The one commit has the
required unreleased/developer-terra-e/gpt-5.6-terra provenance. Its parent is the merged239 head 184b651; only
new tests/system-uc-047-release-report-waits.test.mjs (TST-293001, system) and
new tests/release-uc-047-release-report-waits.test.mjs (TST-293002, release) change. All inherited source, helpers,
old tests and expectations equal the parent bytes. Both cases state readable input, precondition, expected result,
level and guarded identifiers. Terra-e, including Sonnet-e predecessor, implemented none of the guarded239/247/252
or UC047 notification behaviour. The inspected inheritance identifies239 as Terra-b, ledger252/progress235 as
Sonnet-b, notifications236 as Sonnet-c, with repository-host247 Sonnet-d provenance preserved. po-sol authored none
of those implementations or these tests. No SPEC, use case, architecture or process acceptance is performed here.

The deciding job was recorded before dispatch; both jobs retain limit 3. This is the first independent gate review
round; no limit is raised or reset. The write-tests record honestly states that Taken was not recorded at dispatch;
no timestamp is backdated. No paid service calls were made; cost/usage is not guessed.

## Actual public path and satisfied checks

The cases load the real dashboard through tests/app-harness.mjs:273–300 openDashboard, with repository files served
by repoServer's existing fetch pattern and an enabled browser notification store. Dashboard-app.mjs:454–463 starts
watchForAcceptance; checks.mjs:39–43 executes its immediate and interval checks; :90–92 reads a real host snapshot
and waitingForAcceptance; progress-measures/stages.mjs:49–53 maps reportsAwaitingAcceptance to release-v<version>;
release-evidence/report.mjs:260–267 reads tags and the candidate run. The actual notification reaches
checks.mjs:124–145 → currentRegistration → the browser's showNotification capture. Its address comes from
dashboard-app.mjs:439–445 addressOfNotification and its release route, not from a fake notification function.

On exact-head positives, both cases pass. They observe one completed report with the correct release-v2026.10.8
identifier, repository akmaier/agent-m and absolute https://akmaier.github.io/agent-m/?#release address, and no repeat
on the next unchanged check. The panel/click and actual native browser reachability remain outside this item.

## Required per-case counterproofs reproduced

In disposable exact-head archive /private/tmp/po-218-o6165918, the original two cases first passed 2/2.
The author-recorded faults were independently planted and executed, one at a time:

- TST-293001: invert report.mjs:266's done condition. The system case fails at:73, actual notification count 0 versus
  expected 1 after completion. Byte restoration makes the case pass.
- TST-293002: replace checks.mjs:129's single-file title suffix with “is ready”. The release case fails at:58,
  actual release-v2026.10.8 is ready versus expected release-v2026.10.8 waits for your acceptance, while its repository
  and release address remain visible. Byte restoration makes the case pass.

Both recorded counterproofs are valid; rejection does not impose a separate counterproof for every assertion.
The following additional probes address demonstrated coverage of original item acceptance, including the specifically
requested accepted-state question, rather than adding requirements.

## Complete unresolved acceptance findings

1. **Accepted state is masked by deduplication in both cases.** Original271 requires “none once the report is accepted,
   its report file and release tag written”. System:83–86 and release:64–66 add those fixtures, but assert only that
   the previously observed count remains1. Known positive: both cases pass on original code. Controlled fault:
   replace report.mjs:250's candidate filter by candidate-only, removing both release-tag and report-file exclusions.
   Both tests still pass2/2, exit 0. Data flow: report:250 now retains the already accepted candidate → :267 returns
   its unchanged run path/blob → stages:49–53 still derives a waiting report → checks:95–97 rejects it as already
   notified → system:86/release:66 see count 1. Expected semantic state is that this report no longer waits; the faulty
   semantic state is still waiting. The assertions cannot distinguish them. The new tests must meaningfully establish
   the accepted-state requirement through the public dashboard path, without relying solely on unchanged-notice dedup.

2. **Unfinished state is masked by the first-check baseline in both cases.** Original271 requires “nothing notified
   while the candidate's run has not ended”. System:65–68 and release:53–55 check only the initial baseline, then
   immediately change the job to done. Known positive: both original cases pass. Controlled fault: remove only
   report.mjs:266's done guard. Both tests still pass2/2, exit 0. Data flow: :267 incorrectly returns the unfinished
   run → checks:92 stores it in the baseline, but :93 suppresses every first-check notice regardless of run state →
   both initial assertions see nothing. End changes the run blob, so the later completed-run notice still appears;
   the entire test remains green. Neither case exercises a subsequent due check while the candidate remains unfinished.
   The new tests must make this original unfinished-state requirement observable after baseline establishment.

All controlled faults were restored in finally blocks; final original cases again pass2/2. Restored hashes equal
submitted source: report.mjs 7e47227df7087b9cb3edea590f1bfd4de67ede53 and
checks.mjs 7eb18a3de992ba9d9885256d0bf64a78ea9715ba. No mutant commit or source edit is published.
The PR body accurately records the two author faults, but its broad coverage claim is incomplete in the two phases
above. Revise that evidence together with corrected tests; no full UC047 or UC013 claim is accepted.

## Live whole CI and disposition

Live run https://github.com/akmaier/agent-m/actions/runs/37715501108 completed SUCCESS on the exact reviewed head.
Node 113110919721 finished 01:58:23 UTC: 944 tests, 936 pass,zero failures,8 TODO. Python 113110919601 finished 01:58:49 UTC:
397 tests run, OK with 5 skips and 6 expected failures. Green CI does not resolve the demonstrated masked acceptance.
Only scrum-master-session can merge an independently approved unchanged green head. No merge is authorised by this
rejected decision, and no sprint closure is written by the decider.
