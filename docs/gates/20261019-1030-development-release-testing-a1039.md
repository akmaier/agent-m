---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 722e9af71cf9a901e709bd4480b0dbeadccbf9ef
  - https://github.com/akmaier/agent-m/pull/1011
date: 2026-10-19 10:30 UTC
---
# Development → Release testing: ITM-1039, passed — a model or data pinned to a branch name is named, as a repository is

**REGISTER**

## Reason

ITM-1039 (MOD-resource-list), pull request #1011 into `sprint/team1/93`, passes on `722e9af7`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-e`.**
  - `f0cea3b2` holds only tests: `tests/resource-list-schema.test.mjs`.
  - `722e9af7` holds the code: `src/resource-list/rules.mjs`.
- **The red,** run 39237359581, job 118009559269: `# fail 1`, `# todo 0`, `# cancelled 0`, exactly TST-1039001.
- **The fixtures changed in the commit of tests stand.** Two existing model pins, `main-2026` and `rev-1`, break the rule
  this item adds. So they become 40-hex revisions there, as this item's output.
- **The reading of an exact pin stands, and needs no draft.**
  - MOD-resource-list.md:60 gives a data or model pin as "a revision or the SHA-256 of every file". `Pin` (:86) holds
    `files` as a map from file to SHA-256.
  - The text gives no form for that map in a table cell. So `<file>=<64 hex>` entries separated by commas are a form the
    text leaves to the code, as the format mark of the impact lists was at ITM-939's gate.
  - A single 64-hex value is the SHA-256 of a resource with one file.
- **CI:** 20 of 20 checks passed on the head (run 39237560355).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`ae93166c`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 11 of 11.
  - Counter-proof: with abbreviations of 7 to 40 digits allowed, exactly TST-1039001 fails.
