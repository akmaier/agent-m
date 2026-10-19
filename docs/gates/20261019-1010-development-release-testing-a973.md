---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 7a459f829f652e1852544adc73568fd8a140eba0
  - https://github.com/akmaier/agent-m/pull/1006
date: 2026-10-19 10:10 UTC
---
# Development → Release testing: ITM-973, rejected — retryJob adds a refusal its text does not name, through an import its module does not use

**REGISTER**

## Reason

ITM-973 (MOD-runtimes), pull request #1006 into `sprint/team1/93`, is rejected on `7a459f82`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-c`.
- The red is `84cddec0`, run 39235075466: `# fail 1`, `# cancelled 0`, the file `tests/runtimes-retry.test.mjs` failing as a
  whole on the missing `retry.mjs`. SPEC.md:1426-1427 asks that the CI run on the first commit is red, and it is, as at
  ITM-960's gate.
- `retryJob` queues a new job through `queueJob` with a new identifier and the same inputs and parameters, naming the job it
  retries, and fails with `TaskNotInRecord` for a hand-over task (MOD-runtimes.md:220-224).

**What fails.**
- **The extra refusal.** `retry.mjs:32-36` refuses with `NotHolderOfRole` a participant that lacks the capabilities of the
  kind. MOD-runtimes.md:220-224 names no such refusal. "the participant is the same or another holder of the role"
  describes the choice the caller makes, and the text gives `TaskNotInRecord` as the one failure of its own.
- **The import it needs.** To read the kind's capabilities, `retry.mjs:12` imports `kindOf` from MOD-job-catalogue. MOD-runtimes
  does not name that among its uses (MOD-runtimes.md:31 names only `KindDefinition`). That makes a new `import-not-in-uses`
  gap, which would need a draft.

**What passes on the next head.**
- `retryJob` refuses only what its text names, and what `queueJob` refuses.
- The capability check, the import of `kindOf` and the test of `NotHolderOfRole` go.
- No draft is needed.
