---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 350893a73ebab1f6e540ada7f1d9dd8c71fc1786
  - https://github.com/akmaier/agent-m/pull/484
date: 2026-10-13 00:34 UTC
---
# Development → Release testing: ITM-409, the Definition of Done of a pull request, without reviewers other than the implementer

**REGISTER**

## Reason

ITM-409, pull request #484 by developer-sonnet-a into `sprint/team1/26`, head `350893a`. Three tests-only commits,
`10355c8`, `32597f4` and `f98282f`, are each red in CI. The first is red on a syntax error, which the second names
and corrects, so red for the right reason is seen before any code. The code `350893a` is green. Changed:
`src/product-process/done.mjs` (in the Parts), `index.mjs`, and the new `tests/product-process-done.test.mjs`,
naming MOD-product-process and its guards. No existing test changes. 27 planted faults are recorded, all killed.

The Acceptance holds but for one part of a declared condition. The Outcome includes "the conditions the declaration
adds", and MOD-product-process' file gives the declaration's condition as "`review: <n> by participants other than the
implementer`". The count of distinct approving reviewers is checked; that they are not the implementer is not.
`doneCheck`'s inputs name no implementer: `job` holds `kind` and `modules`. A commit's `Agent-M-Participant`
trailer names a participant, while a review names a host account, and nothing among the inputs maps one to the other.
So no text lets it be built, as with *Refine* at #480. The item passes with that part unfinished, and the change of
MOD-product-process' file it needs is for akmaier.

Over this repository, #457's new test gives EVERY ARTIFACT NAMES ITS ORIGIN, because it has no test declaration. The
code follows the accepted text: MOD-test-document's declaration is a block per test case whose first line is
`TST-<nnn>`, with `level`, `module`, `guards`, `given`, `input` and `expect`. Team 1's test files carry a
file header `// Module:`/`// Guards:` and per-case `guards:`/`given:` blocks without that first line, as
`docs/instructions/developers.md` rule 1 tells them. That is a defect of team 1's tests and of that instruction against
the accepted module file, not a reading for the texts to settle; it is noted for the review, together with ITM-449's 304
files. The readings named in the pull request stand. `doneCheck` returns a Promise because `facts.read` is
asynchronous, where the module file shows `Finding[]`: a difference between text and code, noted as for
`applyApproved`. The findings' places, the comparison of a refactor's assertions, and gates up to the job's phase
contradict no text.
