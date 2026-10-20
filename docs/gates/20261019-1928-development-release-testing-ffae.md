---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - e5762e6a616ae84245b0cdb1d066b944a6fd217a
  - https://github.com/akmaier/agent-m/pull/1138
date: 2026-10-19 19:28 UTC
---
# Development → Release testing: ITM-1026, a participant drafts the question to a reporter

**REGISTER**

## Reason

ITM-1026, pull request #1138 into `sprint/team2/97`, passes on `e5762e6a`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `ba57621b` holds only tests, and CI failed on it.
2. **The accepted text** (`48002942`):
   - MOD-job-catalogue.md:107: `draft-replies` with the parameter `question`. The kind's purpose names it, read from the
     purpose as `source` is.
   - MOD-mail-handling.md:126-129: `reply-inputs` with `question` gives three parts — the open issue, the person's point,
     and the one listed mail the question answers.
   - MOD-maintenance-pages.md:121-123: *Draft question* is on the page.
   h planted 9 faults.
3. **Scope.** The three modules' files and tests, as the item names.
