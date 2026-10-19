---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 62f16a406655d6ade34ebfd1bc5480d4ab81eb79
  - https://github.com/akmaier/agent-m/pull/997
date: 2026-10-19 09:38 UTC
---
# Development → Release testing: ITM-997, passed — the resources page checks through the Bridge and pins a Hub resource

**REGISTER**

## Reason

ITM-997 (MOD-settings-pages), pull request #997 into `sprint/team1/93`, passes on `62f16a40`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `e3b1b388` holds only tests: `tests/settings-pages-resources.test.mjs`. Its seven new tests replace TST-642012, the old
    "not built yet" test, as the item's output.
  - `62f16a40` holds the code: `src/settings-pages/resources.mjs`.
- **The red,** run 39230948725, job 117988477319: `# fail 7`, `# todo 0`, `# cancelled 0`, exactly the seven new
  resources tests.
- **The code meets MOD-settings-pages.md:198-201.**
  - *Check* goes through the Bridge the route names, kept as `bridge:<name>` (MOD-browser-store.md:71), with
    `endpoint-models`, `partitions` or `agent`. It writes nothing.
  - A Hub resource's pin is read with `hubFacts`, and *Move* commits the new pin.
  - A key comes from `resource-key:<name>` (MOD-browser-store.md:75).
  - The page's field that stores that key is not built yet. ITM-1073 builds it.
- **CI:** run 39231153704 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`a4b2a11b`) is clean.
- **Replayed in a clean worktree at the head:**
  - `settings-pages-resources` passes 21 of 21.
  - Counter-proof: with the compute check asking `agent` instead of `partitions`, exactly "Check on compute reached by a
    Bridge lists the cluster's partitions" fails.
