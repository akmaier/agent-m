---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 0c028d2811937407e7ec87b31b99e83717ae1627
  - https://github.com/akmaier/agent-m/pull/182
date: 2026-10-07 16:15 UTC
---
# Development → Release testing: ITM-247, its second attempt

**REGISTER**

## Reason

ITM-247, the tags of a repository: pull request #182 by developer-sonnet-d, on head `0c028d2`, branched from `sprint/10`
at `515622d`. What holds:
- The first commit, `32c9602`, holds only `tests/repository-hosts-tags.test.mjs`. Both commits reached GitHub in one push,
  so CI ran on it through the throwaway pull request #184 (closed, nothing merged): run 37649597937, red. The node job
  failed on exactly the four new tests, beside the suite's known todo marks.
- CI is green on the head (python and node, run 37649293457).
- Only `src/repository-hosts/` — `github.mjs`, `gitlab.mjs`, `index.mjs` — and the new test, which names
  MOD-repository-hosts, changed.
- The four new tests name what they guard and the module, and each has its counter-proof recorded.
- The first rejection's reason (`20261007-1404-…-a0e7.md`) is met. GitHub's 422 "Reference already exists" and a GitLab
  server's 400 are read as `TagExists`, naming the commit the tag stands on, and the tag is not moved. The other refusals,
  the module's failures and the token sent only to its own server hold as well.

Why it is rejected: check 5. The Acceptance's "the tags with their commits, and only those of a pattern", with fakes that
answer as the servers do, does not hold for a repository with more than 100 tags.
- MOD-repository-hosts' file: `listTags(pattern?)` gives "the tags". GitHub's and GitLab's tag lists answer at most 100
  per page and name the next page; the module's own GitLab snapshot reads its tree page by page.
- `listTags` reads one page (`per_page=100`) on both servers and never the next, and the pattern filters only that page.
- Run on the head, against a GitHub that pages as GitHub does:
  - 50 tags give all 50;
  - 150 tags give 100, and `listTags("v2026.150.0")` gives none, although that tag exists.
- The newest release candidate that ITM-239 looks for, and the version line ITM-254 reads, are among the tags it can miss.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-239 builds on it.
