---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 7ea68fce3c4bf3937930a965434dda6e3da5b6da
  - https://github.com/akmaier/agent-m/pull/1023
date: 2026-10-19 11:33 UTC
---
# Development → Release testing: ITM-1042, rejected — the settings page writes the frame's address itself

**REGISTER**

## Reason

ITM-1042 (MOD-settings-pages), pull request #1023 into `sprint/team1/93`, is rejected on `7ea68fce`.

**What holds.**
- `81d1b6bc` (tests only) and `7ea68fce` (code) each have one parent and the trailer `developer-sonnet-a`.
- The red of TST-104204 is in run 39244332716, job 118033923356: `# fail 1`, `# cancelled 0`. It shows the defect the last
  rejection named. On a product's page, *Edit* of the instance's resources opened the product's.

**What fails.**
- **The fix bypasses the frame.** The instance's line now sets `location.hash = "#resources"` itself. The address of a route,
  "for the instance itself or a product this browser keeps", is the frame's own writing (MOD-site-frame.md:154-156), and a
  view reaches it through `go` (ViewContext, :140). Writing the fragment in the settings page makes a second writer of the
  frame's address form (AGENTS.md §2, "Nothing twice").
- **The defect lies in the frame.** `go` adds the chosen product to every fragment unless the caller names `product`
  (`src/site-frame/index.mjs:346-348`). Its parameters are strings, so no caller can name "no product".

**What passes on the next head.**
- MOD-site-frame's `go` can reach a route for the instance itself while a product is chosen, as its text already says the
  frame writes such an address. MOD-site-frame joins the item for that change. No draft is needed.
- The line calls `go`. TST-104204 stays the item's red, and a test of `go` shows the instance's address, with a
  counter-proof.
