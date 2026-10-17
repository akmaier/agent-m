---
id: ITM-621
title: A GitlabCiNotList message for a plain-string entry says its own case
level: module
realises:
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-runtimes
builds_on:
  - ITM-604
tests:
  - unit
origin:
  - ITM-604's gate (docs/gates/20261016-2328-development-release-testing-b89e.md)
---
# ITM-621 A GitlabCiNotList message for a plain-string entry says its own case

**REGISTER**

## Outcome

An entry of `include:` that names `.gitlab/agent-m-jobs.yml` as a plain string (`src/runtimes/ci.mjs:162`) ends its
message with the sentence of an `include:` that is not a list. That sentence does not fit, because the `include:` is a
list. The entry is a string, which cannot carry the inputs.

The message ends instead: "Agent M passes its inputs only through an entry written with local: and inputs:, and
rewrites no line of the product's own — write the entry so, then install again."

**Existing test whose expected result changes:** TST-604003 (`tests/runtimes-gitlab-ci-merge.test.mjs`), which pins
today's ending.

**The grep of what changes** (sprint 58's agreement), read at sprint team1/60's start. "plain string, which cannot pass the
inputs on" and the include ending are found in `tests/runtimes-gitlab-ci-merge.test.mjs`:
- `:220` and `:224` are TST-604003, named above;
- `:182` and `:191` are the include ending's constant and TST-604001's comment, which stay for the include cases.

No other test, release tests included, holds either text.

## Acceptance

- The plain-string entry's message ends with its own sentence, and a test states the whole message.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
