# Development → Release testing — ITM-280

**REGISTER**

Decision: **PASS / APPROVED** solely at PR244 head `d117af774d3ef3a95088002ef5a8de5ef7a10622` into `sprint/16`.
Decider: po-sol. Actual Taken: 2026-10-09 08:20:00 UTC. Decision: 2026-10-09 08:47:11 UTC.
Review job: JOB-20261009-0819-p280; implementation job: JOB-20261009-0808-c280; author developer-terra-c.
PR: https://github.com/akmaier/agent-m/pull/244

## Original authority and declared scope

Read published job/selection/item and original AGENTS/SPEC before isolation; retained earlier personal full binding reads
only after rechecking unchanged original blobs `7e8f20ca35cd48a5250d143b07a469d46986f123` and
`1de56e76de63bfe5f3f4bb98820adad801041def`. Read original README, Team2 declaration/participants/pinned scrum-wip,
Sprint16, writing job, MOD-settings-pages/browser-store/bridge-client, ARC-040, UC-003/044, original working callers
and existing same-scope tests. No accepted document, selection or declaration change is proposed or accepted.

AGENTS §6a: “First read the existing, working caller — then probe”; §2 requires traceable data-flow/failure-node proof.
SPEC §11 “A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires input/precondition/expected result;
“A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT” requires recorded guarded-code fault and own failing result.
SPEC “THE DEFAULT DEFINITION OF DONE IS THE JOB RULES” requires green CI, tests-only failing first commit, owned-module
changes, named requirement/module and recorded gates. SPEC “A STORED SECRET IS HIDDEN UNTIL SHOWN” requires password
field and Show; “A CLEAR IS A REAL CLEAR” removes stored credentials; “EVERY STEP EXPLAINS ITSELF” requires expandable
explanation; “THE PAGE STATES WHAT IT SENDS WHERE” requires destination/data disclosure before a run.
The pinned scrum-wip Development → Release testing gate requires green CI and DoD. This reviewer authored none of this
implementation or its tests; guarded settings-pages history identifies A/C, including predecessors. E/predecessor E
release independence remains separate. Manual reviews are not automatic draft/check correction rounds.

Exactly four files differ from prerequisite `c2def7c62e2ba021b61c6a4e2eefe3b38ef6b193`: owned bridge.mjs164lines,
index.mjs route composition, settings.mjs51 added lines, and one124-line new unit-test file with exactly two cases,
TST-280001/002. Each names module, guarded requirements, preconditions/input/expected result. Existing direct endpoint,
add-product, browser-store/client tests and expected results are untouched. No adapter/helper/workflow/package/source
outside owned settings-pages, accepted contract or process edit. Implementation commit identifies unreleased/C/Terra.

## First red and complete bounded outcome

Personally read complete7056-line actual first-red run37903868493 at tests-only
`1c31a141145c8153f6bbacede3b1102e50e4b9ab` (only86-line new test). Both cases fail at public bridgeRoute31 lookup:
view.routes has no bridge, expected exposed Route; original test locations38/66. Existing direct guards pass.

Current flow: public settings-pages/index imports the bridge Route; `bridge.mjs:111 → pair(:116) → bridge-client
addressOf/bridgeAt → call → GET /v1/pair` sends the copied token only in the protocol header, credentials omitted from
URL/cookies. Only pair's successful returned `{ address, token }` is stored at117; refusal/NoAnswer/Timeout at120–121
shows an actionable named failure without storing success. Controlled network unreadability is a fetch rejection,
not an assertion that a browser can diagnose its inaccessible underlying response. No endpoint call is made here.

Bridge render93–96 reloads separate public store records; saved HTTPS token comes from bridge, never an extended
jump-host shape. Controls initially hide Bridge token, HTTPS token and web password, then reveal only via Show.
Settings bridge Change delegates to bridge; Bridge Clear125 and Settings bridge Clear remove its actual store entry.
Settings jumpHostLine121–136 provides Change and Clear128 of the actual login-bearing jump-host entry. Endpoint entries
remain independent. Browser-store clear → removeRaw → localStorage.removeItem removes actual entries.

HTTPS save129–140 validates credential-free HTTPS, writes accepted `{ hostname, user, sshPort, portRange,
httpsAddress?, login? }` to jump-host137 and copied token plus selected address to separate bridge139. Saving works
without successful loopback pairing, sends zero hidden requests and explicitly says untested. Trusted certificate,
web-server login before forwarding and instance-only origin are disclosed before Save. Shared Pages-origin notice
precedes Pair/Save. Pairing uses shared explain('bridge-pairing'); HTTPS step has its own details.explain, both expandable.
No secret enters a repository, log, cookie or URL; no repository writer is called by these handlers. Source provides
configuration only; ordinary endpoint route remains direct. No reachability/tunnel/certificate/distribution/full UC003/044 claim.

Independent exact-head positive runs: new Bridge cases + existing endpoint/add-product/dashboard wiring36/36;
existing direct UC003 system5/5; total41pass,0fail/skip/TODO/cancel. Logs
`/private/tmp/p280-final-source-positive.log` and `/private/tmp/p280-direct-system-positive.log`. Controlled public
DOM/storage/fetch use the working test patterns; no paid service or native Electron launch.

## Actual per-case faults and exact restoration

Independently reproduced both recorded code faults in disposable exact-head archive
`/private/tmp/po-sol-280-final-proof-1_tn3o8d`, never in author or review checkout. Remove bridge Clear's125 storage call:
click → no removeRaw → stored bridge remains; TST280001 own assertion71 fails with actual
`{ address: "http://127.0.0.1:4711", token: "copied-token" }`, expected null,0pass/1fail,exit1.
Restore original bytes, same case1pass/0fail,exit0. Insert fetch(httpsAddress.value.trim()) into HTTPS Save:
click → extra request; TST280002 own assertion117 fails actual `[earlier /v1/pair, https://jump.example.test/bridge/demo]`
versus expected only earlier pair,0pass/1fail,exit1. Restore bytes, same case1pass/0fail,exit0.
Both restores preserve bridge blob `210e3a77496780ac1f44ce0916dba38051b6beb3`; settings blob
`b8bd4a02b0c42437cb751b244376eae523a5953a`; test blob `401052ceab736503967cf7c39af6818acc6fb798`.
Logs `/private/tmp/p280-final-fault-{clear,hidden-request}.log` and matching final-restored logs.
No new per-assertion mutation quota or raw-log-retention condition is imposed.

## Complete exact-head CI and disposition

Read all7026 lines and parsed all outcomes of https://github.com/akmaier/agent-m/actions/runs/37906140278:
exact d117af7, both jobs SUCCESS; Node1020total/1012pass/0fail/8existingTODO,0skip/0cancel,47s;
Python399runOK,5skips/6expected failures,60s. Complete log `/private/tmp/p280-corrected-full-ci.log`, SHA256
`bbf19a1598ed490ecfdeca50afb457008c77287bb6e5d0629abb89fa7e5ec328`.
Immediately before decision live PR remains OPEN, base sprint/16, exact unchanged d117af7 and both checks SUCCESS.

Earlier frozen fc5567b native outcomes in CI37904863855 attempt1 failed and attempt2 passed on the same commit;
SPEC “A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY” says shown as flaky, never as passed. Retain that finding:
existing native runtime25 → shared npm prefix → install.js/@electron/get → absent semver/index.js. It is not relabelled
as passed or waived. Separately selected276 fixture repair remains required before aggregate Release testing; it is
not a further source280 dependency. This decision relies on the current changed source head and its complete green CI.

Integration original known-positive: dashboard settings/endpoints.renderSection mounts the public settings Route;
settings-view452/529/544 discovers and mounts sections, src/site/views50 declares settings/bridge.mjs, dashboard-app522
currently dispatches endpoints only. Root separately reviews a bounded owned-route caller after source merge, with no
setup/parser logic. Independent E280 release/system coverage follows that actual public setup, not storage seeding.
Do not select269 until the merged route and actual entry are named. D279 denied publication stays untouched/pending.

Approve only unchanged d117af7 after publication of this immutable record and exact-head PR decision; root alone
publishes/comments/merges against live full green. Whole selected Release testing → Sprint review and closing gates
remain separate. Reviewer commits only this record/local decision; no external write or product/test/accepted-doc edit.
