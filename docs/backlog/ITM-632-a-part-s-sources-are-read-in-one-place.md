---
id: ITM-632
title: A part's sources are read in one place
level: module
realises:
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-job-runner
  - MOD-run-planner
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - ITM-610's gate (docs/gates/20261017-0155-development-release-testing-6b7e.md)
---
# ITM-632 A part's sources are read in one place

**REGISTER**

## Outcome

Three places compute which of `context.places.contents`' sources a file carries:
- MOD-job-runner's tools (`src/job-runner/tools.mjs:69`);
- MOD-run-planner's `implementation-inputs` (`src/run-planner/inputs.mjs:63`);
- MOD-work-plans' `architecture-and-model` (`src/work-plans/strategies.mjs:47`).

The rule is the same in each: the sources of every entry that names the path or a folder above it. MOD-job-runner's
`sourcesOf(context, path)` gives it once, and all three call it (nothing twice).

It waits for akmaier's acceptance of the draft committed with ITM-610's gate. That draft gives MOD-job-runner
`sourcesOf`, and the Uses of MOD-run-planner and MOD-work-plans name it.

**Existing tests.** The three callers' tests keep their expected parts and sources. Before the start, they are grepped for
the sources of a part, and listed.

## Acceptance

- `sourcesOf` gives each case once: a path that a content place names, a folder above it, and neither.
- The three callers call it and copy no rule of their own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
