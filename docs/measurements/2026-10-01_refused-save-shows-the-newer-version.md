# A refused save shows the newer version beside the edit — the red first commit and eight planted faults

**MESSUNG** — 2026-10-01, branch `team/ITM-131` (from `sprint/02` at `21d51a8`), macOS 26.6, Node 25.9, Python 3.14.
ITM-131 (implementation job, MOD-dashboard-app): `A REFUSED SAVE KEEPS THE EDIT` — "When a save is refused, the edited text
stays in the editor, shown beside the newer version." Finding of ITM-123 (`2026-10-01_built-flows-characterised.md`, section
4): the edit stayed, the newer version was shown nowhere.

## 1. The path, before and after

*Save* → `dashboard/review-views.mjs` `wireCommon`, the `[data-edit-save]` handler → `dashboard/writes.mjs` `saveReviewedFile`
→ `git-host.mjs` `commitFiles` (GitHub) or `commitFilesGitLab`, which reads the file's blob at the branch head and throws
"`<path>` changed since you opened it — reload and look at the new text first" when it is not the blob the editor opened →
the handler's `catch`.

- **Before:** the `catch` set the result line (`app.writeErrorText(e)`) and enabled *Save* again — nothing else. The textarea
  held the edit; the page held no newer text.
- **After:** for exactly that refusal (`changedMeanwhile` — the message the write path gives for this file), the `catch` also
  calls `showNewer`: it reads the file once at the branch with the dashboard's existing reader (`app.readAt(T.ref, path)`),
  keeps the text in this browser by its blob SHA (`kept`, key `<server>/<repository>/<blob>` — the key `fileText` and
  `readByBlob` look under), and fills `.edit-newer`, a new part of the edit panel under the result line: the edit as saved
  and the newer version side by side (`.side`), then the difference from the newer version to the edit, and a folded
  explanation. The textarea is not touched. Any other refusal — a changed identifier, a missing permission, a used-up limit —
  reads nothing and shows nothing more than before. The edit panel is the same for a use case, an architecture decision, a
  module and a SPEC change proposal (`editPanel`, `wireCommon`), so all four get it.

API economy: one read beyond the save's own (`ref`, the contents JSON of the file) — the file at the branch; no snapshot and
no tree. The next page that shows the new commit finds the text under its blob SHA and does not read it again.

## 2. The tests

`tests/review-core.d/refused-save.test.mjs` — `Module: MOD-dashboard-app`, `Guards: A REFUSED SAVE KEEPS THE EDIT; A SAVE IS
REFUSED WHEN THE TEXT CHANGED MEANWHILE; UC-008; UC-006`, `Level: component`; run through `tests/review-core.test.mjs`, which
the SPEC names for the rule. The real dashboard runs in `tests/app-harness.mjs` against the harness's GitHub fake.
`richDocument` and `press` — the part of the harness's document that reaches the edit panel, written for
`tests/dashboard-review-flows.test.mjs` by ITM-123 — moved unchanged from that file into `tests/app-harness.mjs`, so that both
files use one copy; no test or asserted value of that file changed. Because these tests run in the process of
`tests/review-core.test.mjs`, each puts back the globals the harness sets when it ends.

| Test | What it checks |
|---|---|
| R1 | UC-008 3a: the use case changed on `main` after the editor opened; *Save* writes nothing; the textarea holds the edit; the result line names the refusal; `.edit-newer` names the newer version, holds it in full and the edit beside it, and the difference (`-` the newer line, `+` the edited line); the click made `ref`, the contents check and one read of the file — nothing else; a new page load with the same Cache Storage shows the newer text without reading the file |
| R2 | UC-006 3a: the same for a SPEC change proposal on the SPEC changes page; `SPEC.md` unchanged; one read of the proposal |
| R3 | counter-proof: a save the server refuses for another reason (403 on the write) keeps the edit, reads no newer version and shows none |

## 3. Red first

Commit `cd8d340` (tests only; the code of `sprint/02`):

- local: `node --test tests/*.test.mjs` — 247 tests, 245 pass, 2 fail (R1, R2: `.edit-newer` is empty — "the newer version,
  named"); the earlier assertions of both held (nothing written, the edit kept, the refusal named). R3 passes: today's
  dashboard reads nothing more on a refusal. `cd tests && python3 -m unittest` — 173 tests, OK.
- CI on pull request #44: runs `36918170934` (push) and `36918186762` (pull request), both `fail`; the log of the second shows
  the Python step passing and *Dashboard core* with `# tests 247`, `# pass 245`, `# fail 2` — `not ok 221` (R1) and
  `not ok 222` (R2).

Before the item (`sprint/02` at `21d51a8`): node 244 tests, 244 pass; Python 173 OK.

## 4. Counter-proofs

**Method.** A script (in the session's scratchpad, not committed) planted each fault below by replacing one snippet of
`docs/assets/dashboard/review-views.mjs` — refused unless the snippet occurs exactly once —, ran
`node --test tests/review-core.test.mjs tests/dashboard-review-flows.test.mjs` (181 tests), read the failing tests from
node's own report (its `✖` lines before the summary) and restored the file; after the series the two files ran green again
(181 of 181). M1 is the dashboard before this item, and is the known positive that this reading sees a failure.

| Mutation | Fault planted | Red |
|---|---|---|
| M1 | the refused save only sets the error text, as before (`showNewer` not called) | R1, R2 |
| M2 | every refused save reads and shows a newer version, whatever the reason | R3; T08 of the flows (the identifier refusal now sends a request) |
| M3 | the newer version is taken from the pinned commit — the text the editor opened | R1, R2 |
| M4 | the newer version is not kept in this browser by its blob SHA | R1 |
| M5 | the newer version is read through a new snapshot of the branch (commit, tree, file) | R1, R2 |
| M6 | the difference is shown the wrong way round — from the edit to the newer version | R1, R2 |
| M7 | the newer text is shown, the edit beside it is not | R1 |
| M8 | the refused save puts the opened text back into the editor | R1, R2, R3; T08, T09 of the flows |

Every new test is red under at least one mutation: R1 under M1, M3–M8; R2 under M1, M3, M5, M6, M8; R3 under M2, M8.

## 5. After

Implementation commit: `node --test tests/*.test.mjs` — 247 tests, 247 pass; `cd tests && python3 -m unittest` — 173 tests,
OK. No existing test or asserted value changed.
