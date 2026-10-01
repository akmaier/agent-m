# parseFrontMatter reads a CR LF front matter — the red first commit and the counter-proofs (ITM-126, finding A5)

**MESSUNG** — 2026-10-02, branch `team/ITM-126-a5` (from `sprint/02` at `5957157`), pull request #66, macOS, Node 25.9.0,
Python 3.14.6; CI runs Node 22. Author: developer-opus-a (claude-opus-5-5). ITM-126 taken up again after Release testing
(`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*; finding A5 of
`docs/measurements/2026-10-02_release-tests-sprint-02-a.md`, case 5). Module: MOD-artifacts only.

## 1. The path

`docs/assets/artifacts.mjs` `identifierKept(openedId, text)` → `parseFrontMatter(t)` → `if (!text.startsWith("---\n")) return
{ fields: {}, body: text }` → `fields.id` undefined → the finding "the file was opened as UC-001, but the text carries no
identifier", line 1. Ist, for the fixture use case with CR LF line ends opened as UC-001: that finding (seen in the red run below,
`actual: { artifact: 'UC-001', line: 1, … 'no identifier' }`). Soll: `null`. The fix sits at the shared node, `parseFrontMatter`:
it opens a front matter at `---\n` or at `---\r\n`, closes it at the same line end (`\n---\n` or `\r\n---\r\n`), splits its lines
at that line end — so no value keeps its CR —, and returns as body the text's own bytes after the closing line. For an LF text
the steps are those of before: open after 4 characters, close at `\n---\n`, split at `\n`, body after 5 characters.

## 2. The first commit is red

`89a494a` holds only tests: two new tests in `tests/review-core.d/artifacts.test.mjs` — "front matter with CR LF line ends: the
fields of the LF text, the body the text's own bytes" and "AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps
its identifier; another one is still named" — and the `{ todo }` mark of case 5 removed from
`tests/release-sprint-02-a-artifacts.test.mjs` (its expectation unchanged).

| Run | Before (`5957157`) | Red commit `89a494a` | With the fix |
|---|---|---|---|
| `node --test tests/*.test.mjs` | tests 494, pass 479, fail 0, todo 15 | tests 496, pass 479, fail 3, todo 14 — the three tests above | tests 496, pass 482, fail 0, todo 14 |
| `cd tests && python3 -m unittest` | — (see note) | Ran 361, FAILED (failures=1, expected failures=6) | Ran 361, OK (expected failures=6) |

The one Python failure on the red commit is `test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec`, which runs the Node suite as CI
runs it and fails when that suite fails — here on the three red tests. Note: the Python run before the change was started on
`5957157` and the test files were edited while it ran; it ended the same way (361, failures=1) for the same reason, so it is not
recorded as a clean baseline. In CI both runs of the red commit failed in the step *Python checks* on that test, and *Dashboard
core* was skipped: run 36939307221 (push) and run 36939375119 (pull request).

## 3. An LF text is parsed as before

A script (not committed) parsed every tracked file with extension `md`, `mjs`, `js`, `py`, `txt`, `json` or `yml` — 1067 files,
362 of them with an LF front matter — with `parseFrontMatter` before the fix (`git show 89a494a:docs/assets/artifacts.mjs`) and
after it: **0** results differ (fields and body compared as JSON). Known positive of the comparison: the CR LF copy of each of the
362 differs from the old reader's result in **362** cases, and under the new reader gives the LF text's fields and the LF body with
CR LF line ends in **362** cases.

## 4. Counter-proofs

**Method.** A script (not committed) replaced one exact string in `docs/assets/artifacts.mjs` at a time, ran
`node --test tests/*.test.mjs`, listed the failing tests from node's `✖` lines, and restored the file byte for byte (checked:
`restored: true`; `git status` showed only the intended change afterwards). Every row is red.

| Planted fault | Red (node) |
|---|---|
| F1 the reader before the fix: only `---\n` opens a front matter | "front matter with CR LF line ends …"; "AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends …"; release "ITM-126 identifierKept: a text with CR LF line ends …" |
| F2 CR LF lines split at LF: every value line keeps its CR | the same three |
| F3 the body loses its CRs (normalised to LF) | "front matter with CR LF line ends …" |
| F4 the body cut at the LF length of the closing line | "front matter with CR LF line ends …" |
| F5 `identifierKept` passes every CR LF text | "AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends …"; release "ITM-126 identifierKept: a text with CR LF line ends …" |

Each new test is red under at least one fault: the parser test under F1–F4, the identifier test under F1, F2 and F5 (F5 only by
its counter-proof half — another identifier in a CR LF text is still named).

## 5. Callers read, nothing outside the module changed

Every reader of `parseFrontMatter` on `sprint/02`: inside MOD-artifacts `artifacts.mjs` (`parseArchitecture`, `identifierKept`),
`artifacts/checks.mjs`, `artifacts/identity.mjs` (two), `artifacts/use-cases.mjs` (`layout`, whose line numbers are counted on
`\n` and stay right for CR LF); outside it `dashboard/backlog-view.mjs`, `dashboard/review-views.mjs` (two), `dashboard/writes.mjs`
(MOD-dashboard-app) — none of them changed. Tests asserting what it returns: `tests/review-core.d/artifacts.test.mjs` and
`tests/review-core.d/dashboard-app.test.mjs:268`, both LF texts, both green and unchanged. A CR LF text now gives its fields to
every one of these readers; for LF texts nothing changes (section 3).
