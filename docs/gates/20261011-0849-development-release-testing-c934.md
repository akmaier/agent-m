---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cdacd4db875bb2c1d339a15c122ccc7965751944
  - https://github.com/akmaier/agent-m/pull/333
date: 2026-10-11 08:49 UTC
---
# Development → Release testing: ITM-305

**REGISTER**

## Reason

ITM-305, pull request #333 by developer-sonnet-b into `sprint/team1/13`, on head `cdacd4d`, against the item and
MOD-trace-graph's accepted file as they stand at the sprint's commit and on `main`. All five points hold:
- The first commit, `471a04b`, holds only `tests/trace-graph-documents.test.mjs`, and CI was red on it (run
  38125542573): node failed on exactly its 7 tests — 1234 tests, 7 failed.
- CI is green on the head (run 38125739700): node 1234 tests, 0 failed, the tests that reach the release report among
  them; python passed.
- Only MOD-trace-graph's folder — `build.mjs`, and comments and typedefs in `index.mjs` and `derive.mjs` — and the new
  test whose header names the module change; no existing test or expected result changes.
- The 7 new tests name what they guard and MOD-trace-graph, and have 23 counter-proofs.
- The Acceptance holds: every node and edge of a use case, a decision, a module file, a plan step and an item; the title of
  every group, at any depth; a malformed use case listed in `unread` while the graph still holds the others.

Noted for the sprint's review, no condition of this gate:
- MOD-trace-graph's `Graph` has no node kind for a group, though its Data puts the groups' titles in the graph: built as
  the kind `group`, keyed `<path>:<line>`. Nor does it hold a module's `folder` or `provides`, an item's `level` or
  `tests`, the texts or their links, which ITM-306's checks need (the sprint record names the question).
- `blobSha` of MOD-text-tools is used and not listed among the module's uses; no `source` edge is built, since none of
  the files read states one; `tracesTo` still fills only `tests`.
