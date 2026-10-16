---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 611652a82eb10c6f5549ca4a113242e9df303e1b
  - https://github.com/akmaier/agent-m/pull/588
date: 2026-10-16 14:13 UTC
---
# Development → Release testing: ITM-542, The page's last lines stay clear of the prompt bar

**REGISTER**

## Reason

ITM-542, pull request #588 into `sprint/team1/45`, at head `611652a8`. developer-sonnet-b wrote it, as `45.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `45.md`, MOD-site-frame, MOD-prompt-bar, UC-049 and chapters 9, 11, 12 and 13 as
read in full.

1. **The tests-only commit is red.** `06d617a9`, run 38913186843, fails exactly TST-542001, TST-542002 and TST-542003 on
   behaviour (`actual: undefined`, `expected: '120px'`); no export was missing. TST-542004 passes on the base: it guards
   the Acceptance's "The Bridge's window, which draws no bar, gets no such footer", which holds already, and its planted
   fault D (the Bridge window given the observers) makes it fail.
2. **CI is green on the head**: ten of ten jobs, run 38913693729.
3. **The changes stay in the item's scope.** `src/site-frame/index.mjs` (MOD-site-frame: `footTakesBarHeight(foot)`,
   called in `startSite` before `startPromptBar`; `startBridge` untouched) and the new
   `tests/site-frame-prompt-bar-foot.test.mjs`. No existing test's expected result changed. No function of another
   module is newly called, and no request is added.
4. **The tests name their requirement and module, and each fault is caught.** A (footer one pixel higher) fails 001–003,
   B (the bar never observed) fails 002, C (no height at draw) fails 001–003, D fails 004. Each test states its
   heights in its own text.
5. **The Acceptance holds.** In a small DOM the footer takes the bar's 120 px, then 200 px and 64 px as the bar changes
   where a `ResizeObserver` exists, and 120 px once where none does; the Bridge's window gets no footer and no observer.
   Locally: 43 release tests naming MOD-site-frame and 408 related tests, none failed.

The readings stay within the item's text: the height is the bar's `offsetHeight` in pixels in the footer's `style`
attribute; "the bar" is the element MOD-prompt-bar draws into the footer; the frame learns of the draw by a
`MutationObserver`, since `startPromptBar` returns only `{ stop }` and the item names no other way; a bar that draws
nothing leaves the footer without a height, which the item does not address.
