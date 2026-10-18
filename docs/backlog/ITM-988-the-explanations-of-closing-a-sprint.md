---
id: ITM-988
title: The explanations of closing a sprint
level: module
realises:
  - UC-041
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-8, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-988 The explanations of closing a sprint

**REGISTER**

## Outcome

MOD-site-frame.md:99-100: "The explanations file `explanations.md`: one section `## <topic>` per topic ... It holds the
topics of the site's pages". UC-041 step 2 (UC-041.md:72-73): "a folded **What is this?** says that an item that does not
meet the Definition of Done is not part of it, however close it is." `src/site-frame/explanations.md` holds no topic of the
increment, the feedback lines, the unfinished items or the retrospective (its 112 `## ` topics read).

## Acceptance

- `explanations.md` holds the topics the close page names; the frame's own check finds none missing.
- A unit test that names MOD-site-frame renders each topic, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
