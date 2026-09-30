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

## 3. The settings page (UC-042), branch `feat/settings-page` (on `main` at `166f6d8`)

SPEC §7 `EVERY SETTING IS REACHED FROM ONE PAGE`, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`,
`A STORED SECRET IS HIDDEN UNTIL SHOWN`, `A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`, `AN EXPIRED TOKEN IS NAMED AND ITS
RENEWAL LINKED`, `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY`, `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS`,
`AN EXPORT STATES THAT IT CONTAINS SECRETS`, `AN EXPORT CAN BE LOCKED WITH A PASSPHRASE`; §14 `PSEUDONYMISATION IS ON
UNLESS A PRODUCT SWITCHES IT OFF`, `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS`, `A PERSON IS NAMED BY ACCOUNT OR
WITH CONSENT` (the file format and the consent tick; the check of generated artifacts is not built).

Same method as above: a script replaced exactly one text, ran `cd tests && python3 -m unittest` and `node --test
--test-reporter=tap tests/*.test.mjs`, collected every `FAIL:`/`ERROR:` and `not ok` line, and restored the file. It
asserted that both suites were green before the first and after the last mutation.

| Mutation | In | Red |
|---|---|---|
| store key without a place on the page (fixture: a 4th key) | `settings-store.mjs` | `test_settings_page` test_counter_proof_a_key_without_a_place_fails; `test_settings_page` test_every_key_the_store_writes_has_a_place_on_the_page |
| expiry row loses its place (data-setting-key) | `review-core.mjs` | `test_settings_page` test_counter_proof_a_key_without_a_place_fails; `test_settings_page` test_every_key_the_store_writes_has_a_place_on_the_page |
| products row without Clear | `review-core.mjs` | `test_settings_page` test_each_browser_setting_has_test_and_clear |
| secret field always type=text | `review-core.mjs` | `test_settings_page` test_a_stored_secret_is_rendered_hidden |
| Show does not reveal (always password) | `review-core.mjs` | `test_settings_page` test_counter_proof_after_show_it_appears_in_full |
| state line shows the last 4 characters | `review-core.mjs` | `test_settings_page` test_the_state_line_names_the_expiry; `test_settings_page` test_a_stored_secret_is_rendered_hidden |
| warning from 15 days (> instead of >=) | `review-core.mjs` | `test_settings_page` test_warning_from_fourteen_days_before |
| defaultExpiry 30 days | `review-core.mjs` | `test_settings_page` test_default_expiry_is_the_links_90_days |
| route() without the banner | `review-app.mjs` | `test_settings_page` test_the_banner_on_every_page_carries_renew |
| setup stores the token without its date | `review-app.mjs` | `test_settings_page` test_storing_a_token_asks_for_its_expiry |
| tokenRefusal treats 403 as expired | `review-core.mjs` | `review-core.test.mjs` "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link" |
| fetchText error without status | `review-core.mjs` | `review-core.test.mjs` "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link" |
| renew text without Regenerate token | `review-core.mjs` | `test_settings_page` test_the_banner_on_every_page_carries_renew; `review-core.test.mjs` "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link" |
| export without secrets (token dropped) | `review-core.mjs` | `review-core.test.mjs` "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting" |
| locked export also carries the settings in clear | `review-core.mjs` | `review-core.test.mjs` "AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing" |
| fixed salt | `review-core.mjs` | `review-core.test.mjs` "AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing" |
| low iteration count | `review-core.mjs` | `review-core.test.mjs` "AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing" |
| a wrong passphrase yields an empty import instead of a refusal | `review-core.mjs` | `review-core.test.mjs` "AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing" |
| import overwrites what this browser has | `review-core.mjs` | `review-core.test.mjs` "UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both" |
| putEntries stores unknown keys | `settings-store.mjs` | `test_settings_page` test_the_store_writes_no_key_but_its_named_ones |
| export notice does not name the token | `review-core.mjs` | `test_settings_disclosure` test_the_notice_names_each_secret_and_what_it_grants |
| passphrase notice without 'cannot be recovered' | `review-core.mjs` | `test_settings_disclosure` test_a_forgotten_passphrase_is_stated_before_saving |
| saveExport also commits the file | `review-app.mjs` | `review-core.test.mjs` "the settings export is saved as a file only — never committed, fetched or put into an address" |
| pseudonymisation off without acknowledgement | `review-core.mjs` | `review-core.test.mjs` "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice" |
| pseudonymisation stored in localStorage instead | `settings-store.mjs` | `test_settings_page` test_the_store_writes_no_key_but_its_named_ones; `test_settings_page` test_the_store_has_no_product_setting |
| off notice without the public warning | `review-core.mjs` | `test_settings_disclosure` test_a_public_repository_is_warned_of_publication |
| off notice without 'non-public' | `review-core.mjs` | `test_settings_disclosure` test_the_notice_states_what_follows |
| pseudonymisationOn reads a missing line as off | `review-core.mjs` | `review-core.test.mjs` "PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting"; `review-core.test.mjs` "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice" |
| switching on keeps the off line | `review-core.mjs` | `review-core.test.mjs` "PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting"; `review-core.test.mjs` "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice" |
| collaborator without consent accepted | `review-core.mjs` | `review-core.test.mjs` "+ Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off" |
| collaborators formatted without @ parsing (account column dropped) | `review-core.mjs` | `review-core.test.mjs` "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly"; `review-core.test.mjs` "collaborators are saved by one commit of docs/collaborators.md, on a click" |
| duplicate collaborator accepted | `review-core.mjs` | `review-core.test.mjs` "+ Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off" |

Checked in a browser (Chrome, page served from `docs/` on 127.0.0.1, instance falling back to `akmaier/agent-m`):
with an invalid token stored, the line at the top named the GitHub token as refused with *Renew*, the token row showed
✗ refused, the stored token was in a password field and in full after *Show*; without a token, the product section read
`akmaier/agent-m` and showed pseudonymisation *on (the default)*, no collaborators, read-only. Not run in a browser: a
commit of `docs/settings.md` or `docs/collaborators.md` (no token was used), the export download and the import.

## 4. The use-case key `area` (was `stage`), branch `feat/rename-stage-to-area` (on `main` at `52c4859`)

Front-matter key `stage:` → `area:` in every `docs/use-cases/UC-*.md`; UC-010 and UC-011 renamed to `…-a-job-…`; the
check, the dashboard column and the label of status *approved* follow. A record in `docs/approvals/` names a use case
by the file name it had when accepted, so `tests/artifact_checks.py` `record_problems` now accepts a missing path
when a use case with the same ID exists (`renamed_use_case`). Same method as §3.

| Mutation | In | Red |
|---|---|---|
| the check reads `stage` again instead of `area` | `artifact_checks.py` | `test_usecase_fields` test_counter_proof; `test_usecase_fields` test_every_use_case_is_complete |
| the check does not report a `stage` key | `artifact_checks.py` | `test_usecase_fields` test_the_old_key_stage_is_named |
| a use case with `stage:` instead of `area:` (UC-042) | `UC-042-manage-settings.md` | `test_usecase_fields` test_every_use_case_is_complete |
| a README link still naming the old UC-010 file | `README.md` | **none — green.** No check reads the links of `docs/use-cases/README.md`; none was added (CLAUDE.md §6a.4, no unrequested check). The links were changed by hand and read back. |
| the dashboard column reads fields.stage | `review-app.mjs` | `review-core.test.mjs` "the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere" |
| the column header says Stage | `review-app.mjs` | `review-core.test.mjs` "the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere" |
| the old label of status approved | `review-app.mjs` | `review-core.test.mjs` "status 'approved' is described truly for both routes — the dashboard's own commit and the workflow" |
| a record of a renamed use case is refused (old check) | `artifact_checks.py` | `test_approval_records` test_a_record_of_a_renamed_use_case_stays_valid; `test_approval_records` test_every_record_is_well_formed |
| renamed_use_case accepts any ID | `artifact_checks.py` | `test_approval_records` test_a_record_of_a_renamed_use_case_stays_valid; `test_approval_records` test_counter_proof |

## 5. GitLab products, branch `feat/gitlab-products` (on `main` at `6547338`)

SPEC §10 `GITLAB PRODUCTS ARE SUPPORTED`, `A GITLAB PRODUCT IS WRITTEN WITH A TOKEN`, `A PRODUCT IS NAMED BY ITS ADDRESS`,
`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`, `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL`, `A STALE APPROVAL IS
NOT APPLIED`, `SEVERAL FILES ARE ACCEPTED IN ONE CLICK`, `A QUEUE IS ACCEPTED IN ITS ORDER`, `THE DASHBOARD KEEPS ITS PRODUCTS IN
THE BROWSER`, `ADDING A PRODUCT CREATES ITS LAYOUT`; §7 `A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`, `A TOKEN GOES ONLY TO
THE SERVER THAT ISSUED IT`, `A STORED SECRET IS HIDDEN UNTIL SHOWN`, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`,
`AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED`, `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS`.

Same method as §3. The script first ran the known positive of this file's method (`tokenLinkUrl` without `issues`), which
turned `test_token_scope_documented` and the JavaScript test of the prefilled link red, and asserted that both suites were
green before the first and after the last mutation.

| Mutation | In | Red |
|---|---|---|
| GitLab token sent anywhere on its server (prefix check → origin check) ¹ | `review-core.mjs` | review-core.test.mjs "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else" |
| the GitHub token also sent to a GitLab product's API | `review-core.mjs` | `test_destination_disclosure` test_disclosed_destinations_match_where_the_token_may_go; review-core.test.mjs "fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)"; review-core.test.mjs "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else" |
| fetchText reaches any origin when a GitLab product is named ¹ | `review-core.mjs` | review-core.test.mjs "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else" |
| fetchText without the token-in-URL check | `review-core.mjs` | `test_no_credential_in_url` test_fetch_refuses_a_url_that_contains_the_token; review-core.test.mjs "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else" |
| parseProductAddress refuses GitLab again | `review-core.mjs` | `test_settings_page` test_expiry_warned_and_refusal_named; `test_settings_page` test_one_line_per_token_with_test_change_clear; review-core.test.mjs "A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser"; review-core.test.mjs "A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address"; review-core.test.mjs "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else"; review-core.test.mjs "GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit"; review-core.test.mjs "GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present"; review-core.test.mjs "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step"; review-core.test.mjs "GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing"; review-core.test.mjs "GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head"; review-core.test.mjs "GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit"; review-core.test.mjs "GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed"; review-core.test.mjs "ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub"; review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Developer, scope api, expiry"; review-core.test.mjs "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page"; review-core.test.mjs "the dashboard is opened on a GitLab product by its address; its files link to GitLab" |
| parseProductAddress keeps what follows /-/ | `review-core.mjs` | review-core.test.mjs "A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address" |
| parseProductAddress accepts a credential in the address | `review-core.mjs` | review-core.test.mjs "A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address" |
| gitlabSnapshot reads only the first page | `review-core.mjs` | review-core.test.mjs "GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit" |
| gitlabSnapshot reads the tree of the branch, not of the pinned commit | `review-core.mjs` | review-core.test.mjs "GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit" |
| gitlabReadFile: a missing file throws instead of null | `review-core.mjs` | review-core.test.mjs "GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit" |
| update without last_commit_id | `review-core.mjs` | review-core.test.mjs "GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present"; review-core.test.mjs "GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head" |
| every action is an update | `review-core.mjs` | review-core.test.mjs "GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present"; review-core.test.mjs "GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head"; review-core.test.mjs "ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub" |
| no second read of the branch before the commit | `review-core.mjs` | review-core.test.mjs "GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing" |
| expectBlob not compared on GitLab | `review-core.mjs` | review-core.test.mjs "GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing" |
| the commit is forced | `review-core.mjs` | review-core.test.mjs "GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present" |
| the files are computed from the branch name, not the head | `review-core.mjs` | review-core.test.mjs "GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head" |
| a newer parent is not compared | `review-core.mjs` | review-core.test.mjs "GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed" |
| warning names every changed file, not only those read | `review-core.mjs` | review-core.test.mjs "GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed" |
| commitFilesGitLab without its click guard | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step" |
| writeFiles accepts the GitHub token for a GitLab product | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step" |
| writeRoute offers GitHub's web page for GitLab | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step" |
| addProduct (GitLab) stores the address before the write | `review-core.mjs` | review-core.test.mjs "ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub" |
| token steps ask for role Maintainer | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Developer, scope api, expiry" |
| token page path wrong | `review-core.mjs` | `test_settings_page` test_one_line_per_token_with_test_change_clear; review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Developer, scope api, expiry"; review-core.test.mjs "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page" |
| 3d: gitlab.com treated as self-managed | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Developer, scope api, expiry" |
| 403 on GitLab not explained | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Developer, scope api, expiry" |
| tokenRefusal ignores the GitLab product | `review-core.mjs` | review-core.test.mjs "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page" |
| expiry warning names the GitHub token for GitLab | `review-core.mjs` | review-core.test.mjs "AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page" |
| GitLab token rendered in clear | `review-core.mjs` | `test_settings_page` test_the_token_is_hidden_until_shown |
| GitLab line without Test | `review-core.mjs` | `test_settings_page` test_one_line_per_token_with_test_change_clear |
| GitLab line without renewal link | `review-core.mjs` | `test_settings_page` test_one_line_per_token_with_test_change_clear |
| GitLab line state ignores refusal | `review-core.mjs` | `test_settings_page` test_expiry_warned_and_refusal_named |
| import overwrites a GitLab token this browser has | `review-core.mjs` | review-core.test.mjs "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product" |
| import drops GitLab tokens | `review-core.mjs` | review-core.test.mjs "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product" |
| export notice silent about GitLab tokens | `review-core.mjs` | review-core.test.mjs "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product" |
| deriveTarget ignores ?product= | `review-core.mjs` | review-core.test.mjs "the dashboard is opened on a GitLab product by its address; its files link to GitLab" |
| webFileUrl links GitHub for GitLab | `review-core.mjs` | review-core.test.mjs "the dashboard is opened on a GitLab product by its address; its files link to GitLab" |
| store: removing a product keeps its token | `settings-store.mjs` | review-core.test.mjs "GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear" |
| store: last cleared token leaves an empty map | `settings-store.mjs` | review-core.test.mjs "GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear" |
| store: token for one project returned for another | `settings-store.mjs` | review-core.test.mjs "GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear"; review-core.test.mjs "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product" |
| store: GitLab tokens not in the export | `settings-store.mjs` | review-core.test.mjs "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product" |

¹ Green in the first run. Each is a second guard that the test reached only behind the first: the origin gate of `fetchText`
was exercised only with a token, whose own check refused first; `authHeaders` (the only guard on the POST of a commit) was not
asserted for another path on the same server. Negatives were added to "A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — …"
(a GitLab auth without token to another origin, another project and a non-project path; `authHeaders` for another project and
`/api/v4/user` on the same server), and the two mutations were run again: both red, as listed.

**Against a real server (read only, anonymous, no token).** `gitlab.com`, public project `gitlab-org/gitlab-test`:
`gitlabProject`, `gitlabSnapshot` and `gitlabReadFile` of `review-core.mjs` under node 25 read default branch `master`, pinned
commit `ddd0f15ae83993f5cb66a927a28673882e99100b`, 40 blobs; for 12 files the git blob SHA computed from the raw text equalled
the tree's `id` (12/12); a missing path read as `null`. In Chrome, the dashboard served from 127.0.0.1 with
`?product=https://gitlab.com/gitlab-org/gitlab-test` read the same commit (cross-origin, allowed by GitLab's
`Access-Control-Allow-Origin: *`), showed *Read-only: no token for this GitLab project*, and stored nothing in
`localStorage`. The GET responses carry `Access-Control-Expose-Headers` with `Link`, `X-Next-Page`, `X-Gitlab-Blob-Id` and
others; the dashboard pages the tree without them (until a page is shorter than `per_page`). Nothing was written to any real
GitLab project, and no token was used against one.

**In Chrome against a mock of the GitLab API** (a page in the scratch directory that replaced `fetch` for one invented origin
before loading the unchanged `review-app.mjs`): UC-001 3c — notice, paste, *Store and check* (the project read with
`PRIVATE-TOKEN`, role shown as Developer), *Add product* — one commit with the one missing layout file, address in the list;
UC-006 — *Accept* on a SPEC entry: one commit with `update SPEC.md` (`last_commit_id` = the head read) and `create` for the
record and `entscheidungen.md`, the entry then *in SPEC*; no request carried `Authorization`. Without a token, on a readable
project: no *Accept*, no *Save*, no GitHub link, a link to the token step. A refused token (401): the line at the top named
the GitLab project token and linked `<project>/-/settings/access_tokens`; the settings line showed ✗ refused; the stored token
was in a password field. The GitHub instance view (real GitHub, no token) was unchanged.

**What GitLab guarantees for a commit, read in its source** (gitlab-org/gitlab and gitlab-org/gitaly on gitlab.com,
2026-09-30): `POST /projects/:id/repository/commits` has no parameter that makes the write conditional on the branch still
being at the commit the client read. `start_sha` on an existing branch is refused unless `force` is set
(`app/services/commits/create_service.rb` `validate_branch_existence!`), and `force` replaces the branch history. Rails sets
Gitaly's `expected_old_oid` to a head it reads itself (`app/models/repository.rb` `commit_files`). An `update` action with
`last_commit_id` is refused when the file's last commit on the branch differs from its last commit at `last_commit_id`
(`app/services/files/multi_service.rb` `validate_file_status!`, `files/base_service.rb` `file_has_changed?`); a `create` is
refused when the path exists (`internal/gitaly/service/operations/commit_files.go`, `ErrEntryExists`). `commitFilesGitLab`
therefore writes existing files with `last_commit_id` = the head it read, new files with `create`, reads the head again just
before the POST, and compares GitLab's reported parent with that head afterwards. A file that is only read (a use case being
accepted, a proposal) and changed by a commit landing between that second read and GitLab's write is not refused — it is
reported after the commit (`acceptItems` → `warning`).

## 6. The last accepted text, branch `feat/diff-last-accepted` (on `main` at `60682d4`)

SPEC §10 `A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`, `AN APPROVAL NAMES THE EXACT TEXT`, `STATUS IS DERIVED FROM THE
RECORDS` (UC-008 2a).

Same method as §3, run by a script that first ran the known positive (`tokenLinkUrl` without `issues`: red) and asserted both
suites green before the first and after the last mutation. The new tests were also run once against the unchanged
`docs/assets/` of `main`: red (the core exported none of the new functions).

| Mutation | In | Red |
|---|---|---|
| the first record of the identifier is compared, not the one committed last | `review-core.mjs` | review-core.test.mjs "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared"; "… — a renamed file finds its records by identifier"; "… — GitLab: its commits and blob endpoints, its own token only" |
| the record committed first is taken (sort ascending) | `review-core.mjs` | the same three |
| records matched by path, not by identifier | `review-core.mjs` | review-core.test.mjs "reviewedId: a reviewed file's identifier from its path — the same for a renamed file"; "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier"; "… — GitLab: its commits and blob endpoints, its own token only" |
| SPEC records counted as records of the identifier (kind not checked, the proposal taken as file) ² | `review-core.mjs` | review-core.test.mjs "reviewedId: a reviewed file's identifier from its path — the same for a renamed file" |
| the blob's hash is not checked against the record | `review-core.mjs` | review-core.test.mjs "the accepted text is the exact text its record names — a blob that does not hash to it is refused" |
| a record's blob is used unchecked in the URL | `review-core.mjs` | the same |
| commit dates read at the branch, not at the pinned commit | `review-core.mjs` | "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared"; "… — GitLab: its commits and blob endpoints, its own token only" |
| the author date is used instead of the commit date (GitHub) | `review-core.mjs` | "… — with two records, the older text is not the one compared"; "… — a renamed file finds its records by identifier" |
| GitLab: the blob is read through the GitHub endpoint | `review-core.mjs` | "… — GitLab: its commits and blob endpoints, its own token only" |
| diffHtml shows every line as unchanged | `review-core.mjs` | "… — one changed line shows exactly that line" |
| the diff panel is placed below the text | `review-app.mjs` | "the dashboard shows the last accepted text above a changed use case, with the core's diff" |

² The first form of this mutation (`r.kind !== "spec" && r.file` → `(r.file || r.proposal)`) stayed green, and rightly: the
identifier was still read from `r.file`, so the mutant behaved exactly like the original. Replaced by the form above, which does
change behaviour; the test's SPEC record was given a proposal whose file name looks like a use case's, so that the mutant can
match it.

**Against the real repository (read only, 2026-09-30).** `lastAccepted`, `changedLines` and the status derivation of
`review-core.mjs`, under node 25 against `akmaier/agent-m` on GitHub (tree through the API, files from
`raw.githubusercontent.com`), pinned to `6547338` — the state in which queue 2026-09-30's rationale 03 counts ten changed use
cases: exactly ten use cases were not accepted and had records (UC-001–008, UC-010, UC-016), and each differed from its last
accepted text by one line pair, `- stage: …` / `+ area: …`. UC-008 (two records) was compared with `UC-008-2c687fc8a047.md`,
committed 2026-09-30T13:05:52Z, not with `UC-008-30feaff93c66.md` of 2026-09-24 — as `git log` of the local clone gives it.
UC-010, renamed from `…-run-a-stage-…` and therefore *open* by path, was found by its identifier and compared with
`UC-010-bf542f93115c.md` (2026-09-30T13:02:39Z), not `UC-010-b324416e500b.md` (2026-09-24). On `main` at `ba39a87`, UC-008 shows
in addition the lines queue 2026-09-30 added to it (`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT` in `realises`,
alternative flow 2a). In Chrome, the dashboard served from 127.0.0.1 with `?ref=6547338…#uc/UC-010` showed the panel
*Changed since it was last accepted* above the text with exactly the `area`/`stage` pair marked.

## 7. Jump host and remote sessions; GitLab role Maintainer; collaborators by server — branch `feat/jump-host-settings` (on `main` at `7187591`)

SPEC §6 `EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE`, `THE DASHBOARD WRITES THE TUNNEL COMMANDS`, `A REVERSE
TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`; §7 `THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS`, `A STORED SECRET IS HIDDEN
UNTIL SHOWN`, `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`, `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS`,
`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN` (role Maintainer, queue 2026-09-30c); §14 `A PERSON IS NAMED BY ACCOUNT OR WITH
CONSENT` (GitLab user names).

Same method and script as §6 (known positive red first; both suites green before and after). The new tests were red against the
unchanged `docs/assets/` before the implementation (the store exported no `JUMP_HOST_KEY`; 8 Python failures).

| Mutation | In | Red |
|---|---|---|
| a new session takes the highest free port | `review-core.mjs` | `JumpHostAndRemoteSessions` test_each_session_has_its_commands_test_and_clear; `ReverseTunnelOnLoopback` test_the_generated_reverse_command_names_the_loopback_address; review-core.test.mjs "EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so"; review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| a full range gives a port outside it instead of refusing | `review-core.mjs` | review-core.test.mjs "EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so" |
| a hand-chosen port may be shared | `review-core.mjs` | review-core.test.mjs "EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so" |
| the reverse tunnel binds all interfaces | `review-core.mjs` | `JumpHostAndRemoteSessions` test_each_session_has_its_commands_test_and_clear; `ReverseTunnelOnLoopback` test_the_generated_reverse_command_names_the_loopback_address; review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the reverse tunnel has no bind address (ssh's default) | `review-core.mjs` | `JumpHostAndRemoteSessions` test_each_session_has_its_commands_test_and_clear; `ReverseTunnelOnLoopback` test_the_generated_reverse_command_names_the_loopback_address; review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the forward uses another port than the reverse tunnel | `review-core.mjs` | `JumpHostAndRemoteSessions` test_each_session_has_its_commands_test_and_clear; review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the bind check accepts any address | `review-core.mjs` | `ReverseTunnelOnLoopback` test_counter_proof_any_other_bind_address_fails; review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the bind check accepts a forward to another host | `review-core.mjs` | review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the bind check ignores -g | `review-core.mjs` | review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| tunnelCommands writes a command without running the bind check | `review-core.mjs` | **none — green** ⁴ |
| without ExitOnForwardFailure | `review-core.mjs` | review-core.test.mjs "THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other" |
| the jump host name is not checked | `review-core.mjs` | review-core.test.mjs "the jump host's settings are checked — a host, user or key name that could change the command is refused" |
| a key file may be anything (key contents) | `review-core.mjs` | review-core.test.mjs "the jump host's settings are checked — a host, user or key name that could change the command is refused" |
| the probe sends a mode that reads the answer (cors) | `review-core.mjs` | review-core.test.mjs "a remote session is tested by asking whether anything answers at its local port — no token, nothing else" |
| a bridge token is rendered in clear | `review-core.mjs` | `JumpHostAndRemoteSessions` test_the_bridge_token_is_hidden_until_shown |
| the bridge tokens are not declared secret (export notice) | `review-core.mjs` | review-core.test.mjs "THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear" |
| import adds a session whose port is used here | `review-core.mjs` | review-core.test.mjs "THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear" ³ |
| store: remote sessions not in the export | `settings-store.mjs` | review-core.test.mjs "THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear" |
| sessions row without Clear | `review-core.mjs` | `TestedAndCleared` test_each_browser_setting_has_test_and_clear |
| the GitLab steps ask for role Developer again | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Maintainer, scope api, expiry" |
| a Developer token counts as able to write | `review-core.mjs` | review-core.test.mjs "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch" |
| GitLab account names checked with GitHub's syntax | `review-core.mjs` | review-core.test.mjs "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's" |
| GitLab account names ending in .git accepted | `review-core.mjs` | review-core.test.mjs "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's" |

³ Green in the first run: the import test had no session whose port was taken here. A browser with a session on 20001 importing
`lab-pc` on 20001 was added to the test; re-run: red, as listed.

⁴ Green, and left so: `tunnelCommands` runs the bind check on every command it writes, but every value that enters a command
(host, user, key file names, ports, session name) is checked before (`jumpHostProblem`, `addRemoteSession`), and with checked
values the command cannot carry another bind address. The check is a second guard that no valid input reaches; the rule itself
is checked by `tunnelBindProblems` on the written commands and on the counter-examples (`0.0.0.0`, `*`, empty, `-g`,
`GatewayPorts`, another destination) — mutations of that function are red above.

**In Chrome** (dashboard served from 127.0.0.1, no GitHub token): *Set the jump host* stored it; *+ Remote session* offered 20001,
then 20002; both commands per session appeared as in the tests, the bridge token in a password field. *Test all* with a stand-in
HTTP listener on 127.0.0.1:20001 and none on 20002: "something answers at localhost:20001", "nothing answers at localhost:20002".
*Clear everything* left `localStorage` empty. Not measured: the same probe from the HTTPS Pages origin, where Chrome's rules for
requests to the local network apply (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`) — it belongs to the bridge's measurement.
