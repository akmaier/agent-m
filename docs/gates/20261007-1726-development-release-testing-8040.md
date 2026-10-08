---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e79b2218fb443f256421c11af44a0e198fb3721f
  - https://github.com/akmaier/agent-m/pull/189
date: 2026-10-07 17:26 UTC
---
# Development → Release testing: ITM-247, its third attempt

**REGISTER**

## Reason

ITM-247, the tags of a repository: pull request #189 by developer-sonnet-d, on head `e79b221`, branched from `sprint/11`
at `2295551`.
- The first commit, `37726aa`, holds only `tests/repository-hosts-tags.test.mjs`, and CI was red on it (run
  37657513321). The node job failed on exactly its five tests, beside the suite's known todo marks.
- CI is green on the head (run 37658367502): node 867 tests, 0 fail, 11 todo; python 396, OK.
- Only `src/repository-hosts/` — `github.mjs`, `gitlab.mjs`, `index.mjs` — and the new test, which names
  MOD-repository-hosts, changed.
- The five new tests name what they guard and the module, and each has its counter-proof recorded.
- The Acceptance as corrected for this sprint holds:
  - the fakes answer at most 100 tags a page and name the next page;
  - of 155 tags, `listTags` gives every one on GitHub and on a GitLab server, and `listTags("v2026.*.0")` the 150 that
    match, `v2026.150.0` on the second page among them;
  - a tag is set on the commit named;
  - an existing tag — GitHub's 422 "Reference already exists", a GitLab server's 400 — is refused with `TagExists`
    naming its commit, and not moved;
  - a refused token, a missing permission and a used-up rate limit are the module's named failures;
  - each token goes only to its own server.
- The reasons of both earlier rejections are met, each run on the head with its fault planted:
  - `20261007-1404-…-a0e7.md`, GitHub's 422: with that answer no longer read as an existing tag, the test of the
    existing tag fails;
  - `20261007-1615-…-8078.md`, the first page only: with either adapter's paging bound to one page, the test fails on
    that server — "GitHub: every tag, not only the first page's 100", and the same for GitLab.

Noted, no reason by itself: since the branch was made, `sprint/11` has merged #190, which adds only
`tests/dashboard-notifications.test.mjs` and touches nothing of MOD-repository-hosts.
