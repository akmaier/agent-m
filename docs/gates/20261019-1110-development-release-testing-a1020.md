---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9e789e4f27cae07b4e75c705a0069e0e6f992fc7
  - https://github.com/akmaier/agent-m/pull/1026
date: 2026-10-19 11:10 UTC
---
# Development → Release testing: ITM-1020, passed — a stand-in window is started with no display or window manager

**REGISTER**

## Reason

ITM-1020 (MOD-site-frame), pull request #1026 into `sprint/team1/93`, passes on `9e789e4f`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `4fb89c1a` holds only tests: `tests/site-usability-wait-error.test.mjs`.
  - `9e789e4f` changes the tests' helper `tests/site-usability.d/browser.mjs`: `openWindow` takes an optional launch command,
    which the stand-in tests pass.
- **The red,** run 39241673077, job 118023727209: `# fail 1`, `# todo 0`, `# cancelled 0`, exactly TST-1020001.
- **Option (1) of 93.md is built.** Without a launch command, staging is unchanged, and TST-1020002 shows it.
- **The ten runs are not needed.** The Acceptance asks for "ten runs beside the full node suite". Ten passing runs can only
  sample the wait. TST-1020001 shows it outright: on a faked Linux, with an `xvfb-run` first on the path that sleeps 30 s, a
  stand-in window is started without it. So the blocking calls that took the time can no longer be reached from these
  tests. The planted delay that the Acceptance's second half asks for is that test.
- **The cause is still named only by elimination,** as the pull request says.
- **CI:** 20 of 20 checks passed on the head (run 39241887844).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`738fe3ef`) is clean.
- **Replayed in a clean worktree at the head,** with a temporary folder of its own because of the stale lock noted at
  #998's gate:
  - `tests/site-usability-wait-error.test.mjs` passes 11 of 11.
  - Counter-proof: with `4fb89c1a`'s helper, exactly TST-1020001 fails, after 5 s.
