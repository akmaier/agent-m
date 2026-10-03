# A refused batch acceptance and a refused save offer the GitHub route — the red first commit and seven planted faults

**MESSUNG** — 2026-10-03, branch `team/ITM-151` (from `sprint/03` at `0e29ab2`), macOS 26.6.2, Node 25.9.0, Python 3.14.6;
developer-opus-d (claude-opus-5-5). ITM-151 (implementation job, MOD-dashboard-app): findings A3 and A4 of
`2026-10-02_release-tests-sprint-02-a.md` — UC-008 3d/3e with 4a and UC-008 3a with 4a, UC-018 6b.

## 1. The path, before and after

**Batch.** *Accept ticked* (`review-views.mjs` `wireBatch`) and *Accept all* (`viewReviewAll`, the `[data-accept-all]` handler)
→ `runAccept` → `writes.mjs` `acceptItems` → `git-host.mjs` `commitFiles`, which throws `POST /git/trees: 403 …` with
`status: 403` → the `catch` of `runAccept`.

- **Before:** the two batch callers passed no GitHub page; the `catch` set the result line to `app.writeErrorText(e)` — "Your
  token cannot write to `<repo>` (…). Extend it in Settings, or remove it to use GitHub's page instead." No link.
- **After:** `runAccept` takes `pageOf(item)` and `batch`. *Accept ticked* passes the page `acceptPanel` kept for each ticked
  item by its session key (`githubPages`, ITM-133); *Accept all* passes `reviewItemPage(app, item)` — `githubPath` of the
  item's record, the same `newFileUrl(T.repo, T.ref, approvalPath(id, blob), recordText(record))` the *Accept all* panel lists
  without a token (that list now uses the same helper). The `catch` calls `refusedAcceptHtml(app, e, pages, batch)`: when
  `app.writeAccessRefused(e)` holds and at least one record has a page, the result line is the sentence — for a batch
  "… commit the records on GitHub's pages instead — GitHub's page commits one file at a time, so there is one page per record:
  without write access GitHub makes each commit a pull request, and each acceptance counts once a maintainer merges it." — and
  one line per record: its label and *Open in GitHub to commit ↗*. A record without a page (a product's SPEC change, UC-006 4c)
  is named as having none. Otherwise the text of before. The single *Accept* goes through the same helper with `batch` false
  and shows exactly what ITM-133 showed.

**Save.** `wireCommon` → the `[data-edit-save]` handler → `writes.mjs` `saveReviewedFile` → `commitFiles` throws the `403` →
the handler's `catch`.

- **Before:** `out.textContent = app.writeErrorText(e)` — the sentence only.
- **After:** `refusedSaveHtml(app, e, path)`: when the product is not GitLab, the refusal is not "changed since you opened it"
  (ITM-131) and `app.writeAccessRefused(e)` holds, the result line is "… Extend it in Settings, or commit your edit in GitHub's
  editor instead — the button copies your text and opens the editor: without write access GitHub makes your commit a pull
  request, and the edit counts once a maintainer merges it." with the button *Copy & open GitHub editor ↗*
  (`data-edit-commit="<path>"`) — the control *Edit* offers without a token (UC-008 3b). It is wired to the same handler as that
  control (`openEditor`, now one function): the text to the clipboard, `editUrl(T.repo, T.ref, path)` opened; the text is not
  in the URL (`NO TEXT TRAVELS IN A URL`). The edit stays in the textarea. Every other refusal shows the text of before.
- `writeRefusalText` (`dashboard-app.mjs`) gains the options `githubPages` and `githubEdit` beside `githubPage`; without them the
  text is unchanged. `writeErrorText` takes either the one page (a string, as before) or these options.
- `openEditor` reads `ev.currentTarget` before its first `await`; the handler it replaces read it after the clipboard's
  `await`, when a browser has already set `currentTarget` to `null`.

## 2. The tests

`tests/review-core.d/write-refused.test.mjs` (run through `tests/review-core.test.mjs`), eight new cases; the two release cases
of `tests/release-sprint-02-a-dashboard-app.test.mjs` without their `{ todo }` marks.

| # | Test | Expected |
|---|---|---|
| T1 | UC-008 3d·4a: Accept ticked refused (403) … links GitHub's new-file page of each record | UC-002 and UC-003 ticked; nothing written; the sentence with the 403; exactly the two pages, each prefilled with its record, not the use case's text; "pull request", "maintainer merges" |
| T2 | UC-008 3d·4a: Accept ticked counter-proof (used-up limit, 401) | each named as what it is; no "cannot write", no GitHub page |
| T3 | UC-008 3e·4a: Accept all refused (403) | as T1, on `#review/uc` |
| T4 | UC-008 3e·4a: Accept all counter-proof | as T2 |
| T5 | GitLab: a refused batch gets no GitHub page; a GitHub product's does | `reviewItemPage` null for GitLab, the page for GitHub; `refusedAcceptHtml` null for GitLab's 403, links for GitHub's |
| T6 | UC-008 3a·4a, UC-018 6b: Save refused (403) | nothing written; the edit stays; the sentence with the 403; one `data-edit-commit` control for UC-002's path; "GitHub's editor", "pull request"; no href with the edit's text, no new-file page |
| T7 | UC-018 6b counter-proof (limit, 401, changed meanwhile) | no `data-edit-commit`, no "cannot write"; the changed file: ITM-131's refusal and newer version |
| T8 | GitLab: a refused Save gets no GitHub editor; a GitHub product's does | `refusedSaveHtml` null for GitLab, the control for GitHub |
| R21 | release · UC-008 3d·4a (A3) | as written by tester-opus |
| R22 | release · UC-008 3a·4a (A4) | as written by tester-opus |

Every page-level case carries a known positive: the commit was tried (`handler POST …/git/trees` among the requests), or the
review page offers *Accept all*.

## 3. Red first commit

`8e40714` (tests only, on `sprint/03` at `0e29ab2`). Local, `node --test tests/*.test.mjs`: 512 tests, 500 pass, **7 fail**
(T1, T3, T5, T6, T8, R21, R22), 5 todo — T2, T4 and T7 pass, as counter-proofs of behaviour that already held. Python
(`cd tests && python3 -m unittest`): 366 run, **1 failure** — `test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec`, which runs
the node tests and fails because they are red; 5 expected failures. CI on pull request #80: runs `37117338713` and
`37117347997`, both **fail** (the Python step: 369 run, failures=1, expected failures=5).

## 4. Planted faults (each reverted after its run)

Run: `node --test tests/review-core.d/write-refused.test.mjs tests/release-sprint-02-a-dashboard-app.test.mjs` (F5 also with
`tests/review-core.d/refused-save.test.mjs`).

| Fault | Change | Red |
|---|---|---|
| F1 | `wireBatch` passes `() => null` as `pageOf` | T1, R21 |
| F2 | `viewReviewAll` passes `() => null` as `pageOf` | T3 |
| F3 | `refusedAcceptHtml` without its `writeAccessRefused` check | T2, T4, T5, and ITM-133's three counter-proofs (two in this file, one release case) |
| F4 | the save handler's route set to `null` | T6, R22 |
| F5 | `refusedSaveHtml` without any of its three checks | T7, T8, and ITM-131's two "A REFUSED SAVE KEEPS THE EDIT" cases (a changed file offered the route) |
| F5a | `refusedSaveHtml` without its `writeAccessRefused` check only | T7 (the used-up limit offered the editor) |
| F6 | `reviewItemPage` with `newFileUrl` instead of `githubPath` (GitLab ignored) | T5 |

F5b — `refusedSaveHtml` without its `changedMeanwhile` check only — stays green: the changed-meanwhile error carries no status,
so `writeAccessRefused` already answers false for it, unless its message names a path containing `403` or `404`
(`writeAccessRefused` then falls back to the message). The check guards that case; no test here names such a path.

## 5. Green

Local after the implementation: node 512 tests, **507 pass, 0 fail, 5 todo** (7 before this item: A3 and A4 are ordinary
tests now); Python as on `sprint/03`. One expectation outside the new tests changed: `tests/review-core.d/refused-save.test.mjs`
(ITM-131's counter-proof, MOD-dashboard-app) read the refusal from the result's `textContent`; the line is now written as HTML
with the editor's control, so it reads `textContent` and `innerHTML` together — the sentence it expects is unchanged.

## 6. Not covered

The click on the control inside the refused save's result line is not fired by a test: neither `tests/app-harness.mjs`
(`richDocument`) nor the release test's document reaches a control in HTML set into the result line. The control is wired to
`openEditor`, the handler of the *Copy & open GitHub editor* button that the no-token editor already offers.
