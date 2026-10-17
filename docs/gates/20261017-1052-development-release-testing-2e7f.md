---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ebd0be4499149f22f917e03d6d7d356c38c57898
  - https://github.com/akmaier/agent-m/pull/722
date: 2026-10-17 10:52 UTC
---
# Development → Release testing: ITM-611, A section edit's fallback pages say which file changed since the edit began

**REGISTER**

## Reason

ITM-611, pull request #722 into `sprint/team1/71`, at head `ebd0be44`. developer-sonnet-a wrote it.

**What holds.**
- **Red.** Run 39025620207 on `fa2d707b` has 11 failures: TST-611001 to 611011. The draft run then found two test files
  whose fake hosts did not answer the head commit. Their setup was fixed and run red again: run 39026117827 on
  `c4506865`, with the same 11 and no expected value changed (sprint 56's agreement).
- **CI and merging.** CI is green, ten of ten in run 39026297792, and the pull request is mergeable.
- **The code** (`propose.mjs`): on the path without a token, `existing` is whether the file was held at `openedHead`,
  and `fallbackEditLinks` is unchanged. The three callers pass `snapshot.commit`.
- **Other checks.**
  - Three planted faults are caught.
  - The UC-019 table is identical.
  - The release files are unchanged.
  - The fetch spy saw no call, and ITM-018 passes.
- **TST-592001, 592002 and the wording test, not named, are accepted.** Only their fake host's answer for the head commit
  changed, and their expected values did not. The draft run found them, as sprint 64's agreement intends.
- **The reading** that `differs` compares existence is the accepted text: "whether its file exists on the default branch
  otherwise than at `openedHead`".

**Rejected: the reads without a token, against sprints 66 and 69.**
- Without a token, GitHub allows 60 requests an hour, and the committed test shows 2 more per click: 7 → 9 and 9 → 11.
- In the common case the edit was opened on the head the save has just read, so `openedHead` is that snapshot's commit,
  and the 2 requests read again what is held.
- `requirements-draft.mjs` calls `proposeSection` once per section, so a draft of N sections costs 2N more. That is the
  growth per click these gates have refused.
- **The fix is the item's own, and needs no draft.** When `openedHead` is the commit of the snapshot the save already
  read, that snapshot's paths are used and nothing is read. The interface's text says what `existing` means, not how it
  is read.
- The finding the developer gave belongs here too. A `snapshot.commit` of `null`, an empty repository, would make
  `readSnapshot(null)` throw on this path. An edit opened on an empty repository held no file, so `existing` is false for
  every file and nothing is read.

**What is asked, in new commits, nothing rewritten.**
1. Without a token, `proposeSection` and `saveEntry` read no snapshot when `openedHead` is the commit of the snapshot
   they read, and none when `openedHead` is `null`.
2. TST-611009 and 611010 count 7 and 9 again for an edit opened on the current head, and 9 and 11 for one opened on an
   earlier commit.
3. A test for `openedHead` `null`: every file is not existing, and nothing is read.
4. Each changed test runs red against the head's code first (sprint 56's agreement).

**What stays.** With the head moved since the edit opened, a draft of N sections still costs 2N more. That is rare and
bounded by the draft, and a cache of snapshots across calls would be a change of MOD-repository-hosts' text, not asked
here.
