# §13: closing a sprint, assigned to an agent

**PO, 2026-09-30, on UC-041:** *"we should be able to run this automatically. So product owner should be able
to assign the task to an agent or model."*

Four new rules; nothing existing changes. Choices by the main agent — correct them in the edit field:
- **What can be assigned:** the review, the retrospective and the decisions on unfinished items, together.
  Merging a sprint branch into the default branch stays governed by the existing rule `A PHASE OR A TIME
  BOX MAY HAVE A BRANCH OF ITS OWN`: it is decided by the role the model names for that gate, which the
  person configures in UC-002/UC-031 — an agent only if that gate's role allows one.
- **Automatic start** at the end of the time box, so that nobody has to remember.
- **Honesty about stakeholders:** an agent gathers feedback from issues, mails and records; it does not
  pretend a stakeholder spoke.
- **Proposed by the main agent, not asked for:** `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF` —
  process model, Definition of Done and participants' instructions change only by a person's acceptance.
  Strike it if an agent may apply its own retrospective's changes.

Impact: UC-041 (an agent as closer), UC-032 (assigning the close when a sprint starts).
