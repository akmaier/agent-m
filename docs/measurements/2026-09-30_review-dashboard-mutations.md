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
