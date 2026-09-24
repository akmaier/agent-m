## 5. Process models and practices

**THE PROCESS MODEL IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-23)*
Each managed product declares exactly one process model; Agent M does not assume a default.
*Occasion:* choosing a process is risk balancing, not a methodology contest — each model manages
one risk well and accepts another. A tool that silently assumes one has made the choice for the
reader and hidden the trade-off.
*Check:* `tests/test_model_declared.py`

**THE CATALOGUE IS DATA** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
Process models and practices are declarative definitions in data files, not code paths; adding one
requires no change to Agent M's implementation.
*Occasion:* the catalogue will grow — readers will bring the process their organisation actually
runs. A model encoded as branching logic makes the next model a refactor.
*Check:* `tests/test_catalogue_is_data.py` — no model or practice name appears in Agent M's
implementation.

**THE MODEL DETERMINES THE STAGES AND THE GATES** *(Vibe Coding, ch. 6–7; reworded 2026-09-24)*
A model definition names its stages, their order, which stages pair for verification, and where the
gates sit; Agent M derives the workflow from that definition together with the product's process
requirements.
*Occasion:* this is the difference between offering process models and merely naming them. The
V-model's contribution is precisely that a decomposition step is paired with the check that will
verify it; if the pairing is not in the data, the model is decoration. Process requirements add to
it (`A PROCESS REQUIREMENT ADDS TO THE MODEL`).
*Check:* `tests/test_workflow_from_model.py`

**AGENT M CARRIES THE BOOK'S CATALOGUE** *(Vibe Coding, ch. 6–7, 14; corrected 2026-09-24)*
The shipped catalogue contains the book's process models — waterfall, V-model, reuse-oriented, Scrum
and Kanban — and, separately, its practices: DevOps, prototyping, incremental delivery, and the
scaling layers of disciplined agile delivery.
*Occasion:* Agent M is the book's companion, so it follows the book's classification. The first
version listed nine "models"; cross-checked against the book on 2026-09-24, only five are process
models there. Agile is the family behind Scrum and Kanban (ch. 7: the Manifesto is four value
statements), DevOps is "a set of practices" (ch. 7), prototyping and incremental delivery are
change-management techniques (ch. 14), and disciplined agile delivery is a scaling layer (ch. 7).
*Check:* `tests/test_catalogue_complete.py`

**A PROFILE ADDS, IT DOES NOT REPLACE** *(Vibe Coding, ch. 6 — withdrawn 2026-09-24)*
*Withdrawn:* a standard such as IEC 62304 is not part of the process model but a requirement source
whose rules may constrain the process. Replaced by `A PROCESS REQUIREMENT ADDS TO THE MODEL`. The
name is not reused.

**A PROCESS REQUIREMENT ADDS TO THE MODEL** *(PO A. Maier, 2026-09-24)*
A requirement that constrains the development process adds artifacts or gates to the declared
process model and never replaces the model.
*Occasion:* the book describes IEC 62304 as defining "lifecycle processes" whose safety classes
align with the V-model (ch. 6) — rules the work must satisfy, whichever model organises it. A
regulated project does not stop being Scrum; it acquires obligations. Filing the standard as a
"profile" inside the model catalogue mixed the two.
*Check:* `tests/test_process_requirement_is_additive.py`

**A PROCESS MODEL ORGANISES PEOPLE AND AGENTS** *(PO A. Maier, 2026-09-24)*
A process model names the roles of the work and, for each role, whether a person, an agent, or
either may fill it.
*Occasion:* the process model answers how a product is developed — in Agent M by a team of people
and agents. Who decides, who builds and who checks is the first thing a team of agents needs to
know, and the one thing a list of stages does not say.
*Check:* `tests/test_model_roles.py`

**A PRACTICE IS NOT A MODEL** *(PO A. Maier, 2026-09-24)*
A practice — DevOps, prototyping, incremental delivery, a scaling layer — is added to a declared
process model and is never chosen instead of one.
*Occasion:* the book presents these as practices and techniques that work with several models
(ch. 7, 14). Offering them as alternatives to Scrum or the V-model would ask the author a question
that has no answer.
*Check:* `tests/test_model_declared.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier, 2026-09-23)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next stage opens.
*Occasion:* an unnamed gate is a pause, not a check. The point of a phase gate is that somebody
can say afterwards what was verified at it.
*Check:* `tests/test_gate_definition.py`
