---
id: ITM-277
title: Current requirements above SPEC history
level: module
realises:
  - UC-020
  - A REQUIREMENT HAS FOUR FIELDS
modules:
  - MOD-trace-pages
builds_on:
  - ITM-214
  - ITM-205
  - ITM-220
tests:
  - unit
  - system
  - release
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

Build only MOD-trace-pages' current specification slice in src/trace-pages/index.mjs, flow.mjs and views.mjs.
Expose the accepted public view with its trace/specification route and specification descriptor, no ad-hoc overview
export. Use the given product host's readSnapshot at the pinned version/ref passed in the accepted route params,
Snapshot.read("SPEC.md"), MOD-spec-document's public parseSpec and MOD-markdown-render's renderArtifact. The working
MOD-product-process callers demonstrate parseSpec reuse; existing MOD-test-pages reads demonstrate the Host/Snapshot
path. ViewContext and PageSetup gain no new fields. Empty strategies run no job.

This implements the current section/name and four-field reading increment only. The descriptor and flow must not claim
full UC-020 group hierarchy, traces, coverage, proposals, per-requirement history, version comparison or editing. No
parser, SPEC, use case or architecture changes are needed.

After the owned module merges, a separate change-between-jobs PR makes docs/assets/dashboard/spec-changes-view.mjs call
its public route above the existing queues, using the working process-view.mjs Host/context adapter pattern. Its only
production change is that module call and the texts describing it. Preserve the pinned dashboard commit and sequence
guard; no overview computation lives in the legacy asset. Independent E then supplies actual-dashboard system/release
tests for the complete increment before Sprint14 closes.

## Acceptance

- New unit tests call the actual public trace/specification Route.render with controlled Host/Snapshot, DOM and a
  fixture SPEC containing multiple sections and named requirements. After wiring, independent system/release tests run
  the actual openDashboard #spec flow. They assert the overview appears before the existing queue history, preserves section/name order,
  and shows each requirement exactly once, including one outside a section.
- Selecting a displayed name reaches that requirement's readable source, rule and check. Rendered Markdown remains
  sanitised, names/text are safely escaped, and navigation does not open a change queue in place of a requirement.
- The overview uses current SPEC bytes, not open proposals or historical queue text. A fresh page after a SPEC change
  shows the new current requirement; an empty or absent SPEC gives an explicit empty state while existing queues remain
  usable. Opening and navigating the overview writes nothing, with or without a token.
- Existing #spec/<queue> and #spec/<queue>/<nn> links, statuses, lazy closed queues, proposal comparison, editing and
  acceptance stay intact. Existing test expectations and helpers remain unchanged.
- The implementation changes only src/trace-pages/ and new tests naming MOD-trace-pages. Existing diagram behaviour,
  SPEC, use cases, architecture, parser, shared helpers and all old expectations stay unchanged. The separately reviewed
  between-jobs PR changes only the legacy public-module call and its descriptive texts.
- The implementation's first commit contains only new tests and has actual red CI before implementation. Final-head full CI is green;
  each new case has an executed planted-fault failure and restored positive recorded in the PR. po-sol independently
  decides the exact-head gate as a different participant/model. No paid service is called.
