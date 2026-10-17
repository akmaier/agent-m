# 11. Architecture and implementation: every code file belongs to a module

**The change.** In §11:
- `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` goes, with its forms of a pull request between jobs.
- Two requirements take its place:
  - **`EVERY CODE FILE BELONGS TO A MODULE`.** Every code file lies in one module's folder, or, where its platform fixes
    its place, is named in one module's parts. Every test names a module of the architecture.
  - **`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`.** A file that belongs to no module is changed only by the
    implementation job of the module whose file names it as taken over. That job moves it into the module, or removes it
    once the module provides what it did, with the tests of what it removes.
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` also allows the files that one of its modules' files names as taken
  over.
- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN` no longer counts a code file outside every module among the gaps, since that
  is now forbidden.

Every other line of §11 stays.

**Why.** akmaier, rejecting queue `2026-10-17`'s entry 02: "It should not call modules in old files, instead old files
and files that have code but don't belong to the architecture anymore should be refactored into the architecture. I
don't want legacy code in the code basis; Therefore it should become part if the architecture, modules and
documentation. Why would be have code files that are not part of the achritectural design we aim to achieve?"

The decision stating the whole system already says so (`ARC-037`, Consequences): "The code written before this
architecture lies outside every module's folder; it is reported as a gap until implementation jobs move it into the
folders of these modules." The SPEC said the opposite: `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` forbade an
implementation job to touch that code. This entry makes the SPEC say what the architecture says.

**The scope, measured** (`docs/measurements/2026-10-17_code-outside-every-module.md`):
- 55 code files outside every module's folder: 39 under `docs/assets/`, the two pages, 9 under `src/home/`,
  `src/site/` and `src/theme/`, 4 workflows, and `tools/apply_approvals.py`;
- 37 tests that name no module;
- 91 tests that name only modules the architecture does not hold, such as MOD-dashboard-app and MOD-artifacts.

**Each decision and the principle it rests on** (AGENTS.md §2; book ch. 10 *Principles for Robust Architecture*,
ch. 12 *One Thing at a Time* and *KISS*):
1. **Every code file belongs to one module.**
   - *One responsibility per file.* A file without a module has no responsibility the architecture states, and no module
     answers for it.
   - *DRY, nothing twice.* The old files repeat modules: `docs/assets/vendor/` beside `src/markdown-render/vendor/`, and
     `docs/assets/traceability/graph.mjs`'s `coverageGaps` beside MOD-trace-graph's. A rule kept in two places is the
     duplicate the book warns of.
2. **Files whose place the platform fixes** — a CI workflow, a page the Pages site serves — **are named in a module's
   parts, not moved.** GitHub runs workflows only from `.github/workflows/` and serves pages from where they stand.
   *KISS*: the module owns them by naming them, and no second kind of owner is made.
3. **An old file is moved by the implementation job of the module that takes it over, and by no pull request between
   jobs.**
   - *Divide and conquer, one thing at a time.* Each module takes over its own part, in an item of its own, tested like
     every other job.
   - *No special first case.* Moving a file is an implementation job like any other: tests first, red, gates.
   - *KISS.* One path for every change of code, where there were two.
4. **An old file is moved or removed, never changed in place.** *Develop against interfaces, not implementations*: a
   patch in an old file is the "compensating patch" ch. 10 names. The rejection says the same: "should not call modules
   in old files".
5. **`MODULE GAPS ARE REPORTED, NOT FORBIDDEN` loses its code-file gap.** *Nothing the SPEC already says*: the new
   requirement forbids that gap, so listing it among the tolerated ones would contradict it.

**Against the rest of the SPEC and the use cases.**
- **`A MODULE IS A FOLDER` holds.** A module is still one folder; a file whose place the platform fixes is named, not
  held.
- **`AGENT M'S SOURCE CODE LIVES IN SRC` holds better.** Moving `docs/assets/`'s scripts into modules under `src/` is
  what it asks, and today no case of its Check finds those scripts.
- **UC-025 step 4** lists "a code file outside every module's folder" among what validation shows. It still shows it.
- **UC-041 7c and UC-034 6b** speak of files no module owns that can conflict. They stay true while such files remain,
  and the case becomes rarer as they go.
- **The architecture:** `ARC-037`'s Consequences already state this direction. Which module takes over which old file
  is stated in each module's file, by the items that move them.

**Impact list.**
- `tests/test_coverage_report.py`: a case listing every code file outside the architecture, and every test naming no
  module of it.
  - While old files remain, it lists them, and its case is a todo that names the items moving them, so CI stays green.
  - The item that moves the last file makes it pass.
- `tests/test_implementation_job.py`: its fixture's between-jobs cases go, and the cases of a job that moves or removes
  a taken-over file come.
- The items that assumed a pull request between jobs:
  - ITM-574, whose fix lives in the live dashboard's loading code;
  - the removal of `stepHtml` and `tests/test_step_explanations.py` after queue `2026-10-17b`;
  - the start of the site through `start.mjs`, which `64.md`'s reachability reading counts on.

  Each becomes the job of the module that takes the old code over.
- The migration of the 55 files and the 128 tests, one module at a time, so the live dashboard keeps working. Its items
  are registered once this direction is accepted, since which module takes over which file is a change of those
  modules' files.
