# §13: a run — the process model carried out over a selection

**PO, 2026-09-30:** *"UC-024 Implement modules from the architecture seems to be unrelated to the process
model. Actually, I want to be able to implement any subset including all at once using the process model
configured in UC-031; Same should be coupled with UC-25, UC-26 and UC-27; In the first pass, i probably
want to implement all of them using a process model autonomously (UC24 to UC27). Right now, it reads like i
have to click everything step by step and that would be very labor intensive (of course having the option
to do so is also good for critical module and tests)."*

Seven new rules; nothing existing changes. Design decisions by the main agent — correct them in the edit
field:
- **What a run covers:** accepted modules (V-model, waterfall, reuse-oriented), or backlog items (Scrum,
  Kanban — UC-034 already starts one job per selected item; it becomes a run as well). Architecture is not
  derived inside a run: a module must be accepted before it is implemented (`ARCHITECTURE RESTS ON
  ACCEPTED ARTIFACTS`, `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`).
- **Order inside a run:** CI configuration (UC-027) first if missing; modules in the order of their
  interfaces, independent ones in parallel up to the limit (UC-024); the test battery for the selection
  (UC-026) — release tests by a participant other than the implementer (`RELEASE TESTS ARE NOT WRITTEN BY
  THE IMPLEMENTER`); at the end the validation (UC-025). Where the model's phases say otherwise — for
  example a V-model whose Testing phase is gated —, the model wins.
- **No new identifier:** a run is a job that names its jobs.
- **Single steps stay:** UC-024 to UC-027 remain startable for one module or one test set.

Impact: new UC-043; UC-024, UC-025, UC-026, UC-027 and UC-034 name the run.

**Confirmed by the PO on 2026-09-30:** *"I agree that modules must be accepted first."* — a run does not derive
the architecture; it builds accepted modules only. *"Yes, process model configuration wins. I agree."* — where
the model's phases and gates prescribe another order than the default one above, the model's order holds.
