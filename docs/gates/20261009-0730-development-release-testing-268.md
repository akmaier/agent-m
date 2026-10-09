# Development → Release testing — ITM-268

**REGISTER**

Decision: **PASS / APPROVED** only for PR240 head `c701825ce43ba1a4ab28f225184066a0e9950ba6` into `sprint/16`.
Decider: po-sol. Taken: 2026-10-09 07:26:57 UTC. Decision: 2026-10-09 07:30:25 UTC.
Job: JOB-20261009-0724-p268. Guarded implementation: JOB-20261009-0651-a268, developer-terra-a.
PR: https://github.com/akmaier/agent-m/pull/240

## Authority and original inputs

Read the full original AGENTS.md, SPEC.md and README.md, Team2 process/participants, the pinned scrum-wip model at
`ef33e2f501289930960f13b55936e9b557003993`, Sprint16 selection, original item/job and affected accepted module/use-case
files before exercising the existing caller. AGENTS §6a requires “First read the existing, working caller — then probe”
and §2 requires a concrete call-stack/data-flow path with verification at the failure node. SPEC's
“A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS” requires independence; I implemented none of this
composition. The pinned model's Development → Release testing gate requires “CI is green on it and the Definition of
Done holds”, decided by Product Owner. Team2's Definition of Done adds no condition to the job rules.

SPEC's “AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST” requires tests-only first commit and actual red CI;
“A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT” requires recorded fault and failing result;
“A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS” requires declared input/precondition/expected result.
“A RECORD IS EVIDENCE, NOT A PROPOSAL” says gate records are written once. This is one new immutable gate record;
no SPEC, accepted contract, process, participant, selection, source or test is changed by this review.

Accepted original texts at review head match approval records: UC-003 blob `82081a084479172f2f8f704211351b052edea8e6`,
UC-044 `6c80417a691b105488b2426c25245ae7f39a33a7`, MOD-desktop-shell `71d36abb286361f9349b30f3fa9bb8bd2e4f4a06`,
MOD-bridge-http `2792f1d3a1a66eec9750fac85949ee78874e2956`, MOD-bridge-jobs `6450ce8ea05c66313bc234f95210bcd176b309ca`.
Same-scope originals reviewed include desktop-shell component/unit, bridge-http/jobs unit and independent release,
bridge-client unit/release, endpoint-calls, browser-store endpoint settings, endpoint settings/explanations/dashboard
wiring and UC-003 direct system/release cases. Their existing boundary and expected results were preserved.

## Scope and failure-node proof

Prerequisite shell revision is `82d0814533c6fb60d410f1084250fa10ee0f8752` (ITM-276 / PR237).
Its production entry remains `src/desktop-shell/main.mjs`: import compose at line5, initial call at line78, port-retry
call at line58. PR240 adds only `tests/desktop-shell-endpoint-composition.test.mjs` and changes only the owned
`src/desktop-shell/compose.mjs`: public jobHandlers import and registration in the existing serveBridge call.
No second Bridge server, test-only app entry or lifecycle change is introduced.

Actual path: `main.mjs:78 → compose.mjs:6 → serveBridge(server.mjs:11)` binds `127.0.0.1`, then the request goes through
`server.mjs:20` origin refusal, `:27` token refusal, `:37` typed body validation, `:38` handler lookup and `:40` dispatch.
`bridge-jobs/handlers.mjs:17–21` maps body.args into EndpointConfig once and calls the public endpoint test;
`endpoint-calls/index.mjs:36–43 → :59–64` builds one `/chat/completions` POST with the key only in Authorization,
one user message “Reply with one word: ok.” and max_tokens1, then returns `{ works: true, model: "small" }`.
The controlled endpoint in the new case receives the exact request at test lines41–44; test lines65–69 verify the
returned answer and exact single received request. Test line64 is the paired-response failure node: expected200.

TST-268001 declares before execution the real production composition and controlled local OpenAI-compatible server,
unpaired/foreign-origin/paired input sequence, refusal-before-dispatch, exact single short request and transient-secret
boundaries. It first positively checks actual loopback, then 401/403 and no upstream request. The paired path now
returns200 and `{ answer: { works: true, model: "small" } }`; the pairing-token file and request logs omit the endpoint
key, and logs omit its URL. compose writes no endpoint settings or export. No paid service is called.

Fault `jobs: {}` leaves `server.mjs:38` without a handler, returns404 at `:39` before invoking any endpoint caller,
and fails the original line64 200 assertion. The actual per-case source fault and positive after restoration are
recorded in the implementation commit c701825 and PRbody. Restored compose blob is exactly
`04986a73ed6e23112d0db46668874d39e858eb2f`, verified at the reviewed head. This same fault is independently visible in
the first red CI with its actual stack and status; no expected result was weakened. Test bytes are identical between
first tests-only edcf6e and final c701825 (git diff --exit-code on tests succeeds).

## Executed evidence

- First commit `edcf6e894b3d3a27943e18e371a40b827a666944` has only the new74-line test. Actual run
  https://github.com/akmaier/agent-m/actions/runs/37896442344 is failure at that exact SHA. Complete6999-line logs show
  TST-268001 as the only non-TODO Node failure: actual404, expected200, stack test line64. Python399runOK
  (5skipped,6expected failures); Node1013 total,1004pass,1fail,8existingTODO,0skip/0cancel.
- Exact final-head run https://github.com/akmaier/agent-m/actions/runs/37896854968 is SUCCESS for both full jobs.
  Complete6984-line logs: Python399runOK (5skipped,6expected failures); Node1013total,1005pass,0fail,8existingTODO,
  0skip/0cancel, including all native TST276 component cases. Existing TODOs are not new passes.
- Independently ran on unchanged c701825 with Node26.3.1:
  `node --test tests/desktop-shell-endpoint-composition.test.mjs tests/bridge-http.test.mjs tests/bridge-jobs-endpoint-test.test.mjs tests/release-sprint-14-bridge-http.test.mjs tests/release-sprint-15-bridge-jobs.test.mjs tests/system-uc-003-direct-endpoint.test.mjs tests/release-uc-003-direct-endpoint.test.mjs`.
  All32 pass,0fail/skip/TODO/cancel. The new case exercises real compose, real public server/default jobHandlers and
  controlled loopback endpoint. No native Electron app was launched by this reviewer.
- Full downloaded log SHA256: red `5b3c2678dc78b72d97c5a1e83cf07db4ba9605845e2a1ab9f06e3b6b6ef510c6`;
  final `4cc21b5e729648f630d1a6be4b587546d4bf5e84ad881e60b29c67e5dd202561`.
- Live PR metadata immediately before decision: OPEN, base sprint/16, unchanged c701825 head, python/node SUCCESS.

## Exact decision and boundary

The declared source gate passes. Approve merge of only unchanged `c701825ce43ba1a4ab28f225184066a0e9950ba6` into
`sprint/16` after this PO review is recorded on PR240; scrum-master-session alone publishes the decision and performs
that exact-head merge after checking live complete green CI. A changed head needs another decision.

UC-003's ordinary browser-to-endpoint route remains direct. This composition registers only the accepted explicit
alternative2a own-model-server route. This is source acceptance for ITM-268; independent selected-item release tests,
integrated UC-003 browser/HTTPS work and UC-044 signed distribution/agents/tunnels/jobs/updates remain outside this gate.
Manual Scrum reviews and implementation commits are not Agent M automatic draft/check correction rounds. No external
comment, push, merge or acceptance of a human-owned artifact is performed by this reviewer.
