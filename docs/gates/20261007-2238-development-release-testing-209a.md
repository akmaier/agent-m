---
gate: Development → Release testing
job: JOB-20261007-2231-9e2c
decider: po-sol
role: Product Owner
decision: passed
on:
  - b7b46837846cc65355636227b889faf6e04c0a40
  - https://github.com/akmaier/agent-m/pull/209
date: 2026-10-07 22:38 UTC
---
# Development → Release testing: ITM-265 attributed delivery

**REGISTER**

## Reason

Passed: merge only exact b7b46837846cc65355636227b889faf6e04c0a40 into sprint/09. The selected direct endpoint module acceptance holds. This does not approve main promotion, dashboard endpoint wiring, independent ITM-270 or full UC-003 alternative2a/Bridge/Safari delivery. Rejected PR188 heads, jobs and gates retain their original decisions.

Checked JOB-20261007-2231-9e2c is the recorded fresh retry of JOB-20261007-2217-c2ae, limit3, with same accepted inputs and original Terra-a/Terra-c authorship retained. Independent decision JOB-20261007-2236-2368 was recorded before delegation. Sol implemented none of the behaviour or submitted tests. Older missing start evidence remains missing; neither this delivery nor its properly recorded jobs fabricate history.

## Full acceptance review

Read original AGENTS/SPEC, Team2 declarations, ITM-265, full UC-003, accepted MOD-settings-pages/MOD-browser-store/MOD-site-frame/MOD-endpoint-calls and their implemented public callers. Read the complete new PR body/history/files and the earlier188h complete checklist. Exactly four owned paths change: src/settings-pages/index.mjs, endpoints.mjs, settings.mjs and new tests/settings-pages-endpoints.test.mjs. No existing add-product tests/production, helper, allowlist, unowned dashboard, SPEC or architecture changes.

- Public endpoints Route accepts URL/kind/model/optional key and a nonsecret name; localStorage save precedes one short direct test. Boundary maps stored url to baseUrl and absent key to null. Success/provider diagnosis and browser-refusal alternatives are shown, refused key retained until changed/cleared, reload restores configuration, Clear removes actual setting and clears form.
- Key stays password-hidden until Show/Hide; shared-Pages-origin notice and destination/data disclosure precede saving/test; seven registered folded form explanations are present and first input is focused. No cookie, credential URL or repository write is introduced.
- Public Settings Route uses listSettings/readSetting, own-instance canonical entries, password-hidden Show, mapped Test, context.go(endpoints,{name}) and selected Clear/redraw preserving another endpoint. It renders folded browser-section/line explanations, shared-origin notice, actual URL/send disclosure before Test, accepted not-set/refused/works status and successful-test date.
- settings.mjs:96 listSettings → endpointLine:40/readSetting:42 → Test:61–71 → testEndpoint(canonical config) → writeSetting(last-test:<key>,{at,outcome}) → status. Reload consumes SettingInfo.lastTest; Clear:74–77 removes endpoint plus paired metadata only. Both public routes retain throughBridge and diagnose setup before direct test, with zero direct call and no rejected probe/fallback/Bridge-success claim.
- Dashboard entry composition is the separately selected between-jobs wiring, not hidden module work. Existing add-product expected results remain unchanged. The separately verified UC-0013d guidance finding concerns preserved products.mjs, outside this endpoint item's changes; it is not accepted as corrected here.

## Exact-head evidence

New first writing commit ef1b9519adf40a383db0de1c50a91c919740ffaa changes only the new16-case test file. Actual CI37696866581 on that tests-only head is red: all16 fail at missing public endpoints/settings routes, Python passes. Source writing commit b7b4683 supplies the three owned source paths. Both commits explicitly name Agent-M-Version unreleased, Agent-M-Participant developer-terra-c and Agent-M-Model gpt-5.6-terra. Existing rejected provenance-less commits were not rewritten or falsely repaired.

Live exact-head final CI37697064633: Node113051288967 and Python113051289202 completed SUCCESS. Independently archived exact head at /private/tmp/po-sol-209-_z9p43ym: all16 endpoint plus all14 existing add-product cases pass, thirty total, zero failure/skip/TODO. No extra full-suite rerun was needed beyond actual final CI and the changed-detector verification.

Verified production blob identity against reviewed df3aab6: index.mjs faa56f59d7a5c6731b5833327fabe1bcde52435a; endpoints.mjs660db486ee1fcaa5a6e730c5832799a675f46c31; settings.mjsfd290df75d1ac287e9bb5266fff26f58c737b40e. Tests differ only in TST-265016's two actual status-node assertions; cases001–015 are unchanged. IDs001–016 remain only in this owned test artifact, with explicit module/level/guards/input/preconditions/expected results.

## Counter-proofs and prior findings

PR209 explicitly retains original001–015 recorded actual planted-fault/restoration lineage from PR188: original mapping/order/browser refusal/refused key/real clear/Bridge no-direct/optional key/disclosure/Show, enumeration/mapped Test/named Change/selected Clear, and later explanation/disclosure/test-state write/paired metadata Clear. Earlier gates retain the observed evidence rather than claiming a new run. Independent188h verification reran013,014,015-write and015-clear, each actually failed and was restored; source/tests for these are unchanged here.

Prior016 failure-node path was whole-line regex matching endpoint name refused instead of its status. Corrected tests:373–384 target .settings-endpoint-status; line382 expects /^Refused\.$/. Repeated independent actual fault in exact-head archive: settings.mjs stateText returns Works. for refused metadata; TST-265016 fails at line382 with actual Works. versus expected Refused. Restore source: all30 focused cases pass. Logs positive.log,016-fault.log,restored.log. The PR also records the author's actual016 fault and restoration. This closes the detector finding without changing production behavior or weakening expected results.

## Disposition

Root Scrum Master may merge only this approved exact head into sprint/09. Fresh jobs and commit provenance meet the current requirements; earlier rejected history remains untouched. Sprint09 stays open. Endpoint wiring and independent direct system/release tests remain unfinished; throughBridge setup-only is not complete UC-003. No architecture or SPEC acceptance is implied.
