---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 94130c6b6d223b1533d7f95853471709cf342149
  - https://github.com/akmaier/agent-m/pull/750
date: 2026-10-17 19:14 UTC
---
# Development → Release testing: ITM-815, the release test that the installed agents are found and run with their own login

## Reason

ITM-815 is an item of release tests and adds no behaviour, so no red first commit is required. CI is green on the head
(run 39061405785); tests.yml leaves out files of level release on a pull request into a sprint's branch, so the new
`tests/test_bridge_agents.py` did not run there — it runs in the sprint's pull request into main and nightly. Only
`tests/test_bridge_agents.py` and its data file `tests/test_bridge_agents.md` change, as the item says. TST-815001 and
TST-815002 name the requirements they guard, MOD-agent-processes and level release, with five counter-proofs recorded;
the Acceptance holds as far as reading the change shows.
