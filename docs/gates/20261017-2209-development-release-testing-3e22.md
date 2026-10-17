---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 863227a27543fa9cf5ee47b17974208364040f06
  - https://github.com/akmaier/agent-m/pull/791
date: 2026-10-17 22:09 UTC
---
# Development → Release testing: ITM-844, a product's SPEC entry reads the instance's register in one batch

**REGISTER**

## Reason

ITM-844, pull request #791 into `sprint/team1/78`, at head `863227a2`. It is mergeable, and run 39073711498 passed ten of
ten. It changes four files, +231/−12: one line of `src/review-pages/spec-entries.mjs`, the shared harness, and two new
test files.

**Red, then code.** The tests-only commit `84bc30e9` was red in run 39073203692 on exactly the five cases that need the
change: TST-844101, 201, 203, 204 and 205. Those that pin what must not change pass on the base too. The code was pushed
after the run had ended.

**The acceptance is met.**
- On a product's page, `sourcesOf` reads the instance's register entries ahead in one batch. On the instance's own page
  it reads nothing ahead, since the view's batch already holds them.
- The harness's second fake for the instance reaches the read (sprint 77's agreement). Without it, the instance throws as
  before, and the existing tests are unchanged.
- A product's entry page goes from 14 requests to 13 with a token, its instance side from 8 to 7. Without a token it stays
  at 17. The known positive, the instance's own entry at 6 and 121, held.
- Three planted faults are caught. 104 files give the same totals on the base and the head, no release result changed, and
  ITM-018 passes.

**Findings.**
- **The instance's snapshot is built twice** on a product's page (three requests). This is ITM-848, registered.
- **`jobs.mjs` and `requirements-draft.mjs`** gain the same batch through `sourcesOf`, and their tests are unchanged.

**Process.**
- One edit was made with a Python heredoc and a probe with a shell heredoc, and a mistyped path was written and removed.
  Both go to the feedback.
- **The refused `sh <script>` was run as a node script.** That is the same work under another interpreter after a refusal,
  which is the shape of a way around a guard (sprint 66's agreement). It goes to the retrospective.
- **The result stands.** The red and the green this gate rests on are CI's runs, not the local script's.
