---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c9e9bad1337bb6c2a3b963017a307a92605689a8
  - https://github.com/akmaier/agent-m/pull/851
date: 2026-10-18 06:52 UTC
---
# Development → Release testing: ITM-884, a collaborator's Save that is refused is shown on the page, not thrown

**REGISTER**

## Reason

ITM-884 (MOD-settings-pages), pull request #851 into `sprint/team1/87`, passes on `c9e9bad1`.

1. **Red first, tests only.** `7d733f86` adds `tests/settings-pages-collaborator-refusal.test.mjs`. It also changes
   TST-868001 to 868005 in `tests/settings-pages-reconnect-refuses-secret.test.mjs`, under `d995c09b`.
   - The old assertion: `refused?.name === "SecretRefused"`, the handler's rejection, which this item removes.
   - The new: `refused === null`, and the result line says "docs/collaborators.md holds a configured secret — nothing was
     written".
   - Both still pin that nothing is written.
   Run 39105085664 is red on exactly TST-884001 to 884003 and TST-868001 to 868005.
2. **The change** is only in `src/settings-pages/settings.mjs`. A local `saveCollaborators` catches `saveFile`'s refusal,
   shows its message in the collaborators' result line, and returns `null`. The three handlers stop on `null`. The message
   names the file, never the value (MOD-repository-hosts.md:156).
3. **Green.** Run 39105280201 on `c9e9bad1` passes all twelve jobs. `git merge-tree --write-tree` merges the head into the
   current `sprint/team1/87` without a conflict (tree `9740172e`).
4. **The Acceptance holds:** "A collaborator's Save that `saveFile` refuses shows the refusal in the handler's result,
   naming the file and never the secret".
   - I replayed the counter-proof in a clean checkout of the head: with the catch rethrowing, 3 of 3 of the new tests fail.
     Restored, `src/` is clean.
   - The developer's three counter-proofs, one per handler, each fail only their own test.
5. **Release tests (agreement 83).** I ran on the head the settings release tests, with this sprint's settings tests and
   the Bridge packages installed as CI does: 59 of 59.

**developer-sonnet-a's next item is ITM-896, the pseudonymisation Save.**
