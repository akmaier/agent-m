---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 06e517296b358f095431147d06475f5ceb1b3518
  - https://github.com/akmaier/agent-m/pull/684
date: 2026-10-17 04:11 UTC
---
# Development → Release testing: ITM-590, A product's requirement sources page links library sources with version and part

**REGISTER**

## Reason

ITM-590, pull request #684 into `sprint/team1/64`, again at head `06e51729`, which is unchanged since the rejection
(`docs/gates/20261017-0406-development-release-testing-9d71.md`). No pushed commit was rewritten.

**The two requests are met.**
1. **The corrected tests ran red on CI.**
   - The branch `item/ITM-590-red2` (`fb3e9552`) held `cd78e1f7`'s `src` with `06e51729`'s test files. It ran through
     the draft pull request #685, since CI runs only on pull requests. #685 is now closed.
   - Run 39001404726 concluded `failure` on `fb3e9552`. The Scrum Master's saved logs total node (0) 3 failures with 2
     existing UC-019 todos, node (1) 17, and node (5) 6, with no other failure.
   - These are the same 26 new tests as the first red. The corrected test and the two holding the new assertions are
     among them.
2. **F10 shows the two new assertions failing on their own behaviour.** That is the limit the red has, since the base
   has no `sources` route at all.
   - F10 makes a restricted source's box disabled (`permittedPlaces(entry) !== "any"`). Exactly the two tests holding
     "a restricted source can be ticked" fail.
   - Reverted, the files pass 26 of 26.

The wait's correction needs no counter-proof of its own. It changes when a test reads, not what it asserts, and its
assertions are red on the base.

**Everything else** holds as the rejection recorded it: CI ten of ten on the head, mergeable, thirteen planted faults
caught, reachability through MOD-site-frame's route, and the `library.mjs` changes. The developer's findings are
registered as ITM-637 to ITM-643, with two drafts for akmaier.
