## 11. Architecture and implementation

**ONE ARCHITECTURE DECISION, ONE FILE** *(PO A. Maier, 2026-09-24)*
Each architecture decision is a single Markdown file named
`docs/architecture/ARC-<nnn>-<slug>.md` in the product repository.
*Occasion:* the architecture is written as open and accepted decision by decision. A file
is the unit git versions and an approval record hashes, as for use cases (`ONE USE CASE, ONE FILE`).
*Check:* `tests/test_architecture_files.py`

**AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES** *(Vibe Coding, ch. 10 §2)*
An architecture decision names the situation that calls for it, the decision taken, the alternatives
that were considered, and the consequences accepted with it.
*Occasion:* the book: design decisions "need to be documented and can be revisited later". A decision
recorded without its rejected alternatives cannot be revisited — nobody can see what was weighed.
*Check:* `tests/test_architecture_files.py`

**ONE MODULE, ONE FILE** *(PO A. Maier, 2026-09-24)*
Each module is a single Markdown file named `docs/architecture/MOD-<slug>.md` in the product
repository.
*Occasion:* modules are accepted, changed and withdrawn one at a time, and code files and tests
point at them by identifier; each needs its own text and its own approval.
*Check:* `tests/test_architecture_files.py`

**A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES** *(Vibe Coding, ch. 10 §3, ch. 12 §6)*
A module file states the module's single responsibility, the interfaces it provides, and the
interfaces of other modules it uses.
*Occasion:* "develop against interfaces, not implementations" (ch. 10 §3) and one responsibility per
entity (ch. 12 §6). The declared interfaces are what a job on a neighbouring module is given instead
of that module's code, and what the component diagram is computed from.
*Check:* `tests/test_architecture_files.py`

**ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS** *(PO A. Maier, 2026-09-24)*
An architecture decision or a module can be accepted only when every requirement and use case it
names is accepted.
*Occasion:* a decision forced by an open use case rests on a proposal; when the use case changes in
review, the decision was taken for a text that no longer exists. The same reasoning as
`A REQUIREMENT HAS A REGISTERED SOURCE`, one level down.
*Check:* `tests/review-core.test.mjs`

**THE DERIVATION RULES HOLD FOR ARCHITECTURE** *(PO A. Maier, 2026-09-24)*
`DERIVATION SEES THE EXISTING REQUIREMENTS`, `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`,
`A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT`, `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL`,
`THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`, `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`,
`A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`, `A CONFLICT IS DECIDED BY A PERSON` and
`CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES` apply to the derivation of architecture decisions and
modules, with "requirement" read as "architecture decision or module" and "source" read as "the
requirement or use case that forces it".
*Occasion:* PO, 2026-09-24: derivation should have the old artifacts "in context and modify them
instead of duplicating them" — said of requirements, and true for the architecture for the same
reason. Pointing at the rules instead of restating them keeps one text per rule.
*Check:* `tests/test_derivation_classes.py` — the same battery, with architecture fixtures.

**A REUSE DECISION RECORDS ITS DUE DILIGENCE** *(Vibe Coding, ch. 6 §5)*
An architecture decision that adopts an external library, service or API records, for the chosen
candidate and for each alternative, its licence, its release history, how its issues are handled,
and its adoption.
*Occasion:* the book asks teams to look "not only at feature lists" but at maintenance history, issue
resolution, adoption and update frequency: reuse "buys dependencies", and a provider becomes part of
the architecture.
*Check:* `tests/test_reuse_due_diligence.py`

**A PRODUCT DECLARES ITS LICENCE** *(PO A. Maier, 2026-09-24)*
Every managed product states its own licence in a `LICENSE` file at the root of its repository.
*Occasion:* PO, 2026-09-24: "products can have their own license". Agent M's own MIT licence puts no
condition on the licence of what is built with it; a product's licence is the product's decision, and
the due diligence of every library it reuses has to be read against it.
*Check:* `tests/test_reuse_due_diligence.py`

**A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S** *(PO A. Maier, 2026-09-24)*
The due diligence marks every candidate whose licence is not known to be compatible with the product's
licence.
*Occasion:* a copyleft library in a product under a permissive licence, or a licence forbidding
commercial use, changes what the product may be. The compatibility table is data, and a candidate the
table does not know is marked, not passed.
*Check:* `tests/test_reuse_due_diligence.py` — a GPL-3.0 candidate for an MIT product is marked;
counter-proof: an MIT candidate is not.

**DUE DILIGENCE IS FETCHED, NOT RECALLED** *(PO A. Maier, 2026-09-24)*
Every fact in a due-diligence record is read from the candidate's package registry or source
repository and names the address and the date it was read.
*Occasion:* a model states release dates and licences from memory and can name packages that do not
exist. A fact with address and date can be read again by the reviewer; a recalled one cannot
(`SOFTWARE_MAINTENANCE.md` §0.3, "Nie raten").
*Check:* `tests/test_reuse_due_diligence.py` — a record with a fact lacking address or date fails;
counter-proof with a record whose package does not exist in the registry.

**AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST** *(PO A. Maier, 2026-09-24)*
Before a change to an accepted architecture decision or module is accepted, the modules, code files,
tests and requirements that reference it are shown beside the change.
*Occasion:* PO, 2026-09-24, names "the modification … of the architecture" as missing. The counterpart of `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` for the
architecture: the list is part of the decision, not a report afterwards.
*Check:* `tests/review-core.test.mjs`

**AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST** *(Vibe Coding, ch. 13 §5)*
The first commit of an implementation job that adds or changes behaviour contains only tests, and the
product's CI run on that commit is red.
*Occasion:* the book makes test-driven development "a software process that the agent itself can
follow": the agent "cannot claim completion until the test passes". The red run is also the
counter-proof of `SOFTWARE_MAINTENANCE.md` §4.0a rule 5 — a test that passes before the code exists
checks nothing.
*Check:* `tests/test_implementation_job.py` — reads the job branch's first commit and its CI result.

**A REFACTORING JOB BEGINS WITHOUT A FAILING TEST** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 13 §5)*
A job declared as refactoring starts without a failing test, and the product's CI run is green on
every one of its commits.
*Occasion:* PO, 2026-09-24: refactoring "must be possible without failing a test first". Refactoring
changes structure, not behaviour — the third step of red, green, refactor, done "with the tests kept
green" (ch. 13 §5). A red test would have to be invented, and an invented test checks nothing.
*Check:* `tests/test_implementation_job.py` — a refactoring job with a red run on any commit is
refused; counter-proof: green on every commit passes.

**A REFACTORING JOB CHANGES NO EXPECTED RESULT** *(PO A. Maier, 2026-09-24)*
A refactoring job changes the expected result of no test.
*Occasion:* without a failing test at the start, the existing tests are the only evidence that
behaviour stayed the same; a refactoring that edits an expectation has changed behaviour and is an
implementation job. Moving or renaming a test is allowed; its expectation is not touched.
*Check:* `tests/test_implementation_job.py` — a refactoring pull request that changes an asserted
value fails; counter-proof: one that only moves a test passes.

**AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES** *(Vibe Coding, ch. 12 §6, ch. 10 §3)*
The pull request of an implementation job changes only code files and tests that name one of the
modules the job was given.
*Occasion:* "one thing at a time" (ch. 12 §6). A change in a neighbouring module's code is the
workaround cascade of ch. 10 §3; the process repository runs its sprints on disjoint file scopes for
the same reason (`SOFTWARE_MAINTENANCE.md`, phase 2).
*Check:* `tests/test_implementation_job.py`

**MODULE GAPS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier, 2026-09-24)*
A module that realises no requirement, a requirement that no module realises, a module that no test
exercises, and a code file that names no module are shown in the dashboard; none of them blocks a job.
*Occasion:* the reasoning of `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN` one level down —
early in a product, and in code adopted from before Agent M, gaps are the normal state. A module
without a requirement is the speculative design ch. 10 §3 warns against (YAGNI); showing it is enough.
*Check:* `tests/test_coverage_report.py`
