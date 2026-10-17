---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d055254b8028406c11180f12d487779ca6fd68f0
  - https://github.com/akmaier/agent-m/pull/718
date: 2026-10-17 10:16 UTC
---
# Development → Release testing: ITM-668, The specification view leads to Gaps

**REGISTER**

## Reason

ITM-668, pull request #718 into `sprint/team1/70`, at head `d055254b`. developer-sonnet-d wrote it.

**Red.** The second red, run 39023700090 on `a81d1c00`, came after the developer corrected its own TST-668007 setup and
ran red again (sprint 56's agreement). It has 9 failures:
- node (3): `# fail 1`;
- node (4): `# fail 2`, with `# todo 2` (existing);
- node (5): `# fail 6`.

They are TST-668001 to 668007, TST-473167 (named) and TST-360002.

**The change.** A *Gaps* link to `#trace/key=gaps/ref=<the ref shown>`, and *Specification* back, written through the
frame's `fragment`. It reads nothing.

**The token budget** (sprints 66 and 69, in sprint 67's form): TST-668007, a committed test, shows that following the
link reads exactly what the gaps view reads alone.

**What else holds.**
- CI is green, ten of ten, and the pull request is mergeable.
- Two planted faults are caught.
- No release test changes. ITM-018 passes, and the fetch spy saw no call.

**Rulings.**
- **TST-360002, not named, is accepted as changed.** It counts the page's anchors, so any added link changes it, from 6
  to 7. The red found it, as sprint 64's agreement intends. It is a unit test of MOD-trace-pages, not a release test.
- **The bar's page text now holds "Gaps" and "Specification".** That is a behaviour the change alters, and TST-668005
  tests it (sprint 62's agreement).
- **The link is offered when the chosen ref cannot be read** (TST-668004). It is taken: the gaps view names its own
  failed read, through ITM-601's `readProblem`, and the person may go there.

**Finding:** `tests/trace-pages-edit-links.test.mjs` imports `./site-frame.test.mjs`, which is ITM-670's kind, already
registered.
