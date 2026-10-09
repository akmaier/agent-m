# Independent endpoint caller gate — ITM-269

**REGISTER**

Decision: **PASS / APPROVED**, only PR250 exact head `3240699df1328cf12f35a38308b590621052fc8f` into sprint/16.
Decider: po-sol. Actual Taken: 2026-10-09 14:29:28 UTC. Decision/live full-green recheck: 2026-10-09 14:31:06 UTC.
Review job: JOB-20261009-1426-p269c. PR: https://github.com/akmaier/agent-m/pull/250

## Originals, authority and scope

Read NEW published Start on main `6a9fde619b45904453f09de1a26e60ef554adec4` before creating NEW isolated
`.agent/worktrees/agent-po-sol-269-caller-gate-16`, branch codex/po-sol-269-caller-gate-16. Primary remains main.
Retained original full AGENTS117-line and SPEC2135-line reads after verifying unchanged blobs
`7e8f20ca35cd48a5250d143b07a469d46986f123` and `1de56e76de63bfe5f3f4bb98820adad801041def`.
Verified retained README, Team2 process/participants, pinned scrum-wip model, Sprint16, UC003/044,
MOD-settings-pages/browser-store originals unchanged against previous f30e83a review. Read original MOD-site-frame
in full, NEW job, actual JOB1133 write-tests End/separate caller receipt, prior immutable owned gate, new test,
changed caller/dispatcher, same-scope endpoint/Bridge callers and actual source history. Existing owned source,
all old guards and app-harness unchanged since727b593; their original full reads retained and relevant originals reread.

AGENTS §2 requires the concrete call/data-flow and failure-node proof; §6a requires reading the existing caller first
and a known positive before a negative finding. SPEC §11 WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS applies to
this unowned dashboard adapter. SPEC §12 requires one level, readable input/precondition/expected and a relevant
planted guarded-code fault; §13 A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS supplies independence.
JOB1133 End11:39:54 precedes separate caller handoff11:41:23. This is write-tests followed by bounded between-jobs
caller work; no invented implementation job or first-published-red-CI obligation. Manual reviews are not automatic rounds.

Actual live PR diff and local three-dot diff agree: ONLY one added caller mapping at dashboard-app.mjs527 and NEW
65-line component file tests/mod-settings-pages-dashboard-bridge-handoff.test.mjs. Two-dot comparison of divergent
branches also shows target-only E tests; these are not PR deletions. Source727b593 was approved independently and
actually merged into a318b833 before PR250 publication. Its owned source is absent from this PR's change set.
Exact caller blob `ef6daba63ebbdb785dee26fe67453f730b2371ef`; test blob `69b11c7e286ae99436add44276b707d2c7ccbeef`.
Parent chain727b593 → local tests-only9a7ea7fa30e838faed80dbb755e174c722d3ab28 → final3240699. Final changes to the
new test since9a7ea7f are only two counter-proof comment lines, preserving all asserted expectations.
Unique numeric TST-269006 declares only component level and canonical module/guards, with readable case data.
No old expectations, helper, parser, module source, workflow, accepted document, process or selection changed.

I authored none of checked caller/test. Actual final commit identifies developer-terra-a/gpt-5.6-terra; earlier
b9ac420 public Bridge dispatch is A by its published job/gate, while original endpoint dispatch101d3e1 and boundary
bf5e338 identify predecessor TerraD, and older dashboard product/store adapters include TerraB. Owned endpoint727
is C and store/client/server authorship remains as recorded in the prior immutable gate. This component test makes
no independent-release authorship claim. D's independent269 release coverage remains required.

## Concrete caller path and independent failure proof

Actual #endpoints → docs/assets/dashboard-app.mjs522–529 selects public settingsPages endpoint Route with canonical
instance store → src/settings-pages/endpoints.mjs127 click validates name/url/model →133–135 saves endpoint:local
before missing-pairing action →137–142 no Bridge setting, renders actual setup control and returns without direct
request →140 setup click context.go("bridge",{}) → NEW dashboard-app.mjs527 transforms it to location.hash="#bridge".
Existing hashchange listener at585/597 dispatches route →531–539 selects settingsPages public Bridge Route →
src/settings-pages/bridge.mjs93 renders setup. Test56 verifies raw canonical saved endpoint,57 no direct fallback,
59 actual setup control,62 exact resulting hash,64 public “Connect a Bridge” render.

The established harness imports actual dashboard-app, supplies DOM/storage/fetch boundaries and records every
request in app-harness.mjs118's finally. Its loc.hash assignment alone does not fire native hashchange; after checking
the real handler's hash result, test63 uses the existing page.go fixture to deliver hashchange and await public dispatch
(app-harness313–317), as preserved280003/004 do. This is bounded component composition proof, not native browser proof.
Known-positive controlled direct form using the same public caller/harness and identical requests.some/includes predicate
matches actual ledger `handler POST http://127.0.0.1:11434/v1/chat/completions`; no paid model request occurs.
That positive validates the new case's negative no-local-model-request observation.

Disposable exact-head archive /private/tmp/po269caller-review, Node v26.3.1. Independently ran new269006, existing
endpoint wiring, Bridge wiring, owned269 units and direct/settings guards:26total/pass,0fail/skip/TODO/cancel,
472.053625ms. Log /private/tmp/po269caller-positive.log. No native/paid launch.
Omit ONLY the first exact Bridge mapping (endpoint caller527), retaining existing Bridge caller's mapping:
TST-269006 passes form/save/no-direct/setup positives, then fails at test62, actual#endpoints, expected#bridge;
0pass/1fail,exit1,217.695041ms. Restore exact original bytes: own case1pass/0fail,exit0,236.398791ms.
Logs /private/tmp/po269caller-fault.log and /private/tmp/po269caller-restored.log. Final restored caller hash-object
matches ef6daba63ebbdb785dee26fe67453f730b2371ef; SHA256
`d1f4fcf4f09e646c435ea8e750b3ff20fba34f35f888f319cd5da76805a0ead2`. No mutations retained in checkout/archive.
Published JOB1133 preserves actual tests-only local9a7ea7f failure at this hash after known positives; there is no
claim of a published first-red CI. Own independent guarded-code omission proves the failure node again.

## Complete actual CI and disposition

Read full7112-line actual log https://github.com/akmaier/agent-m/actions/runs/37944037031, exact head3240699,
and both complete job/step records. Parsed all1034 Node outcomes and399 Python outcomes, inspected all TODO,
skip/expected-failure outcomes and setup/checkout/cleanup. Both COMPLETED/SUCCESS:
Node1034total/1026pass/0fail/8existingTODO,0skip/cancel;48.76655902s suite; job14:25:19–14:26:16UTC,57s.
New269006 actual passing outcome322. Python399total/388ok/5skip/6expected failures,0ordinaryfailure/error;
57.047s suite; job14:25:19–14:26:22UTC,63s. Both under120s. Existing TODO/skips/expected failures remain limitations,
never counted as passed tests. Full log /private/tmp/po269caller-ci.log SHA256
`8ba53572af8721c9a618002cd555c67479441831c4d4b2c956532afbdb535762`.
Actual checkout c6947ef78d15a4cf5620228f6732a261db168132 parents verified via GitHub API:
a318b833e1ea01abef4fd19105cf03c378e9d4de and3240699df1328cf12f35a38308b590621052fc8f.
Final live recheck14:31:06UTC: PR250 OPEN, unchanged exact3240699, both complete full checksSUCCESS.

Approve root merge only at this exact unchanged head after publishing this immutable decision and live full-green
recheck. Root alone publishes/comments/merges under standing human authorization. Reviewer writes only this NEW
gate and local multiline body; no external writes or accepted-document changes. The previous caller prerequisite
has bounded component proof here; D's independent release coverage still remains before item-wide completion.
No full UC003/044 completion, native-browser handoff or real endpoint reachability claim.
