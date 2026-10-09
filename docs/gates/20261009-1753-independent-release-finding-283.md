# Independent item release finding — ITM-283

**MEASUREMENT**

Fresh original JOB-20261009-1748-p17er was read before creating new isolated
`.agent/worktrees/agent-po-sol-17-release-gates`, branch `codex/p17-item-aggregate-release-gates`,
from main `239e151fc60f95ae5d135d5b086428eb1efd0237`. Actual Taken: **2026-10-09 17:49:25 UTC**.
Independent decider: po-sol, model gpt-6.1-sol; Agent M unreleased, version `239e151`.
Decision: **HOLD / correction required**, measured 2026-10-09 17:53:28 UTC; usage/cost:null.
This keeps the same job open. No item approval, merge, aggregate approval or closing follows.

Exact reviewed PR260 head `bd3469d2bd3d06ff8a035eb8ede1aea30b9c5b00`, parents
`f8bb90290cb23d99fca2c9b7a3f63b4cbb7154e0` and
`36771218b72372a6ac4f8c3e5f762ad556ff4675`, tree
`8b90b663d844864474ee9098a6cee7c66ceb15fb`.
Against actual sprint target `36771218`, only two new release files are added.
Production is unchanged. E's de52bb/a4b66/f8bb test lineage is retained;
E/predecessor E authored none of guarded client/store source (client Terra-B;
store Sonnet-A/Terra-B/Terra-D). This reviewer authored no source or tests.

Original AGENTS/SPEC/README, Team2 participant/pinned model and affected accepted
UC003/011/042/044 and module/architecture contracts were personally read in their
originals in the preceding jobs and remain unchanged. Read this new Start, E's
original Start and corrected actual-case receipt, current source/callers and final
release bodies/history directly. AGENTS blob `7e8f20ca35cd48a5250d143b07a469d46986f123`,
SPEC `1de56e76de63bfe5f3f4bb98820adad801041def`.
SPEC §§11–13 and this Start require actual asserted declared public outcomes;
this finding introduces no per-assertion fault quota or additional product scope.

Linux CI37968811524 attempt1 has Python SUCCESS (399, 388 OK, 5 skips, 6 expected
failures, 62s) and Node FAILURE (1066, 1051 passes, 7 failures, 8 retained TODOs, 65s).
Original 7403-line log is retained at `/private/tmp/sprint17-ci37968811524.log`.
Both checkout logs identify merge `8086860` of exact bd3469d into 36771218.
The seven failed cases are 276001/002/003/004/006/005 and 276901; all selected new
282901/283901 and existing 284/285 releases passed. Actual failure path:
`tests/desktop-shell.test.mjs:110 launch → :64 electronCommand manager probe →
:67 sudo apt-get install Openbox (40000ms) → :79 cached fixture error`;
install lasted40013ms, status:null, SIGTERM, ETIMEDOUT, empty stderr; subsequent
manager probe ENOENT. Six cases fail before application spawn. Independent
276901 fails in `acquireNativeFixtureLock:38` after30099ms. No network/root-cause
or Mac/private-device conclusion is made. Root reports successful same-head
attempt2; that later original log has not yet been reviewed here and cannot
repair these assertion gaps. SPEC §12 says a same-commit outcome flip is flaky,
never passed; any later gate must retain both attempts and that distinction.

Permitted selected check of the two unchanged release files plus original
`test-document-declarations.test.mjs` and `trace-graph-guards.test.mjs` passes16/16
in disposable exact-head archive `/private/tmp/p17er-po-exact-bd3469d`.
Delivered testDeclarations returns one canonical lowercase declaration per file:
282901/release/MOD-bridge-client line8; 283901/release/MOD-browser-store line12.
Delivered traceGraph/tracesTo finds both ids for every declared guard; the
locked-export known positive has one test, deliberate absent requirement zero.
An initial reviewer probe used the wrong `.tests` element shape; corrected to
the documented string ids before drawing a finding. No product change follows.

No local native/glob/full-suite/UI/device/SSH/webserver execution, external write,
child agent, or production/test/accepted-contract edit was performed.

## Actual versus declared outcomes

`release-itm-283-browser-store.test.mjs:32 → clearSetting →
src/browser-store/index.mjs:40 → removeRaw` must remove the selected raw key.
Actual assertion observes `readSetting(...)=null`. `readSetting:26–29` also
returns null for invalid retained JSON, so this is not direct raw Clear proof.
Expected: observe `raw.getItem("agent-m:owner/repo:remote-session:alpha")===null`
after Clear and preserved independent session/instance bytes.

`release:32 → listSettings → index:53,93–99` returns remote SettingInfo metadata.
Actual checks only entry count2 and absence of alpha-secret. Expected: assert
both named remote keys and accepted label/secret/grants/setUpIn/expires/lastTest
shape, with no stored values/tokens. SettingInfo has no port field; ports are
asserted through readSetting, not through metadata. No new contract is proposed.
Successful import: release28 checks only one added membership and one kept
membership; release29 checks two locked destination values. Expected: assert
actual added/kept sets and complete imported implemented settings through public
reads, retaining byte-exact existing raw data. Existing complete decoded plain
and locked settings are positively asserted and are not disputed here.

## Independent actual own-case fault proof

Unchanged283901 passed, then archive-only `ITERATIONS=1` failed at release26 with
actual1/expected600000 (exit1, one failure), then the same case passed after
byte-exact restoration (exit0, one pass). Source SHA256
`85a7efae4e85093453ec44ad16ca0d81b2959b1c476e495637adb16531d4a78c`, blob
`b4efd04a36535794b3afa66ed8f2a67ed4275c1b`; test SHA256
`e92a1f5a3d4727400a43278d587c5adf32a35eb0826dc13796e481cba13ca65e`, blob
`db991698032541bc08e67b7354bc4e3f0e4b509d`.
Private actual logs are `/private/tmp/p17er-po-283901-{positive,fault,restored}.log`;
receipt `/private/tmp/p17er-po-two-faults.json`. Source/test originals were restored
and exact-byte equality verified. This relevant own-case proof is valid but does
not turn unasserted declared outcomes into assertions.

Required bounded correction: only E's new release assertions above, same
recorded relevant fault and restored positive with corrected unchanged case,
then a new complete combined Linux CI on the corrected exact head. Earlier
source approval and scope remain unchanged. A later immutable gate supersedes
this finding alongside it; this record is not edited retroactively.
