---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a7b3e8929e5d32fc09c85a64fd96285c289de64f
  - https://github.com/akmaier/agent-m/pull/585
date: 2026-10-16 13:54 UTC
---
# Development → Release testing: ITM-540, The prompt bar stands at the bottom of the window

**REGISTER**

## Reason

ITM-540, pull request #585 into `sprint/team1/44`, at head `a7b3e892`. developer-sonnet-a made both commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `44.md`, MOD-prompt-bar and UC-049 as read in full, and MOD-site-
frame where it draws the bar. It names the caller it read, `src/site-frame/index.mjs`.

1. **The red commit.** The tests-only commit `ad8af12a` was pushed alone, and CI was red on it (run 38909958660, node (3)).
   Exactly the four new tests failed, on behaviour.
2. **CI is green on the head**: ten of ten jobs, run 38911173182. Locally, the related tests pass, and the failing set
   across `tests/` differs from the base only by the four new tests. `test_no_backend` passes.
3. **The changes stay in the item's scope.** `src/prompt-bar/bar.mjs` and the new `tests/prompt-bar-fixed.test.mjs`. No
   existing test changed. The style is set as an attribute, since the existing small DOMs have `setAttribute` and no
   `style` object.
4. **The new tests.** TST-600034 to TST-600037 state their values in their own text. Five planted faults are caught:
   `absolute`, `top` for `bottom`, no `right`, the style cleared after a send, and no style.
5. **The Acceptance holds.** The bar's root element is fixed to the bottom, spans the width, and stays fixed after a route
   change and a sent message.

**The open point, settled from the texts.** With the bar fixed, a page's last lines can lie under it.
- MOD-prompt-bar places only its own bar.
- MOD-site-frame starts the bar "in the page's foot" and owns, in `look.css`, "the header, footer and menu".
So keeping the page clear is the frame's: ITM-542 is registered for MOD-site-frame. Its footer takes the bar's height,
which changes with what the bar shows. No draft is needed.
