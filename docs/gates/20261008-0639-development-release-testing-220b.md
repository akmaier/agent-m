# Development → Release testing — ITM-261 / PR 220

**MEASUREMENT**

Decision: **REJECTED**, 2026-10-08 06:39 UTC, po-sol / gpt-6.1-sol.
Job: JOB-20261008-0634-58bf. Second independent originating review, fixed implementation limit 3 retained
in JOB-20261008-0541-c305. This correction review resets no limit.
PR: https://github.com/akmaier/agent-m/pull/220, into sprint/14.
Reviewed head: `0b31837dbcde2650c5f2c646e0e2909ad8601d6d`.
No merge is approved. scrum-master-session alone merges a subsequently approved exact live-green head.

## Original contract, provenance and scope

Read original AGENTS, original item 261, original accepted MOD-bridge-http, protocol/server and working test caller,
complete correction diff, current job inputs, rejected 220a gate, complete PR body/history and live CI logs.
Previously personally read whole original SPEC and affected UC-003/ARC-040/process/participants/model remain
applicable; verified SPEC unchanged at `1de56e76de63bfe5f3f4bb98820adad801041def`.
No human artifact acceptance is performed here. po-sol authored none of the guarded source or tests.

The ordinary 0b31837 correction changes only server.mjs and test 008 in the new owned test; other source/helpers/cases
are inherited byte-identically from a64a21e. All four writing commits declare unreleased / developer-terra-a /
gpt-5.6-terra. Original first actual tests-only red, preflight fixes, eleven independent case counterproofs and
unaffected acceptance evidence remain in 220a; no broad re-test obligation is added for unchanged code.

## Corrected original failure node

`server.mjs:38 supplied handler → :40 await → :42 selected accepted code → :43 error reply` now preserves
invalid-request. Independently executed test TST-261008 on an exact-head disposable archive:
positive PASS → restore old generic-only selection by replacing line 42 with `const code = "upstream-failed";`
→ FAIL at tests/bridge-http.test.mjs:176 (actual 502, expected 422) → restore exact bytes → PASS.
Exits 0 / 1 / 0. All eleven restored owned cases pass. This closes the original 220a named-error loss finding.

Controlled requests through the actual paired loopback server and accepted POST /v1/probes/endpoint-test first
established successful dispatch 200, generic Error 502/upstream-failed, invalid-request 422, not-found 404, paused 503,
and unknown non-protocol EPIPE 502/upstream-failed. All use the same valid typed body, origin and token; only the
supplied handler's error code changes. No new route, production handler or external endpoint is introduced.

## Remaining enum lookup defect

The item requires named invalid/upstream errors and the accepted protocol defines the errors/statuses. The correction
claims unknown handler errors retain upstream-failed. Actual membership selection uses an inherited truthy property:

`src/bridge-http/protocol.mjs:7 → ordinary errors object → server.mjs:42 bridgeApi.errors[failure.code]`
with handler Error.code = "toString" → Object.prototype.toString, which is truthy → keeps "toString"
→ `server.mjs:43 → error(:9) → reply(:6) → ServerResponse.writeHead` receives a function as HTTP status.
Actual controlled result: RangeError ERR_HTTP_INVALID_STATUS_CODE, “Invalid status code: function toString()”;
the Node process exits 1 without an error response. Expected: the same generic 502/upstream-failed response as the
known-positive unknown-code EPIPE request. toString is not one of the protocol's six own error codes.

The focused new 008 assertion passes on this faulty head because it checks one accepted own code and an Error
without code; neither detects inherited keys. Preserve accepted code/status forwarding while selecting only actual
protocol enum members for HTTP statuses. Give this demonstrated non-protocol path meaningful regression coverage
within the existing handler-error acceptance. No additional operation or architecture change is required.

Evidence: `/private/tmp/po-sol-261b-a5scglpe/mapping.mjs`, mapping.log, positive.log, fault.log, restored.log and
all-restored.log. Initial sandbox EPERM prevented even the known-positive loopback bind and was not treated as a
product finding; the authorized local execution established the positives above before diagnosing the failure.
No mutant commit was created. server.mjs was restored byte-for-byte; all eleven final owned cases pass.

## Live CI, PR evidence and disposition

Live PR head is the exact reviewed 0b31837. Full run 37737753521 succeeds:
Node job 113181093344: 955 tests, 947 pass, zero fail, eight TODO.
Python job 113181093261: ran 397 tests, OK with five skips and six expected failures.
All four commits and the full current PR body were read. The body records all eleven author counterproofs, including
the revised named-handler 008 fault. Its “Final CI is pending” sentence is stale; current live success is verified
above. Update that sentence when recording the next exact final head, rather than claiming the inherited-key path
already has a generic fallback.

The original browser-entry counterproof supplied independently in 220a remains valid: the correction changes neither
index/protocol/pairing imports nor that guard. All unchanged prior acceptance/proofs remain closed. No extra per-assertion
counterproof or new tests-first cycle is imposed for this correction. The sole remaining behavior blocker is the
actual enum lookup/generic-fallback defect above. No source/test edits, paid endpoint call or merge were made by this reviewer.
