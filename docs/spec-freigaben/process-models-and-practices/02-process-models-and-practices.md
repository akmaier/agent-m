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

**A PARTICIPANT IS A PERSON OR AN AGENT** *(PO A. Maier)*
A participant is a person or an agent.
*Check:* `tests/test_participants.py` — validates fixture rows of `docs/participants.md` with the register's schema. It
checks that a row of the type `person` and one of the type `agent` are accepted, and that a row of any other type is
rejected.

**A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL** *(PO A. Maier)*
Each participant that is an agent names the model it works with.
*Check:* `tests/test_participants.py` — an agent's row without a model is rejected; counter-proof: the same row naming
its model is accepted, and a person needs none.

**A CONNECTION NAMES THE MODELS IT OFFERS** *(PO A. Maier)*
Each connection to a language model — a model endpoint, a coding agent that a Bridge offers, or a coding agent on CI —
names the models it offers, each with how many tokens its context holds.
*Check:* `tests/prompt-bar-endpoints.test.mjs` — reads fixture settings of an endpoint naming one model and of a Bridge's
coding agent naming two. It checks that the endpoint is offered with its model and the agent once with each of its two,
each with its context; counter-proof: a model without its context is not offered.

**A CONNECTION DECLARES ITS CAPABILITIES** *(PO A. Maier)*
Each connection states which of these it can do: draft text, read the repository, write to the repository, run code and
tests, use tools, reach the web.
*Check:* `tests/prompt-bar-endpoints.test.mjs` — a coding agent of a Bridge is offered with the capabilities its settings
declare, and an endpoint with *draft text* and *read the repository*, and *use tools* where its last test found that its
model calls a tool; counter-proof: an endpoint whose test found none is offered without *use tools*.

**A ROLE NAMES THE CAPABILITIES IT NEEDS** *(PO A. Maier)*
A role in a process model names the capabilities its holder must have, and a job of the role runs only on a connection
that has all of them.
*Check:* `tests/test_model_roles.py`; `tests/test_job_assignment.py` — hands a job of a role that needs *run code and
tests* to a fixture agent whose model two connections offer, one declaring that capability and one not. It checks that
the job is sent only to the connection that declares it; counter-proof: with that connection removed, the job is sent
nowhere and the missing capability is named.

**A CONNECTION DECLARES WHERE IT PROCESSES DATA** *(PO A. Maier)*
Each connection states where the data given to it is processed — for example "this machine", "NHR@FAU, Erlangen", "a
provider in the USA".
*Check:* `tests/prompt-bar-endpoints.test.mjs` — a connection whose settings name no place is not offered; counter-proof:
the same connection naming one is offered with it.

**THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE** *(PO A. Maier)*
A connection that the prompt bar offers counts, with the model the person chooses, as a
participant for every rule of this specification, except that it is not listed in the instance's participant list and
holds no role.
*Check:* `tests/prompt-bar-endpoints.test.mjs` — an endpoint or CLI session without a place or a model is not offered,
the page names each with its place before a message is sent, a page of mail gives a CLI session the mail's `MAIL-`
identifier only, and a restricted source's content is refused to an endpoint whose place its entry does not permit;
counter-proof: the same endpoint at a permitted place receives it, and with recording off a conversation with an
endpoint writes nothing to a repository.

**RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS** *(PO A. Maier)*
Content of a source whose licence is restricted is given only to connections whose processing place
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
