---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7de03a6933ca0b6268b9af54dc0db0edad86b004
  - https://github.com/akmaier/agent-m/pull/1255
date: 2026-10-20 22:23 UTC
---
# Development → Release testing: ITM-582, an issue is analysed and its class confirmed, corrected or the issue rejected

**REGISTER**

## Reason

ITM-582, pull request #1255 into `sprint/team2/100`, passes on `7de03a69`. CI is green on 23 of 23 checks.

1. **The reading.** The description names one passage each of AGENTS.md §2 ("Designing"), SPEC.md's `AN IMPLEMENTATION JOB
   BEGINS WITH A FAILING TEST`, and chapters 9, 11, 12 and 13, each tied to a decision of the change.
2. **Red first, on CI.** The tests-only commit `5df59601` was pushed by itself, and GitHub ran it. It failed in 4 of 23
   checks. Read from the full job logs, through the jobs API:
   - node (11): the five `analyse-issue` cases;
   - node (9): the five `confirmClass` and `IssueClass` cases;
   - node (10): the nine `issue-context` cases;
   - node (4): the ten cases of the routes `issues` and `issue`.

   Every failure is this item's new tests. node (4)'s `TST-905034` and the like are `# TODO` findings, not failures.
3. **Every declared level.** ITM-582 declares `unit` and `component`:
   - `issue-handling-confirm-class` and `issue-handling-issue-context` are unit;
   - `job-catalogue-analyse-issue` and `maintenance-pages-issues` are component.
4. **Scope.** ITM-582's modules are MOD-issue-handling, MOD-maintenance-pages and MOD-job-catalogue.
   - The changes are in `src/issue-handling/` and `src/maintenance-pages/`: `issues.mjs`, `index.mjs`, and `mail.mjs`,
     which only exports its DOM helpers for `issues.mjs`, one copy and not two.
   - The other change is `src/job-catalogue/kinds/analyse-issue/prompt.md`, a missing requirement being a change, as
     MOD-issue-handling's `IssueClass` states.
   - Each new test names one of these modules.
5. **f's readings follow the texts:**
   - the route's form is `#issue/number=<n>`, as the frame's `routeOf` reads a fragment's parameters;
   - the product is the one the frame has chosen;
   - requirement names are searched for in the issue's text and comments, and a name the product does not hold gives no
     part;
   - these routes give no prompt-bar subject. MOD-maintenance-pages gives the issues' routes "the issue as the page", and
     that is their next step, not this item's.
6. **The release runs on the head:** traceability 8 of 8, and 14 Python checks with 84 cases OK.
7. **Found outside the item, and registered:**
   - **ITM-1166.** `mail.mjs:250` and `:386` (ITM-963's) link `#issue/<n>`. The frame reads no parameter in that, so
     the links cannot reach the new route. It is the defect ITM-1108 fixed on the replies page.
   - **ITM-1167.** `onRecordsChanged — no secret value in any commit` (`tests/workflow-entries-job-workflow.test.mjs:327`)
     matches git's English words. It fails on `main` on this German-language machine, and passes with `LC_ALL=C`. It is
     no fault of this item.
