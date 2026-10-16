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

## Acceptance

- A fixture pull request with a description and one without give `body` as written and `""`, on both servers.
- Each test states its expected values in its own text.
