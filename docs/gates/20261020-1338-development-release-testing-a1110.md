---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2e900d1c12ae300dab536cfb44dcc0cdb0fc1976
  - https://github.com/akmaier/agent-m/pull/1214
date: 2026-10-20 13:38 UTC
---
# Development → Release testing: ITM-1110, passed — a pull request names the commit its merge made

**REGISTER**

## Reason

ITM-1110 (MOD-repository-hosts, MOD-mail-handling), pull request #1214 into `sprint/team1/98`, passes on `2e900d1c`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `40508dc0` holds only tests.
    - It adds TST-1110001 and TST-1110002, and the cases of a merged pull request's merge commit.
    - It sets the key `mergeCommit` into the expected records of `listPullRequests`, `pullRequestFacts` and
      `openPullRequest`, and into the fake host of `tests/mail-handling-release.test.mjs`.
    - Every file it changes is of level `unit`, `mail-handling-release` included, as its header says. So
      SPEC.md:1501-1503, which covers level `release`, does not bind them.
  - `2e900d1c` changes `src/repository-hosts/github.mjs`, `gitlab.mjs` and `src/mail-handling/replies.mjs`.
    - `PullRequest` gains `mergeCommit`, as the accepted draft `2688f582` says.
    - `repliesDue` asks the tags for it.
- **The red,** run 39430312506 on `40508dc0`, with `# cancelled 0` in each failing job:
  - job 118653335103: `# fail 2`, exactly TST-1110001 and TST-1110002;
  - job 118653335172: `# fail 2`, exactly tests 168 and 170, `openPullRequest` on GitHub and GitLab;
  - job 118653335369: `# fail 6`, exactly tests 115, 117, 119, 120, 131 and 132.
- **CI:** 23 of 23 checks passed on the head (run 39431040566).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/98` (`d3d56c68`, after #1210 and #1211) is clean.
- **Replayed in a clean worktree, with `sprint/team1/98` merged in:**
  - The 273 tests of `tests/repository-hosts*` and `tests/mail-handling*` pass.
  - Counter-proof: with the base's `src/repository-hosts/` and `src/mail-handling/`, the ten tests of the red fail.
