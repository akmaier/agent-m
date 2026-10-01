# A write refused for missing write access offers the GitHub path as a link — the red first commit and seven planted faults

**MESSUNG** — 2026-10-01, branch `team/ITM-133` (from `sprint/02` at `1a9fe75`), macOS 26.6, Node 25.9, Python 3.14.
ITM-133 (implementation job, MOD-dashboard-app): UC-008 4a — "The commit is refused; the dashboard says so and offers the GitHub
path, where the commit becomes a pull request that counts once a maintainer merges it." Finding of ITM-123
(`2026-10-01_built-flows-characterised.md`, section 3): the path was named in words ("remove it to use GitHub's page instead"),
not offered as a link.

## 1. The path, before and after

*Accept* on a reviewed file's page → `dashboard/review-views.mjs` `wireAccept`, the `[data-accept-key]` handler → `runAccept`
→ `dashboard/writes.mjs` `acceptItems` → `git-host.mjs` `commitFiles`, which throws `POST /git/trees: 403 …` with
`status: 403` when the token cannot write → the `catch` of `runAccept`.

- **Before:** the `catch` set the result line to `app.writeErrorText(e)` → `dashboard-app.mjs` `writeRefusalText`: "Your token
  cannot write to `<repo>` (…). Extend it in Settings, or remove it to use GitHub's page instead." No link; the GitHub page
  existed on the dashboard only for a browser without a token (`acceptPanel`, route `github-web`).
- **After:** `acceptPanel` computes, for the record it shows, the GitHub path — `githubPath`: GitHub's new-file page prefilled
  with the approval record, by the same `newFileUrl(T.repo, T.ref, path, recordText(record))` the panel links without a token
  — and keeps it for this page by the item's session key. When the commit is refused and `writeAccessRefused(e, product)` holds
  (GitHub, status 403 or 404, not a used-up rate limit, not a 401), the result line says so and links the page: "… Extend it
  in Settings, or commit the record on GitHub's page instead: without write access GitHub makes your commit a pull request,
  and the acceptance counts once a maintainer merges it. *Open in GitHub to commit ↗*". Every other refusal shows the text it
  showed before.
- **Not offered:** for a GitLab product (`A GITLAB PRODUCT IS WRITTEN WITH A TOKEN` — `githubPath` is `null`, and its 403 is
  GitLab's text); for a product's SPEC change (UC-006 4c: "For a product, a token is required — no product carries the
  workflow" — `githubPath` is `null` when the record's kind is `spec` and the repository is not the instance; the
  instance's SPEC change keeps it, as without a token); for a used-up rate limit (`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON
  THE TOKEN`); for a refused token (401, named with its renewal). *Accept ticked* and *Accept all* (several records in one
  commit) show the text of before; the item names the single *Accept*.
- The other callers of `writeRefusalText` — the editor's *Save*, the product settings — pass no GitHub path and get the same
  text as before.

## 2. The tests

`tests/review-core.d/write-refused.test.mjs` — `Module: MOD-dashboard-app`, `Guards: UC-008; WITHOUT A TOKEN, GITHUB'S WEB
INTERFACE IS THE FALLBACK; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; NO
TEXT TRAVELS IN A URL`, `Level: component`; run through `tests/review-core.test.mjs`. The real dashboard runs in
`tests/app-harness.mjs` against the harness's GitHub fake, which answers the commit's first write (`POST …/git/trees`) as the
test says.

| Test | What it checks |
|---|---|
| W1 | UC-008 4a: a 403 on the write — nothing written, *Accept* enabled again, the result says the token cannot write (with the 403), and links exactly one page: `newFileUrl` with `filename` = the approval path and `value` = the three-line record (not the use case's text); it says that the commit becomes a pull request that counts once a maintainer merges it; the link equals the one the page shows without a token |
| W2 | counter-proof: a 403 with `X-RateLimit-Remaining: 0` names the used-up limit, says nothing of write access, links no GitHub page |
| W3 | counter-proof: a 401 names the refused token, links no new-file page |
| W4 | a GitLab product with its token: *Accept* is offered, `githubPath` is `null`, the panel names no `github.com`; GitLab's 403 is not `writeAccessRefused` and its text names no GitHub |
| W5 | UC-006 4c: a product's SPEC change with a token — *Accept* offered, `githubPath` `null`; a product's use case keeps its path; the instance's SPEC change gets its prefilled page |
| W6 | `writeAccessRefused`: 403 and 404 yes; a used-up limit, 401, 422 and no error no |

Changed expectation, same module: `tests/dashboard-review-flows.test.mjs`, "UC-008 4a" (ITM-123's characterisation) asserted
the result line's text word for word — "…, or remove it to use GitHub's page instead." It now asserts the new sentence and the
link to `https://github.com/akmaier/agent-m/new/main?filename=docs%2Fapprovals%2FUC-002-…`; its title says "offers … as a
link" instead of "names". No release test changed; their three `{ todo }` marks stay (`release-sprint-01-dashboard-app.test.mjs`
holds no case for UC-008 4a — "4a is not carried out (ITM-133)").

## 3. Red first

Commit `134c899` (tests only; the code of `sprint/02`):

- local: `node --test tests/*.test.mjs` — 333 tests, 325 pass, 5 fail, 3 todo: W1 (no link), W4 and W6
  (`writeAccessRefused` is not a function), W5 (the instance's SPEC change got no GitHub path) and the changed UC-008 4a of the
  flows; W2 and W3 pass — today's dashboard offers no link at all. `cd tests && python3 -m unittest` — 234 tests, OK.
- CI on pull request #54: runs `36926049537` (push) and `36926070763` (pull request), both `fail`; the log of the second shows
  `# tests 333`, `# pass 325`, `# fail 5`, `# todo 3` — `not ok 54` (flows UC-008 4a), `not ok 312` (W1), `315` (W4), `316`
  (W5), `317` (W6).
- W4 and W5 read, on that commit, a `data-github-page` attribute of the *Accept* button. The implementation keeps the path
  beside the page instead (the characterisation tests pin the button's HTML), so with the implementation both ask `githubPath`
  — exported for that — what they asked the attribute; their expectations did not change.

Before the item (`sprint/02` at `1a9fe75`): node 327 tests, 324 pass, 0 fail, 3 todo; Python 234 OK.

## 4. Counter-proofs

**Method.** A script (in the session's scratchpad, not committed) planted each fault below by replacing one snippet of the
finished code, ran `node --test tests/review-core.test.mjs tests/dashboard-review-flows.test.mjs` (200 tests), recorded the red
tests and restored the file. After the last fault: 200 pass.

| Fault | Where | Red |
|---|---|---|
| M1 the refused *Accept* never shows the link | `review-views.mjs` `runAccept` | W1; flows UC-008 4a |
| M2 a used-up rate limit counts as missing write access | `dashboard-app.mjs` `writeAccessRefused` | W2; W6 |
| M3 a 401 counts as missing write access | `dashboard-app.mjs` `writeAccessRefused` | W3; W6 |
| M4 a product's SPEC change gets the GitHub path | `review-views.mjs` `githubPath` | W5 |
| M5 a GitLab product gets a GitHub path | `review-views.mjs` `githubPath` | W4 |
| M6 the link's value carries more than the record | `review-views.mjs` `githubPath` | W1; W5 |
| M7 the text beside the link is the old one | `dashboard-app.mjs` `writeRefusalText` | W1; flows UC-008 4a |

Every new test and the changed one is red on at least one fault.

## 5. After

`node --test tests/*.test.mjs` — 333 tests, 330 pass, 0 fail, 3 todo. `cd tests && python3 -m unittest` — 234 tests, OK.
