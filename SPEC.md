# Agent M — Specification

**VERBINDLICH (SPEC)**

This is the single binding document of Agent M. A sentence belongs here when its violation would
be a defect. Everything else — how something is built, what was measured, what is planned —
belongs in `PLAN.md`, in `docs/measurements/`, or in the code, and does not bind.

**No section of this file is written by hand.** Each one is proposed in
`docs/spec-freigaben/<date>_<name>/`, shown next to the text it would replace, and written only
when the Product Owner accepts it there (`scripts/spec_dashboard.py` in the process repository).
That is why the sections below are still empty: the skeleton fixes the anchors, the approval
fixes the content.

**Form of a requirement** (from `SOFTWARE_MAINTENANCE.md`, *"Wie eine Anforderung aussieht"*):
a **name** in capitals that is the ID and never changes, a **source with a date**, one **rule**
stated as a single testable sentence, an **occasion** of one or two lines, and the **check** that
guards it. One statement per requirement — an "and" in the rule means it is two.

---

## 0. Hard product rules

These four hold for every version of Agent M. A change to any of them is a change to what the
product is.

**NO SERVER** *(PO A. Maier, 2026-09-23)*
Agent M is delivered as a static site, repository conventions, and optional workflows; the project
operates no server, no account system and no database.
*Occasion:* a book companion that requires an account is a service, and a service that outlives
the reader's interest in it is a liability. GitHub Pages plus the reader's own repository has no
such tail.
*Check:* `tests/test_no_backend.py` — the built site contains no call to an origin other than the
configured endpoint, the GitHub API, and the local bridge.

**ARTIFACTS ARE MARKDOWN** *(Vibe Coding, ch. 9 §6)*
Every artifact Agent M produces is Markdown, with diagrams written as Mermaid inside it.
*Occasion:* text-first artifacts can be versioned, diffed in a pull request, and read by both a
person and a model. Binary diagram formats break all three at once.
*Check:* `tests/test_artifact_format.py`

**NO SECRET IN THE REPOSITORY** *(PO A. Maier, 2026-09-23)*
No API key, access token or endpoint credential is written into a repository managed by Agent M.
*Occasion:* the reader's key is their own. A tool that can leak it into a public repository has
one failure mode too many, and the failure is not recoverable by deleting the commit.
*Check:* `tests/test_no_secret_written.py` — a generated artifact containing a configured secret
value fails the run.

**THE PRODUCT REPOSITORY IS SELF-SUFFICIENT** *(PO A. Maier, 2026-09-23)*
Removing Agent M leaves a complete, readable set of artifacts behind in the product repository.
*Occasion:* lock-in is the usual price of a workflow tool. Here it can be avoided for free,
because the artifacts were going to be Markdown anyway — so it is stated as a rule rather than
left to good intentions.
*Check:* `tests/test_self_sufficient.py` — no artifact references a file or service that exists
only inside Agent M.
## 1. Identity and traceability

**EVERY ARTIFACT HAS AN IDENTIFIER** *(PO A. Maier, 2026-09-23)*
Every artifact Agent M produces carries an identifier from the scheme `SRC-` · `REQ-` · `UC-` ·
`ARC-` · `MOD-` · `TST-`.
*Occasion:* an artifact that cannot be named cannot be referred to, and therefore cannot be traced
to what justified it or to what checks it.
*Check:* `tests/test_identifiers.py`

**THE NAME IS THE ID AND IT SURVIVES** *(SOFTWARE_MAINTENANCE.md, "Der Name ist die ID")*
An identifier travels with its artifact when the artifact moves between sections or files, and a
withdrawn identifier is never reused.
*Occasion:* a cosmetic renumbering in the process repository once broke references in fifteen
files without a single rule having changed. An address changes when things are rearranged; a name
does not.
*Check:* `tests/test_identifier_stability.py` — an identifier present in an earlier version and
absent now must carry a withdrawal note.

**EVERY ARTIFACT NAMES ITS ORIGIN** *(PO A. Maier, 2026-09-23)*
Each artifact names the identifiers of the artifacts it descends from: a requirement names its
source, a use case names the requirements it realises, a test names the requirement it guards.
*Occasion:* this is the V-model's horizontal arrow made mechanical. Without it, later evidence
floats free of the decisions it is supposed to support, and nobody can tell which requirement a
given test actually protects.
*Check:* `tests/test_origin_links.py`

**THE TRACEABILITY MATRIX IS DERIVED** *(PO A. Maier, 2026-09-23)*
The traceability matrix is computed from the artifacts and is never stored as a separately edited
document.
*Occasion:* a matrix maintained by hand is wrong most of the time and nobody notices, because the
document that would reveal the error is the document itself. A computed matrix is either correct
or visibly broken.
*Check:* `tests/test_matrix_derived.py`

**A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION** *(SOFTWARE_MAINTENANCE.md, same rule)*
A cross-reference names the identifier it points at, never a section number or line number.
*Occasion:* section numbers shift whenever a document is reorganised, and a reference that shifted
silently is worse than a missing one.
*Check:* `tests/test_references.py`
## 2. Requirement sources

**THE SOURCE MODEL IS GENERIC** *(PO A. Maier, 2026-09-23)*
A requirement source is a typed record with an identifier, a kind, and an authority; no particular
organisation, standard or system is built into Agent M.
*Occasion:* the Product Owner's instruction was explicit — organisations such as CBO or RRZE are
examples of a source, never the definition of one. A tool that knows about specific institutions
is useful to one reader and useless to the next.
*Check:* `tests/test_source_model.py` — no source identifier appears in Agent M's own code.

**A REQUIREMENT HAS A REGISTERED SOURCE** *(PO A. Maier, 2026-09-23)*
Every requirement names at least one registered source; a requirement without one cannot be
accepted.
*Occasion:* an unsourced requirement is indistinguishable from an invented one, and invented rules
are the expensive kind — the process repository states the general form as "nie raten": an honest
open question beats a confident wrong answer.
*Check:* `tests/test_requirement_has_source.py`

**A SOURCE DECLARES ITS AUTHORITY** 
A source declares whether it is `normative`, `advisory` or `informational`; the declaration is
made at the source, not inferred from how often it is cited.
*Occasion:* linking a document does not make it binding. Without the field, every source silently
becomes normative and a product acquires rules nobody agreed to.
*Check:* `tests/test_source_authority.py`

**A LIVING SOURCE IS PINNED** 
A source that is maintained elsewhere records the exact state that was read — a commit, a version,
or a retrieval date — and a requirement derived from it names that state.
*Occasion:* a standard maintained in a git repository published three versions in eight days. A
dated copy in one's own tree looks like provenance and is in fact a snapshot that drifts; the
commit is the honest record.
*Check:* `tests/test_source_pinned.py`

**THE SOURCE KIND IS ONE OF A CLOSED SET** 
A source has exactly one kind from: `organisation`, `person`, `standard`, `regulation`,
`document`, `system`, `measurement`.
*Occasion:* a free-text kind cannot be reasoned about. The closed set is what lets the dashboard
answer "which requirements rest on a regulation?" — the question that matters when a regulation
changes.
*Check:* `tests/test_source_kind.py`
## 3. Requirements

**A REQUIREMENT HAS FIVE FIELDS** 
A requirement consists of a name, a source with a date, a rule, an occasion, and a check.
*Occasion:* the five fields are what make a requirement approvable. A paragraph in which rule,
reason and measurement run together cannot be decided on — not because it is long, but because one
cannot see what one is deciding.
*Check:* `tests/test_requirement_fields.py`

**ONE STATEMENT PER REQUIREMENT** 
The rule of a requirement is a single statement; a rule containing "and" or "additionally" is two
requirements.
*Occasion:* two rules in one entry cannot be approved, changed or withdrawn separately, so the
entry becomes a package deal forever.
*Check:* `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the
decision stays human.

**A RULE IS CHECKABLE** 
A rule is stated so that it can be shown to hold or not hold.
*Occasion:* "Poppler wins on conflict" can be checked; "Docling is the expensive part" cannot — it
is a measurement, and it belongs in the occasion.
*Check:* no automatic check; at review.

**NO STATE IN THE SPECIFICATION** 
A requirement states the target, never the current condition of a system.
*Occasion:* "Poppler is not installed on the server" was true for exactly one day. Current
condition belongs in a check that establishes it, never in a document that asserts it.
*Check:* no automatic check; at review.

**A REQUIREMENT NAMES ITS CHECK** 
Every requirement names the test that guards it, or states explicitly that it is guarded only at
review.
*Occasion:* traceability is a field, not an assertion in code. A requirement with no named guard
is a wish, and a green test suite that does not know which requirements it protects proves
nothing about them.
*Check:* `tests/test_requirement_names_check.py`

**A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST** 
Before an existing requirement is changed, the artifacts that reference it are listed, and the
list is part of the proposal rather than a result reported afterwards.
*Occasion:* the renumbering that broke fifteen files would have produced the number "fifteen"
beforehand, had anyone looked. It was noticed afterwards.
*Check:* `tests/test_impact_list.py` — a change proposal touching an existing identifier carries
the derived reference list.
## 4. Use cases and models

**A USE CASE REALISES NAMED REQUIREMENTS** *(PO A. Maier, 2026-09-23)*
Every use case names the requirement identifiers it realises.
*Occasion:* a use case that realises nothing is either a missing requirement or a feature nobody
asked for, and the difference matters. Naming the requirements makes the question answerable
instead of arguable.
*Check:* `tests/test_usecase_realises.py`

**A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION** *(Vibe Coding, ch. 9 §2.1)*
A use-case description names its actor, its precondition, its main flow, its alternative flows,
and its postcondition.
*Occasion:* a use case captures a goal before it captures an implementation. Without the
precondition and postcondition it degrades into a feature list with actors attached.
*Check:* `tests/test_usecase_fields.py`

**DIAGRAMS ARE MERMAID IN MARKDOWN** *(Vibe Coding, ch. 9 §6)*
Every diagram is written as Mermaid inside the Markdown document it belongs to; no diagram is
stored as an image file.
*Occasion:* a diagram that is code can be versioned, diffed in a pull request, and read by a model
without visual parsing. An exported image can do none of these and drifts from the document it
illustrates.
*Check:* `tests/test_diagrams_are_mermaid.py`

**THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW** *(PO A. Maier, 2026-09-23)*
Where a diagram and its use-case description disagree, the description holds.
*Occasion:* Mermaid has no UML use-case diagram; the actor-and-ellipse notation is approximated
with a flowchart, as the reference project `akmaier/dvd_database` does. An approximation must not
be allowed to become the source of truth by accident.
*Check:* no automatic check; at review.

**UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier, 2026-09-23)*
A requirement with no use case and a use case with no requirement are both shown in the dashboard;
neither blocks a run.
*Occasion:* early in a product, unrealised requirements are the normal state. A gate that blocks
on them would train everyone to switch the gate off — the failure mode the process repository
records as a check that is red so often it stops being read.
*Check:* `tests/test_coverage_report.py`
## 5. Process models and profiles

**THE PROCESS MODEL IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-23)*
Each managed product declares exactly one process model; Agent M does not assume a default.
*Occasion:* choosing a process is risk balancing, not a methodology contest — each model manages
one risk well and accepts another. A tool that silently assumes one has made the choice for the
reader and hidden the trade-off.
*Check:* `tests/test_model_declared.py`

**THE CATALOGUE IS DATA** *(PO A. Maier, 2026-09-23)*
Process models are declarative definitions in data files, not code paths; adding a model requires
no change to Agent M's implementation.
*Occasion:* the catalogue will grow — the book alone names nine, and readers will bring their own.
A model encoded as branching logic makes the tenth model a refactor.
*Check:* `tests/test_catalogue_is_data.py` — no model name appears in Agent M's implementation.

**THE MODEL DETERMINES THE STAGES AND THE GATES** *(Vibe Coding, ch. 6–7)*
A model definition names its stages, their order, which stages pair for verification, and where
the gates sit; Agent M derives the workflow from that definition alone.
*Occasion:* this is the difference between offering process models and merely naming them. The
V-model's contribution is precisely that a decomposition step is paired with the check that will
verify it; if the pairing is not in the data, the model is decoration.
*Check:* `tests/test_workflow_from_model.py`

**AGENT M CARRIES THE BOOK'S CATALOGUE** *(Vibe Coding, ch. 6–7)*
The shipped catalogue contains waterfall, V-model, reuse-oriented, incremental/prototyping, agile,
Kanban, Scrum, DevOps, and disciplined agile delivery at scale.
*Occasion:* Agent M is the book's companion. A reader who has just read chapter 6 must find the
models of chapter 6.
*Check:* `tests/test_catalogue_complete.py`

**A PROFILE ADDS, IT DOES NOT REPLACE** *(Vibe Coding, ch. 6, regulated-software section)*
A profile — for example IEC 62304 safety class A, B or C — adds required artifacts and evidence to
whatever model is underneath; it never substitutes for the model.
*Occasion:* a regulated project does not stop being agile, it acquires obligations. Modelling
regulation as a separate process model would force the reader to abandon the working rhythm in
order to satisfy an auditor.
*Check:* `tests/test_profile_is_additive.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier, 2026-09-23)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next stage opens.
*Occasion:* an unnamed gate is a pause, not a check. The point of a phase gate is that somebody
can say afterwards what was verified at it.
*Check:* `tests/test_gate_definition.py`
## 6. Runtimes

*(not yet approved — proposal 07)*

## 7. Configuration and secrets

*(not yet approved — proposal 08)*

## 8. Versioning

*(not yet approved — proposal 09)*

## 9. Human gates

*(not yet approved — proposal 10)*
