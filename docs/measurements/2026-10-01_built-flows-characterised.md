# The flows the dashboard carries out — characterised, flow by flow, and the flows it does not carry out

**MESSUNG** — 2026-10-01, branch `team/ITM-123` (from `sprint/01` at `0f70d57`, ITM-008 merged), macOS 26.6, Node 25.9,
Python 3.14. ITM-123 (refactoring job): one app-harness test per main and alternative flow that the dashboard carries out
today for UC-001, UC-006, UC-008 and for the built parts of UC-014 (*Finish setting up*) and UC-042 (browser settings, export
and import, pseudonymisation, collaborators) — `tests/dashboard-review-flows.test.mjs`, 65 tests. No code changed. This file
records what each test covers, the flows found not carried out, one finding against the SPEC, and the counter-proof of every
new test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. Method

The real dashboard (`docs/assets/dashboard-app.mjs` and its views) runs in `tests/app-harness.mjs` against the harness's GitHub
fake, which takes commits and counts every request. A test brings the other servers its flow talks to as request handlers:
the product repository of UC-001 as a second harness server behind the instance's, a GitLab server
(`tests/review-core.d/helpers.mjs` `fakeGitLab`), GitHub's contents API in its JSON form (the write path asks it for a file's
blob before it writes over it), and a recorder of every request's method, address and `Authorization` header.

Every write is started by a click on the button that names it, with `{ isTrusted: true }` — the mark a browser gives a
person's click and no script can set; every write test has a counter-proof with `{ isTrusted: false }` or with the condition
the flow requires left out. A disabled button is not clicked (`press` refuses); where a test fires one anyway, it says so.

What the harness could not reach, the test file adds on top of the harness's document (`richDocument`, documented there):
listeners on elements a view finds by id (Add product, Check, Store and check, the settings page's Save, Export and Import
buttons), the edit panel a view finds by its classes, and forms a view writes into a control. The harness's own controls stay
the objects they were. `tests/app-harness.mjs` gained one option, `search` (default empty, unchanged for every existing test),
so that a GitLab product can be opened by `?product=`.

Suites before the first commit: `cd tests && python3 -m unittest` — 172 tests, OK; `node --test tests/*.test.mjs` — 179 tests,
179 pass. After it: 172 OK; 244 pass. No existing test or asserted value was changed.

## 2. The flows, and the test of each

`—` in the test column: not carried out by the dashboard (section 3), or carried out outside it.

### UC-001 Add a managed product

| Flow | Test |
|---|---|
| Main flow (steps 1–5, GitHub): Step A names the token, the product and the instance; *Check* reads the product; *Add product* writes the missing layout into the product, nothing into the instance, keeps the address in this browser, shows the commit and the switch | T26 (counter-proof T27); T29 (no layout at all) |
| 1a another browser: empty list | T34 |
| 2a the product repository does not exist yet | — (section 3) |
| 3a the token already reaches the product: Step A shown as done | — (section 3) |
| 3b no token: the key setup of UC-014 with both repositories, then step 4 | T32 (counter-proof T33) |
| 3c GitLab: a project token of its own, stored for that project, the layout committed with it | T35 (counter-proof T36) |
| 3d no project tokens on the server, or not Maintainer: says which, and that a personal token is broader | T37 (the explanation); T35 (the token's role named at the check) |
| 4a the check fails | T30 |
| 5a the write is refused although the read succeeded | T31 |
| 5b the layout is complete | T28 |

### UC-006 Approve a specification change

| Flow | Test |
|---|---|
| Steps 1–2: the current section beside the proposal, the difference, the rationale | T16 |
| Steps 4–7: *Accept* — record, SPEC section byte for byte and decision row in one commit under the reviewer's token; the entry shown *in SPEC* | T17 (counter-proof T18) |
| 3a edit the proposal, *Save* — the proposal only; *Accept* then applies the saved text | T21 (counter-proof T22) |
| 3b the change touches an existing requirement: the referencing artifacts listed | — (section 3) |
| 4a reject: no record | — (nothing to click; T17 shows that opening writes nothing) |
| 4b no token: GitHub's new-file page prefilled with the record; editing through GitHub's editor | T23 |
| 4c the instance's own SPEC without a token: the apply workflow | — (not the dashboard: `tests/test_apply_approvals.py`) |
| 4d several entries ticked: in the queue's order, in one commit; an entry whose heading another creates only with it | T24 (counter-proof T25) |
| 5a the proposal or the SPEC section changed meanwhile: nothing written, the new state shown | T19 (section), T20 (proposal) |

### UC-008 Review and accept a use case

| Flow | Test |
|---|---|
| Step 1: the list with the derived status | T01 |
| Steps 2–5: text and diagram, *Accept* commits the three-line record naming the shown text, status accepted | T02 (counter-proof T03) |
| 1a private repository: read with the token through the API; without one, said so and nothing shown | T13 |
| 2a changed since acceptance: the difference to the last accepted text | T04 |
| 3a edit and *Save*; the identifier kept; a save refused when the file changed meanwhile | T06 (counter-proof T07), T08, T09 |
| 3b no token: GitHub's new-file page prefilled, the record and path to copy; editing through GitHub's editor | T12 |
| 3c GitLab without its token: no *Accept*, no *Save*, the token step linked | T14 |
| 3d *Accept ticked* | T10 (counter-proof T11) |
| 3e *Review all* | — (characterised before: `tests/review-page.test.mjs`, "the use cases' review page …") |
| 4a no write access: the commit refused, said so | T15 (partly — section 3) |
| 5a edited after acceptance: changed, without anyone resetting a status | T05 |

### UC-014 Get your own Agent M — the part that exists

| Flow | Test |
|---|---|
| Steps 1–5: the guided *Get your own Agent M* page | — (section 3) |
| Step 6: *Finish setting up your instance*, *Set up now*, *Import settings* | T38 |
| Step 7: the prefilled token link, *Only select repositories*, the instance only, *Why these?* | T39 |
| Steps 8–9: notice, tick, paste, expiry preset to 90 days and stored as entered, *Store and check*, ready | T40 (counter-proof T41) |
| 7a another browser: *Import settings* | T62 (with UC-042 step 6) |
| 3a, 4a, 1a, 1b, 6a | — (GitHub's pages and the fork, not the dashboard; 6a is UC-008 3b, T12) |

### UC-042 Manage settings in one place — browser settings, export and import, pseudonymisation, collaborators

| Flow | Test |
|---|---|
| Step 1: one page; each browser setting a line with its state; secrets hidden, *Show* | T42, T43 |
| Step 2 *Test* | T44 |
| Step 2 *Clear* after one confirmation that says what no longer works | T45 (counter-proof T46) |
| Step 2 *Change* (GitHub token) after the notice, with its expiry date | T47 |
| Step 2 for the other browser settings: products (*Remove*, *Clear*), a GitLab project token (*Show*, *Change*, *Clear*), the jump host and a remote session (set, commands written, cleared) | T50, T51, T52 |
| 1a a token expiring within fourteen days: a line on every page with *Renew* | T48 |
| 1b a refused token: named, with *Renew* | T49 |
| 3a no token that can write to the product: read-only, linked to UC-001 | T53 |
| Step 4 pseudonymisation off: the notice, the tick, one commit of `docs/settings.md` | T54 (counter-proofs T55) |
| 4a switched back on: without a notice, the history note | T56 |
| Step 5 *+ Collaborator* with the tick: one commit of `docs/collaborators.md` | T57 (counter-proofs T58) |
| 5a *Remove* a collaborator | T59 (partly — section 3) |
| Step 6 *Export* with its notice; locked with a passphrase; *Import*; a locked import; *Clear everything* | T60, T61, T62, T63, T65 |
| 6a an import keeps what this browser has | T64 |
| Step 3 instance and product summaries with *Edit*; 2a bridge token; 2b mailbox | — (section 3) |

## 3. Flows not carried out

Each is a flow of an accepted use case the dashboard does not carry out today — for the Product Owner's backlog. None is
pinned by a test.

| Use case · flow | What the use case says | What the dashboard does (where) |
|---|---|---|
| UC-001 2a | the repository does not exist: says so and links GitHub's page for a new repository | *Check* shows `✗ alice/thesis: 404 …`, *Add product* "Your key cannot write to … (… 404 …)"; no link (`dashboard/add-product-view.mjs` `viewAddProduct`, `wireAddGo`) |
| UC-001 3a | the token already reaches the product: Step A shown as done | Step A's instructions are always shown, also after a successful *Check* (`viewAddProduct`) |
| UC-006 3b | a change touching an existing requirement: the dashboard lists the referencing artifacts before the reviewer decides | the entry view shows section, proposal, difference and rationale only; no impact list is derived (`dashboard/spec-changes-view.mjs` `viewSpecEntry`) — whether a proposal carries one in its own text is up to the proposal |
| UC-008 4a | no write access: the dashboard says so and offers the GitHub path | it says so; the GitHub path is named ("remove it to use GitHub's page instead"), not offered as a link (`dashboard-app.mjs` `writeRefusalText`) |
| UC-014 steps 1–5 | the guided *Get your own Agent M* page | no such view: `dashboard/get-your-own-view.mjs` does not exist; the table `DASHBOARD` names it, so the address shows the use cases |
| UC-014 step 3 / 4a | the workflows step offered again when a feature first needs it; an approval committed without a token shown as *approved*, with why and step 3 | the status *approved* is explained in its badge title; step 3 is offered nowhere |
| UC-042 step 1 | ✓ *works* with the date of the last successful test; ✗ *refused* at the last use | both are kept for the page only (`tokenState` in memory); after a reload a token is "stored — not tested on this page yet" |
| UC-042 step 3 | the instance's and each product's repository settings as summaries with *Edit* opening the owning use case's form | no instance section (`dashboard/settings/instance.mjs` does not exist); the product section has pseudonymisation and collaborators only — no process model, Definition of Done, test schedule, linked sources or resources |
| UC-042 2a, 2b | clearing the bridge token or the mailbox connection | neither is a setting yet (`settings/bridge.mjs`, `settings/mailbox.mjs`, `settings/endpoints.mjs` do not exist) |
| UC-042 5a | *Remove* lists the files on the default branch that still name the person | the removal is committed and the page says earlier commits keep the name; no file is listed (`dashboard/settings-view.mjs` `loadProductSettings`) |

## 4. Finding: a refused save keeps the edit, but not beside the newer version

`A REFUSED SAVE KEEPS THE EDIT` (SPEC §10): "When a save is refused, the edited text stays in the editor, shown beside the newer
version." The dashboard keeps the edit and shows the refusal; it does not show the newer version.

Path: *Save* → `dashboard/review-views.mjs` `wireCommon`, the `[data-edit-save]` handler → `dashboard/writes.mjs`
`saveReviewedFile` → `git-host.mjs` `commitFiles`, which reads the file's blob at the branch head and throws "… changed since
you opened it — reload and look at the new text first" when it differs from `expectBlob` → back in the handler's `catch`:
`out.textContent = app.writeErrorText(e)`, the button enabled again — nothing else. Ist: the textarea holds the edit; the page
holds no newer text. Soll: the newer version beside the edit. Verified at that node by T09: after `srv.change(UC2, …)` and
*Save*, nothing is written, the result line says "changed since you opened it" and the textarea still holds the edit; the
newer text appears nowhere on the page. T09 asserts only the part that holds, so it does not pin the gap. The rule is listed
under MOD-dashboard-app's `realises`; no test names it.

## 5. Counter-proofs

**Method.** A script (in the session's scratchpad, not committed) planted each fault below by replacing one snippet of one
file — refused unless the snippet occurs exactly once —, ran `node --test tests/dashboard-review-flows.test.mjs`, read the
failing tests from node's own report (its `✖` lines before the summary) and restored the file. That this reading sees a
failure was checked first on M01, which names seven failing tests. `T01`–`T65` are the tests in the file's order (table
below).

| Mutation | File | Fault planted | Red |
|---|---|---|---|
| M01 | `dashboard/writes.mjs` | clickAuthority takes any click — one a script makes too | T03, T07, T18, T22, T27, T55, T58 |
| M02 | `dashboard/review-views.mjs` | the use-case list shows every use case as open | T01 |
| M03 | `dashboard/review-views.mjs` | a use case changed since acceptance is shown as open | T04, T05 |
| M04 | `dashboard/review-views.mjs` | the difference to the last accepted text compares the text with itself | T04 |
| M05 | `dashboard/review-views.mjs` | after an acceptance the page is not read again | T02, T11, T17, T19, T20 |
| M06 | `dashboard/writes.mjs` | a saved edit loses its final newline | T06, T21 |
| M07 | `dashboard/writes.mjs` | an edit that changes the identifier is saved | T08 |
| M08 | `dashboard/writes.mjs` | a save does not check whether the file changed meanwhile | T09 |
| M09 | `dashboard/review-views.mjs` | a tick is not kept | T10, T11, T24, T25 |
| M10 | `review-core.mjs` | a file changed after it was shown is accepted anyway | T11 |
| M11 | `dashboard/review-views.mjs` | without a token GitHub's page opens without the record | T12, T23 |
| M12 | `dashboard/review-views.mjs` | the edited text is copied changed | T12, T23 |
| M13 | `dashboard-app.mjs` | with a token, files are read from the raw host, without it | T13 |
| M14 | `git-host.mjs` | a GitLab product without its token is offered GitHub's pages | T14 |
| M15 | `dashboard-app.mjs` | a refused write is not named as the token's missing permission | T15 |
| M16 | `dashboard/spec-changes-view.mjs` | the SPEC entry's difference compares the proposal with itself | T16 |
| M17 | `review-core.mjs` | the decision row names the wrong entry | T17, T24 |
| M18 | `review-core.mjs` | the replaced SPEC section gains a newline — not byte for byte | none (equivalent here, see below) |
| M18b | `review-core.mjs` | the replaced SPEC section gains an empty line — not byte for byte | none (equivalent here, see below) |
| M18c | `review-core.mjs` | the replaced SPEC section loses its empty lines — not byte for byte | T17, T21, T24 |
| M19 | `review-core.mjs` | a SPEC section changed after it was shown is overwritten | T19 |
| M20 | `review-core.mjs` | a proposal changed after it was shown is applied | T20 |
| M21 | `review-core.mjs` | an entry whose heading another creates is offered alone | T25 |
| M22 | `review-core.mjs` | the layout is written whether it exists or not | T26, T28 |
| M23 | `review-core.mjs` | the layout has no CHANGELOG.md | T26, T29, T32, T35 |
| M24 | `dashboard/settings-view.mjs` | a failed check does not name the repository | T30 |
| M25 | `dashboard/writes.mjs` | the address is kept before the layout's commit succeeds | T31 |
| M26 | `dashboard/setup-view.mjs` | the key setup names only the instance | T32 |
| M27 | `dashboard/setup-view.mjs` | the key is stored without the notice ticked | T33 |
| M28 | `dashboard-app.mjs` | another browser lists a product it does not have | T26, T34 |
| M29 | `dashboard/add-product-view.mjs` | a GitLab product is written with the GitHub token | T35 |
| M30 | `dashboard/settings-view.mjs` | a GitHub token is stored as a GitLab project token | T36 |
| M31 | `dashboard/add-product-view.mjs` | the page does not leave the decision to the author | T37 |
| M32 | `dashboard/review-views.mjs` | Set up now leads elsewhere | T38 |
| M33 | `dashboard/settings-view.mjs` | the prefilled link asks for another expiry | T39 |
| M34 | `dashboard/setup-view.mjs` | the setup stores the token without its date | T32, T40 |
| M35 | `dashboard/setup-view.mjs` | any text is stored as a token | T41 |
| M36 | `dashboard/settings-view.mjs` | the GitLab tokens have no line on the page | T42, T51 |
| M37 | `dashboard/settings-view.mjs` | Show reveals nothing | T43 |
| M38 | `dashboard/settings-view.mjs` | a successful Test is not shown | T44 |
| M39 | `settings-store.mjs` | Clear leaves the token's date in storage | T45 |
| M40 | `dashboard/settings-view.mjs` | Clear removes the token without the confirmation's answer | T45, T46 |
| M41 | `dashboard/settings-view.mjs` | Change stores the token without its date | T47 |
| M42 | `dashboard/settings-view.mjs` | the expiry is warned of four days ahead, not fourteen | T48 |
| M43 | `dashboard-app.mjs` | a refused token is not noted | T49 |
| M44 | `settings-store.mjs` | removing one product removes every GitLab token | T50 |
| M45 | `dashboard/settings-view.mjs` | a GitLab token is changed without the notice | T51 |
| M46 | `bridge-tunnel.mjs` | the reverse tunnel listens on every interface of the jump host | T52 |
| M47 | `dashboard/settings-view.mjs` | without a token the product's settings offer Save | T53 |
| M48 | `dashboard/settings-view.mjs` | the notice does not say a public repository publishes the data | T54 |
| M49 | `dashboard/writes.mjs` | pseudonymisation is switched off without the tick | T55 |
| M50 | `pseudonymiser.mjs` | switching on writes a line instead of removing it | T56 |
| M51 | `pseudonymiser.mjs` | a collaborator's account is written without @ | T57, T59 |
| M52 | `pseudonymiser.mjs` | a collaborator is named without their agreement | T58 |
| M53 | `pseudonymiser.mjs` | Remove keeps the collaborator | T59 |
| M54 | `settings-store.mjs` | the export leaves the token out | T60, T62, T64 |
| M55 | `dashboard/settings-view.mjs` | two different passphrases save a file | T61 |
| M56 | `settings-store.mjs` | an import leaves the token's date out | T62 |
| M57 | `settings-store.mjs` | a wrong passphrase imports an empty file without saying so | T63 |
| M58 | `settings-store.mjs` | an import overwrites what this browser has | T64 |
| M59 | `dashboard/settings-view.mjs` | Clear everything leaves the kept file texts | T65 |
| M60 | `dashboard/settings-view.mjs` | Clear everything does not wait for the confirmation | T65 |
| M61 | `dashboard/add-product-view.mjs` | Step A does not say to keep the instance selected | T26 |
| M62 | `dashboard/settings-view.mjs` | Remove takes every product off the list | T50 |

| Test | Name | Red under |
|---|---|---|
| T01 | UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance | M02 |
| T02 | UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted | M05 |
| T03 | UC-008 counter-proof: a click a script makes on Accept writes and reads nothing | M01 |
| T04 | UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names | M03, M04 |
| T05 | UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone | M03 |
| T06 | UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open | M06 |
| T07 | UC-008 3a counter-proof: a click a script makes on Save writes nothing | M01 |
| T08 | UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor | M07 |
| T09 | UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor | M08 |
| T10 | UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown | M09 |
| T11 | UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted | M05, M09, M10 |
| T12 | UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor | M11, M12 |
| T13 | UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case | M13 |
| T14 | UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token | M14 |
| T15 | UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and names the way through GitHub's page | M15 |
| T16 | UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale | M16 |
| T17 | UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC | M05, M17, M18c |
| T18 | UC-006 counter-proof: a click a script makes on Accept writes and reads nothing | M01 |
| T19 | UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state | M05, M19 |
| T20 | UC-006 5a: the proposal changed after the entry was opened — nothing is written | M05, M20 |
| T21 | UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text | M06, M18c |
| T22 | UC-006 3a counter-proof: a click a script makes on Save writes nothing | M01 |
| T23 | UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor | M11, M12 |
| T24 | UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit | M09, M17, M18c |
| T25 | UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs | M09, M21 |
| T26 | UC-001 main flow: Step A names the token, the product and the instance; Check reads the product; one trusted click on Add product writes only the missing layout into the product and keeps its address in this browser | M22, M23, M28, M61 |
| T27 | UC-001 counter-proof: a click a script makes on Add product writes nothing, stores nothing and reads nothing | M01 |
| T28 | UC-001 5b: a product that already has the whole layout gets no commit — only its address is kept in this browser | M22 |
| T29 | UC-001 a product without any layout gets all of it in one commit | M23 |
| T30 | UC-001 4a: the check fails — the page names the repository it cannot reach | M24 |
| T31 | UC-001 5a: the write is refused although the read succeeded — nothing is written, nothing kept, and the page sends the author back to Step A | M25 |
| T32 | UC-001 3b: without a token the panel first shows the key setup naming both repositories; storing the key checks both, and then Add product writes the layout | M23, M26, M34 |
| T33 | UC-001 3b counter-proof: a click on Store and check without the notice ticked stores nothing | M27 |
| T34 | UC-001 1a: in another browser the product list is empty — the selector offers the instance and + Add product only | M28 |
| T35 | UC-001 3c: a GitLab product gets a project token of its own — Step A opens its Access tokens page, Step B stores the token for this project only, and Add product commits the layout there with it | M23, M29 |
| T36 | UC-001 3c counter-proof: a GitHub token pasted as the project's token is refused and nothing is stored | M30 |
| T37 | UC-001 3d: the page says why a server may offer no project token or the author may not be Maintainer, and that a personal token is broader — the author decides | M31 |
| T38 | UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not | M32 |
| T39 | UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance | M33 |
| T40 | UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready | M34 |
| T41 | UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored | M35 |
| T42 | UC-042 step 1: one page — each browser setting is a line with its state, the token in a password field; the product's settings; export and import; clear everything | M36 |
| T43 | UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again | M37 |
| T44 | UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works | M38 |
| T45 | UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works | M39, M40 |
| T46 | UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token | M40 |
| T47 | UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked | M41 |
| T48 | UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not | M42 |
| T49 | UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line | M43 |
| T50 | UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes | M44, M62 |
| T51 | UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation | M36, M45 |
| T52 | UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser | M46 |
| T53 | UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001 | M47 |
| T54 | UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md | M48 |
| T55 | UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why | M01, M49 |
| T56 | UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says data written meanwhile stays in the history | M50 |
| T57 | UC-042 step 5: + Collaborator with the tick that the person agreed commits docs/collaborators.md with name, account and date | M51 |
| T58 | UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing | M01, M52 |
| T59 | UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name | M51, M53 |
| T60 | UC-042 step 6: the export states what it contains and what each secret grants; Export saves every browser setting, the token included, and sends nothing | M54 |
| T61 | UC-042 step 6: an export locked with a passphrase holds no secret in clear; two different passphrases save nothing | M55 |
| T62 | UC-042 step 6 · UC-014 7a: Import, after the notice is ticked, restores every setting of an export in a browser that had none | M54, M56 |
| T63 | UC-042 step 6: a locked file is imported with its passphrase; with a wrong one nothing is imported | M57 |
| T64 | UC-042 6a: an import keeps what this browser has, adds only what is missing, and lists both | M54, M58 |
| T65 | UC-042 step 6: Clear everything removes every Agent M entry from localStorage and the kept file texts, after a confirmation | M59, M60 |

**Result.** 64 mutations; every one of the 65 tests is red under at least one. Two mutations turned nothing red, and are kept in the table because they were run: M18 and M18b change how `replaceSection` ends the SPEC, and on these fixtures — whose replaced section is the last of the SPEC — they write the same bytes as the code (a section at the end has no line after it, so the final newline is added either way); they are equivalent here, not missed. M18c, which changes the bytes of the section itself, turns the three tests that compare the SPEC byte for byte red.

After the series: `git status` shows no change under `docs/assets/`; the suites as in section 1.
