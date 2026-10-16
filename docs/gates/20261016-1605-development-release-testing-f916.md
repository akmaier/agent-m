---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 23fa8bc6e747b5adeac643d789ad1ba7b4dc9ea4
  - https://github.com/akmaier/agent-m/pull/600
date: 2026-10-16 16:05 UTC
---
# Development → Release testing: ITM-508, The specification browser gives the prompt bar its subject

**REGISTER**

## Reason

ITM-508, pull request #600 into `sprint/team1/47`, at head `23fa8bc6`. developer-sonnet-d wrote it, as `47.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `47.md`,
MOD-trace-pages, MOD-prompt-bar, MOD-site-frame, UC-049, UC-019, UC-020, ITM-506 and ITM-507.

1. **The tests-only commit is red.** `a00c2a88` was pushed alone. Run 38927847772 failed on it: node (7) shows exactly
   TST-600150–157 failing, because there was no `subject`.
   - The stub run was kept uncommitted, as the team now agrees. In it, TST-600150–156 fail on behaviour.
   - TST-600157, which checks that a subject sends nothing, passes, as it must.
   - The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38928617037, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.**
   - `src/trace-pages/flow.mjs` and a new `src/trace-pages/subject.mjs` (MOD-trace-pages), and the new
     `tests/trace-pages-subject.test.mjs`.
   - The *Change by prompt* links stay, as the cut asks. No existing test changes.
   - Under a `fetch` spy, the 74 files run give no request. Their only failures are TST-367001–003, as on the base. The
     release and system tests of UC-018, UC-019 and UC-020 pass.
4. **The tests state their values, and each fault is caught.** Nine planted faults are each caught.
5. **The Acceptance holds.**
   - On the default branch, the subject is the open requirement or group, with `change-requirements`, the person's own
     source and `draft`.
   - At a release, it is the requirement as it read there, with `converse` and no draft route.
   - Elsewhere it is the frame's default, with the version shown.

The readings quoted in the pull request are within the texts:
- the last opened requirement is the subject;
- a ref that is not the default branch is a release;
- a release has no draft route (UC-049 2a);
- the person is the instance's owner, through `personSource`;
- the key is written in the form of a fragment.

## Two findings outside the item's checks, each taken up without holding it

- **A part the module file does not name.** `subject.mjs` is a part that MOD-trace-pages' Parts do not list, and `A
  MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES` asks the file to state its parts. The part has one responsibility,
  so the file should name it rather than the code fold it into `flow.mjs`. A draft of MOD-trace-pages adds `subject.mjs`
  to its Parts, for akmaier's acceptance.
- **A copy of a function.** `accountOf` in `subject.mjs` (lines 29–35) copies the private `accountOf` of
  `src/review-pages/requirements-prompt.mjs` (lines 38–44) line for line. MOD-trace-pages may not import MOD-review-pages,
  and AGENTS.md §2 asks for nothing twice. A draft gives MOD-source-register, which owns `personSource`, the function
  `personAccount`, and ITM-552 moves both callers to it once the draft is accepted.

  Holding #600 until then would keep a correct subject out of the sprint for a duplicate of seven lines that the
  follow-up removes. ITM-507 is told to reuse the review pages' own `accountOf`, and not to make a third copy.
