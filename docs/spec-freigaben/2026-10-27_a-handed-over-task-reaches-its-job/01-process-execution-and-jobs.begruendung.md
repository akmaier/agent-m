# 13. Process execution and jobs: a handed-over task reaches its job

**The change.** One new requirement, before `A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON`: `A
HANDED-OVER TASK REACHES ITS JOB` — the task a conversation hands on reaches the prompt of the job it starts, or the job
is not started and the conversation names why.

**Why.** A probe on GitHub's runner (run 40531535212) handed a task to a `propose-tests` job: the job ended *done*, but
its prompt held no task, because only kinds that list the recipe `instruction` receive one. UC-049 4a has the hand-over
name "the task in its words" and start the job "with the task as the workflow's input"; nothing in the SPEC forbids
dropping it. The fix (merged) gives the task to every kind the prompt bar hands over and refuses the rest; a refusal must
cite a requirement (`src/text-tools/findings.mjs`), and today it cites a name the SPEC does not hold.

**Design principles** (AGENTS.md §2):
- Nothing the SPEC already says: `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY` and its siblings hold what is
  derived from the SPEC, use cases and architecture; none holds the person's task.
- One responsibility per rule: one sentence for the task, whichever route the job takes — tab, CI or Bridge.

**Impact list.**
- Requirements: the one above, new. Check: `tests/runtimes-hand-over-task.test.mjs`.
- Use cases: UC-049 4a realises it.
- Code: the rule name the refusal cites (`taskRefusal`, `src/job-runner/builtins.mjs`) becomes this requirement's name.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
