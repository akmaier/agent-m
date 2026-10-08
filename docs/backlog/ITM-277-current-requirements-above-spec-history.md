---
id: ITM-277
title: Current requirements above SPEC history
level: module
realises:
  - UC-020
  - A REQUIREMENT HAS FOUR FIELDS
modules:
  - MOD-dashboard-app
builds_on:
  - ITM-214
tests:
  - component
origin:
  - UC-020
---
# ITM-277 Current requirements above SPEC history

**REGISTER**

## Outcome

Above the existing SPEC change queues in #spec, show the current product's requirements from SPEC.md at the dashboard's
pinned commit. Group the overview by the SPEC's section headings in their file order and list every current named
requirement under its section, with any requirement outside sections visible. A name opens or focuses readable content
on that page: name, source, rule and check, using the existing sanitised Markdown renderer. Navigation must not confuse
requirement names with the existing #spec/<queue>/<nn> routes. Keep the change queues below the overview.

Use app.fileText and MOD-spec-document's public parseSpec from src/spec-document/index.mjs, as its working
MOD-product-process callers do. Reuse the current view's rendering, sequence guard and blob cache. No parser change,
SPEC write, approval, edit workflow, release-version selector, traceability matrix or full UC-020 browser is part of this
increment. The legacy Module: MOD-dashboard-app header identifies the existing view's ownership; no new architecture
module or file is introduced.

## Acceptance

- New component tests run the actual openDashboard #spec route with a fixture SPEC containing multiple sections and
  named requirements. They assert the overview appears before the existing queue history, preserves section/name order,
  and shows each requirement exactly once, including one outside a section.
- Selecting a displayed name reaches that requirement's readable source, rule and check. Rendered Markdown remains
  sanitised, names/text are safely escaped, and navigation does not open a change queue in place of a requirement.
- The overview uses current SPEC bytes, not open proposals or historical queue text. A fresh page after a SPEC change
  shows the new current requirement; an empty or absent SPEC gives an explicit empty state while existing queues remain
  usable. Opening and navigating the overview writes nothing, with or without a token.
- Existing #spec/<queue> and #spec/<queue>/<nn> links, statuses, lazy closed queues, proposal comparison, editing and
  acceptance stay intact. Existing test expectations and helpers remain unchanged.
- Change only docs/assets/dashboard/spec-changes-view.mjs and new tests naming MOD-dashboard-app; no SPEC, use case,
  architecture, parser, shared helper or other production module changes.
- The first commit contains only new tests and has actual red CI before implementation. Final-head full CI is green;
  each new case has an executed planted-fault failure and restored positive recorded in the PR. po-sol independently
  decides the exact-head gate as a different participant/model. No paid service is called.
