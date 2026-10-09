# Native fixture refactoring — PR245

**REGISTER**

Decision: **PASS / APPROVED** only exact `8ddd208ab8af9b2a19b2eb499443ab2f66d44988` into `sprint/16`.
Decider: po-sol; model gpt-6.1-sol. Job: JOB-20261009-0853-p276f.
Actual Taken: 2026-10-09 09:02:56 UTC. Decision: 2026-10-09 09:06:38 UTC.
Writing job: JOB-20261009-0833-e276f, developer-terra-e. Item: ITM-276.
PR: https://github.com/akmaier/agent-m/pull/245

## Authority, scope and provenance

Read the original AGENTS, whole SPEC, README, Team2 process/participants, pinned scrum-wip, Sprint16,
published deciding/writing jobs, ITM-276, ARC-050, MOD-desktop-shell, UC-003/UC-044, existing working native
fixtures and production single-instance caller before probing. Published Start was read before creating the new
isolated `.agent/worktrees/agent-po-sol-276-fixture-gate-16` branch; primary checkout stayed main.

AGENTS §6a requires “First read the existing, working caller — then probe”; §2 requires concrete failure-node
verification. SPEC §11 “A REFACTORING JOB BEGINS WITHOUT A FAILING TEST” requires actual green CI on every own
commit; “A REFACTORING JOB CHANGES NO EXPECTED RESULT” preserves expectations. SPEC §13 “A GATE IS NOT DECIDED
BY THE PARTICIPANT WHOSE WORK IT CHECKS” applies to this independent decision. The default DoD and Team2's
Development → Release testing gate govern this bounded refactoring; no new test/fault quota is introduced.

pinnedSource: AGENTS blob `7e8f20ca35cd48a5250d143b07a469d46986f123`; SPEC blob
`1de56e76de63bfe5f3f4bb98820adad801041def`; MOD-desktop-shell blob `71d36abb286361f9349b30f3fa9bb8bd2e4f4a06`;
UC-003 blob `82081a084479172f2f8f704211351b052edea8e6`; UC-044 blob
`6c80417a691b105488b2426c25245ae7f39a33a7`. Process model pin: `ef33e2f501289930960f13b55936e9b557003993`.

Live diff against approved inherited sprint head `11aaea759d42df8adaae35f711317be9bfe35ff1` changes exactly
`tests/desktop-shell.test.mjs` and `tests/release-itm-276-desktop-shell.test.mjs`: distinct temporary npm prefixes,
component adoption of the existing release Openbox readiness pattern, and atomic bounded cross-file fixture lock.
Own original commits e1b14a5/87c9a33 remain ancestors; final8ddd208 is ordinary inheritance of approved280.
All bytes from each file's first `test("TST-` through EOF equal original c2def7c: seven original cases, assertions,
expected values, deadlines, production launches and source-fault proofs are unchanged. No production/helper/workflow,
package, new case, skip, fake, contract, selection or declaration change. Final test blobs:
`236527845ec972d94f226f27ee6d08acfc27ee31`, `6c8da23ad12af2ea7a05945883f5f67ceb9d9af7`.

History assigns pairing implementation/component cases to C/predecessor C, endpoint composition to A,
and independent release case276901 and these fixtures to E. Sol/predecessor authored none of that guarded work;
E/predecessor authored none of the pairing/private-renderer production behaviour. Production main blob remains
`0b35d38ec84c04bfc7cc90fa5e0b283375a4e239`; inherited compose blob `04986a73ed6e23112d0db46668874d39e858eb2f`.

## Diagnosis and verification at the failure node

Original acquisition: both runtime callers → shared temporary npm prefix → npm package installation →
Electron install.js → @electron/get → missing semver/index.js. Original failed log
`/private/tmp/root-244-current-failed.log:1254–1258` identifies the binary-acquisition subprocess, status1,
missing `/tmp/agent-m-276-electron-44/node_modules/semver/index.js`, before production launch. Run37904863855
attempt1 failed and identical old fc5567 attempt2 succeeded. Those same-commit outcomes remain **FLAKY, never passed**
under SPEC §12 “A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY”. Distinct component/release prefixes at final files13/18
remove cross-file writes to that dependency tree. Both acquisition subprocesses remain bounded40s and fail honestly.

Original native concurrency: component launch → production main40 start → main43 requestSingleInstanceLock →
default Electron SingletonLock contention → app.exit0 before main45 whenReady → component wait/stopped (old103).
Author's original concurrent command failed276001/002/003; serial six component plus one release was known positive.
The supplied Bridge data-folder is for private Bridge data and does not isolate Electron's default profile.
Final component27–36 / release32–41 atomically mkdir the same temporary reservation before their cases, retry only
EEXIST for240×125ms, and rmdir only when held in the after hook. Non-EEXIST errors and exhausted acquisition fail.
The reservation holds through real cases and their cleanup. It does not guard launches inside a case, so unchanged
component276005 still starts real production processes that exercise main43 and main62 second-instance/window show.
Component readiness67–82 copies the existing release pattern: only an actual lock-frontend refusal permits finite
readiness probes; an unsuccessful final Openbox probe still throws. No product error becomes success.

Root released the native slot after E confirmed all author launches ended. Independent exact archive
`/private/tmp/po-sol-276f-exact-8ddd208`, command executed **once**:
`node --test tests/desktop-shell.test.mjs tests/release-itm-276-desktop-shell.test.mjs`.
Actual existing Electron launcher:7/7 pass,0fail/cancel/skip/TODO,6054.446375ms. Outcomes276001/002/003/004/006/005/901
all positive, including actual clipboard, pair/rotation, port/folder errors, private default files, native window
close/minimize/second starts and fixed preload/origin checks. Afterwards the lock path resolved using the same
node:os.tmpdir/node:path.join was absent. Log `/private/tmp/po-sol-276f-concurrent.log`.
No unrelated native process was killed; native slot released back to root after completion.

## Actual CI and disposition

Read actual CI metadata for every own refactoring commit: e1b14a56d8ce6db0b5ffb1e173cd02612f0b9e43
run37906486016 node59s/Python64s SUCCESS;87c9a33abc673f844bf88a8d0a4dd78b34c70ee7 run37907450553
node52s/Python62s SUCCESS. Final inherited8ddd208 run37908633101 node50s/Python38s SUCCESS.
Complete final7026-line log preserved and all outcomes parsed:Node1020total/1012pass/0fail/8existingTODO,
0skip/0cancel;Python399runOK,5existing skips/6expected failures. All seven native cases positive in the full Linux suite.
The checkout log names synthetic PR merge b2b37285f8382930a081e32786dd097e2989514d of exact8ddd208 into11aaea7;
run metadata headSha is exact8ddd208. Both jobs fit the declared2min budget.
Full log `/private/tmp/po-sol-276f-ci37908633101.log`, SHA256
`fe2e7274794224b1b33b390276870e8a9acb2838fad218adf0602f6b010e406a`.
Live PR rechecked OPEN,base sprint/16,exact8ddd208,both completed SUCCESS before this decision.

Root alone publishes this immutable record and prepared multiline PR decision, then merges only the unchanged
approved exact complete-green head. This is solely native fixture refactoring; no whole sprint/release,
signed distribution, full UC-003/UC-044 or human-owned acceptance is decided. D279's denied publication remains
untouched. Manual reviews are not Agent M automatic correction rounds; declared limit3 is unchanged.
Usage/cost unknown (null), never guessed.
