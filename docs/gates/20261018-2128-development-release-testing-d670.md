---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 31daa8038a36275eb30c5f94c83a4810d9cb2e51
  - https://github.com/akmaier/agent-m/pull/943
date: 2026-10-18 21:28 UTC
---
# Development → Release testing: ITM-670, the last importers take the frame's DOM from its helper

**REGISTER**

## Reason

ITM-670 (MOD-site-frame), its pull request #943 into `sprint/team1/92`, passes on `31daa803` as refactoring. With it,
ITM-670's Outcome is built.

1. **The participant trailer is present** on every commit: `developer-sonnet-d`. `git show --cc` of the merge `52558aac` is
   empty.
2. **The change:** eight importers replace `import "./site-frame.test.mjs";` with `import "./site-frame-dom.mjs";`, with
   their headers' sentences. Ignoring comment lines, the diff holds exactly these 8 removed and 8 added lines. The
   helper's header (`site-frame-dom.mjs:4-5`) no longer says that other modules import the test file.
3. **The results are identical.** Each group loses exactly the frame's 18 tests once per importer, and nothing is added or
   changed.
4. **No test imports `site-frame.test.mjs` any more:** 0 files import it on the head, while 30 files name the helper, the
   known positive.
5. **Green.** CI run 39167598731 passes all twenty jobs. GitHub shows the merge state as unknown, but
   `git merge-tree --write-tree` merges the head into `sprint/team1/92` without a conflict (tree `cce4841b`).
