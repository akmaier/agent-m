## 11. Architecture and implementation

**AN ARCHITECTURE IS THE ORGANISATION OF THE WHOLE SYSTEM** *(Vibe Coding, ch. 10 §1, after IEEE 1471)*
A product's architecture describes the fundamental organisation of its whole system: its components, their
relationships to each other and to the environment, and the principles guiding its design and evolution.
*Check:* no automatic check; at review.

**AN ARCHITECTURE STATES STRUCTURE, INTERACTION AND STRATEGY** *(Vibe Coding, ch. 10 §1)*
An architecture states the static decomposition of the system into its components, the dynamic interaction of those
components at runtime, and the overarching strategy that holds both together.
*Check:* no automatic check; at review.

**A SYSTEM IS DECOMPOSED INTO SUBSYSTEMS AND MODULES** *(PO A. Maier; Vibe Coding, ch. 10 §3)*
An architecture decomposes the product's system into subsystems, and each subsystem into modules.
*Check:* no automatic check; at review.

**A MODULE BELONGS TO ONE SUBSYSTEM** *(PO A. Maier)*
Every module belongs to exactly one subsystem.
*Check:* no automatic check; at review.

**AN ARCHITECTURE IS DOCUMENTED IN FOUR VIEWS** *(Vibe Coding, ch. 10 §2, after Kruchten's 4+1 view model)*
An architecture is documented in a logical view of its abstractions, a process view of its behaviour at runtime, a
development view of its modules and files, and a physical view of where each of its parts runs.
*Check:* no automatic check; at review.

**THE USE CASES ARE THE SCENARIOS OF THE ARCHITECTURE** *(Vibe Coding, ch. 10 §2, after Kruchten's 4+1 view model)*
Each accepted use case appears in the architecture as a scenario that names the subsystems taking part and how they
interact, which shows that the system makes the use case possible.
*Check:* no automatic check; at review.

**THE ARCHITECTURE DOES NOT RESTATE THE USE CASES** *(PO A. Maier)*
No use case is restated step by step in the architecture.
*Check:* no automatic check; at review.

**THE ARCHITECTURE IS CUT BY FUNCTION, NOT BY USE-CASE STEP** *(PO A. Maier)*
Subsystems and modules are cut by the functions and data the system needs to make its use cases possible, never by the
steps of the use cases.
*Check:* no automatic check; at review.

**AN ARCHITECTURE NAMES ITS PATTERNS** *(Vibe Coding, ch. 10 §4–§6)*
An architecture names the architectural patterns it combines — structuring patterns such as layers, pipe-and-filter or a
repository, adaptable-system patterns such as plug-ins, distributed-system patterns such as client-server, a broker or
service orientation — and, for each, the part of the system it organises and why it was chosen.
*Check:* no automatic check; at review.

**AN ARCHITECTURE STAYS AT THE LEVEL OF MODULES** *(PO A. Maier)*
An architecture describes the system down to its modules and their interfaces, and leaves every question that only an
implementation can answer to the implementation.
*Check:* no automatic check; at review.

**DIVIDE AND CONQUER** *(Vibe Coding, ch. 10 §3)*
A system is decomposed top-down into smaller, independent parts, each of which can be built and checked on its own.
*Check:* no automatic check; at review.

**DESIGN TO TEST** *(Vibe Coding, ch. 10 §3)*
An architecture states how the system, each subsystem and each module will be tested.
*Check:* no automatic check; at review.

**KEEP IT SIMPLE** *(Vibe Coding, ch. 10 §3)*
An architecture is the simplest design that meets the accepted requirements and use cases.
*Check:* no automatic check; at review.

**YOU AREN'T GONNA NEED IT** *(Vibe Coding, ch. 10 §3)*
An architecture designs nothing that the product will not actually need.
*Check:* no automatic check; at review.

**DON'T REPEAT YOURSELF** *(Vibe Coding, ch. 10 §3)*
An architecture defines each function, data structure and rule in one place.
*Check:* no automatic check; at review.

**LEAST ASTONISHMENT** *(Vibe Coding, ch. 10 §3)*
Every interface behaves the way its users expect from its name and its description.
*Check:* no automatic check; at review.

**OPEN FOR EXTENSION, CLOSED FOR CHANGE** *(Vibe Coding, ch. 10 §3)*
A module can be extended with new functions without changing the functions it already offers.
*Check:* no automatic check; at review.

**DEVELOP AGAINST INTERFACES** *(Vibe Coding, ch. 10 §3)*
A module uses another module only through that module's interface, never through its implementation.
*Check:* no automatic check; at review.

**AN INTERFACE TELLS ITS USER WHAT TO CONSIDER** *(Vibe Coding, ch. 10 §3)*
The definition of an interface states everything its user must consider to use it.
*Check:* no automatic check; at review.

**AN INTERFACE HIDES ITS IMPLEMENTATION** *(Vibe Coding, ch. 10 §6)*
An interface exposes functions and data structures and hides how they are implemented.
*Check:* no automatic check; at review.

**A REMOTE INTERFACE NAMES HOW IT FAILS** *(Vibe Coding, ch. 10 §6)*
An interface whose calls cross a network states that they do, and how a call fails when the network or the other side
is unavailable.
*Check:* no automatic check; at review.

**A MODULE INTERFACE IS MINIMAL** *(PO A. Maier)*
A module's interface offers only the functions that other modules need.
*Check:* no automatic check; at review.

**MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE** *(PO A. Maier)*
The modules an architecture designs use each other's interfaces without a cycle.
*Check:* no automatic check; at review.

**ONE ARCHITECTURE DECISION, ONE FILE** *(PO A. Maier)*
Each architecture decision is a single Markdown file named
`docs/architecture/ARC-<nnn>-<slug>.md` in the product repository.
*Check:* `tests/test_architecture_files.py`

**AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES** *(PO A. Maier; Vibe Coding, ch. 10 §2)*
An architecture decision names the situation that calls for it, the decision taken, the alternatives
that were considered, and the consequences accepted with it.
*Check:* `tests/test_architecture_files.py`

**ONE DECISION STATES THE WHOLE ARCHITECTURE** *(PO A. Maier)*
One architecture decision of a product states its system as a whole — its patterns, its subsystems and their
relationships, its four views and its scenarios —, and every other decision of the product refines it.
*Check:* no automatic check; at review.

**ONE DECISION PER SUBSYSTEM** *(PO A. Maier)*
Each subsystem is stated in an architecture decision of its own, which names its responsibility within the system, the
interface it offers and its modules.
*Check:* no automatic check; at review.

**ONE MODULE, ONE FILE** *(PO A. Maier)*
Each module is described in a single Markdown file named `docs/architecture/MOD-<slug>.md` in the product repository.
*Check:* `tests/review-core.test.mjs` — the file `docs/architecture/MOD-<slug>.md` is reviewed as the module
`MOD-<slug>`.

**A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES** *(Vibe Coding, ch. 10 §3, ch. 12 §6; PO A. Maier)*
A module's file states the subsystem it belongs to, its single responsibility and what it implements — the parts it
consists of, the data it keeps, the interface it provides, the files it reads or writes and the interfaces of other
modules it uses —, so that a developer or an agent can implement the module from its file.
*Check:* no automatic check; at review.

**A MODULE FILE IS REVIEWED AS AN ARCHITECTURE DECISION IS** *(PO A. Maier)*
A module's file is written, reviewed, accepted and changed as an architecture decision is.
*Check:* `tests/review-core.test.mjs` — a module file without an approval record naming its text is shown as open;
counter-proof: with one, it is shown as accepted.

**A MODULE IS A FOLDER** *(PO A. Maier)*
Each module is one folder of its product's source code, named after its identifier `MOD-<slug>`.
*Check:* `tests/test_coverage_report.py` — a code file outside every module's folder is reported.

**AN INTERFACE STATES ITS TYPES** *(PO A. Maier)*
Every function of a module's interface states the type of each parameter and of its result, and the errors its caller
must handle.
*Check:* no automatic check; at review.

**A DATA FORMAT IS DEFINED ONCE** *(PO A. Maier)*
Every data structure and file format that crosses a module boundary is defined once, in the file of the module that
owns it.
*Check:* no automatic check; at review.

**ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES** *(PO A. Maier)*
An architecture is drafted or changed only against use cases whose current text an approval record names.
*Check:* `tests/test_job_preconditions.py` — a job that drafts an architecture against an open use case does not start
and names that use case; counter-proof: once an approval record names its text, the job starts.

**THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE** *(PO A. Maier)*
A product's first architecture is drafted in one piece, for every requirement of its SPEC and every one of its use cases.
*Check:* `tests/test_derivation_context.py` — the first derivation for a fixture product offers no selection and sends
every requirement and every use case; counter-proof: a derivation of part of them is refused.

**AN ARCHITECTURE IS DERIVED FROM THE WHOLE TO ITS MODULES** *(PO A. Maier; Vibe Coding, ch. 10 §3)*
An architecture is derived top-down: first the system's context, its patterns, its subsystems and the four views, then
the scenarios of the use cases, then the decisions of its subsystems, and only then the files of its modules.
*Check:* no automatic check; at review.

**THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT** *(PO A. Maier)*
A participant that drafts or checks an architecture receives the whole SPEC, every accepted use case and the whole
architecture.
*Check:* `tests/test_derivation_context.py` — the input sent to a fixture drafter and to a fixture reviewer contains
every requirement, every accepted use case and every file of the architecture.

**NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY** *(PO A. Maier)*
If the SPEC, the accepted use cases and the architecture do not fit into a participant's context, nothing is sent and
the dashboard says what does not fit.
*Check:* `tests/test_derivation_context.py`

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

**AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE** *(PO A. Maier)*
An architecture draft is checked only once it is complete, and then as a whole.
*Check:* `tests/test_architecture_review.py` — a fixture reviewer receives the complete draft; counter-proof: no review
starts for a draft that lacks the decision stating the whole architecture.

**A CHANGE ACROSS MODULES IS CHECKED AS A WHOLE** *(PO A. Maier)*
A change to an architecture that concerns more than one module is checked together with the whole architecture.
*Check:* `tests/test_architecture_review.py` — a change to two module files sends every file of the architecture
to the reviewer.

**AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS** *(PO A. Maier)*
An architecture is checked by reviewing participants and by a person; no test or CI run checks it.
*Check:* no automatic check; at review.

**THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION** *(PO A. Maier)*
A reviewing participant checks the whole architecture against the whole SPEC, the principles of this section included.
*Check:* no automatic check; at review.

**EVERY USE CASE IS CHECKED AGAINST THE ARCHITECTURE** *(PO A. Maier)*
A reviewing participant checks every accepted use case against the system, by whether its scenario is possible with the
subsystems and their interfaces.
*Check:* no automatic check; at review.

**A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM** *(PO A. Maier)*
A reviewing participant checks every subsystem against the system, by whether it fulfils the responsibility and offers
the interface that the decision stating the system gives it.
*Check:* no automatic check; at review.

**A MODULE IS CHECKED AGAINST ITS SUBSYSTEM** *(PO A. Maier)*
A reviewing participant checks every module against its subsystem, by whether it fulfils the part of the subsystem's
responsibility and interface that the subsystem's decision gives it.
*Check:* no automatic check; at review.

**NO MODULE IS CHECKED AGAINST THE USE CASES** *(PO A. Maier)*
No module is checked against the use cases.
*Check:* no automatic check; at review.

**NO REVIEWER IS THE DRAFTER** *(PO A. Maier)*
The reviewing participant of an architecture draft is not the participant that drafted it and does not use its model.
*Check:* `tests/test_architecture_review.py` — a reviewer that is the drafter, or uses its model, is refused before
anything is sent; counter-proof: another participant with another model is accepted.

**A REVIEWER'S FINDING IS A WARNING** *(PO A. Maier)*
A finding of the reviewing participant of an architecture draft is a warning.
*Check:* `tests/test_correction_loop.py` — a reviewer's finding answered with a justification ends the loop;
counter-proof: an unanswered one does not.

**A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON** *(PO A. Maier)*
A finding of a reviewing participant changes nothing until it has been checked against the SPEC, the use cases and the
architecture; a finding that does not hold is answered with the reason it does not.
*Check:* no automatic check; at review.

**AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT** *(PO A. Maier)*
A drafted architecture runs, in the correction loop and before a person sees it, through the review of
`THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`.
*Check:* `tests/test_correction_loop.py` — a fixture reviewer's finding is sent back, and the person sees only the
corrected draft.

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

**WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS** *(PO A. Maier)*
A file that no module of the accepted architecture owns — code outside every module's folder, a test or test helper
whose header names no module of the architecture — is changed by no implementation job. It is changed between jobs, by a
pull request of its own that only makes old code call a module in place of its own code, removes what a module now
provides together with the tests of what it removes, names in a test's header the module that now holds what the test
tests, lets a check of the whole repository allow a module what the module's file states that it uses, or lets a test
helper reach the modules' files.
*Check:* `tests/test_implementation_job.py` — an implementation job's pull request that changes such a file is refused,
and so is a pull request between jobs that changes one in any other way; counter-proof: a pull request between jobs that
replaces code of such a file by a call into a module passes.

**MODULE GAPS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier)*
A module that realises no requirement, a requirement that no module realises, a module that no test
exercises, and a code file outside every module's folder are shown in the dashboard; none of them blocks a job.
*Check:* `tests/test_coverage_report.py`
