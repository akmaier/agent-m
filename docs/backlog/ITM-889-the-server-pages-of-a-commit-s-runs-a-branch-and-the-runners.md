---
id: ITM-889
title: The server's pages of a commit's runs, a branch and the runners
level: module
realises:
  - UC-028
  - UC-027
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - po-opus-b's settling of ITM-855's and ITM-850's questions at sprint team2/89's start, 2026-10-18
---
# ITM-889 The server's pages of a commit's runs, a branch and the runners

**REGISTER**

## Outcome

MOD-repository-hosts' `WebLinks` gains `commitRuns(commit)`, `branch(name)` and `runners`, as the draft committed as
`c2f0a91e` states them: the page of the runs or pipelines of one commit; the page of a branch's files; the page on which a
self-hosted runner is registered to the repository, which shows the command to run on its machine. On GitHub
`<web>/commit/<sha>/checks`, `<web>/tree/<name>` and `<web>/settings/actions/runners/new`; on GitLab
`<web>/-/commit/<sha>/pipelines`, `<web>/-/tree/<name>` and `<web>/-/settings/ci_cd`, as `secrets` is built
(`src/repository-hosts/web-links.mjs`). No request is made. ITM-855 and ITM-850 use them.

It waits for akmaier's acceptance of that draft of MOD-repository-hosts' file.

## Acceptance

- For a GitHub and a GitLab repository, each of the three entries gives its address, with a branch name and a commit
  that need percent-encoding. Expected values literal.
- The existing tests of `webLinks` stay green with no expected result changed, except those that compare the whole set
  of entries, which gain the three.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
