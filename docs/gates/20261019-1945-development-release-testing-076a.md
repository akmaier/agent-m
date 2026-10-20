---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 50829487c35674f439524c7ec18eb77c6589894e
  - https://github.com/akmaier/agent-m/pull/1144
date: 2026-10-19 19:45 UTC
---
# Development → Release testing: ITM-1106, the maintenance pages' "Close and reply" test holds under load

**REGISTER**

## Reason

ITM-1106, pull request #1144 into `sprint/team2/97`, passes on `50829487`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `ceef6b9b` holds the old wait and an 80 ms `stateDelay` in the fake server, and CI failed on it. That makes
   the flake happen every time.
2. **The cause, as a data-flow path** (replies.mjs:102, :340, :359).
   - The test waited for the `reply-draft` block, which issue 9 already had before the click.
   - So it read the state before the PATCH, and the redraw had come back.
3. **The fix is in the tests only.** The test waits for exactly what it asserts next, and `world()` gains `stateDelay`, 0 by
   default. 20 runs in a row are green under load.
4. **The reading.** h first skipped the chapter reading. h has since read chapters 9, 11, 12 and 13 in full, and the pull
   request names a passage of each.
