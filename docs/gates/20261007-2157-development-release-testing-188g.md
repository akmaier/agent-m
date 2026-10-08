---
gate: Development → Release testing
job: JOB-20261007-2128-5ced
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 2e07abc81c9230e31f02a849ff5babb2f14ffa12
  - https://github.com/akmaier/agent-m/pull/188
date: 2026-10-07 21:57 UTC
---
# Development → Release testing: ITM-265 final correction

**REGISTER**

## Reason

Rejected: the newly implemented Settings route has no folded explanations for its browser section or endpoint line.
SPEC EVERY STEP EXPLAINS ITSELF and accepted MOD-settings-pages Interfaces require those explanations on the settings
sections/lines too. Correction round3/3 reaches its recorded limit; no fourth correction or merge is authorised by
this gate. ITM-265 remains unfinished. Earlier rejected gates188e/188f and their evidence remain unchanged.

Read original AGENTS/SPEC, selected item, accepted UC-003/settings/frame/store/driver contracts, Team 2 declaration,
current job and previous gate, full live PR body/history and all final four changed files. po-sol implemented none
of the work checked; developer-terra-a tests-only ancestry and developer-terra-c's implementation remain. Only owned
src/settings-pages/index.mjs, endpoints.mjs, settings.mjs and its new named unit test file change. No module outside
this scope, check allowlist, architecture, SPEC or process amendment is present.

The previous missing Settings controls are now provided: index exports settings/add-product/endpoints; settings.mjs
calls public listSettings, filters endpoint:<name> entries, and reads each selected value. The real public Settings
DOM password-hides the selected key, Show reveals it, Test converts url→baseUrl and absent key→null for testEndpoint,
Change uses context.go(endpoints, {name}), and Clear removes only the selected canonical setting then redraws. The
new tests positively verify enumeration, instance isolation, one actual direct request, exact Change navigation,
real removal and preservation of the second endpoint. throughBridge returns a specific setup requirement with zero
direct fetch, no invented probe or fallback. Neither this gate nor the implementation completes UC-003 alternative2a.

Actual tests-only9669b36eda4994d29bb7d4db58e2ad114d2b4cbc holds only test-file additions. Read actual red37692211978:
TST-265010/011/012 all fail at missing public settings Route; Python passes. Final correction preserves all asserted
results, adding the real localStorage length/key enumeration API to its fixture. Exact final run37692556439 is
completed SUCCESS, Node113036102002 and Python113036102346. Earlier first-test/red and correction histories remain
verified at prior gates. Read all12 individual executed/restored faults in the live body; new enumeration, omitted
real test and omitted canonical clear each record their actual failing expectation. TST-265010/011/012 carry unique
module/guards/unit/precondition/input/expected metadata; latest fetched refs define them only in this test file.
Independently ran12 endpoint cases plus29 unchanged add-product/store/driver cases:41 pass,0 fail,0 skip/todo.

Remaining failure-node path: public view.settings → settings.mjs:76 listSettings → :79 endpointLine → :63–69 builds
only title/model/key/Show/Test/Change/Clear/result → :81–85 replaces target with headings and that list. No explain()
or details element is added by this route or its line. Using the complete current public Route in an exact-head
archive, the same DOM detector positively finds7 details in the endpoint form and then positively finds Endpoint:
campus and its Test control in Settings. Actual Settings details count is0; its complete rendered text is
SettingsThis browserEndpoint: campusModel: tiny-modelAPI key ShowTest Change Clear. Expected is a folded explanation
for the section/line asking the person to act, as the original accepted interface expressly states: 'Each section and
line has its folded explanation'. The frame's existing explanation interface and registered endpoint topics already
provide the relevant implementation boundary. Explanations on the different guided form do not appear on this page.
No new architecture or SPEC text is required to meet this existing requirement.

The direct form's owner-specific shared-origin notice, send disclosure, seven expandable explanations and Show/Hide
remain corrected; save-before-one-test, provider/browser diagnosis, refused-key retention, reload, mapping and real
Clear remain working. These green partial results do not establish the complete item's Definition of Done while
the new Settings explanation requirement is absent. No expected assertion is weakened or coverage skipped here.

JOB-20261007-2128-5ced records the current continuation and observed gate handoff with fixed limit3. Missing earlier
start evidence remains acknowledged; no complete historical process compliance or past timestamp is invented.
This decision preserves the actual remaining finding for the person; it does not silently extend the correction
limit, mark the item done, close Sprint09, accept architecture or promote endpoint work into main.
