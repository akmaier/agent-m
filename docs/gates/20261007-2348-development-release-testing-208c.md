---
gate: Development → Release testing
job: JOB-20261007-2229-7d4c
decider: po-sol
role: Product Owner
decision: passed
on:
  - 275cdb77bf5c76e454340eba80cee65972ca2e39
  - https://github.com/akmaier/agent-m/pull/208
date: 2026-10-07 23:48 UTC
---
# Development → Release testing: complete UC-001 corrective tests

**REGISTER**

## Decision and scope

Pass this gate for PR208 at exactly `275cdb77bf5c76e454340eba80cee65972ca2e39`, targeting `sprint/09`. Checked job is JOB-20261007-2229-7d4c, independent deciding job JOB-20261007-2343-7ade. This is the third submitted gate attempt under the original limit of three. It neither resets that limit nor changes the preserved rejected PR207/207a and PR208/208a/208b heads or decisions.

The complete original ITM-245 acceptance now holds: the system tests walk the main flow and every alternative, release assertions cover all24 realised UC-001 requirements, and the remaining seven208b failures are detected at the required public nodes. Only two new module-naming test files change, 198 and235 lines. No old test, helper, production, SPEC, use case or architecture file changes. This write-tests job has no invented implementation-first-red obligation.

Read the original complete AGENTS.md and2135-line SPEC.md, Team2 process/participants and pinned scrum-wip definition, job inputs and fixed retry limit, sprint selection/scheduling, full original ITM-245/274 and UC-001, accepted MOD-settings-pages/browser-store/site-frame/repository-hosts/artifact-edits contracts, original207a/208a/208b gates, the actual dashboard caller, existing add-product/migration tests and harness, both complete submitted files, current complete PR body and history. Current UC/module blobs equal their human approval records; the approvals were committed under akmaier. No human acceptance is made by this gate.

## Concrete path and independent failure-node evidence

`docs/assets/dashboard-app.mjs:510` → public `#add` → `addProduct.render` with `openStore(T.instance)` → `src/settings-pages/products.mjs:470` route.render → address input → renderSteps/paintStepA/stepCSection → real `explain(topic)` details and actual Step-C commit anchor. The controlled servers replace only repository HTTP; public controls and browser-store/host/artifact-edits modules execute normally. No request reaches a paid service.

Exact-head temporary archive `/private/tmp/po-sol-245-final` initially passes all7 submitted cases, zero skip/TODO. Before every fault the original source was restored; each fault is source-only, one at a time. Every restoration passes7/7. Source blob after restoration is `9155c8b407d2caeb9b6b4702ab9a4c7fae06e591`, equal to this head's original products.mjs. Logs have each probe name plus `.log` and `-restored.log`.

| Public transformation/failure node removed | Expected detector at this head | Independently observed actual result |
|---|---|---|
| products.mjs:458 renderSteps → GitHub Step B → explain(product-key) | release283:117 bounds Step B before Step C and requires own-key content | gh-step-b:6PASS/1FAIL at117; restored7PASS |
| products.mjs:291 gitlabStepABody → explain(product-key) | release283:126 bounds GitLab Step A before Step B | gl-step-a:6PASS/1FAIL at126; restored7PASS |
| products.mjs:342 gitlabStepBBody → explain(product-key) | release283:127 bounds GitLab Step B before Step C | gl-step-b:6PASS/1FAIL at127; restored7PASS |
| products.mjs:399 stepCSection → explain(review-layout-commit) | release283:118 requires actual commit-contents explanation | commit-topic:6PASS/1FAIL at118; restored7PASS |
| products.mjs:399 stepCSection → explain(reverting-the-commit) | release283:119 requires ordinary-commit/revert content | revert-topic:6PASS/1FAIL at119; restored7PASS |
| products.mjs:399 stepCSection → explain(the-product-list) | release283:120 requires browser-only/instance-repository content | list-topic:6PASS/1FAIL at120; restored7PASS |
| products.mjs:377 trusted Step C → reviewLayoutCommit result → anchor(the commit,layout.commit.url) replaced with span carrying same text | system281:103 requires actual anchor/href containing the returned product commit head | commit-link:6PASS/1FAIL at103; restored7PASS |

Expected before these corrections was a failing detector;208b observed7PASS despite each removal. Actual now is a failing assertion at the named node, not an inference from CI or metadata. The failure output includes the bounded StepB string without details, the respective removed topic, or an unlinked commit span versus the required href.

Previously closed208a paths independently remain effective: remove githubStepABody's own product-key explanation →283:91 fails (6PASS/1FAIL); remove route.render's repository explanation →283:92 and284:157 fail (5PASS/2FAIL); restore after each →7PASS. The final correction diff adds bounded/content assertions and strengthens the commit-text assertion to its anchor/href; existing permission/layout/key/destination/transaction and alternative-flow expected results remain intact.

## Complete release coverage

These are actual result assertions across283/286/287, not requirement names alone.

| UC-001 realised requirement | Concrete release evidence |
|---|---|
| ONE CLICK PER DECISION |286 one trusted Add produces exactly one product commit. |
| EVERY STEP EXPLAINS ITSELF |283 repository, GitHub A/B, GitLab A/B and each distinct C topic/content; independent removals fail as above. |
| ADDING A PRODUCT CREATES ITS LAYOUT |286 all four docs folders plus SPEC/CHANGELOG present. |
| A MANAGED PRODUCT NEEDS NO PAGES SITE |286 no CNAME/Pages/workflow setup; layout remains in product. |
| THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER |286 canonical localStorage address list. |
| NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY |286 zero instance writes. |
| ONE REVIEW LAYOUT FOR EVERY PRODUCT |286 all six required paths. |
| THE PRODUCT REPOSITORY IS SELF-SUFFICIENT |286 approval-derived-status text and retained product content in its own layout. |
| EVERY PRODUCT HAS ITS OWN VERSION LINE |286 existing product changelog/version text preserved verbatim. |
| CONFIGURATION LIVES IN THE BROWSER |286 canonical product token/list;287 canonical GitLab project token. |
| THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN |283 token-page instructions and expiry field;286 actual pasted token Store/check path. |
| THE TOKEN LINK IS PREFILLED |283 complete name/description/owner/90-day/full exact permission map. |
| THE REPOSITORY CHOICE IS SPELLED OUT |283 Only select repositories, named product, nothing else. |
| ONE GITHUB TOKEN SERVES EVERY FEATURE |283 contents/issues/pull_requests/actions/workflows write, metadata read. |
| A GITHUB PRODUCT USES A TOKEN OF ITS OWN |286 canonical product-specific token and actual product bearer calls, instance credential distinct. |
| A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT |283 exact product name/description and long-name owner-drop/truncation rule. |
| A TOKEN IS SCOPED TO WHAT IT WRITES |283 product repository selection, owner and exact permission set. |
| THE SHARED PAGES ORIGIN IS DISCLOSED |283 full every-site-under-owner-origin disclosure. |
| THE PAGE STATES WHAT IT SENDS WHERE |283 browser/issuer/default-branch/no-instance-write statements. |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK |286 synthetic Add writes no layout/list; trusted positive writes once. |
| A PRODUCT IS NAMED BY ITS ADDRESS |286/287 canonical GitHub/GitLab web addresses in browser list. |
| GITLAB PRODUCTS ARE SUPPORTED |287 actual controlled GitLab read/write/layout transaction. |
| A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN |283 Maintainer/api/expiry instructions;287 canonical project key and expiry. |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT |286 positive bearer request and every bearer destination at product GitHub API;287 GitLab private-token requests with no instance GitHub token. |

## Complete system flow

281 walks the main GitHub Store/check/one trusted Add, public-read/write-boundary result, all layout parts, retained README, canonical own token/list, unchanged instance, returned commit anchor and switch offer.282 starts genuinely empty/keyless with no instance key and walks1a/3b to completion; its complete-layout5b result skips the commit and distinguishes synthetic/trusted Add.284 walks2a missing result and new-repository link, repository explanation, makes the fixture available, returns through successful Check and Add;3a proves the existing instance key with a private repository and completes without inventing another key;4a names the refused repository and reoffers StepA;5a explicitly succeeds at public Check before refused trusted Add, reoffers StepA and writes nothing.285 walks3c project-token Store/check/Add with issuer/canonical storage, plus both separate author-selected3d causes/remedies and the broader-token choice with no implicit repository I/O. No production correction or view bypass supplies these results.

## Provenance and independence

Every generated test-writing commit in this retry,05068a8 through275cdb7, names Agent-M-Version unreleased, Agent-M-Participant developer-terra-e and Agent-M-Model gpt-5.6-terra. Merge6fc65c7 is ordinary inheritance of approved274 from second parent `e6738d9fc765b9b313e72975a893a61acc70528c`; its production diff against that parent is empty. It is not Terra-e implementation. All existing tests/helpers are byte-identical to the sprint base because the entire PR diff is only the two new files.

Refreshed all-ref guarded production/migration history finds no Terra-e or Sonnet-e work. The same query positively finds Terra-a8, Sonnet-a3, Opus-c2, Opus-d2, Sonnet-c4 and Terra-d3 named authorship occurrences; the predecessor rule is included. Decision participant po-sol authored none of the checked code or tests. Release-author and gate independence hold.

## Verification and disposition

Live exact-head CI37703631545 is SUCCESS: Python job113072719524 and Node job113072719772. Independent restored focused run is7PASS/0FAIL. Whole suites were independently repeated in the pristine exact-head Git worktree using the existing workflow callers; Node:851 tests,843PASS,0FAIL,0skip,8existingTODO; Python:397 tests,OK with5skip and6expected failures. Logs `/private/tmp/po-sol-245-real-node.log` and `/private/tmp/po-sol-245-real-python.log`. The archive alone is unsuitable for whole-repository checks that invoke git: the Node traceability check at tests/release-sprint-02-d-traceability.test.mjs:321 fails git ls-files without .git, while its known-positive exact-head worktree run passes. The archive's similar Python repository-metadata failures are fixture limitations, not product findings.

Scrum Master may merge only the named exact head into sprint/09 after checking live green CI and this recorded decision. This gate approves neither main promotion, a release tag, acceptance of a release report, whole-sprint closure nor any SPEC/use-case/architecture acceptance. Existing8TODO,5skip and6expected-failure limitations remain visible.
