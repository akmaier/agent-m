---
id: ITM-1040
title: The explanations of declaring a resource
level: module
realises:
  - UC-040
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-4, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1040 The explanations of declaring a resource

**REGISTER**

## Outcome

UC-040 asks for folded texts at: step 1, "A folded **What is this?** explains the three-way difference above with the
examples" (:92-93); step 2, "each kind carries one sentence and an example" (:94-95); step 5, "The folded explanation
repeats ch. 10's warning that a leaked key is like a published credit-card number" (:114-115); 2b and 4b, links to UC-015
and UC-004 (:160-161, :174-176); 4c, "the folded explanation of the PEAKS example from ch. 6 §5" (:177-178).
MOD-site-frame.md:78 names "`explanations.md` — the folded explanations, as data", and :99 "one section `## <topic>` per
topic".

`src/site-frame/explanations.md` has no topic for resources (its `## source-kinds` at :495 and the source page's text at
:782, which links UC-040, are the known positives of the search). ITM-642's page draws these topics.

## Acceptance

- `explanations.md` holds the topics above, each worded from UC-040's table (:48-53) and kinds (:65-72), with the links
  to UC-015, UC-004 and UC-017 as the source page's topic links UC-040.
- The frame's check of topics (ITM-646 where it is merged, else a unit test) finds every topic the resources route names;
  counter-proof: a removed topic is reported.
- The first commit holds only the tests, and CI is red on it.
