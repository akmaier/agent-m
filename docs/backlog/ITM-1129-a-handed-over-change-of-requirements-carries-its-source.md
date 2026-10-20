---
id: ITM-1129
title: A change of requirements handed over from the prompt bar carries its source
level: module
realises:
  - UC-049
modules:
  - MOD-prompt-bar
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1129 A change of requirements handed over from the prompt bar carries its source

**REGISTER**

## Outcome

TST-513027, UC-049 4a: a hand-over of `change-requirements` queued by the bar fails in the workflow with "entrySections
needs the job's source as text" (`src/spec-changes/propose.mjs:78`). The record names the requirement and no source.
First read where the source comes from: the page's subject, the kind's parameters or the hand-over
(`src/prompt-bar/hand-over.mjs`). Where MOD-prompt-bar's accepted text gives it, build it; where no accepted text does,
stop and name the gap, which is then a draft for akmaier (AGENTS.md §6a.6).

## Acceptance

- TST-513027 passes and its `todo` is removed. Counter-proof: a job without a source is still refused by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped at its first task (sprint team1/97, developer-sonnet-d): no accepted text gives a hand-over's job its source.**
- A hand-over's parameters come from `paramsOf` (`src/prompt-bar/hand-over.mjs`): requirements, use cases, items and
  steps, and no source.
- `entrySections` then throws "entrySections needs the job's source as text" (`src/spec-changes/propose.mjs:78`).
- MOD-prompt-bar's text names no parameters for a hand-over.
- **The way chosen (po-opus):** for the subject's own kind, a hand-over's job takes the subject's `paramsFor`, with its
  source. A missing own source refuses the hand-over by name, with `NoPersonSource`.
- The draft of MOD-prompt-bar.md, by developer-sonnet-d, goes to `main` for akmaier. The item waits for its
  acceptance.
