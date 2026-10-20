---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 87c4d539025a4031a2b28409e55b10c9b475ea9a
  - https://github.com/akmaier/agent-m/pull/1225
date: 2026-10-20 17:02 UTC
---
# Development → Release testing: ITM-721, rejected — the modules view shows no table

**REGISTER**

## Reason

ITM-721 (MOD-trace-pages), pull request #1225 into `sprint/team1/100`, is rejected on `87c4d539`.

**What holds.**
- Three commits, one parent each, with the trailer `developer-sonnet-a`.
- **The red,** run 39460943537, job 118759931584 on `6c311754`: `# fail 4`, `# cancelled 0`, exactly the new tests 319 to
  322.
- CI passes on the head (run 39462206300).
- **The page loads of `#arc` and `#module`** grow from four requests to six: the stored graph's probe and one batch of
  the files it lacks. `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672-675) bounds a request's size and forbids
  a second read of a file, and these reads keep both. A sprint's agreement sets no budget, since only the SPEC binds.
- **sonnet-a's readings are kept:**
  - a requirement is in the SPEC where the graph holds it;
  - the three review statuses;
  - no *Change the architecture* or *Implement* links.

**What fails.** MOD-trace-pages.md:113 gives the view's shape as "table of modules", and the Acceptance asks that the view
"shows the table and opens a row".
- The code draws each module as an `article` with `dl` lines, to fit a phone's width.
- The red test file, "shows a table with a row for each module", was rewritten to that shape in the two code commits
  (32 lines). So the expectation of the red is changed to fit the code, against the accepted text.

**What passes on the next head.**
- The view draws a table with one row per module, and the red tests ask for it as they did.
- It fits a phone's width the way the repository's other tables do: inside `<div class="table-scroll">`
  (`src/theme/lme.css:79`; for example `src/implementation-pages/backlog.mjs:229`), focusable where it scrolls.
- The load counts of `load-per-view` and the other changes may stay. The head is gated again.
