# 13. Process execution and jobs: a job receives the book's chapters for its work

**The change.** Four new requirements follow `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`. The input Agent M sends with a
job contains the chapters of the book *Vibe Coding* for the work the job does: requirements and use cases chapter 8,
tests chapter 13, the architecture chapters 9 to 12, implementation chapters 9, 11, 12 and 13 — each in full. The rest of
the section is carried over byte for byte.

**Why.** PO, 2026-10-10: "We need to put into Agents.md and the Spec that an agent who works on specs needs to read the
chapter on requirements engineering, an agent working on tests, the chapter on testing, an agent working on
architecture, the chapters on architecture, design, and implementation, and a developer the testing, implementation, and
design chapters at least." Asked, the PO said: "design" means chapter 9 *System Modeling* and chapter 11 *Agentic Design
and Control Patterns*; "specs" includes use cases; Agent M sends the chapters with the jobs of every product. AGENTS.md
says the same for the agents that work on this repository.

**Where.** §13 holds the rules on jobs. The four rules follow the rule on who receives a job.

**Checks.** Each check names its test, says how the test works and says what it checks. It names no values to test for.

**Impact list.** The four names are new; no existing requirement changes. After acceptance, the job definitions name the
chapters of their kind of work, and the use cases that list what a job is sent (UC-034, step 3) name them too.
