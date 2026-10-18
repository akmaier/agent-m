# Page loads: what the trace graph costs, and what a graph stored once per commit would save

**MEASUREMENT** — 2026-10-18, commit measured `dccd7cc34efbf36d2e4bcab0e315219c6addfb46` (`sprint/team2/89`), macOS, Node 25.9.0,
for ITM-880. akmaier's ruling of 2026-10-18 is the starting point: "There is no violation of spec: a precomputed state, is part of the repo, not the
dashboard." Nothing here changes a product file or a test; the module drafts are committed apart (§8).

## 0. Result in one screen

- **The graph is not the whole cost, and for two of the five named pages it is none of it.**
  - The main page as `index.html` loads it (`src/home/home.mjs`) builds no graph. It sends **1,072 requests** (1,069 single file reads, 9.0 MB), with or without a token.
  - `#spec`, `#uc`, `#uc/<id>`, `#arc` and `#<kind>/all` for use cases build no graph: 3 to 8 requests with a token.
  - The graph is built on a *changed* architecture or module file's page and on the architecture's and the modules' *Review all*: `traceGraph` once, about 23 GraphQL batches of 18.5 MB, 0.49 s of the page.
- **The second cost on those pages is `architectureImpact`, not the graph.** It runs once for each changed file, 16 times on Review all, 2.0 to 2.4 s in all, 64 % of the page's 3.1 s with a token. A stored graph leaves it as it is.
- **What storing the graph once per commit gains** (this machine, a fake network, a token; all work done): `#arc/MOD-approvals` 816 ms to 437 ms, 39 requests to 17, 19.9 MB to 7.7 MB. Review all of the architecture: 3,128 ms to 3,110 ms — no gain, 38.3 MB to 26.3 MB. **With the graph stored and `architectureImpact` scanning the edges once: 816 to 278 ms and 3,128 to 878 ms**, the page's text identical.
- **Without a token the gain is large**: `#arc/MOD-approvals` 2,245 requests to 17 (4,276 to 435 ms); Review all of the modules 2,481 to 268 requests (6,941 to 3,030 ms, 805 ms with the edge scan).
- **Recommendation: a file on a separate branch named by its commit** (§5), with the pages falling back to building the graph. The edge scan (a change of `architectureImpact` alone) is needed for the gain on Review all.

## 1. Method

**What runs.** The live code: `src/site-frame/dashboard-app.mjs` (the one script `docs/index.html` loads), imported fresh for each load by `openDashboard` of `tests/app-harness.mjs` — the harness `tests/load-per-view.test.mjs` uses (AGENTS.md §6a.1) — over `repoServer({ files, history })`. `files` is every one of the 5,004 files of `dccd7cc3` (`git archive dccd7cc3…`, read as UTF-8, 46.0 MB; no `node_modules`). `history` holds the 365 earlier texts the approval records of the 16 changed files name (`git cat-file blob <sha>`), so that `lastAcceptedText` finds what it needs, as it does on GitHub. The page's `fetch` is a wrapper that records, for each request, its kind (from the URL), the bytes of its answer and its start and end. A page is *loaded* when `openDashboard` returns; *settled* is the harness' definition (nothing in flight for 40 turns of the event loop).

**Two things the harness does that this measurement had to deal with.**
1. *Settled is not done.* On a changed architecture or module file the page computes its impact list after the harness calls it settled. `doneMs` below waits, after `settle`, until no `traceGraph` is in flight. The two differ with a token: `#arc/MOD-approvals` settled 381 ms, done 816 ms; Review all of the architecture settled 380 ms, done 3,128 ms. Pages that start no graph have the same value in both. The tables give *all done*.
2. *The harness' own cost.* Its `blobShaOf` scans every blob for every path of an earlier commit, 1.7 s of CPU for the 17 earlier trees of Review all. The runs below use a scratch copy of the harness with a reverse map in that one place (`diff` against `tests/app-harness.mjs` is that line). With the repository's unchanged harness the same pages take: `#arc/MOD-approvals` 2,732 ms (token) and 5,599 ms (none); Review all of the architecture 30,157 ms and 32,961 ms; of the modules 29,821 ms and 32,014 ms. The number of requests and bytes is the same in both.

**What is timed.** One fresh `node` process for each load (so the cost of loading the modules is in each number: the page `#settings`, which reads almost nothing, takes 203 ms and the idle `settle` alone 52 ms — a floor for every page below), **5 processes for each page and token**, the table gives the median and, in brackets, the smallest and largest. The network is a fake: each request waits one turn of the event loop. **No time here is a time on a real network.** Requests and bytes are exact counts, and they are the same in every run.

**Where time and shares come from.** A copy of `src/` and `docs/assets/` in the scratch area, outside the repository, in which the exports `traceGraph`, `graphFindings`, `selfSufficiencyFindings`, `architectureImpact`, `coverageGaps`, `requirementImpact`, `tracesTo` (MOD-trace-graph), `statuses`, `statusOf` (MOD-approvals) and `testDeclarations` (MOD-test-document) are wrapped by a timer and a call counter, and the `TextSource` handed to `traceGraph` by one that records when `read` and `readMany` are waiting. *traceGraph wall* is the time from its call to its answer; *reading* is the part of it in which a `read` or `readMany` was waiting; the rest is its computation. `testDeclarations` runs inside `traceGraph`.

**Positive controls** (AGENTS.md §6a.2).
- The harness: `node --test tests/load-per-view.test.mjs` passes, 25 of 25, on this commit.
- *Requests*: `#uc` without a token sends 48 file requests; `docs/use-cases/` holds 49 files, the README among them, which the list does not read. The bytes of those 48 requests, 380,474, are the 387,508 bytes of the folder less the README's 7,034. `#arc` without a token sends 71 file requests, the 71 `ARC-*` and `MOD-*` files of the tree, 908,219 bytes, the sum of their sizes. No file is requested twice in any page (the `duplicates` count is 0).
- *The counter of `traceGraph`*: one direct call of the wrapped `traceGraph` over the 5,004 files counts 1 call, 1,180 `testDeclarations` and builds 4,770 nodes. *The counter of `graphFindings`*: one direct call counts 1 and returns 2,113 findings. So the 0 calls of `graphFindings` on every page below is a count that can be 1.
- *Bytes of a stored graph*: the request for it counts 6,226,461 bytes, the size of the file.
- *The stored graph gives the same page*: for every page that builds a graph the hash of `<main>` after the load is the same with the graph built and with the graph read from a file (six pairs: three pages, each with and without a token).

## 2. Step 1 — what a page load does now

*Requests, MB* are exact. *All done ms*: median (smallest–largest) of 5. *Net ms* is the time at least one request was open. *traceGraph*: calls, wall ms (of which waiting for reads). *statuses*, *decl.* in ms. `architectureImpact` is in §3.

| Page | Token | Requests | MB | All done ms | Net ms | traceGraph calls, wall ms (reading) | statuses | decl. |
|---|---|--:|--:|--:|--:|---|--:|--:|
| main page as `index.html` loads it (`src/home/home.mjs`) | yes | 1,072 | 8.99 | 210 (208–214) | 109 | 0 | 0 | 0 |
| | no | 1,072 | 8.99 | 209 (205–215) | 108 | 0 | 0 | 0 |
| main page as MOD-main-page builds it (`productFacts`, scope `all`, not yet the live page) | yes | 50 | 32.39 | 858 (854–867) | 226 | 1, 455 (121) | 3.3 | 75 |
| | no | 3,844 | 30.90 | 3,918 (3,428–3,959) | 3,077 | 1, 2,741 (2,268) | 3.0 | 132 |
| `#spec` | yes | 8 | 0.98 | 221 (220–223) | 41 | 0 | 0 | 0 |
| | no | 122 | 0.96 | 231 (228–342) | 48 | 0 | 0 | 0 |
| `#uc` (list) | yes | 4 | 1.11 | 200 (197–205) | 36 | 0 | 4.8 | 0 |
| | no | 51 | 1.10 | 264 (260–270) | 96 | 0 | 5.4 | 0 |
| `#uc/UC-001` (accepted) | yes / no | 4 / 4 | 0.73 | 207 / 208 | 33 / 35 | 0 | 4.9 | 0 |
| use cases, Review all (`#use-case/id=all`, nothing open) | yes / no | 3 / 3 | 0.72 | 185 / 185 | 32 / 33 | 0 | 2.8 | 0 |
| `#arc` (list) | yes | 4 | 1.65 | 216 (212–222) | 37 | 0 | 8.4 | 0 |
| | no | 74 | 1.63 | 308 (302–309) | 128 | 0 | 8.7 | 0 |
| `#arc/MOD-bridge-build` (accepted) | yes / no | 4 / 4 | 0.73 | 205 / 201 | 35 / 33 | 0 | 4.9 | 0 |
| `#arc/MOD-approvals` (changed since acceptance) | yes | 39 | 19.92 | 816 (814–889) | 160 | 1, 494 (153) | 4.3 | 44 |
| | no | 2,245 | 19.24 | 4,276 (3,844–4,567) | 3,241 | 1, 3,896 (3,270) | 4.3 | 90 |
| architecture, Review all (`#review/arc`, = `#decision/id=all`; 16 changed) | yes | 279 | 38.29 | 3,128 (2,924–3,175) | 368 | 1, 491 (151) | 2.8 | 44 |
| | no | 2,853 | 36.92 | 7,162 (6,727–7,517) | 3,936 | 1, 3,882 (3,216) | 2.9 | 122 |
| modules, Review all (`#module/id=all`) | yes | 275 | 30.98 | 3,033 (3,017–3,908) | 333 | 1, 491 (151) | 2.9 | 44 |
| | no | 2,481 | 30.30 | 6,941 (6,673–7,346) | 3,595 | 1, 4,354 (3,454) | 2.8 | 132 |

`graphFindings` and `selfSufficiencyFindings` are called on no page (0 in every run). `coverageGaps`, `tracesTo` and `requirementImpact` are called on none either.

**What the requests are** (token / no token).
- Main page, live: 1 commit, 1 tree (0.72 MB), 1,069 `contents` reads (8.26 MB), 1 `pulls`; the token changes nothing because `src/home/home.mjs` reads each file by `snapshot.read` and never `readMany`.
- `#uc`, `#arc`, `#spec`: 1 commit, 1 tree, `repository`, and the files they show: 1 / 4 batches with a token, 48 / 71 / 118 single reads without.
- A changed file's page: 6 commits and 2 trees (the last accepted text is read from an earlier commit: `history` 4, 1.44 MB of tree), 3 files, and, with a token, **23 batches of 100 files, 18.46 MB, 2,229 files — the graph**; without a token 2,232 single file reads, 17.8 MB.
- Review all (architecture): 109 commits, 17 trees (**12.26 MB**), 92 history reads — the last accepted text of each of the 16 changed files, each read through a snapshot of its own earlier commit — and the graph's batches.

**How the time divides** (token; the median above).

| Page | traceGraph | of it waiting for reads | `architectureImpact` | `statuses` | the rest |
|---|--:|--:|--:|--:|--:|
| `#arc/MOD-approvals` | 494 ms, 61 % | 153 ms | 139 ms, 17 % | 4 ms | 180 ms |
| architecture Review all | 491 ms, 16 % | 151 ms | 1,978–2,003 ms, 64 % | 3 ms | 650 ms |
| modules Review all | 491 ms, 16 % | 151 ms | 1,981–2,006 ms, 66 % | 3 ms | 550 ms |
| main page, MOD-main-page's | 455 ms, 53 % | 121 ms | 0 | 3 ms | 400 ms |

Without a token reading dominates: `traceGraph` is 91 % of `#arc/MOD-approvals` (3,896 of 4,276 ms), 84 % of it waiting for reads; 54 % of the architecture's Review all (3,882 of 7,162 ms).
`testDeclarations` is 44 ms with a token, 9 % of `traceGraph`: 1,180 test files parsed. `statuses` is 3 to 9 ms on every page that calls it (at most 4 % of any page).

## 3. Step 2 — what depends on the commit alone

Each result, what it reads, and whether a function of the commit's files alone. "Tree" is the commit's tree and the texts it names by blob SHA.

| Result | Reads | The commit alone? |
|---|---|---|
| `traceGraph(snapshot)` | the 2,242 files it reads from the tree: SPEC, documents, tests, group files, code; `options.commit` is only copied into `commit` | **yes** — the same for every viewer; with and without a token the graph has the same 4,770 nodes and 29,266 edges |
| `graphFindings(graph)`, `coverageGaps`, `tracesTo`, `requirementImpact`, `moduleOrder` | the graph | **yes** |
| `selfSufficiencyFindings(graph, instance)` | the graph and the repository's address `owner/name` | **no** — also the address (a fork or a renamed repository keeps a file whose answer is for the old name) |
| `statuses(snapshot)` | the names of the files under `docs/approvals/` and the tree's blob SHAs | **yes** (3 to 9 ms — nothing to save) |
| `testDeclarations(path, text)` | one file's text | **yes** |
| `lastAcceptedText(id, host)` | the history of the approval records and the earlier commit they were added in | **no** — the git history of the commit, not its tree; the same for a commit and all its descendants, but not computable from the files |
| `architectureImpact(graph, changes)` | the graph, and for each changed file its last accepted text and its current text | **no** — the graph is the commit's; the *changes* are the last accepted text (history) and the text on the page. A change another viewer edits in an open editor (`file-edit.mjs` builds a graph with the edited text in place) is not the commit's at all |
| the statuses *as a viewer sees them*: *Accept*, *Edit*, the tick boxes | the token (account, whether it may write) | **no** — the viewer |
| `productFacts` (MOD-main-page): the graph, the SPEC's requirements | the tree | **yes** |
| `productFacts`: pull requests, tags, the branch `test-results`, the live state of the runtimes, job state, the clock (`now`) | other branches, GitHub's pull requests, the runtimes, the time | **no** |
| the person's open queue of SPEC changes ("of the day") | the entries are files of the tree; which queue is the person's today is the viewer and the date | **no** |

Only the first two rows, `statuses` and `testDeclarations` can be computed once per commit. Of them only `traceGraph` costs anything (§2), and everything derived from the graph is cheap once the graph exists, except the edge scan below.

**Two findings that the classification rests on.**
- **A hotspot that a stored graph does not touch.** `architectureImpact` (`src/trace-graph/derive.mjs`, the line that builds `tests: tests.map((id) => ({ id, guards: unique(graph.edges.filter(…)) }))`) scans all 29,266 edges once for each test that exercises an affected module: 16 calls, 2.0 to 2.4 s on Review all, 139 ms for one changed file. The CPU profile of the page with a stored graph puts 2,335 ms of 3,934 ms of CPU in that function (line 117). Building the guards of the tests from one pass over the edges gives 216 ms for the 16 calls, 18.9 ms for one, the page's text unchanged (§4).
- **The main page, as MOD-main-page builds it, builds a graph nobody reads.** `productFacts` with the scope `all` builds the graph (`src/progress-measures/facts.mjs:132`) for `graph` and the declarations of its test files for `tests`; `git grep -n "facts\.[a-zA-Z]*" src/progress-measures src/main-page` finds `facts.requirements` (stages.mjs:69–71, the known positive), `facts.tags`, `facts.workflow` and the others, and finds neither `facts.graph` nor `facts.tests`. 41 batches, 30.95 MB, 0.46 s. That is the request to change for that page; the stored graph alone makes it worse in requests (565, not 50 — the graph build had brought the test files into the snapshot in batches, and `productFacts` then reads the 529 of them by themselves).

## 4. Step 3 — the places compared

The page asks for the graph once, through `traceGraph`, the one place every caller of it passes (14 call sites in `src/`). Stored: 6,226,461 bytes as `graphText` writes it (JSON), **498,851 bytes gzipped**; without the `code` nodes and `imports` edges 5,458,548 (420,104 gzipped). Restoring it costs 16.5 ms (`JSON.parse` and a `Map`). The edges `names` (9,090), `guards` (9,215) and `realises` (3,192) are most of it.

**The gain** — emulated in the scratch copy: `traceGraph` reads `<commit>.json` of a fake branch `trace-cache` in one request (the contents API with a token, GitHub's raw host without) and otherwise builds. The two places give the page the same numbers; they differ in §5. Median of 5, all done, requests / MB / ms:

| Page | Token | now | graph stored | stored and `architectureImpact` scanning edges once |
|---|---|---|---|---|
| `#arc/MOD-approvals` | yes | 39 / 19.9 / 816 | 17 / 7.7 / 437 (428–492) | 17 / 7.7 / 278 |
| | no | 2,245 / 19.2 / 4,276 | 17 / 7.7 / 435 (430–485) | 17 / 7.7 / 288 |
| architecture, Review all | yes | 279 / 38.3 / 3,128 | 257 / 26.3 / 3,110 (3,028–3,375) | 257 / 26.3 / 878 |
| | no | 2,853 / 36.9 / 7,162 | 640 / 25.6 / 3,698 (3,671–3,929) | 640 / 25.6 / 1,509 |
| modules, Review all | yes | 275 / 31.0 / 3,033 | 253 / 19.0 / 2,978 (2,948–3,169) | 253 / 19.0 / 796 |
| | no | 2,481 / 30.3 / 6,941 | 268 / 19.0 / 3,030 (2,981–3,173) | 268 / 19.0 / 805 |
| main page (MOD-main-page) | yes | 50 / 32.4 / 858 | 565 / 31.0 / 483 | — |
| | no | 3,844 / 30.9 / 3,918 | 2,890 / 30.1 / 1,156 | — |

(The right column: 3 runs each; `architectureImpact` alone scanning edges once, graph built: 692 ms for `#arc/MOD-approvals`, 1,327 ms for architecture Review all, 1,238 ms for modules Review all, with a token.)
- **Pages without a graph** (`#spec`, `#uc`, `#arc`, an accepted file's page, use cases' Review all, the live main page): no change. Their cost is their single reads without a token and the 17-fold tree of an earlier commit (below).
- **What remains after the graph**: on Review all the 17 trees and 109 commit requests of the *last accepted texts* (12.3 MB) — `lastAcceptedText` reads a whole snapshot of an earlier commit for each changed file though the approval record names the blob. That is another change (§7), not this item's.

**Cost in CI, within the two-minute limit** (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` names the jobs of a pull request; `tests.yml` runs nothing on a push to `main`, where a job of either place would run — it is held to the limit here all the same).
- The work: reading the 5,004 files from a checkout, `traceGraph` 421–433 ms (5 runs), `graphFindings` 10–13 ms, `graphText` and writing 6.2 MB. Node 25.9 on this machine; CI uses Node 22. A GitHub runner's speed was not measured.
- The fixed cost around it, from the last runs of the repository (`gh api …/actions/runs/<id>/jobs`): `apply-approvals` (checkout, a push) **6 s**; the node jobs of `tests.yml`: checkout 2–3 s, setup-node 0–6 s, `npm install` 1–4 s, the whole job 15–44 s. A job of this work: about 10 s around about 1 s of work, at ten times slower 15 s: **an eighth of the limit, or less**.
- How often: first-parent commits on `main` in the last day 318 (1,110 in 7 days). Both places add one job run for each.
- Storage: five consecutive first-parent commits of `main` as five files of 6.2 MB are 494 KiB in one `git gc` pack, the first alone 488 KiB; **about 1.6 KiB for each further version** (git deltas them). At 318 a day, that is below 1 MB a day for either place.

**A file CI commits on each commit to `main`**, e.g. `docs/trace/graph.json`.
- *Gain*: the page would read it with the files it already reads (one more path in a batch), so no extra request (not measured).
- *Cost 1: the file cannot name the commit it is in.* The commit that adds it is a new one, so the file in `HEAD` describes `HEAD`'s parent. The page cannot check the file against the commit shown without a rule of its own: a digest of the tree's paths and blob SHAs less the file itself (1.6 ms to compute for 5,004 files). That rule is a special case of the file, which breaks AGENTS.md §2 principle 5 (*no special first case*) and keeps a second copy equal to the tree (principle 2, *nothing twice*).
- *Cost 2: a bot commit on `main` after each merge* — 318 more commits a day on the branch every person and every dashboard reads, and a push that races the next merge (non-fast-forward; the rerun describes an older commit). `apply-approvals.yml` shows the repository does push to `main` from a workflow already, on a path filter.
- *Cost 3*: the file lies in every checkout, in `git grep` and in every diff of a merge of `main` into a sprint; the graph's own `files` list would name it.

**A file on a separate branch, named by its commit**, `<commit>.json` on the branch `trace-cache` (my reading of "a file on a separate branch, named by the commit it was computed from": one branch, the file named by the commit, as `runs/<commit>/<run>.md` on `test-results`; not one branch for each commit, which would be 318 branches a day).
- *Gain*: one extra request per load (the file, 6.2 MB, 0.5 MB compressed); with a token a single `contents` read with the raw media type, without one a read from GitHub's raw host. A 404 (no file yet) costs one more request and then the page builds as now.
- *The name is the check.* A page shows commit `C`; it asks for `C.json`; a text that does not name `C` is ignored. No digest, no special case, no commit on `main`; the branch only grows, as `test-results` does (`A RESULT RECORD IS NEVER REWRITTEN` says it for result records; the same shape here is a precedent, not a rule this item cites for the graph).
- *Cost*: a branch and a push from CI — `contents: write` as in `apply-approvals.yml`; the push to a branch of its own cannot lose a race with a merge and, run again, adds a file that is not there. The branch must exist; a repository without it shows no difference.

**By the principles** (AGENTS.md §2; book ch. 10 *Principles for Robust Architecture Under AI Acceleration*, ch. 12 *Design Guidelines* and *KISS*).
- *One responsibility*: the graph's text and its reading belong to MOD-trace-graph; the file in the product's tree would make the product's documents and a cache one tree.
- *Nothing twice*: the file on `main` is a copy of what the tree says, kept equal by a job and by a digest. On the branch it is a copy too, but it is addressed by the commit, and an unequal copy cannot be read.
- *Adding one of a kind changes nothing of another*: `traceGraph` is the one place; the 14 callers, and every `TextSource` without `readOn` (the editor's edited text), are unchanged.
- *KISS, YAGNI*: ch. 12 — "start simple, verify correctness, measure performance, and optimize only the specific hotspots where measurement shows it matters". The measurement shows the gain is real for a changed file's page and without a token, nil for Review all with a token unless the edge scan is changed, and absent for the pages that build no graph.

## 5. Step 4 — recommendation

**One place: the file on a separate branch, named by its commit** (`trace-cache`, `<commit>.json`), with `traceGraph` the only reader — and, for the gain on Review all, the edge scan of `architectureImpact` changed. Not recommended: a file committed to `main` (§4, costs 1 to 3); and none of the stored graph for the main page, where the change is to stop building a graph nobody reads.

**What a page shows.**
- *The file is missing* (the branch does not exist, or CI has not yet written this commit, or the request fails): the page shows exactly what it shows now — the graph is built from the files, in batches with a token. It shows no notice; the page is correct, only slower.
- *The file names another commit, or is not a graph*: `graphFromText` gives `null`, and the page builds the graph. A stale file cannot be shown.
- *A file still read*: `A PAGE LOAD READS THE REPOSITORY IN BATCHES` holds for every file the page still reads. The stored graph replaces the 2,229 files the graph reads; the files a page shows (`batch 1` to `batch 5`) and its commit and tree are read as before, in batches of at most 100; the stored graph is one file, read once.
- *Not a status of the dashboard*: the dashboard derives from the repository and stores none of its own; the file is in the repository. The draft of §8 states this as MOD-trace-graph's text.

**Order.** (1) the edge scan; (2) `traceGraph` reads the stored graph; (3) a workflow adds the file on each push to `main`; a graph is first written for the commit that is current.

## 6. Not measured, and open

- A real network, GitHub's rate limits, response sizes in real headers, compression on the wire (the raw host's), a real runner's speed. `Blob.text` of a 6 MB file in GraphQL: `isTruncated` makes `readFiles` leave it to `readFile`, one more request; not exercised here.
- The pages `#spec` with a requirement opened, the trace views (`trace/gaps`, `trace/modules`, tests), `trace/specification` with the graph: `src/trace-pages/flow.mjs:104` builds the graph only when a row is opened and keeps it per commit; the page `#spec` loads without it (8 requests). `#spec-entry/id=all` and `#release-report/id=all` are not served by the live app (the first answers "No SPEC change entry all", the second shows the use-case list); `MOD-review-pages.md` lists `<k>/all` for every kind.
- **Open question for akmaier, which this item could not clear in the texts**: `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` says the CI configuration of Agent M is generated from its declared schedule; `apply-approvals.yml` is a workflow written by hand. Whether a workflow that writes the stored graph is generated or written like that one is not said in the text I could find.
- The branch's first commit (it holds no files of `main`) cannot be made by `commitFiles`, which makes a first commit only on a repository without any. It is made once by the workflow step (git, orphan).

## 7. Further findings (not drafted)

- The main page that `index.html` loads reads 1,069 files one by one, with a token as without. That is the cause of its load; no graph is involved. MOD-main-page's `home` route would read 41 batches and build the graph (30.9 MB) for a result that does not use it.
- `lastAcceptedText` reads a snapshot (commit and tree, 721 KB) of an earlier commit for each changed file: 12.3 MB and 126 requests of the 38 MB of Review all. `readByBlob` exists in `docs/assets/review-core.mjs`.

## 8. Drafts and items

Drafts for akmaier, committed to the module files, not accepted: `MOD-repository-hosts` (`Snapshot.readOn`) and `MOD-trace-graph` (`traceGraph` reads the stored graph; `graphText`, `graphFromText`, `publishGraph`). No change to the SPEC. Build items: see `docs/backlog/`, each `builds_on` ITM-880.

## 9. Repeating it

1. `git archive dccd7cc34efbf36d2e4bcab0e315219c6addfb46 | tar -x -C <scratch>/tree`; `git archive … src docs/assets | tar -x -C <scratch>/copy`.
2. In `copy/src`: a file with the timers and the counters; the exports of `trace-graph/index.mjs`, `approvals/index.mjs` and `test-document/index.mjs` wrapped; for the stored graph `traceGraph` first fetching `…/<commit>.json?ref=trace-cache` (or the raw host) and building the `Map`.
3. A copy of `tests/app-harness.mjs` with the reverse map in `blobShaOf`; `src` and `docs` of the copy beside it.
4. A script that reads the tree into `files`, the 365 earlier texts into `history`, wraps `server.fetch`, runs `openDashboard({ server, hash, token, assets })` (the token `null` for none), waits until no `traceGraph` is in flight, and prints one JSON line; a driver that runs it in 5 fresh processes for each page and token.
5. For the main page as `index.html` loads it: the same harness with `assets` pointing at a folder whose `dashboard-app.mjs` imports `src/home/home.mjs`; for MOD-main-page's: `productFacts(host, instance, instanceAt, new Date(), {}, { scope: "all" })` over `connect` with the same `fetch`.
