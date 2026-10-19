---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9f87203a1224d3a02413a5224dbebc2f461ef3aa
  - https://github.com/akmaier/agent-m/pull/1155
date: 2026-10-19 20:17 UTC
---
# Development → Release testing: ITM-1102, an issue names when it was opened and closed

**REGISTER**

## Reason

ITM-1102, pull request #1155 into `sprint/team2/97`, passes on `9f87203a`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `ddafc4a1` holds only tests, and CI run 39316185446 failed on it.
2. **The accepted text** (`2dc885e2`, accepted `0d5c747a`).
   - Both adapters give `Issue.opened` and `Issue.closed`.
   - `sprint-facts` lists the issues with `state: "all"`, and takes those whose dates fall within the sprint, by day.
3. **Callers and the tests that pin them** (agreements 92 and 95). TST-618003, and the fixtures of `repository-hosts-issues` and
   `repository-hosts-create-issue`, which pin the whole `Issue`, gain the two fields. None is a release test.
4. **The planted fault not caught.** `issues: []` handed to `sprintFacts` changes no output, because `sprintFacts`' result
   (MOD-work-plans.md:179-186) names no issue. The recipe gives the issues as parts of their own, and those are tested.
5. **Run here.** The merge of #1155 with #1157 on the sprint branch passes these tests, 442 of 442:
   - the mail-handling, repository-hosts, work-plans, mail-records and maintenance-pages tests;
   - `test_mail_*`.
