---
gate: Development → Release testing
job: JOB-20261007-2149-e78d
decider: po-sol
role: Product Owner
decision: passed
on:
  - 0528e3771bddddd205c521187d8bd7464a81b2a8
  - https://github.com/akmaier/agent-m/pull/206
date: 2026-10-07 22:01 UTC
---
# Development → Release testing: ITM-244 independent notification tests

**REGISTER**

## Reason

Passed: merge only this exact ITM-244 head into sprint/09. po-sol wrote none of the tests or implementation checked.
Original developer-sonnet-e and current developer-terra-e are the same predecessor lineage for independence; both
have only independent UC-047 test work. Scrum Master executes the exact-head merge, not the Product Owner.

Read original AGENTS/SPEC test/gate rules, Team 2 declarations, selected ITM-244, accepted UC-047 and its notification,
progress/store/host contracts, current job record, live full PR body/history and both complete changed test files.
Only ITM-238's selected system-uc-047 and release-sprint-07-uc-047 test files change. No implementation, harness,
module contract, architecture or SPEC change is present. Their F3 TODO markers are removed, fixture products now use
the canonical instance prefix and product token, and TST-279/280 name unique identifiers, MOD-notifications, guards,
system/release levels, precondition/input/expected result. Latest fetched refs define each only in its test file.
As independent system/release tests adding no behaviour, the tests-only first-commit red exception applies.

Rechecked all-ref production-path commit provenance across src and docs/assets, with known-positive terra/sonnet
other-developer implementation matches, and no terra-e/sonnet-e implementation matches. Sprint07 names sonnet-e on
independent ITM-238; Sprint08 and original test provenance name it on independent ITM-243; Sprint09 reserves its
successor for tests only. The inherited migration is terra-b/terra-d, notification code and wiring are other authors,
and the settings/store/frame/host behaviour is likewise not E's implementation. The new current job pins Terra-e's
assignment. Earlier authorship is preserved, so this is independent release evidence, not an implementer's own check.

Concrete path: canonical fixture agent-m:<instance>:products → real openDashboard review page → notifications/checks.mjs:74
readSetting(products) → connectProduct:60–64 reads github-token:alice/thesis-tool → public repository-hosts connect →
product fixture receives Authorization: Bearer <fabricated product token>. Tests retain the positive product-request
assertion and add/repair the actual header observation. The release case replaces an incorrect token-in-request-URL
observation with Headers(init.headers).get(Authorization), retaining its required own-token result while observing the
correct transport; a credential in a URL would contradict the requirement. No expected UC-047 result is weakened.

Independently ran the exact-head two suites:23 pass,0 fail,0 skip/todo. Independently planted the recorded fault
checks.mjs products=[] in a temporary exact-head archive: TST-279 failed 'the product this browser keeps is reached by
the check — none of its requests arrived'; TST-280 failed 'the product's own server is reached at all'. Restored the
original source blob7eb18a3de992ba9d9885256d0bf64a78ea9715ba and both cases pass again. Each enabled case therefore has
its actual separate failing assertion, despite the shared fault. The live PR records the developer's executed and
restored version of the same counter-proof. No planted fault was committed.

At the request boundary independently observed the known-positive product Authorization among8 fixture requests;
the fabricated token appears in neither URL nor body, and every request carrying it targets its own GitHub API/raw
issuer origin. This observation is bounded to the fixture flow, not a claim of real-browser measurements or full
UC-047 delivery. F1/F2 expectations and other existing notification assertions stay unchanged and pass.

Live final CI37693038560 is completed SUCCESS on the named exact head: Node113037716945 and Python113037716684.
The full Node run retains8 unrelated TODO cases: UC-006 R2, UC-042 R3, UC-008 A3/A4 and record/approval findings G1/G2
in each of their two test locations. They are not skipped, erased or resolved by this item. This gate establishes
F3's canonical product/token coverage only; UC-047 release-report remainder and real-browser evidence remain separate.

JOB-20261007-2149-e78d records this job's inputs/runtime/start/limit and observed gate handoff; its append-only minute
correction is preserved. Historical gaps in other jobs are not retrospectively erased by this record. Main promotion
requires a separate green exact-head PR/gate. No main merge, sprint closure, process change or architecture acceptance
is decided here, and any changed PR head requires another independent gate.
