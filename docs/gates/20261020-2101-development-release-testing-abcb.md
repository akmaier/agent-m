---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 89d4cdf396046ffd3e913f0fb1e750175f7bf5b4
  - https://github.com/akmaier/agent-m/pull/1236
date: 2026-10-20 21:01 UTC
---
# Development → Release testing: ITM-809, the progress facts name the default branch's results and the instance (rejected once)

**REGISTER**

## Reason

ITM-809, pull request #1236 into `sprint/team2/98`, is rejected for the first time on `89d4cdf3`. CI is green on 23 of 23
checks. The code meets the accepted text. Two conditions of the brief are not met.

**What is met.**
1. **The accepted draft** `8f8f826a` (MOD-progress-measures, accepted `614f164b`):
   - `Facts.resultCommits`, read with `readHistory` and filtered to `runs/<commit>/`;
   - `Facts.own`;
   - the Tests stage through `resultsAt`, as the share of requirements that a passing test guards, from the newest
     commit that names each test;
   - `stageShares` async, and `currentStage` `string | null`.
2. **The own bar full once released is not an addition.** The accepted text says: "for the instance's own repository
   (`own`), which has no product, the same bar for Agent M, full once its first release is tagged". SPEC.md:919-921
   says: "the same bar, which is full once Agent M's first release is tagged". A full bar is every stage full.
   `stages.mjs` makes every share 1 in exactly that case.
3. **g's readings hold.**
   - A guard is matched exactly against the accepted requirements' names, from `Facts.tests[].guards`, since
     `Facts.graph` is never built.
   - `own` compares the product's address with the instance snapshot's address, the text's "the repository of
     `instance`".
   - Only `passed` passes. That follows from "a passing test" and from `resultsAt` keeping `flaky` and `not run`
     apart.
4. **The changed tests are unit tests, none of them a release test.** Each change follows from the accepted text:
   - TST-826006 pins one request more: the `readHistory` page `resultCommits` reads.
   - TST-873004 and TST-827002 expect Tests 0, not unknown, for a product with no passing test.
   - TST-685007 and TST-685008 give way to TST-809001 to 004, which state the Tests stage the text now gives.

**What is not met.**
1. **Red first.** The brief says (sprint 97's first Selection, step 3): "The first commit holds only the tests, and CI is
   red on that commit. If it is pushed with the fix, get a CI run on it through a helper pull request."
   - `35692aea` holds only the tests, but GitHub has no check run for it. Both commits were pushed together.
   - Sprint 96's agreement, and ITM-746's rejection for the same reason, make this a condition of the gate.
   - **Change:** get a CI run on `35692aea` through a helper pull request, and link it in #1236. Nothing in the code changes.
2. **Reading.** AGENTS.md:19-28 says an agent reads, before it starts, `AGENTS.md` and `SPEC.md` in the original, and,
   as a developer of code, chapters 9, 11, 12 and 13 of the book in full. The brief's first step makes it a checked step,
   with one passage of each named in the pull request.
   - g says it did not.
   - The code holds against the texts read here, so the reading is not made up after the fact as a finding against the
     code.
   - **Change:** g reads them now and names one passage of each in #1236, as the brief asks.
   - The same holds for developer-sonnet-f, who said so at ITM-842. f's ITM-587 is gated on it.

**Noted, not a condition.**
- g's full local suite stalled at TST-433002 and was stopped. Every CI shard is green, so it is read as local. If it stalls
  again, it is reported under agreement 94.
- `resultCommits` reads the whole default-branch history on every `productFacts` call in the scope `all`, as the reviewer
  noted at `8f8f826a`. Nothing stores it yet. The precompile work takes it up.

The second gate needs only the CI run on `35692aea` and the reading named in the pull request.
