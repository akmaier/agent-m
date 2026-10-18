---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0b9903beb74bd9479a401cb3fb2bbb5b8bd45259
  - https://github.com/akmaier/agent-m/pull/852
date: 2026-10-18 07:03 UTC
---
# Development → Release testing: ITM-896, a pseudonymisation Save that is refused is shown on the page, not thrown

**REGISTER**

## Reason

ITM-896 (MOD-settings-pages), pull request #852 into `sprint/team1/87`, passes on `0b9903be`.

1. **Red first.** `5e74ef95` holds only `tests/settings-pages-pseudonymisation-refusal.test.mjs`. Run 39105838131 is red on
   exactly TST-896001. TST-896002, the known positive, passes on the base.
2. **The change** is only in `src/settings-pages/settings.mjs`: a `try`/`catch` around the pseudonymisation Save's
   `saveFile`, which shows the refusal's message in its result line and stops. The message names the file and never the
   value (MOD-repository-hosts.md:156).
3. **Green.** Run 39106025913 on `0b9903be` passes all twelve jobs. `git merge-tree --write-tree` merges the head into the
   current `sprint/team1/87` without a conflict (tree `198463cb`).
4. **The Acceptance holds.**
   - I replayed the counter-proof in a clean checkout of the head: without the catch, TST-896001 fails and TST-896002
     passes. Restored, `src/` is clean.
   - **sonnet-a's added assertion is accepted.** The state line stays "Pseudonymisation is on." after a refusal. It
     follows from "nothing was written": the page shows no setting that the repository does not hold.
5. **Release tests (agreement 83).** I ran on the head the settings release tests, with this sprint's settings tests and
   the Bridge packages installed as CI does: 55 of 55.
