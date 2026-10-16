---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3df38704f8764f2be990f7c93a4f0ddaf3f30525
  - https://github.com/akmaier/agent-m/pull/605
date: 2026-10-16 16:41 UTC
---
# Development → Release testing: ITM-557, The desktop fixtures' Openbox install waits for the package lock

**REGISTER**

## Reason

ITM-557, pull request #605 into `sprint/team1/47`, at head `3df38704`. developer-sonnet-a wrote it, and implemented none
of MOD-desktop-shell, as the item asks. It lists AGENTS.md, SPEC.md, the item, `47.md`, MOD-desktop-shell and chapters
9, 11, 12 and 13 as read in full.

1. **No red commit is required.** The item adds no behaviour. The counter-proofs ran in a harness of each file's own
   fixture function with stand-ins, for both files:
   - the known positive passes;
   - an install of a package that does not exist still fails, naming the Linux Openbox install;
   - a lock held for three seconds is waited for, and the install goes on after about 3 s with the option;
   - without the option, apt exits at once with the lock error.

   A first harness leaked its planting variable; it was corrected and run again, and the pull request says so. The
   stand-ins show the call, not apt on a real mirror. The listing of `/private/tmp/claude-501/` was the same before and
   after the work.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable. `tests/desktop-shell.test.mjs`
   ran on Linux in it and passed.
3. **The changes stay in the item's scope.** Each of the two files changes one line: `"-o", "DPkg::Lock::Timeout=50"`
   before `"-o", "Acquire::Retries=3"` in its Openbox install. The limit stays at 60 seconds, and no assertion or expected
   result changes. ITM-543's and ITM-541's changes were followed (§6a.1).
4. **The release test, before and after.** TST-276901 is skipped on macOS before and after, and both files parse. It
   first runs on Linux in the sprint's pull request into `main`.
5. **The Acceptance holds.** Both installs wait for the lock and retry a slow mirror within 60 seconds. The lock
   counter-proof is recorded, the release test's run is recorded before and after, and the author implemented none of
   the module.
