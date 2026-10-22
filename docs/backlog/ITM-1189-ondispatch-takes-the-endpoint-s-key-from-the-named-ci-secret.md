---
id: ITM-1189
title: onDispatch takes the endpoint's key from the CI secret the input secret names
level: module
realises:
  - UC-049
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1188
tests:
  - unit
origin:
  - akmaier's request, accepted in MOD-workflow-entries at blob 7fa6a6f6 (f35b9903), 2026-10-22
---
# ITM-1189 onDispatch takes the endpoint's key from the CI secret the input secret names

**REGISTER**

## Outcome

`docs/architecture/MOD-workflow-entries.md:169-178`: on a run a hand-over started, `onDispatch` runs the job for a model
endpoint with opencode working with the endpoint the input `endpoint` names, and the key from the CI secret the input
`secret` names (MOD-agent-processes). Before the change, the key came from the participant's secret.

## Acceptance

- With the inputs `endpoint` and `secret`, the job's agent process gets the key from that secret, as ITM-1188's workflow
  hands it to the run.
- With the secret missing, the run ends `not run`, naming that secret (MOD-runtimes.md:272-273), in the line the prompt
  bar reads, `not run — <SECRET> is missing`. That holds whether the repository lacks the secret, or the workflow file
  names no such key (`AGENT_M_KEY_NAMES`; ITM-1188's decision).
  - In the second case, the run's summary also says that the job workflow names no such key, and is installed again
    from Settings. That is MOD-prompt-bar.md:232-236's "what is missing and … where it is set up".
- Counter-proof: no other secret's value is read.
- The task is still written to no file.
- The first commit holds only the tests, and CI is red on it.
