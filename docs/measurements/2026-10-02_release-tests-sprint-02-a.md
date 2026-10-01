# Release tests of sprint 02, strand A — results, counter-proofs, findings (ITM-142)

**MESSUNG** — 2026-10-01/02, branch `team/ITM-142` from `sprint/02` at `3ba86fb` (the merge of pull request #57, ITM-136 — the
last item of strand A), macOS, Node 25.9.0, Python 3.14.6. CI runs Node 22 (`.github/workflows/tests.yml`).

**Author.** `tester-opus` (claude-opus-5-5), the Release tester of `docs/process.md`, who implemented none of ITM-126, ITM-129,
ITM-130, ITM-133 and ITM-136 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Every expectation was written from UC-008,
UC-024, UC-042 (and UC-018 6b, which UC-008 4a is named in), the SPEC rules the five items realise, and the accepted module files
MOD-artifacts, MOD-review-core, MOD-git-host, MOD-settings-store, MOD-dashboard-app with ARC-003 and the group file
`docs/groups/modules.md`. The code was read only to learn how to drive the page (which control a view wires, under which
selector, what a token must look like); the implementers' tests and measurement records were read after the release tests were
written, for the overlaps below — with two exceptions, both before the cases concerned were written: the lines of
`tests/dashboard-settings-last-test.test.mjs` that load a page again (to see how it reloads; the release file reloads another way,
below), and section 4 of `docs/measurements/2026-10-01_reads-leave-the-kernel.md`, opened when the code still showed a
`fetchText` import in `dashboard/writes.mjs`. The expectations of cases 9–10 come from ITM-130's and ITM-142's texts and
MOD-git-host's module file, not from that record.

## Files and commands

| File | Module | Level | Cases |
|---|---|---|---|
| `tests/release-sprint-02-a-dashboard-app.test.mjs` | MOD-dashboard-app | release | 20 (16 green, 4 todo = findings A1–A4) |
| `tests/release-sprint-02-a-artifacts.test.mjs` | MOD-artifacts | release | 4 (3 green, 1 todo = finding A5) |
| `tests/release-sprint-02-a-review-core.test.mjs` | MOD-review-core | release | 5 green |
| `tests/release-sprint-02-a-git-host.test.mjs` | MOD-git-host | release | 1 green |

Commands, at commit `f13cc92`: `cd tests && python3 -m unittest` → `Ran 329 tests … OK (expected failures=5)`;
`node --test tests/*.test.mjs` → `tests 385, pass 375, fail 0, todo 10` (355 tests and 5 todo before this item; the other five
todo are R1–R3 of ITM-141 and G1, G2 of ITM-014).

How the page is driven: the real `docs/assets/dashboard-app.mjs` in `tests/app-harness.mjs` against a fake GitHub
(`akmaier/agent-m`, with use cases, an architecture decision, a module and a SPEC queue) and a fake GitLab project
(`https://gitlab.example.org/team/proj`); no request leaves the process. Added in the test file, beyond what ITM-141's release file
already added (elements by id that keep their listeners, the editor panel, stand-ins for `confirm`, the clipboard, `window.open`,
import files and downloads):

- **the files a page load asks for** — a resolve hook of `node:module` (`registerHooks`) records every module the page imports below
  `docs/assets/`, before node resolves it, so that a request for a file that is not there is seen; the dashboard loads its views by
  `import()`, which no fake `fetch` sees. Known positive: the load of `#uc` is seen asking for `dashboard/review-views.mjs`;
- **a reload** — a new page load whose `localStorage` already holds what the page before left in it when the app is imported (the
  harness gives every load a new store with the token only; the entries are put into that store as it is defined).

## The cases, with the rule or flow each was written from and their counter-proofs

Each planted fault (table below) replaced one piece of text — M12 and M17 two — in the code of `sprint/02`; the release files ran
(`node --test --test-name-pattern=…`); the code was restored byte for byte from the saved text, and `git status` showed only the
release files afterwards. The five todo cases are red on `sprint/02` itself — that is their red result; for A1, A2 and A5 a
planted *repair* (P01–P03) shows that the case passes once its finding is gone, so it fails on nothing else.

| # | Item | Case — rule or flow | Expected | Red under |
|---|---|---|---|---|
| 1 | ITM-126 | dashboard · AN EDITED FILE KEEPS ITS IDENTIFIER, UC-008 3a | a use case saved as UC-009, or without `id:`, writes nothing, the file stays, the page says nothing was saved naming UC-001 and UC-009; known positive: kept id saves | M01, M02, M05 (the case without `id:`) |
| 2 | ITM-126 | dashboard · same rule, "architecture element, module" | ARC-001 → ARC-009 and MOD-reader → MOD-writer refused, named, nothing written; known positive: MOD-reader saved | M01, M02 |
| 3 | ITM-126 | artifacts · AN EDITED FILE KEEPS ITS IDENTIFIER, A FINDING READS LIKE A COMPILER MESSAGE | `identifierKept` gives, for UC/ARC/MOD, a finding (a value): artifact = opened id, line of `id:`, error, the rule by name, what naming both, a fix; one line of `<artifact>:<line>: <kind>: <what> [<RULE>] — <fix>`; null for the same id | M02, M03, M04 |
| 4 | ITM-126 | artifacts · same rule, the identifier lost | a text without `id:` is a finding of the rule at a line within the front matter | M02, M03, M05 |
| 5 | ITM-126 | artifacts · same rule, CR LF line ends | the same identifier with CR LF lines is no finding; another one is named | **todo — finding A5**; passes under repair P03 |
| 6 | ITM-126 | artifacts · `formatChecks` takes the finding as it comes | exactly one finding of the rule, equal to `identifierKept`'s, for a use case, a decision and a module; none for the own id | M02, M03, M06, M07 |
| 7 | ITM-129 | dashboard · UC-024, the shell | a page load at each of 43 addresses — the start page, every route of the shell's table, `#uc/UC-001`, `#uc/UC-003`, `#arc/ARC-001`, `#arc/MOD-reader`, `#review/uc`, `#review/arc`, a SPEC entry — asks for no file below `docs/assets/` that is not on the disk | M08, M09 |
| 8 | ITM-129 | dashboard · UC-024, the shell | tabs = the table's views with a tab whose file is on the disk, in order (today: Use cases, Architecture, SPEC changes, How acceptance works, Settings); each built view shows its own page; a view not built shows the use-case list and its file is not asked for | M08, M09, M10 |
| 9 | ITM-130 | dashboard · MOD-git-host's request helper is internal | no MOD-dashboard-app file imports `fetchText` or `request` from the git host | **todo — finding A1**; passes under repair P01 |
| 10 | ITM-130 | dashboard · "no shell file reads past what MOD-git-host provides" | every name a MOD-dashboard-app file takes from the git host outside MOD-git-host's `provides` sends no request when called as a read is called | **todo — finding A2 (and A1)**; passes under repair P02 |
| 11 | ITM-130 | dashboard · ARC-003 decision 6 | no MOD-dashboard-app file calls `fetch` itself | M11 |
| 12 | ITM-130 | dashboard · UC-008 2a through the reads that moved | the last accepted text is read by its blob; a forged blob text is shown nowhere and UC-003's own text still is | M12 (both checks); not M13 or M14 alone — the page has two guards, each caught by its own case (13, 30) |
| 13 | ITM-130 | review-core · ARC-003 decision 1 | no kernel file (group Kernel) imports from the git host or any non-kernel module; review-core.mjs among them | M24 |
| 14 | ITM-130 | review-core · ARC-003 decision 1 | no kernel file calls `fetch` or touches `localStorage`/`caches` | M25 |
| 15 | ITM-130 | review-core · `lastAccepted` with ports | under a `fetch` that throws: the record committed last of two (by identifier, across a rename), its text by its blob, count 2; null without a record | M26 |
| 16 | ITM-130 | review-core · AN APPROVAL NAMES THE EXACT TEXT | a text not hashing to the record's blob is refused | M12, M14 |
| 17 | ITM-130 | review-core · "two records at the same instant raise an error naming both" | error naming both records; a second apart, none | M26, M27 |
| 18 | ITM-133 | dashboard · UC-008 4a, WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK, NO TEXT TRAVELS IN A URL | Accept refused 403 writes nothing; says the token cannot write; one link to GitHub's new-file page for `docs/approvals/UC-001-<sha>.md` with the three-line record (file, blob shown); no link carries the text; says pull request and merge | M15 |
| 19 | ITM-133 | dashboard · A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN | Accept refused 403 with remaining 0 / limit 5000: the limit named, no GitHub path, no word of write access | M16 |
| 20 | ITM-133 | dashboard · A GITLAB PRODUCT IS WRITTEN WITH A TOKEN | GitLab product with its stored project token, commit refused 403: nothing written, the refusal said, no link to any github.com page | M17 |
| 21 | ITM-133 | dashboard · UC-008 3d with 4a | Accept ticked refused 403: GitHub's new-file page offered for each ticked record (UC-001, UC-003) | **todo — finding A3** |
| 22 | ITM-133 | dashboard · UC-008 3a with 4a, UC-018 6b | Save refused 403: says so and offers GitHub's editor of the file (link, or the control that copies the text and opens it) | **todo — finding A4** |
| 23 | ITM-136 | dashboard · UC-042 1 | Test → ✓ works with today; after a reload still ✓ works with that date | M18, M28 |
| 24 | ITM-136 | dashboard · UC-042 1, 1b | Test refused (401) → ✗ refused; after a reload (GitHub still refusing) ✗ refused on the line and the GitHub token named at the top | M18 (see the note below) |
| 25 | ITM-136 | dashboard · UC-042 1, a GitLab project token | Test ✓ works with today → reload → ✓ works; refused → ✗ refused → reload → ✗ refused | M19 |
| 26 | ITM-136 | dashboard · UC-042 2 | a new token stored with Change does not show the old token's ✓ works, before and after a reload | M18, M20 |
| 27 | ITM-136 | dashboard · UC-042 2, A CLEAR IS A REAL CLEAR | after Test, Clear removes token, expiry and the kept test from `localStorage` itself; after a reload "— not set" | M18, M21 |
| 28 | ITM-136 | dashboard · SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS | the export holds the token and its test; another browser importing it shows ✓ works with that date after a reload | M18, M22, M28 |
| 29 | ITM-136 | dashboard · EVERY SETTING IS REACHED FROM ONE PAGE | after the tests of both tokens, every `agent-m.` key in `localStorage` is named on the settings page | M23 |
| 30 | ITM-130 | git-host · `readBlob` | on GitHub and on GitLab the true text is returned and a forged one refused; the GitHub token only to api.github.com, the project token only to its server | M12, M13 |

**Note on case 24.** Its half after the reload is carried twice: by the kept state and by the reload's own request, which GitHub
refuses again (a page load reads with the token). M28 — the test dropped at every page load, i.e. kept for the page only — turns
cases 23 and 28 red but leaves 24 green. A world in which the reload's requests succeed was not used: whether a later successful
*use* (not a *Test*) ends "✗ refused" is not settled by UC-042 step 1 ("refused it at the last use"), so no expectation was
written for it (reading R7 below).

### The planted faults

| Id | File(s) | Fault |
|---|---|---|
| M01 | `dashboard/writes.mjs` | `saveReviewedFile` does not call `identifierKept` |
| M02 | `artifacts.mjs` | `identifierKept` never finds |
| M03 | `artifacts.mjs` | `identifierKept` returns a sentence (the code before ITM-126) |
| M04 | `artifacts.mjs` | the finding's line is one too small |
| M05 | `artifacts.mjs` | a text without `id:` gives no finding |
| M06 | `artifacts/checks.mjs` | `formatChecks` drops the identifier finding |
| M07 | `artifacts/checks.mjs` | `formatChecks` gives it twice |
| M08 | `dashboard/built.json` | names `jobs-view.mjs`, which is not there |
| M09 | `dashboard-app.mjs` | the route imports every view's file, built or not |
| M10 | `dashboard/built.json` | loses `how-view.mjs`, which is built |
| M11 | `dashboard/how-view.mjs` | a `fetch(…)` call of its own |
| M12 | `git-host.mjs`, `review-core.mjs` | `readBlob` and `lastAccepted` both skip the hash check |
| M13 | `git-host.mjs` | `readBlob` alone skips it |
| M14 | `review-core.mjs` | `lastAccepted` alone skips it |
| M15 | `dashboard/review-views.mjs` | a refused Accept never gets the GitHub path |
| M16 | `dashboard-app.mjs` | `writeAccessRefused` takes a used-up limit for missing write access |
| M17 | `dashboard-app.mjs`, `dashboard/review-views.mjs` | `writeAccessRefused` and `githubPath` treat a GitLab product as GitHub |
| M18 | `settings-store.mjs` | `setTokenTest` keeps nothing |
| M19 | `settings-store.mjs` | `setGitLabTokenTest` keeps nothing |
| M20 | `settings-store.mjs` | `setToken` keeps the old token's test |
| M21 | `settings-store.mjs` | `clearToken` leaves the test |
| M22 | `dashboard/settings-view.mjs` | the export leaves out the `-tested` entries |
| M23 | `dashboard/settings-view.mjs` | the token line no longer names `agent-m.github-token-tested` |
| M24 | `review-core.mjs` | imports `readFile` from `./git-host.mjs` |
| M25 | `review-core.mjs` | a kernel function calls `fetch` |
| M26 | `review-core.mjs` | `lastAccepted` takes the record committed first |
| M27 | `review-core.mjs` | `lastAccepted` guesses between two records of one instant |
| M28 | `settings-store.mjs` | the GitHub token's test is dropped when a store is made (each page load) |
| P01 | `dashboard/writes.mjs` | repair: no `fetchText` in its import (static) — case 9 passes, 10 stays red |
| P02 | `dashboard/writes.mjs`, `dashboard/settings-view.mjs` | repair: neither `fetchText` nor `gitlabProject` imported — cases 9 and 10 pass |
| P03 | `artifacts.mjs` | repair: `identifierKept` reads CR LF as LF — case 5 passes |

Two first versions were wrong and corrected before the series: a fixture token with a `-` (no GitHub token has one; the page
refuses it at *Store token*, so case 26 failed on the fixture, not on the code), and the name pattern of M12/M14, which first left
case 16 out of the run.

## Findings

Each is a rule or flow of the strand's items that `sprint/02` does not carry out as written. Each stays marked `{ todo }` with
the item it sends back to Development; the gate for strand A is decided only when no release test of it carries a mark.

**A1 — a shell reads through the git host's internal request helper (ITM-130).** ITM-130: "no file of MOD-dashboard-app imports
`fetchText`"; MOD-git-host: the request helper "is internal and no caller sets a header"; ITM-142: "no shell file reads past what
MOD-git-host provides". Path: `docs/assets/dashboard/writes.mjs:13` imports `fetchText` → `:94` `addProduct` (UC-001 step 5) →
`:113` `fetchText("https://api.github.com/repos/<repo>/git/trees/<branch>?recursive=1", {}, token)`. Ist: the tree of a GitHub
product's default branch is read with the helper. Soll: through a provided read — `readSnapshot({ product, ref, token })` returns
the tree of the branch resolved to one commit, one request more. The implementer recorded it as open, "a change request to
akmaier" (`docs/measurements/2026-10-01_reads-leave-the-kernel.md`, section 4), because the fake GitHub of
`tests/review-core.d/dashboard-writes.test.mjs` does not answer that request; ITM-130's own criterion allows the stop only when a
read "has no counterpart among the functions MOD-git-host provides", and this one has one. Case 9 (and 10).

**A2 — a shell reads a GitLab project through a name MOD-git-host does not provide (ITM-130).** Path:
`docs/assets/dashboard/settings-view.mjs:17` imports `gitlabProject` → `:829` `checkGitLab` (UC-001's Check, UC-042's Test of a
GitLab token) → `:832` `gitlabProject({ product, token })` → `GET <server>/api/v4/projects/<id>` with the project token. Ist: a
read past `provides` (`gitlabProject` is not among MOD-git-host's 16 names). Soll: a provided read; `repositoryInfo` reads the same
project but does not report `path_with_namespace`, which `checkGitLab` uses to tell a GitLab server — so here the interface lacks
the field: the change request to akmaier that ITM-130's criterion calls for. Recorded as open by the implementer (same section).
Measured: the dashboard files import, outside `provides`, `REPO_RE` (a pattern, not called), `isGitLab`, `gitlabTokenPageUrl`,
`tokenListUrl`, `writeRoute`, `webFileUrl`, `newFileUrl`, `editUrl`, `gitlabProject`, `tokenIdentity`, `fetchText`,
`commitFilesGitLab` and `writeFiles`; the probe of case 10 calls each function as a read is called, and exactly `gitlabProject` and
`fetchText` send a request. Case 10.

**A3 — a batch Accept refused for missing write access gets no GitHub path (ITM-133).** UC-008 4a: "The commit is refused; the
dashboard says so and offers the GitHub path"; ITM-133: "a link to GitHub's new-file page prefilled with the approval record, as
without a token" — and without a token the review page offers one prefilled page per record (`review-views.mjs:787`). Path:
`docs/assets/dashboard/review-views.mjs:331` `wireBatch` (Accept ticked, 3d) and `:831` (Accept all, 3e) call `runAccept` without a
`githubPage` → `:291` `runAccept` → `:308` `if (githubPage && app.writeAccessRefused(e))` is false → `:311` `out.textContent =
app.writeErrorText(e)` → `dashboard-app.mjs:199–201` `writeRefusalText` "Your token cannot write to akmaier/agent-m (POST /git/trees: 403 …). Extend it in
Settings, or remove it to use GitHub's page instead." Ist: words only, no link — for 3e measured with a scratch run as well. Soll:
the GitHub path, one prefilled new-file page per ticked record. Reading R1 below: 4a is read as the alternative of every acceptance
commit of UC-008, not of step 4's alone. Case 21.

**A4 — a Save refused for missing write access gets no GitHub route (ITM-133).** WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE
FALLBACK: "accepting and editing open GitHub's web interface"; ITM-133 realises it "— the same route, offered when the token cannot
write"; UC-018 6b: "The commit is refused; as in UC-008 4a, the dashboard offers the GitHub route". Path:
`docs/assets/dashboard/review-views.mjs` `wireCommon` → the `[data-edit-save]` handler → `saveReviewedFile` throws the 403 →
`:374` `out.textContent = app.writeErrorText(e)` → `dashboard-app.mjs:199–201` `writeRefusalText`, without `githubPage` → "… Extend it in Settings, or remove it to use GitHub's
page instead." Ist: the path named in words only — the state ITM-133 was written to end, here for the edit. Soll: GitHub's editor of
the file, as Edit offers without a token (UC-008 3b: the text to the clipboard, `https://github.com/<repo>/edit/main/<path>`).
Case 22.

**A5 — `identifierKept` refuses a CR LF text that keeps its identifier (ITM-126).** AN EDITED FILE KEEPS ITS IDENTIFIER refuses
only a text "whose identifier differs from the one it was opened with". Path: `docs/assets/artifacts.mjs:193` `identifierKept` →
`:196` `parseFrontMatter(t)` → `:11` `if (!text.startsWith("---\n")) return { fields: {}, body: text }` → back in
`identifierKept`, `fields.id` is undefined → finding "the file was opened as UC-001, but the text carries no identifier", line 1.
Ist: a finding for `---\r\nid: UC-001\r\n…`. Soll: none. Not reached through the dashboard's editor today — a browser's textarea
gives its value with LF line ends —; reached through `formatChecks` (the named checks of a drafting job's correction loop, ARC-007)
for a CR LF draft or file. The cause is in `parseFrontMatter`, which every reader of MOD-artifacts shares; the case names only the
identifier rule. Case 5.

## Readings where the documents were open

- **R1** — UC-008 4a stands under step 4, the single Accept; 3d and 3e write "one commit" of their own. 4a is read as the reviewer's
  missing write access at any acceptance commit, so 3d/3e are expected to offer the GitHub path "as without a token" (A3).
- **R2** — the editing half: ITM-133 realises a rule that names "accepting and editing", and UC-018 6b points to UC-008 4a; a
  refused Save is expected to offer GitHub's route for the edit (A4). UC-018 is not among the strand's use cases.
- **R3** — "reads past what MOD-git-host provides" is read as: a name a shell takes from the git host, not in `provides`, that
  sends a request. Non-provided names that send nothing (`REPO_RE`, `isGitLab`, the link builders, `tokenIdentity`) and the
  non-provided writes (`writeFiles`, `commitFilesGitLab`, refused without an authority before any request) are not counted here;
  whether code and module files agree on interfaces is ITM-138's.
- **R4** — a text with CR LF line ends keeps its identifier when its `id:` is unchanged (A5).
- **R5** — "every address of today" is every route of the shell's table plus the detail addresses of the views built; "built" is
  read from the disk, not from `dashboard/built.json`.
- **R6** — A FINDING READS LIKE A COMPILER MESSAGE: the one fixed form is written from the SPEC's example, since
  MOD-job-harness `formatFinding` is not built; the artifact of the identifier finding is the identifier the file was opened with,
  as in the example (`UC-007:12: …`).
- **R7** — "✗ refused — … at the last use": no expectation is written for a refused token whose next use succeeds without a *Test*
  (note on case 24). A token's kept test belongs to that token: a new value starts untested (case 26).
- **R8** — UC-018 3b ("*Save* is disabled and the reason is shown") is not tested: UC-018 is not the strand's; the rule says
  "saving is refused", which cases 1–2 test. Tests are not edited on the dashboard, so "or test" of the rule is not reachable there.

## Not covered here, and why

- UC-006 4c (no GitHub page for a product's SPEC change) is not the strand's use case; without a token it is R2 of ITM-141
  (ITM-149), and the implementers' `write-refused.test.mjs` covers the refused write.
- A remote session's line (ITM-136 keeps its test too): its *Test* reaches a bridge through the jump host, which the harness does
  not serve; the implementers' `dashboard-settings-last-test.test.mjs` has a case.
- `deriveTarget` (ITM-130): the harness serves the page from one Pages address only; `tests/test_instance_target.py` guards it.
- No test case carries a `TST-` identifier (ARC-020 decision 2; ITM-139, ITM-140).

## Overlaps with the implementers' tests (read after the release tests were written)

`tests/review-core.d/artifacts.test.mjs` (ITM-126) has a case for a use case with another identifier or none — not for a decision,
a module, `formatChecks` or CR LF. `tests/dashboard-shell.test.mjs` (ITM-129) covers cases 7–8 by name, with `built.json` itself
checked against the table. `tests/review-core.d/dashboard-app.test.mjs` (ITM-130) has "the kernel never reads through the git
host" and "the shells read only through what the git host provides — no file of the dashboard imports fetchText"; the latter
passes on `sprint/02` because it names `dashboard/writes.mjs`'s read as an exception (`DIRECT_READ`) — the release case 9 makes no
exception (A1); none of their names covers `gitlabProject` (A2). `tests/review-core.d/write-refused.test.mjs` (ITM-133) covers cases
18–20, a 401, UC-006 4c, and `writeAccessRefused` — no batch (A3) and no Save (A4). `tests/dashboard-settings-last-test.test.mjs`
(ITM-136) covers cases 23–29 by name, plus a successful Test after a refusal, Clear everything, a GitLab token changed or cleared, a
remote session and 6a; its reload loads the page at `#uc` without a token and then puts the entries into the store, where the
release file's reload has them in the store before the app is imported.
