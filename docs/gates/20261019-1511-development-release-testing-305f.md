---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c3833171c29d4b18d788bac4e3e959ea6c01e6dd
  - https://github.com/akmaier/agent-m/pull/1063
date: 2026-10-19 15:11 UTC
---
# Development → Release testing: ITM-1005, the Bridge reads its build.json and update key at start

**REGISTER**

## Reason

ITM-1005, pull request #1063 into `sprint/team2/96`, passes on `c3833171`. CI is green on the head (run 39272577292), on
20 of 20 jobs.

1. **Red first.** `74b70c12` holds only the tests. Run 39272501965, through the helper #1093, ran on that commit and failed
   in `mod-desktop-shell-build-resources`.
2. **Scope.** `src/desktop-shell/main.mjs`, the new `build.mjs` and the new test. MOD-desktop-shell's blob `d30098a0` is
   checked.
3. **The reading the item left to g** (its Acceptance: "Whether the command-line options stay … is the developer's
   reading").
   - A start that names `--instance` is a start from the source folder, and keeps the command line.
   - Every other start is the packaged app's, which reads `build.json` and `update-key.pem` from its resources.
   - So `release-itm-276-desktop-shell.test.mjs`, which starts through `--instance`, needs no change.
   - That release test and `desktop-shell.test.mjs` need Linux and xvfb, so they run only in CI's full run: in the sprint's
     pull request into `main`.
