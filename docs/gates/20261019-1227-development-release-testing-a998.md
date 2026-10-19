---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 38270620f6dac371b7bb30407294ec4a64756a04
  - https://github.com/akmaier/agent-m/pull/1051
date: 2026-10-19 12:27 UTC
---
# Development → Release testing: ITM-998, passed — a model endpoint's use tools is preset from its last test

**REGISTER**

## Reason

ITM-998 (MOD-browser-store, MOD-settings-pages), pull request #1051 into `sprint/team1/93`, passes on `38270620`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-d`.**
  - `de5757f1` and `555863f3` hold only tests.
  - `38270620` holds the code: `src/settings-pages/endpoints.mjs` and `participants.mjs`.
- **The red,** run 39251449478 on `555863f3`, job 118055970531: `# fail 5`, `# cancelled 0`, exactly TST-512008, TST-998001
  and TST-998002 to 004.
- **The changed assertion of TST-512008 stands.** It is a unit test. Its expected value follows MOD-browser-store.md:81 as
  accepted, where `last-test:<key>` keeps `tools` for an endpoint's test. It changes in a commit of tests, before the code,
  as this item's output.
- **The code.**
  - The last test keeps `tools` where it reached the model.
  - *use tools* is ticked or unticked from the endpoint's last test when the type is chosen, when the endpoint changes, and
    after a test in place. The other capabilities are left alone.
- **CI:** run 39251841227 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`aad885f8`) is clean.
- **Replayed in a clean worktree at the head:**
  - `settings-pages-endpoints` and `settings-pages-participants` pass 51 of 51.
  - Counter-proof: with `555863f3`'s `participants.mjs`, the 3 preset tests fail.
