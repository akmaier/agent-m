---
id: ITM-1110
title: A pull request names the commit its merge made, so that a squash-merged fix finds its release
level: module
realises:
  - UC-039
modules:
  - MOD-repository-hosts
  - MOD-mail-handling
builds_on:
  - ITM-1109
tests:
  - unit
origin:
  - the gate of #1157 (ITM-1109), sprint team2/97, on main at fda492b7
---
# ITM-1110 A pull request names the commit its merge made, so that a squash-merged fix finds its release

**REGISTER**

## Outcome

ITM-1109 gives an issue's release as the earliest tag that contains what solved it. A pull request's commit is its `head`
(MOD-repository-hosts.md:124-127, `PullRequest`), the only commit that type names. A squash or rebase merge puts other commits
on the default branch, so no tag contains the head, and the release reads `null` where it is known.

## Not ready: a draft for akmaier

The draft is `2688f582`, on `main` and reviewed. The item is built once an approval record names its blob.

The draft gives `PullRequest` the commit its merge made (GitHub's `merge_commit_sha`, GitLab's `merge_commit_sha` or
`squash_commit_sha`), `null` while unmerged. `repliesDue` then takes that commit.

## Acceptance

- Once the draft is accepted: an issue closed by a squash-merged pull request whose merge commit a tag contains gives that tag.
- On GitLab, a fast-forward merge is confirmed on a fixture: `merge_commit_sha` stays null there and `head` lands on the
  base, as the draft reads it. GitLab's API documentation does not say so.
- On GitHub, `mergeCommit` is `null` for a pull request that is not merged, though GitHub then names a test merge commit.
