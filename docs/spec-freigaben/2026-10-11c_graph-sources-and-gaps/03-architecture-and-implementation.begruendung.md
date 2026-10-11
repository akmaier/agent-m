# 11. Architecture and implementation: a workflow file that only runs an entry

**The change.** The rule of `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names one more kind of change between jobs: one
that adds or changes a workflow file that only runs an entry a module's file names. Its check covers that kind and is
written in the form of the section's newer checks. The rest of the section is carried over byte for byte.

**Why.** An entry of MOD-workflow-entries that the instance runs — `onSourcesCommitted`, which fetches an EU legal text
(UC-004 step 7) — needs a file under `.github/workflows/`, and that folder is no module's folder. An implementation job
may not add the file (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`), and no kind of change between jobs added one,
so no file could run the entry. The PO asked, 2026-10-11, for the smallest change that closes each gap found in the
accepted architecture while deriving the backlog.

**Where.** As the last kind of the list. Whether a workflow file counts as code, the requirement does not say; the kind
holds either way. A workflow file that does more than run an entry stays outside it, since what it would do belongs in
a module (one responsibility per file), and every entry is run the same way, the first as every later one.

**Impact list.** No name changes. MOD-workflow-entries' Data names one workflow file per entry of the instance, each
doing nothing but run it. `docs/instructions/developers.md` and `docs/instructions/product-owner.md` refer to the kinds
the requirement names, and need no change. The tests `tests/dashboard-notifications-wiring.test.mjs` and
`tests/dashboard-process-view.test.mjs`, the items ITM-245, ITM-263 and ITM-275, and the records of past jobs, gates and
sprints name the requirement for changes of the kinds it named; none of them changes. Its check,
`tests/test_implementation_job.py`, is not written yet.
