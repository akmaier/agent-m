---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 96d260c77d058a6d36c09f4b81658a532ca43158
  - https://github.com/akmaier/agent-m/pull/552
date: 2026-10-16 06:54 UTC
---
# Development → Release testing: ITM-483, A subagent is reached through the agent that starts it

**REGISTER**

## Reason

ITM-483, pull request #552 into `sprint/team1/34`, at head `96d260c7`. developer-sonnet-a made both commits.

1. **The red commit.** The tests-only commit `8212c53a` holds only `tests/participant-list-through.test.mjs`, and CI was
   red on it (run 38863357750), on the missing `reachedThrough`. Run once locally against an uncommitted stub that answers
   `null`:
   - six tests fail on behaviour: TST-483002, 003, 004, 006, 007 and 008;
   - three pass, because they guard what already holds: TST-483001 (a register with ` secret <NAME>` is read without a
     finding), TST-483005 (a subagent with a CLI-agent starter is kept) and TST-483009 (each reason stands alone).
   So every new behaviour the item adds is seen failing first.
2. **CI is green on the head**: ten of ten jobs, run 38863663738. The pull request is mergeable against `sprint/team1/34`,
   which holds #551 and #553.
   - TST-320321902 and TST-321001 fail locally. The Scrum Master ran both on `main` without this change, and they fail
     there too: they are local macOS path failures (`/var` against `/private/var`), not this pull request's.
3. **The changes stay in the item's scope.** `src/participant-list/eligibility.mjs` and `index.mjs` are the item's module,
   and the new test file names it. No existing test changed, and `prepareJob` is untouched, as the start decision named.
4. **The new tests.** TST-483001 to TST-483009 name their requirements and MOD-participant-list, and state their values in
   their own text. The counter-proofs are recorded in #552.
5. **The Acceptance holds.**
   - `reachedThrough` names the starter of a route `through <name>`, and is `null` for every other route.
   - `eligible` leaves out a subagent reached through itself, or through no CLI agent among the participants given,
     with the two reasons the start decision named.
   - A register with an endpoint's ` secret <NAME>` reads without a finding.

**The developer's gaps, within the accepted text.**
- **Where the reason stands.** The `through` reason comes after `eligible`'s other reasons, in the order the function's
  comment lists them. The module file states no order, and no test asserts one.
- **A malformed route.** `through` alone, or with two spaces, is no `through <participant>` route, so it is no subagent
  and gives no reason. A name must be lower-case letters, digits and hyphens, as MOD-participant-list's file states every
  participant's name.
- **`prepareJob`'s subset.** It is left for ITM-494, as named.
