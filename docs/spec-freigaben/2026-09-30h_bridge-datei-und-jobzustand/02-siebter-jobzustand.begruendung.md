# §13: a seventh job state, *ended without record*

**The question (architecture, PR #17, MOD-job-records).** `ONE DASHBOARD SHOWS EVERY JOB` names six states
and its check rejects any other; UC-036 alternative flow 1c shows a job whose start record has no end record
and which no runtime knows — the tab was closed, the bridge restarted — as *ended without record*. The
architecture had mapped it to *failed* with a note.

**PO decision, 2026-09-30:** "seventh state is ok".

**The change:** the rule lists *ended without record* as the seventh state; the check rejects a state outside
the seven. The occasion says why it is not *failed*: nobody observed an outcome. Everything else of §13 is
carried over byte for byte.

**Impact list** (files naming `ONE DASHBOARD SHOWS EVERY JOB`): `SPEC.md`, UC-036, MOD-dashboard-app,
MOD-job-records. UC-036's table of states gains the row in the same commit (open for review).
MOD-job-records' `jobState` still maps the case to *failed* with a note; it changes to the seventh state as an
architecture change after this entry is accepted.
