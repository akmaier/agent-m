---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 7deadfbda361edc7b1b1c87e0ad8857c28a58e0e
  - https://github.com/akmaier/agent-m/pull/167
date: 2026-10-07 14:04 UTC
---
# Development → Release testing: ITM-247

**REGISTER**

## Reason

ITM-247, the tags of a repository: pull request #167 by developer-sonnet-d, on head `7deadfb`, branched from `sprint/08`
at `b63cb58`. What holds:
- The first commit, `30ca822`, holds only `tests/repository-hosts-tags.test.mjs`, and CI was red on it, on exactly its
  four tests.
- CI is green on the head (python and node).
- Only `src/repository-hosts/` — `github.mjs`, `gitlab.mjs`, `index.mjs` — and the new test, which names
  MOD-repository-hosts, changed.
- The four new tests name what they guard and the module, and each has its counter-proof recorded.

Why it is rejected: check 5. The Acceptance's "an existing tag refused with `TagExists` naming its commit" does not hold
on GitHub.
- MOD-repository-hosts' `createTag` fails with `TagExists { commit }` for a tag that exists.
- `github.mjs` reads only a `409` answer of *Create a reference* as that case; the test's fake GitHub answers `409`.
- GitHub answers a reference that stands already with `422` "Reference already exists", as reported with the full
  response in github.com/orgs/community/discussions/72695.
- Run on the head with that answer, `createTag` fails with `Unreachable` ("GitHub answered 422"); with `409`, with
  `TagExists` and the commit. UC-013 4a then names no existing tag.
- The tag is not moved either way. GitLab's `400` "Tag … already exists" is read as `TagExists`.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-254 and
ITM-239 build on it.
