# The reads leave the kernel — unchanged tests, the requests of every view load, and the counter-proofs of the new checks

**MESSUNG** — 2026-10-01, branch `team/ITM-130` (from `sprint/02` at `dbad6f8`), macOS 26.6.2, Node 25.9, Python 3.14.6.
ITM-130 (refactoring job): `docs/assets/review-core.mjs` (MOD-review-core) stopped importing from `docs/assets/git-host.mjs`
in `b1cec4f`. `lastAccepted` takes `committedAt` and `read` as ports; `readBlob` and `recordCommittedAt` moved into the git
host as `readBlob` and `commitsTouching`, beside the new `readSnapshot`, `readFile` and `repositoryInfo` (MOD-git-host's
provided reads); `deriveTarget` moved into the shell, `docs/assets/dashboard-app.mjs`; the new
`docs/assets/dashboard/reads.mjs` (MOD-dashboard-app) wires the kernel's ports to the git host's reads. The repository checks
of `1e3b679` were added beside ITM-124's. This file records that no test changed its expectation, that no view load makes
another request, and that the new checks and the moved checks fail on a planted fault (SOFTWARE_MAINTENANCE §4.0a rule 5,
`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The same tests before and after

**Method.** `node --test tests/*.test.mjs` and `cd tests && python3 -m unittest -v` ran on `dbad6f8` and on `b1cec4f`. The
names of the passing node tests were extracted from node's report (its `✔` lines), sorted and compared.

**Result.** Node ran 249 tests before and 249 after, all passing, and the two lists of names are identical. Python ran 197
tests before and 197 after, all passing. On `1e3b679`, node runs 251 tests: these 249 and the two new repository checks.

**Moved, not rewritten.** A script compared the diff of `tests/review-core.test.mjs`, `tests/status-by-names.test.mjs` and
`tests/test_instance_target.py` with the new `tests/review-core.d/dashboard-reads.test.mjs`. Every line removed from the
three files is found in the new file, except import lines, one header line of `status-by-names.test.mjs` (which names the
functions it checks) and the two lines of `test_instance_target.py` below. The new file holds, besides its header and its
import lines, the moved blocks: from `review-core.test.mjs` the fixtures of the last accepted text, the check of
`deriveTarget` ("the dashboard is opened on a GitLab product by its address; its files link to GitLab") and the five checks
of the last accepted text; from `status-by-names.test.mjs` the check of `readBlob` with the fixture `memoryCache`, which is
copied, not moved, because the checks staying there use it. That block reaches its module as `core`, the name it had there.

The Python check changed in two lines: its `Module:` line names MOD-dashboard-app, and its expression reaches the function as
`dashboardApp.deriveTarget` (the name `tests/jsrun.py` gives `docs/assets/dashboard-app.mjs`) instead of `core.deriveTarget` —
the expression's namespace is how jsrun imports a module.

## 2. The requests of each view load

**Method.** A script (not committed) loaded the dashboard in `tests/app-harness.mjs`, once per view and route, against the
product of `tests/load-per-view.test.mjs` with one more record of UC-002 (so that a history read is made), with and without
the GitHub token, and for a GitLab product (the GitLab server of `tests/review-core.d/helpers.mjs` as a request handler). It
recorded every request — method, full address, `Accept` header, which kind of authorisation it carried — and a hash of the
page's `<main>`. It ran on a copy of `docs/assets/` of `dbad6f8` and on that of `b1cec4f`; both runs were repeated once and
gave the same output.

| Page load | Requests before | Requests after | Page |
|---|---|---|---|
| GitHub, with token: `#` · `#uc` · `#nonsense` | 7 each | 7 each | same |
| GitHub, with token: `#arc` | 10 | 10 | same |
| GitHub, with token: `#spec` · `#spec/2026-09-01_done` | 8 · 9 | 8 · 9 | same |
| GitHub, with token: `#uc/UC-001` · `#uc/UC-002` | 4 · 8 | 4 · 8 | same |
| GitHub, with token: `#arc/ARC-001` · `#arc/MOD-reader` | 5 · 13 | 5 · 13 | same |
| GitHub, with token: `#review/uc` · `#review/arc` | 8 · 15 | 8 · 15 | same |
| GitHub, with token: `#settings` · `#add` · `#setup` · `#how` | 3 · 3 · 3 · 2 | 3 · 3 · 3 · 2 | same |
| GitHub, without token: the same sixteen routes | the same numbers | the same numbers | same |
| GitLab product: `#` · `#uc/UC-002` · `#arc/MOD-reader` · `#spec` · `#settings` | 8 · 8 · 14 · 9 · 4 | 8 · 8 · 14 · 9 · 4 | same |

**Result.** Every load made the same requests, to the same addresses, in the same order, with the same authorisation, and
showed the same page. One header differs: the read of the product's repository on `#settings`, `#add` and `#setup`
(`GET https://api.github.com/repos/<repo>`, settings-view.mjs `checkReach`) now carries `Accept: application/vnd.github+json`,
which `repositoryInfo` sends — `addProduct` sent it for the same read before. That is GitHub's documented media type; the
answer is the same.

## 3. Counter-proofs

**Method.** A script (not committed) planted one fault at a time, ran the suite named in the table, read the failing tests
from node's `✖` lines or unittest's `FAIL`/`ERROR` lines, and restored the file. It refused a replacement that did not occur
exactly once and compared the bytes of each file after the restore. The suites were green before the series and after it.

| | Planted fault | File | Suite | Red |
|---|---|---|---|---|
| CP1 | `import { readBlob } from "./git-host.mjs"` added | `review-core.mjs` | node | "the kernel never reads through the git host — no kernel file imports anything of it" (ITM-124's check stays green: a read is no write) |
| CP2 | `import { fetchText } from "./git-host.mjs"` added | `dashboard-app.mjs` | node | "the shells read only through what the git host provides — no file of the dashboard imports fetchText" |
| CP3 | `import * as host from "../git-host.mjs"` added | `dashboard/settings-view.mjs` | node | the same test |
| CP4 | a second `fetchText(` call added to `addProduct` | `dashboard/writes.mjs` | node | the same test (one call of the helper) |
| CP5 | the direct read asks `/contents/` instead of `/git/trees/` | `dashboard/writes.mjs` | node | the same test (it is that read), and three checks of `addProduct`: "THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — adding stores the address …", "UC-001 5a: a refused write adds nothing to the list", "UC-001 5b: a product with the complete layout is only added to the list …" |
| CP6 | `lastAccepted` sorts the records oldest first | `review-core.mjs` | node | three moved checks: "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared", "— a renamed file finds its records by identifier", "— GitLab: its commits and blob endpoints, its own token only" |
| CP7+8 | the hash check removed in both places, the git host's `readBlob` and the kernel's `lastAccepted` | `git-host.mjs`, `review-core.mjs` | node | moved check "the accepted text is the exact text its record names — a blob that does not hash to it is refused" |
| CP9 | `deriveTarget` takes any `?repo=` | `dashboard-app.mjs` | Python `test_instance_target` | `test_malformed_repo_query_is_ignored` |

Each of CP7 and CP8 alone leaves the suites green: the text a blob SHA names is now refused in two places, by the git host's
`readBlob` (MOD-git-host: "refused unless it hashes to that SHA") and by the kernel's `lastAccepted` (MOD-review-core: "refused
unless it hashes to that SHA"), and either one catches the forged text. Before ITM-130 the kernel's `readBlob` was the one
place.

The two new checks also check themselves: each shows that the import it refuses is caught — a read by name, under another
name, as a namespace — and that a provided read (`readSnapshot`, `repositoryInfo`) is not.

## 4. What stays open

- **One direct read without a provided counterpart of its shape.** `addProduct` (`dashboard/writes.mjs`) reads the paths of a
  GitHub product's default branch in one request, by the branch's name (`GET /repos/<repo>/git/trees/<branch>?recursive=1`).
  MOD-git-host's `readSnapshot` resolves the branch to a commit first — one request more — and the fake GitHub of the checks
  of `addProduct` (`tests/review-core.d/dashboard-writes.test.mjs`, `productGitHub`) does not answer that request, so using it
  would change a test's fixture. The read keeps `fetchText`; the check of `1e3b679` names it. A change request to akmaier.
- **`checkGitLab`** (`dashboard/settings-view.mjs`) still reads a GitLab project through `gitlabProject`: it tells a GitLab
  server by the project's `path_with_namespace`, which `repositoryInfo` does not report. It imports no `fetchText`.
- **A file the pinned tree names that the server answers with 404** — a case the dashboard does not reach — was the request
  helper's error on GitHub and an empty text on GitLab. `readFile` answers `null` on both; the shell keeps the two outcomes,
  the GitHub one now with the message `404 Not Found — <path> at <commit>`.
