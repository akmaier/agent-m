# ITM-287 Development → Release testing

**MEASUREMENT**

Decision: PASS exact PR262 head c08358d79e4407fcf8b1f267395a4ec96592ff49 into sprint/18.
Decider: po-sol; model:gpt-6.1-sol; Agent M:unreleased, review base1496865aa7cedb6264ce4700dd8f83d1b3b8c91a.
Job: JOB-20261009-1924-p18s. Actual Taken:2026-10-09 19:25:37 UTC; decision:2026-10-09 19:31:56 UTC, clock.
Isolation:.agent/worktrees/agent-po-sol-source-18, codex/p18-source-gates. Usage/cost:null/null.

## Originals, scope and concrete node

Read the entire published fresh Start before new isolation. Personally read full original AGENTS/SPEC/README,
declaration/participants/pinned model and affected accepted UC003/011/042/044, ARC038/040/052 and settings/store/client
contracts in the planning/review chain; retained originals only after current unchanged blobs: AGENTS7e8f20ca,
SPEC1de56e76, README37284376, process eb772d45, participants aba8b680, model72fdea87, MOD-settings-pages6357592c,
MOD-browser-store058fd3b0. Canonical18 plan blob4baa3e2dc03985871e9d74976d91b48c1de41df7 is unchanged from my
original selection. Read original287 item, B Start/Taken, complete actual head source/new cases, same-scope existing
Bridge cases, actual public dashboard #bridge dispatcher, builders/store and full source/predecessor history.

Actual data path: dashboard-app.mjs:532 → settingsPages bridge.render with openStore(instance) → bridge.mjs
remoteSessions reads canonical remote-session:key and derives name from that key → public allocatePort →
writeSetting(remote-session:name,{port,token}) → public tunnelCommands/proxyConfiguration. Actual location.origin
supplies the served HTTPS origin. Canonical name-less stored bodies and compatible rich old bodies both work;
occupied ports stay occupied, reopening selects stored sessions, secrets stay hidden until Show, missing jump-host
setup/exhaustion is named. Commands/proxy text use the delivered builders; no tunnel/process/HTTPS test is performed.
Existing pairing/jump-host credentials and browser-direct endpoint paths are unchanged. The only diff from actual
source base de31491a25ee100773ead6b67e3113be6e55de74 is bridge.mjs and its new MOD-settings-pages test; D’s settings.mjs,
index/helpers, old tests/fixtures, unowned callers and accepted documents are unchanged.
Source blob40d65c0a1aae6259b0534527dbe289f00fb0d7c6; test blob0ff75e43e696345a07f4b3435f78e6eb23f2d118.

## Tests-first and provenance, with truthful timing

Original first d7d03d62e7af24129b2281f53129d88f579a8f7c (18:42:51UTC) has only the new test and no provenance trailer.
Corrected tests-only005caca1a7099aa6e2d106a52d85766541920d7b adds declared provenance/readable fields; actual product-red
CI37976127163 ended18:52:09UTC, before first source e02377c532e4e3a25bab8ebae44c0674bcc03c3f at18:56:48UTC.
Its two reds are missing remote-session controls at the actual route failure nodes, not a dependency/setup failure.
Original-first exact CI37978052408 was obtained later through CI-only PR266 at19:07:28–19:08:36UTC, after source;
its same missing-controls product reds are retained. I do not recast that as contemporaneous first-commit CI or erase
original missing provenance. Ordinary correction history9280a228 →c08358d remains; current generated artifacts/source
have declared version/participant/model provenance. Literal SPEC §11 now has the original tests-only first and its
actual red CI; corrected tests-only product red demonstrably preceded implementation. Earlier dispatch/receipt defects
remain retrospective facts, not a rewrite of either text/history or the first-red timing.

## Own actual final-case proof and canonical graph

After a known-positive selected two-case run, independently archived this exact head into disposable
/private/tmp/p18-po-287-c08358d7. Never mutated author worktrees or source/test in the reviewer checkout.
Ran the unchanged final case with node --test --test-name-pattern '^TST-28700N:'
 tests/settings-pages-bridge-remote-sessions.test.mjs for each relevant production fault and restoration.

| Actual case | Guarded production fault | Observed own failure | Exact-restored positive |
|---|---|---|---|
|287001|remoteSessions discovers only bodies with session.name, omitting canonical key-derived names|stored port40100 instead of occupied-aware40101; test:53 allocation assertion|same case1pass/0fail|
|287002|remove usableJumpHost save guard|missing setup refusal no longer names jump-host; test:95 assertion|same case1pass/0fail|

Every failure was exit1 at its own case, every restored run exit0; source bytes and unchanged test bytes exactly
match the head. Source SHA2563428082f20bd658fccfc7ff65524215e5fd087d4d765a1285f3a616037224fa8;
test SHA256ae3b57343134b2b35a5bf208c91eab5b40864aa16b0cff609d071dca581069e4.
Original own receipts:/private/tmp/p18-po-287-287001-fault.log/-restored.log and287002-fault.log/-restored.log;
structured receipt:/private/tmp/p18-po-own-faults.json. No inline substitute or fake production dependency.
Actual testDeclarations parses both numeric titles, unit/module/guards/given/input/expect nonempty; IDs are unique
against this head’s test files. Actual traceGraph →tracesTo returns each case for its declared guards, including the
accepted port-allocation requirement; the final first case’s own graph assertion also passes. No parser change.

## Full Linux CI, tested tree and live state

Read/processed every line of original /private/tmp/sprint18-ci37979018387.log:7344lines/745661bytes,
SHA2561df221fa30a35535919001c06520146a61ca6e127e68258723746eed5c420d30. All1068 named Node outcomes and399
named Python outcomes are retained in /private/tmp/p18-gate-ci37979018387-all-outcomes.txt. Compared each original
inherited named outcome to the personally reviewed closing37972050218 ledger: all1066 old Node and all399 Python
outcomes equal; only these two new positives are added. Eight existing TODOs, five skips and six expected failures
remain limitations; no hidden non-TODO failure. Node1068/1060pass/0fail/8TODO; Python399/388ordinaryOK/5skip/6expected.
Actual jobs node19:15:54–19:17:00 (66seconds), python19:15:54–19:16:46 (52seconds), bothSUCCESS and within two minutes.

CI checkout5590c9b8325b0e532581765b581dfd436f217058 has actual parents
 de31491a25ee100773ead6b67e3113be6e55de74 and c08358d79e4407fcf8b1f267395a4ec96592ff49;
tree1b5b329474806ea389edb30f126b71f26432160b. Read GitHub’s complete nontruncated tree and compared all2010blob
path/hash entries with actual head:exact equality, including the whole tree hash. Live PR open/mergeable, actual base
sprint/18@de31491 unchanged, exact head unchanged, both live head checks completedSUCCESS at review. This individual
CI tested287 alone on that base; it did not test later combinations or tunnel286. Root rechecks live head/base/full
checks immediately before the exact approved merge and records any subsequent target dependency truthfully.

## Limits and next gate

PASS authorizes only this bounded owned source into sprint/18. Independent E release including predecessors,
public setup evidence, other selected sources, combined aggregate, review/retro and closing remain separate. No full
UC003/042/044, running tunnel, trusted HTTPS/current-browser route or human acceptance is claimed. No local broad/glob/
full/native/Electron/UI/browser/device/personal audit/data/external SSH/paid call/child/external publication occurred.
Historical D283 native evidence remains excluded; no cleanup/state inference. Historical same-commit native flips stay
flaky, never passed; later observed green is distinct. Manual corrections have no fixed3-round cap and unknown cost:null.
