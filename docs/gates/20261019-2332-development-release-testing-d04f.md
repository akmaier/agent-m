---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d884243f871594fc5ce6a42d63deed6e02a02feb
  - https://github.com/akmaier/agent-m/pull/1183
date: 2026-10-19 23:32 UTC
---
# Development → Release testing: ITM-1134, the check tests/test_runtime_levels.py

**REGISTER**

## Reason

ITM-1134, pull request #1183 into `sprint/team2/97`, passes on `d884243f`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** The file covers the Check sentences of SPEC.md:532, :538 and :774. The red evidence is 6
   planted faults.
   - I repeated one: the generated workflow's checkout token set to `github.token` in place of the person's secret
     (`src/runtimes/workflow/github.yml:46`) fails a case.
2. **The writer.** developer-sonnet-g implemented nothing in `src/runtimes`.
3. **g's reading, accepted.** The SPEC names no tool that fails a workflow file holding a key or token. So the check of the
   generated files lives in the test, which is the place SPEC.md:538 and :774 name.
4. **To merge:** the move of the file in TST-513201 and TST-513202, in a commit of its own, made by developer-sonnet-h, who
   did not implement ITM-1134.
