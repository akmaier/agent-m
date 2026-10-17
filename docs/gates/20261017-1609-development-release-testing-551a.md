---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 19c3444287e20618352e1bfc3455e749cbc1d7ca
  - https://github.com/akmaier/agent-m/pull/735
date: 2026-10-17 16:09 UTC
---
# Development → Release testing: ITM-680, the review views of the live page are the review pages' routes

**REGISTER**

## Reason

ITM-680, pull request #735 into `sprint/team1/73`, at head `19c34442`, with ITM-715's #736 merged in. #735's checks passed
ten of ten. #736's run 39047704323 on `a1f2de39`, whose tree is the head's, ran in mode=all, and each of its eight node
logs ends with `# fail 0`. The diff against `main` is 65 files, +2094/−2582.

**What holds.**
- **The three conditions of `73.md` (16:00 UTC) are met.**
  - ITM-715 is merged.
  - The five release files pass whole: 34+2 todo, 18+1 todo, 8, 5 and 1. A4's todo went and is named.
  - mode=all covers the head.
- **The L cases are fixed, each with its test:**
  - a person's click (TST-680201 to 680208);
  - Save for decisions and modules (TST-680209);
  - the no-token edit (TST-358004, 397008);
  - showing the item again after Save;
  - the component diagram (TST-680210);
  - row 15;
  - the token step's address.
- **Red.** TST-680210's red is now on CI: run 39045311581, node (5), `not ok 48`. Row 15's assertion has no tests-only
  commit with the fixed harness and the old code, so its red is local only. That is accepted and named here.
- **The counts**, as measured in round 2:
  - `lastAcceptedText` costs 2R+4 requests per changed file (`#uc/UC-042` 5 → 14);
  - without a token, `#spec/<queue>/01` goes 117 → 121, each read named;
  - the head and `SPEC.md` are read once per acceptance;
  - one repository read per load on `#uc`, `#arc` and `#review/uc`.
- **The behaviour differences** in the pull request body are asked for by no sentence of UC-006, UC-008 or
  MOD-review-pages' text:
  - the use-case list's README overview and its Area and Realises columns;
  - accepted queues on `#spec`;
  - the read problem on an unreadable page;
  - a dependent entry's impact;
  - the uncoloured badges until ITM-700;
  - "Accept all N";
  - the approved entry without an Actions link.
- **Modules.** `tests/uc-019-prompt-bar-harness.mjs` names MOD-prompt-bar, MOD-job-runner and MOD-runtimes as well, so
  they join ITM-680's modules for that helper. No code of theirs changes, and no item of Team 2 holds them.

**What is missing: the app calls a part of MOD-trace-pages that is no interface.**
- `src/site-frame/dashboard-app.mjs:51` reads `import { componentDiagram } from "../trace-pages/diagram.mjs"`.
- MOD-trace-pages provides only `view`: its file's `provides:` list, and `src/trace-pages/index.mjs:8`.
- The app's other new module import, MOD-review-pages' `view`, goes through the module's index, and `main`'s app has no
  such import. So this is the one new call past a module's interface. Sprint 60's agreement reads: "name the interface
  in the Uses, or wait for a draft".

## What the rework does

- `#arc` draws the component diagram through MOD-trace-pages' `view`, the route that draws it today, mounted for `#arc`
  as the app mounts it for `#spec`. TST-680210 and release-sprint-04's five cases keep their expected results.
- If that cannot be done through `view`, ITM-680 stops, and the diagram waits for a draft of MOD-trace-pages' interface
  for akmaier.
