---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f3e6f24b3f1420d15e646519ef8784a209d377e2
  - https://github.com/akmaier/agent-m/pull/1158
date: 2026-10-19 20:23 UTC
---
# Development → Release testing: ITM-1108, the replies page's link to an issue is an address the frame reads

**REGISTER**

## Reason

ITM-1108, pull request #1158 into `sprint/team2/97`, passes on `f3e6f24b`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `e7f717fc` holds only tests, and CI failed on it.
2. **The fix.** The link is `#replies/issue=<n>/product=<encoded>`, the form the frame reads (MOD-site-frame.md:133). h
   planted 3 faults.
3. **The `fragmentOf` gap, ruled.**
   - The page writes the address by hand, because neither text names the frame's writer: it is not exported through
     MOD-site-frame's index, and not in MOD-maintenance-pages' Uses. Calling it would need a draft on both.
   - This is acceptable for this item, which fixes a defect within its scope.
   - But a second copy of the frame's address format is a duplicate (principle 2), and finding 2 came from one.
   - So it is registered as ITM-1111, which needs a draft for akmaier.
