---
id: ITM-874
title: The review pages show each status in its colour, and Review all as a button
level: module
realises:
  - UC-008
  - UC-006
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - akmaier's report of 2026-10-18 of a regression on the spec, use case and architecture pages, relayed by scrum-master-opus
---
# ITM-874 The review pages show each status in its colour, and Review all as a button

**REGISTER**

## Outcome

akmaier: "Neither "spec", "use case" and "architecture" indicate by color coding what is accepted and what needs changes",
and "The "review all" function an UI are barely visible on the architecture page". Both came with ITM-680
(`caad73d3`), which replaced the old views (`docs/assets/dashboard/review-views.mjs`, last at `caad73d3^`) with
MOD-review-pages' routes.

**The path, read in the code.**
- **Colour.** The page's style colours a status badge by the class `b-<status>`: `.b-open`, `.b-accepted`,
  `.b-changed`, `.b-approved` (`docs/assets/style.css:26-30`). The old views wrote `badge b-${s}`
  (`review-views.mjs:30` at `caad73d3^`). MOD-review-pages writes `badge ${file.status}`, for example `badge accepted`
  (`src/review-pages/flow.mjs:168`, `:222`, `:306`). No rule matches that, so every status shows grey.
- **Review all.** The old views drew `<a class="btn primary" href="#review/<area>">Review all N open</a>`
  (`review-views.mjs:690-692`). MOD-review-pages draws `link(…, "review-all", "Review all")` (`flow.mjs:181`). No rule
  styles the class `review-all`, so it shows as a plain link.

The routes write the classes the page's style already has, as the old views did: `badge b-<status>`, and Review all as
`btn primary` with the count of files not yet accepted. No file outside MOD-review-pages changes.

## Acceptance

- On the list, a file's page and Review all of the use cases, the architecture and the SPEC changes, each status's badge
  carries `b-<status>`, the class that `docs/assets/style.css` colours. A test asserts it per status, with a counter-proof.
- Review all is a `btn primary` link that names how many files are not accepted, on every kind that has one. A test
  asserts it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
