---
id: ITM-574
title: An accept click sends a bounded number of requests
level: system
realises:
  - UC-006
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
modules:
  - MOD-review-pages
  - MOD-approvals
builds_on:
  - ITM-479
tests:
  - component
  - release
origin:
  - akmaier, 2026-10-16, after accepting four module files on the review pages (3f3af683): "the five clicks burnt my token budget of github. The excessive use of token requests is still a problem that needs to be fixed."
---
# ITM-574 An accept click sends a bounded number of requests

**REGISTER**

## Outcome

One click *Accept* or *Accept ticked* on the review pages sends at most a stated number of requests to the repository
server with the person's stored repository token, for one file and for N files. The click is counted with the page it redraws after the decision.

**Not ready for a sprint yet.** Two steps come before it is selected.

**1. Measure first.** A developer who changes no product file measures, and records a MEASUREMENT under
`docs/measurements/` with its method. What is counted is the requests the dashboard sends with the repository token the
person stores in it. That token's rate limit is the one used up.
- **The harness.** The counting fake GitHub of `tests/uc-006-batched-reads-harness.mjs` (`fakeGitHub`, `requests`),
  with commits served as `tests/review-pages-use-cases.test.mjs` serves them.
- **The known positive.** TST-479201 counts at most 22 requests for one SPEC-entry page of 1,332 files.
- **What is counted.** For one file and for 5 files, on a product of this repository's size, the requests of one click,
  by method and path:
  - the click calls `service.accept` (`src/review-pages/flow.mjs:178` for the list, `:297` for one file);
  - which calls `acceptShown` (`src/approvals/accept.mjs:71`): `repositoryInfo`, `readSnapshot` of the default branch,
    `acceptanceBlockers` per file (the file and `SPEC.md`), and `commitFiles`;
  - then `redraw` (`flow.mjs:131`), which renders the whole route again through `readPlace`.
- **The bar's other reads.** In the same way:
  - one hand-over's assessment, through `productFacts` (`src/prompt-bar/hand-over.mjs:55`);
  - one poll of a followed job (`EVERY` = 15 s, `src/prompt-bar/follow.mjs:18`);
  - one check of the notifications (`src/notifications/checks.mjs:22–23`), which a page runs at once when opened after a
    pause.
- **Which requests go one by one.** It names the requests that read one file each where `readMany` (ITM-479) could read
  many.

**2. Settle the bound from the texts.**
- What the texts say today:
  - ITM-479 gave the trace graph `readMany`, and its release tests bound the SPEC-entry page (TST-479201).
  - MOD-review-pages reads the SPEC once for the list of entries (Interfaces).
  - `acceptShown` writes N files in one commit on one snapshot read (`accept.mjs:60–64`).
  - `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN` (SPEC.md:664) only names the failure, and no text bounds
    the requests of a click.
- So the bound is a change of the architecture, or of the SPEC: a draft for akmaier made from the measurement, not a
  question. It names which reads go through `readMany`, and whether the redraw reuses the snapshot the decision
  committed on.

Earlier work on the same problem was found by grepping `docs/backlog` for "rate limit", "readMany", "GraphQL" and
"batched read". The known positive is ITM-479.
- ITM-479 batched the trace graph's reads after akmaier's earlier report that the dashboard used up the hourly limit.
- ITM-477 (an active token refused by the desktop dashboard) and ITM-296 (read-only pull request facts) are about other
  paths.
- No item bounded the review pages' accept path.

## Acceptance

- A component test counts the requests of one accept click for 1 and for N files over the counting fake, and holds them
  at or under the accepted bound.
- The counter-proof: the path as it stands exceeds the bound, and the test is seen failing on it first.
- A used-up limit is still named, never blamed on the token.
- The release test is written by a developer who implemented none of it.
