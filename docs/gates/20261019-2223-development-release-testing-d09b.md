---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 90325288825e31338e6b0dc3cb450967cda26723
  - https://github.com/akmaier/agent-m/pull/1172
date: 2026-10-19 22:23 UTC
---
# Development → Release testing: ITM-1128, the participants page and the endpoint configuration say when the prompt bar appears

**REGISTER**

## Reason

ITM-1128, pull request #1172 into `sprint/team2/97`, passes on `90325288`. CI is green, on 20 of 20 jobs.

1. **Red first.** `e2717909` holds only tests, and its CI failed.
2. **The text is UC-049 1a's own:** the prompt bar appears once a model endpoint, a CLI agent or a sandboxed agent is
   configured and reachable from this browser. Both pages take it from one constant.
3. **A planted fault, repeated by me.** The note left off the participants page fails the new test.
4. **The shared fixture's `focus() {}`** in `tests/site-frame-start.d/dom.mjs` is a test helper, not a release test. All
   14 files that use it pass.
5. **The todo mark** of TST-513025 is removed by developer-sonnet-g, who did not implement ITM-1128, in a commit of its
   own on this branch.
