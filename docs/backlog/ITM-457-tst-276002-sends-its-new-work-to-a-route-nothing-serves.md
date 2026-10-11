---
id: ITM-457
title: TST-276002 sends its new work to a route nothing serves
level: subsystem
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-276
tests:
  - component
origin:
  - ITM-326, #430
  - tests/desktop-shell.test.mjs, TST-276002
---
# ITM-457 TST-276002 sends its new work to a route nothing serves

**REGISTER**

## Outcome

TST-276002 in `tests/desktop-shell.test.mjs` tests that pausing the Bridge refuses new work, that resuming restores
the server's own refusal, and that Quit stops the server. Its new work is a request to `POST /v1/probes/agent`, which
no handler served, so the refusal it expects after resuming is `not-found` (404). MOD-bridge-jobs gives that route a
handler (ITM-326). The test's new work goes instead to a route of the Bridge's API that no handler serves, so that it
states what it tests whichever routes the Bridge's handlers serve; its expected results — 503 while paused, 404 after
resuming, and the server stopped after Quit — stay as they are. It changes how the test prepares its fixture, nothing
else, and adds no behaviour.

## Acceptance

- Only TST-276002's request in `tests/desktop-shell.test.mjs` changes, to a route no handler of the Bridge serves; no
  expected result changes, and no other test or file changes.
- CI is green on the item's commit, and on that commit merged with ITM-326's code as #430 has it without its change of
  this test.
- The pull request records counter-proofs: a pause that does not refuse new work, and a resume that does not restore the
  server's refusal, each failing TST-276002 with the new route.
- Since the item adds no behaviour, its first commit need not be red.
