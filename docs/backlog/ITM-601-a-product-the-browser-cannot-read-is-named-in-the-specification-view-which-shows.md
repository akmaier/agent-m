---
id: ITM-601
title: A product the browser cannot read is named in the specification view, which shows nothing
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-601 A product the browser cannot read is named in the specification view, which shows nothing

**REGISTER**

## Outcome

UC-020 2a: "the browser says so and shows nothing". `flow.mjs:126-136` handles no failed read.

**It waits for a draft for akmaier**, read at sprint team1/62's start under sprint 60's agreement.
- The problem a failed read shows is a rule of MOD-review-pages' part `common.mjs` (`problem`,
  `src/review-pages/common.mjs:47`): for `NotFound` without a token, that the repository is private or missing and no
  token reaches it, with the link to store one; otherwise the host's message.
- MOD-trace-pages may not call MOD-review-pages, so writing it again would keep that rule twice.
- The draft, committed with that start, gives the rule to MOD-site-frame as `readProblem(failure, tokenStored)`, which
  MOD-review-pages and MOD-trace-pages both use. MOD-review-pages' `common.mjs` drops it.

**Once it is accepted**, this item's modules are MOD-site-frame, MOD-review-pages and MOD-trace-pages:
- the review pages call `readProblem` in place of `problem`;
- the specification view shows it on a failed read and draws no tree;
- the empty state of an absent SPEC (TST-473167) stays as it is.

**Two more failed reads, which ITM-594 left plain** (found at ITM-594's gate on #686, so this item holds them):
- **A chosen version that cannot be read** is named in `flow.mjs`'s `draw` with the host's message, as plain text
  ("<ref> could not be read: …"). It becomes `readProblem`'s.
- **A failed `listTags`** is read by `tagsOf` as no tags, and the view then says "No release is tagged yet". That
  sentence is wrong when the tags could not be read. The failure is named with `readProblem`, and only the handed ref
  is offered.

## Acceptance

- A refused or missing read is named by the host's error, and no tree is shown.
- A chosen version that cannot be read, and a failed reading of the tags, are named through `readProblem`. A failed
  reading of the tags never says that no release is tagged.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**One more plain failed read** (found at ITM-597's gate on #690): the lines that name a failed read of the traces or the
proposals in an opened requirement (`problemLine` in `src/trace-pages/flow.mjs`) become `readProblem`'s.
