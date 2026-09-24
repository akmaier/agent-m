# §11: architecture and implementation

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

**Dropped in integration:** `AN IMPLEMENTATION JOB GOES TO A PARTICIPANT THAT CAN RUN TESTS`. It
follows from `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` (entry 08) together with the existing
`A ROLE NAMES THE CAPABILITIES IT NEEDS`: the role that implements needs *run code and tests*, so
only such participants hold it.

## Open questions of the drafting group

1. **Part B or new names?** B1 folds four obligations into one existing rule. Accept B1, or the four
   separate names listed under it?
2. **Who merges on green CI in an implementation job?** `CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL
   REQUEST WITH GREEN CI` allows the agent to merge. UC-024 lets the author choose per job ("merge when
   green" or "leave for me"). Should the product's process model decide this instead (a role
   *Integrator*), or is a per-job choice right?
3. **Refactoring jobs.** `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` has no answer for a job
   that changes structure but not behaviour (tests stay green throughout). Exempt a declared
   *refactoring* job — whose rule would then be "no test changes, CI green" — or require every job to
   add behaviour?
4. **Does the product's CI enforce module names?** `MODULE GAPS ARE REPORTED, NOT FORBIDDEN` makes a
   code file without module a report on the dashboard. Should the check in
   `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` also fail a pull request that adds a code file
   without module name — i.e. blocking for new code, reporting for old?
5. **Component diagram: derived or drawn?** UC-022/UC-025 compute the system's component diagram from
   the modules' declared interfaces, so it cannot drift. Diagrams inside a decision (for example a
   layered view for a layering decision) are drawn and stored. Should "the system component diagram is
   derived, never stored" become a requirement of its own, analogous to `THE TRACEABILITY MATRIX IS
   DERIVED`?
6. **Test results per module.** UC-025 validates *belonging* (which requirement, which test). Should it
   also show whether a module's tests passed on the default branch? That needs the product's CI to
   publish a per-test report Agent M can read; the format would become a requirement on products.
7. **Licence compatibility.** Due diligence records the candidate's licence; judging compatibility needs
   the product's own licence, which no requirement records yet. Add "a product declares its licence"?
8. **Token permission for starting a CI agent.** Starting a workflow on a self-hosted runner from the
   dashboard needs the fine-grained permission *Actions: write*, which `THE TOKEN LINK IS PREFILLED` and
   `A TOKEN IS SCOPED TO WHAT IT WRITES` do not yet list. Add it, or start CI jobs only through GitHub's
   *Run workflow* button?
9. **Registry reachability from the browser.** Whether the browser can read package registries
   (npm, PyPI, crates.io, …) cross-origin is not measured. Until it is (`BROWSER REACHABILITY IS
   MEASURED, NOT ASSUMED`), UC-022 assumes due diligence may have to go to a participant that can
   reach the web.
10. **Overlap with other groups.** `AN IMPLEMENTATION JOB GOES TO A PARTICIPANT THAT CAN RUN TESTS` may
    duplicate a general rule on jobs and capabilities drafted elsewhere; the test-side half of B1
    ("a test names … the module it exercises") may overlap with the tests group.
11. **Where the job check runs.** `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` and
    `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` must hold even when the participant merges itself,
    so UC-024 places the check in the product's CI. That means Agent M installs a workflow step in
    every product it implements for (as UC-010 already assumes for its workflow). Acceptable, or should
    the check run only on the dashboard before a person's **Merge** — which would rule out
    participant-merges-on-green?

**Decided by the PO on 2026-09-24:**
- **Question 3, refactoring:** *"it does not; it must be possible without failing a test first."* —
  `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` now holds for jobs that add or change behaviour;
  two new rules cover the declared refactoring job.
- **Question 7, licences:** *"products can have their own license; I want MIT license for agent m; that
  should allow virtually any product license."* — `A PRODUCT DECLARES ITS LICENCE` and
  `A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S`; Agent M's own licence is entry 13.
