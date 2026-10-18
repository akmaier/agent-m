---
id: ITM-876
title: Review all shows a changed file rendered below its difference, and its impact list by module
level: module
realises:
  - UC-008
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-review-pages
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - akmaier's report of 2026-10-18 of a regression on the spec, use case and architecture pages, relayed by scrum-master-opus
---
# ITM-876 Review all shows a changed file rendered below its difference, and its impact list by module

**REGISTER**

## Outcome

akmaier: "Below currently a long text is found. this is not very useful. Instead it should show a render of the full
markdown and mermaid in the state to be accepted below the text box." And: "The impact is not formatted but just a wall
of text. It also needs to go into a text box with slider."

**What the texts already state:**
- UC-008 3e: Review all shows "a changed one as its difference to the last accepted text (2a)".
- UC-008 2a: "Above the text, the dashboard shows the difference".
- UC-008 step 2: "the dashboard renders its text and Mermaid diagram".
- So a changed file on Review all shows its difference, and below it the file rendered with its diagrams. This is the
  reading taken. MOD-review-pages.md:188 ("a changed one as its difference") does not exclude it.
- UC-023 step 4 lists the impact list's parts: "the modules the change concerns, and the modules that use an interface
  it alters or removes; the code files in each affected module's folder; the tests that exercise each affected module,
  and the requirements they guard". So code files and tests are listed per affected module.

**What the code does** (`src/review-pages/flow.mjs:225-238`, `src/review-pages/sections.mjs:101-114`):
- A changed file shows only its difference. It is not rendered below it.
- `impactSection` joins all code files of all modules into one paragraph (`:110`), and all tests into another (`:111`).
- The old view (`impactHtml`, `review-views.mjs:510-524` at `caad73d3^`) listed them under each module, in `<code>`.

**The text box with a slider.** The difference is already drawn in a box that scrolls: `.accepted-diff .diff`, with
`max-height: 420px; overflow: auto` (`docs/assets/style.css:68`). The impact list goes into a box that scrolls the same
way. Which style rule gives it is read at the start. A new rule in `docs/assets/style.css`, a file outside every module,
is not this item's to write (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`). If no existing rule fits, the item stops
there and reports it.

## Acceptance

- On Review all and on a file's page, a changed decision or module file shows its difference and, below it, the file
  rendered with its Mermaid diagrams. Tests check both, each with a counter-proof.
- The impact list names, under each affected module, its code files and its tests. A test checks
  this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Split at its stop clause (sprint team1/87).** No existing rule gives the impact list a scrolling box that fits:
`.accepted-diff .diff` is the difference's style, with its `pre-wrap`, block spans and warning border. So the box is
ITM-894's, and this item builds the rendering and the grouping.

