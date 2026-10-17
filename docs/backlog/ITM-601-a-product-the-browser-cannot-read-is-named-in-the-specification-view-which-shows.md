---
id: ITM-601
title: A product the browser cannot read is named in the specification view, which shows nothing
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
  - MOD-site-frame
  - MOD-review-pages
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

**Settled at sprint team1/67's start. Selectable.**
- **The modules whose files it changes** (sprint 65's agreement):
  - MOD-site-frame: `index.mjs`, where `readProblem` stands beside `explain`, since its Parts name `index.mjs` "the
    interface" and no other part for it;
  - MOD-review-pages: `common.mjs` loses `problem`, and its five importers call `readProblem`: `edit.mjs:17`,
    `entry-edit.mjs:17`, `conversation-draft.mjs:18`, `flow.mjs:16` and `jobs.mjs:27`;
  - MOD-trace-pages: `flow.mjs`, its three failure lines and `tagsOf`.
  - No topic is added, so `explanations.md` is not changed.
- **The grep, full output read.**
  - `grep -rn "problem(\|function problem" src/review-pages` finds the definition at `common.mjs:47` and its calls at
    `edit.mjs:58`, `conversation-draft.mjs:98`, `common.mjs:76`, `entry-edit.mjs:36`, `flow.mjs:110`, and `jobs.mjs:107`,
    `172`, `291` and `505`.
  - Its text "is private or does not exist" is found in `src/review-pages/common.mjs` alone, and in no test.
  - In MOD-trace-pages, `problemLine` (`flow.mjs:87`, used at :108 and :123), the chosen ref's line (:304) and
    `tagsOf` (:232, used at :283).
  - Tests that read those lines: `tests/trace-pages-specification.test.mjs` at :247 and :295 ("No release is tagged
    yet"), :370 and :682 (`traces-problem`).
  - The class `problem` is also read in `tests/prompt-bar.test.mjs:445`, `tests/release-uc-006-batched-reads.test.mjs:73,
    99` and `tests/review-pages-derivation-split-candidate.test.mjs`. The last one's `problem` is the split panel's own
    paragraph, not a failed read, and stays.
- **The rule is MOD-site-frame's** (`readProblem`, accepted). For `NotFound` with no token stored, the private-or-missing
  sentence and the link to store one. Otherwise the host's own message, and the link where no token is stored. Nothing of
  it is written again in MOD-review-pages or MOD-trace-pages.
- **The two failed reads ITM-594 left plain:**
  - a chosen version that cannot be read is named by `readProblem`;
  - a failed `listTags` is named by `readProblem`, never as "No release is tagged yet". Only the handed ref is offered.
- **Reads, against the token budget** (sprint 66's agreement): it adds no request. Every failure it names is one the
  code already catches.
- **The expected results that change** (sprint 64): the developer runs the three modules' tests and their callers',
  release tests included, on a draft, and lists every changed one before the tests-only commit.
- **DOM assertions** (sprint 65): compare a boolean or a string, never a node.
- **Reachable:** the live `#spec` for MOD-trace-pages. The review pages' failed reads are reached through their routes,
  as today.

## Acceptance

- A refused or missing read is named by the host's error, and no tree is shown.
- A chosen version that cannot be read, and a failed reading of the tags, are named through `readProblem`. A failed
  reading of the tags never says that no release is tagged.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**One more plain failed read** (found at ITM-597's gate on #690): the lines that name a failed read of the traces or the
proposals in an opened requirement (`problemLine` in `src/trace-pages/flow.mjs`) become `readProblem`'s.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-site-frame's `readProblem`, MOD-review-pages' `common.mjs` without it, and MOD-trace-pages' use of it (accepted blobs 33dee99a46a0, fb1576acca0f, 5c9248d32c4f). It is free of drafts; its readings are read at its start.
