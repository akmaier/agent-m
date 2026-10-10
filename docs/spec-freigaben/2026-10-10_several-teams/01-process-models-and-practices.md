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

**A ROLE NAMES HOW MANY FILL IT** *(PO A. Maier)*
A process model names for each role whether it is filled by one participant or may be filled by several.
*Check:* `tests/test_model_roles.py` — validates every shipped and instance model definition against the model schema.
It checks that each role states how many participants fill it.

**A PRACTICE IS NOT A MODEL** *(PO A. Maier)*
A practice — DevOps, prototyping, incremental delivery, a scaling layer — is added to a declared
process model and is never chosen instead of one.
*Check:* `tests/test_model_declared.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next phase opens.
*Check:* `tests/test_gate_definition.py`

**PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE** *(PO A. Maier)*
An instance lists all its participants — people and agents — in the one list `docs/participants.md` of its own
repository, and a product assigns its roles from that list.
*Check:* `tests/test_participants.py` — scans the instance repository for participant lists and resolves every name in
the product's role assignments against `docs/participants.md`. It checks that this is the instance's only participant
list and that it holds every assigned name.

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

**THE PROCESS NAMES ROLES, NOT PARTICIPANTS** *(PO A. Maier)*
A product's process declaration names the roles that participants fill, never a participant.
*Check:* `tests/test_role_assignment.py` — compares the product's process declaration with the instance's participant
list. It checks that the declaration names no participant.

**A ROLE ASSIGNMENT FILLS THE ROLES** *(PO A. Maier)*
A product's roles are filled in a role assignment, a file `docs/role-assignments/<name>.md` of the product's repository
that only assigns participants to the roles of its process.
*Check:* `tests/test_role_assignment.py` — validates each role assignment against the roles of the product's process. It
checks that the assignment gives participants to those roles and holds nothing else.

**A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM** *(PO A. Maier)*
A product has one role assignment, or, in a model that works in sprints, one for each of its teams.
*Check:* `tests/test_role_assignment.py` — compares the number of a product's role assignments with its teams and with
whether its model works in sprints. It checks for one assignment per product, or one per team.

**A PARTICIPANT MAY SERVE SEVERAL TEAMS** *(PO A. Maier)*
A participant may hold roles in several teams of a product at the same time.
*Check:* `tests/test_role_assignment.py` — validates the role assignments of a product's teams together. It checks that
a participant may hold roles in several of them.
