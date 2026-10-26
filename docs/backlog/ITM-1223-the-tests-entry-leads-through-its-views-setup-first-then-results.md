---
id: ITM-1223
title: The Tests entry leads through its views — the batteries' setup first, then the results — in the site's one look
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - UC-026
  - UC-027
  - UC-028
  - UC-029
  - UC-030
modules:
  - MOD-test-pages
builds_on:
  - ITM-1206
  - ITM-759
tests:
  - unit
origin:
  - akmaier's request of 2026-10-26: "For auditing the tests, I want to see a) the setup of the test batteries … what they test for, which requirement they connect to, and when they are executed … b) the test results for inspection. Right now, the structure of the page does not reflect this." and "The UI differs from the remaining page"
---
# ITM-1223 The Tests entry leads through its views — the batteries' setup first, then the results — in the site's one look

**REGISTER**

## Outcome

Every use case of the Tests entry is opened from it — "Tests → Schedule" (UC-027 1), "Tests → Browser" (UC-029 1), "Tests
→ Runs" (UC-028 1), "Tests → Audit" (UC-030 1), "opens Tests and chooses Generate tests" (UC-026 1) —, but none of its
pages links to another: the entry opens `#runs` alone (`src/site/menu.mjs:13`), and no source links to `#schedule`,
`#generate`, `#trace/key=tests` or `#trace/key=audit`. Its pages are also drawn outside the site's look: no `section.head`
(`runs.mjs:65`, `generate.mjs:386`; none at all on `#schedule`, `schedule.mjs:401`, and on a commit, `runs.mjs:327`),
sections without `panel`, plain buttons instead of `btn` (`runs.mjs:60, 162, 318`), lists where the other entries show
`table.list` (`runs.mjs:120, 360`), folds of its own instead of the frame's `explain` (`schedule.mjs:15`), and on
`#schedule` the levels table twice — once as the page's table, once inside the schema form as a Markdown editor with its
preview — with two *Save* buttons.

MOD-test-pages' routes (MOD-test-pages.md: "the menu entries Tests and Releases"):

- each draws the frame's head — its heading and the line of where it reads — and under it the Tests entry's views in this
  order, as links, the one shown marked: **Schedule** (the levels, what each checks, how many tests each holds, when
  each runs, and the CI generated from it), **Browser** (`#trace/key=tests`: each test by level, requirement, use case or
  module, what it guards and expects), **Runs** (the results of a commit), **Audit** (`#trace/key=audit`), **Generate**;
- draws its sections as panels, its rows of items as `table.list` with `data-label`, its buttons as `btn`, and its
  explanations with the frame's `explain`;
- `#schedule` shows the levels by occasion once: the table is the form's own input for the section `## Levels`, edited
  in place, with one *Save*; the front matter fields (nightly, command, setup, cache, minutes) are labelled form rows
  with their explanations.

The entry still opens `#runs` until ITM-1224 orders it.

## Acceptance

- Unit tests naming MOD-test-pages: each of its Tests routes draws a `section.head` with its heading and the five links in
  the order above, the one shown marked; its rows are `table.list` cells with `data-label`; its buttons carry `btn`;
  `#schedule` has one levels table and one *Save*. Counter-proof: before the change each fails.
- The release tests that pin these pages are changed by a participant other than the implementer, in a commit of its own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
