---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 4c86337aa8a9b8cc0e0820889c0e03ea505fff00
  - https://github.com/akmaier/agent-m/pull/1175
date: 2026-10-19 22:34 UTC
---
# Development → Release testing: ITM-1133, the check tests/test_single_definition.py

**REGISTER**

## Reason

ITM-1133, pull request #1175 into `sprint/team2/97`, is rejected on `4c86337a`. This is its first rejection. CI is green,
the files are new, f's planted faults are named, and f implemented neither MOD-job-catalogue nor the Bridge's build.

**TST-1133005 records a finding that the SPEC does not make.**
- SPEC.md:440-444, ONE DEFINITION, THREE DRIVERS: "The prompts, schemas and job definitions exist exactly once, as data in
  the repository; the browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
  *Check:* … no prompt or schema text appears in more than one place."
- The requirement's subject is the definition: each prompt, schema and job definition exists once, and the drivers hold no
  copy of it. "Prompt or schema text" in its Check is a prompt's or a schema's text, which is that definition.
- TST-1133005 reads it as any line of 50 characters or more. That splits the text into units of f's own size, and then
  counts a sentence that two *different* prompts share, such as "The task, where one is given, …", as a prompt appearing
  in two places. That adds words the sentence does not contain (AGENTS.md §6a.7).
- Two prompts that share a sentence are still two prompts, each existing once. The test's own TST-1133001 already finds
  any copy in a driver, and TST-1133002 finds any job definition that exists twice.
- An `expectedFailure` stands as a finding that someone must act on, so this one would ask for an item, or a SPEC change,
  that nothing calls for.

**What changes.** TST-1133005 asks whether a prompt's, a schema's or a job definition's text, as a whole, appears in a
second file of the repository, data files included. Then it passes, its `expectedFailure` goes, and a fault that
copies one prompt file to a second path fails it. The 50-character floor of TST-1133001 stays: it is how a driver's copy
of a part of a prompt is found, and the reading is named.

**Accepted as named:** a place is a file; and "the build imports the dashboard's modules" is read through the staged
folders, without running the build.
