---
id: MOD-repository-hosts
title: One interface to every repository — GitHub, GitLab, a local clone
folder: src/repository-hosts/
realises:
follows:
  - ARC-047
uses:
provides:
  - RepositoryAddress
  - Credentials
  - Host
  - Snapshot
  - HistoryEntry
  - FileWrite
  - PullRequest
  - PullRequestFacts
  - CiRun
  - Issue
  - RepositoryInfo
  - Release
  - PipelineSchedule
  - WebLinks
  - HostError
  - parseAddress
  - connect
  - readSnapshot
  - readHistory
  - listTags
  - repositoryInfo
  - createBranch
  - commitFiles
  - openPullRequest
  - listPullRequests
  - pullRequestFacts
  - mergePullRequest
  - listCiRuns
  - startWorkflow
  - cancelCiRun
  - ciRunLog
  - listIssues
  - createIssue
  - commentOnIssue
  - setIssueLabels
  - setIssueState
  - createTag
  - listReleaseAssets
  - publishRelease
  - setPipelineSchedule
  - issueCounts
  - webLinks
---
# MOD-repository-hosts One interface to every repository — GitHub, GitLab, a local clone

## Responsibility

It belongs to Access (ARC-047). It gives every subsystem and every program one interface to a repository — reading it at
a commit, its history, its tags; writing commits on an expected head; branches, pull or merge requests, CI runs, issues
and tags; and the addresses of the server's own pages — behind which three adapters are plug-ins: GitHub's REST API,
GitLab's REST API, and a local clone through the `git` command. In a browser the REST adapters run with the person's
token; in Node the local adapter runs in a CI checkout, with the person's token from a CI secret, or on a Bridge's
computer, with its own git login. Every function that reaches a server or a clone says so and names how it fails
(`A REMOTE INTERFACE NAMES HOW IT FAILS`). It refuses to write a configured secret (`NO SECRET IN THE REPOSITORY`).

## Parts

- `index.mjs` — the interface: `parseAddress`, `connect`, and the host it returns; it loads the local adapter only in
  Node.
- `github.mjs` — the adapter for GitHub's REST API.
- `gitlab.mjs` — the adapter for GitLab's REST API.
- `local-git.mjs` — the adapter for a local clone, through the `git` command; Node only.
- `failures.mjs` — the failures, told apart from the server's answers.
- `web-links.mjs` — the addresses of the server's own pages.

## Data

It keeps, for as long as a host it returned is used, the texts of the blobs it has read, by their blob SHA, so that a
page reads each blob once. It keeps nothing beyond that, and nothing in any store.

The **token page** it links for GitHub is the page for a new fine-grained token, prefilled with name, description and
expiry, with the repository's owner as the token's owner — GitHub limits a token to the repositories of one owner —, and
with exactly the permissions of `ONE GITHUB TOKEN SERVES EVERY FEATURE` — *Contents*, *Issues* and *Pull
requests* read and write, *Actions* and *Workflows* read and write, *Metadata* read (`THE TOKEN LINK IS PREFILLED`); the
repositories to select are named beside the link, not in it (`THE REPOSITORY CHOICE IS SPELLED OUT`). For a product on a
GitLab server it links the project's *Access tokens* page, where the person creates a project access token with role
*Maintainer* and scope `api` (`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`).

A **new-file page** prepared for the fallback without a token carries at most a file's path and an approval record —
never a reviewed text (`NO TEXT TRAVELS IN A URL`), and never a credential (`A CREDENTIAL IS NEVER PLACED IN A URL`).

## Interfaces

- `RepositoryAddress` — `{ server: "github" | "gitlab", origin: string, path: string, web: string }`: the server, its
  origin such as `https://gitlab.rrze.fau.de`, the repository's path such as `alice/thesis-tool` or a GitLab group path,
  and the address a person opens (`A PRODUCT IS NAMED BY ITS ADDRESS`).
- `Credentials` — `{ token?: string, tokenName?: string, clone?: string, secrets?: string[] }`: the token and the name under
  which the person stored it; in Node, the folder of a local clone to work in; the values of every configured secret, which
  no commit may contain.
- `Host` — the object `connect` returns; the functions below, from `readSnapshot` on, are its functions.
- `Snapshot` — `{ repository: RepositoryAddress, ref: string, commit: string | null, paths: string[], read(path: string) ->
  Promise<string | null>, blob(path: string) -> string | null }`: one repository at one commit; `read` fetches a file's
  text once and returns `null` for a path the commit does not hold; `blob` gives its blob SHA from the tree, without a
  request. On GitHub, a repository without any commit yet — an empty one — is a snapshot whose `commit` is `null` and
  which holds no path.
- `HistoryEntry` — `{ commit: string, parents: string[], author: { account: string | null, name: string }, date: string,
  message: string, changes: { path: string, change: "added" | "modified" | "deleted" | "renamed", from?: string }[] }`.
- `FileWrite` — `{ path: string, text?: string, bytes?: Uint8Array, delete?: true }`: one file of a commit.
- `PullRequest` — `{ number: number, title: string, branch: string, base: string, head: string, state: "open" | "merged" |
  "closed", draft: boolean, url: string, opened: string, merged: string | null, closed: string | null }`: a pull request on
  GitHub, a merge request on GitLab, with the dates it was opened, merged and closed — what a burn-down, a flow or a
  timeline is computed from.
- `PullRequestFacts` — `{ pullRequest: PullRequest, commits: { sha: string, message: string, files: string[], ci: "success"
  | "failure" | "running" | "none" }[], files: { path: string, change: string }[], reviews: { reviewer: string, verdict:
  "approved" | "changes requested" | "commented" | "dismissed", commit: string, date: string }[], checks: { name: string,
  state: "queued" | "running" | "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed out", url: string }[],
  read(path: string, side: "base" | "head") -> Promise<string | null> }`: what a Definition-of-Done check needs to see —
  the commits in their order; the reviews, each with the reviewer's account, the verdict and the commit it was given on
  (on GitLab, the approvals of the merge request); and the result of each named check on the head commit — GitHub's check
  runs and commit statuses, GitLab's pipeline jobs, each by its name.
- `CiRun` — `{ id: string, workflow: string, commit: string, event: string, state: "queued" | "running" | "waiting" |
  "success" | "failure" | "cancelled" | "skipped", url: string, started: string | null, ended: string | null }`.
- `Issue` — `{ number: number, title: string, body: string, labels: string[], state: "open" | "closed", url: string,
  comments: { author: string, body: string, date: string }[] }`.
- `RepositoryInfo` — `{ defaultBranch: string, visibility: "public" | "private" | "internal", canWrite: boolean,
  archived: boolean, description: string }`: `description` is the repository's one-line description on its server, empty
  where it has none.
- `Release` — `{ tag: string, name: string, published: string, notes: string, assets: { name: string, size: number | null,
  url: string, sha256: string | null }[] }`: a release with its files — each with its size, the address a person downloads
  it from, and the SHA-256 the server reports for it, or `null` where the server reports none.
- `PipelineSchedule` — `{ description: string, cron: string, timezone: string, ref: string, active: boolean, variables?:
  Record<string, string> }`: a GitLab project's pipeline schedule, named by its description.
- `WebLinks` — `{ newToken(name: string, description: string, days: number) -> string, tokens: string,
  projectTokens: string | null, secrets: string, newFile(path: string, record: string) -> string | null, editFile(path:
  string) -> string, actions: string, run(id: string) -> string, pipelineSchedules: string | null, pagesSettings: string,
  fork: string | null, newRepository: string }`: the server's own pages; a page the server does not offer is `null`.
- `HostError` — the failures every function below names, each an error with its fields:
  `TokenRefused { tokenName, renewal }` — the server refused the token, which is named with the page where it is renewed
  with the same permissions and repositories (`AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED`);
  `PermissionMissing { permission, renewal }` — the token lacks a permission;
  `RateLimited { limit: "account" | "network" | "search", resetsAt }` — a rate limit is used up, the account's with a
  token or the network's without one, or the server's own, smaller limit on searches, with the time it resets where the
  server tells it; never reported as a refused token (`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`);
  `NotFound { what }`; `Moved { head }` — the branch is no longer at the head the commit was made on;
  `SecretRefused { path }` — the commit would write a configured secret, named by file, never by value;
  `NotSupported { what }` — the adapter cannot do this, for example a merge request without a token on GitLab, or an
  issue through a local clone; `NotMergeable { reason }` — the server refuses a merge, for example while a required check
  is not green; `TagExists { commit }` — the tag stands already, on that commit; `ReleaseExists { tag }` — the tag has a
  release already; `UploadFailed { file }` — a release's file could not be uploaded; `Unreachable { reason }` — the server
  or the clone could not be reached, with the reason the browser or `git` gives.
- `parseAddress(url: string) -> RepositoryAddress` — reads the address a person pastes, as it appears in the browser, on
  `github.com` or a GitLab server. Throws `TypeError` naming what is not a repository's address. No request is made.
- `connect(address: RepositoryAddress, credentials: Credentials) -> Host` — a host for one repository. The token goes
  only into the authorisation header of requests to the server that issued it (`A TOKEN GOES ONLY TO THE SERVER THAT
  ISSUED IT`). With `clone`, files are read and committed in that clone and pushed with the clone's own credentials, and
  every other function uses the REST adapter where a token is given, or throws `NotSupported`. No request is made yet.
- `readSnapshot(ref: string) -> Promise<Snapshot>` — the repository at a branch, tag or commit: the commit and its whole
  tree in a fixed number of requests, however many folders it has — two on GitHub, the commit and then its tree —, then
  one per file read. Crosses the network; fails with `NotFound`, `TokenRefused`,
  `PermissionMissing`, `RateLimited`, `Unreachable`.
- `readHistory(path: string | null, options: { ref?: string, limit?: number }) -> Promise<HistoryEntry[]>` — the commits
  that changed a path, or the repository, newest first. Crosses the network; fails as `readSnapshot`.
- `listTags(pattern?: string) -> Promise<{ name: string, commit: string }[]>` — the tags, optionally only those matching
  a pattern such as `v*`. Crosses the network; fails as `readSnapshot`.
- `repositoryInfo() -> Promise<RepositoryInfo>` — the default branch, the visibility the server reports, whether the
  stored token may write. Crosses the network; fails as `readSnapshot`.
- `createBranch(name: string, from: string) -> Promise<void>` — a branch at a commit. Crosses the network; fails with
  `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`, or `NotSupported` without a token.
- `commitFiles(change: { branch: string, expectedHead: string | null, files: FileWrite[], message: string }) -> Promise<{ commit:
  string, url: string }>` — one commit of all the files together, made only if the branch still stands at `expectedHead`;
  `expectedHead` `null` makes the repository's first commit, only while it has none. GitHub's Git database answers 409 until
  a repository holds a commit, so there the first file is written through its contents API and the others in one commit on
  it, on the same condition — two commits, of which the second is returned; a GitLab project without a commit is refused
  with the advice to push a first commit to it;
  through a clone, a commit pushed only if the push fast-forwards. GitLab's API makes no commit on such a condition: there
  the head is read again just before the write and the commit refused with `Moved` if it moved; a commit that lands
  between that read and the write is not refused. The message is written as given; it carries what its
  caller puts there, such as the provenance of a generated artifact. Before anything is sent, a file whose text holds a
  configured secret refuses the whole commit with `SecretRefused`. Crosses the network; fails with `Moved`,
  `SecretRefused`, `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`. Nothing is written on any failure.
- `openPullRequest(request: { branch: string, base: string, title: string, body: string, draft?: boolean }) ->
  Promise<PullRequest>` — crosses the network; fails with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`,
  `NotSupported`.
- `listPullRequests(filter: { state?: "open" | "merged" | "closed" | "all", branch?: string }) -> Promise<PullRequest[]>` —
  crosses the network; fails as `readSnapshot`.
- `pullRequestFacts(number: number) -> Promise<PullRequestFacts>` — the commits of a pull request in order, the files each
  changed, the CI result of each commit, and the texts of changed files on both sides. Crosses the network; fails as
  `readSnapshot`.
- `mergePullRequest(number: number, expectedHead: string) -> Promise<{ commit: string }>` — merges only if the pull
  request's head is still `expectedHead` and the server allows it; branch protection on the server stays in force.
  Crosses the network; fails with `Moved`, `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable`, and with
  `NotMergeable { reason }` when the server refuses the merge.
- `listCiRuns(filter: { commit?: string, branch?: string, workflow?: string }) -> Promise<CiRun[]>` — the GitHub Actions
  runs or GitLab pipelines. Crosses the network; fails as `readSnapshot`.
- `startWorkflow(workflow: string, ref: string, inputs: Record<string, string>) -> Promise<CiRun | null>` — starts a
  workflow or a pipeline with its inputs; the inputs must hold no credential. Returns the run where the server names it at
  once, otherwise `null`, and the caller finds it with `listCiRuns`. Crosses the network; fails with `PermissionMissing`,
  `TokenRefused`, `RateLimited`, `Unreachable`, `NotSupported`.
- `cancelCiRun(id: string) -> Promise<void>` — asks the server to cancel a run; the run's state shows when it has.
  Crosses the network; fails as `startWorkflow`.
- `ciRunLog(id: string) -> Promise<string | null>` — the run's log, or `null` when the server no longer keeps it. Crosses
  the network; fails as `readSnapshot`.
- `listIssues(filter: { state?: "open" | "closed" | "all", labels?: string[], search?: string }) -> Promise<Issue[]>` —
  crosses the network; fails as `readSnapshot`, and with `NotSupported` through a clone.
- `createIssue(issue: { title: string, body: string, labels: string[] }) -> Promise<Issue>` — crosses the network; fails
  with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`, `NotSupported`.
- `commentOnIssue(number: number, body: string) -> Promise<void>` — fails as `createIssue`.
- `setIssueLabels(number: number, labels: { add?: string[], remove?: string[] }) -> Promise<void>` — fails as
  `createIssue`.
- `setIssueState(number: number, state: "open" | "closed") -> Promise<void>` — fails as `createIssue`.
- `createTag(name: string, commit: string) -> Promise<void>` — sets a tag on a commit; an existing tag is never moved and
  fails with `TagExists { commit }` (`A VERSION IS NOT REWRITTEN`). Crosses the network; fails also with
  `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable`.
- `listReleaseAssets(tag: string | "latest") -> Promise<Release>` — a release and its files, as the Bridge's download page
  offers them (UC-044): name, size, the download address, and the SHA-256 the server reports for each file. A page cannot
  read a release file's bytes itself: the server sends its downloads without a cross-origin permission, so the SHA-256
  shown beside a file is the one this function returns, and where the server reports none the caller links the release's
  checksum file for the person to open. Crosses the network; fails with `NotFound` when the release does not exist,
  `TokenRefused`, `RateLimited`, `Unreachable`, and `NotSupported` through a clone.
- `publishRelease(tag: string, release: { name: string, notes: string, files: { name: string, bytes: Uint8Array,
  contentType: string }[] }) -> Promise<Release>` — on GitHub, creates the release of a tag that stands: first as a
  draft, then each file uploaded to it, then published, so that no release is seen with only part of its files. Returns
  the `Release` with each file's download address and the SHA-256 the server reports for it. An existing release of the
  tag is never replaced (`A VERSION IS NOT REWRITTEN`). On a GitLab server and through a clone without a token it throws
  `NotSupported`. Crosses the network; fails with `NotFound` when the tag does not exist, `ReleaseExists { tag }` when the
  tag has a release, `UploadFailed { file }` when a file could not be uploaded — the draft is then left unpublished and
  named, and nothing is published —, `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable`.
- `setPipelineSchedule(schedule: PipelineSchedule) -> Promise<{ id: string, url: string }>` — on a GitLab server, creates
  the project's pipeline schedule with this description, or updates the one that has it, so that saving again never adds
  a second schedule (UC-027). Its variables hold no credential: a secret stays a CI variable of the project, which the
  person sets on the server's page. On GitHub it throws `NotSupported`: a workflow's schedule is part of the workflow's
  file, which the test configuration generates. Crosses the network; fails with `PermissionMissing` — a project access
  token without the role *Maintainer* —, `TokenRefused`, `RateLimited`, `Unreachable`.
- `issueCounts() -> Promise<{ open: number, closed: number }>` — the numbers of open and closed issues of the repository,
  pull requests not counted, without listing the issues — on GitHub through its search, which has a limit of its own, on
  a GitLab server through the project's issue statistics. Crosses the network; fails with `RateLimited` — on GitHub with
  the limit `search` —, `NotFound`, `TokenRefused`, `Unreachable`, and `NotSupported` through a clone.
- `webLinks() -> WebLinks` — the addresses of the server's own pages for this repository, as defined under Data; no
  request is made.

## Files

It reads and writes the repositories it is connected to: through the servers' REST APIs, or, in Node, in the local clone
whose folder it is given, by the `git` command. It writes no other file.

## Uses

It uses no other module. It uses the platform's `fetch`, and in Node the `git` command.
