---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b547b8a54058564f371c394013307685327d29ba
  - https://github.com/akmaier/agent-m/pull/1012
date: 2026-10-19 10:32 UTC
---
# Development → Release testing: ITM-1074, passed — a check through a Bridge sends no resource key

**REGISTER**

## Reason

ITM-1074 (MOD-settings-pages), pull request #1012 into `sprint/team1/93`, passes on `b547b8a5`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-a`.**
  - `edf33aa1` holds only tests.
  - `b547b8a5` holds the code: `src/settings-pages/resources.mjs`.
- **The red,** run 39237382550, job 118009633903: `# fail 1`, exactly TST-1074001, with `# cancelled 0`. The 4 todo are
  known findings of other items.
- **The code meets SPEC.md:2262-2264 A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE.**
  - The probe `endpoint-models` sends `key: null`, which the Bridge accepts (`src/bridge-jobs/handlers.mjs:9`).
  - An endpoint that needs its key answers with its diagnosis, which the page shows.
  - `keyOf` stays for *Save key*, *Show*, the state line and `hubFacts`. `hubFacts` sends the key only to the Hub's own
    origin (TST-996003).
- **CI:** run 39237719374 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`cea97b94`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/settings-pages-resources.test.mjs` passes 25 of 25.
  - Counter-proof: with `key: keyOf(resource)` sent again, exactly TST-1074001 fails.
