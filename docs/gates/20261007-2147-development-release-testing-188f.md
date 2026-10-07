---
gate: Development → Release testing
job: JOB-20261007-2128-5ced
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 854171d4abc11045a2197559c19cf249acfc243d
  - https://github.com/akmaier/agent-m/pull/188
date: 2026-10-07 21:47 UTC
---
# Development → Release testing: corrected ITM-265 endpoint form

**REGISTER**

## Reason

Rejected: ITM-265's Outcome requires exposing the endpoint setting from Settings with Test, Change and Clear, but
this exact public view has no settings route/listing or controls for that stored setting. The separate unowned
routing handoff cannot implement missing owned-module behaviour. No merge or Outcome amendment is approved.
po-sol implemented none of these tests or code; previous gate188e remains unchanged.

Read the original item, accepted UC-003/MOD-settings-pages/MOD-site-frame/MOD-browser-store/MOD-endpoint-calls,
SPEC Settings and job requirements, Team 2 declaration and Sprint09's exact wiring scope. Reviewed all final three
changed files, the full correction history and live body. Only src/settings-pages/endpoints.mjs, public index and
its new owned unit tests change; no other module, check allowlist, SPEC or architecture changes. The nine tests retain
module/guards/precondition/input/expected results; the original seven cases are unchanged and the two UI cases added
in tests-onlye8e7057 remain unchanged in the correction. Public explain() uses the seven existing frame topics.

The prior notice/explanation failure is corrected: actual rendered DOM now has the owner-specific shared-origin
notice before Save/test and seven details/summary explanations. A stored key starts password-hidden and Show makes
it text. Independently ran the nine endpoint cases plus29 add-product/store/driver cases:38 pass,0 fail,0 skipped/todo.
Actual tests-only correction red37690868536 on e8e7057 fails TST-265008 at absent disclosure and TST-265009 at absent
Show. Exact final run37691231329 is completed SUCCESS: Node113031628207 and Python113031628418. The live body records
all nine actual restored faults, including removed origin notice and disabled Show; previous first-test/red evidence
17eb77a/run37655304396 and corrected public-case red8ad62f6/run37678059080 remains preserved.

Remaining failure-node verification uses the public view and browser-store interfaces in an exact-head archive.
Stored endpoint:campus is positively found by listSettings after providing the real localStorage length/key API to
the existing Map fixture; readSetting and rendering endpoints with params.name recover that exact record. The
public endpoint route positively has entry settings and renders the key plus Show, Save and test, Clear controls.
Actual view.routes is exactly [add-product, endpoints]; view.routes.find(name === settings) is undefined. Therefore
no owned Settings route enumerates the stored endpoint or renders its required Test/Change/Clear line. This is not
an inference from an empty ad-hoc search: the same public interfaces positively find the saved record and existing
route before observing the missing settings route. The first diagnostic's incomplete Storage enumeration fixture
was corrected before drawing this finding; no repository code or assertions were modified by the Product Owner.

Path: endpoints.mjs:108 writes endpoint:<name> → accepted public MOD-browser-store.listSettings lists it with
setUpIn endpoints → MOD-settings-pages.view at index.mjs exports only two guided routes, so the accepted settings
Route interface (three sections, browser-setting line with Test/Change/Clear) has no caller/render implementation
for this stored endpoint. SPEC EVERY SETTING IS REACHED FROM ONE PAGE and A BROWSER SETTING IS TESTED AND CLEARED
WHERE IT IS SHOWN, and the item's explicit Outcome, require that exposure. The existing accepted listSettings,
View/Route and read/write/clear/testEndpoint interfaces already permit the missing owned behaviour; no architecture
or SPEC proposal is needed. Sprint09's between/09-endpoint-settings only connects dashboard entry/registration to
existing module routes and expressly leaves module code to item work. The PR body acknowledges this gap; it cannot
transfer the unimplemented owned requirement to an unowned wiring PR.

The direct form's save-before-one-test, url→baseUrl, absent-key→null, diagnosis, refused-key retention and real Clear
remain working. throughBridge stays stored with an explicit setup requirement and zero direct fallback; neither this
gate nor its correction approves completed UC-003 alternative2a or a withdrawn probe proposal. Current JOB-2128-5ced
records continuation/resume only and explicitly retains missing historical starts; no full historical compliance,
invented timestamps, past-gate amendment, sprint closure or main delivery is asserted.
