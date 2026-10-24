# 7. Configuration and secrets: the person's token is read only where no agent works

**The change.** In `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`, a sentence is added: the token is
read only on a runner machine on which no agent works; the agent's work reaches it as the run's result, which is refused
when it changes the repository's workflow files or holds a key of the run, and is deleted from the server once written.
The rest of the section is as it stands.

**Why.** akmaier, 2026-10-24, after asking whether the agent runner could steal the credentials of a hosted job: "Yes, I think
this is decent. Please do that." — on the proposal to run the agent and the writing in separate runner machines.

Today the generated job workflow puts `AGENT_M_TOKEN` and every participant's key secret into the environment of the
one job that also runs the coding agent. Any agent that is led astray — by text in the repository, a source or a page —
can read them from its environment, and a step of the same job can read every secret the job names from the runner
process's memory (the way secrets were taken in the compromise of tj-actions/changed-files, 2025). A machine on which
no agent works, and a result that is checked before it is written, keep the person's token and the other keys away
from the agent whatever it does. The key of its own endpoint the agent needs to work; that it can leak that one key is
not prevented here — a spending limit on that key and a restricted network are the next steps, not part of this change.

The result is deleted once written because, while it is kept, anyone who may read the repository's runs may download
it — on a public repository, any signed-in GitHub user.

**Open point for the architecture.** The agent's machine reads the product and the instance without the person's token.
A public instance, and the instance that is its own product, read with the workflow's built-in token; a private instance
that is not the product would then have to reach the agent's machine another way. The architecture decides that.

**Impact list.**
- A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET: changed; MOD-runtimes' job workflow template and its two
  machines, MOD-workflow-entries' entries (the agent's part leaves its result instead of writing), the installed
  `.github/workflows/agent-m-jobs.yml`; its check `tests/test_runtime_levels.py`.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
