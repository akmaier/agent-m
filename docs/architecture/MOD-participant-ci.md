---
id: MOD-participant-ci
title: Runs jobs as CI agents through the product's own workflows, writing with the person's token from a CI secret
realises:
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - A RUNTIME IS INTERCHANGEABLE
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - UC-010
  - UC-019
follows:
  - ARC-009
  - ARC-010
  - ARC-015
uses:
  - MOD-git-host.workflows
  - MOD-git-host.repositoryInfo
  - MOD-git-host.requiredPermissions
provides:
  - driver
  - checkRunner
  - secretSetup
---
# MOD-participant-ci Runs jobs as CI agents through the product's own workflows, writing with the person's token from a CI secret

## Responsibility

The CI-agent driver of ARC-009 (UC-010): start, observe and cancel jobs that run in GitHub Actions or
GitLab CI. The agent authenticates with its key from one CI secret; every push, pull request and merge
of the job is made with the person's Agent M token from a second CI secret, never with the workflow's
built-in token — GitHub starts no run for what `GITHUB_TOKEN` does and holds its pull requests in
"approval-required", and GitLab's job token opens no merge request and its pushes start no pipeline
(ARC-010). Inside the workflow, the same core runs with Node. A drafting job's result is committed only
as an open use case or an entry of a SPEC change queue (`A CI AGENT'S DRAFT ENTERS AS OPEN`, UC-019 6b);
`SPEC.md` is never among its files.

**Current state.** No code or job workflow exists.

## Interfaces

- `driver(participant, product) -> { describe(), start(job), state(handle), log(handle), cancel(handle) }` — dispatches Agent M's job workflow with the job identifier; both secrets are named, never read; `describe()` states that calls to the agent's provider are billed per use.
- `checkRunner(product, label) -> { ok } | { refused: reason }` — a self-hosted runner only for a repository the server reports as private.
- `secretSetup(product) -> [{ name, holds, url, explanation }]` — the two secrets a product needs and the server's page for each: on GitHub the agent's key and the person's Agent M token (the same fine-grained token as in the browser, with the permissions of `MOD-git-host.requiredPermissions`), as Actions secrets; on GitLab the agent's key and the product's project access token, as protected, masked CI/CD variables; the explanation says that a secret cannot be read back, so the token is stored twice — in the browser and here; no value is ever asked for.

Uses, as declared above: `MOD-git-host.workflows`, `MOD-git-host.repositoryInfo`, `MOD-git-host.requiredPermissions`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
