# Independent setup release tests — ITM-280

**REGISTER**

Decision: **PASS / APPROVED**, only for PR249 head `ee3e2d3ae5ac279d9092a9be343b293a1badbab7` into `sprint/16`.
Decider: po-sol. Actual Taken: 2026-10-09 11:32:10 UTC. Decision: 2026-10-09 11:35:48 UTC.
Review job: JOB-20261009-1114-p280r. Test job: JOB-20261009-1054-c916, developer-terra-e.
PR: https://github.com/akmaier/agent-m/pull/249

## Authority, originals and scope

Read the published Start on main `66b0665c5918eb12470136839b7c3d1dc34b3b13` before creating the new isolated
`.agent/worktrees/agent-po-sol-280-release-gate-16`, branch `codex/po-sol-280-release-gate-16`, from that main.
Primary remains main. Original AGENTS.md and all2135 lines of SPEC.md were read in full chunks; their blobs are
`7e8f20ca35cd48a5250d143b07a469d46986f123` and `1de56e76de63bfe5f3f4bb98820adad801041def`.
Read README, Team2 process/participants, Sprint16, ITM280, current Start and write-tests job, original UC003/044 and
MOD-settings-pages/browser-store/bridge-client/bridge-http; current scrum-wip blob equals the original pinned
`ef33e2f501289930960f13b55936e9b557003993` version (`72fdea87d0c468ffcd53ae3a6d564623c686e22d`).
Read exercised production source, actual dashboard adapters, app-harness, same-scope public setup/client/server/store
and direct endpoint guards, their release predecessors, preserved gates and source histories. No accepted text changes.

AGENTS §6a requires “First read the existing, working caller — then probe”; §2 requires a concrete call/data-flow and
verification at its failure node. SPEC §12 A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT requires a guarded-code fault
and failing result; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER requires independent authorship. SPEC §13
A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS forbids self-decision. Team2 assigns this gate to po-sol;
the pinned model requires independent selected-item release tests green before Sprint review. SPEC §9 requires green
PR CI and recorded exact-text gates. This decision checks the new selected-item tests; it does not close the aggregate
sprint gate. JOB1054 remains without an End on current main. Its kind is write-tests; SPEC §11's first tests-only red
condition names an implementation job that adds/changes behaviour and is not invented for this independent test job.
Manual review/fault execution is not Agent M's automatic draft/check correction loop.

Live PR diff and local exact-base diff agree: only NEW `tests/release-itm-280-dashboard-bridge-setup.test.mjs`,134lines,
two release cases TST-280901/280902. Exact test blob: `0e54b96e9c631d6f51bf44aefbb21114f04185b0`.
Both declare unique numeric TST, one release level, modules/guards and readable preconditions, input, expected result
and relevant planted fault. No existing tests/helpers, source, workflow, packages or accepted/process/selection files change.
Actual parent chain is c35db8c → b0d9ad2 → ee3e2d3; use this verified source base, not the older local sprint/16 ref.

## Independent provenance

I authored none of the guarded source or tests. E and predecessor E authored none of the exercised owned behaviour:
settings bridge/settings source d117af7 and endpoint source b7b4683 identify TerraC; bounded caller b9ac420 is TerraA
per its published job and gate. Browser-store additions e1ca1ff,51c9810,1a04e37,d1d3187 identify TerraB, with original
099c620 core JSON/prefix/raw store from predecessor SonnetA. Bridge-client fcd7dac,fcf2d18,259c6bd identify TerraB;
Bridge-http91a7526,a64a21e,0b31837,3cf36ad identify TerraA. I read the actual commit bodies and the original records
where a commit lacks a participant trailer, including199's preserved gates and246's caller gate.
The unchanged shared dashboard has broader historic authorship. This is independent coverage of the bounded public
Bridge setup path, not a claim of independent whole-dashboard/module coverage or full UC003/044 completion.

## Public data-flow and failure nodes

Empty canonical Bridge storage → Settings adapter `docs/assets/dashboard/settings/endpoints.mjs:25–31` mounts the
existing two-child section and public settings Route plus Configure → its click calls context.go at18 → #bridge →
`docs/assets/dashboard-app.mjs:530–538` selects the public MOD-settings-pages Route → `src/settings-pages/bridge.mjs:93`
reads canonical storage and renders controls. The harness supplies a DOM mount at the same boundary as existing
wiring tests; it does not replace the Route, store, client or server. Existing280003/004 guard the actual hash mapping;
the release cases then wait for its #bridge dispatch through the established page.go fixture pattern.

Pair: bridge.mjs111–117 → public pair at `src/bridge-client/index.mjs:98–102` → call63–80 builds the token header,
credentials:omit and GET /v1/pair → the test's repoServer handler forwards through Node's native fetch with the
accepted Pages Origin → `src/bridge-http/server.mjs:20/27/29` enforces origin/token and returns actual200/401.
Native fetch is captured once before any app-harness load replaces global fetch, allowing the second case's independent
server to reach its own controlled Bridge. No whole Bridge success-result stub is used. Known-positive ledger entry
for a real GET /v1/pair and real200 precede the negative no-hidden-request finding. Wrong token receives actual401;
the unreadable port1 call fails to return an answer, maps NoAnswer and stores no success.

Successful Pair → bridge.mjs117 writeSetting → browser-store/index.mjs35–37 JSON serialisation → store.mjs56–58
prefixed setItem → TST280901 at68 verifies raw `agent-m:akmaier/agent-m:bridge` holds exactly returned address/token.
Route reload reads it; Show changes password to text; saved Settings Change reaches the same public route;
bridge.mjs125 clearSetting → browser-store.removeRaw removes the actual entry → test88 expects raw null.

HTTPS Save atbridge.mjs129–140 builds the accepted JumpHost with nested optional login →137 writes jump-host;
139 writes separate Bridge address/token. TST280902 at118/119 checks both raw shapes. At115/116 it requires the explicit
“remains untested” result and the WHOLE server.requests.slice(requestsBeforeSave) to be empty, catching HTTPS and
loopback requests rather than filtering only pair. Reload/Show and Settings jump-host Change/Clear remove the raw
login-bearing entry at133. The new two cases do not independently assert every notice's position or every login
Show control; preserved owned280001/002 guards and inspected rendered code retain shared-origin/folded explanations,
direct/HTTPS destination wording and certificate/login/instance-origin prerequisites. No broader release claim is inferred.

## Independent execution and guarded faults

Disposable exact-head archive `/private/tmp/po280-review`; no source/test mutation in main, author or gate checkout.
Node v26.3.1. Requested focused new/setup/wiring/client/server/store/direct endpoint/add-product guard run77pass/0fail,
0skip/TODO/cancel,1.204782s; log `/private/tmp/po280-positive.log`. Additional existing endpoint wiring, nested store
release and direct UC003 system/release guards17pass/0fail,0skip/TODO/cancel,2.168023s;
log `/private/tmp/po280-additional-positive.log`. Total94passing local cases. No paid/native runtime launch.
Initial sandbox attempt refused loopback listen with EPERM; authorized escalation ran the same suite successfully.
That environment refusal is not reported as a product failure.

Independently executed each recorded fault, own case and exact restore:
- Omit only bridge.mjs117's pair persistence write: TST280901 receives real200 but fails at test68, actual null,
  expected returned address/token;0pass/1fail,exit1. Restore exact bytes; own case1pass/0fail,exit0.
- Omit only bridge.mjs139's HTTPS Bridge write: TST280902 receives real401 for the refused pair, stores JumpHost,
  then fails at test119, actual null, expected separate HTTPS address/token;0pass/1fail,exit1.
  Restore exact bytes; own case1pass/0fail,exit0.

Logs `/private/tmp/po280-fault-280901.log`, `po280-restored-280901.log`, `po280-fault-280902.log`,
`po280-restored-280902.log`. Final bridge source git blob equals exact head `210e3a77496780ac1f44ce0916dba38051b6beb3`;
SHA256 `10958aecc355bc6b260f19172e493c42f4b3696a4ba513b0e8feb874664b87fd`. No mutations retained.

## Complete actual CI and disposition

Read actual https://github.com/akmaier/agent-m/actions/runs/37922412906, complete7076-line log and both jobs/steps;
run head is exactly ee3e2d3. CI checkout b936f0802d2fc949a6402ad2f5099c71049e13ed parents verified by GitHub API:
c35db8c146cc1260c9b60136566a9ac5d616e7a3 and ee3e2d3ae5ac279d9092a9be343b293a1badbab7.
Both COMPLETED/SUCCESS. Node job11:13:36–11:14:28UTC,52s; suite47.481708s,1028total/1020pass/0fail,
8existingTODO,0skip/cancel. Both new cases are actual passing outcomes405/406. Parsed all1028 Node outcomes.
Python job11:13:36–11:14:36UTC,60s; suite51.348s,399total:388ok/5skip/6expected failures,0ordinary failure/error;
parsed every399 outcome. Existing8TODO and6expected failures remain limitations, never counted as passed tests.
Both jobs satisfy the two-minute bound. Full log `/private/tmp/po280-ci37922412906.log`, SHA256
`1a7d070baeeb5eacfbc2a4cde02589ac4d060cbb9b53c3031bb7435a4f7f0148`.
Immediately before decision live PR is OPEN, unchanged exactee3e2d3, target sprint/16, both full checksSUCCESS.

Approve root's merge only at this unchanged exact head after publishing this immutable decision and rechecking live
green CI. Root alone publishes/comments/merges under standing human authorization. This reviewer writes only this
NEW evidence file and a local multiline decision body. No external write, SPEC/use-case/architecture acceptance,
sprint close, endpoint reachability, tunnel/proxy/certificate provisioning, signed distribution or fullUC044 claim.
