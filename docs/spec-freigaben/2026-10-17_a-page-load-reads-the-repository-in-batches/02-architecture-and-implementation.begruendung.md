# 11. Architecture and implementation: old code may be made to meet a requirement through a module's interface

**The change.** `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` gains one form of a pull request between jobs. It "makes
old code meet a requirement of this specification by calling a module's interface as the module's file states it,
together with the test that checks that requirement". The other forms, and the rule's check, stay.

**Why.** The live dashboard is `docs/assets/`, which no module owns. `docs/index.html` loads `assets/dashboard-app.mjs`,
and no page loads MOD-site-frame's `start.mjs`. Entry 01's requirement can be met there only by changing that code, and
none of the rule's forms admits the change.
- Calling `Snapshot.readMany` ahead of the reads, and reading one snapshot per load, replace none of the code's own
  code. They only call MOD-repository-hosts' interface differently, so they are not "makes old code call a module in
  place of its own code".
- The test that checks the count, `tests/load-per-view.test.mjs`, also belongs to no module.

The new form admits exactly that kind of change. It must serve a requirement of the SPEC, it may only call an interface
as its module's file states it, and it goes with the test of that requirement. It is not a form for building new
behaviour in code no module owns.

**The alternative, and why it is not chosen.** The live pages could load the site through `start.mjs`. That is already a
form of the rule, since it makes old code call a module in place of its own. But the module-built site does not yet hold
everything the live dashboard shows. `docs/measurements/2026-10-16_coverage-uc-001-020.md` names the gaps: the setup,
Get your own Agent M, the sources pages, and UC-020's views. Waiting for them would leave the limit used up for several
sprints.

**Against the rest of the SPEC.** It adds a form and removes none. An implementation job still changes no file that no
module owns. Each form still allows only a pull request of its own, between jobs.

**Impact list.**
- `tests/test_implementation_job.py`, the rule's check. Its fixture's forms do not change. The new form is checked by the
  pull request that uses it first.
- ITM-574, whose fix uses the new form.
