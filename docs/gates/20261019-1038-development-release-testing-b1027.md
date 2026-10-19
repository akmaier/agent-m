---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c34b807ada11e7b7592120da00334861daa19db3
  - https://github.com/akmaier/agent-m/pull/1014
date: 2026-10-19 10:38 UTC
---
# Development → Release testing: ITM-1027, passed — a repository resource's licence file, last commit and committers of the last year

**REGISTER**

## Reason

ITM-1027 (MOD-reuse-facts), pull request #1014 into `sprint/team1/93`, passes on `c34b807a`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `2d59eafb` holds only tests: `tests/reuse-facts-repository.test.mjs`.
  - `c34b807a` holds the code: `src/reuse-facts/index.mjs`.
- **The red,** run 39238419321, job 118013057733: `# fail 1`, `# todo 0`, `# cancelled 0`. The test file fails as a whole.
  SPEC.md:1426-1427 asks that the run on the first commit is red, as read at ITM-960's and ITM-973's gates.
- **The code meets MOD-reuse-facts.md:112-119.**
  - It reads the licence file at the head and the date of the last commit.
  - It counts the distinct authors of the last year's commits, through `readHistory` with `changes: false` until a commit
    older than a year.
  - It gives each fact with its address and date, the verdict by `licenceVerdict`, and `none` without a licence file.
- **The readings stand:**
  - The candidate is the repository's path, and the ecosystem is `repository`.
  - An author is told apart by account, else by name.
  - The licence passed to `licenceVerdict` is the one the file's title names (MIT, Apache-2.0, BSD-2/3-Clause, ISC), and
    `not checked` otherwise. The text asks for "the licence against `productLicence`", and a licence the file does not
    name is not guessed.
  - The optional `now` is as `registryFacts` has it.
  - The history's limit doubles from 100.
- **CI:** run 39238630495 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`446edd34`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 5 of 5.
  - Counter-proof: with ten years counted as one, 2 fail, among them "only the authors of the last year are counted".
