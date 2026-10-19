---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - b8de42cd1a8052f10f3455e8f024177bb64cfb78
  - https://github.com/akmaier/agent-m/pull/1023
date: 2026-10-19 11:06 UTC
---
# Development → Release testing: ITM-1042, rejected — Edit of the instance's resources is not shown to open them from a product's page

**REGISTER**

## Reason

ITM-1042 (MOD-settings-pages), pull request #1023 into `sprint/team1/93`, is rejected on `b8de42cd`.

**What holds.**
- **Commits:** two, one parent each, with the trailer `developer-sonnet-a`.
- **The red,** run 39241127706 on `f36b5059`: exactly TST-104201 to 104203 and the Python rule that every repository
  setting has a place on the page.
- **TST-511010** changes with the code, to count only the reads of the switch file, as this item's output.
- **The readings stand:** the routes per line, the summaries read with their owners' schemas or as counts, and the ten
  settings of UC-042's table.
- **CI** passed on the head (run 39241749515).

**What fails.**
- **The Acceptance.** It asks that each line's *Edit* "opens its route".
- **The line in question.** The instance's resources call `go("resources/instance")` (`settings.mjs:1085`). The route
  `resources/instance` is the route `resources` with no product (`resources.mjs:6`).
- **What nobody has shown.** On a product's page, the frame may carry the chosen product into the address. Then *Edit*
  would open the product's resources, not the instance's. sonnet-a names this as unchecked.

**What passes on the next head.**
- A test shows that, on a product's page, *Edit* of the instance's resources opens the instance's resources.
- If the frame carries the product along, the line opens them in a way that does not.

**The folded explanations of the lines** are not this item's Acceptance. UC-042 asks for them, and their topics are
MOD-site-frame's. They are registered as ITM-1075.
