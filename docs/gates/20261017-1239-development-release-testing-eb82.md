---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - cb51c79654df631421f024284af72d0cd7a52bc0
  - https://github.com/akmaier/agent-m/pull/728
date: 2026-10-17 12:39 UTC
---
# Development → Release testing: ITM-574, a dashboard page loads with a bounded number of requests

**REGISTER**

## Reason

ITM-574, pull request #728 into `sprint/team1/72`, at head `cb51c796`, the merge of ITM-707's #727. It is mergeable, and
its checks passed ten of ten.

**What holds.**
- **Red first.** The tests-only commit `cea7ed22` was red in run 39030641105: node (1) 7 fail and 1 todo naming ITM-680,
  node (4) 1 fail, node (5) 1 fail. These are exactly the new and changed tests.
- **The two changed expected values** are the ones the start named (`88a49e98`).
- **Requests with a token, before → after:** start page 51 → 3, `#arc` 74 → 3, `#spec` 125 → 15, `#backlog` 691 → 11.
  Without a token, the counts are unchanged.
- **Planted faults:** six, each caught (F1 to F6). The fetch spy saw no network, and ITM-018 passes.
- **ITM-707's three release files** pass whole on the head (`docs/gates/20261017-1239-development-release-testing-9794.md`).

**The developer's readings.**
1. **Moved first, then changed:** accepted for the app (SPEC.md:1441).
2. **A list that depends on files already read is a second wave:** accepted. It is the requirement's "requests of at
   most 100 files each", as the start read it.
3. **The process model's path read with a pattern of its own** (`src/site-frame/dashboard-app.mjs:341`,
   `/^model_file:\s*(\S+)\s*$/m` over `docs/process.md`): not accepted.
   - The reason given, "as backlog-view.mjs does", does not hold. `docs/assets/dashboard/backlog-view.mjs:79-80` reads
     the declaration with `readDocument(declarationSchema, …)` and takes `declaration.fields.model_file` from it.
   - The line is a second reader of MOD-product-process's declaration, against AGENTS.md §2 "Nothing twice" and sprint
     60's agreement.
   - Reading the model in a wave of its own saves nothing: `readWave([model])` is one request, and backlog-view's own
     `fileText(model)` is one request too. The requirement asks for requests "of at most 100 files each", which one file
     meets.
   - So the line goes, and backlog-view reads the model itself.
   - Two lines of the start are withdrawn here, for this one file: "#backlog's process model is read in the second
     wave" and "no file is read by itself". Batching it without a second reader needs MOD-site-frame's Uses to name
     `MOD-documents.readDocument` and `MOD-product-process.declarationSchema`, which is a draft for akmaier.
     It would save no request.
4. **The moved app's header still names `MOD-dashboard-app`:** accepted. `EVERY CODE FILE BELONGS TO A MODULE`
   (SPEC.md:1434) places a code file in a module by its folder, and `src/site-frame/` is MOD-site-frame's. The header line
   is a stale comment. `tests/review-core.d/dashboard-app.test.mjs:113` and `:146` select files by it, so it is appended
   to ITM-700.

**What is missing.**
- **The tests this item changes are changed, but not moved into their modules.** Each test below belongs to no module:
  its header names `MOD-dashboard-app`, which has no module file, or names no module at all. The module file in brackets
  names it as taken over.
  - `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` (SPEC.md:1441) lets such a file be "changed only by an
    implementation job of the module whose file names it as taken over, which moves it into that module".
  - `EVERY CODE FILE BELONGS TO A MODULE` places a test in a module by "its header". MOD-repository-hosts.md:79 says the
    same of `test_no_backend.py`: "its header names this module".

  The tests:
  - `tests/architecture-view.test.mjs` (MOD-review-pages);
  - `tests/dashboard-backlog-teams.test.mjs` (MOD-implementation-pages);
  - `tests/dashboard-shell.test.mjs` (MOD-site-frame);
  - `tests/review-core.d/authority.test.mjs` (MOD-review-pages);
  - `tests/review-core.d/dashboard-app.test.mjs` (MOD-site-frame);
  - `tests/review-core.d/dashboard-reads.test.mjs` (MOD-review-pages);
  - `tests/review-core.d/helpers.mjs` (MOD-approvals);
  - `tests/review-core.d/write-refused.test.mjs` (MOD-site-frame);
  - `tests/test_instance_target.py` (MOD-site-frame);
  - `tests/test_no_backend.py` (MOD-repository-hosts);
  - `tests/test_settings_page.py` (MOD-settings-pages);
  - `tests/test_step_explanations.py` (MOD-site-frame);
  - `tests/release-sprint-01-dashboard-app.test.mjs` and `tests/release-sprint-02-a-dashboard-app.test.mjs`
    (MOD-site-frame).

  The list comes from each file's `Module:` line at the head, checked against the module files: `app-harness.mjs`
  names MOD-site-frame, the known positive.
- **The app's location written out again.** `APP_FILE` now holds it, yet tests this item changes still write
  `src/site-frame/dashboard-app.mjs` themselves: architecture-view (2), dashboard-shell (2), dashboard-backlog-teams
  (1) and dashboard-review-flows (1).

## What the rework does

1. `src/site-frame/dashboard-app.mjs:341-342` go. backlog-view reads the model itself. The load-per-view case that
   expects the model in a wave is corrected and run red before the code (sprint 56's agreement). The `#backlog` count
   is measured again and stated.
2. Each test above names its module in its header. A header this touches loses the item history it holds (sprint 67's
   agreement), and a comment in it that names `docs/assets/dashboard-app.mjs` names the app where it is now.
   - The two release files are changed by a participant who builds none of ITM-574 (sprint 68's agreement).
   - The rework runs the whole files again (sprint 70's agreement).
3. The tests in the second point import `APP_FILE` in place of the path they write out.

## Findings, registered in this commit

- ITM-709: the frame's read-ahead knows each view's reads a second time. It waits for a draft of MOD-site-frame's `View`.
- ITM-710: the single-file routes read file by file.
- ITM-711: comments outside this item name the app's old path.
- ITM-700: the moved app's header.

Two findings are not registered, as no fault:
- **The count of 5 in dashboard-backlog-teams cannot tell a batch from a single read.** `load-per-view.test.mjs` is the
  requirement's Check, and it catches F2.
- **The prompt bar's and the notification check's reads are not measured separately.** The counts above are every
  request the counting fake GitHub sees during a load, so these reads are inside them.

**The reading lapse on `1af0d28d`,** the one-line export of `APP_FILE` that this gate's order asked for, goes to the
feedback.
