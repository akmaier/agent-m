## 11. Architecture and implementation

**ONE ARCHITECTURE DECISION, ONE FILE** *(PO A. Maier)*
Each architecture decision is a single Markdown file named
`docs/architecture/ARC-<nnn>-<slug>.md` in the product repository.
*Check:* `tests/test_architecture_files.py`

**AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES** *(Vibe Coding, ch. 10 §2)*
An architecture decision names the situation that calls for it, the decision taken, the alternatives
that were considered, and the consequences accepted with it.
*Check:* `tests/test_architecture_files.py`

**A MODULE IS A FOLDER** *(PO A. Maier)*
Each module is one folder of its product's source code, named by its identifier `MOD-<slug>` in the architecture
decision that designs it.
*Check:* `tests/test_architecture_files.py` — every module a decision names has its folder.

**A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES** *(Vibe Coding, ch. 10 §3, ch. 12 §6; PO A. Maier)*
The architecture decision that designs a module states the module's responsibility, its interfaces, and the
format of every file it reads or writes.
*Check:* `tests/test_architecture_files.py`

**AN INTERFACE STATES ITS TYPES** *(PO A. Maier)*
Every interface of a module states the type of each parameter, of its result and of every refusal it can return.
*Check:* `tests/test_architecture_files.py` — an interface with a parameter, result or refusal without a type is an
error.

**A TYPE IS DEFINED ONCE, IN MACHINE-READABLE FORM** *(PO A. Maier)*
Every data structure and file format an architecture uses is defined once, in machine-readable form, in the
architecture decision that designs the module owning it.
*Check:* `tests/test_architecture_files.py` — a type used but defined nowhere, or defined twice, is an error.

**EVERY TYPE HAS A SAMPLE** *(PO A. Maier)*
Every data structure and file format an architecture defines has at least one sample that conforms to its definition.
*Check:* `tests/test_architecture_files.py` — every sample is validated against its definition without a model;
counter-proof: a sample missing a required field is an error.

**EVERY INTERFACE HAS AN EXAMPLE** *(PO A. Maier)*
Every interface of a module has at least one example: an input and the result or refusal it gives.
*Check:* `tests/test_architecture_files.py` — every example's input and result conform to the interface's types.

**EVERY NAME IN AN ARCHITECTURE RESOLVES** *(PO A. Maier)*
Every requirement, use case, decision, module, interface and type an architecture decision names exists.
*Check:* `tests/test_architecture_files.py` — an unknown name is an error.

**MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE** *(PO A. Maier)*
The modules an architecture designs use each other's interfaces without a cycle.
*Check:* `tests/test_architecture_files.py` — a cycle is an error that names its modules.

**EVERY USE-CASE STEP IS CARRIED BY AN INTERFACE** *(PO A. Maier)*
For every step of every accepted use case, the architecture names the module interfaces that carry it out.
*Check:* `tests/test_architecture_coverage.py` — a step that no interface carries is a warning.

**EVERY REQUIREMENT HAS ITS PLACE IN THE ARCHITECTURE** *(PO A. Maier)*
Every accepted requirement is realised by a module, or is named by the decision it forces as a rule that no single
module keeps.
*Check:* `tests/test_architecture_coverage.py` — a requirement without a place is a warning.

**THE USE-CASE MAPPING IS REVIEWED** *(PO A. Maier)*
A reviewing participant checks, for every step of every accepted use case, that the interfaces the architecture
names for it carry the step out — with the inputs the step needs, the results it produces and the refusals it can meet.
*Check:* `tests/test_architecture_review.py` — on a fixed set of drafts with planted wrong mappings, how often the
reviewer finds them is measured as a rate, reported and not gated.

**THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION** *(PO A. Maier)*
A reviewing participant checks, for every accepted requirement, that the module or decision the architecture places
it with keeps it.
*Check:* `tests/test_architecture_review.py` — on a fixed set of drafts with planted unkept requirements, how often
the reviewer finds them is measured as a rate, reported and not gated.

**NO REVIEWER IS THE DRAFTER** *(PO A. Maier)*
The reviewing participant of an architecture draft is not the participant that drafted it and does not use its model.
*Check:* `tests/test_architecture_review.py` — a reviewer that is the drafter, or uses its model, is refused before
anything is sent; counter-proof: another participant with another model is accepted.

**A REVIEWER'S FINDING IS A WARNING** *(PO A. Maier)*
A finding of the reviewing participant of an architecture draft is a warning.
*Check:* `tests/test_correction_loop.py` — a reviewer's finding answered with a justification ends the loop;
counter-proof: an unanswered one does not.

**ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS** *(PO A. Maier)*
An architecture decision can be accepted only when every requirement and use case it names is
accepted.
*Check:* `tests/review-core.test.mjs`

**THE DERIVATION RULES HOLD FOR ARCHITECTURE** *(PO A. Maier)*
`DERIVATION SEES THE EXISTING REQUIREMENTS`, `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`,
`A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT`, `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL`,
`THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`, `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`,
`A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`, `A CONFLICT IS DECIDED BY A PERSON` and
`CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES` apply to the derivation of architecture decisions, with
"requirement" read as "architecture decision" and "source" read as "the requirement or use case that forces it".
*Check:* `tests/test_derivation_classes.py` — the same battery, with architecture fixtures.

**AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT** *(PO A. Maier)*
A drafted architecture decision runs, in the correction loop and before a person sees it, through the checks of
`AN INTERFACE STATES ITS TYPES`, `A TYPE IS DEFINED ONCE, IN MACHINE-READABLE FORM`, `EVERY TYPE HAS A SAMPLE`,
`EVERY INTERFACE HAS AN EXAMPLE`, `EVERY NAME IN AN ARCHITECTURE RESOLVES`,
`MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE`, `EVERY USE-CASE STEP IS CARRIED BY AN INTERFACE`,
`EVERY REQUIREMENT HAS ITS PLACE IN THE ARCHITECTURE`, `THE USE-CASE MAPPING IS REVIEWED` and
`THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`.
*Check:* `tests/test_correction_loop.py` — a fixture draft with an untyped interface is sent back, and so is a
fixture reviewer's finding; the person sees only the corrected draft.

**A REUSE DECISION RECORDS ITS DUE DILIGENCE** *(Vibe Coding, ch. 6 §5)*
An architecture decision that adopts an external library, service or API records, for the chosen
candidate and for each alternative, its licence, its release history, how its issues are handled,
and its adoption.
*Check:* `tests/test_reuse_due_diligence.py`

**A PRODUCT DECLARES ITS LICENCE** *(PO A. Maier)*
Every managed product states its own licence in a `LICENSE` file at the root of its repository.
*Check:* `tests/test_reuse_due_diligence.py`

**A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S** *(PO A. Maier)*
The due diligence marks every candidate whose licence is not known to be compatible with the product's
licence.
*Check:* `tests/test_reuse_due_diligence.py` — a GPL-3.0 candidate for an MIT product is marked;
counter-proof: an MIT candidate is not.

**DUE DILIGENCE IS FETCHED, NOT RECALLED** *(PO A. Maier)*
Every fact in a due-diligence record is read from the candidate's package registry or source
repository and names the address and the date it was read.
*Check:* `tests/test_reuse_due_diligence.py` — a record with a fact lacking address or date fails;
counter-proof with a record whose package does not exist in the registry.

**AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST** *(PO A. Maier)*
Before a change to an accepted architecture decision is accepted, the modules it designs, their code files and
tests, and the requirements that reference it are shown beside the change.
*Check:* `tests/review-core.test.mjs`

**SKELETONS, DOCUMENTATION, SAMPLES AND TESTS ARE GENERATED FROM THE ARCHITECTURE** *(PO A. Maier)*
From an accepted architecture decision, each module's source skeleton, its interface documentation, its sample input
files and one failing test per example are generated without a model.
*Check:* `tests/test_generate_from_architecture.py` — two generations give identical files, every generated sample
conforms to its type, and every generated test fails against the skeleton.

**AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST** *(Vibe Coding, ch. 13 §5)*
The first commit of an implementation job that adds or changes behaviour contains only tests, and the
product's CI run on that commit is red.
*Check:* `tests/test_implementation_job.py` — reads the job branch's first commit and its CI result.

**A REFACTORING JOB BEGINS WITHOUT A FAILING TEST** *(PO A. Maier; Vibe Coding, ch. 13 §5)*
A job declared as refactoring starts without a failing test, and the product's CI run is green on
every one of its commits.
*Check:* `tests/test_implementation_job.py` — a refactoring job with a red run on any commit is
refused; counter-proof: green on every commit passes.

**A REFACTORING JOB CHANGES NO EXPECTED RESULT** *(PO A. Maier)*
A refactoring job changes the expected result of no test.
*Check:* `tests/test_implementation_job.py` — a refactoring pull request that changes an asserted
value fails; counter-proof: one that only moves a test passes.

**AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES** *(Vibe Coding, ch. 12 §6, ch. 10 §3; PO A. Maier)*
The pull request of an implementation job changes only code files in the folders of the modules the job was
given and tests that name one of those modules.
*Check:* `tests/test_implementation_job.py`

**MODULE GAPS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier)*
A module that realises no requirement, a requirement that no module realises, a module that no test
exercises, and a code file outside every module's folder are shown in the dashboard; none of them blocks a job.
*Check:* `tests/test_coverage_report.py`
