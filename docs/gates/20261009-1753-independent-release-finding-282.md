# Independent item release finding — ITM-282

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

`tests/release-itm-282-bridge-client.test.mjs:20 → tunnelCommands →
src/bridge-client/tunnels.mjs:34–36` emits configured SSH port, individual key
flags and keepalive options in both commands. The new case deep-compares plans
at23–26 but never checks rendered commands' `-p 2222` and forward `-i local.key`;
line22 checks `ServerAliveInterval` only in the concatenation, so one command
without it still satisfies the assertion. Expected: observe both actual public
command strings agreeing with their configured SSH/key/keepalive plans.

`proxyConfiguration → src/bridge-client/proxy.mjs:32–34,75–77` emits actual
Apache/nginx TLS listener, certificate and private-key directives. Release33
only matches generic certificate/key/https words; explanatory comments can
satisfy part of this claim. Expected: assert each backend's actual directives.
`proxy.mjs:40–45` ties Apache foreign/allowed OPTIONS to 403/204 terminating
rewrites; `:63–69` ties nginx foreign refusal before local OPTIONS204. Release35
only observes separate OPTIONS/204/403 words. Expected: assert configured-origin
conditions and local terminating preflight in generated directive structure.
Release37 tests only alpha prefix replacement; both configured routes need their
own correct path/upstream pairing. Both credential-shaped session tokens should
be excluded from generated outputs. No actual server execution is requested.

## Independent actual own-case fault proof

Unchanged282901 passed, then archive-only allocator `return port + 1` failed at
release18 with actual40102/expected40101 (exit1, one failure), then the same case
passed after byte-exact restoration (exit0, one pass). Source SHA256
`d15fafd9aac726f1cbedf5f6121cc585baf49d63e1aa2e20504ac3638716d462`, blob
`7fe560dfbc2f76a0d90a4c27182ea8a106904066`; test SHA256
`3bb152e2bdce2c12bb39dabb44681cf3a8a6acd629c2a5d76a71ec0970c1fedb`, blob
`83b66bb7049dec626a55a995d2e5669c4d1b6e6c`.
Private actual logs are `/private/tmp/p17er-po-282901-{positive,fault,restored}.log`;
receipt `/private/tmp/p17er-po-two-faults.json`. Source/test originals were restored
and exact-byte equality verified. This relevant own-case proof is valid but does
not turn unasserted declared outcomes into assertions.

Required bounded correction: only E's new release case assertions above, same
recorded relevant fault and restored positive with corrected unchanged case,
then a new complete combined Linux CI on the corrected exact head. Earlier
source approval and scope remain unchanged. A later immutable gate supersedes
this finding alongside it; this record is not edited retroactively.
