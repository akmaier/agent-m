---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 75b922d12cf293f508b81021fc277bcc2c0cba2a
  - https://github.com/akmaier/agent-m/pull/976
date: 2026-10-19 07:35 UTC
---
# Development → Release testing: ITM-1066, the tests' copies of the fixture DOM give way to the helpers

**REGISTER**

## Reason

ITM-1066 (MOD-markdown-render), pull request #976 into `sprint/team1/93`, passes on `75b922d1` as refactoring. It replaces
#974, rejected for a merge without its trailer.

1. **It is one commit,** `75b922d1`, on `663a2b58` (the sprint branch with ITM-1012), with the trailer
   `developer-sonnet-a`, and no merge.
2. **It is #974's change.** Both commits change the same nine files by the same 70 lines added and 1,095 removed, and
   merge-tree gives the same tree (`8ab48d66`).
3. **What it does:**
   - `tests/site-frame-dom.mjs` imports the renderer's helper and adds focus and `dataset`;
   - the copies in five test files give way to the helpers, and the review harness keeps its trusted `dispatchEvent` as one
     method;
   - three files' comments now name the file that holds the DOM.
4. **The results are the same.** The developer reports 796 passing tests over 91 importers, with the release files not
   edited. CI run 39216554889 passes all twenty jobs.
