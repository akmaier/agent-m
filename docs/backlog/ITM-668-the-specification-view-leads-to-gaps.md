---
id: ITM-668
title: The specification view leads to Gaps
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-599
tests:
  - unit
origin:
  - ITM-599's gate on pull request #708 (docs/gates/20261017-0836-development-release-testing-e7a1.md), from developer-sonnet-d's finding
---
# ITM-668 The specification view leads to Gaps

**REGISTER**

## Outcome

UC-020 step 7: "The tab **Gaps** shows… the traceability matrix". ITM-599 builds the gaps view at `trace` with
`key=gaps`, and nothing on the specification view leads to it. The view gains the way to Gaps at the version shown.
Whether it is a tab of the view or a link, against MOD-trace-pages' and MOD-site-frame's files, is read at the start.

**Settled at sprint team1/70's start. Selectable.**
- **The module whose files it changes:** MOD-trace-pages, `flow.mjs`. Beside the version choice, a link *Gaps* leads to
  the route `trace` with `key=gaps` and the ref shown, and the gaps view leads back to the specification the same way.
  UC-020 calls it "the tab **Gaps**", and a link in the frame's address form is how the view's routes lead to each other
  (MOD-trace-pages, Interfaces: links "to its own or the review pages'"). No topic is added.
- **Reads, against the token budget** (sprints 66 and 69): the link reads nothing. Following it draws the gaps view,
  whose graph is shared with the specification view per version (ITM-599, TST-599006). So it adds no read.
- **The release tests:** TST-472516 and 472518 read the `#spec` page's elements by class. The draft run shows whether one
  changes. If one does, the developer stops and reports, and a separate item by another participant goes first (sprint
  68). TST-473167, a unit test, asserts the page's whole text, and is expected to change.
- **Error fields:** none added.
- **Reachable:** the live `#spec`, which renders this route.

## Acceptance

- The specification view offers Gaps at the version it shows, and choosing it draws the gaps view at that version.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
