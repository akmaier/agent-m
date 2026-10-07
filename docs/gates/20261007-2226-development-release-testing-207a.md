---
gate: Development → Release testing
job: JOB-20261007-2205-8f0b
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 233897376b1017a706eedff6c4664e98fc91b1ea
  - https://github.com/akmaier/agent-m/pull/207
date: 2026-10-07 22:26 UTC
---
# Development → Release testing: ITM-245

**REGISTER**

## Reason

Rejected: do not merge this exact head into sprint/09. ITM-245 requires release tests for every requirement UC-001 realises and a system test that walks the main flow and every alternative. Requirement names in a header do not supply missing assertions. The submitted tests leave concrete required results undetected. The generated-test commit also lacks its required provenance. No production, SPEC or architecture change is required to correct these test omissions.

Checked job: JOB-20261007-2205-8f0b, developer-terra-e, gpt-5.6-terra, write-tests. Decision continuation: JOB-20261007-2224-2e5a, po-sol, gpt-6.1-sol; this records the current verification/publication only. Earlier read-only preparation was not recorded and is not retrospectively claimed as recorded.

## Actual evidence

Read AGENTS.md, SPEC.md, ITM-245, the complete accepted UC-001, Team 2 declarations, accepted MOD-settings-pages, MOD-browser-store, MOD-repository-hosts and MOD-artifact-edits interfaces, the integrated dashboard caller and all changed tests. Read the full PR body, its one commit and both complete new files. Scope is exactly two new test files; no existing tests or helpers changed. The selected prerequisites and approved migration are merged into the base a7888b425142f599a596cfacd505fbcda3fbe64c.

Live final head CI run 37695782688: Node job 113047035978 and Python job 113047036280 both completed SUCCESS. The PR records six individual planted faults and restoration, one for each new case. This write-tests job does not have an invented implementation tests-first/red requirement. Green CI and the reported faults do not establish the missing requirement coverage.

In an archive of the exact head, using the submitted app-harness/public #add route, both submitted files passed 6/6 before faults and 6/6 after restoration. Temporary diagnostic copies were outside the repository. Evidence directory: /private/tmp/po-sol-207-igjy2fwb.

- Token permissions: dashboard-app.mjs #add → MOD-settings-pages products.mjs Step A → MOD-repository-hosts web-links.mjs newToken → rendered token URL → release TST-283 lines 58–65. Known positive has contents/issues/pull_requests/actions/workflows=write and metadata=read, plus product description and target_name=alice. Removing Object.fromEntries(GITHUB_PERMISSIONS) left only name, description, target_name and expires_in. All six submitted cases still passed, including TST-283. Expected: the release assertion rejects that URL. Actual: it checks name and expiry only. See positive.log, fault-permissions.log, node-positive.log and node-permission-fault.log.
- Review layout: trusted dashboard Add click → products.mjs → artifact-edits/layout.mjs missingParts → host.commitFiles → fixture product files → TST-281 line 99 and release TST-286 line 105. Known positive contains all four required docs folders plus SPEC.md and CHANGELOG.md. Suppressing FOLDERS contributions leaves only README.md, SPEC.md and CHANGELOG.md. All six submitted cases still passed. Expected: required use-cases, architecture, approvals and spec-freigaben paths are checked. Actual: only SPEC and changelog presence is checked. See fault-folders.log and node-layout-fault.log; node-restored.log confirms restoration.
- Missing repository: TST-284 world({missing:true}) → public Check → products.mjs missingRepositoryNotice → new-repository link. Known positive renders Create it on the server's page for a new repository. Replacing that anchor by a span No creation link removed the remedy. All six submitted cases still passed: TST-284 checks only no repository/list write. Expected UC-001 2a includes the named reason, creation link and folded choices explanation. See fault-missing-repository-link.log and missing-node-positive/fault/restored.log.

## Complete release checklist

UC-001 realises 24 requirements. All are named across the two release cases, but the following is what their assertions actually establish at this head. A row saying incomplete is a test-coverage finding, not a claim that production lacks the behaviour.

| Requirement | Submitted release evidence / missing result |
|---|---|
| ONE CLICK PER DECISION | TST-286 checks one trusted Add click gives one commit. |
| EVERY STEP EXPLAINS ITSELF | TST-283 counts at least four explanations; it does not associate them with every requested step or check each required explanation. |
| ADDING A PRODUCT CREATES ITS LAYOUT | Incomplete: TST-286 checks only SPEC and changelog; four docs folders can be absent. |
| A MANAGED PRODUCT NEEDS NO PAGES SITE | Named in TST-283, no assertion of product artifacts/review through instance or absence of product-site setup. |
| THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER | TST-286 checks the canonical localStorage address list. |
| NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY | TST-286 checks no instance write. |
| ONE REVIEW LAYOUT FOR EVERY PRODUCT | Incomplete: required docs layout paths are unchecked. |
| THE PRODUCT REPOSITORY IS SELF-SUFFICIENT | Named in TST-283; TST-286 checks only two files exist, not self-sufficient artifact content/layout. |
| EVERY PRODUCT HAS ITS OWN VERSION LINE | Named in TST-283; no assertion of independent product version/changelog content. |
| CONFIGURATION LIVES IN THE BROWSER | TST-286 checks the canonical localStorage product list; strengthen retained product-token/configuration assertions rather than relying on disclosure alone. |
| THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN | Release helper pastes token; TST-283 checks token-page guidance. |
| THE TOKEN LINK IS PREFILLED | Incomplete: only name/90-day expiry asserted; description, owner and permissions unchecked. |
| THE REPOSITORY CHOICE IS SPELLED OUT | TST-283 checks Only select repositories and the product name/nothing else. |
| ONE GITHUB TOKEN SERVES EVERY FEATURE | Missing permission assertions; observed permissions fault passes. |
| A GITHUB PRODUCT USES A TOKEN OF ITS OWN | Guidance is checked, but release should assert stored product key and actual product request authorization as the system test does. |
| A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT | Product name asserted, required description and bounds unchecked. |
| A TOKEN IS SCOPED TO WHAT IT WRITES | Repository choice checked; full scoped permission set unchecked. |
| THE SHARED PAGES ORIGIN IS DISCLOSED | Only owner domain matched; assertion does not check that every other Pages site of that owner can read the store. |
| THE PAGE STATES WHAT IT SENDS WHERE | TST-283 checks GitHub API/product default-branch commit and GitLab own API disclosure. |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK | TST-286 checks synthetic no-write/no-list and trusted positive. |
| A PRODUCT IS NAMED BY ITS ADDRESS | TST-286 checks stored GitHub address. |
| GITLAB PRODUCTS ARE SUPPORTED | Release TST-283 checks guidance only; actual GitLab read/write path is only in system TST-285. |
| A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN | TST-283 checks Maintainer/api/project-token guidance; assert resulting project credential and expiry as appropriate to UC-001. |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT | Release checks disclosure, no request-header/destination assertion; system request filtering is not release coverage and does not assert absence on other destinations. |

## Complete system-flow checklist

- Main flow: TST-281 exercises pasted address, own token, Store and check and trusted Add, canonical settings and one write. It lacks assertions of Step B result, the complete layout/preservation of existing content, commit link and offered switch required by step 5. Use existing public controls/results; no helper or production change needed.
- 3a: own token exercised by TST-282 and instance token by TST-284; verify the actual Step A done/read/write result rather than only eventual write/no-created-product-key.
- 3b: TST-284 stops at keyless Add disabled. It does not walk the independent product-key path to completion with no instance token.
- 4a: TST-284 checks no writes/list only; verify the named unreachable repository and Step A reoffered.
- 5a: TST-284 checks no writes/list only; verify refusal message and Step A reoffered after successful read.
- 2a: actual missing-repository creation-link fault passes; add the reason/link/folded choices checks and return/continue path.
- 5b: TST-282 checks complete-layout zero commit and canonical list; retain these assertions and preexisting content preservation.
- 1a: TST-282 claims another-browser coverage but seeds a product token. Complete fresh-browser flow with empty product list and no token is not walked.
- 3c: TST-285 walks project-token commit/store; verify the project-token expiry/instructions and that no instance credential is used or leaked beyond the issuer.
- 3d: TST-285 checks the not-Maintainer text; the server-offers-no-project-tokens branch and person's broader-token decision are not separately walked/asserted. Tests must follow what UC-001 actually requires and name any genuine view disagreement rather than bypass it.

These are one acceptance checklist for the corrective test package, not newly selected product behaviour or new whole-module implementation obligations.

## Provenance and independence

SPEC AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT requires the commit writing a generated artifact to name Agent M version, participant and model. Commit 233897376b1017a706eedff6c4664e98fc91b1ea has only the headline test: cover UC-001 add-product dashboard flows and an empty body. Its Git author account does not supply developer-terra-e/gpt-5.6-terra/Agent M version. A later PR body or JOB record does not repair the old commit. Preserve that rejected history; a newly generated corrective package must carry proper commit provenance.

Terra-e's Sonnet-e predecessor is included in the independence audit. Available full-ref production history has other participants' positive implementation provenance and no Terra-e/Sonnet-e implementation of the guarded UC-001/migration modules; their earlier 238/243/246 work was independent tests. Current job/PR name Terra-e. PO Sol implemented none of the code or submitted tests. Independence passes; it does not remove the coverage/provenance findings.

## Disposition

Keep the original head, branch, CI and this rejection unchanged. Under the author's explicit continuation instruction, a fresh corrective retry job can name JOB-20261007-2205-8f0b in retries, have a new identifier/actual start and limits fixed before its first round, retain the accepted inputs and findings, and produce only corrected new test files from the same approved sprint base on a new branch/PR. No force push or rewriting the provenance-less commit. The new gate will judge the complete new exact head and actual proofs. No production/architecture/SPEC edit or automatic acceptance follows. Sprint 09 remains open; this head is not done.
