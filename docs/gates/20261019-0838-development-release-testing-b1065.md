---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9b0042bfa01254371e053ff0b2615853563e4594
  - https://github.com/akmaier/agent-m/pull/985
date: 2026-10-19 08:38 UTC
---
# Development → Release testing: ITM-1065, passed — connect refuses a text that is no token, and setup keeps none

**REGISTER**

## Reason

ITM-1065 (MOD-repository-hosts, MOD-settings-pages), pull request #985 into `sprint/team1/93`, passes on `9b0042bf`.

- **Three commits, one parent each, no merge, all with their trailer:**
  - `c9abe4f1` and `376ddef7`: developer-sonnet-d;
  - `9b0042bf`: developer-sonnet-b.
- **The red** is `c9abe4f1`, tests only (5 test files), in run 39222460332:
  - job node (1): `# fail 1`, `# todo 0`, the one failure being "connect refuses a text that is no token of either
    server, with a message that never holds it";
  - job node (9): `# fail 3`, `# todo 0`, the three setup tests for a text that is no GitHub token, a token of the other
    server, and a text that begins as a GitHub token does.
- **The code** `376ddef7` changes only `src/repository-hosts/index.mjs` and `src/settings-pages/setup.mjs`. These texts were
  accepted at `6052d105`.
- **The release tests** are changed in `9b0042bf` by developer-sonnet-b, who builds none of ITM-1065 (SPEC.md:1501-1503).
  Only fixture tokens change, to real prefixes (`github_pat_`, `glpat-`). No assertion or expected value moves.
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` is clean onto `sprint/team1/93` (`37886a09`) and onto #986's head
  `b17c28d6`.
- **Replayed in a clean worktree at the head,** with the Bridge installed:
  - the three release files, `repository-hosts` and `settings-pages-setup` pass 63 of 63;
  - counter-proof, with `376ddef7`'s two source files taken back to `c9abe4f1`: 59 pass and 4 fail.
