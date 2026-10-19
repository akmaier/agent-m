---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7ad46fbd8e19bf4e1717f2364bb0d947eb44d91b
  - https://github.com/akmaier/agent-m/pull/1087
date: 2026-10-19 14:34 UTC
---
# Development → Release testing: ITM-593, passed — a requirement edit refused for missing write access offers GitHub's route

**REGISTER**

## Reason

ITM-593 (MOD-spec-changes), pull request #1087 into `sprint/team1/96`, passes on `7ad46fbd`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `86a01524` holds only tests, TST-593001 to TST-593004, in `tests/spec-changes-propose-section.test.mjs` and
    `tests/spec-changes-save-entry.test.mjs` (level `unit`).
  - `7ad46fbd` changes only `src/spec-changes/propose.mjs`.
    - `proposeSection` and `saveEntry` commit through `commitOrPages`.
    - On GitHub, `PermissionMissing` writes nothing and returns GitHub's pages, as without a token.
    - On GitLab, and for every other failure, the failure is thrown as before.
- **The red,** run 39268215034 on `86a01524`, with `# fail 1` and `# cancelled 0` in each failing job:
  - job 118113283169: exactly test 225, `proposeSection — when GitHub refuses …`;
  - job 118113283333: exactly test 321, `saveEntry — when GitHub refuses …`.

  The two tests of failures thrown as before guard.
- **It meets the Acceptance and MOD-spec-changes.md:151-154.** The review pages show the returned pages through the
  path that exists, `outcome.fallback` (`src/review-pages/edit.mjs:96`, `entry-edit.mjs:75`).
- **For a later item, not this one:** `edit.mjs:97` explains that fallback as "there is no token". After a refused
  permission, the person has a token.
- **CI:** 20 of 20 checks passed on the head (run 39268708680).
- **Merge:** the parent of `86a01524` is `sprint/team1/96` at `b366a072`. `git merge-tree --write-tree` with #1086's
  head is clean.
- **Replayed in a clean worktree at the head:**
  - The 179 tests of `tests/spec-changes*.test.mjs` and `tests/review-pages-edit*.test.mjs` pass.
  - With #1086's head merged in, the 150 spec-changes tests pass.
  - Counter-proof: with `b366a072`'s `src/`, exactly the two tests of the red fail.
