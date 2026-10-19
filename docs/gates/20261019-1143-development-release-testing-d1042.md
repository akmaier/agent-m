---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8d40beb1b2291eb425b324ce31dcc8e02eb443ee
  - https://github.com/akmaier/agent-m/pull/1023
date: 2026-10-19 11:43 UTC
---
# Development → Release testing: ITM-1042, passed — every repository setting with a summary and Edit, through the frame's go

**REGISTER**

## Reason

ITM-1042 (MOD-settings-pages, and MOD-site-frame for `go`), pull request #1023 into `sprint/team1/93`, passes on `8d40beb1`.
It was rejected on `7ea68fce` (20261019-1133).

- **Commits:** `f3fc742c` (tests only) and `8d40beb1` (code) each have one parent and the trailer `developer-sonnet-a`.
- **The new red,** run 39245717139, job 118036997733: `# fail 1`, `# cancelled 0`, exactly TST-104205, `go` with the empty
  product on a product's page. TST-104206 guards that `go` otherwise keeps or names the product.
- **The rejection's cause is gone.**
  - `go` reads an empty product as the instance itself and writes no product.
  - The settings page calls `go("resources", { product: "" })`, and the write to `location.hash` is gone.
  - TST-104204 still passes.
- **A draft is needed.** SPEC.md:1230 AN INTERFACE TELLS ITS USER WHAT TO CONSIDER, and `go`'s text (MOD-site-frame.md:140)
  does not say that the empty product names the instance. developer-sonnet-a writes that one sentence as a draft for akmaier.
- **What held at the earlier gates still holds.**
- **CI:** run 39246120052 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`8f012c4b`) is clean.
- **Replayed in a clean worktree at the head:**
  - `site-frame-go-instance`, `settings-pages-instance-resources-edit` and `settings-pages-repository-settings` pass 6 of 6.
  - Counter-proof: with `f3fc742c`'s `index.mjs`, TST-104205 fails.
