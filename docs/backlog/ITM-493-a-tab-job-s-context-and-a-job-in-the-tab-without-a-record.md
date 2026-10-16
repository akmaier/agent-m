---
id: ITM-493
title: A tab job's context, and a job in the tab without a record
level: module
realises:
  - UC-049
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: tabContext, runOnTab
---
# ITM-493 A tab job's context, and a job in the tab without a record

**REGISTER**

## Outcome

MOD-runtimes' `tabContext` builds the `JobContext` of a job that runs in this tab from what its caller has read,
making no request; `runOnTab` takes `record: null` for a conversation of the prompt bar and then appends nothing
anywhere.

What the module file leaves unstated, and what is built:
- **`connect`.** It "opens a repository with the browser's tokens", but MOD-runtimes uses neither MOD-browser-store nor
  MOD-repository-hosts' `connect`. Its caller has connected the hosts already, as the review pages do today
  (`src/review-pages/jobs.mjs`: `connect: async () => host`). So `tabContext`'s `connect(address)` gives the product's
  host for the product's address and the instance's host for the instance's, and `null` for any other address. It makes
  no request.
- **`runOnTab` with `record: null`.** The job is attended, and a gate reached or an end is appended nowhere; the host is
  not asked for anything. With a record, everything stays as today.

No existing test's expected result changes, release tests included. Every call of `runOnTab` in
`tests/runtimes-tab.test.mjs`, `src/review-pages/jobs.mjs` and `src/review-pages/prompt.mjs` passes a record.

## Acceptance

- `tabContext` gives the context its module file states, `instance.checkout` `null`, with no request made.
- `runOnTab` with `record: null` runs a fixture job to its result and writes nothing; with a record it appends as
  before.
- The first commit holds only the tests, and CI is red on it. If it fails only because a function does not exist yet, the
  Developer runs it once locally against an uncommitted stub and lists the tests that fail on behaviour.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
