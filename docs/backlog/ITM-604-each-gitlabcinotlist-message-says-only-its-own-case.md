---
id: ITM-604
title: Each GitlabCiNotList message says only its own case
level: module
realises:
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-runtimes
builds_on:
  - ITM-548
tests:
  - unit
origin:
  - ITM-548's gate (docs/gates/20261016-2000-development-release-testing-7bd2.md), moved out of ITM-567 at sprint team1/54 so that each item holds one responsibility
---
# ITM-604 Each GitlabCiNotList message says only its own case

**REGISTER**

## Outcome

`notAList` (`src/runtimes/ci.mjs:89`) ends every `GitlabCiNotList` message with the same sentence: "Agent M adds its
entry only to an include: that is a list, and rewrites no line of the product's own — make it a list, then install
again." That sentence fits an `include:` that is not a list. It does not fit an inline `inputs:`, of the `spec:` header
or of the entry.

Each message ends with the sentence of its own case:
- for an `include:`, the sentence as it stands;
- for an inline `inputs:`, "Agent M adds its inputs only to an inputs: written as a block, and rewrites no line of the
  product's own — write it as a block, then install again."

**Existing tests.** The tests were grepped for `GitlabCiNotList`. Both tests in
`tests/runtimes-gitlab-ci-merge.test.mjs` hold, since they match the file's name (`:144`) or the message's beginning
(`:176`).

## Acceptance

- Each message names its own case and no other. A test states each whole message.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
