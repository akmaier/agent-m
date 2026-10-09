# Independent selected native release tests — final PR241

**REGISTER**

Decision: **PASS / APPROVED** solely at `5758918aa8ddb34a3a465c2327847e5cdc5be262` into `sprint/16`.
Decider: po-sol. Ongoing job: JOB-20261009-0735-p276r. Actual Taken: 2026-10-09 07:37:44 UTC.
Final decision: 2026-10-09 07:59:14 UTC. Writing job: JOB-20261009-0651-e276r; guarded item ITM-276.
PR: https://github.com/akmaier/agent-m/pull/241

## Authority, scope and independence

This final exact-head decision supersedes the earlier-head approval for merging. The immutable earlier record
`docs/gates/20261009-0741-independent-selected-tests-241.md` (commit `1ce54e2fdc6b9ebd1534ea6fed10510944385b61`,
blob `749742b1fe23b298ba462c90ad2dabc6c465fd86`) is retained unchanged. Its personally read original job/item,
ARC-050, MOD-desktop-shell, UC-044/UC-003, full AGENTS/SPEC/README/process/participants and existing same-scope
caller/test context remain applicable. Original AGENTS and SPEC blobs reverified at final head:
`7e8f20ca35cd48a5250d143b07a469d46986f123` and `1de56e76de63bfe5f3f4bb98820adad801041def`.

AGENTS §6a: “First read the existing, working caller — then probe”; §2 requires concrete failure-node evidence.
SPEC: “RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER”, “A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS”,
“A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT”, and “A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS”.
These apply to this independently authored selected-item release case and independent PO decision. No implementation
first-red requirement applies to write-tests work. Whole Release testing → Sprint review follows all selected coverage.

Only one new release test TST-276901 remains. E/predecessor E authored none of the guarded shell/HTTP/frame source;
this reviewer authored neither guarded implementation nor test. From earlier reviewed0608d5c through92abac to5758918,
only this author's new test changes: accurate planted-fault comment, then fixture Quit handling. No source, existing test,
assertion, expected result, accepted contract, declaration, selection, package or workflow change. Final test blob
`0f154793a7966deacc472230a94533f8d742eefa`; production compose remains
`ab58edaab04f7e09ea00cf52c5815e4519be37ca`, main remains `0b35d38ec84c04bfc7cc90fa5e0b283375a4e239`.

## Actual native flow and correction verification

The unchanged declared case starts production Electron main with a fork identity, origin, controlled ports and empty
private folder. Main40–48 creates the isolated actual BrowserWindow; main27–36 confines its own-file protocol;
preload exposes seven fixed controls. Main78 → compose5 → serveBridge starts the actual loopback API; main51 →
preload.state → window5–22 renders its address. The test observes exact fork page, fixed API, undefined process/require,
loopback address, private token and configured-origin200 / foreign-origin403. Runtime acquisition/CDP/Xvfb/Openbox
fixture follows existing native caller, with bounded waits and actual readiness probes; no success skip/fake runtime.

The actual failed intermediate CI37901001064 reports `CDP Runtime.evaluate closed before responding.` at the new
fixture's socket close handler86 during Quit. Data path: stop124 → renderer Quit click → preload IPC → main61 app.quit
→ main71–76 closes Bridge and exits Electron → renderer/CDP connection closes before evaluation response. Existing
working caller `tests/desktop-shell.test.mjs:111` already catches this Quit-evaluation closure, then requires actual
server unavailability and actual process exit. Final fixture124 copies that handling;125 still waits for real server
shutdown and127 waits for real exited event, with timeout cleared128. A failed Quit that leaves the process/server
running still fails these waits; no behavioral assertion is weakened. All six existing native cases remain positive.

Independent final-head command `node --test tests/release-itm-276-desktop-shell.test.mjs` uses actual Electron44.5.1:
1pass,0fail/skip/TODO/cancel,1.133s. Log `/private/tmp/p276r-final-independent-positive.log`.

Earlier independently executed source counter-proof remains unchanged and valid: disposable exact source archive
host127.0.0.1 →0.0.0.0 reaches main78 → compose host → server12 BindRefused before token creation13. New test's
private-token precondition fails via bounded wait: actual missing token / timeout versus expected existing private token,
0pass/1fail/0skip. It never reaches the displayed-address assertion. The final author's comment now accurately names
this observed node. Exact compose restoration to `ab58edaab04f7e09ea00cf52c5815e4519be37ca` passed1/1 in0.600s;
logs `/private/tmp/p276r-independent-fault.log` and `/private/tmp/p276r-independent-restored-exact.log`. The retained
prior record documents the excluded disposable restoration-command error. Guarded checkout bytes never changed.
No additional fault quota or raw-log-retention obligation is imposed.

## Complete current CI and disposition

Read complete6990-line run https://github.com/akmaier/agent-m/actions/runs/37901484807 and parsed all outcomes:
exact5758918, both jobs SUCCESS. Node1014total/1006pass/0fail/8existingTODO,0skip/0cancel; Python399runOK,
5skips/6expected failures. New case and all six existing native cases pass. Actual Node45s/Python64s fit the budget.
Complete log `/private/tmp/p276r-final-full-ci.log`, SHA256
`8c527f06a859c0dfce08ea90aea5407ba22783c5f30d30e90036b3397a3ad0a1`.
Live PR verified OPEN, base sprint/16, unchanged exact5758918 and both successful full checks.

Approve only this final unchanged exact head after publishing the immutable records and this decision. Root alone
publishes the PR decision and performs the exact full-green merge. Whole selected release coverage and Sprint review
remain separate. This approves the native source-folder fork/private-preload/loopback/pairing slice, without claiming
signed distribution or full UC-044/UC-003 delivery. Reviewer writes only this new immutable record/local decision;
no external comment/push/merge or human-owned artifact acceptance. Manual Scrum reviews are not automatic correction rounds.
