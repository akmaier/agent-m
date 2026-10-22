---
id: ITM-1178
title: The requirements tree and controls share the responsive look
level: module
realises:
  - UC-020
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
  - ITM-904
tests:
  - system
origin:
  - akmaier's request to repair the Requirements page's layout and widgets
---
# ITM-1178 The requirements tree and controls share the responsive look

**REGISTER**

## Outcome

The existing Requirements page presents the restored requirement hierarchy, its narrowing controls,
group toggles and requirement rows in a readable shared layout on a phone and desktop. Its controls
use the site's existing boxed-control and button conventions rather than unstyled browser widgets.
The production correction belongs to Frame's shared stylesheet, not the trace reader or grouping data.

## Scope

Change only `src/site-frame/look.css` in production. Frame owns the shared look and the takeover of
legacy styles. Use the existing control patterns and scope the correction to the existing requirements
DOM as needed; do not copy a stylesheet into a route or edit the legacy stylesheet in place.

The existing caller is `src/trace-pages/flow.mjs`: `overview` draws `.current-requirements`,
`narrowBar` draws `.spec-narrow` and its search/select controls, and `groupNode` draws
`.spec-group`, `.spec-group-toggle` and `.spec-group-body`. Their data, filtering, counts, expansion,
routes and accessible state do not change. No API, SPEC, use-case or architecture change is needed.

The complete restored `docs/groups/requirements.md` is the person's separate regrouping input under
UC-021. It is not this item's production file or a hierarchy to reconstruct in CSS or JavaScript.
Keep the SPEC, all grouped artifacts, approval records and grouping file unchanged in this item.

## Acceptance

- Add focused system regression coverage in the existing `tests/site-usability.test.mjs`, using its
  unchanged native Electron/server/geometry callers and the actual Requirements route. Start with
  the complete restored group file and its matching SPEC as input, not a shortened substitute.
  State literal positive input expectations in the test: the restored input has 17 groups and 414
  unique requirement members, including `0. Hard product rules` and `16. Usability`. These are
  properties of this test input, not constraints on the person's future arrangement.
- At the existing 390 px and 1280 px widths, positively locate the heading, narrowing controls,
  group toggles and real requirement content before checking layout. Open a real group. Check
  actual rendered boxes and computed control styles: the existing shared font and boxed-control
  treatment, readable separation of controls and content without overlap, and visible group labels
  and counts. No CSS-source-string check substitutes for the rendered result.
- The full requirements page and an opened group's content fit the viewport with the existing
  unfiltered width-findings expectation `[]`; buttons and links retain the existing target-size
  expectation `[]`. Closed group bodies stay closed, and the existing toggle and narrowing behavior
  remain usable. Do not hide requirements or disable controls to obtain empty findings.
- Preserve all old test identifiers, levels, inputs, literal expectations and empty arrays, including
  frozen TST-922001, the old menu contracts and all unrelated TODO reasons. Helpers, shared fixtures,
  routes, trace/group parsing, Source outside Frame, and CI configuration do not change. Only a
  reason actually resolved by this correction may be removed after its actual check passes.
- The first commit is tests only and its automatic CI demonstrates the intended failure before SM
  permits Source. Each new case has an effective owned-code fault/failing result and exact restoration
  with truthful immutable result records, as the existing job rules require.

## Readiness

UC-020 and the current Frame contract already provide the outcome. ITM-904 supplies the existing
rendered-browser check. This item does not select NVIDIA work or revive a withdrawn SPEC proposal.
Frame writers are serialized; the completed ITM-1174 and ITM-917 Source contributions are retained.

Single responsibility separates shared styling from the person's regrouping and Trace's data flow.
DRY keeps one shared stylesheet; KISS and YAGNI reuse the existing controls and browser caller rather
than introducing a new widget framework or public interface.
