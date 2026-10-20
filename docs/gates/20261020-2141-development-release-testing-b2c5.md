---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5be7cb9128fd3f7b7dda4aa805f4cc80de7e2239
  - https://github.com/akmaier/agent-m/pull/1246
date: 2026-10-20 21:41 UTC
---
# Development → Release testing: ITM-842, the main page's facts without a token are measured and pinned

**REGISTER**

## Reason

ITM-842, pull request #1246 into `sprint/team2/99`, passes on `5be7cb91`. CI is green on 23 of 23 checks.

1. **Tests only, by the text.** akmaier accepted draft `d571344d`, option 3: without a token and without stored facts, the
   card's reading "costs one request per test file of the default branch … that cost is accepted".
   - So no code changes, and the item pins the cost. Its item says so (sprint 99's decision).
   - `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` concerns a job that adds or changes behaviour. This one adds none.
   - The red evidence is planted faults, as for ITM-367 (#1229). Four are listed, each with the cases it fails.
2. **The counts.**
   - The fixture holds 600 items, 400 job records, 701 test files and no stored facts.
   - Without a token: 1,714 = 600 + 400 + 701 + 13. The old page makes 1,006 requests on the same files.
   - With a token: 31.
   - TST-842002 shows the formula: 350 test files fewer are 350 requests fewer, and the old page's count does not move.
3. **The ~9 are named.** They are eight reads of the route's own and the tags read, against a replica of the old page that
   had stubbed the tags. Each is given with its line in `home.mjs` or `productFacts`.
4. **Callers.** No return changes. TST-827007 and TST-847003, which pin the counts on a one-file fixture, are untouched.
5. **Reading.** One passage each of AGENTS.md, SPEC.md and chapters 9, 11, 12 and 13 is named in the description.
