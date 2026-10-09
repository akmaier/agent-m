# Independent selected browser-store release tests — PR247 final

**REGISTER**

Decision: **PASS** only at `75c91076a7c2f985bda59413ee42b53121c574ef` into `sprint/16`.
Decider: po-sol. Ongoing job: JOB-20261009-0923-p279r; writing job: JOB-20261009-0704-d279r; item ITM-279.
Actual Taken: 2026-10-09 09:25:49 UTC; decision: 2026-10-09 10:46:08 UTC; cost: null.
PR: https://github.com/akmaier/agent-m/pull/247

## Original scope, rules and independence

Original published Start was read before isolation. Full original AGENTS/SPEC/README/Team2/pinned-model reads retained
with verified unchanged AGENTS `7e8f20ca35cd48a5250d143b07a469d46986f123` and SPEC
`1de56e76de63bfe5f3f4bb98820adad801041def`. Original current Sprint16/item/writing job, UC003/044,
MOD-browser-store and JumpHost's MOD-bridge-client type, source238a/b records, public callers and all existing
same-scope tests were read. The earlier immutable rejection records the complete retained document pins.
AGENTS §6a: “First read the existing, working caller — then probe”; §2 requires traceable actual/expected failure paths.
SPEC “A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires declared input/precondition/result;
“RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER” and “A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS”
require independent writer and decider. This selected write-tests job has no implementation first-red condition.

Only the author's new57-line MOD-browser-store release file/four cases differs from approved Sprint16 prerequisite
`011e779574130f5f10103272e0c1742790b38a75`. No source/helper/old-test/accepted-document/declaration edits.
Actual history identifies B for endpoint/jump-host/listing and predecessor Sonnet-A for core store; neither
D/predecessor D nor po-sol authored guarded source. Reviewer authored neither guarded source nor these tests.
Correction983b2c1 carries unreleased/developer-terra-d/gpt-5.6-terra trailers;75c91076 ordinarily integrates the prerequisite.
This is an individual selected-item release gate, not aggregate Release testing → Sprint review.

## Corrected contract and positive evidence

Accepted MOD-bridge-client Interfaces78–79 defines JumpHost.login as optional `{ user: string, password: string }`.
The new fixture12 now uses that shape. R1 declares persistence of every field and compares public reread to the whole
nested object. R2 declares isolation, uses distinct nested credentials and checks both instance hostnames/passwords.
R3 declares metadata-only listing: secret:true, bridge setup and exclusion of actual login user/password/hostname
strings. R4 declares real Clear and verifies raw localStorage absence plus public reread null. Header names
MOD-browser-store, UC003/044, configuration-in-browser/hidden-secret/real-clear guards and release level.
The earlier REJECT44d5 is preserved unchanged at docs/gates/20261009-1033-independent-selected-tests-247-reject.md
(commit a09daa3e04aeebc500cfdb53fc28d1d0b4038af7); its specific shape/coercion finding is resolved here.

Independently executed exact-head new4 + existing17 browser-store/core/endpoint/list/jump-host cases:21pass,
0fail/skip/TODO/cancel. Log `/private/tmp/p279r-final-positive.log`. No native Electron launch.
New test blob: `e95ed4d58d4b65b9be7ffae007da0f2e86d359b9`.

## Executed code faults and byte-exact restoration

Used a disposable exact-head git archive, one guarded CODE fault at a time, without changing expectations or the
review worktree. Each selected own case actually failed (exit1); original bytes restored before its same-case
positive (exit0,1pass). Source blobs restored: index `ffafe074d14ae2396f7f3fd8ab64b3dce328dd08`,
store `ede229398c38f93056d1eb26c79a562a77567407`.

| Case | Actual public call/data flow and fault | Failure node, actual / expected |
|---|---|---|
| R1 | test19 → index34 writeSetting → omitted setRaw/JSON serialization → index25 readSetting/getRaw | test20 deepEqual: null / complete nested JumpHost |
| R2 | test26–29 → openStore → store21 prefixOf loses instance → setRaw writes both under same key → readSetting(a) | test30: other.example.test / jump.example.test |
| R3 | test41 → index84 listSettings → settingDescription jump-host secret:false | test43: false / true |
| R4 | test54 → index41 clearSetting → store65 removeRaw no-op → persisted raw JSON retained | test55: serialized complete nested JumpHost / null |

Actual per-case fault/restored logs: `/private/tmp/p279r-final-R1-fault.log` through R4-fault.log and corresponding
R1-restored.log through R4-restored.log. The observed R3 counterproof concerns its secret flag; its credential-value
exclusion checks remain separately positive. No additional mutation quota or raw-log retention obligation is asserted.

## Complete current CI and exact-head decision

Read complete7050-line CI https://github.com/akmaier/agent-m/actions/runs/37918948480:
Node1024total/1016pass/0fail/8existingTODO/0skip/0cancel; Python399 OK,5skips/6expected failures.
All eight Node not-ok records are the explicit existing TODO findings. Both jobs SUCCESS, completed
2026-10-09 10:40:35/10:40:32 UTC. Both checkouts show synthetic merge bcff471 of exact75c91076 into approved011e779.
Complete log `/private/tmp/p279r-final-full-ci.log`, SHA256
`2d15ce88cba49ffdd2da0784053eb9e4d3720c2d0733134b546d78c6ab07fe17`.
Live PR247 independently reconfirmed OPEN, base sprint/16, exact reviewed head and both completed SUCCESS checks.

PASS this exact unchanged head. Root may publish this immutable record and exact-head decision, then merge this
approved green selected test PR. Prior reject remains evidence; no previous flaky outcome is relabelled passed.
PO performs no external publication, source/test edit, native launch or job End.
