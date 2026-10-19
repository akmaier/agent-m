---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 25a9a59773146ad824d66d240f2ea20373dfa031
  - https://github.com/akmaier/agent-m/pull/978
date: 2026-10-19 07:49 UTC
---
# Development → Release testing: ITM-845, #spec reads the register in its first wave

**REGISTER**

## Reason

ITM-845 (MOD-site-frame, MOD-source-register), pull request #978 into `sprint/team1/93`, passes on `25a9a597`.

1. **Both commits carry the trailer** `developer-sonnet-a`, with no merge.
2. **The red is `9aef2d3e`.** Run 39217613953 fails exactly three tests: TST-833201, the new `registerPaths` unit test and the
   new `load-per-view` case.
3. **The change follows the accepted texts** (`c3ab0276`):
   - `src/source-register/index.mjs` gives `registerPaths(paths)`, the entries `docs/sources/SRC-<slug>.md` among the paths,
     in their order;
   - `dashboard-app.mjs` reads `SPEC.md`, `docs/sources.md`, the register's entries and the queue heads in the first wave.
   The links file's path stands in the frame's accepted sentence itself, and no interface gives it.
4. **Measured,** on the fixture of `system-itm-833-spec-register-batch`: with a token, 6 requests fall to 5, one batch of 4;
   without a token they stay 8. TST-833201's expected count changes as the item's own output.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the three files pass 34 of 34;
   - with `registerPaths` giving nothing, the three red tests fail again.
6. **Green.** CI run 39218106841 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `c7e48c17`).
7. **The developer's finding,** registered as ITM-1067: `src/review-pages/spec-entries.mjs` keeps its own
   `isRegisterEntry`, a second copy of the register's path rule.
