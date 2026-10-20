# The main pages: what each derives at load, and what a result precompiled per commit would replace

**MEASUREMENT** — 2026-10-19, commit measured `7f7f4e3b87acaaf991a6cfc12f6fbe8369a70306` (fake network; 5,822 files),
on the real network `main` of `akmaier/agent-m` as it stood at each load (`f37f8722ca20`, `bd0ca4388379`,
`8345118f0bd2` — `main` moved three times during the runs), macOS, Node 25.9.0. akmaier's request of 2026-10-19 is the
starting point: "many pages still construct their views on the repo state while loading the page ... I want all of the
main pages to have their loading work to be precompiled with every commit to main. The many github token calls from the
browser are just too slow". It stands beside `2026-10-18_page-loads-once-per-commit.md` and
`2026-10-18_review-all-on-the-real-network.md`, reuses their harness and method, and covers the pages they did not.
Nothing here changes a product file or a test.

## 0. Result in one screen

- **The time is the network, not the derivation.** On the fake network (each request one turn of the event loop) every
  live page is done in 0.19 to 0.34 s, module loading included. On GitHub the same pages take 3.3 to 49 s with a token,
  89 to 99 % of it with a request open. Every derivation the pages run (`statuses`, `queues`, `statusByNames`,
  `productFacts` of the main page) costs 3 to about 140 ms of CPU (fake network). What a precompiled result saves is
  **requests**, above all **requests sent one after another**.
- **Each GraphQL batch costs about 3.4 s on GitHub and the batches are sent in sequence** (as the 2026-10-18 measurement
  found for the graph): `#backlog` reads 1,027 files in 11 batches, 37.7 s of its 43.9 s.
- **The slowest pages, with a token (real network, median):**
  - Implementation `#backlog` (the entry's default view): **43.9 s**, 26 requests, 28.8 MB (11 batches; the list of
    *all* pull requests, 12 pages, 22.1 MB).
  - Main page `index.html` (`src/home/home.mjs`): **24.0 s**, 1,184 requests, 32.3 MB: 1,168 files read **one by one**
    (`snapshot.read`, no batch), and the 12 pages of pull requests. Without a token: 52.5 s.
  - `#tests` (the menu entry is not built; the address shows the use-case list without its batch): **12.9 s**, 48 files
    one after another.
  - Not yet live: Implementation *plan* 159 s (32 batches, 57 `compare` requests), MOD-main-page's *home* 115 s although
    it reads the stored overview, Tests *schedule* 21.7 s (1,303 single file reads for the test counts).
- **The fast ones:** `#uc` 3.3 s, `#arc` 4.3 s, `#spec` 5.5 s, `#roles` 3.5 s, `#process` 4.1 s, `#release` 4.0 s,
  `#settings` 3.3 s with a token. About 1 s of each is the commit and the tree (1.58 MB), which every page reads;
  `#roles`,
  `#process`, `#release` and `#settings` read the tree 3 or 4 times (4.75 to 5.38 MB), once per Host they connect.
- **Without a token** the 60 requests an hour run out: `#backlog` alone needs 14 API requests and the main page 16
  (12 of them pull-request pages); `#backlog` stopped at the 9th page with GitHub's 403 after 15.2 s. Unbatched pages
  read the raw host one file after another: `#uc` 11.8 s, `#arc` 15.8 s.
- **The stored results of `main-changed.yml` are read by no live page's default view.** `trace-cache` is read only where
  a page needs the graph or an impact list (a changed decision or module file, Review all, a trace view, a run's
  detail); at these commits every reviewed file is accepted, so no measured page read it (`readOn` counted 0 times).
  `overview-cache` is read only by MOD-main-page's route `home` (`src/main-page/home.mjs:57`), which `index.html` does
  not load; the live main page (`src/home/home.mjs`) derives its overview anew at every load.
- **Two menu entries are not built**: *Tests* and *Maintenance* have no view file in `docs/assets/dashboard/built.json`
  and no link in the menu; their addresses show the use-case list. `src/maintenance-pages/` does not exist.

## 1. Method

**What runs.** As in `2026-10-18_page-loads-once-per-commit.md` §1: the live app `src/site-frame/dashboard-app.mjs`
(the one script `docs/index.html` loads), imported fresh by `openDashboard` of `tests/app-harness.mjs` (AGENTS.md
§6a.1), **one fresh `node` process per load**. Three pages are not served by the app and are loaded through a folder the
harness' `assets` points at, as the earlier measurement did for the main page:
- the main page as `index.html` loads it: a `dashboard-app.mjs` that imports `src/home/home.mjs`;
- the module routes no live view wires — MOD-implementation-pages' `plan`, MOD-test-pages' `schedule` and `runs`,
  MOD-main-page's `home` — rendered as MOD-site-frame's `startSite` renders a route (`src/site-frame/index.mjs`, `show`:
  `readNamedFiles`, then `route.render(target, context, params)`; none of these routes declares `reads`), with the
  instance connected by the stored token and, for the Tests and Implementation routes, the instance as the chosen
  product
  (without one they answer "Choose a product …").

**Fake network.** `repoServer({ files })` of the harness over every file of `7f7f4e3b` (`git archive`, read as UTF-8),
with handlers that answer the pull requests, tags, CI state and Actions runs with empty lists (as
`tests/load-per-view.test.mjs:224` serves the pull requests of `#backlog`). No earlier commit is served: the reads of
the declared model version (`#process`, `plan`) fail there and succeed on GitHub. 5 loads per page and token.

**Real network.** The same harness with `server.fetch` the real `fetch` of Node: `api.github.com`, `/graphql` and
`raw.githubusercontent.com` of the public repository; with a token, the one of `gh auth token`, handed to the process in
the environment and never printed or stored. The pages read `main` as a person opens them (a `?ref=<commit>` makes the
review pages read the default branch a second time, one more commit and tree, so it was not used). 3 loads per page with
a token; 1 for the main page and *schedule* (1,184 and 1,309 requests each, against the account's limit), and 1 without
a token for each page the 60 unauthenticated requests of the hour allowed. Node's `fetch` opens a socket for every
request; for the two pages that send about a thousand raw reads at once without a token (main page, `#backlog`) that
failed ("fetch failed"), and they were run again with at most 6 raw requests open at once, as a browser holds six
connections to one host over HTTP/1.1. A browser on HTTP/2 multiplexes, so the real numbers of pages that read many
files at once (main page, *schedule*) are an upper bound for those, not a browser's time.

**What is counted and timed.** A wrapper around `fetch` records each request: its kind from the URL, its start, the
moment its body was read, and the body's bytes (decoded; GitHub compresses on the wire). *Requests* and *MB* are those
counts. *All done ms*: from the import of the page's script until the later of the last body read and the last change of
`<main>` (or the main page's `#cards`, `#waits`), the page then left alone for 4 s (fake: 0.4 s) with nothing in flight;
the harness' own `settle` returns earlier on the real network, while a large body is still being read. *Net ms*: the
time
at least one request was open. **Medians** of the loads, smallest and largest in brackets.

**What a page derives, and where.** A scratch copy of `src/` and `docs/assets/` (outside the repository) in which the
named functions are renamed in place and re-exported wrapped by a counter and a timer, so every line number is the
repository's: `traceGraph`, `architectureImpact`, `coverageGaps`, `requirementImpact`, `tracesTo`, `moduleOrder`,
`moduleRows`, `graphFindings`, `selfSufficiencyFindings`, `storedImpacts` (MOD-trace-graph); `statuses`, `statusOf`,
`lastAcceptedText` (MOD-approvals); `productFacts`, `storedOverview`, `waitingForAcceptance`, `stageShares`
(MOD-progress-measures); `productFacts`, `cardsFor` (`src/home/progress.mjs`); `statusByNames`
(`docs/assets/review-core.mjs`); `listJobs`, `recordsNewestFirst` (MOD-job-ledger); `queues` (MOD-spec-changes);
`testDeclarations`; and every method of each Host `connect` returns and of each Snapshot it reads (`readHistory`,
`listPullRequests`, `containsCommit`, `readOn`, `readMany` …). For each call the wrapper records the first two frames of
its stack: **the file:line given below for a derivation is the call site the stack named at runtime**, or, where the
function is not wrapped (`itemState`, `buildOrder`, `workflowOf` …), the line read in the source.

## 2. Positive controls (AGENTS.md §6a.2)

- **Requests predicted from the tree.** `#uc` without a token sends 48 raw file requests of 380,713 bytes:
  `docs/use-cases/` holds 48 `UC-*.md` files of exactly 380,713 bytes (`git ls-tree -l`), on the fake and the real
  network alike. `#arc` without a token: 71 raw requests, 0.95 MB = the 71 `ARC-*`/`MOD-*` files, 954,246 bytes.
- **Batches predicted from the tree.** `#backlog`'s first wave (`dashboard-app.mjs:322`) names `docs/process.md`,
  `SPEC.md`, the items, sprints and role assignments and — two teams — the module files: 1,027 paths with 1,027 distinct
  blobs in the tree, so ⌈1,027/100⌉ = 11 batches. Measured: 1,027 paths asked, 11 batches, on both networks.
- **The counters can count.** One direct call of the wrapped `traceGraph` over the tree counts 1 `traceGraph`, 1,314
  `testDeclarations` (the tree's 1,314 test files) and builds 5,847 nodes; one direct `statuses` counts 1 and finds
  17 decisions, 54 modules and 48 use cases, all accepted. So the 0 calls of `traceGraph`, `architectureImpact` and
  `lastAcceptedText` on every page below are counts that can be 1. *schedule* counts 1,314 `testDeclarations` and sends
  1,303 file reads: the 1,302 distinct blobs of the test files and `docs/participants.md`.
- **The cache reader is counted.** MOD-main-page's `home` counts 1 `snapshot.readOn` and 1 `storedOverview`, and its
  request to `overview-cache` returned the 3,393-byte overview of the commit read; `stageShares` was then not called.
  So `readOn` counted 0 on the other pages is a count that can be 1.
- **One batch on GitHub.** The 11 batches of `#backlog` took 3.3 to 4.1 s each (0.8 s for the last, 0.4 MB), one after
  the other, as the 2026-10-18 real-network measurement found for the graph's batches (2.4 to 3.5 s).
- **The same page each time.** For every page and token the HTML of the page was the same in all loads of the fake
  network; on the real network it was the same within a page except one *plan* load (below).

## 3. The pages

Each table: one row per network and token. *Req.* and *MB* exact; *all done* and *net* in ms, median (range); *n*
loads. Below each table, what the page derives at load, by the call site. "Real" times are GitHub's; "fake" times are
module loading and computation alone.

### 3.1 Main page — `index.html` (`src/home/home.mjs`)

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 1 | 1,184 | 32.25 | 24,045 | 23,575 |
| real | no (6 open) | 1 | 1,184 | 32.29 | 52,489 | 51,734 |
| fake | yes | 5 | 1,173 | 9.34 | 260 (256–283) | 148 |
| fake | no | 5 | 1,173 | 9.34 | 265 (252–284) | 148 |

Requests (real, token): commit, tree, **1,168 files one by one** (`contents`, 8.5 MB), **12 pages of pull requests**
(22.1 MB), the release tags (`git/matching-refs`), the Actions runs of the commit. The fake network serves an empty
list of pull requests (1 page), hence 1,173 and 9.3 MB.
- `cardsFor` `src/home/home.mjs:134`; `productFacts` `src/home/home.mjs:55` (defined `src/home/progress.mjs:62`),
  132 to 137 ms of CPU on the fake network; its text reader is `snapshot.read` (`home.mjs:54`), never `readMany`.
- inside it: `statusByNames` ×119 (`progress.mjs:68`) for the use cases and the architecture; the requirements of
  `SPEC.md` (`progress.mjs:73`); the change queues' decisions (`progress.mjs:78-79`); the items and their `buildOrder`
  (`progress.mjs:83-84`); the job records (`progress.mjs:86`); **the pull requests** (`progress.mjs:87`, through
  `pullRequests().list()` of `home.mjs:55`) and each item's `itemState` (`progress.mjs:88`); the guarded requirements
  (`progress.mjs:92`); **the tags** (`progress.mjs:93`); **the CI state of the commit** (`progress.mjs:102`).
- Reads neither `overview-cache` nor `trace-cache`.

### 3.2 Main page as MOD-main-page builds it (route `home`, not loaded by `index.html`)

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 2 | 53 | 40.34 | 114,706 (108,748–120,664) | 114,122 |
| fake (no overview stored) | yes | 5 | 56 | 33.54 | 813 (707–925) | 360 |
| fake (no overview stored) | no | 5 | 4,215 | 32.00 | 1,792 (1,491–2,320) | 1,405 |

- `storedOverview` `src/main-page/home.mjs:57` — **the one page that reads `overview-cache`** (1 request, 3,393 bytes).
- With the overview found, `productFacts` with the scope `build` (`main-page/home.mjs:67`; `facts.mjs:144`): 2,678
  paths in **30 batches (105.6 s)**, the pull requests (12 pages, 9.1 s), `statuses`, `queues` (`facts.mjs:161-162`),
  `listJobs` (`facts.mjs:164`) and again `main-page/home.mjs:68` with the live states of the jobs.
- So the stored overview replaces the shares and the list of what waits, but the card's build line still reads every
  item, gate record and job record. On the fake network (no overview) the scope `all` reads 4,217 paths in 45 batches.

### 3.3 Requirements — `#spec`

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 6 | 1.85 | 5,465 (5,131–5,506) | 5,214 |
| real | no | 1 | 124 | 1.85 | 9,252 | 9,010 |
| fake | yes | 5 | 6 | 1.09 | 214 (211–215) | 46 |
| fake | no | 5 | 124 | 1.08 | 222 (216–242) | 60 |

- `readAhead("spec")` `dashboard-app.mjs:317-318`: SPEC, `docs/sources.md`, the source register, the queues' heads,
  then the open proposals (2 batches, 239 paths, 3.5 s of the 5.5 s).
- MOD-trace-pages' `specification` view: `parseSpec` (`trace-pages/flow.mjs:476`) and the overview
  (`flow.mjs:485`); `queues` (`flow.mjs:321`, from `flow.mjs:483`) for the entries that wait; **the tags**
  (`flow.mjs:355`) for the versions; the person's own source (`flow.mjs:482`, `subject.mjs:58`).
- No graph: `traceGraph(snapshot, { commit })` (`trace-pages/flow.mjs:105`, which would read `trace-cache`) runs only
  when a row or the gaps are opened.

### 3.4 Use cases — `#uc`

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 4 | 1.99 | 3,271 (3,054–3,591) | 2,898 |
| real | no | 1 | 51 | 1.99 | 11,753 | 11,398 |
| fake | yes | 5 | 4 | 1.23 | 194 (192–202) | 43 |
| fake | no | 5 | 51 | 1.23 | 255 (251–281) | 109 |

- `readAhead("uc")` `dashboard-app.mjs:306` (1 batch of 48).
- `statuses` ×2 (`review-pages/flow.mjs:119`, from `:136` and `:179`), 7 ms; the title of each file read at
  `flow.mjs:137` **inside a loop that awaits each file before the next** — without a token 48 raw reads in sequence,
  10.8 s.

### 3.5 Architecture — `#arc`

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 4 | 2.57 | 4,286 (3,586–4,839) | 4,113 |
| real | no | 1 | 74 | 2.56 | 15,797 | 15,422 |
| fake | yes | 5 | 4 | 1.82 | 213 (208–223) | 46 |
| fake | no | 5 | 74 | 1.80 | 304 (300–318) | 141 |

- `readAhead("arc")` `dashboard-app.mjs:308` (1 batch of 125 paths: 71 files and their approval records).
- `statuses` ×4 (`review-pages/flow.mjs:119` from `:136`, `:179`), 12 ms; the titles as in §3.4 (71 raw reads in
  sequence without a token, 15.2 s).
- The component diagram: MOD-trace-pages' `modules` view (`dashboard-app.mjs:674`), the module files by schema
  (`trace-pages/flow.mjs:400`, `:426`); no graph.
- The impact lists of `trace-cache` (`storedImpacts` through `fromStored`, `review-pages/flow.mjs:363`, `:529`) are read
  only for a changed decision or module file; none at these commits.

### 3.6 Implementation — `#backlog` (the entry's view; `progress` is not built)

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 26 | 28.84 | 43,871 (37,765–49,095) | 43,039 |
| real | no (6 open) | 1 | 1,039 | 21.91 | stopped at 15,228: rate limit | 14,920 |
| fake | yes | 5 | 15 | 5.97 | 341 (338–344) | 83 |
| fake | no | 5 | 1,031 | 5.84 | 344 (343–352) | 135 |

Real, token: commit, tree, **11 batches in sequence (37.7 s)**, the model file, **12 pages of all pull requests
(22.1 MB, 8.7 s)**. Without a token the 9th page of pull requests was refused (403, the network's 60 an hour used up).
- `readAhead("backlog")` `dashboard-app.mjs:322`: 1,027 files; the approval records the use cases' statuses need
  (`recordsRead`, `dashboard-app.mjs:280`, `:283`; `statusByNames` ×48).
- `context` (`backlog-view.mjs:75-92`): the role assignments, sprints, items and module files by their schemas,
  `SPEC.md`,
  and each use case's status (`statusOf`, `backlog-view.mjs:87` → `dashboard-app.mjs:363`, `statusByNames` ×48).
- **The pull requests** (`backlog-view.mjs:110`), each item's `itemState` (`:118`), when a done item was merged
  (`mergedAtOf`, `:122`), the states (`:133`), the held items (`:155`), `buildOrder` (`:288`, `:329`), the burn-down
  (`remainingOverTime`, `:188`).

### 3.7 Implementation — `#roles` and `#process`

| Page | Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|---|--:|--:|--:|--:|--:|
| `#roles` | real | yes | 3 | 17 | 4.96 | 3,467 (3,222–3,520) | 3,327 |
| `#roles` | real | no | 1 | 17 | 4.99 | 1,127 | 794 |
| `#roles` | fake | yes / no | 5 | 17 | 2.70 | 208 / 201 | 63 / 60 |
| `#process` | real | yes | 3 | 18 | 5.72 | 4,114 (3,943–4,232) | 3,942 |
| `#process` | real | no | 1 | 18 | 5.76 | 3,032 | 2,309 |
| `#process` | fake | yes / no | 5 | 17 | 2.70 | 219 / 219 | 62 / 62 |

- Both connect the product and the instance as two Hosts and read the default branch through each
  (`roles.mjs:76-78`, `process.mjs:120-122`): with the app's own read, **the tree three times** (4.75 MB); `#process`
  reads the commit the declaration names as well (`process.mjs:228`), a fourth tree.
- The declaration, `docs/participants.md`, `SPEC.md` of the instance, the model catalogue
  (`model-catalogue/index.mjs:215`
  from `roles.mjs:81`, `process.mjs:126`), `workflowOf` (`roles.mjs:90`, `:95`; `process.mjs:237`).

### 3.8 Implementation — `plan` (built in MOD-implementation-pages, not wired into the live app)

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 2 | 111 | 70.44–70.76 | 159,290 (159,007–159,573) | 158,387 |
| fake | yes | 5 | 39 | 18.19 | 436 (431–477) | 165 |
| fake | no | 5 | 2,909 | 17.11 | 1,195 (1,142–1,465) | 945 |

A third real load ended after 84.7 s on GitHub's `502 Bad Gateway` for a batch and is not in the row.
- `productFacts` with the scope `work` (`plan.mjs:82`; `facts.mjs:189`): 2,908 paths in **32 batches (110.3 s)**;
  **the pull requests** (`facts.mjs:198`, 12 pages); `statuses` (`facts.mjs:219`); `queues` (`:220`); `listJobs`
  (`:225`); **`containsCommit` ×57** (`facts.mjs:234`), one `compare` request for each undecided sprint head, 27.0 MB,
  34.9 s.
- For Agent M the page then says its model "works from a backlog and has no implementation plan". For a planned product
  `traceGraph(facts.snapshot)` (`plan.mjs:106`) would follow — **without `commit`, so it builds the graph and does not
  read
  `trace-cache`**. Not measured: Agent M has no plan.

### 3.9 Tests — not built (`#tests`), and the routes `schedule` and `runs`

| Page | Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|---|--:|--:|--:|--:|--:|
| `#tests` (use-case list) | real | yes | 3 | 51 | 1.98 | 12,941 (12,333–14,731) | 12,785 |
| `#tests` | fake | yes / no | 5 | 51 | 1.23 | 256 / 260 | 108 / 109 |
| `schedule` | real | yes | 1 | 1,309 | 15.54 | 21,680 | 21,603 |
| `schedule` | real | no | 1 | 1,309 | 13.54 | 20,757 | 20,670 |
| `schedule` | fake | yes | 5 | 1,309 | 16.46 | 306 (299–313) | 213 |
| `runs` | real | yes | 3 | 4 | 0.44 | 1,183 (1,046–1,205) | 1,056 |
| `runs` | real | no | 1 | 4 | 0.44 | 961 | 794 |
| `runs` | fake | yes | 5 | 4 | 0.00 | 162 (126–173) | 35 |

- The menu's *Tests* names the view `tests` (`src/site/menu.mjs`), whose file `tests-runs-view.mjs` is not in
  `built.json`: the entry has no link, and `#tests` shows the use-case list (`dashboard-app.mjs:820`) **without
  `readAhead`** (`dashboard-app.mjs:741` lists no `tests`), so even with a token its 48 files are read one by one, in
  sequence (`review-pages/flow.mjs:137`): 12.9 s against 3.3 s for `#uc`. `#issues` and `#mail` do the same.
- `schedule`: `testCounts` (`schedule.mjs:72-74`): `testDeclarations` over the 1,314 test files, each by
  `snapshot.read`, **no batch** — 1,303 requests; the schedule and resources files, the instance's participants
  (`schedule.mjs:174`, a second Host and tree), `secretsNeeded` (`:188`); `queuedRuns` (`:190`) only for self-hosted
  rows (none here).
- `runs`: `readHistory` of the default branch (20), the open pull requests and the tags (`runs.mjs:381`); nothing else.

### 3.10 Releases — `#release`

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 10 | 4.79 | 3,967 (3,490–4,300) | 3,827 |
| real | no | 1 | 10 | 4.83 | 1,848 | 1,572 |
| fake | yes / no | 5 | 10 | 2.53 | 193 / 193 | 56 / 57 |

- `pendingCandidate` (`release.mjs:139-141`): `repositoryInfo`, a snapshot, `reportsAwaitingAcceptance`
  (`release-evidence/report.mjs:285`, the tags `v*`); `recordsNewestFirst` (`report.mjs:287`, `release.mjs:143`) runs
  only
  when a candidate tag exists — counted 0 here.
- `paintForm` (`release.mjs:161-163`): the tags again, a third snapshot, `nextVersion`.

### 3.11 Maintenance — not built

`docs/assets/dashboard/built.json` holds neither `issues-view.mjs` nor `mail-view.mjs`, and `src/maintenance-pages/`
(MOD-maintenance-pages) does not exist; MOD-mail-handling exports functions and no route. The entry has no link;
`#issues` and `#mail` show the use-case list as `#tests` does (fake: 51 requests, 1.23 MB, 258 ms). Nothing to measure.

### 3.12 Settings — `#settings`

| Network | Token | n | Req. | MB | All done ms | Net ms |
|---|---|--:|--:|--:|--:|--:|
| real | yes | 3 | 11 | 4.80 | 3,321 (3,260–3,699) | 3,196 |
| real | no | 1 | 11 | 4.84 | 1,460 | 1,205 |
| fake | yes / no | 5 | 11 | 2.55 | 209 / 206 | 74 / 75 |

- `jobWorkflowInput` (`settings-pages/settings.mjs:862-863`): the instance's default branch and its participants;
  `jobWorkflowFiles` (`:889`) and the product's current workflow files to compare.
- The product's repository information and snapshot (`settings.mjs:945`, `:956`), `canWrite` (`:955`), the settings and
  collaborators files (`:958`). With the app's own read, the tree three times.

## 4. Which pages read the stored results of `main-changed.yml`

`.github/workflows/main-changed.yml` runs MOD-workflow-entries' `onMainChanged` (`src/workflow-entries/instance.mjs`) on
every push to `main`: the graph and the impact lists of the decision and module files that are not accepted to
`trace-cache` (`<commit>.json`, `<commit>.impacts.json`; 243 files on 2026-10-19), and the main page's overview
`{ commit, shares, waiting }` to `overview-cache` (121 files).

- main page `index.html` (`src/home/home.mjs`) — `trace-cache`: no; `overview-cache`: **no** — derives its own overview
  (`src/home/progress.mjs`).
- MOD-main-page `home` (not live) — `trace-cache`: no; `overview-cache`: yes, `main-page/home.mjs:57`; still reads 2,678
  files.
- `#spec` — `trace-cache`: only on opening a row or the gaps (`trace-pages/flow.mjs:105`); `overview-cache`: no.
- `#uc`, `#arc`, Review all — `trace-cache`: the impact lists, for a changed file only (`review-pages/flow.mjs:363`,
  `:529`); the graph not: `graphOnce` (`sections.mjs:162`) calls `traceGraph(snapshot)` without `commit`;
  `overview-cache`: no.
- `#backlog`, `#roles`, `#process`, `#release`, `#settings` — `trace-cache`: no; `overview-cache`: no.
- `plan` (not live) — `trace-cache`: no — `plan.mjs:106` without `commit`; `overview-cache`: no.
- `runs` (not live), a run's detail — `trace-cache`: the detail: `runs.mjs:343` with `commit`; `overview-cache`: no.
- `schedule` (not live) — `trace-cache`: no; `overview-cache`: no.

On every measured load `snapshot.readOn` was called 0 times, except MOD-main-page's (1).

## 5. Not measured, and open

- A browser: HTTP/2 to `api.github.com` and the raw host, the browser's own cache (GitHub answers `ETag`s; a reload in a
  browser may be answered 304 for the tree and the pull requests). Node opens one socket per request.
- Run-to-run variance on GitHub is large (`#backlog` 37.8 to 49.1 s); the no-token rows are single loads.
- A changed decision or module file (the impact lists, `lastAcceptedText`): every reviewed file was accepted at all four
  commits. The 2026-10-18 measurements cover it.
- `main` moved during the real runs; the commits are named in the header. Tree sizes differ by under 1 %.

## 6. What a per-commit precompiled result would replace

*Commit*: a function of the files of one commit of `main` (and, where named, of the instance's commit, or of the git
history of that commit, which does not change after it). *Live*: pull requests, tags, CI runs, Actions runs, jobs' live
state, other branches, the clock, the person's token, the browser's store. The *live* reads stay on the page.

- **Main page (`src/home`).** *Precomputable:* use-case and architecture statuses; requirements; queue entries decided
  and open; items and their order; job records; guarded requirements; model — **the 1,168 single reads**. *Live:* item
  states (`itemState` needs the pull requests, 12 pages); release tags; the commit's CI state; jobs' live state.
- **MOD-main-page `home`.** *Precomputable:* already stored: shares, what waits. Not yet: the build scope's items,
  order, gate records and states, job records, queues, statuses (the 30 batches). *Live:* the pull requests; jobs' live
  states (`liveStatesOf`).
- **`#spec`.** *Precomputable:* the SPEC overview; the source register; the queues and their entries' states; the open
  proposals' texts (2 batches). *Live:* the tags (the versions offered); the person's own source and queue (the viewer).
- **`#uc`, `#arc`.** *Precomputable:* each file's id, title and status (statuses, the 48/125 files read for a title);
  the module files of the component diagram; for a changed file its impact list (stored already). *Live:* *Accept*,
  *Edit*, tick boxes (the token); a text in an open editor.
- **`#backlog`.** *Precomputable:* the teams, sprints, assignments, items with fields, module files, SPEC requirements,
  use-case statuses (**the 11 batches**); the build order; the uncovered requirements. *Live:* every item's state, when
  it was merged, the burn-down, held items, work in progress — all from the pull requests (12 pages).
- **`#roles`, `#process`.** *Precomputable:* the declaration, the model catalogue, `workflowOf`, the roles; the version
  change (two fixed commits) — given the product's and the instance's commits. *Live:* whether the person may edit (the
  token).
- **`plan`.** *Precomputable:* items, order, gate records and their states, statuses, queues, job records, the model,
  the graph or the plan's architecture (**the 32 batches**). *Live:* the pull requests; `containsCommit` of the
  undecided sprint heads (57 `compare` requests — the heads come from the pull requests; given a head, "is it on this
  commit's history" is a function of the commit).
- **`schedule`.** *Precomputable:* the test counts per level (`testDeclarations` over 1,314 files: **the 1,303 single
  reads**); the schedule document; the secrets needed; the eligible runners from the instance's participants. *Live:*
  the queued runs of self-hosted rows (Actions).
- **`runs`.** *Precomputable:* the 20 newest commits of the branch (the history of the commit). *Live:* the open pull
  requests; the tags.
- **`#release`.** *Precomputable:* — (the changelog form is empty; the candidate's run record is a file, but which
  candidate is pending follows from the tags). *Live:* the tags; the pending candidate; the next version (`nextVersion`
  from the tags).
- **`#settings`.** *Precomputable:* the product's settings and collaborators files; the job workflow files and their
  difference from the generated ones (given both commits). *Live:* `canWrite` (the token); the browser's stored settings
  and tokens.
- **`#tests`, `#issues`, `#mail`.** *Precomputable:* (no view built; the fallback is `#uc`'s list, read without its
  batch). *Live:* —.

**Read across the pages:** the commit and its tree (1.58 MB, about 1 s) are read by every page and are needed to know
the commit at all; the second to fourth tree of `#roles`, `#process`, `#release`, `#settings` and the module routes come
from connecting another Host to the same repository, not from the commit's content. The largest live read is the same
on four pages — the list of **all** pull requests, 12 pages and 22.1 MB on the main page, `#backlog`, `plan` and
MOD-main-page's `home` — and it is live by nature; the largest precomputable reads are the 1,168 single reads of the
main page, the 11 batches of `#backlog`, the 30 to 32 batches of `plan` and MOD-main-page, and the 1,303 reads of
`schedule`.
