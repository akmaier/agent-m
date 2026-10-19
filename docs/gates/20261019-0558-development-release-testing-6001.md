---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d340614ec6a954eb12c3505e8e3196ddcf98a7c6
  - https://github.com/akmaier/agent-m/pull/929
date: 2026-10-19 05:58 UTC
---
# Development → Release testing: ITM-953, the replies due are found, stored as drafts, sent as shown and noted

**REGISTER**

## Reason

ITM-953, pull request #929 into `sprint/team2/94`, passes on `d340614e`. I checked it in a clone of my own. No decision was
taken on its earlier heads, so this is its first gate.

1. **Red first.** The tests-only commit `67f2440b` is red (run 39156737708). `30eb7bac` strengthens TST-953007, which
   passed without `repliesDue` (run 39156762963, still red). On the sprint head's `src/mail-handling`, the head's
   `tests/mail-handling-replies.test.mjs` fails 17 of 17.
2. **Green.** CI run 39206796159 is green on the head, on 20 of 20 jobs, the slowest 1 min 12 s.
3. **Scope.** Against `sprint/team2/94`, the change is exactly `src/mail-handling/index.mjs`, `replies.mjs` and
   `tests/mail-handling-replies.test.mjs`.
   - The cases stand in a file of their own, as team 1's reading of §6a asks (team2/94.md).
   - `src/mail-handling/` and the test are byte for byte the same as on `4bdc08ee`, whose readings I accepted.
   - The mail-handling tests pass, 36 of 36.
4. **The accepted text (agreement 93).** The item quotes MOD-mail-handling.md:95-117 at `be10efd1`. MOD-mail-handling is
   now accepted at `579ab326` on the sprint branch and `6cd79c5f` on `main`. I compared the replies section (`RepliesDue`
   to `noReply`) in the three blobs: it is byte for byte the same. So developer-sonnet-h's reading holds.
5. **The readings accepted before stand** (reported on #929). Among them, `release` is `null`, which `Due.release: string |
   null` and "where known" admit. That no rule finds the release containing a closing pull request is a text gap for the
   review.

The head is a plain merge with `38a61696`. The sprint branch has since gained ITM-757 and ITM-1000, which touch other
files. The Scrum Master's trial merge was clean, and the merge test before the merge suffices; no new merge is asked.
