---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f25239b92effc8af633644458ee78d9e002f43ff
  - https://github.com/akmaier/agent-m/pull/1119
date: 2026-10-19 17:52 UTC
---
# Development → Release testing: ITM-619, MOD-work-plans' check sprint-record-checks

**REGISTER**

## Reason

ITM-619, pull request #1119 into `sprint/team2/97`, passes on `f25239b9`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `7e2c042c` holds only the tests, and CI run 39296513704 failed on it.
   - The fix commit changes TST-619004: one line repaired how a promise was read, and one assertion was added.
   - The added assertion is a counter-case: a line that only mentions a stakeholder does not say that none took part.
   - Both make the test stricter, and the test was red on the red commit.
2. **The readings settled in the item** (`065ceac0`) are built: `sprint-record-checks` in `workStrategies` gives an error
   - for missing sources;
   - for a name in `tookPart` whose feedback the review did not record;
   - for an empty `tookPart` without a line saying that no stakeholder took part;
   - for an empty retrospective;
   - for a `change` without `goes`;
   - for a key outside the `close` shape.
   TST-619001 to 009 cover these, with 15 planted faults.
3. **f's reading, accepted.** The empty retrospective is reported under A SPRINT ENDS WITH A RETROSPECTIVE (SPEC.md:1840). It
   is the requirement that rule states, and the item names no other.
4. **Scope.** `src/work-plans/strategies.mjs` and the test.
