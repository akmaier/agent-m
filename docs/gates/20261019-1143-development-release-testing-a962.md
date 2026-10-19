---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5b65d2328c0b864a4cb562d59304cc15218cae54
  - https://github.com/akmaier/agent-m/pull/1032
date: 2026-10-19 11:43 UTC
---
# Development → Release testing: ITM-962, passed — createIssue creates a product's issue on GitHub and GitLab

**REGISTER**

## Reason

ITM-962 (MOD-repository-hosts), pull request #1032 into `sprint/team1/93`, passes on `5b65d232`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `b7bc5a43` holds only tests: `tests/repository-hosts-create-issue.test.mjs`.
  - `5b65d232` holds the code: `src/repository-hosts/` only.
- **The red,** run 39245038714, job 118034803749: `# fail 6`, `# cancelled 0`, exactly the six `createIssue` tests. The 32 todo
  are known findings.
- **The code meets MOD-repository-hosts' `createIssue`.**
  - GitHub takes the title, body and labels. GitLab takes the title, the description, and the labels joined by commas.
  - Both give an `Issue` with no comments.
  - The failures are named, and `NotSupported` comes through a clone or without a token.
- **#1034 (ITM-581) adds the same `issueOf` to the same files.** `git merge-tree` of both heads is clean, and the merged tree
  holds one `issueOf` in each file.
- **CI:** 20 of 20 checks passed on the head (run 39245249522).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`8f012c4b`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 6 of 6.
  - Counter-proof: with `b7bc5a43`'s `github.mjs`, 3 fail.
