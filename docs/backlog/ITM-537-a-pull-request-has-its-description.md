---
id: ITM-537
title: A pull request has its description
level: module
realises:
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - the gate of #583 (ITM-498, sprint team1/43)
  - MOD-repository-hosts, Interfaces: PullRequest — drafted on main for akmaier's acceptance with `body`
---
# ITM-537 A pull request has its description

**REGISTER**

## Outcome

MOD-repository-hosts' `PullRequest` carries `body`, its description, `""` where it has none, on GitHub and GitLab, in
`listPullRequests` and `pullRequestFacts`. It builds against the draft of MOD-repository-hosts' file committed with
#583's gate, once akmaier has accepted it. Until then it does not start.

The draft was accepted with `90ed6d66` (`docs/approvals/MOD-repository-hosts-7fcc2c1d83eb.md`).

**Existing tests whose expected result changes.** These assert a whole `PullRequest` with `deepEqual`, found by
grepping `tests/` for `{ number: <n>, title:`, all in `tests/repository-hosts-pull-requests.test.mjs`:
- TST-472552 (line 129) and TST-472554 (line 173), on GitHub;
- TST-472556 (line 247) and TST-472557 (line 265), on GitLab.

Each gains `body`. The same grep's fifth hit, in `tests/workflow-entries-hand-over.test.mjs:137`, is a fixture's answer,
not an expected result.

## Acceptance

- A fixture pull request with a description and one without give `body` as written and `""`, on both servers.
- Each test states its expected values in its own text.
