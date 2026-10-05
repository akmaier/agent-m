# 11. Architecture and implementation: what an architecture is, how it is derived and how it is checked

**The change.** §11 is rewritten around the definition of an architecture in book ch. 10.

- **Added — what an architecture is:** `AN ARCHITECTURE IS THE ORGANISATION OF THE WHOLE SYSTEM`,
  `AN ARCHITECTURE STATES STRUCTURE, INTERACTION AND STRATEGY`, `A SYSTEM IS DECOMPOSED INTO SUBSYSTEMS AND MODULES`,
  `A MODULE BELONGS TO ONE SUBSYSTEM`, `AN ARCHITECTURE IS DOCUMENTED IN FOUR VIEWS`,
  `THE USE CASES ARE THE SCENARIOS OF THE ARCHITECTURE`, `THE ARCHITECTURE DOES NOT RESTATE THE USE CASES`,
  `THE ARCHITECTURE IS CUT BY FUNCTION, NOT BY USE-CASE STEP`, `AN ARCHITECTURE NAMES ITS PATTERNS`,
  `AN ARCHITECTURE STAYS AT THE LEVEL OF MODULES`.
- **Added — the design principles of ch. 10:** `DIVIDE AND CONQUER`, `DESIGN TO TEST`, `KEEP IT SIMPLE`,
  `YOU AREN'T GONNA NEED IT`, `DON'T REPEAT YOURSELF`, `LEAST ASTONISHMENT`, `OPEN FOR EXTENSION, CLOSED FOR CHANGE`,
  `DEVELOP AGAINST INTERFACES`, `AN INTERFACE TELLS ITS USER WHAT TO CONSIDER`, `AN INTERFACE HIDES ITS IMPLEMENTATION`,
  `A REMOTE INTERFACE NAMES HOW IT FAILS`, and `A MODULE INTERFACE IS MINIMAL`.
- **Added — the files:** `ONE DECISION STATES THE WHOLE ARCHITECTURE`, `ONE DECISION PER SUBSYSTEM`,
  `ONE MODULE, ONE FILE` (restored),
  `A MODULE FILE IS REVIEWED AS AN ARCHITECTURE DECISION IS`, `A DATA FORMAT IS DEFINED ONCE`.
- **Added — the derivation:** `ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES`,
  `THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE`, `AN ARCHITECTURE IS DERIVED FROM THE WHOLE TO ITS MODULES`,
  `THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT`, `NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY`.
- **Added — the checks:** `AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE`, `A CHANGE ACROSS MODULES IS CHECKED AS A WHOLE`,
  `AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS`, `EVERY USE CASE IS CHECKED AGAINST THE ARCHITECTURE`,
  `A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM`, `A MODULE IS CHECKED AGAINST ITS SUBSYSTEM`,
  `NO MODULE IS CHECKED AGAINST THE USE CASES`, `A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON`.
- **Changed:** `AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES` — its source only: the four
  parts are the PO's form, while book ch. 10 §2 says that decisions "need to be documented and can be revisited later";
  `A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES` — the module's own file again, as accepted on
  2026-09-24, now also stating the subsystem it belongs to and what the module implements; `A MODULE IS A FOLDER` — named after its identifier, its
  check the coverage report; `AN INTERFACE STATES ITS TYPES` — the errors its caller must handle instead of every refusal
  it can return, checked at review; `MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE` — checked at review;
  `THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION` — the whole architecture against the whole SPEC, the use
  cases being checked against the architecture by `EVERY USE CASE IS CHECKED AGAINST THE ARCHITECTURE`; checked at review; `AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT` — by that review only.
- **Withdrawn:** `A TYPE IS DEFINED ONCE, IN MACHINE-READABLE FORM`, `EVERY TYPE HAS A SAMPLE`,
  `EVERY INTERFACE HAS AN EXAMPLE`, `EVERY NAME IN AN ARCHITECTURE RESOLVES`, `EVERY USE-CASE STEP IS CARRIED BY AN INTERFACE`,
  `EVERY REQUIREMENT HAS ITS PLACE IN THE ARCHITECTURE`, `THE USE-CASE MAPPING IS REVIEWED`,
  `SKELETONS, DOCUMENTATION, SAMPLES AND TESTS ARE GENERATED FROM THE ARCHITECTURE`.
- The other 15 requirements of the section are carried over byte for byte.

This queue replaces queue 2026-10-05, which proposed `ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES` alone and
was not accepted; the requirement stands in this entry, with "an architecture" for "an architecture decision", so that it
covers module files too.

**Why.** PO decisions of 2026-10-05, taken after the architecture drafted from 2026-10-03 on was purged:

- "Use the definition in the book, from that we need to specify what an architecture is. Then we need to specify the
  process how it is converted from spec and use cases to architecture files."
- "I don't want any partial architecture design in the beginning."
- "Modules should describe what is implemented." Module interfaces are minimal but extensible, and modules are modular.
  The architecture implements the functions and software that make the use cases possible; it does not copy the use
  cases.
- "So architecture can describe at modular level but it cannot verify or refute implementation questions." — hence no
  test or CI run on an architecture.
- "I want checks, but never on partial work. It's done at the end to find problems. With agents that know the entire
  project. Review results always have to be considered with care. They can be wrong."
- Reviewers know the entire SPEC, the use cases, the architecture to check and the principles of ch. 10, "so chapter 10
  must be part of the spec of agent-m" — hence its definition, views, patterns and principles stand here as requirements,
  and every participant that receives the SPEC receives them.
- No architecture is designed against a use case that is not approved.
- "I don't want the modules checked against the usecases. The usecases must be checked against the architecture." —
  hence `EVERY USE CASE IS CHECKED AGAINST THE ARCHITECTURE` and `NO MODULE IS CHECKED AGAINST THE USE CASES`, and
  `YOU AREN'T GONNA NEED IT` in the book's words rather than as a trace from each part to a use case.
- "Modules must be checked against subsystems. Subsystems against systems." — hence
  `A SYSTEM IS DECOMPOSED INTO SUBSYSTEMS AND MODULES`, `A MODULE BELONGS TO ONE SUBSYSTEM`, `ONE DECISION PER SUBSYSTEM`,
  `A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM` and `A MODULE IS CHECKED AGAINST ITS SUBSYSTEM`. A subsystem is stated in an
  architecture decision, as the component level of the test levels already pairs "an architecture element (`ARC-`) and
  its modules" (UC-026), so no new kind of identifier is needed.

The three queues of 2026-10-03 (`2026-10-03_ohne-geschichte`, `2026-10-03b_architektur-generierbar`,
`2026-10-03c_architektur-review`) had withdrawn `ONE MODULE, ONE FILE`, moved modules into the decisions, and required
every use-case step to be carried by an interface, every requirement to be placed with a module, every interface to have
examples and every type samples, checked without a model on each part. The architecture drafted under them restated the
use cases as chains of interface calls, grew to 145,927 lines, of which 133,435 were JSON, and was checked part by part
by reviewers that saw only a share of the project. It has been purged; this entry removes the requirements that led to it.

`ONE MODULE, ONE FILE` is restored under its own name: it is the requirement the version history holds from 2026-09-29
to 2026-10-03, with "is described in" so that it fits `A MODULE IS A FOLDER`, and its name is given to nothing else.

**Impact list.** The artifacts outside this queue that name a changed or withdrawn requirement:

- `A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES`: UC-022, UC-023, UC-024, UC-025 (revised in the same push);
  the dashboard's module-file check `docs/assets/artifacts/checks.mjs` with `tests/artifacts-checks.test.mjs` and
  `tests/test_architecture_files.py`; `docs/backlog/ITM-138-module-files-and-code-agree-on-interfaces.md` and its test
  fixture copy; the dated measurement `docs/measurements/2026-09-30_review-dashboard-mutations.md`, which stays as it is.
- `A MODULE IS A FOLDER`: UC-022, UC-023, UC-024, UC-025.
- `AN INTERFACE STATES ITS TYPES`, `MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE`,
  `THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`: UC-022.
- `AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT`: UC-022, UC-023.
- The seven withdrawn requirements on types, samples, examples, names, use-case steps, placement and the use-case mapping:
  UC-022 only. `SKELETONS, DOCUMENTATION, SAMPLES AND TESTS ARE GENERATED FROM THE ARCHITECTURE`: UC-024 only.

The purged architecture files named these requirements as well; they are gone. UC-022 to UC-025 name requirements of this
queue and can be accepted once it is.
