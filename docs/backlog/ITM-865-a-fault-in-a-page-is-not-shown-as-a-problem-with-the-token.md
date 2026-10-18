---
id: ITM-865
title: A fault in a page is not shown as a problem with the token
level: unit
realises:
  - UC-008
  - UC-020
modules:
  - MOD-site-frame
builds_on:
  - ITM-861
tests:
  - unit
origin:
  - ITM-861's pull request #820 (sprint team1/81), from developer-sonnet-d's finding
---
# ITM-865 A fault in a page is not shown as a problem with the token

**REGISTER**

## Outcome

Any error thrown while a page draws, such as ITM-861's `ReferenceError`, reaches the person as a read problem. It shows the
error's text and the step to store a token. That sends the person to their token for a fault in the code.

No SPEC sentence names what a page's own fault shows. UC-008 1a and UC-020 2a name what a failed read shows: that the
repository is private or does not exist, and the step to store a token. A fault of the code is neither. The frame's `readProblem` and the way `startSite` hands a page's error to it are read against it. A test then throws a
non-host error in a route and asserts that the page names a fault of the page, not the token.

## Acceptance

- A page's own error is shown as a fault of the page, and a host's failure as `readProblem` gives it today, with tests and
  their counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
