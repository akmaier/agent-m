# §9: a correction loop between Agent M's checks and the drafting participant

**PO, 2026-09-30, on UC-019 step 7:** *"I see several problems that can arise. I think Agent M should report
problems in step 7 back to the drafting participant and ask it to fix the problems (including giving a
template text like a compiler on what the problem is that it detected.) So Step 7 should work like a harness
until it is completed successfully."*

Six new rules; nothing existing changes. Design decisions by the main agent — correct them in the edit field:
- **For every drafted artifact, not only UC-019.** The same checks run after deriving requirements (UC-005),
  use cases (UC-007), architecture (UC-022) and tests (UC-026); the rules therefore name drafts in general.
  To narrow them to UC-019, say so.
- **Errors and warnings.** "Until completed successfully" is reachable only if a suspicion that may be a false
  alarm can be answered with a reason; errors have to be fixed.
- **What stays with the person:** conflicts, and every finding the SPEC leaves to a person, are never sent
  back. Transformations Agent M performs itself — a renamed requirement proposed as withdrawal plus new —
  are not findings.
- **A limit fixed in advance,** plus an early end when a round changes nothing; the person sees what is left.
  The default number of rounds is a setting of the job definition, not a rule; proposed: 5.

Impact: UC-019 (step 7), UC-005 (step 6), UC-007 (step 5), UC-022 (step 6), UC-026 (step 6).
