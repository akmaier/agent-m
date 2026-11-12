# 13. Process execution and jobs: a coding agent on a Bridge is told to read Agent M's files, a CLI session again every fifth message

**The change.**
- `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST`: of the prompt bar's messages, it binds those to an endpoint and the one
  that starts a CLI session, where it said every message; and for a coding agent on a Bridge the input begins with the
  instruction that the agent must read the file in full, naming its path in the Bridge's clone of the instance, where it
  said that a participant working in a checkout of the instance — on a Bridge or in CI — is given the file's path. A job
  on GitHub's runners, like a model endpoint, is given the text. Its check names CI, the agent on the Bridge and the CLI
  session.
- `A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`: the chapters as the instruction to read their files,
  named by their paths in the Bridge's clone of the instance, for a coding agent on a Bridge, where it said the paths for
  every participant that works in a checkout of the instance. Its check names the participant in CI, given the text.
- `A CLI SESSION IS TOLD AGAIN EVERY FIFTH MESSAGE TO READ AGENTS.MD`, new, after `EVERY MODEL READS AGENT M'S
  AGENTS.MD FIRST`: every fifth message after the one that starts a CLI session of the prompt bar begins with that
  instruction again, noting that the agent need not read the file again while it is still in its context.

Every other byte of the section is carried over.

**Why.** akmaier, 2026-11-12, in a CLI session of the prompt bar: `AGENTS.md`, and the chapters given with it, "should be
repeated every 5 messages with the constraint that it doesn't have to be read if still in context" — instead of with
every message, as `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST` and UC-049 step 4 prescribe. Then: "The hardcoded system
prompts we need in particular for GitHub runner and in the endpoint models. For cli agents, it is enough to instruct them
to read the files (mandatory)."

"Every fifth message after" is read as the sixth, the eleventh and so on, counted from the message that starts the
session; a session started anew (UC-049 4g, 4h, 5a, 6d) counts from its own first message.

**What follows.** A running CLI session receives neither `AGENTS.md` nor the chapters as text: it reads the files of the
Bridge's clone of the instance, which the Bridge checks out at the commit the ask names (MOD-bridge-jobs). A job in CI is
given both as text, where today it is given the paths in the job workflow's checkout of the instance.

**Impact list.**
- `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST`, changed: named by MOD-prompt-bar, MOD-identifiers (as an example name
  only), `src/workflow-entries/product.mjs`, and the tests `tests/test_job_reading.py`, `tests/prompt-bar.test.mjs`,
  `tests/prompt-bar-spawn-reads.test.mjs`, `tests/prompt-bar-agents-first.test.mjs`,
  `tests/job-runner-agents-first.test.mjs`, `tests/bridge-jobs-checkout.test.mjs`,
  `tests/bridge-jobs-workfolders.test.mjs`, `tests/workflow-entries-hand-over-in-run.test.mjs`,
  `tests/workflow-entries-converse-proposals.test.mjs`, `tests/workflow-entries-endpoint-harness.test.mjs`,
  `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs`, `tests/system-uc-007-derive-use-cases-from-requirements.test.mjs`,
  `tests/system-uc-022-derive-the-architecture.test.mjs`, `tests/system-uc-026-generate-a-multi-level-test-battery.test.mjs`,
  `tests/test_identifiers.py`, `tests/identifiers-kind.test.mjs`. UC-049 step 4, UC-011 step 3, MOD-prompt-bar and
  MOD-job-runner are drafted alongside as open changes.
- `A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`, changed: named by MOD-source-register, ITM-391, ITM-392,
  ITM-417, the gate records of 2026-10-11 and 2026-10-12, and the tests `tests/test_job_reading_checkout.py`,
  `tests/source-register-checkout.test.mjs`, `tests/job-runner-checkout.test.mjs`.
- `A CLI SESSION IS TOLD AGAIN EVERY FIFTH MESSAGE TO READ AGENTS.MD`, added: no artifact names it yet. UC-049 step 4
  and MOD-prompt-bar, drafted alongside, name its behaviour.

**Origin.** github.com/akmaier, in a conversation in the prompt bar with Claude Code on 2026-11-12.
