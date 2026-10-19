---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3d968c6f4701312cf210e0cb08c1dd2093b01b52
  - https://github.com/akmaier/agent-m/pull/1029
date: 2026-10-19 11:24 UTC
---
# Development → Release testing: ITM-1048, passed — a release is published whole, as a draft first

**REGISTER**

## Reason

ITM-1048 (MOD-repository-hosts), pull request #1029 into `sprint/team1/93`, passes on `3d968c6f`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-d`.**
  - `d9b9d439` holds only tests: `tests/repository-hosts-publish-release.test.mjs`.
  - `dec42908` holds the code, in `src/repository-hosts/`, and one corrected comment line in that test.
  - `3d968c6f` adds `uploads.github.com` to `tests/test_no_backend.py`.
- **The red,** run 39243646812, job 118030188812: `# fail 7`, `# todo 0`, `# cancelled 0`, exactly TST-1048001 to 007.
- **The code meets MOD-repository-hosts.md:255-259.**
  - The release is created as a draft, each file is uploaded to it, and then it is published.
  - It fails with `ReleaseExists` and `NotFound`. On `UploadFailed { file }`, the draft is left unpublished.
- **The third commit is within the rule.**
  - SPEC.md:28-31's check admits calls to "the repository servers of the instance and its products".
  - `uploads.github.com` is GitHub's host for a release's files, so it is part of that server.
  - The check's file names MOD-repository-hosts, the item's module.
- **The readings stand:**
  - the returned release is the publishing call's answer;
  - token, permission and limit errors keep their own names;
  - a draft the tag already has is no existing release.
- **CI:** 20 of 20 checks passed on the head (run 39244110373).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`e00d991b`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 7 of 7, and `test_no_backend` passes.
  - Counter-proof: with the publishing call leaving the release a draft, 2 fail.
