---
gate: Release testing → Sprint review
job: JOB-20261008-0012-6e20
decider: po-sol
role: Product Owner
decision: passed
on:
  - cac65789df758c86907ee0cd42308afc78536f4e
  - https://github.com/akmaier/agent-m/pull/216
date: 2026-10-08 00:16 UTC
---
# Release testing → Sprint review: Sprint 09

**REGISTER**

## Decision and original basis

Passed for the complete selected Sprint 09 increment on the exact head above. The pinned scrum-wip gate requires
release tests written by a participant other than the implementer and green on the sprint branch. SPEC:1418 and
1598 govern test and gate independence. po-sol wrote neither the guarded implementation nor its release tests.

Read original AGENTS.md, the complete SPEC in the preceding whole-corpus review, Team 2 declarations, pinned model,
UC-041, current job and closing job originals, complete sprint selection and current closing sections. Personally
read all 46 use cases plus README and all 70 architecture originals in JOB 2338; current original SPEC blob
1de56e76de63bfe5f3f4bb98820adad801041def, UC tree 108d9ff406b1386f60e9bbe78607f1864b9457dd and architecture
tree 72079a3affe0be70b398afe89fa32c6ad063364a are unchanged. Read each selected item's passed gate, complete current
PR body, full 23-path source/test diff and branch history. Bounded diff reads covered all 2689 lines with truncation
repaired by overlapping rereads. The independent earlier item proofs remain evidence, not newly claimed executions.

## Complete selected-item and release review

All eleven effectively selected items are merged and ancestral to the reviewed sprint parent d9e0133; the later
reconciliation changes none of their test blobs. Their accepted item gates and independent release coverage are:

| Selected item / merged PR | Passed gate original | Independent release path |
|---|---|---|
|207 /172|20261007-1543-development-release-testing-172a.md|245: UC-001 product-token/layout/transaction guards|
|273 /203|20261007-2121-development-release-testing-203a.md|245: synthetic zero-write and trusted one-write positives|
|259 /173|20261007-1552-development-release-testing-173a.md|270: canonical browser-local save, reload, isolation and Clear|
|260 /178|20261007-1646-development-release-testing-178a.md|270: actual configured requests, credentials and browser diagnosis|
|264 /177|20261007-1552-development-release-testing-177a.md|270: rendered destination disclosure and actionable alternatives|
|272 /199|20261007-2059-development-release-testing-199b.md|270: actual Settings discovery and named Change through canonical store|
|265 /209|20261007-2238-development-release-testing-209a.md|270: actual Configure/Test/Change/Clear and optional-key flows|
|274 /210|20261007-2255-development-release-testing-210a.md|245: distinct GitLab causes, remedies and personal-token choice|
|244 /206|20261007-2201-development-release-testing-206a.md|TST279/280: actual product issuer requests and token headers|
|245 /208|20261007-2348-development-release-testing-208c.md|TST281–287: complete UC-001 main/alternatives and 24 requirements|
|270 /214|20261007-2359-development-release-testing-270b.md|TST292001–292011: direct UC-003 and all six requirements|

Gate filenames in the table reside in docs/gates/. The reviewed final release/system blobs equal their passed item
heads byte-for-byte:245 at 275cdb7,270 at f5f8854,244 at 0528e37. Current final blob identities:

| Test file | Blob |
|---|---|
|system-uc-001-add-product.test.mjs|ddb9312e225c7f2a6c9a406a54ead9c516e68f84|
|release-sprint-09-uc-001-add-product.test.mjs|5405dba5d2cc7ba3704e42d796941e27cd606624|
|system-uc-003-direct-endpoint.test.mjs|4cfc9fe03562fb24e98ed0eb702e78d0d80c7b9f|
|release-uc-003-direct-endpoint.test.mjs|fbff7157ea8dda1bccb3e6c97d32cf3b4f48bfb3|
|system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs|5d9e8e47abd6d23c0a9150983e0635ed87d763a4|
|release-sprint-07-uc-047-notifications.test.mjs|57eb549bb6861fee91295a5ac6d5e8a790b8ca84|

The release author Terra-e and predecessor Sonnet-e implemented none of their guarded behaviour. A fresh nonmerge
history query over settings-pages/browser-store/site-frame/endpoint-calls/notifications/repository-hosts and dashboard
composition positively finds 19 named other-implementer occurrences and zero E occurrences. The earlier passed gates
also retain broader all-ref provenance checks; normal inheritance merges are distinguished from implementation.
The current E writing commits retain unreleased/Terra-e/gpt-5.6-terra trailers; older original provenance remains
visible rather than being retroactively fabricated.

Concrete evidence remains at the actual failure nodes. UC-001: dashboard-app.mjs:510 → #add → products.mjs:470
route.render → real steps/layout commit;208c independently removed each seven required topics/link, observed the
named failing assertions and restored 7/7. UC-003: actual Settings Configure → endpoints.mjs:108 writeSetting →
store.mjs:20 prefixOf(instance) → configured request;270b independently executed all 11 case faults, plus Show/Bridge
retention checks and restored 11/11. Its two actual callers share one storage object and query their active documents;
fixed-first-prefix fails release:83 at null versus other-model. UC-047: checks.mjs:74 readSetting(products) →
connectProduct:60–64 → issuer request;206a's empty-products fault failed both 279/280, restored 23/23. The test fixture
observes Authorization at the transport boundary, rather than putting credentials into URLs. No counterproof is
required anew for unchanged inherited cases, and no new implementation-first-red condition is invented here.

## Live complete CI and limits

Run https://github.com/akmaier/agent-m/actions/runs/37706532457 is completed SUCCESS on the exact approved head.
Node 113082116474 completed 00:13:18 UTC: 938 tests, 930 pass, 0 fail, 0 skip, 8 existing TODO.
Python 113082115752 completed 00:13:36 UTC: 397 tests run,OK with 5 skips and 6 expected failures. The live logs were read;
the existing workflow runs node --test tests/*.test.mjs and cd tests && python3 -m unittest -v. This is final combined
CI, not substitution of an earlier item run. No TODO/skip/expected failure was erased or claimed resolved.

Only direct UC-003 is delivered. throughBridge:true remains stored with setup-required text and zero direct request;
local2a, paired runnable Bridge, trusted HTTPS composition and real-browser measurements remain incomplete.
244 establishes UC-047 F3, not the whole use case or a Safari/OS notification measurement. Controlled harness replies
claim no paid-provider result; no paid call was made. All selected release evidence meets the assigned gate.

Live head and both SUCCESS checks reconfirmed at 2026-10-08 00:16:12 UTC before publication.
