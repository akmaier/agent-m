---
id: MOD-git-host
title: Talks to GitHub and GitLab servers — the only code that sends a repository token
realises:
  - GITLAB PRODUCTS ARE SUPPORTED
  - A PRODUCT IS NAMED BY ITS ADDRESS
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
  - A RESULT RECORD IS NEVER REWRITTEN
  - NO SERVER
  - UC-001
  - UC-008
follows:
  - ARC-001
  - ARC-003
  - ARC-004
  - ARC-006
uses: []
provides:
  - parseProductAddress
  - fetchText
  - readSnapshot
  - readFile
  - readBlob
  - commitsTouching
  - commitFiles
  - appendRecords
  - webLinks
  - tokenRefusal
  - repositoryInfo
  - issues
  - pullRequests
  - workflows
  - tags
---
# MOD-git-host Talks to GitHub and GitLab servers — the only code that sends a repository token

## Responsibility

The adapter to git servers (ARC-004): reading pinned snapshots, files and blobs, the one write path,
issues, pull requests, workflows and tags, on github.com and on any GitLab server. Each token goes only
as the authorisation header of requests to the API of the server that issued it.

**Current state.** In `review-core.mjs` today: `ALLOWED_ORIGINS`, `TOKEN_DESTINATIONS`, `fetchText`,
`authHeaders`, `deriveTarget`, `parseProductAddress`, `isGitLab`, `readBlob`, `recordCommittedAt`,
`newFileUrl`, `editUrl`, `blobUrl`, `webFileUrl`, `commitFiles`, `gitlabAuth`, `gitlabApiBase`,
`gitlabProject`, `gitlabSnapshot`, `gitlabReadFile`, `commitFilesGitLab`, `writeFiles`, `writeRoute`,
`saveReviewedFile`, `tokenRefusal`, `gitlabWriteRefusal`, `gitlabRole`, and the reads of `addProduct`.
The snapshot read for GitHub lives in `review-app.mjs` (`loadSnapshot`) and moves here.
`appendRecords`, `issues`, `pullRequests`, `workflows` and `tags` do not exist yet.

## Interfaces

- `parseProductAddress(address) -> { address, host, repo, server?, kind? } | { error }` — a product by the web address a person copies; GitHub `owner/name`, GitLab the whole group path; https only, no credentials in it.
- `fetchText(url, init, auth) -> Promise<text>` — GET only; allowed origins only; the authorisation header derived from `auth` and the URL, never set by a caller, never in a URL, no browser credentials; a non-2xx answer throws with its status.
- `readSnapshot({ product, ref, token }) -> { commit, tree: [{ path, sha }] }` — the branch resolved to one commit and every blob of it, so that a view shows one state.
- `readFile({ product, commit, path, token }) -> text | null` — one file's exact text at a commit.
- `readBlob({ product, blob, token }) -> text` — a text by its blob SHA; refused unless it hashes to that SHA.
- `commitsTouching({ product, commit, path, token, limit }) -> [{ sha, date, author }]` — the newest commits that touch a path at a commit (for the last accepted record and a requirement's history).
- `commitFiles({ product, branch, files, message, token, click }) -> { sha, url, changedMeanwhile? }` — the one write path: refuses without a trusted click event (browser) or a job credential (CI, bridge); all files in one commit; `files` may be a function of the branch head so checks run on the commit written on; fast-forward only on GitHub, `last_commit_id` on GitLab; a file with `expectBlob` that changed is refused.
- `appendRecords({ product, branch, files, token }) -> { sha }` — adds new files to an append-only branch (`test-results`), refusing any file that already exists; never force.
- `webLinks(product, ref) -> { file(path), newFile(path, record), edit(path) }` — navigation and prefill links; a prefilled value is at most a record (`MAX_URL_VALUE` 1 000 characters), never a text.
- `tokenRefusal(error, product) -> { token, renewUrl, renew, text } | null` — a 401 turned into the name of the refused token and its renewal page.
- `repositoryInfo({ product, token }) -> { visibility, defaultBranch, role? }` — what the server reports, including a GitLab token's access level.
- `issues({ product, token }) -> { list(filter), create(issue, click), comment(n, text), label(n, add, remove), close(n), reopen(n, click) }` — issue tracker calls on either host.
- `pullRequests({ product, token }) -> { list(filter), get(n), merge(n, click) }` — pull or merge requests and their CI status.
- `workflows({ product, token }) -> { dispatch(name, inputs), runs(filter), cancel(id), log(id) }` — GitHub Actions workflow dispatch or a GitLab pipeline trigger, and their live state.
- `tags({ product, token }) -> { list(), create(name, commit, click) }` — release tags; creating an existing tag is refused.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
