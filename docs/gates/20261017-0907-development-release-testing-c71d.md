---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 43d48b73d9bdf375f0a75a0ccbc01f9da6cac90d
  - https://github.com/akmaier/agent-m/pull/712
date: 2026-10-17 09:07 UTC
---
# Development → Release testing: ITM-603, Leaving an edit route with unsaved changes asks first

**REGISTER**

## Reason

ITM-603, pull request #712 into `sprint/team1/69`, at head `43d48b73`. developer-sonnet-e wrote it.

**Red.** The tests-only commit `9a16721d` was red in run 39019642410 (`failure` on `9a16721d`), with 15 failures across
three shards: TST-603001 to 005, 603010, 603011, 603020 three times, 603021 three times, 603022 and 603023. The todos
are existing ones. They fail on behaviour: "route.leave is not a function", and `close()` returns undefined.

**The code, read in the diff.**
- `askBeforeShowing` (`src/site-frame/index.mjs`) asks `shown.route.leave?.()` before `show` at both `hashchange` points.
  Only `false` keeps the route: the fragment is put back, and the browser's announcement of that is neither asked nor
  drawn.
- `close()` returns a boolean, and the three edit pages give the route `leave` through their editor's `close`.
- These are the accepted texts (`b43da779`). No read and no error is added.

**What else holds.**
- CI is green, ten of ten in run 39019808717, and the pull request is mergeable.
- Six planted faults are caught.
- The draft run over 3697 tests changed no existing test, and TST-343003 and 343004 hold.
- The AGENT_M_343 harness passes on CI on base and head, and ITM-018 passes.

**Rulings.**
1. **Waits by `setImmediate` are accepted here.**
   - No team agreement asks for waits bounded by the clock. I read sprint 50's (`50.md:194-196`) at ITM-590's gate, and
     it is about logs and recipes.
   - The finding on waits is sprint 12's: a test "waiting a fixed number of turns instead of for a settled page"
     (`12.md:225-226`). That flake waited on a host's answers.
   - These tests await nothing beyond microtasks, so one turn after them is settled, not a guess. A wait on a host or a
     timer would need a bound by time.
2. **"The route shown is the route rendered last, whatever its parameters" is taken.** Its address is the fragment it
   was drawn for, which is the one put back on `false`. That is what "keeps that route and puts its address back" in
   MOD-site-frame's text asks.

**Findings** (sprint 63's agreement):
- **`draft` and `<k>/draft` show editors and give no `leave`:** ITM-671.
- **Closing or reloading the tab is not covered:** ITM-672. It reads against MOD-site-frame's `Route` whether it needs a
  draft.
- **The lead that a late render could set a stale editor:** ITM-673. It writes the test first, and is built only if that
  test is red.
- **`tests/markdown-render-343.test.mjs` imports `./markdown-render.test.mjs` as a harness:** folded into ITM-670, which
  holds that kind.
