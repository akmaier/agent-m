---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1839cbc7ed59c9724f55f5662e5af8d728bf3040
  - https://github.com/akmaier/agent-m/pull/781
date: 2026-10-17 21:30 UTC
---
# Development → Release testing: ITM-830, the SPEC entry page reads its files in one batch

**REGISTER**

## Reason

ITM-830, pull request #781 into `sprint/team1/77`, at head `1839cbc7`. That head is #785, the release file, merged onto
developer-sonnet-d's `d14fd1f6`. #781's checks passed ten of ten, and #785's run 39070870738 on an equal tree passed ten of
ten. The diff against the sprint branch is three files, +29/−23.

**Red, then code.** The tests-only commit `0e02bdda` was red in run 39070305802 on exactly TST-479101, 479103 and 479104. Their
changed values were accepted at the draft stop and fixed before the red. The code was pushed after the run had ended.

**The acceptance is met.**
- `queueService.view` reads the entry's files, the proposal, the rationale and the register through one
  `Snapshot.readMany` before `entryView`.
- `sourcesOf` has no read-ahead, as decided at the draft stop (ITM-844).
- `#spec/<queue>/01` with a token goes from 11 requests to 6 at this repository's size. Without a token it stays at 121.
- No file is read twice, and no other route's count rises. The 49 files of MOD-review-pages change nothing else.

**The release changes are accepted.** #785, written by developer-sonnet-b, who built none of this item:
- TST-479201 allows at most 17 queries, with its 22-request bound kept;
- TST-479202 allows 14 to 17.

The test's own title and `expect:` lines now state the same bounds. That follows `A TEST STATES ITS EXPECTED RESULT BEFORE IT
RUNS`, and is accepted. The file passes 4 of 4, and ITM-018 passes.

**Process.** Two small file edits were scripted in a Python heredoc rather than made with the Edit tool. That goes to the
feedback. The diffs were read after each.
