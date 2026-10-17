---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2c38edee59aae6104e5daa8ff96c67ef002a352c
  - https://github.com/akmaier/agent-m/pull/786
date: 2026-10-17 21:41 UTC
---
# Development → Release testing: ITM-837, the Graph route keeps a reply draft and sends only the mail shown

**REGISTER**

## Reason

This is ITM-837, pull request #786 into `sprint/team2/79`, at head `2c38edee`.

**The tests came first.** The tests-only commit `a574cf25` was red: CI node (6) failed, and 0 of 6 tests pass there in
my clone. CI is green on the last two commits, and 78 of 78 `mail-routes` tests pass locally.

**The scope holds.** Only `src/mail-routes/` and the new test `tests/mail-routes-graph-draft.test.mjs` changed. The
three fixture changes after the tests-only commit change no expected result: the base64 body, the decoded path and the
subject edit.

**The faults planted in the head were caught, except one.**
- Caught: the SHA comparison, the mark check of updateDraft, a second To address and a dropped In-Reply-To.
- Not caught: the mark check of sendDraft is untested. That is not a condition, because the accepted text does not ask
  for the mark.

**The send gap meets the accepted text as it is written.** sendDraft hashes the bytes and then sends in a second request.
MOD-mail-routes says the provider sends and the SHA-256 is compared before the send, which is exactly this.

**Open, for the sprint review and the module file's owner:**
- whether the Graph route should close the window between hash and send;
- one error for a missing or foreign draft on both routes: DraftChanged here, FolderNotFound on the Bridge route.
