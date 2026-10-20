---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 44259dc760580d7302bf417f533a29394f9c483e
  - https://github.com/akmaier/agent-m/pull/1167
date: 2026-10-19 21:51 UTC
---
# Development → Release testing: ITM-1123, the prompt bar gives its job the places of the restricted sources

**REGISTER**

## Reason

ITM-1123, pull request #1167 into `sprint/team2/97`, passes on `44259dc7`. CI is green, on 20 of 20 jobs.

1. **Red first.** `39c9a0a7` holds only tests, and its run 39328929127 failed.
2. **A planted fault, repeated by me.** `restrictedPlaces` skipping every source fails 3 tests. f's faults are in the
   pull request.
3. **f's reading, judged.** The restricted sources are every entry of the instance's register. That is a superset of the
   product's linked sources that review-pages' `placesOf` (`src/review-pages/jobs.mjs:458`) gives, and the bar's tools
   read any path of the product, so it is the safe reading.
   - It does make two copies of one rule. Both compute MOD-job-runner's `JobContext.places` (MOD-job-runner.md:204-213),
     with different scopes, which is principle 2.
   - That is registered as an item to fold both into one function of MOD-source-register. MOD-review-pages' file is held
     by draft `9a2c9f4a`, so the item waits for it.
   - The `contents` path `docs/sources/<id>` of the product is f's own reading. MOD-source-register.md:99 keeps a
     restricted version in its content repository, so the path is stricter, not leakier. It is noted in the item.
4. **Not to be merged yet.** `places.mjs` imports MOD-source-register's `sourceSchemas` and `permittedPlaces`, which
   MOD-prompt-bar's uses do not name. The draft adds them with `registerPaths`, which f is to take instead of its own regex.
   The merge waits for an approval record that names the draft's blob.
5. **The todo mark** of TST-513024 is removed by developer-sonnet-h, who did not implement ITM-1123, in a commit of its
   own on this branch.
