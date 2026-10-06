## 15. Product resources

**A PRODUCT DECLARES ITS RESOURCES** *(PO A. Maier)*
A product names the resources it is built with, tested on or calls at runtime in
`docs/resources.md` of its own repository, one entry per resource.
*Check:* `tests/test_resources.py` — a product with a declared resource has it in
`docs/resources.md`; counter-proof: a resource entry written anywhere else is not found and fails.

**A RESOURCE IS USED, A PARTICIPANT DEVELOPS** *(PO A. Maier)*
Whatever does work on the product's artifacts is declared as a participant, never as a resource.
*Check:* `tests/test_resources.py` — a resource entry carrying participant fields (capabilities,
role) is rejected; counter-proof: the same entry without them is accepted.

**ONE SYSTEM IN TWO ROLES IS TWO ENTRIES** *(PO A. Maier)*
A system that the product uses and that also works on the product is declared once as a resource
and once as a participant, each entry complete on its own.
*Check:* no automatic check; at review.

**A RESOURCE'S TERMS ENTER AS A SOURCE** *(PO A. Maier)*
A rule a resource imposes on the product — its licence, an endpoint's usage policy — becomes a
requirement only through a source registered in the library and linked to the product (UC-004,
UC-015).
*Check:* `tests/test_requirement_has_source.py` — a requirement naming a resource entry as its
source is rejected; counter-proof: the same requirement naming the registered licence source passes.

**THE RESOURCE KIND IS ONE OF A CLOSED SET** *(PO A. Maier)*
A resource has exactly one kind from: `repository`, `data`, `model`, `compute`, `endpoint`,
`agent`.
*Check:* `tests/test_resources.py` — an unknown kind is rejected; counter-proof: each of the six is
accepted.

**A RESOURCE IS PINNED TO AN EXACT STATE** *(PO A. Maier)*
A resource of kind `repository`, `data`, `model`, `endpoint` or `agent` records the exact state the
product uses — a commit for a repository, a revision or the SHA-256 of every file for data or a model,
the identifier of the served model for an endpoint or an agent.
*Check:* `tests/test_resources.py` — a `model` entry without revision or hash fails; counter-proof:
the same entry with a 40-hex revision passes, and a `compute` entry without a pin passes.

**A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES** *(PO A. Maier)*
The software environment a job uses on a `compute` resource — a container image by its digest, or the
loaded modules with their versions — is fixed in the product's versioned job files, not in its resource
entry.
*Check:* no automatic check; at review.

**A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT** *(PO A. Maier)*
The recorded state of a resource changes only by a person's decision on the dashboard.
*Check:* `tests/review-core.test.mjs` — a newer upstream commit is reported and `docs/resources.md`
is unchanged; counter-proof: after the *Move* click it carries the new commit.

**A RESOURCE DECLARES ITS LICENCE** *(PO A. Maier)*
Every resource of kind `repository`, `data` or `model` records the licence or terms under which it
may be used and redistributed.
*Check:* `tests/test_resources.py` — such an entry without a licence field fails; counter-proof:
the same entry with `MIT` passes.

**A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED** *(PO A. Maier)*
Agent M writes no content of a resource whose licence does not permit redistribution, or is
unknown, into the product repository.
*Check:* `tests/test_resources.py` — declaring a restricted resource commits only
`docs/resources.md`; counter-proof: a fixture that adds a file from the resource fails.

**A RESOURCE NAMES ITS MAINTAINER** *(Vibe Coding, ch. 6 §5)*
Every resource of kind `repository`, `data`, `model` or `agent` records who maintains it — by account,
by organisation, or by the name of a consenting collaborator — or states that this is unknown.
*Check:* `tests/test_resources.py` — an entry with neither a maintainer nor `unknown` fails;
counter-proof: `unknown` passes.

**A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE** *(PO A. Maier)*
A resource that needs a credential names where the credential is held — a CI secret by name, or a
key stored in the browser — and never contains the credential.
*Check:* `tests/test_no_secret_written.py` — a configured resource credential written into
`docs/resources.md` fails the run; counter-proof: the secret's name alone passes.

**A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE** *(PO A. Maier)*
A credential stored for a resource leaves the browser only as the authorisation of requests to that
resource's server.
*Check:* `tests/review-core.test.mjs` — a request to any other origin carries no resource
credential; counter-proof: the request to the resource's own server carries it.

**A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER** *(PO A. Maier)*
A resource of kind `compute` names the route by which jobs reach it, which is either the local
bridge (UC-011) or a self-hosted runner identified by its label.
*Check:* `tests/test_resources.py` — a `compute` entry without a route, or with another route, is
rejected; counter-proof: `bridge` and `runner:<label>` are accepted.

**A RESOURCE DECLARES WHERE IT PROCESSES DATA** *(PO A. Maier)*
Each resource of kind `compute`, `endpoint` or `agent` states where the data given to it is
processed.
*Check:* `tests/test_resources.py` — such an entry without a processing place fails;
counter-proof: `NHR@FAU, Erlangen` passes.

**A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE** *(PO A. Maier)*
A job that needs a resource is offered only on runtimes and participants that reach it by the
route the resource names.
*Check:* `tests/test_resources.py` — a job needing a `runner:gpu` compute resource is not offered
on a GitHub-hosted runner; counter-proof: it is offered on the runner with label `gpu`.

**THE INSTANCE DECLARES ITS OWN RESOURCES** *(PO A. Maier)*
An instance names the resources its own jobs use — clusters, runners, endpoints — in
`docs/resources.md` of its own repository.
*Check:* `tests/test_resources.py`

**INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT** *(PO A. Maier)*
A product's resource list neither inherits from nor is inherited by the instance's; an entry in one
list has no effect on the other.
*Check:* `tests/test_resources.py`
## 16. Usability

**A FORM OPENS WITH ITS FIRST FIELD FOCUSED** *(PO A. Maier)*
When a person's action opens or shows a form on the dashboard, the input focus moves to the first field of that form that
is open for the person's input — a box to tick or a field to fill in.
*Check:* `tests/dashboard-review-flows.test.mjs` — after each control that opens a form — *Store a token* and *Change* on
the settings page, *Change* of a GitLab project token, *+ Add product* — the focus is in that form's first open field: on the
token form the notice's box *I have read this* while it is not ticked, the paste field once it is; counter-proof: with the
focus left on the control that opened it, the case fails.
