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

**MODULE GAPS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier)*
A module that realises no requirement, a requirement that no module realises, a module that no test
exercises, and a code file outside every module's folder are shown in the dashboard; none of them blocks a job.
*Check:* `tests/test_coverage_report.py`
