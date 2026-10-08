---
gate: Development → Release testing
job: JOB-20261007-2129-d899
decider: po-sol
role: Product Owner
decision: rejected
on:
  - a02a0fa1b71353e37075f852aec37e0f911a8434
  - https://github.com/akmaier/agent-m/pull/187
date: 2026-10-07 21:34 UTC
---
# Development → Release testing: dashboard migration

**REGISTER**

## Reason

Rejected: the adapter fails to delegate individual product-token clearing and product removal to the canonical store.
This violates SPEC's A CLEAR IS A REAL CLEAR and accepted UC-042 Main flow 2 and Postcondition. No merge is approved.
po-sol implemented none of this work; original developer-terra-b and continuation developer-terra-d authorship remain.

Verified the live PR's exact head and completed SUCCESS Node/Python checks in run37689372222, and read the updated
body's four individual fault proofs, restoration and current job reference. The exact-head migration suite passes
4/4 without skipped/todo cases, including retained TST-268 synthetic-zero authority coverage after accepted ITM-273.
Read the original requirements/contracts and delegation boundary, the adapter and its existing Settings callers,
PR history and changed routing/helper/test coverage. Green CI and those tests do not detect the following regression.

Concrete failure path: docs/assets/dashboard/settings-view.mjs:628 calls store.clearGitHubProductToken(address) →
product-store-adapter.mjs:74 inherits settings-store.mjs:155, which removes only the legacy token map →
product-store-adapter.mjs:91–93 still returns readSetting(store, "github-token:alice/tool") → reopening the adapter
runs syncLegacy():54–62 and restores the legacy token. The corresponding GitLab Clear caller at settings-view:686
also delegates to a legacy-only inherited method. Product Remove at settings-view:716 inherits settings-store:103,
which changes only the legacy product list; adapter:85 continues reading the unchanged canonical list.

Independently exercised the exact-head public adapter with the existing Map-backed localStorage fixture pattern.
Known positive: addProduct("https://github.com/alice/tool") and setGitHubProductToken(address, "fixture-secret")
are read successfully through both the adapter and readSetting(openStore("owner/instance"), "github-token:alice/tool").
After clearGitHubProductToken, actual adapter and canonical values still contain that fixture token; expected is
absence from localStorage and no product token. Reopening productStore restores the legacy map with the same token.
After removeProduct, actual getProducts() still returns the address and canonical token remains; expected is neither.
This observation is at the stored-value failure node, not merely a display assertion. No real credential was used.

JOB-20261007-2129-d899 records the current evidence/delivery continuation only. Its truthful parameters acknowledge
that earlier start evidence was not recorded. SPEC's A JOB IS RECORDED IN ITS PRODUCT REPOSITORY applies to these manual
jobs too; this continuation does not establish complete historical job coverage. No timestamps or earlier gates are
rewritten and no historical compliance is asserted. That gap remains separate from the independently observed code
barrier above. Sprint09 stays open; neither main promotion nor architecture/process acceptance is decided here.
