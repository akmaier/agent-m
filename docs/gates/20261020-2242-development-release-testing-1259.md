---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 11d24121
  - https://github.com/akmaier/agent-m/pull/1259
date: 2026-10-20 22:42 UTC
---
# Development → Release testing: ITM-1160, a participant a linked source forbids

**REGISTER**

## Reason

Pull request #1259 into `sprint/team1/102` does not pass on `11d24121`. Its Outcome is not met on the plan-driven path.

1. **The plan path is not covered: a failure, fixed here.**
   - ITM-1160's Outcome is UC-024 5b, with no path named: "a participant in a place that a linked source forbids is
     offered only where the job can be done without that content".
   - 5b is an alternative of step 5, "Agent M offers, for each step, the holders of the implementing role". The steps
     are the plan's steps, which `drawPlan` offers (`select[data-participant-of]` per step).
   - On the head, the plan path's `jobContextOf` still hands `places: { sources: {}, mailbox: null }`. So a holder in a
     forbidden place is offered for every step there.
   - The places are read already (`placesOf`), within the same file, so the fix belongs in this pull request.
2. **The way back.**
   - First, a commit that holds only tests: on the plan path, with the fixture source, a holder whose place the source
     forbids is not offered for a step whose job includes that content, and the content is named. Its CI is red.
   - Then the fix: the plan path's job context carries the places `placesOf` gives.
3. **Judged, and found within the item:**
   - **The three cases that passed before the code** are the acceptance's counter-proofs:
     - a participant is offered where the job needs none of the content;
     - a participant whose place the source allows is offered as before;
     - a source that may be republished forbids no place.
     Each must hold before the code as after it.
   - **sonnet-a's readings.**
     - "Offered" means an option of `select[data-participant-of]`.
     - A job "needs the content" where `prepareJob`'s blocking finding under `RESTRICTED CONTENT GOES ONLY WHERE ITS
       SOURCE PERMITS` names it.
     - A job that cannot be prepared withholds no one.
     Each follows the item and the accepted text, and adds no rule.
4. **What was checked.** The Scrum Master read the reds from the raw logs:
   - `e8ab3259`, job 118925138494: "# fail 1", "# cancelled 0", test 44;
   - `e61f295f`, job 118926405990: "# fail 2", tests 44 and 48.
   Run 39509641516 is green on the head. The replay waits for the fixed head.
