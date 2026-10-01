---
id: ARC-004
title: GitHub and GitLab behind one adapter interface, with each token routed only to the server that issued it
forced_by:
  - GITLAB PRODUCTS ARE SUPPORTED
  - A PRODUCT IS NAMED BY ITS ADDRESS
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - UC-001
  - UC-008
---
# ARC-004 GitHub and GitLab behind one adapter interface

## Context

Products live on github.com or on any GitLab server whose API accepts the Pages origin
(`GITLAB PRODUCTS ARE SUPPORTED`; measured in `docs/measurements/2026-09-30_gitlab-cors.md`: three
GitLab servers allow any origin, both token headers, `POST`/`PUT`). A product is named by its web
address (`A PRODUCT IS NAMED BY ITS ADDRESS`). Each GitHub token and each GitLab project token may
leave the browser only towards the API of the server that issued it.

The current core implements both hosts already: `fetchText`/`authHeaders` route tokens,
`commitFiles` writes on GitHub through the git data API (one tree, one commit, fast-forward ref
update), `commitFilesGitLab` writes through `POST /projects/:id/repository/commits` with
`last_commit_id` checks, `gitlabSnapshot` pins one commit. The functions are spread through the
core beside parsing code.

## Decision

1. One module, `MOD-git-host`, is the only code that speaks HTTP to git servers. Its interface is
   host-neutral: read a snapshot pinned to one commit, read a file or a blob, list commits touching a
   path, commit several files in one commit, and the issue, workflow and release calls later use
   cases need. A product value from `parseProductAddress` selects the host.
2. **GitHub**: REST API at `https://api.github.com`; writes through the git data API (`POST
   /git/trees`, `POST /git/commits`, `PATCH /git/refs/heads/<b>` with `force: false`). The token
   goes as `Authorization: Bearer`, only to `https://api.github.com`.
3. **GitLab**: REST API v4 of the server in the product's address; writes with one `POST
   /projects/:id/repository/commits` holding one action per file. The project token goes as
   `PRIVATE-TOKEN`, only to URLs under `<server>/api/v4/projects/<this project>`.
4. **Token routing is a property of the adapter, not of the caller.** A caller passes an `auth`
   value — for a write, the `authority` of ARC-003 —; the adapter derives the header from the request URL
   and refuses any other origin, any caller-set authorisation header, any credential in a URL, and any
   browser credential mode.
5. **Without a token** on GitHub, the adapter returns prefilled web-interface links instead of
   writing (`WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`); on GitLab there is no such
   route (`A GITLAB PRODUCT IS WRITTEN WITH A TOKEN`).
6. **Concurrency.** Every write names the blob it expects for each file it replaces; GitHub's
   fast-forward-only ref update and GitLab's `last_commit_id` refuse a stale write. The documented
   gap on GitLab (a file only read, changed by a commit landing between the last check and GitLab's
   write) is reported after the fact, as the current code does.

## Alternatives

- **Octokit / `@gitbeaker/rest` client libraries** — not adopted: the adapter uses a handful of
  endpoints, and a client library would add a dependency whose request construction is outside the
  token-routing guard. No due diligence recorded, because nothing is reused.
- **isomorphic-git in the browser (clone and push over HTTP)** — rejected: measured 2026-09-30 with
  `curl` from `Origin: https://akmaier.github.io`, `https://github.com/akmaier/agent-m.git/info/refs?service=git-upload-pack`
  answered the preflight `OPTIONS` with `405` and the `GET` with `200`, both without any
  `Access-Control-*` header — a page cannot read it. Cloning from the browser would need a CORS
  proxy, which is a server (`NO SERVER`). GitLab servers were not measured for this endpoint.
- **GitLab through GraphQL** — rejected: the REST v4 endpoints used are the ones measured and
  documented in the current code.

## Consequences

- Adding another forge (Gitea, Bitbucket) is a third implementation of the same interface, not a
  change to callers (open-closed, book ch. 10 §3).
- The 60-requests-per-hour limit of unauthenticated GitHub reads remains; the dashboard reads a
  snapshot with two API calls plus raw files, as now.
- Private repositories are read through the API with the token; public ones through
  `raw.githubusercontent.com` without it. Both hosts pin one commit per page load, so everything
  shown belongs to one state.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
