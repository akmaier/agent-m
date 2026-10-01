# The pull requests of a product on both hosts — counter-proof mutations (ITM-146)

**MESSUNG** — 2026-10-01, branch `team/ITM-146` (on `sprint/02` at `a248d8a`), macOS, Node 25.9.0, Python 3.14.6.
The counter-proofs of the ten tests ITM-146 adds in `tests/review-core.d/git-host-pulls.test.mjs`
(`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5), against
`docs/assets/git-host/pull-requests.mjs` (`pullRequests().list` and `get`).

**What the fakes answer.** The fake servers of the test file answer as the documentation of each API states it, read on
2026-10-01: GitHub's REST API, *List pull requests* (`state` `open|closed|all`, `base`, `sort`, `direction`, `per_page` at
most 100, `page`; `merge_commit_sha` of an open pull request is "the SHA of the test merge commit"; `merged_at` null until
merged) and *Get a pull request*, and *List workflow runs for a repository* (`head_sha`; a run's `status` and `conclusion`);
GitLab's *List project merge requests* (`state` `opened|closed|locked|merged|all`, `target_branch`, `order_by created_at`,
`sort desc`; "the list response does not include the comprehensive `head_pipeline` object") and *Get single MR*
(`head_pipeline`), and the pipeline statuses of GitLab's pipelines API (`created, waiting_for_resource, preparing,
waiting_for_callback, pending, running, success, failed, canceling, canceled, skipped, manual, scheduled`). No request
left the machine.

**Method.** Each mutation replaced exactly one piece of text in `docs/assets/git-host/pull-requests.mjs`; then
`node --test --test-reporter=tap tests/review-core.test.mjs` ran (it runs every file of `tests/review-core.d/`), the
failing tests were listed, and the file was restored (`scratchpad/itm146-developer-opus-c/mutate.py`, not committed).
Before and after the series both full suites were green: `node --test tests/*.test.mjs` 257, `cd tests && python3 -m
unittest` 197.

**Red first.** On the test-only commit `72bfa10` the module did not exist: `node --test tests/*.test.mjs` reported 208
tests, 1 failing (`tests/review-core.test.mjs`, `ERR_MODULE_NOT_FOUND` for `docs/assets/git-host/pull-requests.mjs`, so
none of its 126 checks ran); the Python suite was green, 197 — it has no test of this file. CI on that commit was red, both runs of the
workflow `tests` (push: run 36921522809; pull request #49: run 36921542743).

| Mutation | Red |
|---|---|
| M1 GitLab's `mergedAt` taken from `updated_at` when `merged_at` is missing | *counter-proof: a field the answer lacks is null, never invented*; *list and get give the same data on GitHub and on a GitLab server* |
| M2 GitHub's test merge commit of an open pull request taken as its merge commit | *counter-proof: a field the answer lacks …*; *list and get give the same data …* |
| M3 a token of the other host's kind is not refused | *counter-proof: a product on another GitLab server gets neither token* |
| M4 `since` does not stop the reading | *list reads pages of 100, newest first, and stops at the page that reaches back past since* |
| M5 the reading stops after the first full page | *list reads pages of 100 …*; *the state filter: open, merged, closed, all …* |
| M6 GitHub is asked for `state=merged`, which it does not know | *the state filter …* |
| M7 `get` on GitHub reads no workflow runs | *the GitHub token only at api.github.com, the GitLab token only at its project's API*; *list and get give the same data …*; *get(n) costs one request on GitLab and two on GitHub …*; *the CI state of the head …* |
| M8 a failed run outranks a running one | *the CI state of the head …* |
| M9 any number is taken for `get` | *a filter or a number that is not one is refused before anything is sent* |
| M10 a read is refused without a token | *a read needs no token …* |
| M11 the participant line is the whole body | *list and get give the same data …* |
| M12 a GitLab product's token passed as a GitHub-style string | nine of the ten — every test that reads a GitLab product, and the token counter-proof |

Every one of the ten new tests is red under at least one mutation.
