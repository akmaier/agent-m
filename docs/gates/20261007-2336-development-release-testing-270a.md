---
gate: Development → Release testing
job: JOB-20261007-2328-2931
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 9126300a283635de364739305507057bcca707d9
  - https://github.com/akmaier/agent-m/pull/213
date: 2026-10-07 23:36 UTC
---
# Development → Release testing: ITM-270 direct endpoint tests

**REGISTER**

## Decision

Rejected on exact head 9126300a283635de364739305507057bcca707d9. ITM-270's original acceptance requires exercising two instances' isolation through the actual dashboard route. The current fixture exercises only one instance and manually writes a second namespace. Its metadata and PR description also describe two dashboard browsers that the current case never opens. No merge is approved. The same write-tests job and its fixed three-round limit continue; this decision resets neither.

This decision does not require six distinct release cases or a fault on every assertion. ITM-270 requires a release test guarding each of the six requirements; one case may guard several. SPEC `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT` requires a recorded fault failure per new case. The combined URL/repository assertion in TST-292006 is permitted.

## Review basis and scope

Read originals: AGENTS.md, the complete 2135-line SPEC.md, Team 2's process and participants, scrum-wip, ITM-270, UC-003, the accepted affected settings-pages/browser-store/site-frame/endpoint-calls module documents and their subsystem decisions; actual integrated source callers, the dashboard harness, existing endpoint/store/wiring tests, the two new files and both jobs' current input records. This is an independent po-sol review; po-sol wrote no guarded production or submitted tests.

The input is the current head recorded on main in JOB-20261007-2328-2931. Live PR 213 reports that exact head, target sprint/09, with Node and Python SUCCESS in run 37702905790. Its final diff against integrated base 7b051cae62e08677cbfa7414e46ecfb5d3f82aa6 adds only the two new system/release files. Source, dashboard assets, helper and old tests are byte-identical to base. Every writing commit in the submitted history names unreleased, developer-terra-e and gpt-5.6-terra. Both previously reviewed heads a76b8b8 and 914fd9a are ancestors after normal recovery merges; the earlier amend/force-push incident remains recorded, not erased. Guarded module history contains the known implementation participants and no developer-terra-e or predecessor developer-sonnet-e. Current identifiers TST-292001 through TST-292011 have no collision with the baseline test identifiers, checked with the same matcher that finds existing TST-265001.

## Remaining findings

### F1: the second instance is never exercised

`tests/release-uc-003-direct-endpoint.test.mjs:56 → openEndpointDashboard → openDashboard → docs/assets/dashboard/settings/endpoints.mjs:15 openStore(app.T.instance) → docs/assets/dashboard-app.mjs:525 openStore(T.instance) → src/browser-store/store.mjs:20 prefixOf(instance)` runs with akmaier/agent-m only. Test line 62 writes an other/instance record directly into localStorage; line 63 reloads the first page, line 64 checks only its model, and line 65 checks that the manually seeded string remains. No caller opens or reads/writes a store for other/instance.

Known positive: the exact-head archive's eleven cases pass. In that archive, deliberately replace `prefixOf(instance)` with the fixed prefix `agent-m:akmaier/agent-m:`. TST-292005 still passes, including both namespace assertions. This fault makes an actual other/instance use the first instance's endpoint storage, violating MOD-browser-store's accepted two-instance format, but the case never invokes the failing path. Restore byte-for-byte. The case's previously recorded global-prefix fault does fail, at line 60's canonical-key assertion (actual null, expected a string matching release-model); it does not verify isolation of a second instance.

Correction: exercise the instance-dependent public caller/store path for a second instance in the same browser storage and assert that each instance retains its own endpoint through the actual dashboard route. No particular number of pages or fixture implementation is imposed. Keep production, helper and old tests unchanged.

### F2: evidence text describes a different fixture

The same test's lines 49–52 describe two dashboard browsers and a second-browser isolation assertion. The current case creates one dashboard only. The PR requirement table says “Two mounted dashboard browsers isolate the endpoint record”, and its coverage paragraph says “two browser instances”. These statements do not describe the submitted code. Correct the test's precondition/input/expected/proof text and PR description to the actual completed fixture and observed failure node. The current statement that a replaced global prefix proves second-browser isolation is unsupported by its actual failure at line 60.

## Closed findings and actual verification

The original six realised requirements have meaningful release assertions: browser-local canonical state and no cookie in 292005; no credential URL and no repository writes in 292006; actionable opaque browser refusal with CI/Bridge in 292007; actual persisted removal and empty named-route reload in 292008. The remaining isolation exercise is F1, not a five-versus-six case-count defect.

Main flow 292001 reaches Settings Configure, saves the exact record before the handler receives one short OpenAI-compatible request and shows success. 292002 reaches the actual Anthropic Messages driver and authorisation. 292003 shows the observable browser refusal and alternatives. 292004 shows the provider's refusal, retains the key across route reload and clears actual storage; its expected text now accurately distinguishes displaying the message from persisting the key. 292011 clicks the actual Settings Change control and loads the named endpoint. 292010 successfully saves/tests an absent optional key, without a stored key property or Authorization header. 292009 checks destination disclosure ordering, a nonempty hidden/revealed key in full, retained throughBridge:true and setup-required output with zero direct requests. It claims no composed Bridge success or UC-003 alternative 2a completion. All replies remain controlled harness responses; no paid endpoint is contacted. Invented MOD-dashboard-app headers are removed.

Independent archive /private/tmp/po-270-final.3ekYW7: baseline 11 pass, zero failures. Each of the following source faults was executed separately, failed its focused case and was restored byte-for-byte before the next probe. The final restored run again reports 11 pass, zero failures. Logs proof-<case>.log, results.json and restored.log retain actual outputs.

| Case | Planted fault | Observed failing assertion in new test |
|---|---|---|
| 292001 | Remove save before request | system:81 working result fails; the displayed error contains the handler's saved-record assertion, actual null versus submitted record |
| 292002 | Anthropic sends to chat/completions | system:103 actual observed destination null versus required Messages handler |
| 292003 | Browser diagnosis routes empty | system:127 CI absent from displayed refusal |
| 292004 | Clear no longer removes storage | system:152 actual stored JSON versus null |
| 292005 | Replace instance prefix with global | release:60 canonical stored entry null versus release-model |
| 292006 | Append configured key to endpoint URL | release:85 actual URL contains key true versus false |
| 292007 | Hide result alternatives | release:108 CI absent from displayed opaque failure |
| 292008 | Clear no longer removes storage | release:125 actual stored JSON versus null |
| 292009 | Remove throughBridge early return | release:156 HTTP 500 result versus Bridge setup text; the direct request happened before this assertion |
| 292010 | Store an empty key property | release:179 actual Authorization Bearer followed by empty value versus undefined |
| 292011 | Change no longer calls context.go | system:175 actual #settings versus #endpoints/campus |

The independent probes that originally exposed the Show and retained-Bridge assertion gaps now fail after the corrections: blanking key.value on Show fails release:153 (empty versus local-key); storing throughBridge:false while retaining the setup branch fails release:158 (false versus true). Both were restored. These establish closure of the reported gaps; they add no obligation for a fault on every assertion.

## Disposition

Return F1 and F2 together to developer-terra-e in the remaining bounded correction, after its separate ITM-245 work as the Scrum Master sequences it. A revised exact head needs its own current input, actual corrected proof and green CI before another independent gate. Only the Scrum Master carries out any later merge on a recorded approved exact head. SPEC, use cases and architecture remain untouched; their acceptance stays with akmaier.
