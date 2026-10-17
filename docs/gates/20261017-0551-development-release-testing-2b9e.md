---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2bdfa4fb016e43dd42790512775f1883814d4e29
  - https://github.com/akmaier/agent-m/pull/690
date: 2026-10-17 05:51 UTC
---
# Development → Release testing: ITM-597, An opened requirement shows its traces, each linked

**REGISTER**

## Reason

ITM-597, pull request #690 into `sprint/team1/65`, at head `2bdfa4fb`. It is the rework of the rejection on `d46f3810`
(`docs/gates/20261017-0533-development-release-testing-7f40.md`). `d46f3810` is an ancestor of the head, so nothing
was rewritten.

**The red of the rework.** The tests-only commit `8739c72e` was red in run 39007306036 (`failure` on `8739c72e`):
- node (0): `# fail 3`, `# todo 0`, which are TST-597003 (the link by `row`), 597004 (`explain`) and 597015 (no
  proposals and no queue read);
- node (2): `# fail 2`, which are the system tests TST-597201 and 597202.

Nothing else failed.

**The four requests are met.**
1. **The open proposals left.** `proposalsOf`, the import of `queues`, 5c and its note are gone from `flow.mjs`.
   TST-597005, 006 and 012 are deleted, and TST-597015 asserts that no proposals section is drawn and no queue is read.
   They wait in ITM-648 for the draft that adds `entryView` to MOD-trace-pages' Uses.
2. **The note of 2b is `explain("trace-none-yet")`**, with its topic in `src/site-frame/explanations.md`, and no
   `details` of the view's own is left in the diff. MOD-site-frame is among the item's modules since the rejection. The
   topic's text carries no emphasis, and nothing requires any.
3. **A test's link is `#trace/key=tests/row=<id>`**, as MOD-trace-pages' "`trace/<key>/<row>`" gives it.
4. **TST-597007 no longer hangs.**
   - The hang came from comparing a DOM node in `assert.equal`, whose failure diff walks the cyclic DOM.
   - Those assertions now compare booleans, and the queue-reading cases carry a timeout.
   - A planted queue read fails 597007 and 597015 in about 0.4 s.

**What else holds.**
- CI is green, ten of ten in run 39007581304, and the pull request is mergeable.
- The draft run over 66 files gives 657 pass, 0 fail and 2 existing todos, so no existing test changes.
- TST-472516 and 472518 pass before and after, and ITM-018 passes.
- **The measurement:** drawing `#spec` stays at 12 and 127 requests. A first opening costs 3 on the fixture, 11 batches
  here with a token, and 1029 without a token, down from 1139 since no queue is read. Reopening costs 0. The bound
  stays ITM-574's.
