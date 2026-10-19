---
id: ITM-1060
title: The explanations of the implementation plan
level: module
realises:
  - UC-045
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-045-5, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1060 The explanations of the implementation plan

**REGISTER**

## Outcome

MOD-site-frame.md:99-100: "`explanations.md`: one section `## <topic>` per topic ... It holds the topics of the site's
pages". UC-045 step 1 (UC-045.md:65-66): "A folded **What is this?** explains the plan with the table above and points to book
ch. 6." No topic of `explanations.md` names the plan or its steps.

## Acceptance

- `explanations.md` holds the topics the plan page names, the plan's topic with the table of UC-045 and the pointer to
  chapter 6; the frame's own check finds none missing.
- A unit test that names MOD-site-frame renders each topic, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
