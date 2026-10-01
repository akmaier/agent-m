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
  - repositoryInfo
  - issues
  - pullRequests
  - workflows
  - tags
  - requiredPermissions
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
- `repositoryInfo({ product, token }) -> { visibility, defaultBranch, role? }` — what the server reports, including a GitLab token's access level.
- `issues({ product, token }) -> { list(filter), create(issue, authority), comment(n, text, authority), label(n, add, remove, authority), close(n, authority), reopen(n, authority) }` — issue tracker calls on either host.
- `pullRequests({ product, token }) -> { list(filter), get(n), merge(n, authority) }` — pull or merge requests and their CI status.
- `workflows({ product, token }) -> { dispatch(name, inputs, authority), runs(filter), cancel(id, authority), log(id) }` — GitHub Actions workflow dispatch or a GitLab pipeline trigger, and their live state.
- `tags({ product, token }) -> { list(), create(name, commit, authority) }` — release tags; creating an existing tag is refused (`A VERSION IS NOT REWRITTEN`).
- `requiredPermissions(host) -> { github: [{ permission, access, why }] } | { gitlab: { role, scope, why } }` — the one list the prefilled token link, the settings page, the CI secret setup and their tests read: on GitHub *Contents*, *Issues* and *Pull requests* read and write, *Actions* and *Workflows* read and write, *Metadata* read (`ONE GITHUB TOKEN SERVES EVERY FEATURE`); on GitLab a project access token with role *Maintainer* and scope `api` (`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`).

## Testing

Component tests with a fake `fetch` that records every request (`tests/review-core.test.mjs`,
`tests/test_no_credential_in_url.py`, `tests/test_token_scope_documented.py`): a GitHub token is never sent
to a GitLab server and a GitLab token never to another project's API; no URL carries a credential or a
text longer than a record; a write without an authority is refused, with one as counter-proof; a save
whose file changed meanwhile is refused; an existing tag and an existing result record are not rewritten;
a 401 names the refused token. The seams are `fetch` and the server's answers, recorded per host. A system
test against a test repository on each host runs before a release (ARC-016). No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): every write takes an authority, the request helper is internal, the current state removed, rules decided by the shells left to them; open until accepted.*
