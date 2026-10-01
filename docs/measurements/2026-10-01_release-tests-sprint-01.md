# Release tests of the sprint 01 increment — results, counter-proofs, findings (ITM-141)

**MESSUNG** — 2026-10-01, branch `team/ITM-141` from `sprint/02` at `ef4f619` (= `main` at `385f5cf`, pull request #39, plus
records only: `git diff --stat 385f5cf ef4f619` touches `README.md` and `docs/backlog/` only), macOS, Node 25.9.0, Python 3.14.6.
CI runs Node 22 (`.github/workflows/tests.yml`).

**Author.** `tester-opus` (claude-opus-5-5), the Release tester of `docs/process.md`, who implemented nothing of the increment
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Every expectation was written from the texts of UC-001, UC-006, UC-008,
UC-014, UC-042 and the SPEC rules ITM-141 lists. The code was read only to learn how to drive the page (which control a view wires,
under which selector); the implementers' tests (`tests/dashboard-review-flows.test.mjs`, `tests/review-core.d/`) and their
records were not read before the release tests were written — their test names were read afterwards, for the overlaps below.

## Files and commands

| File | Module | Level | Cases |
|---|---|---|---|
| `tests/release-sprint-01-dashboard-app.test.mjs` | MOD-dashboard-app | release | 53 (50 green, 3 todo = findings) |
| `tests/release-sprint-01-git-host.test.mjs` | MOD-git-host | release | 6 green |

Commands, at commit `7b41b60`: `cd tests && python3 -m unittest` → `Ran 172 tests … OK`; `node --test tests/*.test.mjs` →
`tests 303, pass 300, fail 0, todo 3` (244 before this item).

How the page is driven: the real `docs/assets/dashboard-app.mjs` in `tests/app-harness.mjs`, against fake GitHub servers
(`repoServer`, the instance `akmaier/agent-m` and a product `alice/thesis-tool`) and a fake GitLab project
(`https://gitlab.example.org/team/proj`) defined in the test file; no request leaves the process. The harness finds a control only
by an attribute selector inside `<main>`; the test file adds, for elements reached by id, listeners that stay and elements that are
replaced when their container is written anew, and the editor panel as a browser reaches it. `confirm`, the clipboard,
`window.open`, a chosen import file and the download link are stand-ins that record what the page asked.

## The tests, in the order of the use cases, with their counter-proofs

A mutation replaced one piece of text (G6 and D10: two) in one code file; both release files then ran (`node --test
--test-reporter=tap`), and the file was restored. Before and after the series all 56 green cases were green. The three todo cases
are red on the increment itself — that is their red result; they need no planted fault.

| # | Case (flow or rule) | Red under |
|---|---|---|
| | **UC-001 Add a managed product** (2a, 3a not carried out — ITM-132) | |
| 1 | step 1: + Add product in the selector opens the panel | D11 |
| 2 | steps 2–5 on GitHub: Step A names the token, product, instance, Update; Check ✓ with the public note; one commit of the missing layout into the product, address in this browser, nothing in the instance, commit link and switch offer; every step explains itself | D2 |
| 3 | step 5 · ONE REVIEW LAYOUT FOR EVERY PRODUCT: the layout holds `docs/architecture/` (GitHub and GitLab) | **todo — finding R1** |
| 4 | step 5: what exists is skipped | D3 |
| 5 | 5b: complete layout → no commit, only the address | D2, D3 |
| 6 | 4a: failed check names the repository, Step A shown | D5 |
| 7 | 5a: refused write says so, Step A again, nothing written or kept | D6 |
| 8 | 3b: without a token, key setup naming both repositories; both checked after storing | D7 |
| 9 | 1a: another browser, empty product list | D8, D11 |
| 10 | 3c: GitLab project token — Access tokens page, Agent M/Maintainer/api/expiry, notice, stored for the project, sent only to it; GitHub token not sent there | D9 |
| 11 | 3d: no project tokens or not Maintainer — explained, personal token reaches every project | D10 |
| 12 | THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK: a script's click on Add product writes nothing | D4, D22 |
| | **UC-008 Review and accept a use case** (4a not carried out — ITM-133; 3a's refused-save view — ITM-131) | |
| 13 | steps 1–5: statuses open/accepted/changed; text and Mermaid; one commit `UC-001-<sha>.md`, three lines naming file and blob, reviewer's token; then accepted | D12, D13 |
| 14 | 5a: edited after acceptance → changed | D12 |
| 15 | 2a: difference to the text of the most recent of two records, across a rename, above the text | D15 |
| 16 | 1a: private repository read with the token; without one, or with one that does not reach it, said and nothing shown | D16 |
| 17 | 3a: Save commits the edit; shown again, open | D17 |
| 18 | 3a · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE: nothing written, page says changed | G3 |
| 19 | 3b: no token — GitHub's new-file page with the record, path and record to copy; no link carries the text; Edit copies and opens GitHub's editor | D18, D33 |
| 20 | 3c: GitLab without its token — read, no Accept/Save, link to the token step | D19 |
| 21 | 3d: Accept ticked, one commit, one record per tick; a file changed after it was shown is left out and named | D20 |
| 22 | 3e: Review all shows open/changed (changed as difference), not accepted; Accept all 2 shown → one commit; changed after the page → left out, named | D20 |
| 23 | THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK: nothing on load or reading, nothing on a script's click | D22 |
| | **UC-006 Approve a specification change** (3b not carried out — ITM-134) | |
| 24 | steps 1–7: section, proposal, difference, rationale; one commit — record (proposal + blob), SPEC section byte for byte with the rest unchanged, one decision appended naming the record; then *in SPEC* | D24, D27 |
| 25 | 3a: edited proposal saved, shown again, accepted as edited | D17, D27 |
| 26 | 5a: section or proposal changed since shown → nothing written, new state shown | D25, D27 |
| 27 | 4d: dependent entry not offered alone, names entry 01; ticked together → one commit, queue order, two records, two decisions | D24, D26 |
| 28 | 4b: no token — new-file page with the record; Edit copies and opens GitHub's editor | D18, D33 |
| 29 | 4c, the product's half: a product's SPEC change without a token is not offered GitHub's page | **todo — finding R2** |
| 30 | 4a: not accepted → nothing committed, entry open | D27 |
| | **UC-014 Get your own Agent M — Finish setting up** (steps 1–5 — ITM-073) | |
| 31 | 4a: approval committed on GitHub's page, not applied → *approved*, not *in SPEC*, says why (offering step 3 is ITM-073) | D18, D28, D33 |
| 32 | 6, 7a: no token → Finish setting up at the top, Set up now, Import settings | D29 |
| 33 | 7 · THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE · THE REPOSITORY CHOICE IS SPELLED OUT: name, description, 90 days, exactly the six permissions; why each; Only select repositories, the instance | D30 |
| 34 | 8–9 · THE SHARED PAGES ORIGIN IS DISCLOSED: notice; nothing stored before the tick; 90-day preset; token and date in localStorage; instance read; ready with use cases and + Add product | D31 |
| 35 | 6a: no setup — read without any token, accept through GitHub's page | D33 |
| | **UC-042 Manage settings in one place** (1 after reload — ITM-136; 5a — ITM-137; instance section — ITM-098; 2a bridge, 2b mailbox — not built) | |
| 36 | 1: the gear; sections; token hidden until Show | D34 |
| 37 | 2 Test: one GET to GitHub with the token; ✓ works with today's date; none → — not set | D35 |
| 38 | 2 Change: fields in place, same notice, 90-day preset, new token stored | D36 |
| 39 | 2 Clear · A CLEAR IS A REAL CLEAR: one confirmation naming what stops working; gone from localStorage | D37 |
| 40 | 1a · A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE: ⚠ on the line, the warning with Renew on every page | D38 |
| 41 | 1a: the warning offers the paste field for the new value | **todo — finding R3** |
| 42 | 1b · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: ✗ refused, banner with Renew; GitLab line ✗ refused with its Access tokens page | G5, D39 |
| 43 | 3a: no token → product section read-only, link to UC-001's token step | D40 |
| 44 | 4 · PSEUDONYMISATION IS ON UNLESS … · SWITCHING … OFF STATES WHAT FOLLOWS · REPORT DATA … REWRITTEN WITHOUT PERSONS (explanation): on by default; rewritten without persons, technical content kept; notice (unchanged, protected non-public, public → published); Save refused before the tick; `docs/settings.md` committed; off | D41 |
| 45 | 4a: back on without a notice; history note | D43 |
| 46 | 5 · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT: without the tick nothing; with it `docs/collaborators.md` with name, account, date | D44 |
| 47 | 6 and UC-014 7a · SETTINGS ARE EXPORTED … · AN EXPORT STATES … · AN EXPORT CAN BE LOCKED …: notice; plain export holds the token, locked one no secret in clear; second browser: wrong passphrase imports nothing, right one restores; nothing sent | D45, D46 |
| 48 | 6a: import keeps a product this browser has, adds the missing one, lists both | D2, D46, D47 |
| 49 | 6: Clear everything empties localStorage | D48 |
| 50 | every line and section explains itself | D49 |
| 51 | A TOKEN IS SCOPED TO WHAT IT WRITES: Only select repositories and why each permission | D50 |
| | **ITM-005 at the dashboard** | |
| 52 | A USED-UP RATE LIMIT IS NAMED: account's limit with reset time and no token words; network's without a token; plain 403 → missing permission | G4 |
| 53 | AN EXPIRED TOKEN IS NAMED: 401 on load names the GitHub token, renewal link, banner | G5 |
| | **MOD-git-host boundary (ITM-008, ITM-005, A TOKEN GOES ONLY …)** | |
| 54 | a write without an authority (six malformed ones) is refused before any request | G1 |
| 55 | click, ci-secret and agent-login each write one commit with the person's token, to GitHub's API only | G2 |
| 56 | a save whose file changed writes nothing; unchanged it writes | G3 |
| 57 | 403 with used-up headers: account's (5000, reset time) or network's (60); not a refused token; plain 403 no limit | G4, G5 |
| 58 | 401 names the GitHub token / a GitLab project's token and where each is renewed; 403 is not | G5 |
| 59 | the GitHub token goes to GitHub's API only | G6 |

The mutations:

| Id | File | Planted fault |
|---|---|---|
| G1 | `git-host.mjs` | `requireAuthority` throws never |
| G2 | `git-host.mjs` | `agent-login` removed from the authority kinds |
| G3 | `git-host.mjs` | `commitFiles` ignores a differing `expectBlob` |
| G4 | `git-host.mjs` | `usedUpLimit` calls every limit the account's |
| G5 | `git-host.mjs` | `tokenRefusal` reacts to 403 instead of 401 |
| G6 | `git-host.mjs` | `authHeaders` attaches the token for any origin, and `prepare`'s origin check is off |
| D2 | `dashboard/writes.mjs` | `addProduct` (GitHub) does not keep the address |
| D3 | `review-core.mjs` | `missingLayout` writes over what exists |
| D4 | `dashboard/add-product-view.mjs` | Add product passes `{ kind: "click" }` instead of the click's authority |
| D5 | `dashboard/settings-view.mjs` | `checkReach` reports a failed read as reachable |
| D6 | `dashboard/add-product-view.mjs` | the refused-write text is empty |
| D7 | `dashboard/add-product-view.mjs` | the key setup of Add product names the instance only |
| D8 | `dashboard-app.mjs` | the product list always holds one more product |
| D9 | `dashboard/add-product-view.mjs` | GitLab's Step A links GitHub's token list |
| D10 | `dashboard/add-product-view.mjs` | "every project" removed from both texts of 3d |
| D11 | `dashboard-app.mjs` | the selector's + Add product option removed |
| D12 | `review-core.mjs` | `deriveReviewedStatus` says open for a changed file |
| D13 | `review-core.mjs` | `approvalPath` takes `blob.slice(1, 13)` |
| D15 | `review-core.mjs` | `lastAccepted` takes the oldest record |
| D16 | `dashboard-app.mjs` | the private-repository explanation dropped |
| D17 | `dashboard/writes.mjs` | `saveReviewedFile` commits the edit plus a line |
| D18 | `dashboard/review-views.mjs` | the prefilled record is empty |
| D19 | `git-host.mjs` | `writeRoute` gives a GitLab product without token GitHub's web route |
| D20 | `review-core.mjs` | `planAcceptance` accepts a reviewed file changed since shown |
| D22 | `dashboard/writes.mjs` | `clickAuthority` accepts an untrusted event |
| D24 | `review-core.mjs` | no decision row is written |
| D25 | `review-core.mjs` | a SPEC section changed since shown is written |
| D26 | `dashboard/spec-changes-view.mjs` | an entry that waits for another is offered alone |
| D27 | `review-core.mjs` | `specStatusByNames` says *applied* for an entry without record |
| D28 | `review-core.mjs` | an approval not yet applied shows as stale |
| D29 | `dashboard/review-views.mjs` | Set up now leads to `#settings` |
| D30 | `git-host.mjs` | Workflows asked read only |
| D31 | `review-core.mjs` | `canStore` always true |
| D33 | `git-host.mjs` | `writeRoute` without a token is always the token step |
| D34 | `dashboard/settings-view.mjs` | a stored secret rendered as text |
| D35 | `dashboard/settings-view.mjs` | ✓ works without the date |
| D36 | `dashboard/settings-view.mjs` | Change keeps the fields hidden |
| D37 | `dashboard/settings-view.mjs` | Clear does not clear the token |
| D38 | `dashboard/settings-view.mjs` | expiry warned 2 days before instead of 14 |
| D39 | `dashboard/settings-view.mjs` | a token refused at Test is not noted |
| D40 | `dashboard/settings-view.mjs` | the product section writable without a token |
| D41 | `dashboard/settings-view.mjs` | the off-notice never says "published" |
| D43 | `dashboard/writes.mjs` | switching on saves off |
| D44 | `pseudonymiser.mjs` | a collaborator added without consent |
| D45 | `settings-store.mjs` | a passphrase does not lock the export |
| D46 | `dashboard/settings-view.mjs` | an import stores nothing |
| D47 | `settings-store.mjs` | an import does not list the kept products |
| D48 | `dashboard/settings-view.mjs` | Clear everything leaves localStorage |
| D49 | `dashboard/settings-view.mjs` | the products line has no "What is this?" |
| D50 | `dashboard/settings-view.mjs` | the token guidance names no reason per permission |

Two weak first versions were caught by the series and repaired before this record: case 51 matched a reason further down the
text (tightened to the reason on each permission's own line, then red under D50); for cases 11 and 30 the first mutation missed the
code path (3d's text stands twice; an entry without any record returns *open* before `deriveSpecStatus`), so D10 and D27 were
placed where the text is read. D21 (Review all also lists accepted files) turned no case red: `reviewPage` counts accepted files
out by itself; case 22 is red under D20.

## Findings

Each is a flow the use case names that the increment does not carry out as written, with no backlog item naming it. Each stays
marked `{ todo }` in the test file; the Product Owner adds the item.

**R1 — the layout Add product writes has no `docs/architecture/`.** UC-001 step 5: "writes the missing review layout … (`docs/use-cases/`,
`docs/architecture/`, `docs/approvals/`, `docs/spec-freigaben/`, a `SPEC.md` skeleton, a `CHANGELOG.md`)"; `ONE REVIEW LAYOUT FOR
EVERY PRODUCT` names `docs/architecture/`. Path: `dashboard/add-product-view.mjs:216` `wireAddGo` → `dashboard/writes.mjs:85`
`addProduct` → `:104` (GitHub) / `:93` (GitLab) `missingLayout(…)` → `review-core.mjs:588` `missingLayout` adds
`docs/use-cases/README.md`, `docs/approvals/README.md`, `docs/spec-freigaben/README.md`, `SPEC.md`, `CHANGELOG.md` and no entry for
`docs/architecture/`. Ist: the commit into a product without layout has five files, none under `docs/architecture/` (both hosts);
Soll: one under it. Case 3.

**R2 — a product's SPEC change without a token is offered GitHub's new-file page.** UC-006 4c: "For a product, a token is required —
no product carries the workflow." Path: `dashboard/spec-changes-view.mjs:151` `viewSpecEntry` → `review-views.mjs:124`
`acceptPanel` → `:127` `writeRoute(T.product, null)` → `git-host.mjs:376` returns `"github-web"` for every GitHub repository,
instance or product → `review-views.mjs:160` `newFileUrl(T.repo, …)` "Open in GitHub to commit". The list says so too
(`spec-changes-view.mjs:81`: "the workflow writes it into SPEC.md … once your approval commit arrives"). Ist: on
`?repo=alice/thesis-tool` without a token the entry offers `https://github.com/alice/thesis-tool/new/main?filename=docs/approvals/…`
— a record committed there would show *approved* for ever, since no workflow applies it; Soll: no such route, the page says that
accepting needs a token. Case 29.

**R3 — the expiry warning offers no paste field.** UC-042 1a: "*Your GitHub token expires on …* with **Renew**; it opens GitHub's
page of that token, where *Regenerate token* keeps its permissions and repositories, and the paste field for the new value." Path:
`dashboard-app.mjs:481` `route` → `dashboard/settings-view.mjs:116` `tokenBannerHtml` → `expiryWarning` → the line holds the text,
a Renew link (`target="_blank"`) to `https://github.com/settings/personal-access-tokens` and `RENEW_TEXT`
(`git-host.mjs:384`: "Then paste it under Settings → GitHub token → Change."). Ist: no field, no control that opens one; Soll: the
paste field for the new value. Case 41. (That Renew links the token list rather than the one token's page is not taken as a
finding: the dashboard cannot know the token's identifier.)

## Not covered here, and why

- UC-006 4c, the instance's half (the workflow writes the section): MOD-apply-workflow, outside this item's modules;
  `tests/test_apply_approvals.py` guards it, ITM-016 moves it.
- UC-014 1a (sync fork) and 1b (`products/` ignored in a local clone): repository properties of no dashboard module;
  `tests/test_products_folder.py` guards 1b.
- A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT appears in cases 10, 20, 35 and 59 (not a rule of the item's list, but realised by
  UC-001 and UC-042).
- No test case carries a `TST-` identifier: no test of Agent M's own carries one yet (ARC-020 decision 2; ITM-139, ITM-140).

## Overlaps with the implementers' tests (read after the release tests were written)

`tests/dashboard-review-flows.test.mjs` (ITM-123) characterises the same flows by name for cases 1–2, 4–10, 12–21, 23–28, 32–34,
36–40, 42–47; `tests/review-core.d/` covers 52–59 at the kernel. Not in those names: the layout's `docs/architecture/` (R1 — the
characterisation's "a product without any layout gets all of it" passes on the code's layout), UC-006 4c for a product (R2), the
paste field of 1a (R3), Review all (3e) for use cases, 2a with two records and a rename, the import merge of 6a, the locked export
imported in a second browser, Clear everything, and the "What is this?" of every line.

## Local note

`tests/review-core.d/authority.test.mjs` scans every code file of the working tree, untracked ones included: the scratch runner of
the mutation series, kept as `.mjs` beside the work tree, made that test red locally. Renamed out of the `.mjs` name, both suites
are green; nothing of it is committed.
