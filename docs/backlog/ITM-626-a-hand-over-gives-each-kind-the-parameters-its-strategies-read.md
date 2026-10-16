---
id: ITM-626
title: A hand-over gives each kind the parameters its strategies read
level: module
realises:
  - UC-049
  - UC-019
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-605
tests:
  - unit
origin:
  - ITM-570 stopped at sprint team1/57 by developer-sonnet-a: a hand-over of change-use-case fails with "UseCaseNotFound: the product has no use case undefined"
---
# ITM-626 A hand-over gives each kind the parameters its strategies read

**REGISTER**

## Outcome

The bar's hand-over names what it works on in the job's parameters through `paramsOf` (`src/prompt-bar/hand-over.mjs:89`).
For `works_on: ["UC-007"]` that gives `{ useCases: ["UC-007"] }`. `queue()` prepares `change-use-case` with it.

That kind's recipe `use-case-with-neighbours` reads "the use case named in the job's parameters" (MOD-approvals) as
`params.useCase` (`src/approvals/strategies.mjs:112-116`), the key the review pages pass (`src/review-pages/kinds.mjs:20`,
`parameter: "useCase"`). So `params.useCase` is undefined, and the run fails with "UseCaseNotFound: the product has no
use case undefined".

developer-sonnet-a verified this at the failure node with a temporary edit, since reverted. With `useCase` given, the
record is written and the hand-over reaches the workflow's dispatch.

**The readings, settled at sprint team1/57:**
- **The keys come from the strategies, not from the bar.**
  - The parameter keys are the ones the kind's strategies read, as the pages that start the same kind pass them.
  - The bar gives each key that `works_on` determines:
    - `useCase` for a single use case, beside `useCases`;
    - `requirements`, `useCases`, `items`, and `steps` for plan steps.
  - It invents none.
- **Every handed kind is checked, not only `change-use-case`.**
  - Before the code, the developer lists, for every kind whose strategies `handOverStrategies` holds, the `params.*` its
    strategies read. A grep of the strategies' files finds, among others:
    - `useCase`;
    - `requirements` and `useCases` (`rests-on-accepted`);
    - `items` and `steps`;
    - `source`, `resource`, `kind`, `entry` and `part`.
  - Keys that `works_on` cannot give, such as a source, a resource, or a group's kind, are not invented. Such a kind
    keeps failing its preparation in the tab with the strategy's own error, by name, and nothing is queued.
- **Existing tests.** `tests/prompt-bar-hand-over.test.mjs` asserts no parameters of a record. A grep of the file for
  `params` finds none, while `works_on` is found 5 times as the known positive.
- **Reachable through the real host.** The hand-over is prepared in the tab and queued on CI or a Bridge, which the
  developer reached up to the dispatch.

## Acceptance

- A hand-over of `change-use-case` on one use case is prepared and queued, its record carrying `useCase`.
- For every handed kind, the test states which of its parameters a hand-over gives and which it cannot. A kind whose
  parameters `works_on` cannot give is refused at preparation by its strategy's error.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
