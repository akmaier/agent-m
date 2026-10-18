---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 56f7a46857bb30b76cfdddc8044daacdf375e77e
  - https://github.com/akmaier/agent-m/pull/890
date: 2026-10-18 11:50 UTC
---
# Development → Release testing: ITM-900, an EU legal text gets a newer version on request

**REGISTER**

## Reason

ITM-900 (MOD-settings-pages, MOD-workflow-entries), pull request #890 into `sprint/team1/89`, passes on `56f7a468`.

1. **Red first.** `2e01ed03` holds only tests. Run 39124280229 is red on TST-900001 to 900008 and on the two changed tests
   TST-914004 and TST-402001. Those change `inputs: {}` to `{ source }`, the item's own output, under `d995c09b`.
   TST-705007's fixture loses its version row so that its entry still waits, and its assertions are unchanged.
2. **The change** (`56f7a468`) is the text akmaier accepted in `831c98f5`:
   - `onSourcesCommitted` (`src/workflow-entries/instance.mjs:75`) reads the run's input `source` and appends a further
     version. The same bytes are "nothing to do", naming the entry and the version they equal. A missing entry, or one
     that is no legal text, fails and names it.
   - `.github/workflows/fetch-sources.yml` declares the dispatch input `source`. MOD-workflow-entries.md:109 names that file
     "since GitHub fixes their place", so it belongs to this module under `EVERY CODE FILE BELONGS TO A MODULE`. Its
     change is this module's to make.
   - The library's *+ New version* of a fetched legal text starts the run with `{ source: id }` and offers no files.
     *Fetch again* passes `{ source }` too.
3. **Green.** Run on `56f7a468`: all twelve jobs pass. `git merge-tree --write-tree` merges the head into
   `sprint/team1/89` without a conflict (tree `b944c724`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with the input ignored, 5 of 6 of the workflow's new tests
     fail. Restored, `src/` is clean.
   - The developer's five counter-proofs each fail their tests: same-bytes handling dropped, input renamed in the workflow,
     input ignored, the run not started, and *Fetch again* without the input.
5. **The readings are accepted:**
   - "fetched" means a legal text with at least one version row;
   - "equal SHA-256" means file name and SHA-256, as `versionCommits`' `SameBytes` compares;
   - the input is read from `env.event.payload.inputs`, as `src/workflow-entries/product.mjs:269` reads its own.
   GitHub's refusal of an undeclared input is documented, not measured, and the workflow declares it.
6. **Release and system tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does:
   - the item's files, the library's and the workflow's source tests, and UC-004's and UC-015's release and system tests,
     with the settings release tests: 89 of 89;
   - the tests that import `src/workflow-entries/` (`release-uc-019-change-requirements-by-prompt`,
     `system-uc-006-approve-spec-change`): 30 passed and 2 todo.

**Findings:**
- The lead on a fetched version whose identifier equals an existing one, with different bytes, is registered as ITM-925.
- The duplicated fixtures in `tests/workflow-entries-sources.test.mjs` are test code with no requirement of their own, so
  they get no item.
