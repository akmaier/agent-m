---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bac899a9bb791861859f0c286ba163653c3f2167
  - https://github.com/akmaier/agent-m/pull/1194
date: 2026-10-20 11:36 UTC
---
# Development → Release testing: ITM-1079, passed — the download page names the publisher to look for

**REGISTER**

## Reason

ITM-1079 (MOD-settings-pages), pull request #1194 into `sprint/team1/97`, passes on `bac899a9`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `94f8306c` holds only tests: TST-1079001 and TST-1079002 in `tests/settings-pages-bridge-download.test.mjs`
    (level `unit`), with `notes` in its fake release.
  - `bac899a9` changes only `src/settings-pages/bridge.mjs`.
    - It reads `Publisher (<system>): <name>` from the latest release's notes (MOD-settings-pages.md:214).
    - It shows the name beside the file and repeats it in *Why this warning?*.
    - Without the line, it says the release names no publisher for this system.
- **The red,** run 39415184855, job 118602372980 on `94f8306c`: `# fail 2`, `# cancelled 0`, exactly tests 167 and 168.
- **It meets the Acceptance:** the route names the publisher of the release beside its file, and *Why this warning?*
  names the same one.
- **CI:** 20 of 20 checks passed on the head (run 39415592012).
- **Merge:** its base is `1d9cd123`. `git merge-tree --write-tree` onto `sprint/team1/97` (`50e7e93c`, after #1193 and
  #1196) is clean, and so is it with #1195's head.
- **Replayed in a clean worktree, with `sprint/team1/97` merged in:**
  - The 370 tests of `tests/settings-pages*.test.mjs` pass.
  - Counter-proof: with `94f8306c`'s `bridge.mjs`, exactly tests 167 and 168 fail.
