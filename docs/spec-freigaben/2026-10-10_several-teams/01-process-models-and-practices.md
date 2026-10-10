## 5. Process models and practices

**THE PROCESS MODEL IS DECLARED PER PRODUCT** *(PO A. Maier)*
Each managed product declares exactly one process model before its implementation starts; Agent M does not assume a
default.
*Check:* `tests/test_model_declared.py`

**THE CATALOGUE IS DATA** *(PO A. Maier)*
Process models and practices are declarative definitions in data files, not code paths; adding one
requires no change to Agent M's implementation.
*Check:* `tests/test_catalogue_is_data.py` — no model or practice name appears in Agent M's
implementation.

**THE MODEL DETERMINES THE PHASES AND THE GATES** *(Vibe Coding, ch. 6–7; PO A. Maier)*
A model definition names its phases, the transitions between them, which phases pair for
verification, and where the gates sit; Agent M derives the workflow from that definition together with the product's process
requirements.
*Check:* `tests/test_workflow_from_model.py` — each of the five catalogue models, the reuse-oriented
one included, yields its workflow.

**AGENT M CARRIES THE BOOK'S CATALOGUE** *(Vibe Coding, ch. 6–7, 14)*
The shipped catalogue contains the book's process models — waterfall, V-model, reuse-oriented, Scrum
and Kanban — and, separately, its practices: DevOps, prototyping, incremental delivery, and the
scaling layers of disciplined agile delivery.
*Check:* `tests/test_catalogue_complete.py`

**A PROCESS REQUIREMENT ADDS TO THE MODEL** *(PO A. Maier)*
A requirement that constrains the development process adds artifacts or gates to the declared
process model and never replaces the model.
*Check:* `tests/test_process_requirement_is_additive.py`

**A PROCESS MODEL ORGANISES PEOPLE AND AGENTS** *(PO A. Maier)*
A process model names the roles of the work and, for each role, whether a person, an agent, or
either may fill it.
*Check:* `tests/test_model_roles.py`

**A PRACTICE IS NOT A MODEL** *(PO A. Maier)*
A practice — DevOps, prototyping, incremental delivery, a scaling layer — is added to a declared
process model and is never chosen instead of one.
*Check:* `tests/test_model_declared.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next phase opens.
*Check:* `tests/test_gate_definition.py`

**PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE** *(PO A. Maier)*
An instance lists its participants — people and agents — in `docs/participants.md` of its own
repository, and a product assigns its roles from that list.
*Check:* `tests/test_participants.py`

**A PARTICIPANT HAS ONE OF FIVE TYPES** *(PO A. Maier)*
A participant is a person, a model endpoint, a CI agent, a CLI agent on a machine, or a sandboxed
agent in a virtual machine or container.
*Check:* `tests/test_participants.py`

**A PARTICIPANT DECLARES ITS CAPABILITIES** *(PO A. Maier)*
Each participant states which of these it can do: draft text, read the repository, write to the
repository, run code and tests, use tools, reach the web.
*Check:* `tests/test_participants.py`

**A ROLE NAMES THE CAPABILITIES IT NEEDS** *(PO A. Maier)*
A role in a process model names the capabilities its holder must have, and only a participant with
all of them can be assigned to it.
*Check:* `tests/test_model_roles.py`

**A PARTICIPANT DECLARES WHERE IT PROCESSES DATA** *(PO A. Maier)*
Each participant that is not a person states where the data given to it is processed — for example
"this machine", "NHR@FAU, Erlangen", "a provider in the USA".
*Check:* `tests/test_participants.py`

**A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL** *(PO A. Maier)*
Each participant that works with a language model — a model endpoint, a CI agent, a CLI agent or a
sandboxed agent — names the model it uses.
*Check:* `tests/test_participants.py` — a CLI-agent entry without a model is rejected; counter-proof: the
same entry naming its model is accepted, and a person needs none.

**RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS** *(PO A. Maier)*
Content of a source whose licence is restricted is given only to participants whose processing place
the source's register entry permits.
*Check:* `tests/review-core.test.mjs`

**A PRODUCT MAY BE DEVELOPED BY SEVERAL TEAMS** *(PO A. Maier)*
In a model with sprints, a product may be developed by any number of teams, each of which assigns the roles of the
product's process model in a declaration of its own.
*Check:* `tests/test_teams.py` — a fixture product with three team declarations, each naming its team and assigning the
roles of the same model under the same Definition of Done, validates; counter-proofs: a declaration naming another model
or another Definition of Done is rejected, and so is a second declaration beside one that names no team, and so are two
team declarations of a product whose model has no sprints.

**A PRODUCT WITHOUT DECLARED TEAMS HAS ONE TEAM** *(PO A. Maier)*
A product whose declaration names no team is developed by one team, which holds that declaration's role assignment.
*Check:* `tests/test_teams.py` — a fixture product with one declaration that names no team yields one team with its
roles; counter-proof: a product with three team declarations yields three teams.

**A PARTICIPANT MAY SERVE SEVERAL TEAMS** *(PO A. Maier)*
A participant may hold roles in several teams of a product at the same time.
*Check:* `tests/test_teams.py` — two team declarations that assign the same participant validate.
