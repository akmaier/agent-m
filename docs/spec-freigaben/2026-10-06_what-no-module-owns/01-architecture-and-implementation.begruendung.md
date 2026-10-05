# 11. Architecture and implementation: what no module owns

**The change.** `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` is added after `AN IMPLEMENTATION JOB CHANGES ONLY ITS
MODULES`. Every other requirement of the section, that one included, is carried over byte for byte.

**Why.** Found on 2026-10-06 in sprint 04, whose goal is UC-001 on the modules of the accepted architecture and the
architecture page's component diagram.

- Apart from four folders under `src/` that no module file names, Agent M's code lies outside every module's folder:
  the dashboard's pages, the browser store, the Git host and the review core under `docs/assets/`. The headers of the
  existing tests name ten modules of the purged architecture — MOD-artifacts, MOD-bridge-tunnel, MOD-dashboard-app,
  MOD-git-host, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-settings-store, MOD-traceability,
  MOD-work-items — or none, and the test helpers name none.
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` lets a job change only the folders of its modules and the tests that
  name them, and `docs/process.md` makes the job rules its Definition of Done. No job is given a purged module. So none
  of these files can be changed by any job, and a module, once written, cannot reach the dashboard. Sprint 04 met it
  three times:
  - ITM-203: the re-export its item text asked for, in `docs/assets/traceability.mjs`, made two tests outside its scope
    fail — the old diagram's labelled arrows, and a release test of the kernel rule of the purged ARC-003. The
    architecture page keeps showing "Maximum text size in diagram exceeded".
  - ITM-205: MOD-repository-hosts uses the platform's `fetch`, as its file states; `tests/test_no_backend.py` (`NO
    SERVER`) allows `fetch` only in `docs/assets/git-host.mjs` and `docs/assets/bridge-tunnel.mjs` and fails on the module.
  - The test runner `tests/jsrun.py` refused two files of one name, and every module folder holds an `index.mjs`; every
    Python check that asks node failed. The session running the sprint changed the runner in a pull request of its own
    (#97), before this queue was decided.
- The requirement keeps the job rule as it is and adds the rule `SCRUM.md` of the process repository already follows for
  shared files: they are written between the jobs, never by a job. What may change in them is listed, so that the old
  code gives way to the accepted modules and to nothing else — no code of its own is added outside the modules, and a
  test's expected result changes only by a job of the module the test is given to.

**Alternatives.** Extending the job rule so that a job may also re-point the old code to its own modules: two parallel
jobs would then write the same old file, and the tests of purged modules would still belong to no job. Moving all of
Agent M's code into its module folders at once — the whole dashboard, not the minimum UC-001 needs. Loading the modules
through an import map in `docs/index.html` — the old file would still read as the code that runs.

**Impact list.** One requirement added; the check `tests/test_implementation_job.py` does not exist yet. In sprint 04,
the change that makes the dashboard's pages call the sprint's modules, and the entry of MOD-repository-hosts in the
`fetch` list of `tests/test_no_backend.py`, wait for this queue. Pull request #97 also removed two expected values of
the purged backlog from the checks of this repository's own backlog; this requirement does not cover that change.
