---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bdc08c8ae25ebaaab48146354fd6b8bbdbad8bc3
  - https://github.com/akmaier/agent-m/pull/853
date: 2026-10-18 07:03 UTC
---
# Development → Release testing: ITM-885, TST-276004 fails once on a base where it passes

**REGISTER**

## Reason

ITM-885 (MOD-desktop-shell, tests only), pull request #853 into `sprint/team1/87`, passes on `bdc08c8a`. Its Acceptance is
as amended in `7e42507a`: the cause named from its log, removed where it is in the tests, with a deterministic test.

1. **The cause, from the log of run 39102909575, job 117602662661.** The three `unusedPort()` calls of `launch`
   (`tests/desktop-shell.test.mjs:174-180`) each closed their server before the next one was opened. That handed out
   port 45145 twice (`--inspect=45145 --remote-debugging-port=45145`), and Electron printed
   `bind() failed: Address already in use`. It is the test's race, not the runner.
2. **Red first.** `6248ca04` holds only `tests/desktop-shell-ports.test.mjs`. Run 39105846618 is red with
   `ERR_MODULE_NOT_FOUND` for the helper it names. Against an uncommitted stub with the old behaviour, TST-885001 fails on
   behaviour (`[7,7,7]` for `[7,8,9]`). That is accepted under the missing-file rule.
3. **The change is in tests only.**
   - `tests/desktop-shell.d/ports.mjs`, `unusedPorts(count, open)`, holds every server open until all the ports are read,
     and closes them after, also on a failure.
   - `launch` takes its three ports from it, TST-276003 uses `unusedPorts(1)`, and the file's own `unusedPort` is removed.
   - No `src/` file changes.
4. **Green.** Run 39106044708 on `bdc08c8a` passes all twelve jobs, with TST-276004 and TST-885001 to 885003 ok.
   `git merge-tree --write-tree` merges the head into the current `sprint/team1/87` without a conflict (tree `aa8cc181`).
5. **The Acceptance holds.**
   - I ran the two files on the head: 3 pass and 6 skipped, because the native Electron tests skip on this machine as on
     the developer's.
   - I replayed the counter-proof in a clean checkout of the head: with each server closed before the next is opened, the
     old behaviour, TST-885001 fails. Restored, it is clean.
6. **Release tests.** No release test imports a file the item changes. The item changes test files only.
