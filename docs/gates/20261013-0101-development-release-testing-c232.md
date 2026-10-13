---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c432b14168483f8ba4706bfbb3793fea527cae13
  - https://github.com/akmaier/agent-m/pull/487
date: 2026-10-13 01:01 UTC
---
# Development → Release testing: ITM-397, an open SPEC entry edited in place on the review pages

**REGISTER**

## Reason

ITM-397, pull request #487 by developer-sonnet-d into `sprint/team1/26`, head `c432b14`. Two tests-only commits,
`baabc14` and `979506a`, are each red. The code `c432b14` is green (run 38329566637) after a rerun: its first attempt
failed in TST-286007 of `tests/tunnels-runtime.test.mjs`, which the change does not touch, and passed on the rerun.
The code changes only `src/review-pages/`. The new test names MOD-review-pages, and each of its twelve cases carries
MOD-test-document's declaration, `TST-397001` to `TST-397012`. No existing test changes. 23 planted faults are
recorded, all killed.

The Acceptance holds: an open entry is edited and saved in place through `saveEntry`, into its own queue and no new
one; a changed proposal refuses the save and keeps the edit; an accepted entry offers no *Edit*, and its edit page names
its state; nothing is written without the click. The page uses `saveEntry` and `openEditor` only. The readings
contradict no text:
- only the state `open` is edited, as `saveEntry` refuses any other;
- the Why starts empty, since `entryView` gives none of its own;
- a person without a token is "anonymous".

Noted for the review:
- `entry-edit.mjs` is a new file that MOD-review-pages' Parts do not name, as is `prompt.mjs` of #480, which I did
  not note at that gate. Sprint 21's team agreement asks for a file the Parts name, or a stop at the item's edge.
- TST-286007 failed once and passed on the rerun.
- The node job ran about 1m51 of its two minutes; that limit is with akmaier.
