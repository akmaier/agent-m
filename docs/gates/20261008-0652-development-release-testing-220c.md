# Development → Release testing — ITM-261 / PR 220

**MEASUREMENT**

Decision: **APPROVED**, 2026-10-08 06:52 UTC, po-sol / gpt-6.1-sol.
Job: JOB-20261008-0650-e372, third and final originating review within fixed limit 3.
Implementation JOB-20261008-0541-c305 retains its fixed limit 3; no reset.
PR: https://github.com/akmaier/agent-m/pull/220, into sprint/14.
Approved head: `3cf36adfad1a557472fef0115ce152c88dafd444`.
scrum-master-session alone merges this unchanged head while live whole CI remains green.

## Original scope and corrected finding

Read current job, complete two-file correction, final test/caller, provenance, PR body and live full CI logs.
Original AGENTS/SPEC/item/accepted architecture and the complete 220a/220b reviews remain applicable; SPEC and AGENTS
still match personally read originals at 1de56e76de63bfe5f3f4bb98820adad801041def and
7e8f20ca35cd48a5250d143b07a469d46986f123. This reviewer wrote no guarded source or tests and accepts no human artifact.
The previous 0b31837 is an ancestor; ordinary 3cf36ad changes only server.mjs selection and new test 008 assertions.
Its commit names unreleased / developer-terra-a / gpt-5.6-terra. Earlier reviews and writing history remain preserved.

`server.mjs:38 → supplied endpoint-test handler → :40 throws → :42 Object.hasOwn(bridgeApi.errors, failure.code)`
now restricts selection to actual own protocol members. The former crashing code toString is excluded, selecting
upstream-failed → :43 error → :9 reply → :6 writeHead(502). Actual response is 502 with
{error: upstream-failed, message: controlled handler failure}, without a process crash.

Independent controlled exact-head archive requests use the accepted paired endpoint-test route and valid typed body,
following the same working caller as earlier reviews. Known positives: dispatch 200/success, generic Error 502,
invalid-request 422, not-found 404, paused 503, non-protocol EPIPE 502. The formerly crashing toString also returns 502.
The complete probe exits zero. This closes the sole original 220b enum/generic-fallback deficiency while preserving
220a's accepted named error mapping. No new route, handler implementation or architecture was required.

## Independent current failure-node proof

Disposable exact-head archive: `/private/tmp/po-sol-261c-0sln62d8`.
Executed `node --test --test-timeout=10000 --test-name-pattern TST-261008 tests/bridge-http.test.mjs`:
known-positive PASS → change unknown-code fallback from upstream-failed to invalid-request → FAIL at
new assertion tests/bridge-http.test.mjs:180, actual 422 versus expected 502 → byte-restored PASS. Exits 0 / 1 / 0.
Logs: bounded-positive.log, bounded-fault.log, bounded-restored.log. mapping.mjs/mapping.log retain the actual response
proof above. server.mjs was restored byte-for-byte to git show at the reviewed head.
An initial reverted inherited-lookup fault waits on the crashed request in the Node test runner; it was stopped
rather than treating that wait as new product behavior, then the bounded assertion fault above completed the proof.

The author's TST-261008-inherited-before/fault/after logs were read. They show positives, the inherited-lookup
ERR_HTTP_INVALID_STATUS_CODE failure, and restored positives. The current body names a fallback-to-invalid-request
fault; the independent bounded proof here actually executes that stated fault. The evidence sources should remain
distinguished; neither the old crashing lookup nor an unchanged test is claimed as the final behavior.

Original eleven per-case counterproofs and unaffected acceptance in 220a, plus named-error regression proof in 220b,
remain closed. This correction changes no browser imports, token handling, preflight, logging, dispatch body or other
case guard; broad unchanged checks and new per-assertion obligations are not imposed.

## Exact-head live whole CI and delivery limits

Live head exactly matches 3cf36ad. Full CI37739562130 logs were read:
Node job 113186869658: 958 tests, 950 pass, zero fail, eight existing TODO, SUCCESS.
Python job 113186869382: ran 397 tests, OK with five skips and six expected failures, SUCCESS.
The current body records this final head and successful CI link, with no stale pending statement. Its local 955-test
count is distinct from the final live whole CI count above.

Approval covers only the paired Bridge protocol/loopback server/token slice selected in item 261. No endpoint handler,
client, Electron app, local/HTTPS browser reachability measurement or whole UC-003 2a completion is claimed.
No paid endpoint call, source/test edit or merge was made by this reviewer.
