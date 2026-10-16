# Requests of one dashboard page load, with a stored token

**MEASUREMENT** — 2026-10-17, commit measured `c7717fd1a0877d9253fec798d4fa5514bd8d80c9` (`origin/main`, the merge of #638),
macOS, Node 26.12. For ITM-574, lead list in `docs/backlog/ITM-574-a-dashboard-page-loads-with-a-bounded-number-of-requests.md`.
Nothing here changes a product file or a test.

## 1. Method

**What runs.** The live loading code, `docs/assets/dashboard-app.mjs` (the only script `docs/index.html` loads), imported fresh
for every load by `openDashboard` of `tests/app-harness.mjs` — the harness `tests/load-per-view.test.mjs` uses (AGENTS.md §6a.1).
`openDashboard` stores the harness token `github_pat_HARNESS0123456789abcdefghij` in the page's `localStorage`; no real token, no
request to github.com, no credential anywhere. The page's `fetch` is the harness's `repoServer(...).fetch`.

**The fake host.** `repoServer({ files })` serves the REST endpoints a load reads (`/commits/<ref>`, `/git/trees/<sha>?recursive`,
`/contents/<path>`, `/git/blobs/<sha>`, `/pulls`, repository) from `files`. `files` is every one of the 4,011 files of commit
`c7717fd1`, taken with `git archive c7717fd1…` into a scratch folder and read as UTF-8, so the blob SHAs the approval records name
(`docs/approvals/…`) are those of this repository. The harness answers every commit with its own placeholder commit
`c0ffee000…`; the tree is the one of `c7717fd1`. It serves no GraphQL endpoint (`POST /graphql` answers 500).

**What is counted.** A wrapper around `server.fetch` appends one entry per request: `REST <method> <path with the owner and
repository removed, the path, sha and ref replaced by a placeholder>`, or `GraphQL` for `POST /graphql`. The wrapper counts what
the page sends; the harness's own labels (`file …`, `tree`) are not used. A load counts from the call of `openDashboard` until the
page has had nothing in flight for 40 turns of the event loop (`settle`); `page.go(hash)` counts a route change the same way.

**Positive controls** (AGENTS.md §6a.2).
- Known positive for the harness: `node --test tests/load-per-view.test.mjs` passes, 10 of 10, on this commit.
- Known positive for the GraphQL count: on the same fake host, `connect(…, { token }).readSnapshot("main")` followed by
  `snapshot.readMany(["SPEC.md", "AGENTS.md"])` sends `GET /commits/main`, `GET /git/trees/<sha>` and `POST /graphql`. The wrapper
  would have shown `GraphQL`; it showed none in any dashboard load below.
- Duplicates: the 49 `/contents/` requests of the start page name 49 different paths, none twice.

**In-page measures** (rows 4a to 4f). `loadSnapshot`, `reloadAndRoute` and `readAt` are not reachable from outside the module. These
rows ran on a scratch copy of `docs/` and `src/`, outside the repository, in which one statement was added after `app = context();`
in `start()`: `globalThis.__ctx = app;`. Nothing else differs (`diff -r` of the two `docs/assets` folders shows that line only). The
copy is not committed.

**Reload.** "A second load in the same tab" is measured as a reload: a second `openDashboard` on the same server, so a new import of
`dashboard-app.mjs`, a new host and an empty memo, with the browser's other state as the harness gives it (the token only).
Rows 4a and 4b are the other reading: `loadSnapshot` run again inside the live page, the same host and the same memo.

## 2. Counts

Start page = `#` (the use-case list). Items are the use-case files of `docs/use-cases/` (49 files, README included).

| # | What | Total | REST | GraphQL | By endpoint |
|---|---|---:|---:|---:|---|
| 1 | First load, start page | 51 | 51 | 0 | `/commits/<ref>` 1, `/git/trees/<sha>?recursive` 1, `/contents/<path>` 49 |
| 2 | Second load (reload) of the same unchanged commit, start page | 51 | 51 | 0 | same as row 1: `/commits/<ref>` 1, trees 1, `/contents/<path>` 49 |
| 1a | Then, in the same page, open one item page (`#uc/UC-001-add-a-managed-product`) | 0 | 0 | 0 | none: its text and records were read for the list |
| 1b | Then, in the same page, route change to `#arc` | 89 | 89 | 0 | `/contents/<path>` 89 |
| 1c | Then, in the same page, route change to `#spec` | 114 | 114 | 0 | `/contents/<path>` 108, `/commits/<ref>` 2, trees 2, repository `GET /` 2 |
| 1d | Then, in the same page, back to the start page | 0 | 0 | 0 | none |
| 3a | First load straight onto the item page `#uc/UC-001-add-a-managed-product` | 50 | 50 | 0 | `/commits/<ref>` 1, trees 1, `/contents/<path>` 48 |
| 3b | First load at `#arc` | 91 | 91 | 0 | `/commits/<ref>` 1, trees 1, `/contents/<path>` 89 |
| 3c | First load at `#spec` | 116 | 116 | 0 | `/contents/<path>` 108, `/commits/<ref>` 3, trees 3, `GET /` 2 |
| 3d | First load at `#backlog` | 563 | 563 | 0 | `/contents/<path>` 560, `/commits/<ref>` 1, trees 1, `/pulls` 1 |
| 3e | First load at `#settings` | 11 | 11 | 0 | `/contents/<path>` 3, `/commits/<ref>` 3, trees 3, `GET /` 2 |
| 4a | `loadSnapshot()` again, same host, same commit | 2 | 2 | 0 | `/commits/<ref>` 1, trees 1 |
| 4b | `reloadAndRoute()` again, same host, same commit (re-render included) | 2 | 2 | 0 | `/commits/<ref>` 1, trees 1 |
| 4c | `readAt(head, p)`, `p` already shown on the page | 2 | 2 | 0 | `/commits/<ref>` 1, trees 1 |
| 4d | `readAt(head, p)`, `p` not read before | 3 | 3 | 0 | `/commits/<ref>` 1, trees 1, `/contents/<path>` 1 |
| 4f | One file changed on the server, then `reloadAndRoute()` (the load after an accept) | 11 | 11 | 0 | trees 1, `/commits/<ref>` 1, `/contents/<path>` 9 |
| 4e | Then `readAt` of three paths on the new head (one acceptance of three files) | 7 | 7 | 0 | `/commits/<ref>` 3, trees 3, `/contents/<path>` 1 |

Every one of the 49 start-page reads is a use-case file (`docs/use-cases/…`): the list shows 48 use cases and the README with the
statuses of their records. The tree request returns all 4,011 paths of the commit; the page asks for no GraphQL request in any row.

## 3. The leads, at their failure node

**Lead 1 — every file read is one REST request; the loading code never calls `readMany`. CONFIRMED.**
- Path: `docs/assets/dashboard-app.mjs:288` `fileText(path)` → `readByBlob({ sha, read })` (`docs/assets/review-core.mjs:217`) →
  `read()` → `snapshot.read(path)` (`dashboard-app.mjs:294`) → `Snapshot.read` (`src/repository-hosts/index.mjs:230`) →
  `adapter.readFile` (`src/repository-hosts/github.mjs:223`) → `GET /contents/<path>?ref=<commit>`, one for each path.
- Evidence: `git grep -n readMany -- docs/assets` finds nothing; the same grep over `src/` finds `src/trace-graph/build.mjs:185`
  and `src/job-runner/tools.mjs:119`. Counts: rows 1 to 3 show GraphQL 0 and `/contents/<path>` 49 for the start page, 89 for
  `#arc`, 108 for `#spec`, 560 for `#backlog`. The wrapper shows `POST /graphql` for a `readMany` call (positive control above).
- What the count shows beyond the lead: the start page's 51 requests are 2 snapshot requests and 49 single-file reads. A batch of
  `readFiles` (`github.mjs:234`, at most `BATCH` = 100 paths per request, `github.mjs:19`) would replace the 49 by a few GraphQL requests; this
  measurement does not measure that.

**Lead 2 — the cross-load cache was removed. CONFIRMED, with a correction of the commit.**
- Path: `dashboard-app.mjs:288` calls `readByBlob({ sha: e.sha, read })` with no `cache`; `review-core.mjs:217` then has
  `keep = Boolean(cache) && …` false, skips the cache and calls `read()`. `start()` runs `retireFileTexts()`
  (`dashboard-app.mjs:622`), which deletes the Cache Storage `agent-m-file-texts`.
- Evidence: row 2 equals row 1, 51 requests with 49 reads, on the same unchanged commit.
- Correction to the lead: the code was changed by `d8c69b76` (2026-10-10 22:48, "Compose Settings tabs and acknowledgement fix for
  Sprint 19"): its diff of `docs/assets/dashboard-app.mjs` removes `kept = fileTexts()` and `cache: kept` from `fileText`, and adds
  the deletion of `agent-m-file-texts`; `docs/assets/settings-store.mjs` loses 47 lines. `b9a65089` (2026-10-10 23:08, trailer
  `Agent-M-Participant: developer-terra-e`) changed only tests: in `tests/load-per-view.test.mjs` it replaced "a second load on an
  unchanged tree reads no file" (`assert.deepEqual(again.requests, ["commit", "tree"])`) by "reads its displayed files again"
  (`assert.deepEqual(files(again.requests), files(first.requests))`, now line 152) and removed the counter-proof of the forged kept
  text. Which accepted text required the removal is not decided by this measurement.

**Lead 3 — within one load, `loadSnapshot`'s reset of `memo` causes a request. REFUTED for an unchanged commit; bounded for a changed one.**
- Path: `loadSnapshot` (`dashboard-app.mjs:266`) resets `memo` only when `state.commit !== before`. With the same host
  (`currentHost()`, `dashboard-app.mjs:212–220`) and the same commit, row 4a and row 4b send 2 requests (the commit and the tree,
  `github.mjs:162–168`) and no `/contents/` request.
- With a changed commit (row 4f), `memo` is reset and the page sends 2 snapshot requests and 9 reads, not 49: the host's `texts`
  (`src/repository-hosts/index.mjs:195`, kept by blob SHA for the host's life) answers the unchanged blobs.
- Not shown by the count, and left open: the 9 reads of row 4f are the changed file and what the status of a file whose new text has
  no record reads; which of them are needed was not traced.

**Lead 4 — a snapshot per read in `readAt`. CONFIRMED.**
- Path: `dashboard-app.mjs:270` `readAt = (head, path) => currentHost().readSnapshot(head).read(path)` → `readSnapshot`
  (`index.mjs:204`) → `adapter.snapshot` (`github.mjs:162–168`): `GET /commits/<head>` and `GET /git/trees/<head>?recursive=1`, two
  requests for every call, then `read(path)`.
- Evidence: rows 4c (2, path already read: no `/contents/`, the host's `texts`), 4d (3: 2 + 1 read) and 4e (7 for three paths: three
  snapshots of 2 plus 1 read; two of the three texts were held by blob SHA). One acceptance of n files sends 2n snapshot requests
  (`dashboard/writes.mjs:72` calls `readAt` once for each path the plan reads).

## 4. Also found

- **Other views open hosts of their own.** `#spec` (`dashboard/spec-changes-view.mjs:21–22`) calls `connect()` twice, for the
  instance and for the product, and so sends further snapshot requests (rows 1c, 3c: 2 repository `GET /`, 2 extra commit and tree
  pairs) and reads its files through hosts with empty `texts`. `process-view.mjs:27–28`, `release-view.mjs:9–10`,
  `roles-view.mjs:19–20` and `backlog-view.mjs:442` do the same; only `#spec`, `#backlog` and `#settings` were loaded here.
- **Open item page costs nothing after the list** (row 1a): the list has read the text and the records of the use cases already.

## 5. Not measured

- The bar's reads (`productFacts` in `src/prompt-bar/hand-over.mjs`, the poll of `follow.mjs`, the notification check in
  `src/notifications/checks.mjs`). `startNotifications` (`dashboard-app.mjs:475`) returns before it connects when the global
  `Notification` is absent, as in node; a browser defines it, so a real tab's count may be higher than rows 1 to 3 by what
  `watchForAcceptance` sends.
- Used-up limits, the headers a real GitHub sends, the real file sizes, concurrency, and the views other than `#`, `#uc/…`,
  `#arc`, `#spec`, `#backlog` and `#settings`.
- Any bound. No text bounds a page load's requests; this file draws none.

## 6. Repeating it

1. `git archive c7717fd1a0877d9253fec798d4fa5514bd8d80c9 | tar -x -C <scratch>/tree`.
2. Copy `docs/` and `src/` of the same commit to `<scratch>/copy/` and add `globalThis.__ctx = app;` after `app = context();` in
   `copy/docs/assets/dashboard-app.mjs` (rows 4a to 4f only).
3. A Node script that reads the tree folder into `files`, imports `openDashboard` and `repoServer` from `tests/app-harness.mjs`,
   wraps `server.fetch` as in §1, and runs `openDashboard({ server })`, `page.go(hash)` and, for rows 4a to 4f,
   `openDashboard({ server, assets: new URL("file://<scratch>/copy/docs/assets/") })` with `globalThis.__ctx`.
