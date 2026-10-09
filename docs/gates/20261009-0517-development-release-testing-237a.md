# Development → Release testing: ITM-276

**MEASUREMENT**

- Decision: **PASS**, by po-sol, gpt-6.1-sol, at 2026-10-09 05:17 UTC.
- Job: JOB-20261008-2139-e276; actual Taken 2026-10-08 21:40:19 UTC. This concludes the same review, not a new start.
- PR: https://github.com/akmaier/agent-m/pull/237, into sprint/16.
- Approved source head: **a926b1447a86bcfa00576914eec50388f15f3ba3**.

## Original acceptance and scope

Read the original AGENTS/SPEC, declared Team2 process, participants and pinned scrum-wip model, Sprint16, ITM-276,
originating JOB-20261008-1438-ece8, UC-003/UC-044, MOD-desktop-shell/ARC-050, the affected frame/Bridge interfaces,
actual composition and guarding tests. Previously personally completed whole-project original reads remain at their
verified unchanged pins; SPEC blob is 1de56e76de63bfe5f3f4bb98820adad801041def.

The merge-base PR diff contains seven src/desktop-shell files and one new module-named component-test file. It changes
no helper, old expectation, workflow, SPEC, use case or architecture. Writing commits declare unreleased,
developer-terra-c and gpt-5.6-terra; ordinary inherited integration retains their history. This PO implemented none of
the guarded behavior. The original tests-only commit 2eebbb5538a3a928365d41cbd5f495d06c3876dd has actual red CI
37796816348: desktop-shell.test.mjs:11 fails reading the missing production main.mjs; Python succeeds. SPEC's first-commit
requirement is met without adding a chronology invariant. The recorded automatic loop parameter remains 3; manual
commits and Scrum decisions are not automatic draft/check rounds.

## Actual acceptance path

src/desktop-shell/main.mjs:40 → start → CLI instance/origin/private folder → compose.mjs → real serveBridge with empty
work handlers. The server binds to loopback, checks configured origin and token, refuses unsupported work, and reads
the rotated private token. main.mjs:27 → own protocol → confined local files → isolated BrowserWindow at :48 → fixed
preload → window.mjs → public startPage with bridge routes/empty strategies and shared explanations. The fork-specific
hostname/pathname preserves identity without new PageSetup fields or renderer Node access.

The real native component cases verify address/token and Copy, explicit Pair anew confirmation with old-token refusal;
pause/resume and renderer Quit/server shutdown; occupied-port recovery; unwritable-folder visible failure; actual
default instance folder with 0700/0600 permissions; native close and second-process reopening, minimize and restoration.
main.mjs:53 copies via native clipboard; :62 handles second-instance; :63–69 supplies platform close behavior; the
module-scope Tray retains its lifetime; :71–76 shuts down the server on Quit. The fixed preload carries only the shell
controls. No endpoint key or repository credential is retained, and token values do not enter URLs, repositories or
diagnostic logs. Runtime acquisition and the actual production source-start command are named in the live PR body.

## Executed evidence

All six author counter-proofs were read, including their restored positives: missing own file (001), disabled pause
(002), retry retaining occupied port (003), corrupted NotWritable category (004), disabled second-instance show (005),
and wrong default instance-folder suffix (006). Logs are /private/tmp/itm276-fault-001.log through -006.log and the
corresponding itm276-restore files. They fail at actual component guards, rather than merely inspecting source text.

Independent exact-head native positives were executed at 02da103 (6 PASS), tray-retaining 57d157f (6 PASS), and final
a926b144 (6 PASS, 0 failures/skips, 5.119s): /private/tmp/po-sol-276-a926b14-positive.log. Final tests await the real
Electron clipboard operations and observe actual second-instance events. Linux's owned test adapter supervises
Openbox on the same Xvfb display; failure is thrown, not replaced with a skip or successful fake. Production start
has no test-only entry or test-only sandbox flag.

Independent probes of the newly added guards used a known positive before each fault:

| Guard | Actual source fault and failure node | Exact restoration |
| --- | --- | --- |
| Copy (001) | main.mjs:53 writes a controlled wrong clipboard value; the native Copy equality wait fails after the real page loads | CASE001 PASS, /private/tmp/po-sol-276-001-copy-restore.log |
| Close (005) | main.mjs:69 retains the macOS window instead of hiding it; the native closed/hidden wait fails | CASE005 PASS, /private/tmp/po-sol-276-005-close-restore.log |

Fault logs are /private/tmp/po-sol-276-001-copy-fault.log and -005-close-fault.log. These fail at Copy/close assertions,
not at startup lock acquisition. The disposable source was byte-restored. Final main.mjs has blob
0b35d38ec84c04bfc7cc90fa5e0b283375a4e239, identical to 57d157f; later changes are the owned component adapter.

Live PR head/READY status and both CI conclusions were independently read at decision time. Full final run
https://github.com/akmaier/agent-m/actions/runs/37887227051 succeeds on the approved head: Node 1003 tests, 995 pass,
0 fail, 8 historical TODO; Python 399 tests run, OK with 5 skips and 6 expected failures. Actual retained log
/private/tmp/root-itm276-ci-37887227051.log contains all six Linux component passes. Node/Python jobs complete in
49/45 seconds. The current PR body contains the executed proofs and final successful CI.

## Disposition

Approve this exact ITM-276 source component for Development → Release testing and its PR merge into sprint/16.
Independent release testing remains required. This does not claim signed distribution, Windows-native measurement,
complete UC-044/UC-003, work handlers or later Bridge features. Root alone publishes and merges the unchanged approved
head after checking live green CI. No architecture acceptance or Sprint closure is made here.
