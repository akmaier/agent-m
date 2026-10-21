---
gate: Development → Release testing
job: JOB-20261021-0529-b103
decider: po-sol
role: Product Owner
decision: passed
on:
  - effddd9d44acfa6290e131cb67df0b1ff3ba30f5
  - https://github.com/akmaier/agent-m/pull/1269
date: 2026-10-21 11:24 UTC
---
# Development → Release testing: ITM-773

**REGISTER**

## Reason

ITM-773 passes its single bounded evidence rework on exact head `effddd9d44acfa6290e131cb67df0b1ff3ba30f5`; the earlier rejection `20261021-0544-development-release-testing-773a.md` remains unchanged. Its parents are original tests-only `9c6feb60ad75c792f669513d41fdb1d8a2fa5f11` and actual integrated Sprint103 `5d81725001fc760a683e34de3b4a5c29164b44c4`, containing the independently gated ITM-1172 repair. Relative to that sprint, only the original five new files change: `tests/system-uc-028-run-and-review-the-tests.test.mjs`, `tests/release-uc-028-run-and-review.test.mjs`, `tests/test_result_records.py`, its Markdown data file, and `tests/uc-028-world.mjs`. All five are byte-identical to their original reviewed blobs. There are 28 cases: 11 system, 13 JavaScript release and four Python release; the helper and the five Markdown fixtures are not additional cases. This tests-only item adds no product behaviour and therefore needs no manufactured first-red implementation commit.

The previously reviewed 27 per-case counter-proofs are recorded in [6309343598](https://github.com/akmaier/agent-m/pull/1269#issuecomment-6309343598) and immutable test-results receipts at the original head. Each literal fault location occurs once, its original source SHA-256 matches that head, and the recorded restoration is exact. These remain dated original-head evidence, not falsely repinned measurements. TST-773204 legitimately faults the `rewritten_or_deleted` checker that its original assertion guards, leaving the expected fixtures and assertions unchanged; SPEC §12 says code it guards, not production source only. No adapter rewrite or authorship transfer is involved.

The remaining TST-773112 proof is now recorded in [6314657138](https://github.com/akmaier/agent-m/pull/1269#issuecomment-6314657138): public runs detail reaches `runs.mjs:370`; temporarily removing only `explain("test-runs")` makes the untouched release assertion at line 304 fail, actual false versus expected true. Restoring source SHA-256 `0f8cbdd35c3c2c9372c6de94548ff9ee68e8d75397517196a41a481fb5834ffa` passes the same selected case. I read fault receipt `3edb8a13` (`1118-on-demand-04fa`, explicitly uncommitted), baseline `2c260cdd` (`1121-on-demand-b057`) and restored `4a860789` (`1121-on-demand-c8f5`), all naming this exact integrated head. [6314681203](https://github.com/akmaier/agent-m/pull/1269#issuecomment-6314681203) discloses that their 11:21 dates are recording time: the baseline's exact boundary was not retained; restoration ran at 11:17:38.316–.622Z. No execution boundary is invented and no replay was done by this PO. Integrated receipt `357f6aed` records all 24 JavaScript cases passed; `706b222c` records all four Python cases passed. The original missing-fold finding is resolved by ITM-1172, not by weakening these tests.

Fresh run `39590969547` has all 23 checks successful, maximum 102 seconds. Native job `119191525059` checks out `b92d692a18a9058f56bbf3f30619f485abcd8157`, merging the exact candidate into the actual sprint target. Sprint-target CI excludes release; the 28 focused outcomes above supply their separate actual evidence, and this decision does not claim an all-level sprint Release gate. Original author developer-sonnet-a implemented none of prerequisites ITM-750/761/762; developer-terra-a performed proof rework, not behaviour implementation. Developer-terra-b implemented the separate repair. I authored none of those tests, sources, measurements or SM closure.

Reviewed main is `3848b2e50cbe9792a59bc1291f5066ac981d7e0d`; actual sprint target is still `5d81725001fc760a683e34de3b4a5c29164b44c4`. The complete 13-page native measurement at 11:20:20Z read 1269 PRs, 960 items and 190 sprint records: only Team1/103 holds remain, other-team holds and both conflict directions are empty. Self/default ancestry and delivered Team2/102 are positive controls; a hypothetical team2 caller positively conflicts with held TestPages work. Approved inputs and Team1's po-sol assignment are unchanged. After this exact record is published unchanged, SM may guarded-merge only this exact head into `sprint/team1/103`. Changed head, relevant source, accepted inputs or holds require reassessment; unrelated job/gate metadata alone does not. No main merge, Release-phase pass, formal acceptance, closure authorship or next Selection is authorized; the separately recorded TST-1082001 flaky history is not erased.
