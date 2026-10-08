---
gate: Development → Release testing
job: JOB-20261007-2356-9d93
decider: po-sol
role: Product Owner
decision: passed
on:
  - f5f885489b8c308875d3e536758a26d366154835
  - https://github.com/akmaier/agent-m/pull/214
date: 2026-10-07 23:59 UTC
---
# Development → Release testing: ITM-270 direct endpoint tests

**REGISTER**

## Decision

Passed on exact head f5f885489b8c308875d3e536758a26d366154835 of PR214 into sprint/09, based on integrated base
40b2750a646d065a183070a325921b9755e75a5e. The Scrum Master may merge this head after confirming it remains the
current head with green CI. This gate approves the direct endpoint test increment only. It accepts no SPEC, use case
or architecture, completes no Bridge alternative 2a, and closes neither the sprint nor its later release/closing gates.

PR213 remains open and unmerged at 5a48a3430580d0b8343f2455b00446f5801d5816. Its rejected gate, failed three-round
job, earlier heads and recovery history remain evidence. This replacement belongs to separately recorded
write-tests retry JOB-20261007-2350-7ebf; it does not reset or approve the earlier failed execution.

## Original review basis, scope and independence

Read the original AGENTS.md, full 2135-line SPEC.md, Team 2 process/participants, pinned scrum-wip model, full current
sprint09 register, ITM-270, UC-003, the accepted affected architecture and actual integrated caller/helper/driver/test
files. The complete 46 use cases plus README and all 70 architecture files were personally read in the preceding
recorded whole-corpus review; their current pinned original trees remain 108d9ff406b1386f60e9bbe78607f1864b9457dd
and 72079a3affe0be70b398afe89fa32c6ad063364a. SPEC remains 1de56e76de63bfe5f3f4bb98820adad801041def.
The current job and retry originals, prior gate, full two-file diff, commit history and live PR description were read.

Only tests/system-uc-003-direct-endpoint.test.mjs and tests/release-uc-003-direct-endpoint.test.mjs are added against
base40b2750. Production, dashboard assets, shared helper and all old tests are unchanged. The system file is identical
to retained PR213 head5a48a343; the release file changes only the shared-storage/active-DOM fixture and its truthful
declaration. Current blobs: system 4cfc9fe03562fb24e98ed0eb702e78d0d80c7b9f, release
fbff7157ea8dda1bccb3e6c97d32cf3b4f48bfb3.

The single writing commit f5f8854 carries Agent-M-Version: unreleased, Agent-M-Participant: developer-terra-e and
Agent-M-Model: gpt-5.6-terra. Its copied case lineage is explicitly retained in the PR and retry record. Guarded-path
history positively identifies the endpoint/store/frame/wiring implementers, including Terra-b/c/d and their earlier
recorded authors; neither Terra-e nor predecessor Sonnet-e implemented the guarded behaviour. po-sol wrote no
submitted tests or guarded production. This is independent test authorship and an independent gate.

TST-292001 through TST-292011 are unique and have no baseline identifier collision, using a matcher that positively
finds existing TST-265001. Each case declares its level, guards, exercised modules, precondition, input and expected
result. The six realised requirements all have release assertions; combining requirements in a case is permitted.
SPEC:1411 requires a failing planted fault per new case, not a fault per assertion or six distinct release cases.
The retry is write-tests, not an implementation job; the implementation-only first-red condition adds no obligation
to make these independent tests fail on deliberately correct production first.

## Closure of isolation and evidence findings

Actual path: release test:72 → openEndpointDashboard:31 → existing openDashboard helper → dashboard Settings
section → docs/assets/dashboard/settings/endpoints.mjs:15 openStore(app.T.instance) → Configure →
docs/assets/dashboard-app.mjs:525 openStore(T.instance) → src/browser-store/store.mjs:20 prefixOf(instance) →
endpoints.mjs:108 writeSetting → canonical localStorage entry.

The first instance is akmaier/agent-m. Test:73 captures its storage object. The second actual dashboard caller is
opened with pathname /other/instance/ and that object at test:79; helper:34 assigns it before the Settings/endpoint
stores open. src/site/instance-repository.mjs:6–9 derives akmaier/other from that Pages pathname. Test:80 asserts
object identity. Each form saves its distinct model through the actual controls; test:83–84 verifies both canonical
records coexist in that object. There is no manually seeded second endpoint record.

activate:22–28 restores each caller's document, location, storage and fetch before its public named-route reload.
Test:87 checks the current visible second-instance form. Test:89 changes the first form to stale-first-model before
reload; test:91 queries the current document and requires release-model. The passing assertion therefore cannot be
satisfied by inspecting the stale first form. The fixture models two instances in one same-origin browser storage;
its metadata and PR body say exactly that, with no two-browser claim.

Known positive on the exact-head independent archive: 11 pass. Plant only the source fault
prefixOf(instance) → fixed agent-m:akmaier/agent-m:. The full suite gives 10 pass, 1 fail at release:83: second
canonical entry actual null, expected /other-model/. It now invokes and detects the instance-dependent failure path.
Restore the original source bytes; full focused suite returns 11 pass. Both F1 and F2 are closed.

## Complete acceptance and actual counterproofs

System292001 reaches Settings Configure, saves the exact form record before its single controlled OpenAI request,
checks body/header and shows success. System292002 exercises Anthropic Messages and its authorisation.
System292003 covers observed CORS refusal with CI/Bridge alternatives. System292004 displays the provider refusal
before reload, then checks retained key after reload and real Clear; it does not claim persistence of the error
message. System292011 clicks the actual Settings Change control and reloads the exact named record.

Release292005 guards browser-local canonical storage, two-instance isolation and no cookie. Release292006 guards
credential absence from the actual endpoint URL/request ledger and zero repository writes. Release292007 guards
actionable opaque browser failure. Release292008 guards persisted removal and an empty named-route reload.
Release292009 checks ordered destination disclosure, hidden/revealed full key, retained throughBridge:true,
setup-required result and zero direct model requests. Release292010 checks successful empty optional key with no
stored key property and no Authorization header. These cover all six realised requirements and every additional
ITM-270 exercise; replies are in-process harness handlers, with no paid endpoint or external credential.

Independent archive /private/tmp/po-214-mb5b_ufw contains the exact submitted tree. After the known-positive run,
each following fault was planted separately, executed, failed the focused case, and restored byte-for-byte before
the next run. Logs proof-<case>.log, results.json, proof-fixed-first-full.log and restored.log retain actual results.

| Case | Source fault and transformation | Observed failing node |
|---|---|---|
| 292001 | endpoints.mjs:108 remove writeSetting before testEndpoint | system:81 working result fails; displayed handler assertion at system:72 reports actual stored null versus submitted record |
| 292002 | endpoint-calls/index.mjs:27 replace /messages with /chat/completions | system:103 actual observed Messages destination null versus required handler |
| 292003 | endpoint-calls/index.mjs:84 replace browser routes with [] | system:127 CI missing from observed refusal |
| 292004 | endpoints.mjs:120 remove clearSetting | system:152 actual retained JSON versus null |
| 292005 | browser-store/store.mjs:20 fix prefix to first instance | release:83 second canonical entry null versus /other-model/; full suite 10 pass/1 fail |
| 292006 | endpoint-calls/index.mjs:39 append configured key to URL | release:111 actual URL includes key true versus false; handler still answers, so this is the key-URL assertion |
| 292007 | endpoints.mjs:50 suppress alternatives | release:134 CI absent from opaque failure |
| 292008 | endpoints.mjs:120 remove clearSetting | release:151 retained canonical JSON versus null |
| 292009 | endpoints.mjs:111 remove throughBridge early return | release:182 HTTP500 result versus required setup text after the direct handler was reached |
| 292010 | endpoints.mjs:33 store empty key unconditionally | release:205 Authorization is Bearer with empty value versus undefined |
| 292011 | settings.mjs:73 remove Change context.go | system:175 actual #settings versus #endpoints/campus |

The retained gap-detection probes also fail: blanking key.value when Show changes visibility fails release:179,
actual empty versus local-key; storing throughBridge:false while keeping the setup branch fails release:184,
actual false versus true. Both are restored; they establish closure of the earlier gaps, not extra per-assertion rules.

Final restored run: 11 pass, zero failures. Restored git blob identities equal submitted head:

| Source | Restored/submitted blob |
|---|---|
| src/settings-pages/endpoints.mjs | 660db486ee1fcaa5a6e730c5832799a675f46c31 |
| src/settings-pages/settings.mjs | fd290df75d1ac287e9bb5266fff26f58c737b40e |
| src/endpoint-calls/index.mjs | b7162d179bc7168fba2ce3b2489982498cafad38 |
| src/browser-store/store.mjs | ede229398c38f93056d1eb26c79a562a77567407 |

## Live CI and disposition

Immediately before this decision, PR214 remains OPEN on f5f885489b8c308875d3e536758a26d366154835, target sprint/09.
Run https://github.com/akmaier/agent-m/actions/runs/37704956240 is completed SUCCESS on that exact head; both Node
and Python jobs are SUCCESS. The local independent focused suite and every fault/restoration proof are above.
No unresolved finding remains against ITM-270's original direct-test acceptance. Any head change needs a new gate.
Only scrum-master-session carries out the authorised exact-head merge. PR213 remains unapproved and unmerged.
