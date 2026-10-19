---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 877b96c68c8fa31ea3403b2f5dd69ec560f95387
  - https://github.com/akmaier/agent-m/pull/1117
date: 2026-10-19 17:44 UTC
---
# Development → Release testing: ITM-1050, the Bridge's Agents view checks again for a newly installed agent

**REGISTER**

## Reason

ITM-1050, pull request #1117 into `sprint/team2/97`, passes on `877b96c6`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `f10a3f51` holds only the test, and CI failed on it. The later tests-only commit `877b96c6` waits for the
   redraw, and asserts nothing new.
2. **The accepted text.** MOD-desktop-shell.md:166-170: the *Agents* view has *Check again*.
   - The button draws the view again, which reads the installed agents anew. An agent installed meanwhile is then listed
     without the Bridge restarting (UC-044 3a).
   - The test puts a fixture Codex on the PATH after the first reading, and finds it listed after the press.
   - i gives 4 planted faults.
3. **Scope.** `src/desktop-shell/window.mjs` and the test.
4. **Noted for ITM-1051.** The view shows the explanation `bridge-pairing`, not one of its own. ITM-1051, i's next item,
   gives each view its own explanation.
