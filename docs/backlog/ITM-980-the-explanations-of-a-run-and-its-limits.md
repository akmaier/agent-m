---
id: ITM-980
title: The explanations of a run and its limits
level: module
realises:
  - UC-043
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-10, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-980 The explanations of a run and its limits

**REGISTER**

## Outcome

MOD-site-frame.md:99-100: "`explanations.md`: one section `## <topic>` per topic ... It holds the topics of the site's
pages". UC-043 step 4 (UC-043.md:83-85): "jobs at once ..., the cost limit (counted only from costs the runtimes report), and
the correction rounds per draft (preset 5). A folded **What is this?** explains each." No topic of `explanations.md` names a
run or its limits.

## Acceptance

- `explanations.md` holds the topics the run page names; the frame's own check finds none missing.
- A unit test that names MOD-site-frame renders each topic, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
