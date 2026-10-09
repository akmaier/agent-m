# Independent item release testing — ITM-285

**MEASUREMENT**

Decision: **PASS** for [PR259](https://github.com/akmaier/agent-m/pull/259), exact tests-only head
`3916ea98c7d0fca8120aa65343f4d8609e177563`, into actual sprint/17 currently
`77cfa16290f2d4fd1ae1892dfe0d9da9dc50326e`. Independent decider po-sol, separate from release writer
 developer-terra-c and source developer-terra-a. Fresh JOB-20261009-1741-p285r; actual Taken clock
2026-10-09 17:42:26 UTC; decision clock2026-10-09 17:44:51 UTC. Usage/cost:null.

## Original inputs, isolation and independence

Read the entire original published fresh Start before new isolated .agent/worktrees/agent-po-sol-285-release-gate-17,
branch codex/p285-release-gate-17 from main92646f3a441914fc70a76e20b992334dec6fe10f. Earlier1718 gate job had
actually Ended. Personally read original full AGENTS/SPEC/README, Team2 declaration/participants/pinned scrum-wip,
selection and accepted affected UC003/011/044, ARC037/040, MOD-bridge-http/desktop-shell/tunnels in prior jobs;
verified all remain byte-identical to df81829. Read original current item285, release Start/allocation/source gate,
actual guarded source/pairing/unit/client/server tests/callers and full source/predecessor histories, new release
file, correction diff, original own-case receipt and original tests.yml workflow directly. No summary replaces
an original. AGENTS/SPEC blobs7e8f20ca35cd48a5250d143b07a469d46986f123 /
1de56e76de63bfe5f3f4bb98820adad801041def, model72fdea87d0c468ffcd53ae3a6d564623c686e22d pinned at
ef33e2f501289930960f13b55936e9b557003993 remain unchanged. Accepted MOD-bridge-http
blob2792f1d3a1a66eec9750fac85949ee78874e2956 still matches its human approval.

SPEC §§11–13 supply ownership, canonical readable cases/actual own relevant fault evidence, independent release
authorship and gate/DoD; Team2 adds no job DoD conditions. Actual guarded bridge-http source history91a7526f,
a64a21e4,0b31837d,3cf36adf and selected tests-firste4c3f6e/source14c68b0 all identify developer-terra-a.
C and predecessor C authored none of this route implementation. C's key284 source is disjoint. Original explicit
PO allocation assigns C independent285 coverage and leaves E284/282/283; it changes no accepted contract or model.
This reviewer authored none of guarded source/unit/release tests.

Actual release lineage843a19786b94d70325eb3db562a910864fbaff0c →
5cbb8a39fd5c809e70dee2082534d909b2d24a96 →3916ea98c7d0fca8120aa65343f4d8609e177563 adds only
new tests/release-itm-285-bridge-tunnels.test.mjs. The second commit changes only285904 given prose from
nonexistent supplied endpoint handler to the server's existing endpoint-test route; all five bodies, assertions,
identifiers and production bytes stay unchanged. No old expectation/helper/caller/source/module/manifest/workflow/
accepted document/process/model/participant edit occurs. This is write-tests over delivered behavior and requires
no invented tests-first implementation red.

## Accepted supplied-handler path and actual coverage

Accepted desktop-shell composes handlers; MOD-tunnels.tunnelHandlers would supply the route map to
MOD-bridge-http.BridgeHandlers.tunnels. Current compose supplies only jobs; no automatic tunnel/shell registration
is delivered here. Public bridgeApi/serveBridge/pairAnew are reached on a real controlled loopback listener with
explicit constructed handlers and credentials. No running tunnel, SSH/HTTPS/browser/native claim is made.

Actual server.mjs:12 refuses nonloopback → :20 origin refusal → :21–25 allowed local preflight → :27 rereads
current persisted token (pairing.currentToken) → :28 POST-only pause → :30 exact method/path bridgeApi route →
:32 supplied handler → :33 absent-handler named404 or :34 exact awaited result with params:{}/body:{} →
:36–38 named422 or generic502 mapping. Logging:19 emits method/path/status/duration only.

285901 checks protocol GET declaration, exact constructed states/reasons and one empty handler request shape.
285902 distinguishes explicit empty payload from absent-handler404/not-found and checks named invalid-request422
and ordinary upstream-failed502 with messages.285903 checks allowed-origin OPTIONS204/CORS/private-network header,
foreign403/missing401/old-rotated401 stopping before handler and only current token reaching it once.285904 reaches
GET200/state while the actual existing POST endpoint route still returns named paused503; it does not pretend
an endpoint work handler was supplied.285905 captures actual request logging, observes method/path/status and
excludes pairing token, constructed credential-shaped header and handler payload. Fixtures register actual server
close and temporary-folder removal; captured console.info is restored. Old pair/probe semantics remain positively
verified by selected original server tests and unchanged full Linux outcomes.

## Five actual own-case faults and exact-restored positives

Read original /private/tmp/c285-release-counterproof-receipt.md in full, including corrected285904's unchanged
body/command and original four other case outcomes/hashes. Independently reproduced all five in exact3916ea98
archive /private/tmp/p285r-po-disposable, following real existing server fixtures. Known-positive new5/old-route6/
old-server11/declaration10/trace4 selected36/36 pass before faults,0fail/skip/TODO/cancel180.825ms.

Each unchanged actual own-case command is node --test --test-name-pattern=TST-28590N
 tests/release-itm-285-bridge-tunnels.test.mjs. Faults change disposable real production bytes only.

| Case | Recorded production transformation → actual assertion node | Exact restored same case |
|---|---|---|
|285901|protocol GET declaration removed → release:45 route actualundefined expected truthy|exit0/pass1/fail0|
|285902|server:33 absent handler invented200 empty → release:65 actual200 expected404|exit0/pass1/fail0|
|285903|server:20 exempt tunnels from origin refusal → release:93 actual200 expected403|exit0/pass1/fail0|
|285904|server:28 pauses GET as well as POST → release:113 actual503 expected200|exit0/pass1/fail0|
|285905|server:19 adds request.headers to log → release:138 token present actualtrue expectedfalse|exit0/pass1/fail0|

Every fault actually exits1/fails1. Every byte-exact restored same case exits0/passes1 with0skip/TODO/cancel.
Protocol restored SHA2562cdf63609a27286e2048deeaa61fb61e6b92e971037165845b6213aa9c9a0e31/
blobdbad4ccd8f2a051e081371500f1ab6ff7509ea57; server restored SHA256
92dfefe364e4144bfb75fe81921a80d2d3654bc29291346990fe37b7d1bdcf86/blob8267638e79cccdf18d96dadab889731d1876d8bf;
unchanged corrected release SHA256088ea1762b8f3cb118746e3002000315963ae5c9698909c76b47dd77a90b0eec/
blob6d9a9fe399e3baa85d2ec55acde5148248acf869 equal reviewed head throughout. Private actual per-case logs
/private/tmp/p285r-po-TST-28590N-{fault,restored}.log retain results, with positivep285r-po-positive.log.
No inline substitute assertions or new per-assertion mutation quota is used.

Actual testDeclarations parses exactly five unique numeric285901–905 at lines34/52/79/102/121,
release/MOD-bridge-http, lowercase nonempty guards/given/input/expect. Delivered traceGraph/tracesTo positively
returns four token-guarding cases and then zero for an unrelated signature requirement
(/private/tmp/p285r-po-declarations.log). Canonical graph evidence is actual, not inferred from Python origin links.

## Finished exact full CI and actual tree/target

Only after both jobs finish, retrieved/read complete [CI37968031431](https://github.com/akmaier/agent-m/actions/runs/37968031431),
SUCCESS at unchanged3916ea98c7d0fca8120aa65343f4d8609e177563. Both actual checkout logs name
`3af5734169aa62bfc536e0f2cf839391c0a2839e`; GitHub actual parents are tested target
`77cfa16290f2d4fd1ae1892dfe0d9da9dc50326e` and3916ea98, tree
`f2f450c1ac00cc8864207542bb1affcbfef7a993`. Retrieved every recursive entry without truncation;
all1971 actual files exactly equal that tested target plus only the new corrected release file.
The target contains all four selected sources and approved E284 release file. It is the actual combined
checkout, not a stale source-head-only claim.

Node113947228447 SUCCESS1064tests/1056pass/0fail/8TODO/0skip/cancel56.239s, full62s.
Python113947228698 SUCCESS399tests/388ok/5skip/6expected failures56.955s, full63s.
Original tests.yml still runs both full suites on GitHub Ubuntu with timeout-minutes2; both fit120s.
Native276001–006 and independent276901 actually execute and pass on Linux, never locally on this darwin host.
Complete log7320lines/743364bytes SHA2562d0cdb38838797179db4e9bdd1057bb38d994370758a251d501b477b224f6e0f
read in full; every399 Python/1064 Node named outcome retained in /private/tmp/p285r-final-ci.log and
p285r-final-every-outcome.txt. Compared to prior E284 fullCI37964885992, all399 Python/1052 Node names/outcomes
remain identical; additions are delivered282three/283four and these285five cases, all pass. Old cases are not
omitted or weakened. No broad local check rerun substitutes for this fullCI.

Live PR259 OPEN/MERGEABLE, exact3916ea98, base sprint/17, precisely both completed SUCCESS checks above.
Actual branch API target77cfa162 equals the tested target: no later source dependency delta exists at decision.
Compared to writer's843a197 parent, target adds only previously approved E284 release tests; guarded bridge-http,
pairing/client/server and declaration/trace source remain unchanged. That independently reviewed added file is
disjoint; no runtime key/tunnel connection is invoked by these route fixtures. Later merged changes must receive
root's fresh recheck; this item gate does not replace aggregate increment or closing fullCI decisions.

## Preserved limits and disposition

Existing Python five skips remain groups/two nightly SPEC scans/two sprint-record checks, and six expected
failures remain CR/CRLF approval twins/backlog order/outside-section SPEC bytes/trailing blanks. Node eight
TODOs remain R2/R3/A3/A4 plus release/core G1/G2 record-as-proposal findings. They are explicit limitations,
not product passes. Manual review has no invented fixed correction cap; usage/cost remain null.

No local full/glob/desktop-shell/native tests, Mac app/browser/clipboard/focus/settings/accessibility/device
or personal audit, real SSH/webserver host, paid service, external write or child spawn occurred. Only controlled
selected Node loopback/filesystem fixtures and the new dated reviewer gate/private body were written.
Root may publish/comment/recheck/merge this exact approved release head, then record job End/item disposition.
Aggregate Release testing → Sprint review, sprint closing and human release report/artifact acceptance remain
separate. No source/helper/accepted document/model/participant change, deployment, fullshell/tunnel/HTTPS/browser
integration or human acceptance is inferred.
