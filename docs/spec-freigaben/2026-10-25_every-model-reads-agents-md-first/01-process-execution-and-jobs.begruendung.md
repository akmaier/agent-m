# 13. Process execution and jobs: every model reads Agent M's AGENTS.md first

**The change.** A new requirement: the input of every call of a language model — a job's, or a message of the prompt
bar — begins with Agent M's own `AGENTS.md`, from the instance repository, in full, whatever repository the call works
on; or with its path for a participant working in a checkout of the instance.

**Why.** akmaier, 2026-10-25: "All llms (gpt-oss as well as nemotron) must read agents.md as initial prompt. Make sure
this happens." akmaier, on which file: "no it needs to be agents.md of agent m". Agent M's `AGENTS.md` holds the binding working
rules for every agent Agent M runs; today a
model endpoint called from the prompt bar or in a hosted job receives the job's prompt and its recipes' inputs, and an
implementation job gets the file only as one part among others (MOD-run-planner's `implementation-inputs`). A model that
has not read the rules cannot follow them. Reading it first, in full, is what the file asks of every agent ("What an
agent reads before starting work: this `AGENTS.md`").

**Impact list.**
- EVERY MODEL READS AGENT M'S AGENTS.MD FIRST: new; its check `tests/test_job_reading.py`.
- MOD-job-runner (the composition of a job's input) and MOD-prompt-bar (the input of a message). MOD-run-planner's
  `implementation-inputs` keeps the product's own coding standards file, a different file.
- AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF stays met: the file is in the repository, where the person reads it.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
