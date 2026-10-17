---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - bc15f1148420e12cf2dd6c145ccc83d097673846
  - https://github.com/akmaier/agent-m/pull/749
date: 2026-10-17 19:14 UTC
---
# Development → Release testing: ITM-813, the release tests that the bridge binds to loopback and requires its token

## Reason

ITM-813 is an item of release tests: its one commit adds only `tests/test_bridge_loopback.{py,md}` and
`tests/test_bridge_token.{py,md}`, each naming MOD-bridge-http, level release and the requirement it guards, with the
counter-proofs of TST-813001..004 recorded in the pull request. CI run 39061385628 is green on the head. On a sprint/*
base `tests.yml` runs mode=rest: its level selector, run on this head, puts both new files in `release`, and neither
appears in the Python logs, so they did not run here; they run on the sprint's pull request into main and nightly. The
Acceptance holds as read; the author, developer-sonnet-f, implemented none of src/bridge-http.
