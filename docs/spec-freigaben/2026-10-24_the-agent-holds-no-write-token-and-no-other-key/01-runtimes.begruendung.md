# 6. Runtimes: the agent's machine receives only its own key

**The change.** In `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`, a sentence is added: the runner machine the
agent works on receives only the key of the participant the job names, and no other secret; the check names the
counter-proof. The rest of the section is as it stands.

**Why.** akmaier, 2026-10-24, after asking whether the agent runner could steal the credentials of a hosted job: "Yes, I think
this is decent. Please do that." — on the proposal to run the agent and the writing in separate runner machines.

Today the generated job workflow puts `AGENT_M_TOKEN` and every participant's key secret into the environment of the
one job that also runs the coding agent. Any agent that is led astray — by text in the repository, a source or a page —
can read them from its environment, and a step of the same job can read every secret the job names from the runner
process's memory (the way secrets were taken in the compromise of tj-actions/changed-files, 2025). A machine on which
no agent works, and a result that is checked before it is written, keep the person's token and the other keys away
from the agent whatever it does. The key of its own endpoint the agent needs to work; that it can leak that one key is
not prevented here — a spending limit on that key and a restricted network are the next steps, not part of this change.

**Impact list.**
- A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET: changed; MOD-runtimes' job workflow template
  (`src/runtimes/workflow/github.yml`, `gitlab.yml`, `jobWorkflowFiles`) and the installed `.github/workflows/agent-m-jobs.yml`;
  its check `tests/test_runtime_levels.py`.
- UC-004 and UC-049 4a, which run jobs on CI, keep their steps; the hand-over passes the one secret it names already
  (ITM-1188).

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
