# Development → Release testing — ITM-261 / PR 220

**MEASUREMENT**

Decision: **REJECTED**, 2026-10-08 06:20 UTC, po-sol / gpt-6.1-sol.
Job: JOB-20261008-0607-114e, first independent review, fixed limit 3. Originating implementation
JOB-20261008-0541-c305 retains its fixed limit 3; this finding starts no new job or limit.
PR: https://github.com/akmaier/agent-m/pull/220, into sprint/14.
Reviewed head: `a64a21e4e61375bd447ff5bcc012e4258b0e6c5a`.
Base: `78ae3e20e3547b275c18bf9c96f6e790fb3b7cfc`.
No merge is approved for this head. scrum-master-session alone executes a subsequently approved exact-head merge.

## Original acceptance and independence

Read the original AGENTS, item 261, UC-003, ARC-040, MOD-bridge-http, Team 2 declaration and participants,
pinned scrum-wip model, source/tests, implementation job, complete three-commit diff and current PR body.
The personally completed original whole SPEC read remains applicable: its unchanged blob is
`1de56e76de63bfe5f3f4bb98820adad801041def`. Affected accepted originals match the human-approved blobs:
bridge-http `2792f1d3a1a66eec9750fac85949ee78874e2956`, ARC-040
`603620210312a514d004a58887157c04dbafe8c6`, UC-003 `82081a084479172f2f8f704211351b052edea8e6`.
This review accepts none of those documents on akmaier's behalf.

All three writing commits declare unreleased / developer-terra-a / gpt-5.6-terra. po-sol authored no guarded code
or tests, including predecessor authorship. Only four new src/bridge-http files and one new owned test file differ;
no helper, old source, old expected result or declaration changes. The tests-only first commit is
`f3550872de20df817fa81bf6d42c6aae70d5010e`; its actual CI 37733925329 failed Node on the intentionally absent
public entry, ERR_MODULE_NOT_FOUND, with Python successful. That red run ended before source commit 91a7526.
The ordinary a64a21e correction handles both ordinary and private-network preflight; no history rewrite occurred.

## Required correction

MOD-bridge-http.md:80–82 defines BridgeHandlers and states: “a handler throws an error of bridgeApi by its code.”
The selected original acceptance requires named invalid/upstream errors. The implementation loses that distinction:

`src/bridge-http/server.mjs:38 → supplied endpoint-test handler → line 40 awaits the handler → line 41 catch`
always returns HTTP 502 / `{ error: "upstream-failed", message }`, ignoring the handler's accepted error code.

Controlled probe against the exact unmodified archive first established positive nodes: the valid endpoint-test
configuration returns 200 / success; an ordinary Error returns 502 / upstream-failed. With that same valid input,
a handler throwing Error("controlled handler refusal") with `code = "invalid-request"` actually returns
502 / upstream-failed; expected 422 / invalid-request from bridgeApi. Named `paused` and `not-found` codes also
actually become 502, instead of their declared statuses. No speculative new route is required to demonstrate this:
all calls use the accepted POST /v1/probes/endpoint-test and a supplied BridgeHandlers.jobs entry.

The unchanged eleven tests still pass: test 007 checks server-side body rejection, and test 008 throws only an
ordinary Error. Neither asserts propagation of an accepted handler error. Preserve named handler codes/statuses,
retain generic upstream-failed fallback and add meaningful regression coverage at this actual failure node within
item 261's existing acceptance. Diagnostic script: `/private/tmp/po-sol-261-contract-probe.mjs`.

## Independent case counter-proofs

Disposable exact-head archive: `/private/tmp/po-sol-261-archive-w_z0a1c2`.
Command for every case: `node --test --test-name-pattern TST-<case> tests/bridge-http.test.mjs`.
Each row was independently executed positive → fault FAIL → byte-restored positive, exits 0/1/0.
Logs are `<case>-before.log`, `<case>-fault.log`, `<case>-after.log` there; exact mutations are in proofs.json.

| Case | Actual planted fault and guarded failure node in tests/bridge-http.test.mjs |
|---|---|
| 261001 | protocol paused 503→502; line 49 compares the error map |
| 261010 | add static node:fs import to public index; line 59 rejects its Node dependency |
| 261002 | BindRefused→WrongName; line 73 compares the bind refusal |
| 261003 | remove localhost from allowed set; line 83 cannot start its accepted bind |
| 261004 | ignore supplied rotation token; line 108 gets not-rotated instead of rotated-token |
| 261005 | regenerate persisted token on each read; line 127 gets a different restart token |
| 261006 | wrong private-network response header; line 142 gets null instead of true |
| 261007 | foreign-origin refusal 403→200; line 159 sees 200 instead of 403 |
| 261008 | generic upstream status 502→500; line 176 sees 500 instead of 502 |
| 261009 | add pairing-token header value to log; line 192 sees the token present |
| 261011 | PortInUse→WrongPortName; line 97 compares the occupied-port refusal |

The author's recorded 010 export-to-server mutation failed during module linking before the case executed; the
independent static-import mutation above reaches its actual browser dependency assertion. This record supplies that
stronger executed case evidence. The corrected current PR body records all eleven author counter-proofs and exact CI;
the initially missing body evidence is resolved.

## Verified unaffected acceptance and limits

Both plain and private-network preflight return 204 for the paired origin; only the latter has the private-network
response header. Foreign origin/preflight, missing/old token and invalid typed body are refused before dispatch.
All three documented loopback addresses bind and a busy port is named. Tokens survive restart and rotation, are
32 random bytes when generated, and the token file in the controlled outside-repository private folder is mode 0600.
The only file there is pairing-token; endpoint settings are not retained. Pause returns 503 for the probe while pair
remains available. Actual typed success and provider diagnosis pass through the supplied handler unchanged.
Additional controlled malformed-JSON/body and unknown-route probes give their named 422/404 responses.

The actual logger has exactly method/path/status/duration and excludes the body key, pairing token, login header and
query-value sentinels. A fresh Node process with globalThis.process absent imports the complete public graph and
reads bridgeApi successfully; Node builtin access is delayed until operations are called. These are controlled local
checks, not browser/HTTPS reachability measurement or a full UC-003 2a delivery. No paid endpoint was called.

All five archive source/test files were compared byte-for-byte with git show a64a21e after faults and restored.
Blobs: index `979d0beb14f86f4d994ba94e55c323008cb447ff`, pairing
`375f230e6e8e6d494bbacb143a1c07db66ebe7d1`, protocol `b45dd48148acd6c9fa62e02b6ead9e6c3f6f74d6`, server
`dc86a55dc8b3023b5a99f0f500a8de9b6e0c6049`, tests `14b1bda337534099f39c8a6d8145d44d146d41a2`.
Final restored local result: eleven cases PASS, zero failures.

## Live whole CI

Run https://github.com/akmaier/agent-m/actions/runs/37735680772 is SUCCESS on this exact head.
Node job 113174535553: 955 tests, 947 pass, zero fail, eight TODO.
Python job 113174535648: ran 397 tests, OK, five skips and six expected failures.
Both complete logs and the live current PR body were read. Green CI does not detect the named-handler defect above;
the gate remains rejected until that original contract is satisfied and the corrected exact head is independently reviewed.
