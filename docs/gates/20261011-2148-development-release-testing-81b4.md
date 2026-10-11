---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: rejected
on:
  - f29fd6d0a14001ca56636046803ef078b5fde183
  - https://github.com/akmaier/agent-m/pull/434
date: 2026-10-11T21:48:13Z
---
# Development → Release testing — ITM-293

**REGISTER**

## Reason

Rejected on one condition: ITM-293 Acceptance requires canonical unique numeric declarations, but the new unit cases reuse existing test identifiers. New tests/release-evidence-293.test.mjs:158 and196 declare TST-293001 and TST-293002. Existing tests/system-uc-047-release-report-waits.test.mjs:48/57 already declares/runs TST-293001 at level system, and tests/release-uc-047-release-report-waits.test.mjs:39/48 declares/runs TST-293002 at level release. The new cases have different guards, inputs and expected results. Original Start81b4 also explicitly requires unique numeric declarations. No additional gate condition is introduced.

Concrete evidence path: these four original declarations → report.mjs:109 collectDeclarations stores each under byId.set(d.id, d), replacing a different case with the same identifier → :117 flattenTests likewise keys outcomes by identifier. The immutable actual final result contains TST-293001 at unit and system and TST-293002 at unit and release; the original CI runs all four different cases. Expected: each newly authored case has an unused identifier, so its declaration, selected fault and result identify that case unambiguously. This is a static public data-flow finding supported by observed declarations/outcome rows, not a claimed dynamic report-overwrite reproduction.

The single permitted rework is limited to assigning unused identifiers to the two new cases and consistently updating their declarations, test-name prefixes, fixture references, fault-map keys and selectors. Preserve every expected assertion, all existing test identifiers and expectations, source behavior and public schemas. Preserve the original red and green runs and proof measurements unchanged; append actual new exact-head CI and same-case fault/restoration evidence for the reworked identifiers. No other-module, accepted-artifact or process change is required.

Other checks were independently reviewed: first tests-only365af258eb1a29c18d3327ade37a2a30200f4f26 changed only the new unit battery; actual red CI38176703134 reached its public finding at167, omitting6of10 after the NIST known-positive oracle check. Final PR434 is OPEN, ready, exact f29fd6d0 with only src/release-evidence/report.mjs and its module-named new unit battery. Ubuntu CI38177334561 succeeded:1922 Node passes, zero failures, eight existing TODO;444 Python tests successful with five skips/five expected failures, jobs117/95seconds. Actual checkout49f50ab91e075e5ae47ead3322d852f1d86b815c has parentsa3f22ce6 andf29fd6d0 and complete treec87394492f3dcc2c67354fb6c91a5dbe6cc9ce21 equal to candidate. All2374 outcomes and both original receipts are immutable at test-results fdfdc33739d0510c376fcd5b54b75ee2f1343718, runs/49f50ab91e075e5ae47ead3322d852f1d86b815c/20261011-2140-pull-request-e532.md.

Both complete selected fault receipts were personally read and decoded once from the original TAP log, matching the supplied objects. Unique source substitutions, exact source/test/fault/restored SHA256, same-case argv/cwd/flag, ordered times and status1→restored0 with null signals/errors and empty stderr were independently verified against candidate bytes. TST-293001's empty finding fails at182 on absent6of10; restoration passes the parsed bounds against independent score inversion. TST-293002's removed worse filter fails at217 when equal8of10 incorrectly returns its ID; restoration passes equal/improved/no-baseline. These are valid behavioral measurements despite the colliding identities. Published dated proof records at main5226f7ef retain the raw measurements; their wrappers use a Failure node and verification heading and dated filenames rather than MOD-result-records' canonical Fault/Result sections and TST-only filename. This format finding does not rewrite or invalidate their observed streams and is distinct from the rejection condition.

The privately calculated two-sided95% Wilson finding follows the primary NIST originals and preserves the accepted public return, comparison/result/report schemas and acceptAndRelease body. Original code, tests, all commits, PR body/metadata, accepted item/module/UC013/ARC043/approvals, current process/DoD and own unchanged full book/input originals were read. Own preparation receipt identifies fresh and retained full guarding reads; the author's timed sixteen-input receipt preceded generation. po-sol implemented none of this behavior. Current main5226f7ef differs from6ca6d8c0 only by the source checkpoint and two proof records; Team1/21 remains eight items plus fixture-only457, with458 returned and350 waiting. No new module conflict is present. No local product/test/fault/runtime execution occurred. Independent release verification and whole dashboard/use-case completion remain outside this Source decision. Root must publish this original rejection before its comment; this exact head must not merge.
