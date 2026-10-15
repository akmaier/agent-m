---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0b4fccd3c137ed6f3e5d8eb53031c68a5888ce90
  - https://github.com/akmaier/agent-m/pull/536
date: 2026-10-15 23:59 UTC
---
# Development → Release testing: ITM-479, Many files are read in one request

**REGISTER**

## Reason

ITM-479's unit and component tests and its code, in pull request #536 into `sprint/team1/31`, at head `0b4fccd3`.
developer-sonnet-d made both commits.

1. **The red commit.** The tests-only commit `77651a12` holds only the two new test files. CI was red on it: run
   38825899290, node (4), with the nine new tests.
   - The code commit changed the fixture of two new tests (TST-479006 and TST-479008). In each, a SPEC line gained its
     source, so the line reads as a requirement.
   - That changes only how the tests prepare their input. I ran the head's tests against the red commit's code:
     TST-479006 fails on the same assertion, "1334 requests", with the original fixture and with the corrected one.
   - On the head, the same test passes. So the test that went red is the test that went green, for the same reason.
2. **CI is green on the head**: ten of ten jobs, run 38826507682. The developer ran the release and system tests of
   MOD-repository-hosts, MOD-trace-graph and UC-006 locally, with no failure, along with `load-per-view`,
   `dashboard-review-flows` and `test_no_backend`.
3. **The changes stay in the item's scope.**
   - `src/repository-hosts/github.mjs` and `index.mjs`, and `src/trace-graph/build.mjs` and `index.mjs`: the item's
     modules.
   - Two new test files, each naming its module.
   - No existing test changed, as the item states.
   - The code builds against MOD-repository-hosts' accepted blob `5264dc1e8056`; `containsCommit` is not built.
   - The GraphQL request goes through the adapter's existing request helper and origin gate, so no new channel was added.
4. **The new tests.** TST-479001 to TST-479009 name their requirements and modules, and state their values in their own
   text. Fifteen planted-fault counter-proofs are recorded in #536, and each test is failed by at least one of them.
5. **The Acceptance holds.**
   - GitHub's documented limits are cited from their pages, and each claim relied on was checked with a real known
     positive, recorded in #536:
     - a query of 101 aliased files cost 1 point;
     - a truncated file and a binary file answer as documented.
   - On any other server, in a clone, or without a token, nothing is read ahead.
   - The regression test bounds one trace graph of 1,332 files at 16 requests; it made 1,334 before.
   - A used-up limit is named `RateLimited`, including GraphQL's `RATE_LIMITED` in a 200 answer.

**The batch size B = 100.** GitHub documents no number of files per query, so the start decision's "documented number"
cannot be met literally. I read B = 100 as fulfilling it, because:
- it is bounded by the documented limits: 500,000 nodes, 10 seconds per call, and the 1–100 range of `first`/`last`;
- it was checked by the known positive.
The module file asks that every limit be read from GitHub's documentation, and those limits were. It is noted for the
review.

**Still open for the item.** ITM-479's system and release tests of UC-006 belong to developer-sonnet-e and are not part
of this pull request. The item is done once they are merged.
