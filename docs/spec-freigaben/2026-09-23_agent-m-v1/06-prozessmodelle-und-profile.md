## 5. Process models and profiles

**THE PROCESS MODEL IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-23)*
Each managed product declares exactly one process model; Agent M does not assume a default.
*Occasion:* choosing a process is risk balancing, not a methodology contest — each model manages
one risk well and accepts another. A tool that silently assumes one has made the choice for the
reader and hidden the trade-off.
*Check:* `tests/test_model_declared.py`

**THE CATALOGUE IS DATA** *(PO A. Maier, 2026-09-23)*
Process models are declarative definitions in data files, not code paths; adding a model requires
no change to Agent M's implementation.
*Occasion:* the catalogue will grow — the book alone names nine, and readers will bring their own.
A model encoded as branching logic makes the tenth model a refactor.
*Check:* `tests/test_catalogue_is_data.py` — no model name appears in Agent M's implementation.

**THE MODEL DETERMINES THE STAGES AND THE GATES** *(Vibe Coding, ch. 6–7)*
A model definition names its stages, their order, which stages pair for verification, and where
the gates sit; Agent M derives the workflow from that definition alone.
*Occasion:* this is the difference between offering process models and merely naming them. The
V-model's contribution is precisely that a decomposition step is paired with the check that will
verify it; if the pairing is not in the data, the model is decoration.
*Check:* `tests/test_workflow_from_model.py`

**AGENT M CARRIES THE BOOK'S CATALOGUE** *(Vibe Coding, ch. 6–7)*
The shipped catalogue contains waterfall, V-model, reuse-oriented, incremental/prototyping, agile,
Kanban, Scrum, DevOps, and disciplined agile delivery at scale.
*Occasion:* Agent M is the book's companion. A reader who has just read chapter 6 must find the
models of chapter 6.
*Check:* `tests/test_catalogue_complete.py`

**A PROFILE ADDS, IT DOES NOT REPLACE** *(Vibe Coding, ch. 6, regulated-software section)*
A profile — for example IEC 62304 safety class A, B or C — adds required artifacts and evidence to
whatever model is underneath; it never substitutes for the model.
*Occasion:* a regulated project does not stop being agile, it acquires obligations. Modelling
regulation as a separate process model would force the reader to abandon the working rhythm in
order to satisfy an auditor.
*Check:* `tests/test_profile_is_additive.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier, 2026-09-23)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next stage opens.
*Occasion:* an unnamed gate is a pause, not a check. The point of a phase gate is that somebody
can say afterwards what was verified at it.
*Check:* `tests/test_gate_definition.py`
