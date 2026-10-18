---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6f34f160291aa9acbe03206c34797f327eef1504
  - https://github.com/akmaier/agent-m/pull/839
date: 2026-10-18 05:12 UTC
---
# Development → Release testing: ITM-862, the notifications' host keeps its memory while the token is unchanged

**REGISTER**

## Reason

ITM-862 (MOD-site-frame, a test only), pull request #839 into `sprint/team1/86`, passes on `6f34f160`.
**One limitation: its counter-proof is unproven.**

1. Only one file changed: `tests/site-frame-notifications-kept-memory.test.mjs` (TST-862001). It names MOD-site-frame,
   `level: component` and the requirement it guards, and states its expected results in its own text. An item that only
   adds a test of existing behaviour adds no behaviour, so its first commit need not be red.
2. CI run 39090693187 passed all twelve jobs.
3. **The Acceptance's first line holds.** "Over two checks with the same token, a blob read in the first is not read
   again in the second, and the test pins it." I ran the file on `main`, a copy of the head's file, removed afterwards.
   The queue's `index.md` was read 0 times before the checks, 1 after the first and 1 after the second. The first check
   made 5 requests and the second 3, so the second check ran. The test asserts exactly that:
   - :120, the first check reads it once (the known positive);
   - :121, the second check makes requests of its own;
   - :122, the two together read it once.
   This is `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672): "a file whose blob the page has read already is
   not read again".
4. **The Acceptance's second line is unproven:** "The test fails against a host that reconnects on every call".
   - The counter-proof puts `if (true) {` at `src/site-frame/dashboard-app.mjs:535`. The session's classifier refused
     its run twice ("Security Test Removal"). Nobody worked around the refusal.
   - So the test has not been seen red. It could be green against a host that loses its memory.
   - akmaier, as relayed by scrum-master-opus, accepts merging the test without its counter-proof ("I think at this case
     it is OK not to have a test"; "this is the only way that the sprint can be concluded").
   - On that acceptance this gate passes with the limitation recorded. It is the Acceptance's owner's decision, not a
     reading of the line. The counter-proof stays owed: it is run once the classifier, or akmaier, allows a planted fault
     in `src/`.
5. TST-854001 and TST-854003 (`tests/site-frame-notifications-cleared-token.test.mjs`) are unchanged.
6. **Release tests.** The developer's local run: 156 tests, 148 passed, 3 failed and 5 todo. The failures:
   - TST-290115 (an Electron lock);
   - release-sprint-16 (a `ReferenceError` under local Node v26);
   - release-uc-003 (`imapflow` not installed).
   None loads the one file the item adds, so none can be changed by it. CI's green run on the merge decides.
