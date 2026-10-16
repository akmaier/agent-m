---
id: ITM-548
title: The job workflow is added to a product's .gitlab-ci.yml, every other line kept
level: module
realises:
  - UC-010
  - UC-027
modules:
  - MOD-runtimes
  - MOD-settings-pages
builds_on:
  - ITM-532
tests:
  - unit
origin:
  - ITM-532's gate (docs/gates/20261016-1530-development-release-testing-9482.md), the developer's observation
  - MOD-test-schedule, Data: "every other line stays as it is. MOD-runtimes' job workflow `.gitlab/agent-m-jobs.yml` is included the same way, by that module."
---
# ITM-548 The job workflow is added to a product's .gitlab-ci.yml, every other line kept

**REGISTER**

## Outcome

On a GitLab product, the settings page installs Agent M's job workflow without replacing the product's own
`.gitlab-ci.yml`. Today `jobWorkflowFiles` returns a whole `.gitlab-ci.yml`: the `spec:` header, the inputs and the
include. Its one caller, `src/settings-pages/settings.mjs` (around line 714), commits that file whole. A product's own
pipeline is lost that way, against MOD-test-schedule's Data, which keeps every other line.

It builds on the draft of MOD-runtimes' `jobWorkflowFiles`, which is open for akmaier's acceptance (`docs/architecture/MOD-runtimes.md`,
Interfaces).
- **The new parameter.** `jobWorkflowFiles` takes `gitlabCi`, the product's `.gitlab-ci.yml` at the head that was read.
- **What it adds.** It returns that text with three things added, each only where it is missing:
  - the three inputs under `spec:`;
  - the entry under `include:`;
  - the inputs the entry passes on.

  Every other line stays as it is.
- **The caller.** The settings page passes the file it reads from the snapshot, as it already reads it to show whether
  the workflow is installed.

The draft was accepted with `220b55d0` (`docs/approvals/MOD-runtimes-7e3b846f59ed.md`).

The readings, settled at sprint team1/51's start:
- **The header.** Where the file has no `spec:` header, the header with the three inputs and its `---` are put before
  its first line. Where it has one, each of `job`, `task` and `endpoint` that is missing is added under its `inputs:`,
  with `default: ""`.
- **The include.** Where the file has `include:` as a list, the entry `- local: ".gitlab/agent-m-jobs.yml"` with its
  `inputs:` is added at the list's end, unless an entry names that file already. Where the file has no `include:`, the
  key and the entry are added at the end of the document.
- **A file it cannot add to safely.** Where `include:` holds a single string or a map, the change would rewrite a line
  of the product's own. `jobWorkflowFiles` then throws a `RuntimeError` named `GitlabCiNotList`, naming the file, and
  nothing is written. The settings page shows its message beside *Install*. "Every other line stays as it is" forbids
  the rewrite, so the refusal is the reading that keeps it.
- **An `inputs:` written inline.** This is settled at its first gate (#627, `c10480b7`). A `spec:` header's `inputs:`, or
  the existing entry's `inputs:`, written inline, such as `inputs: {}`, would also have to be rewritten to add to it.
  Adding a second `inputs:` block beside it would give the map the key twice. So it is refused with the same
  `GitlabCiNotList`, whose message names the part that is not written as a block. Nothing is written.
- **The caller.** `src/settings-pages/settings.mjs:822` passes the text of `.gitlab-ci.yml` read from the snapshot it
  already holds, `null` where there is none.
- **Existing tests.** None changes. `tests/runtimes-workflow.test.mjs` calls `jobWorkflowFiles` without `gitlabCi`, which
  gives the whole file as before. No settings test names `.gitlab-ci.yml`.

## Acceptance

- **A product without a `.gitlab-ci.yml`** gets the whole file, as ITM-532 writes it.
- **A product with its own `.gitlab-ci.yml`** keeps every line of it, and gains the header's inputs, the entry and its
  inputs where they are missing.
- **Installing again** changes nothing.
- **The settings page** commits the merged text.
- **The tests** state their expected text in their own text, and the first commit holds only them and is red.
