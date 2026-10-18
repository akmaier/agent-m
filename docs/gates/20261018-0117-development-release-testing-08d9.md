---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5f847a7b048cfc01e10794aa88624353df83c61e
  - https://github.com/akmaier/agent-m/pull/831
date: 2026-10-18 01:17 UTC
---
# Development → Release testing: ITM-869, a token stored on the setup page is used by the next page

**REGISTER**

## Reason

ITM-869, pull request #831 into `sprint/team1/83`, at head `5f847a7b`. Run 39085645126 passed all twelve jobs. It changes
`src/site-frame/index.mjs` and `routing.mjs` and adds a test file, +204/−6.

**Red, then code.** The tests-only commit `e5def415` was red in run 39085257159 on exactly TST-869001, 002, 003 and 005:
- the stored token sent by the next page;
- a replaced token;
- a cleared token not sent;
- a secret stored after the page started, refused.

TST-869004 and 006 pass on the base, as they should.

**The acceptance is met.**
- `instanceHostFollowingStore` reads the stored token and `secretValues(store)` at each host call. It connects again with
  the token, its name and `secrets: secretValues(store)` when either has changed.
- `startSite` hands it to every route, and to the notifications, the prompt bar and the token notices.
- After a token is stored on *Finish setting up*, the next page's requests carry it.
- **Sprint 81's agreement:** the host carries every option of the frame's connection, and TST-869004 and 005 show it refuses
  a stored secret.
- Three planted faults are caught.
- The 728 tests of MOD-site-frame and MOD-settings-pages pass, and no existing test changed, as the start expected.
- ITM-018 passes.

**The reading accepted.** "The stored secrets" are those stored at the moment of the call, so a secret stored after the page
started is refused too. That is `NO SECRET IN THE REPOSITORY` read as it says.

**Findings.**
- A GitLab-form token imported under `github-token` would make `connect` throw inside a host call. This is noted in ITM-870,
  which checks the import.
- `release-itm-290` cannot run locally, a known environment gap.
