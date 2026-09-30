---
id: MOD-participant-ci
title: Runs jobs as CI agents through the product's own workflows
realises:
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - A RUNTIME IS INTERCHANGEABLE
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - UC-010
follows:
  - ARC-009
  - ARC-010
  - ARC-015
uses:
  - MOD-git-host.workflows
  - MOD-git-host.repositoryInfo
provides:
  - driver
  - checkRunner
  - secretSetup
---
# MOD-participant-ci Runs jobs as CI agents through the product's own workflows

## Responsibility

The CI-agent driver of ARC-009 (UC-010): start, observe and cancel jobs that run in GitHub Actions or
GitLab CI with the agent's key as a CI secret. Inside the workflow, the same core runs with Node.

**Current state.** No code or job workflow exists.

## Interfaces

- `driver(participant, product) -> { describe(), start(job), state(handle), log(handle), cancel(handle) }` — dispatches Agent M's job workflow with the job identifier; its secret is named, never read.
- `checkRunner(product, label) -> { ok } | { refused: reason }` — a self-hosted runner only for a repository the server reports as private.
- `secretSetup(product, secretName) -> { url, explanation }` — the server's secrets page for the product and what to enter there; the value is never asked for.

Uses, as declared above: `MOD-git-host.workflows`, `MOD-git-host.repositoryInfo`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
