---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5ea726e343da1e507db1da38b8ca0a5df2adfb8f
  - https://github.com/akmaier/agent-m/pull/942
date: 2026-10-18 21:16 UTC
---
# Development → Release testing: ITM-670, the settings and test pages' tests import the frame's DOM helper

**REGISTER**

## Reason

ITM-670 (MOD-site-frame), its pull request #942 into `sprint/team1/92`, passes on `5ea726e3` as refactoring.

1. **The participant trailer is present:** `developer-sonnet-a`. It is one commit, declared as refactoring.
2. **The change** is, in eight files, the line `import "./site-frame.test.mjs";` replaced by
   `import "./site-frame-dom.mjs";`, with each header's sentence following it. The diff holds nothing else. The eight
   files are five of MOD-settings-pages and three of MOD-test-pages. By 92.md's ruling, a test names a module but is not
   one of its files, so this changes no file of those modules.
3. **The results are identical.** The eight files fall from 221 tests to 77, all passing. That is exactly the 18 tests of
   `site-frame.test.mjs` times 8, with none added or changed.
4. **Green.** CI run 39166876579 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `2d72e2a3`).
5. **`tests/settings-pages-harness.mjs` stays as it is.** Its DOM is not the same as the helper's:
   - it treats a non-breaking space differently;
   - it makes a fresh document per call for about 30 files.
   So it is no copy that can simply be replaced. Its item is registered once four-digit identifiers are possible (92.md).
6. The helper's header (`site-frame-dom.mjs:4-5`) goes stale once the last importers move. It is dropped in sonnet-d's
   pull request, which merges last.
