---
id: MOD-git-host
title: Talks to GitHub and GitLab servers — the only code that sends a repository token, and the one write path, taking the authority it writes on
realises:
  - GITLAB PRODUCTS ARE SUPPORTED
  - A PRODUCT IS NAMED BY ITS ADDRESS
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
  - A RESULT RECORD IS NEVER REWRITTEN
  - A VERSION IS NOT REWRITTEN
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - UC-001
follows:
  - ARC-001
  - ARC-003
  - ARC-004
  - ARC-006
uses: []
provides:
  - parseProductAddress
  - readSnapshot
  - readFile
  - readBlob
  - commitsTouching
  - commitFiles
  - appendRecords
  - webLinks
  - tokenRefusal
  - usedUpLimit
  - repositoryInfo
  - issues
  - pullRequests
  - workflows
  - tags
  - requiredPermissions
  - REPO_RE
  - isGitLab
  - newFileUrl
  - editUrl
  - webFileUrl
  - tokenListUrl
  - gitlabTokenPageUrl
  - commitFilesGitLab
  - writeFiles
  - writeRoute
  - tokenIdentity
---
# MOD-git-host Talks to GitHub and GitLab servers

## Responsibility

Adapter. The adapter to git servers (ARC-004): reading pinned snapshots, files and blobs, the one write
path, issues, pull requests, workflows and tags, on github.com and on any GitLab server. Each token goes
only as the authorisation header of requests to the API of the server that issued it; the request helper
that enforces this is internal and no caller sets a header. Every write takes an `authority` — a person's
click, a CI secret or an agent's own login (ARC-003) — and refuses without one; which authority exists in
a runtime is decided by that runtime's composition root, not here. Tokens are passed in by the caller;
this module reads no store.

## Interfaces

- `parseProductAddress(address) -> { address, host, repo, server?, kind? } | { error }` — a product by the web address a person copies; GitHub `owner/name`, GitLab the whole group path; https only, no credentials in it.
- `readSnapshot({ product, ref, token }) -> { commit, tree: [{ path, sha }] }` — the branch resolved to one commit and every blob of it, so that a view shows one state.
- `readFile({ product, commit, path, token }) -> text | null` — one file's exact text at a commit.
- `readBlob({ product, blob, token }) -> text` — a text by its blob SHA; refused unless it hashes to that SHA.
- `commitsTouching({ product, commit, path, token, limit }) -> [{ sha, date, author }]` — the newest commits that touch a path at a commit (for the last accepted record and a requirement's history).
- `commitFiles({ product, branch, files, message, token, authority }) -> { sha, url, changedMeanwhile? }` — the one write path: refuses without an `authority` of kind `click`, `ci-secret` or `agent-login`; all files in one commit; `files` may be a function of the branch head so checks run on the commit written on; fast-forward only on GitHub, `last_commit_id` on GitLab; a file with `expectBlob` that changed is refused.
- `appendRecords({ product, branch, files, token, authority }) -> { sha }` — adds new files to an append-only branch (`test-results`), refusing any file that already exists; never force.
- `webLinks(product, ref) -> { file(path), newFile(path, record), edit(path) }` — navigation and prefill links; a prefilled value is at most a record (`MAX_URL_VALUE` 1 000 characters), never a text.
- `tokenRefusal(error, product) -> { token, renewUrl, renew, text } | null` — a 401 turned into the name of the refused token and its renewal page.
- `usedUpLimit(error, product) -> { limit: "account" | "network", resetsAt: Date | null } | null` — a `403` or `429` that the server's rate-limit headers mark as a used-up limit (GitHub: `X-RateLimit-Remaining: 0`, `X-RateLimit-Limit` 5000 with a token or 60 without, `X-RateLimit-Reset`); gitlab.com exposes no such header to pages, so its limit comes back without a time. Such an error is never passed to `tokenRefusal` (`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`).
- `repositoryInfo({ product, token }) -> { visibility, defaultBranch, role? }` — what the server reports, including a GitLab token's access level.
- `issues({ product, token }) -> { list(filter), create(issue, authority), comment(n, text, authority), label(n, add, remove, authority), close(n, authority), reopen(n, authority) }` — issue tracker calls on either host.
- `pullRequests({ product, token }) -> { list(filter), get(n), merge(n, authority) }` — pull or merge requests and their CI status.
- `workflows({ product, token }) -> { dispatch(name, inputs, authority), runs(filter), cancel(id, authority), log(id) }` — GitHub Actions workflow dispatch or a GitLab pipeline trigger, and their live state.
- `tags({ product, token }) -> { list(), create(name, commit, authority) }` — release tags; creating an existing tag is refused (`A VERSION IS NOT REWRITTEN`).
- `requiredPermissions(host) -> { github: [{ permission, param, access, why }] } | { gitlab: { role, scope, why } }` — `host` a server name or a product; `param` is the permission's parameter name on GitHub's prefilled token page; the one list the prefilled token link, the settings page, the CI secret setup and their tests read: on GitHub *Contents*, *Issues* and *Pull requests* read and write, *Actions* and *Workflows* read and write, *Metadata* read (`ONE GITHUB TOKEN SERVES EVERY FEATURE`); on GitLab a project access token with role *Maintainer* and scope `api` (`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`).
- `REPO_RE -> RegExp` — a GitHub repository `owner/name`.
- `isGitLab(product) -> boolean` — the product is a project on a GitLab server (`kind: "gitlab"`).
- `newFileUrl(repo, ref, path, value) -> url` — GitHub's new-file page, prefilled with the file name and a value; a value longer than `MAX_URL_VALUE` is refused.
- `editUrl(repo, ref, path) -> url` — GitHub's edit page of a file.
- `webFileUrl(product, ref, path) -> url` — a file on the web page of its product's server, GitHub or GitLab.
- `tokenListUrl() -> url` — the list of the person's fine-grained GitHub tokens, where one is created and renewed.
- `gitlabTokenPageUrl(product) -> url` — a GitLab project's *Access tokens* page.
- `commitFilesGitLab({ product, branch, files, message, token, authority }) -> { sha, url, base, parent, changedMeanwhile }` — the write path to a GitLab project, one commit through its commits API: refused without an `authority` or a token; an existing file is written with `last_commit_id`, a new one with `create`; a file with `expectBlob` that changed is refused, and nothing is written when the branch moved while the commit was prepared; the files changed between the head read and the commit's parent are returned.
- `writeFiles(args) -> commit` — the write path for a product of either host: `commitFilesGitLab` for a GitLab product, refusing a GitHub token there, `commitFiles` otherwise.
- `writeRoute(product, token) -> "commit" | "github-web" | "token-step"` — how Accept and Save work for a product: a commit with a token; without one, GitHub's web interface, or on GitLab the step that stores the project token.
- `tokenIdentity(product) -> { token, renewUrl, renew, server }` — the token a product is written with, by name, where it is renewed and the text that says how.

## Testing

Component tests with a fake `fetch` that records every request (`tests/review-core.test.mjs`,
`tests/test_no_credential_in_url.py`, `tests/test_token_scope_documented.py`): a GitHub token is never sent
to a GitLab server and a GitLab token never to another project's API; no URL carries a credential or a
text longer than a record; a write without an authority is refused, with one as counter-proof; a save
whose file changed meanwhile is refused; an existing tag and an existing result record are not rewritten;
a 401 names the refused token. The seams are `fetch` and the server's answers, recorded per host. A system
test against a test repository on each host runs before a release (ARC-016). No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): every write takes an authority, the request helper is internal, the current state removed, rules decided by the shells left to them; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 069522c1cd5696307322bea74bad3953924a38e0 — PO follow-up: the CI runtime's entry as a shell of its own (MOD-ci-entry), and the three rules of queues 2026-10-01 and 2026-10-01b cited; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*
