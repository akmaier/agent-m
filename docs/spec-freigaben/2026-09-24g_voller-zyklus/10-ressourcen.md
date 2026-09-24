## 15. Product resources

**A PRODUCT DECLARES ITS RESOURCES** *(PO A. Maier, 2026-09-24)*
A product names the resources it is built with, tested on or calls at runtime in
`docs/resources.md` of its own repository, one entry per resource.
*Occasion:* PO, 2026-09-24: the product must be able to "link other repos", data and models, and
"local compute and inference hardware … used as ressource by the product". Beside the code, the
list survives Agent M (`THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`); the book calls a provider one
builds around "part of the architecture" (ch. 6 §5).
*Check:* `tests/test_resources.py` — a product with a declared resource has it in
`docs/resources.md`; counter-proof: a resource entry written anywhere else is not found and fails.

**A RESOURCE IS USED, A PARTICIPANT DEVELOPS** *(PO A. Maier, 2026-09-24)*
Whatever does work on the product's artifacts is declared as a participant (§5), never as a
resource.
*Occasion:* a resource is what the product or one of its jobs uses; a participant develops the
product. A local LLM endpoint the product queries at runtime and a coding agent that writes the
product's code are different relations to the product, with different questions — pinned version
and licence for the first, capabilities and role for the second.
*Check:* `tests/test_resources.py` — a resource entry carrying participant fields (capabilities,
role) is rejected; counter-proof: the same entry without them is accepted.

**ONE SYSTEM IN TWO ROLES IS TWO ENTRIES** *(PO A. Maier, 2026-09-24)*
A system that the product uses and that also works on the product is declared once as a resource
and once as a participant, each entry complete on its own.
*Occasion:* PO decision 2026-09-24: the same local LLM endpoint can be both. One shared entry would
tie the product's pinned model to whatever the development team switches its agent to.
*Check:* no automatic check; at review.

**A RESOURCE'S TERMS ENTER AS A SOURCE** *(PO A. Maier, 2026-09-24)*
A rule a resource imposes on the product — its licence, an endpoint's usage policy — becomes a
requirement only through a source registered in the library and linked to the product (UC-004,
UC-015).
*Occasion:* a model's licence may forbid commercial use; that is a rule the product must meet, and
rules have sources (`A REQUIREMENT HAS A REGISTERED SOURCE`). The resource entry records which
licence applies; it does not by itself create a requirement.
*Check:* `tests/test_requirement_has_source.py` — a requirement naming a resource entry as its
source is rejected; counter-proof: the same requirement naming the registered licence source passes.

**THE RESOURCE KIND IS ONE OF A CLOSED SET** *(PO A. Maier, 2026-09-24)*
A resource has exactly one kind from: `repository`, `data`, `model`, `compute`, `endpoint`,
`agent`.
*Occasion:* the kinds are the PO's list — other repositories, data, models, compute such as SLURM
clusters, inference endpoints, agents — and each kind is pinned, checked and reached differently.
*Check:* `tests/test_resources.py` — an unknown kind is rejected; counter-proof: each of the six is
accepted.

**A RESOURCE IS PINNED TO AN EXACT STATE** *(PO A. Maier, 2026-09-24)*
A resource records the exact state the product uses — a commit for a repository, a revision or the
SHA-256 of every file for data or a model, the identifier of the served model for an endpoint or
an agent.
*Occasion:* reuse "buys dependencies", and their maintainers change them (ch. 6 §5). "Which model
did the tests run against?" needs an answer months later — the same reasoning as `A SOURCE VERSION
IS FIXED BY IDENTIFIER AND HASH`, applied to what the product uses.
*Check:* `tests/test_resources.py` — a `model` entry without revision or hash fails; counter-proof:
the same entry with a 40-hex revision passes.

**A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT** *(PO A. Maier, 2026-09-24)*
The recorded state of a resource changes only by a person's decision on the dashboard.
*Occasion:* "APIs break, licenses get updated" (ch. 6 §5). An automatic move would change the
product under its tests without anyone deciding it; a newer state is shown, and a person moves.
*Check:* `tests/review-core.test.mjs` — a newer upstream commit is reported and `docs/resources.md`
is unchanged; counter-proof: after the *Move* click it carries the new commit.

**A RESOURCE DECLARES ITS LICENCE** *(PO A. Maier, 2026-09-24)*
Every resource of kind `repository`, `data` or `model` records the licence or terms under which it
may be used and redistributed.
*Occasion:* the next rule depends on it. A private repository of DLLs, a gated model and an
openly licensed dataset differ exactly here.
*Check:* `tests/test_resources.py` — such an entry without a licence field fails; counter-proof:
the same entry with `MIT` passes.

**A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED** *(PO A. Maier, 2026-09-24)*
Agent M writes no content of a resource whose licence does not permit redistribution, or is
unknown, into the product repository.
*Occasion:* PO, 2026-09-24: "private repos maybe containing DLLs that cannot be shared". A product
repository may be public or become public, and git history keeps what was committed — the
reasoning of `RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE`, applied to resources. The entry holds its address and pin; that is enough to fetch it where access
is granted.
*Check:* `tests/test_resources.py` — declaring a restricted resource commits only
`docs/resources.md`; counter-proof: a fixture that adds a file from the resource fails.

**A RESOURCE NAMES ITS MAINTAINER** *(Vibe Coding, ch. 6 §5)*
Every resource of kind `repository`, `data`, `model` or `agent` records who maintains it, or states
that this is unknown.
*Occasion:* due diligence looks at "maintenance history" and ownership (ch. 6 §5); the PEAKS box
there shows a stack that stalled when its one maintainer left — a bus factor of one. A private
repository of binaries often has exactly one maintainer, and the entry makes that visible.
*Check:* `tests/test_resources.py` — an entry with neither a maintainer nor `unknown` fails;
counter-proof: `unknown` passes.

**A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE** *(PO A. Maier, 2026-09-24)*
A resource that needs a credential names where the credential is held — a CI secret by name, or a
key stored in the browser — and never contains the credential.
*Occasion:* jobs must know which secret to use; the value must not reach the repository (`NO
SECRET IN THE REPOSITORY`, ch. 10 §"API Tokens and Security": a leaked key is like "a published
credit card number").
*Check:* `tests/test_no_secret_written.py` — a configured resource credential written into
`docs/resources.md` fails the run; counter-proof: the secret's name alone passes.

**A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE** *(PO A. Maier, 2026-09-24)*
A credential stored for a resource leaves the browser only as the authorisation of requests to that
resource's server.
*Occasion:* `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` covers repository tokens; a Hugging
Face token or an endpoint key is a credential of the same kind and needs the same boundary.
*Check:* `tests/review-core.test.mjs` — a request to any other origin carries no resource
credential; counter-proof: the request to the resource's own server carries it.

**A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER** *(PO A. Maier, 2026-09-24)*
A resource of kind `compute` names the route by which jobs reach it, which is either the local
bridge (UC-011) or a self-hosted runner identified by its label.
*Occasion:* a browser cannot open SSH to a SLURM login node, and a GitHub-hosted runner cannot reach
a machine on the institute's network. The bridge and a self-hosted runner are the two routes that
can.
*Check:* `tests/test_resources.py` — a `compute` entry without a route, or with another route, is
rejected; counter-proof: `bridge` and `runner:<label>` are accepted.

**A RESOURCE DECLARES WHERE IT PROCESSES DATA** *(PO A. Maier, 2026-09-24)*
Each resource of kind `compute`, `endpoint` or `agent` states where the data given to it is
processed.
*Occasion:* a test job that sends data to a cluster or an endpoint hands it to that place, as with
a participant (`A PARTICIPANT DECLARES WHERE IT PROCESSES DATA`). Restricted content can only be
kept where it is permitted if the place is written down.
*Check:* `tests/test_resources.py` — such an entry without a processing place fails;
counter-proof: `NHR@FAU, Erlangen` passes.

**A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE** *(PO A. Maier, 2026-09-24)*
A job that needs a resource is offered only on runtimes and participants that reach it by the
route the resource names.
*Occasion:* a test battery that needs the GPU cluster, started on a GitHub-hosted runner, fails
late and with an unhelpful message; checking before the start fails early, with the reason — the
same logic as `A ROLE NAMES THE CAPABILITIES IT NEEDS`.
*Check:* `tests/test_resources.py` — a job needing a `runner:gpu` compute resource is not offered
on a GitHub-hosted runner; counter-proof: it is offered on the runner with label `gpu`.

**THE INSTANCE DECLARES ITS OWN RESOURCES** *(PO A. Maier, 2026-09-24)*
An instance names the resources its own jobs use — clusters, runners, endpoints — in
`docs/resources.md` of its own repository.
*Occasion:* PO, 2026-09-24: "the instance has resources, the product too". A GPU cluster on which the
instance runs its agents is the instance's; the product may use it or not.
*Check:* `tests/test_resources.py`

**INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT** *(PO A. Maier, 2026-09-24)*
A product's resource list neither inherits from nor is inherited by the instance's; an entry in one
list has no effect on the other.
*Occasion:* PO, 2026-09-24: they "do not necessarily have to be the same". A product must say on its
own what it runs on (`THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`); the dashboard may offer an
instance entry as a starting point, copied, never linked.
*Check:* `tests/test_resources.py`
