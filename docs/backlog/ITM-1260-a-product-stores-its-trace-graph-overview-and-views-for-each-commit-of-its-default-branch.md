---
id: ITM-1260
title: A product stores its trace graph, overview and views for each commit of its default branch
level: module
realises:
  - UC-020
  - UC-035
  - UC-046
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE
modules:
  - MOD-runtimes
  - MOD-workflow-entries
builds_on:
  - ITM-1259
tests:
  - unit
origin:
  - akmaier, 2026-10-28, on ITM-1259's sentence that a product derives the views in the page because `onMainChanged` runs only in the instance: "products should precompute too."
---
# ITM-1260 A product stores its trace graph, overview and views for each commit of its default branch

**REGISTER**

## Outcome

Today `onMainChanged` runs only from the instance's `.github/workflows/main-changed.yml`; its one caller of
`publishGraph` and `publishOverview` is `src/workflow-entries/instance.mjs`, and no file Agent M writes into a product
runs it (`src/runtimes/workflow/github.yml` and `gitlab.yml` run the job entries alone). So a product's branches
`trace-cache` and `overview-cache` never exist: its trace pages end in `GraphNotStored`, whose text names the instance's
workflow "main changed" (`src/trace-graph/build.mjs`), its card on the main page reads the scope `all`, and its
`#progress` and `#backlog` derive their views in the page.

After the change, as MOD-runtimes and MOD-workflow-entries say:

- MOD-runtimes: `jobWorkflowFiles` also returns, beside the job workflow and pinned to the same instance commit,
  `.github/workflows/agent-m-main-changed.yml` or `.gitlab/agent-m-main-changed.yml` (included from `.gitlab-ci.yml`),
  from the templates `workflow/github-main-changed.yml` and `workflow/gitlab-main-changed.yml`: one job on the server's
  runners, on a push to the default branch, on the schedule and on a start from the server's page, that makes the two
  branches once and runs `onMainChanged`; on GitHub with the workflow's own token (`contents: write`), on GitLab in the
  environment `agent-m-write` with the person's token; no key.
- MOD-workflow-entries: `onMainChanged` moves to `main-changed.mjs` and runs alike in the instance and in a product; in a
  product it reads the instance through the checkout at the pinned commit, as `instanceAt`. It stores what
  MOD-trace-graph's `publishGraph` and MOD-progress-measures' `publishOverview` store, whatever those hold when this item
  is implemented.

A product whose files are not written again stays as it is: its pages read what its branches hold, and derive the views
where they hold nothing.

## Acceptance

- Unit tests naming MOD-runtimes: for GitHub and GitLab, `jobWorkflowFiles` returns the main-changed file at the
  instance commit it is given; on GitHub it reads no secret and asks `contents: write`; on GitLab its job is of
  `agent-m-write` and reads the token by its name; neither runs `chooseAgentKey` or an agent's entry. Counter-proof: a
  file that names a key fails.
- Unit tests naming MOD-workflow-entries: in a fixture product with a fixture instance checkout, `onMainChanged` adds the
  graph to the product's `trace-cache` and the overview and views to its `overview-cache`; run again, `nothing to do`.
  Counter-proof: before the change the entry has no product route.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/runtimes/`, `src/workflow-entries/` and the tests that name these modules change.
