---
id: ITM-938
title: A wait that runs out names its last real error
level: unit
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-site-frame
builds_on:
  - ITM-935
tests:
  - unit
origin:
  - ITM-935's cause analysis (sprint team1/91), by developer-sonnet-e
---
# ITM-938 A wait that runs out names its last real error

**REGISTER**

## Outcome

**Found at ITM-935 (sprint team1/91, developer-sonnet-e).** When a wait of the look and accessibility checks runs out:
- `until` (`tests/site-usability.d/browser.mjs`) reports "deadline" as its last error and replaces the error the last
  attempt really gave;
- the Electron child's stderr is never printed.
So the CI logs of ITM-924's, ITM-930's and ITM-935's failures did not show their real cause. Each had to be measured anew.

## Acceptance

- A wait that runs out names the last real error of its attempts, and a failed check prints the tail of the Electron
  child's stderr. A test with a fake attempt that throws a named error, then runs out, finds that name in the failure, with
  a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
