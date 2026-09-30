# Review dashboard — counter-proof mutations

**MESSUNG** — 2026-09-30, branch `feat/products-in-browser` (on `main` at `c9214cb`), macOS, Node 25,
Python 3. This is the file that `tests/review-core.test.mjs` names for its counter-proofs
(SOFTWARE_MAINTENANCE §4.0a rule 5). The earlier lists stay where they are:
`2026-09-23_github-prefill-and-review-tests.md`, `2026-09-24_one-click.md`,
`2026-09-24_settings-token-products.md`.

**Method.** Each mutation replaced exactly one piece of text in the implementation (or in the check),
both suites ran — `cd tests && python3 -m unittest` and `node --test --test-reporter=tap
tests/*.test.mjs` — and the file was restored. A test is listed as red when the suite reported it
failing. Before and after the whole series, both suites were green.

**A mistake in the method, caught on a known positive.** The first run parsed node's output for TAP
`not ok` lines, but node 25 prints its own format unless told otherwise; every JavaScript failure was
invisible, and eight mutations read as "green". Re-run with `--test-reporter=tap` after checking on one
mutation known to break a JavaScript test (`tokenLinkUrl` without `issues`) that it now shows red.
The table below is from the re-run.

## 1. This change: products in the browser, one token for every feature

SPEC §10 `THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER`, `NO PRODUCT IS NAMED IN THE INSTANCE
REPOSITORY`, `A PRODUCT IS NAMED BY ITS ADDRESS`; §9 `ADDING A PRODUCT CREATES ITS LAYOUT`; §7 `ONE
GITHUB TOKEN SERVES EVERY FEATURE`, `THE TOKEN LINK IS PREFILLED`, `THE REPOSITORY CHOICE IS SPELLED
OUT`, `A TOKEN IS SCOPED TO WHAT IT WRITES`, `A CLEAR IS A REAL CLEAR`.

| Mutation | Red |
|---|---|
| `tokenLinkUrl` without `issues` | `test_token_scope_documented` `test_link_asks_for_exactly_the_one_token_permissions`; `review-core.test.mjs` "THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE" |
| `tokenLinkUrl` also asks for `pull_requests` | the same two |
| `tokenLinkUrl` asks `actions=read` | the same two |
| `repositoryChoiceSteps` names only Contents | `test_token_scope_documented` `test_steps_carry_the_scope`; `review-core.test.mjs` "THE REPOSITORY CHOICE IS SPELLED OUT" |
| `TOKEN_GUIDANCE` without the Actions line | `test_token_scope_documented` `test_guidance_names_minimum_scope_and_reason` |
| `addProduct` does not store the address | `review-core.test.mjs` "THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER", "UC-001 5b" |
| `addProduct` stores the address before the write | `review-core.test.mjs` "UC-001 5a: a refused write adds nothing to the list" |
| `addProduct` without the click guard | `review-core.test.mjs` "UC-001 5b … no click, nothing at all" |
| `addProduct` also commits to the instance | `review-core.test.mjs` "THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER", "UC-001 5b" |
| `clear()` removes only the token | `test_clear_removes_storage` `test_clear_leaves_no_agent_m_key`; `review-core.test.mjs` "THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER" |
| the store adds an address twice | `review-core.test.mjs` "the browser store keeps product addresses beside the token, once each" |
| `parseProductAddress` accepts `http:` | `review-core.test.mjs` "A PRODUCT IS NAMED BY ITS ADDRESS" |
| `parseProductAddress` keeps `.git` | the same |
| `parseProductAddress` takes a GitLab address for a GitHub one | the same |
| `named_products` ignores the ssh form `host:path` | `test_products_folder` `test_address_forms`, `test_counter_proof_a_fixture_that_commits_one_fails` |
| `named_products` scans nothing | `test_products_folder` `test_counter_proof_a_fixture_that_commits_one_fails` |
| a file naming the first address of `FIXTURE_PRODUCTS`, staged in this repository | `test_products_folder` `test_instance_repository_names_no_product` |
| a clone under `products/` with an ssh remote on an invented GitLab host, and a staged file naming that address in its `host/path` form | `test_products_folder` `test_instance_repository_names_no_product` |

Not covered by a test: the wiring in `docs/assets/review-app.mjs` (it runs only in a browser; the suite
checks that it parses and that it touches no storage and calls no `fetch` directly). No browser run
was made for this change.

## 2. Pull request #8: accept in one commit

The mutations are copied from the body of PR #8 ("Counter-proofs (each mutation turned a test red,
then reverted)"). PR #8 did not name the test that turned red; each mutation was therefore applied
again on 2026-09-30, by the method above, and the red tests of that run are listed.

| Mutation | Red |
|---|---|
| skip proposal SHA check | `review-core.test.mjs` "A STALE APPROVAL IS NOT APPLIED — dashboard: …", "A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: …" |
| skip section SHA check | `review-core.test.mjs` "A STALE APPROVAL IS NOT APPLIED — dashboard: …" |
| ignore index order | `review-core.test.mjs` "A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: …" |
| `missingNeeds` finds nothing | `review-core.test.mjs` "A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: …" |
| unshown file tickable | `review-core.test.mjs` "SEVERAL FILES ARE ACCEPTED IN ONE CLICK — …" |
| decision row names the path | `test_apply_approvals` `test_dashboard_writes_what_the_workflow_writes`, `test_record_whose_decision_row_exists_is_skipped`; `review-core.test.mjs` "AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — …" |
| workflow does not skip applied records | `test_apply_approvals` `test_second_run_changes_nothing`, `test_record_whose_decision_row_exists_is_skipped` |
| final newline dropped | `test_apply_approvals` `test_dashboard_writes_what_the_workflow_writes`; `review-core.test.mjs` "replaceSection writes the proposal byte for byte …", "AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — …", "A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: …" |
| files computed without the head | `review-core.test.mjs` "AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — …" |
| planner ignores existing decision rows | `review-core.test.mjs` "an entry already written in the queue's decisions is not written twice" |
| `needs` not computed | `review-core.test.mjs` "A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: …" |

The exact text each mutation replaced (2026-09-30 run):

| Mutation | In | Replaced |
|---|---|---|
| skip proposal SHA check | `review-core.mjs` `planAcceptance` | the `gitBlobSha(prop) !== it.proposalBlob` line removed |
| skip section SHA check | `review-core.mjs` `planAcceptance` | the `gitBlobSha(sectionText(sec)) !== it.sectionBlob` line removed |
| ignore index order | `review-core.mjs` `planAcceptance` | `.sort(…pos…)` removed |
| `missingNeeds` finds nothing | `review-core.mjs` `missingNeeds` | `if (missing.length)` → `if (false)` |
| unshown file tickable | `review-core.mjs` `createReviewSession.tick` | `if (!shown.has(k)) return false;` removed |
| decision row names the path | `review-core.mjs` `planAcceptance` | `decisionRow(it.nr, recName, …)` → `recPath` |
| workflow does not skip applied records | `tools/apply_approvals.py` | `if name in applied_records(qdir):` → `if False:` |
| final newline dropped | `review-core.mjs` `replaceSection` | returns `out` without its final newline |
| files computed without the head | `review-core.mjs` `commitFiles` | `files(head)` → `files("HEAD")` |
| planner ignores existing decision rows | `review-core.mjs` `planAcceptance` | the `applied.has(recName)` line removed |
| `needs` not computed | `review-core.mjs` `sectionForEntry` | `needs: [...before.needs, creator.nr]` → `needs: []` |
