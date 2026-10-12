---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 72eec269eaabd7ac6176bdf48a7064791d21fe42
  - https://github.com/akmaier/agent-m/pull/464
date: 2026-10-12 22:05 UTC
---
# Development → Release testing: ITM-400, a workflow started on the repository server

**REGISTER**

## Reason

ITM-400, pull request #464 by developer-sonnet-b into `sprint/team1/24`, head `72eec26`. The condition that does not
hold: a 422 from GitHub whose message names `workflow_dispatch` is mapped to `NotSupported` on a message text that no
source gives. GitHub's "Create a workflow dispatch event", read at the gate, documents the answer 200 with
`workflow_run_id`, `run_url` and `html_url`, and says only that a workflow "must" run on `workflow_dispatch`; it gives
no 422 and no message. The test's fake repeats a message recalled, not read (sprint 20's team agreement), and
MOD-repository-hosts' `NotSupported` is "the adapter cannot do this", which a workflow without that trigger is not. The
rework lets any 422 stay the host's own failure.

The rest was read too and stands for the rework: the tests-only commit `589f9bd` was red on its eight tests (run
38313709877), the code is green (run 38313989594), 23 faults are killed, and the request shapes are read from GitHub's
and GitLab's pages, both named; a 200 giving a run with its commit left for `listCiRuns` and a 204 giving `null`;
GitLab's pipeline as the run; an input holding a credential refused before any request; `NotSupported` without a token.
