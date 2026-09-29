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
configured endpoint, the GitHub API, the GitLab servers of the listed products, and the local bridge.

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

**EVERY ARTIFACT HAS AN IDENTIFIER** *(PO A. Maier, 2026-09-23, extended 2026-09-24)*
Every artifact Agent M produces carries an identifier: a requirement its name, every other artifact
one from the scheme `SRC-` · `UC-` · `ARC-` · `MOD-` · `TST-` · `ITM-` · `RES-` · `JOB-`.
*Occasion:* an artifact that cannot be named cannot be referred to, and therefore cannot be traced
to what justified it or to what checks it. PO, 2026-09-24: backlog items (`ITM-`) and resources
(`RES-`) are artifacts too — jobs, pull requests and tests refer to them; and "jobs need identifiers"
(`JOB-`). A requirement is named by
its name in capitals (`THE NAME IS THE ID AND IT SURVIVES`); the `REQ-` prefix of the first version
was never used.
*Check:* `tests/test_identifiers.py`

**THE NAME IS THE ID AND IT SURVIVES** *(SOFTWARE_MAINTENANCE.md, "Der Name ist die ID")*
An identifier travels with its artifact when the artifact moves between sections or files, and a
withdrawn identifier is never reused.
*Occasion:* a cosmetic renumbering in the process repository once broke references in fifteen
files without a single rule having changed. An address changes when things are rearranged; a name
does not.
*Check:* `tests/test_identifier_stability.py` — an identifier present in an earlier version and
absent now must carry a withdrawal note.

**EVERY ARTIFACT NAMES ITS ORIGIN** *(PO A. Maier, 2026-09-23, extended 2026-09-24)*
Each artifact names the identifiers of the artifacts it descends from: a requirement names its
source, a use case names the requirements it realises, an architecture decision names the
requirements or use cases that force it, a module names the requirements or use cases it realises
and the architecture decisions it follows, a code file names the one module it belongs to, and a
test names the requirement it guards and the module it exercises.
*Occasion:* this is the V-model's horizontal arrow made mechanical. Without it, later evidence
floats free of the decisions it is supposed to support, and nobody can tell which requirement a
given test actually protects. PO, 2026-09-24: modules must be validated against "which
specification and … which test cases they belong" to — which only works if code and tests say so.
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

**ARTIFACTS ARE ARRANGED IN NESTED GROUPS** *(PO A. Maier, 2026-09-24)*
Requirements, use cases, architecture elements, modules and tests can each be arranged in a
hierarchy of named groups of any depth.
*Occasion:* PO, 2026-09-24: these artifacts "need to allow grouping to form hierarchy". The book
describes requirements at different levels of detail (ch. 8 §1.1) and a backlog that needs "more
structure than a pile of wishes" (ch. 8 §3.2); a flat list of a hundred items offers neither.
*Check:* `tests/test_groups.py`

**A GROUP CARRIES NO IDENTIFIER** *(PO A. Maier, 2026-09-24)*
A group is named by its title and carries no identifier of the kind `EVERY ARTIFACT HAS AN IDENTIFIER`
gives artifacts.
*Occasion:* a group has no rule, no flow and no check of its own. Given an identifier, a use case
could "realise" a heading and a test could "guard" a chapter, and the derived matrix would report
coverage that nobody verified.
*Check:* `tests/test_groups.py` — no artifact names a group title where an identifier is expected.

**A GROUP HOLDS ONE KIND OF ARTIFACT** *(PO A. Maier, 2026-09-24)*
A group contains items and groups of one kind of artifact only.
*Occasion:* how a use case relates to a requirement is traceability, which is derived
(`THE TRACEABILITY MATRIX IS DERIVED`). A group mixing both kinds would be a second, hand-kept
matrix.
*Check:* `tests/test_groups.py`

**AN ITEM HAS ONE PLACE IN ITS HIERARCHY** *(PO A. Maier, 2026-09-24)*
Every item appears exactly once in the hierarchy of its kind, either in one group or at the top
level.
*Occasion:* a hierarchy in which an item sits in two places is a set of tags; counting per group
then counts some items twice, and moving an item leaves a copy behind.
*Check:* `tests/test_groups.py`

**EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN** *(PO A. Maier, 2026-09-24)*
The groups of each kind of artifact — requirements, use cases, architecture decisions, modules,
tests — are recorded in a file of their own under `docs/groups/` of the product repository, which
names each member by its identifier.
*Occasion:* PO, 2026-09-24: "groups should have new files." Kept apart from the artifacts and from
the SPEC's sections, a hierarchy can be rearranged without touching what it arranges, and it stays
readable without Agent M (`THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`).
*Check:* `tests/test_groups.py`

**REGROUPING LEAVES THE GROUPED FILE UNCHANGED** *(PO A. Maier, 2026-09-24)*
Moving a requirement, use case, architecture decision, module or test to another group changes no
byte of the SPEC or of the artifact's file.
*Occasion:* acceptance names a file's blob SHA (`AN APPROVAL NAMES THE EXACT TEXT`). If a group were
written into the file — or into the SPEC — tidying up the hierarchy would send every moved, accepted
artifact back to review.
*Check:* `tests/test_groups.py` — blob SHAs of `SPEC.md` and of all artifact files are equal before
and after a regrouping.

**AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL** *(PO A. Maier, 2026-09-24)*
An item that no group names is shown at the top level of its hierarchy.
*Occasion:* new use cases arrive from a derivation (UC-007) before anyone has placed them. A
hierarchy that shows only grouped items would hide exactly the items nobody has looked at yet.
*Check:* `tests/test_groups.py`

**THE BROWSER SHOWS ANY RELEASED VERSION** *(PO A. Maier, 2026-09-24)*
The specification browser shows a product's requirements as they stand at any released version or
on the current default branch, as the reader chooses.
*Occasion:* PO, 2026-09-24, asked for a "specification browser". "Which rules did version 2026.3.0
have to meet?" is the question an audit or a bug report asks, and a release tag
(`A RELEASE IS TAGGED AND LOGGED`) makes it answerable.
*Check:* `tests/test_spec_browser.py`

**A REQUIREMENT SHOWS WHAT TRACES TO IT** *(PO A. Maier, 2026-09-24)*
For each requirement, the browser lists its sources and every use case, architecture element, module
and test that names it, as derived from the version shown.
*Occasion:* the coverage view answers "what is missing?"; a reader deciding whether to change one
requirement needs the other direction — everything that hangs on it.
*Check:* `tests/test_spec_browser.py`

**OPEN PROPOSALS ARE SHOWN IN THE BROWSER** *(PO A. Maier, 2026-09-24)*
Every requirement that an open queue entry would add, change or withdraw is shown in the browser
with that entry's status and a link to it.
*Occasion:* a reader who sees only the SPEC does not know that half a section is about to change.
The SPEC holds only accepted text; the queues hold what is under way.
*Check:* `tests/test_spec_browser.py`

**A REQUIREMENT SHOWS ITS HISTORY** *(PO A. Maier, 2026-09-24)*
For each requirement, the browser lists every accepted change to its text with date, accepting
person, and the text before and after.
*Occasion:* the book's point that requirements "keep moving" (ch. 8 §6) is only useful if one can see
how a given one moved. Approval records and git history already hold every step
(`THE GATE IS RECORDED`).
*Check:* `tests/test_spec_browser.py`


**A REGROUPING IS COMMITTED DIRECTLY** *(PO A. Maier, 2026-09-24)*
A change to a group file is the person's own input and is committed to the default branch when they
save it.
*Occasion:* a group arranges artifacts and decides nothing about them; with groups in files of their
own, rearranging them needs no approval (`A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`).
*Check:* `tests/test_groups.py`
## 2. Requirement sources

**THE SOURCE MODEL IS GENERIC** *(PO A. Maier, 2026-09-23)*
A requirement source is a typed record with an identifier, a kind, and an authority; no particular
organisation, standard or system is built into Agent M.
*Occasion:* the Product Owner's instruction was explicit — organisations such as CBO or RRZE are
examples of a source, never the definition of one. A tool that knows about specific institutions
is useful to one reader and useless to the next.
*Check:* `tests/test_source_model.py` — no source identifier appears in Agent M's own code.

**A REQUIREMENT HAS A REGISTERED SOURCE** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
Every requirement names at least one source linked to its product; a requirement without one cannot
be accepted.
*Occasion:* an unsourced requirement is indistinguishable from an invented one, and invented rules
are the expensive kind — the process repository states the general form as "nie raten": an honest
open question beats a confident wrong answer.
*Check:* `tests/test_requirement_has_source.py`

**A SOURCE DECLARES ITS AUTHORITY** *(PO A. Maier, 2026-09-23)*
A source declares whether it is `normative`, `advisory` or `informational`; the declaration is
made at the source, not inferred from how often it is cited.
*Occasion:* linking a document does not make it binding. Without the field, every source silently
becomes normative and a product acquires rules nobody agreed to.
*Check:* `tests/test_source_authority.py`

**A LIVING SOURCE IS PINNED** *(PO A. Maier, 2026-09-23)*
A source that is maintained elsewhere records the exact state that was read — a commit, a version,
or a retrieval date — and a requirement derived from it names that state.
*Occasion:* a standard maintained in a git repository published three versions in eight days. A
dated copy in one's own tree looks like provenance and is in fact a snapshot that drifts; the
commit is the honest record.
*Check:* `tests/test_source_pinned.py`

**THE SOURCE KIND IS ONE OF A CLOSED SET** *(PO A. Maier, 2026-09-23)*
A source has exactly one kind from: `organisation`, `person`, `standard`, `regulation`,
`document`, `system`, `measurement`.
*Occasion:* a free-text kind cannot be reasoned about. The closed set is what lets the dashboard
answer "which requirements rest on a regulation?" — the question that matters when a regulation
changes.
*Check:* `tests/test_source_kind.py`

**THE INSTANCE KEEPS THE SOURCE REGISTER** *(PO A. Maier, 2026-09-24)*
An instance lists every requirement source it knows in `docs/sources/` of its own repository, one
file per source.
*Occasion:* sources are reused across products — a law, a norm, an organisation's guidelines. Kept
per product, each product would register the same law again, in a slightly different version.
*Check:* `tests/test_source_register.py`

**A PRODUCT LINKS THE SOURCES THAT APPLY** *(PO A. Maier, 2026-09-24)*
A product names the sources that apply to it in `docs/sources.md` of its own repository, each with
the exact version it uses.
*Occasion:* which rules a product must meet is a fact about the product, and belongs beside its
code; the register only says which sources exist.
*Check:* `tests/test_source_links.py`

**A LINK NAMES THE PART THAT APPLIES** *(PO A. Maier, 2026-09-24)*
A link may name the part of a source that applies to the product — a safety class, a chapter, a set
of articles.
*Occasion:* IEC 62304 applies to a product in one safety class, the EU AI Act in the provisions for
one risk category. The class is not a version of the norm and not a property of the norm; it is a
property of the link.
*Check:* `tests/test_source_links.py`

**A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY** *(PO A. Maier, 2026-09-24)*
The content of a source is a set of files (PDF, Word, Markdown), a zip archive of such files, or a
repository at a named commit.
*Occasion:* requirements arrive as a folder of PDFs, a Word document from a partner, a Markdown
repository, or a zip someone mailed. All of them must be registrable without conversion first.
*Check:* `tests/test_source_register.py`

**A SOURCE DECLARES ITS LICENCE** *(PO A. Maier, 2026-09-24)*
Every source records the licence or terms under which its content may be copied.
*Occasion:* the next rule depends on it. A norm such as IEC 62304 is sold and copyrighted; an
organisation's guidelines are internal; EU legal texts may be reused with acknowledgement.
*Check:* `tests/test_source_register.py`

**RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE** *(PO A. Maier, 2026-09-24)*
The content of a source is stored in the instance repository only if its licence permits public
redistribution; otherwise it stays in a repository the person names, public or private.
*Occasion:* the instance is a public fork. A paid norm or an internal document committed there is
published — and the history keeps it after deletion. The register entry of such a source is public,
its content is not; the register says so before a source is saved.
*Check:* `tests/test_source_register.py`

**A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH** *(PO A. Maier, 2026-09-24)*
Every version of a source records its official identifier or edition, its date, and the SHA-256 of
every file that was read.
*Occasion:* "which version of the norm did we build against?" must have an answer months later.
The identifier says which version was meant; the hash proves which bytes were actually read.
*Check:* `tests/test_source_register.py`

**A SOURCE VERSION IS NEVER OVERWRITTEN** *(PO A. Maier, 2026-09-24)*
A new edition of a source is added as a new version, and existing versions stay unchanged.
*Occasion:* products stay linked to the version they were built against until someone decides to
move them; overwriting would move them silently.
*Check:* `tests/test_source_register.py`

**A STANDARD IS REGISTERED BY ITS DESIGNATION** *(PO A. Maier, 2026-09-24)*
A standard is registered by its full designation, including edition and amendments — for example
`IEC 62304:2006+AMD1:2015`.
*Occasion:* "IEC 62304" names a family of documents; the designation names one. An amendment can
change requirements, so the version must say whether it is included.
*Check:* `tests/test_source_register.py`

**AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY** *(PO A. Maier, 2026-09-24)*
An EU legal text is registered from its EUR-Lex or ELI address, and a workflow of the instance
fetches it from the EU's publication repository, recording the retrieval date and the repository's
version identifier.
*Occasion:* measured 2026-09-24 for the AI Act (CELEX 32024R1689): the browser cannot fetch it —
EUR-Lex answers scripts with an empty `202`, the EU's Cellar repository sends the text without a
cross-origin permission. Server-side, Cellar delivers the full text (1.26 MB) at a versioned address.
EU legal texts may be reused with acknowledgement, so the fetched text is stored in the instance
repository.
*Check:* `tests/test_fetch_legal_text.py`
## 3. Requirements

**A REQUIREMENT HAS FIVE FIELDS** *(PO A. Maier, 2026-09-23)*
A requirement consists of a name, a source with a date, a rule, an occasion, and a check.
*Occasion:* the five fields are what make a requirement approvable. A paragraph in which rule,
reason and measurement run together cannot be decided on — not because it is long, but because one
cannot see what one is deciding.
*Check:* `tests/test_requirement_fields.py`

**ONE STATEMENT PER REQUIREMENT** *(PO A. Maier, 2026-09-23)*
The rule of a requirement is a single statement; a rule containing "and" or "additionally" is two
requirements.
*Occasion:* two rules in one entry cannot be approved, changed or withdrawn separately, so the
entry becomes a package deal forever.
*Check:* `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the
decision stays human.

**A RULE IS CHECKABLE** *(PO A. Maier, 2026-09-23)*
A rule is stated so that it can be shown to hold or not hold.
*Occasion:* "Poppler wins on conflict" can be checked; "Docling is the expensive part" cannot — it
is a measurement, and it belongs in the occasion.
*Check:* no automatic check; at review.

**NO STATE IN THE SPECIFICATION** *(PO A. Maier, 2026-09-23)*
A requirement states the target, never the current condition of a system.
*Occasion:* "Poppler is not installed on the server" was true for exactly one day. Current
condition belongs in a check that establishes it, never in a document that asserts it.
*Check:* no automatic check; at review.

**A REQUIREMENT NAMES ITS CHECK** *(PO A. Maier, 2026-09-23)*
Every requirement names the test that guards it, or states explicitly that it is guarded only at
review.
*Occasion:* traceability is a field, not an assertion in code. A requirement with no named guard
is a wish, and a green test suite that does not know which requirements it protects proves
nothing about them.
*Check:* `tests/test_requirement_names_check.py`

**A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST** *(PO A. Maier, 2026-09-23)*
Before an existing requirement is changed, the artifacts that reference it are listed, and the
list is part of the proposal rather than a result reported afterwards.
*Occasion:* the renumbering that broke fifteen files would have produced the number "fifteen"
beforehand, had anyone looked. It was noticed afterwards.
*Check:* `tests/test_impact_list.py` — a change proposal touching an existing identifier carries
the derived reference list.

**A REQUIREMENT NAMES WHAT IT CONSTRAINS** *(PO A. Maier, 2026-09-24)*
Every requirement states whether it constrains the product or the development process.
*Occasion:* a requirement source may impose rules on either. "The export is a PDF" constrains the
product; "every change to a safety-relevant unit is verified and the verification is recorded"
constrains how the product is developed. Only the second kind changes the workflow (§5), so Agent M
has to know which is which.
*Check:* `tests/test_requirement_fields.py`

**DERIVATION SEES THE EXISTING REQUIREMENTS** *(PO A. Maier, 2026-09-24)*
When requirements are derived, every requirement of the product — in its SPEC and in its open change
queues — is part of the input the deriving participant receives.
*Occasion:* PO, 2026-09-24: "Any derivation of new requirements should also have the old ones in
context and modify them instead of duplicating them." A model that sees only the source text cannot
know what is already specified.
*Check:* `tests/test_derivation_context.py`

**NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY** *(PO A. Maier, 2026-09-24)*
If the existing requirements do not fit into the deriving participant's context, the run stops and
says so before anything is sent.
*Occasion:* a deduplication that silently misses part of the SPEC produces exactly the duplicates it
exists to prevent, and looks as if it worked.
*Check:* `tests/test_derivation_context.py`

**A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT** *(PO A. Maier, 2026-09-24)*
Every derived candidate is classified as a new requirement, a change to a named existing requirement,
a duplicate of one, or a conflict with one.
*Occasion:* only a new requirement becomes a new entry; the other three touch something that exists,
and each needs a different treatment.
*Check:* `tests/test_derivation_classes.py`

**EXACT DUPLICATES ARE FOUND WITHOUT A MODEL** *(PO A. Maier, 2026-09-24)*
A candidate whose name or normalised rule text equals an existing requirement's is classified as a
duplicate deterministically, before any model classification.
*Occasion:* what can be decided without a model is decided without one (SOFTWARE_MAINTENANCE.md
§4.0a rule 3): reproducible, fast, and it cannot be argued with.
*Check:* `tests/test_derivation_classes.py`

**THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED** *(PO A. Maier, 2026-09-24)*
How often the model classifies a candidate correctly is measured as a rate on a fixed set of
examples, and every classification is shown to a person, who can change it.
*Occasion:* "states the same rule in other words" is a judgement a model makes stochastically. Its
quality is a number over many cases, not a verdict on one (§4.0a rule 4).
*Check:* `tests/test_derivation_classes.py` — the rate is reported, not gated.

**A CHANGE IS PROPOSED UNDER THE EXISTING NAME** *(PO A. Maier, 2026-09-24)*
A candidate that changes an existing requirement is proposed as a change to that requirement, under
its name, with its current text beside it and its impact list.
*Occasion:* a changed rule under a new name leaves the old one standing, and the SPEC then contains
both — the duplication this pass exists to prevent.
*Check:* `tests/test_derivation_classes.py`

**A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT** *(PO A. Maier, 2026-09-24)*
A candidate that restates an existing requirement is proposed as an additional source of that
requirement, never as a new requirement.
*Occasion:* when a second source demands the same thing, that is valuable — the requirement now has
two reasons — but it is still one requirement.
*Check:* `tests/test_derivation_classes.py`

**A CONFLICT IS DECIDED BY A PERSON** *(PO A. Maier, 2026-09-24)*
A candidate that contradicts an existing requirement is shown beside it, with both sources and their
authority, and is neither applied nor dropped until a person decides.
*Occasion:* a normative source contradicting an advisory one, or two laws pulling in different
directions, is a decision with consequences, not a formatting question.
*Check:* `tests/test_derivation_classes.py`

**CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES** *(PO A. Maier, 2026-09-24)*
Candidates of one run that state the same rule are merged into one candidate, naming every passage
they came from, before they are compared with the existing requirements.
*Occasion:* a long source states the same obligation in several places; a model extracting from it
produces the same candidate several times.
*Check:* `tests/test_derivation_classes.py`
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
## 5. Process models and practices

**THE PROCESS MODEL IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-23)*
Each managed product declares exactly one process model; Agent M does not assume a default.
*Occasion:* choosing a process is risk balancing, not a methodology contest — each model manages
one risk well and accepts another. A tool that silently assumes one has made the choice for the
reader and hidden the trade-off.
*Check:* `tests/test_model_declared.py`

**THE CATALOGUE IS DATA** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
Process models and practices are declarative definitions in data files, not code paths; adding one
requires no change to Agent M's implementation.
*Occasion:* the catalogue will grow — readers will bring the process their organisation actually
runs. A model encoded as branching logic makes the next model a refactor.
*Check:* `tests/test_catalogue_is_data.py` — no model or practice name appears in Agent M's
implementation.

**THE MODEL DETERMINES THE STAGES AND THE GATES** *(Vibe Coding, ch. 6–7; reworded 2026-09-24 — withdrawn 2026-09-24)*
*Withdrawn:* the PO chose the book's word "phase" for the parts of a process model (ch. 6) and "job"
for a run; "stage" is not used any more. Replaced by `THE MODEL DETERMINES THE PHASES AND THE GATES`.
The name is not reused.

**THE MODEL DETERMINES THE PHASES AND THE GATES** *(Vibe Coding, ch. 6–7; PO A. Maier, 2026-09-24)*
A model definition names its phases, the transitions between them, which phases pair for
verification, and where the gates sit; Agent M derives the workflow from that definition together with the product's process
requirements.
*Occasion:* this is the difference between offering process models and merely naming them. The
V-model's contribution is precisely that a decomposition step is paired with the check that will
verify it; if the pairing is not in the data, the model is decoration. Transitions rather than a
single order, because the book's reuse-oriented model runs discovery and evaluation side by side,
returns from requirements refinement to the specification, and chooses between configuring, adapting
and developing (ch. 6 §5). Process requirements add to it (`A PROCESS REQUIREMENT ADDS TO THE MODEL`).
*Check:* `tests/test_workflow_from_model.py` — each of the five catalogue models, the reuse-oriented
one included, yields its workflow.

**AGENT M CARRIES THE BOOK'S CATALOGUE** *(Vibe Coding, ch. 6–7, 14; corrected 2026-09-24)*
The shipped catalogue contains the book's process models — waterfall, V-model, reuse-oriented, Scrum
and Kanban — and, separately, its practices: DevOps, prototyping, incremental delivery, and the
scaling layers of disciplined agile delivery.
*Occasion:* Agent M is the book's companion, so it follows the book's classification. The first
version listed nine "models"; cross-checked against the book on 2026-09-24, only five are process
models there. Agile is the family behind Scrum and Kanban (ch. 7: the Manifesto is four value
statements), DevOps is "a set of practices" (ch. 7), prototyping and incremental delivery are
change-management techniques (ch. 14), and disciplined agile delivery is a scaling layer (ch. 7).
*Check:* `tests/test_catalogue_complete.py`

**A PROFILE ADDS, IT DOES NOT REPLACE** *(Vibe Coding, ch. 6 — withdrawn 2026-09-24)*
*Withdrawn:* a standard such as IEC 62304 is not part of the process model but a requirement source
whose rules may constrain the process. Replaced by `A PROCESS REQUIREMENT ADDS TO THE MODEL`. The
name is not reused.

**A PROCESS REQUIREMENT ADDS TO THE MODEL** *(PO A. Maier, 2026-09-24)*
A requirement that constrains the development process adds artifacts or gates to the declared
process model and never replaces the model.
*Occasion:* the book describes IEC 62304 as defining "lifecycle processes" whose safety classes
align with the V-model (ch. 6) — rules the work must satisfy, whichever model organises it. A
regulated project does not stop being Scrum; it acquires obligations. Filing the standard as a
"profile" inside the model catalogue mixed the two.
*Check:* `tests/test_process_requirement_is_additive.py`

**A PROCESS MODEL ORGANISES PEOPLE AND AGENTS** *(PO A. Maier, 2026-09-24)*
A process model names the roles of the work and, for each role, whether a person, an agent, or
either may fill it.
*Occasion:* the process model answers how a product is developed — in Agent M by a team of people
and agents. Who decides, who builds and who checks is the first thing a team of agents needs to
know, and the one thing a list of phases does not say.
*Check:* `tests/test_model_roles.py`

**A PRACTICE IS NOT A MODEL** *(PO A. Maier, 2026-09-24)*
A practice — DevOps, prototyping, incremental delivery, a scaling layer — is added to a declared
process model and is never chosen instead of one.
*Occasion:* the book presents these as practices and techniques that work with several models
(ch. 7, 14). Offering them as alternatives to Scrum or the V-model would ask the author a question
that has no answer.
*Check:* `tests/test_model_declared.py`

**A GATE NAMES WHAT IT CHECKS** *(PO A. Maier, 2026-09-23)*
Every gate in a model definition names the artifacts that must exist and the condition that must
hold before the next phase opens.
*Occasion:* an unnamed gate is a pause, not a check. The point of a phase gate is that somebody
can say afterwards what was verified at it.
*Check:* `tests/test_gate_definition.py`

**PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE** *(PO A. Maier, 2026-09-24)*
An instance lists its participants — people and agents — in `docs/participants.md` of its own
repository, and a product assigns its roles from that list.
*Occasion:* the same people and the same agents work on several products. Configuring them inside
each product's process choice would repeat the setup and let the copies drift apart.
*Check:* `tests/test_participants.py`

**A PARTICIPANT HAS ONE OF FIVE TYPES** *(PO A. Maier, 2026-09-24)*
A participant is a person, a model endpoint, a CI agent, a CLI agent on a machine, or a sandboxed
agent in a virtual machine or container.
*Occasion:* PO, 2026-09-24: participants "can be different human users or agent models … from an
endpoint model all the way to a full agent that lives in a virtual machine or cli environment". The
five types differ in how Agent M reaches them — the dashboard, the browser, a workflow, the local
bridge, the bridge through a tunnel.
*Check:* `tests/test_participants.py`

**A PARTICIPANT DECLARES ITS CAPABILITIES** *(PO A. Maier, 2026-09-24)*
Each participant states which of these it can do: draft text, read the repository, write to the
repository, run code and tests, use tools, reach the web.
*Occasion:* an endpoint model drafts text and nothing else; a CLI agent can run the test suite. A
role that must run tests cannot be filled by the first, and the difference must be data, not a
person's memory.
*Check:* `tests/test_participants.py`

**A ROLE NAMES THE CAPABILITIES IT NEEDS** *(PO A. Maier, 2026-09-24)*
A role in a process model names the capabilities its holder must have, and only a participant with
all of them can be assigned to it.
*Occasion:* assigning a participant that cannot do the work fails late — at the first job that
needs the missing capability. Checking at assignment fails early, with the reason.
*Check:* `tests/test_model_roles.py`

**A PARTICIPANT DECLARES WHERE IT PROCESSES DATA** *(PO A. Maier, 2026-09-24)*
Each participant that is not a person states where the data given to it is processed — for example
"this machine", "NHR@FAU, Erlangen", "a provider in the USA".
*Occasion:* whatever a participant receives leaves the author's control to that place. The author
can only decide what may go there if the place is written down.
*Check:* `tests/test_participants.py`

**RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS** *(PO A. Maier, 2026-09-24)*
Content of a source whose licence is restricted is given only to participants whose processing place
the source's register entry permits.
*Occasion:* a bought norm or an internal document sent to an external model may breach its licence
or its owner's rules. The register entry names the permitted places; Agent M refuses to send it
anywhere else, and says why.
*Check:* `tests/review-core.test.mjs`
## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier, 2026-09-23)*
The prompts, schemas and job definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Occasion:* three independently maintained copies of one rule were the root cause of an entire
measurement complex in the process repository — each copy knew phrases the others lacked, and
nobody could say which was right. Three runtimes make that failure three times as likely.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A RUNTIME IS INTERCHANGEABLE** *(PO A. Maier, 2026-09-23)*
The same job, given the same inputs, produces the same kind of artifact in all three runtimes.
*Occasion:* if runtimes differ in what they produce, the choice of runtime becomes a hidden
product decision and a reader cannot move between them.
*Check:* `tests/test_runtime_parity.py`

**THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY** *(PO A. Maier, 2026-09-23)*
The local bridge accepts a bind address of `127.0.0.1`, `::1` or `localhost` and refuses any other.
*Occasion:* the bridge hands work to a CLI session that is already authenticated on the machine.
Its protection is the loopback bind; a tool that can be started on a LAN address has none.
*Check:* `tests/test_bridge_loopback.py`

**REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL** *(PO A. Maier, 2026-09-23)*
Remote work reaches the local bridge only through an authenticated tunnel or port forward, such as
SSH, that ends on the bridge's loopback address.
*Occasion:* working from another machine is a legitimate need. A tunnel meets it without widening
the bind: the bridge stays invisible on the network, and the tunnel brings its own authentication.
*Check:* `tests/test_bridge_tunnel.py` — the bridge answers through a forwarded loopback port and
on no non-loopback interface.

**THE LOCAL BRIDGE REQUIRES A TOKEN** *(PO A. Maier, 2026-09-23, reworded 2026-09-25)*
The bridge rejects any request that does not carry the token it was paired with.
*Occasion:* loopback is not a permission boundary between programs on the same machine. Any local
process, including a page from an unrelated site, can reach a loopback port.
*Check:* `tests/test_bridge_token.py`

**THE BRIDGE IS PAIRED ONCE** *(PO A. Maier, 2026-09-25)*
The bridge keeps its token across restarts, in a file outside every repository that only its user can
read, until the person pairs it anew.
*Occasion:* a token printed at every start has to be copied into the dashboard after every restart of
the machine — the step people give up on. Kept like a CLI's own login, the pairing survives; the file
permission keeps other users of the machine out, and *pair anew* replaces a token that may have leaked.
*Check:* `tests/test_bridge_token.py` — after a restart the stored token is accepted and the file is
readable by its owner only; counter-proof: after *pair anew* the old token is rejected.

**AN UNSUPPORTED ENDPOINT SAYS SO** *(PO A. Maier, 2026-09-23)*
When a configured endpoint cannot be called from the browser, Agent M names the reason and the
runtimes that would work instead; it does not report a generic failure.
*Occasion:* browser access to model endpoints is not uniform — some providers reject cross-origin
calls outright, others require an explicit opt-in header, and self-hosted gateways depend on local
configuration. A reader facing an opaque error will conclude the tool is broken.
*Check:* `tests/test_endpoint_diagnosis.py`

**BROWSER REACHABILITY IS MEASURED, NOT ASSUMED** *(PO A. Maier, 2026-09-23)*
Before a runtime is released, the browser behaviour it depends on is measured on current browsers
and the result is recorded in `docs/measurements/`.
*Occasion:* the two mechanisms this design rests on — cross-origin calls to model endpoints, and
Private Network Access preflights or SSH for the local bridge — are documented and neither is
verified here. A design built on an unverified mechanism fails late and expensively.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
## 7. Configuration and secrets

**CONFIGURATION LIVES IN THE BROWSER** *(PO A. Maier, 2026-09-23)*
Endpoint, model, model API key and the repository tokens are stored in the browser of the person
using the site; Agent M has no other store for them.
*Occasion:* the Product Owner's requirement — no API key is exposed to the repository. With no
server (§0) the browser is the only place left, which makes the property structural rather than a
promise.
*Check:* `tests/test_config_client_side.py`

**CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE** *(PO A. Maier, 2026-09-23)*
Configuration is written to `localStorage`; Agent M sets no cookie carrying configuration or
credentials.
*Occasion:* a cookie set on the Pages origin is attached to every request to that origin and
therefore travels to GitHub's servers on each page load — the exposure the requirement exists to
prevent. `localStorage` is read only by script on the page and is never transmitted.
*Check:* `tests/test_no_config_cookie.py`

**A CREDENTIAL IS NEVER PLACED IN A URL** *(PO A. Maier, 2026-09-23)*
No key, token or credential appears in a query string, a fragment, or a link.
*Occasion:* URLs are logged by proxies, kept in browser history, and pasted into bug reports. A
credential that has been in a URL must be assumed to have leaked.
*Check:* `tests/test_no_credential_in_url.py`

**A TOKEN IS SCOPED TO WHAT IT WRITES** *(PO A. Maier, 2026-09-23)*
Every repository token Agent M asks for carries write access only to the repositories of the
instance and the products it manages.
*Occasion:* each managed product is its own repository, so the page needs cross-repository access.
An account-wide token to edit one product's requirements is more authority than the task needs,
and the reader is the one who bears the consequence.
*Check:* `tests/test_token_scope_documented.py` — the configuration screen states the minimum
scope and why each part is needed.

**THE PAGE STATES WHAT IT SENDS WHERE** *(PO A. Maier, 2026-09-23)*
Before a run, Agent M names every destination it will contact and what it will send there.
*Occasion:* a reader is about to send their requirements — possibly their employer's requirements —
to a third-party model endpoint. That is a decision they should make knowingly, once, rather than
discover afterwards.
*Check:* `tests/test_destination_disclosure.py`

**A CLEAR IS A REAL CLEAR** *(PO A. Maier, 2026-09-23)*
Clearing the configuration removes the stored credentials from the browser, not only from the
displayed form.
*Occasion:* a reset that leaves the key in storage is worse than no reset, because the reader
believes the key is gone.
*Check:* `tests/test_clear_removes_storage.py`

**THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN** *(PO A. Maier, 2026-09-23)*
Agent M uses a fine-grained personal access token that the person creates on github.com and pastes
into Agent M's settings.
*Occasion:* a "Sign in with GitHub" flow exchanges a code for a token, and that exchange needs a
server (§0 `NO SERVER`). A pasted token needs none, and the person decides its scope and expiry on
GitHub's own page.
*Check:* no automatic check; at review.

**THE TOKEN IS SENT ONLY TO GITHUB** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* products may live on GitLab servers, whose tokens go to those servers. Replaced by
`A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`. The name is not reused.

**A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT** *(PO A. Maier, 2026-09-24)*
Each repository token leaves the browser only as the authorisation header of requests to the API of
the server that issued it.
*Occasion:* a credential that can reach another origin can leak there. A GitHub token never goes to
a GitLab server, a GitLab token never to GitHub or to another GitLab, and no token to the model
endpoint.
*Check:* `tests/review-core.test.mjs`

**THE SHARED PAGES ORIGIN IS DISCLOSED** *(PO A. Maier, 2026-09-23)*
The settings page states, before a token or key is stored, that every GitHub Pages site under the
same `<owner>.github.io` domain can read what Agent M stores in the browser.
*Occasion:* browser storage belongs to the origin, not to the path. Measured 2026-09-23: seven Pages
sites share `https://akmaier.github.io`, and each could read Agent M's storage. The person decides
whether that is acceptable, or hosts their instance under an owner used for nothing else.
*Check:* `tests/test_settings_disclosure.py`

**THE TOKEN LINK IS PREFILLED** *(PO A. Maier, 2026-09-24)*
Agent M links to GitHub's page for new fine-grained tokens with name, description, expiry and the
required permissions already filled in.
*Occasion:* people new to GitHub should not have to find the page or know what a permission is.
Measured 2026-09-24: GitHub prefills `name`, `description`, `expires_in` and permissions such as
`contents` from the link.
*Check:* `tests/test_token_scope_documented.py`

**THE REPOSITORY CHOICE IS SPELLED OUT** *(PO A. Maier, 2026-09-24)*
Agent M tells the person to choose *Only select repositories* on GitHub's token page and names each
repository to select.
*Occasion:* the link cannot preselect repositories — GitHub documents no parameter for it — and
with prefilled permissions the page defaults to *All repositories* (measured 2026-09-24), the
broadest choice and the one `A TOKEN IS SCOPED TO WHAT IT WRITES` rules out.
*Check:* `tests/test_token_scope_documented.py`

**A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN** *(PO A. Maier, 2026-09-24)*
For a product on a GitLab server, Agent M guides the person to create a project access token for
that one project, with role *Developer* and scope `api`, and to paste it into Agent M.
*Occasion:* a GitLab personal access token with `api` scope reaches every project of its owner,
which `A TOKEN IS SCOPED TO WHAT IT WRITES` rules out. A project access token reaches one project.
It costs one token per GitLab product; where the server does not offer project access tokens, the
person is told so, and why a personal token is broader.
*Check:* `tests/review-core.test.mjs`
## 8. Versioning

**CALENDAR VERSIONS** *(PO A. Maier, 2026-09-23)*
Agent M and every product built with it use calendar versioning in the form `YYYY.MINOR.PATCH`.
*Occasion:* the Product Owner's instruction, and the scheme already in use across the taskforce's
products. A year in the version number tells a reader how old a release is without a changelog.
*Check:* `tests/test_version_format.py`

**EVERY PRODUCT HAS ITS OWN VERSION LINE** *(PO A. Maier, 2026-09-23)*
One Agent M instance manages several products in parallel; each product's version is independent
of Agent M's and of every other product's.
*Occasion:* a shared version line would couple unrelated products, so that one product's release
would renumber the others.
*Check:* `tests/test_version_independence.py`

**A RELEASE IS TAGGED AND LOGGED** *(PO A. Maier, 2026-09-23)*
A release raises the version, adds a dated entry to the changelog, and sets the git tag
`vYYYY.MINOR.PATCH`.
*Occasion:* a version number that exists only in a file cannot be checked out. The tag is what
makes a stated version recoverable.
*Check:* `tests/test_release_artifacts.py`

**AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT** *(PO A. Maier, 2026-09-23)*
Every generated artifact records the Agent M version, the model, and the date of its generation.
*Occasion:* when output quality changes, the first question is what changed — the prompt, the
model, or the source. Without the record, none of the three can be ruled out.
*Check:* `tests/test_artifact_provenance.py`

**A VERSION IS NOT REWRITTEN** *(PO A. Maier, 2026-09-23)*
A released version is never re-tagged or overwritten; a correction is a new version.
*Occasion:* a tag that moves makes every reference to it a statement about an unknown state, and
the dashboard's comparison across versions becomes meaningless.
*Check:* `tests/test_tags_immutable.py`
## 9. Human gates

**A GENERATED ARTIFACT IS A PROPOSAL** *(PO A. Maier, 2026-09-23, reworded 2026-09-23)*
Everything Agent M generates counts as a proposal until a person accepts it.
*Occasion:* generation is cheap and review is not, so the volume of candidate changes grows faster
than the capacity to check them. What decides is not where a text is stored but whether a person
has accepted it.
*Check:* `tests/review-core.test.mjs` — a file without an approval record naming its current text
is shown as open.

**A RECORD IS EVIDENCE, NOT A PROPOSAL** *(PO A. Maier, 2026-09-25)*
Approval records, gate records, job records and test result records are written once as evidence of
what happened and are never shown for acceptance.
*Occasion:* `A GENERATED ARTIFACT IS A PROPOSAL` would otherwise make every job record and every test
result an open item waiting for a click that decides nothing. A record states a fact; its protection is
that it is never rewritten (`A RESULT RECORD IS NEVER REWRITTEN`), not that someone accepts it.
*Check:* `tests/review-core.test.mjs` — a job record without approval is not listed as open;
counter-proof: a use case without approval is.

**A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN** *(PO A. Maier, 2026-09-23, extended 2026-09-24)*
A use case, an architecture decision, a module or a SPEC change proposal may be written directly to
the default branch, where it counts as open until an approval record names its text.
*Occasion:* for these artifacts the approval record is the gate. A pull request in front of it
added a second click that controlled nothing: a merged use case was still open, and an unmerged one
could not be reviewed on the dashboard at all.
*Check:* `tests/review-core.test.mjs`

**CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI** *(PO A. Maier, 2026-09-23)*
A change to code, tests, workflows or the dashboard reaches the default branch only through a pull
request whose CI run is green.
*Occasion:* code has no approval record; the pull request with its CI run is its only check. Who
merges once CI is green is not restricted — the author of the change may merge it, including an
agent.
*Check:* no automatic check; at review. The repository's branch protection can enforce it.

**A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN** *(PO A. Maier, 2026-09-23; after "JEDE
SPEC-AENDERUNG LAEUFT UEBER DAS FREIGABE-WERKZEUG")*
A change to a product's specification is shown beside the text it would replace and is written
only after a person accepts it.
*Occasion:* a specification written first and approved afterwards was never approved. In one night
in the source process, twenty-one changes across roughly two thousand lines entered a
specification without agreement, because proposals made in conversation lose the current text they
are replacing.
*Check:* `tests/test_spec_gate.py`

**THE APPROVED TEXT IS TAKEN VERBATIM** *(PO A. Maier, 2026-09-23; after "DER PO-TEXT WIRD WORTGETREU
UEBERNOMMEN")*
What stands in the approval field is exactly what is written to the specification; nothing
reformulates it afterwards.
*Occasion:* verbatim transfer is the property that makes an approval an approval.
*Check:* `tests/test_verbatim.py`

**NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT** *(PO A. Maier, 2026-09-23; after "KEIN VORSCHLAG OHNE
DEN IST-ZUSTAND DANEBEN")*
A change is presented together with the specification text that currently holds, not as a summary
of it.
*Occasion:* one cannot decide about a text one cannot see.
*Check:* `tests/test_proposal_shows_current.py`

**EVOLUTION ENTERS THROUGH THE SPECIFICATION** *(PO A. Maier, 2026-09-23)*
An issue that changes behaviour — on GitHub or on the product's GitLab server — becomes a
specification change first and a code change second.
*Occasion:* this is the whole argument of the book's evolution chapter made mechanical. A code
change that precedes its requirement leaves the specification describing a product that no longer
exists, and the next reader believes the specification.
*Check:* `tests/test_issue_to_spec.py`

**THE GATE IS RECORDED** *(PO A. Maier, 2026-09-23)*
Every passed gate records who decided, when, and on which text.
*Occasion:* an unrecorded approval is indistinguishable from no approval three months later, and
it is precisely the evidence a normative process requirement — IEC 62304, for instance — asks for.
*Check:* `tests/test_gate_record.py`

**THE REPLACED TEXT STAYS REACHABLE** *(PO A. Maier, 2026-09-23; after "DER ERSETZTE TEXT BLEIBT
AUFFINDBAR")*
A replaced specification section remains reachable through the git history; no second copy is kept
in the working tree.
*Occasion:* a shortening is safe only if the removed part can still be moved where it belongs. A
duplicate folder did that a second time and drifted away from the history.
*Check:* `tests/test_replaced_in_history.py`

**A PERSON'S OWN INPUT IS COMMITTED DIRECTLY** *(PO A. Maier, 2026-09-24)*
What a person enters in Agent M themselves — a requirement source, a product, a release — is
committed to the default branch under their own account when they save it.
*Occasion:* the person who typed it has already decided on it; a second review of one's own input
adds a click and no control.
*Check:* `tests/review-core.test.mjs`

**ADDING A PRODUCT CREATES ITS LAYOUT** *(PO A. Maier, 2026-09-24, changed 2026-09-24)*
When a person adds a product, Agent M writes the missing review layout into the product's default
branch without a pull request.
*Occasion:* PO, 2026-09-24: two merges in one setup "is a bit much. Both need to be automated."
The layout is empty folders and a SPEC skeleton; there is nothing in it to review. The product is
not written into the instance repository (`NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY`).
*Check:* `tests/review-core.test.mjs`
## 10. Review on GitHub Pages

**THE PAGES ROOT IS DOCS** *(PO A. Maier, 2026-09-23, products removed 2026-09-23)*
The GitHub Pages site of an Agent M instance is served from the `docs/` folder of its default
branch.
*Occasion:* one known place for everything a reviewer reads. Code, tooling and the SPEC's approval
machinery stay outside the published tree.
*Check:* `tests/test_pages_layout.py`

**ONE REVIEW LAYOUT FOR EVERY PRODUCT** *(PO A. Maier, 2026-09-23, extended 2026-09-24)*
Agent M and every managed product use the same layout below `docs/`: use cases in
`docs/use-cases/`, architecture decisions and modules in `docs/architecture/`, SPEC change queues in
`docs/spec-freigaben/`, approval records in `docs/approvals/`.
*Occasion:* products will adopt this structure later. One layout means one dashboard serves all of
them, and a reviewer who knows one product knows where to look in the next.
*Check:* `tests/test_pages_layout.py`

**ONE USE CASE, ONE FILE** *(PO A. Maier, 2026-09-23)*
Each use case is a single Markdown file named `docs/use-cases/UC-<nnn>-<slug>.md`.
*Occasion:* a file is the unit git versions, diffs and hashes. One use case per file makes each
one separately editable and separately acceptable.
*Check:* `tests/test_usecase_fields.py`

**ACCEPTANCE IS A COMMIT IN GITHUB** *(PO A. Maier, 2026-09-23, reworded 2026-09-24 — withdrawn 2026-09-24)*
*Withdrawn:* the accepting commit of a GitLab product is made on its GitLab server. Replaced by
`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`. The name is not reused.

**ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON** *(PO A. Maier, 2026-09-24, extended 2026-09-24)*
A use case, an architecture decision, a module or a SPEC change is accepted by a commit, made under
the accepting person's own account on the server that hosts the repository, that adds an approval
record to `docs/approvals/`.
*Occasion:* git already records who decided, when, and on which text — on GitHub and on GitLab
alike.
*Check:* `tests/test_approval_records.py`

**AN APPROVAL NAMES THE EXACT TEXT** *(PO A. Maier, 2026-09-23)*
An approval record names the file it approves and the git blob SHA of the text the reviewer saw.
*Occasion:* "accepted" is meaningful only together with which text. A blob SHA identifies that
text exactly and can be recomputed by anyone from the file.
*Check:* `tests/test_approval_records.py`

**STATUS IS DERIVED FROM THE RECORDS** *(PO A. Maier, 2026-09-23)*
A reviewed file counts as accepted exactly when an approval record names its current blob SHA.
*Occasion:* a stored status drifts from the text it describes. Derived, an edit after acceptance
returns the file to review by itself, and nobody has to remember to reset anything.
*Check:* `tests/review-core.test.mjs`

**THE REVIEW DASHBOARD HOLDS NO CREDENTIAL** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-23)*
*Withdrawn:* private product repositories cannot be read without a token. Replaced by
`THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ`. The name is not reused.

**THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* accepting and editing are now one click on the dashboard, which writes with the
person's token. Replaced by `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`. The name is not reused.

**THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK** *(PO A. Maier, 2026-09-24)*
The dashboard writes to a repository only as the direct result of a person's action on it, as a
commit made with that person's own token.
*Occasion:* every write stays attributable to a person and a decision; nothing is written in the
background, on load, or on someone else's behalf.
*Check:* `tests/review-core.test.mjs`

**WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK** *(PO A. Maier, 2026-09-24)*
Without a stored token, accepting and editing open GitHub's web interface with the commit prepared
as far as GitHub allows.
*Occasion:* a reviewer who does not want to store a token can still decide; it costs more clicks,
not the ability.
*Check:* `tests/review-core.test.mjs`

**EDITS ARE PREPARED ON THE DASHBOARD** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
The dashboard offers an editor with a live preview for a reviewed file, and saving commits the
edited text under the person's own account.
*Occasion:* reviewing and correcting belong on one screen. Copying text into GitHub's editor was
five actions for one decision.
*Check:* `tests/review-core.test.mjs`

**NO TEXT TRAVELS IN A URL** *(PO A. Maier, 2026-09-23)*
A link that prepares a commit in GitHub carries at most a file path and an approval record, never
the reviewed text.
*Occasion:* measured 2026-09-23: a link prefilled with 6 KB of text sent a logged-out reviewer
through GitHub's login redirect, which answered HTTP 500.
*Check:* `tests/review-core.test.mjs`

**AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* the workflow exists only in the instance repository, so an accepted SPEC change of a
product was never written. Replaced by `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL`. The
name is not reused.

**AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL** *(PO A. Maier, 2026-09-24)*
With a stored token, accepting a SPEC change commits the approval record and the replaced SPEC
section together, in one commit, with the approved proposal text byte for byte.
*Occasion:* one commit, one decision: the SPEC can never show an approval without its change or a
change without its approval. It works the same on every server, and no product needs a workflow.
*Check:* `tests/review-core.test.mjs`

**WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE** *(PO A. Maier, 2026-09-24)*
When an approval record for the instance's own SPEC is committed without the dashboard, the
instance's workflow writes the approved section byte for byte.
*Occasion:* the no-token route through GitHub's web interface stays usable for the instance's own
SPEC, which is the only repository that carries the workflow.
*Check:* `tests/test_apply_approvals.py`

**A STALE APPROVAL IS NOT APPLIED** *(PO A. Maier, 2026-09-23, reworded 2026-09-24)*
Nothing is written when the proposal or the current SPEC section differs from the blob SHAs named in
the approval record.
*Occasion:* the reviewer decided on one proposal beside one current text. If either changed after
the decision, the decision does not cover the new state. This holds for the dashboard and for the
workflow alike.
*Check:* `tests/test_apply_approvals.py` · `tests/review-core.test.mjs`

**AN INSTANCE IS A FORK OF AGENT M** *(PO A. Maier, 2026-09-23)*
A person or team runs Agent M as their own fork, and the fork's Pages site is the dashboard for the
products that instance manages.
*Occasion:* every user then has their own dashboard, their own settings, and their own browser
storage origin; nothing is shared with the author's instance or with other readers.
*Check:* `tests/test_instance_target.py` — the dashboard derives its own repository from the Pages
address it is served from.

**A MANAGED PRODUCT NEEDS NO PAGES SITE** *(PO A. Maier, 2026-09-23)*
A managed product keeps its artifacts below `docs/` in its own repository and is reviewed through
the instance's dashboard, never through a site of its own.
*Occasion:* one dashboard per instance, one place to keep up to date. The artifacts stay with the
product's code; the tool stays with the tool.
*Check:* no automatic check; at review.

**THE INSTANCE LISTS ITS PRODUCTS IN A FILE** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* Agent M is run by a single user, and the products an instance manages are that user's
own business; a list committed to the fork also collides with every sync of the fork. Replaced by
`THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER`, `NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY`
and `A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER`. The name is not reused.

**THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER** *(PO A. Maier, 2026-09-24)*
The dashboard keeps the addresses of the products it manages in the browser's `localStorage`, beside
the tokens that reach them.
*Occasion:* PO, 2026-09-24: "Each product is of course also a repository. That makes the browser's
local storage the better choice." A product is known by its address (`A PRODUCT IS NAMED BY ITS
ADDRESS`); its content lives in its own repository. Another browser starts with an empty list, as it
starts without tokens.
*Check:* `tests/review-core.test.mjs` — adding a product stores its address in `localStorage` and
commits nothing to the instance repository; counter-proof: after a clear, the list is empty.

**NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY** *(PO A. Maier, 2026-09-24)*
No file committed to the instance repository names a product the instance manages.
*Occasion:* PO, 2026-09-24: the number and names of the products "will not be visible here". A fork
that commits nothing about its products can be synced with Agent M without conflict, and a public
fork does not publish which products its owner works on.
*Check:* `tests/test_products_folder.py` — the instance repository's committed files contain no
address of a product in the fixture list; counter-proof: a fixture that commits one fails.

**A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER** *(PO A. Maier, 2026-09-24)*
In a local clone of Agent M, each product checked out is a clone of its repository in its own folder
under `products/`, which git ignores except for `products/README.md`.
*Occasion:* PO, 2026-09-24, as in the process repository: the folders are the list — each is a
repository and knows its own address — so no second list is kept that could drift from them.
`products/README.md` says that the products are not visible in the repository.
*Check:* `tests/test_products_folder.py` — `products/README.md` is tracked; a folder created under
`products/` is ignored by git.

**ONE CLICK PER DECISION** *(PO A. Maier, 2026-09-24)*
A decision a person makes on the dashboard — accept, save, add a product, release — takes one click
once its inputs are complete, and everything that follows from it is done by Agent M.
*Occasion:* PO, 2026-09-24: "Too much clicking kills our user experience." Each extra step between
a decision and its effect is a place to get lost.
*Check:* no automatic check; at review of each use case.

**SEVERAL FILES ARE ACCEPTED IN ONE CLICK** *(PO A. Maier, 2026-09-25)*
A reviewer who has opened several reviewed files may accept all of them with one click, in one commit
that holds one approval record per file, each naming the text shown.
*Occasion:* forty use cases are forty decisions, but not forty round trips: the reviewer reads each one,
ticks it, and commits once. Each record still names exactly the text that was shown
(`AN APPROVAL NAMES THE EXACT TEXT`), so nothing unread is accepted.
*Check:* `tests/review-core.test.mjs` — a batch writes one record per ticked file, and none for a file
that was not opened; counter-proof: a file changed after it was shown is left out and named.

**A QUEUE IS ACCEPTED IN ITS ORDER** *(PO A. Maier, 2026-09-25)*
Entries of one queue accepted together are written in the order of the queue's index, in one commit,
and an entry whose anchor another entry creates is offered only together with or after that entry.
*Occasion:* queue 2026-09-24g needs entry 05 before 06–10, because 05 creates their headings; a
reviewer should not have to know that. Accepted in order in one commit, the SPEC never holds half a
queue.
*Check:* `tests/review-core.test.mjs` — accepting 05 and 06 together yields one commit with both
sections; counter-proof: 06 alone is not offered while its anchor is missing, and the dashboard names
05.

**A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE** *(PO A. Maier, 2026-09-25)*
A SPEC edit saved on the dashboard is added to the person's newest queue of the same day that has no
accepted entry yet, and opens a new queue only if there is none.
*Occasion:* ten wording fixes in an afternoon are one review, not ten queues to open one by one.
*Check:* `tests/review-core.test.mjs`

**EVERY STEP EXPLAINS ITSELF** *(PO A. Maier, 2026-09-24)*
Every step that asks something of the person carries an explanation that can be expanded, written
for someone new to GitHub.
*Occasion:* PO, 2026-09-24: users "might be new to GitHub". The explanation stays folded for
those who do not need it.
*Check:* `tests/test_step_explanations.py`

**A PRODUCT IS NAMED BY ITS ADDRESS** *(PO A. Maier, 2026-09-24)*
A product is identified by the web address of its repository, on `github.com` or on a GitLab server.
*Occasion:* `owner/name` is ambiguous as soon as there is more than one server, and GitLab projects
sit in nested groups (`group/subgroup/project`). The address is what a person copies from the
browser anyway.
*Check:* `tests/review-core.test.mjs`

**GITLAB PRODUCTS ARE SUPPORTED** *(PO A. Maier, 2026-09-24)*
Agent M reads and writes products on any GitLab server whose API accepts requests from the instance's
Pages address.
*Occasion:* products at the author's institution often live on a self-hosted GitLab. Measured
2026-09-24: `gitlab.com`, `gitlab.rrze.fau.de` and `gitos.rrze.fau.de` answer a cross-origin
preflight from `https://akmaier.github.io` with `Access-Control-Allow-Origin: *`, allow the headers
`authorization` and `private-token`, and allow `POST`/`PUT`.
*Check:* `tests/review-core.test.mjs`

**A GITLAB PRODUCT IS WRITTEN WITH A TOKEN** *(PO A. Maier, 2026-09-24)*
Accepting and editing in a GitLab product require a stored token; there is no web-interface fallback.
*Occasion:* GitLab's new-file page reportedly ignores prefilled content (GitLab work item 594214 —
reported, not measured here), so the route that works without a token on GitHub does not exist
there. The dashboard says so instead of offering a route that fails.
*Check:* `tests/review-core.test.mjs`

**A SPEC EDIT IS SAVED AS A PROPOSAL** *(PO A. Maier, 2026-09-24)*
Saving a change to a product's SPEC on the dashboard — typed or drafted by a participant — writes an entry to a change queue under `docs/spec-freigaben/` instead of writing the
SPEC.
*Occasion:* PO, 2026-09-24: specifications must be modifiable using "a text editor in the dashboard".
The editor must not become a way around `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`;
the saved edit waits beside the current text until accepted (UC-006).
*Check:* `tests/review-core.test.mjs` — a save from the editor leaves `SPEC.md` byte-identical.

**A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE** *(PO A. Maier, 2026-09-24)*
Saving an edit writes nothing when the file or SPEC section on the default branch differs from the
version the edit started from.
*Occasion:* two people, or a person and a workflow, editing the same use case would otherwise
overwrite each other without either noticing. The blob SHA taken when the editor opens is the
comparison.
*Check:* `tests/review-core.test.mjs`

**A REFUSED SAVE KEEPS THE EDIT** *(PO A. Maier, 2026-09-24)*
When a save is refused, the edited text stays in the editor, shown beside the newer version.
*Occasion:* a refusal that discards the edit punishes the person for someone else's commit. With both
texts side by side, merging the two is a reading task, not a rewriting task.
*Check:* `tests/review-core.test.mjs`

**AN EDITED FILE KEEPS ITS IDENTIFIER** *(PO A. Maier, 2026-09-24)*
Saving is refused for a use case, architecture element, module or test whose identifier differs from
the one it was opened with.
*Occasion:* `THE NAME IS THE ID AND IT SURVIVES`. A renumbered use case silently breaks every
reference to the old number, and its old approval records then point at nothing.
*Check:* `tests/review-core.test.mjs`

**A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED** *(PO A. Maier, 2026-09-24)*
An edit that changes a requirement's name is proposed as the withdrawal of the old name together with
a new requirement under the new name.
*Occasion:* a requirement's name is its identifier and is never reused. Renaming in place would make
the old name vanish without the withdrawal note that `THE NAME IS THE ID AND IT SURVIVES` requires.
*Check:* `tests/review-core.test.mjs`

**A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT** *(PO A. Maier, 2026-09-24)*
Text that a participant drafts from a person's instruction is shown as a difference against the
current text before the person can save it.
*Occasion:* PO, 2026-09-24: specifications and use cases must be modifiable by "a prompt to an LLM or
agent". A model asked to add error handling may also reword three unrelated steps; only the
difference makes that visible.
*Check:* `tests/review-core.test.mjs`

**A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES** *(PO A. Maier, 2026-09-24)*
A change to requirements that a participant drafts from a person's instruction is subject to
`DERIVATION SEES THE EXISTING REQUIREMENTS`, `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`,
`A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT` and `EXACT DUPLICATES ARE FOUND WITHOUT A
MODEL`, as a derivation from a source is.
*Occasion:* "split this requirement" produces new requirements just as a derivation does, and can
duplicate an existing one just as easily. The rules exist once; this makes them apply to the second
way in.
*Check:* `tests/test_derivation_context.py` · `tests/test_derivation_classes.py`

**A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS** *(PO A. Maier, 2026-09-24)*
A participant asked to change a use case receives, besides the use case, every requirement it
realises and every other use case of the product.
*Occasion:* a model that sees one use case cannot know that the flow it is asked to add already
exists in another (UC-007 alternative flow 6a), nor which requirements the use case must go on
realising.
*Check:* `tests/test_prompted_change_context.py`

**NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY** *(PO A. Maier, 2026-09-24)*
If a use case, its requirements and the product's other use cases do not fit into the participant's
context, nothing is sent and the dashboard says what does not fit.
*Occasion:* the same failure as for requirements: a context cut to fit produces the duplicate it
was meant to prevent, and looks as if it worked.
*Check:* `tests/test_prompted_change_context.py`

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
## 12. Tests and continuous integration

**EVERY TEST HAS ONE LEVEL** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 13 §4, §6, §7)*
Every test declares exactly one level from: `unit`, `component`, `system`, `release`, `user`.
*Occasion:* PO, 2026-09-24: "There should be different levels of tests … check the vibe coding
book". The book separates development testing (unit, component, system), release testing and user
testing (alpha, beta, acceptance); test-driven development is a way of working, not a level, and is
therefore not in the set.
*Check:* `tests/test_test_levels.py`

**A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 1)*
Every test case names its input, its precondition and its expected result in a form that can be
read without running it.
*Occasion:* without an expected result a test is a demonstration, not a test. Readable without
running, the expectation can be reviewed before any code exists — the book starts test design during
requirements work (ch. 13 §3).
*Check:* `tests/test_test_battery.py`

**TEST GENERATION SEES THE EXISTING TESTS** *(PO A. Maier, 2026-09-24)*
When tests are generated, every existing test of the product that guards the same requirements,
use cases or modules is part of the input the generating participant receives.
*Occasion:* the same argument as `DERIVATION SEES THE EXISTING REQUIREMENTS`: a participant that
does not see the existing battery writes the same test a second time, and two tests guarding one
thing drift apart.
*Check:* `tests/test_test_generation_context.py`

**A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 5)*
A new test is accepted only with a recorded counter-proof: a fault deliberately introduced into the
code it guards, and the test's failing result on it.
*Occasion:* a test that cannot fail checks nothing, and a green run of it proves nothing about the
requirement it names. The book warns that a poorly specified test "will pass and hide the error"
(ch. 13 §5).
*Check:* `tests/test_counter_proof.py`

**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 4)*
A test whose outcome depends on a model's answer reports a pass rate over a number of runs fixed
before the first run, compared with the rate of the last release.
*Occasion:* a single run of a stochastic check is a coin toss; a threshold on it trains everyone to
ignore red. The release question is "is this state worse than the one in use", not "is it good
enough".
*Check:* `tests/test_rate_reporting.py`

**RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER** *(Vibe Coding, ch. 13 §4 and §6; ch. 12 §2)*
A test of level `release` is generated or written by a participant other than the one that
implemented the behaviour it tests.
*Occasion:* the book assigns release testing to a team "independent of feature development", and
separates the role that finds problems from the role that fixes them. An agent that writes both the
code and its release tests tests its own assumptions.
*Check:* `tests/test_test_battery.py` — a release test whose recorded author equals the implementing
participant of its guarded use case fails.

**THE TEST SCHEDULE IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-24)*
Each product declares, in a data file of its own repository, which test levels run on every commit,
on a pull request, nightly, on a release candidate, and on demand.
*Occasion:* PO, 2026-09-24: "which tests to execute when". A static-site product and a product that
calls a paid model need different answers; a data file answers it for each product, changes by
commit, and is read the same way by the dashboard and by CI.
*Check:* `tests/test_ci_schedule.py`

**THE DEFAULT SCHEDULE FOLLOWS THE BOOK** *(Vibe Coding, ch. 12 §5; ch. 13 §4, §6, Exercises)*
Without a declaration, `unit`, `component` and `system` tests run on every commit and pull request,
tests calling a paid service run nightly, and every test runs on a release candidate.
*Occasion:* the book: with CI "every commit triggers an automated build, runs the complete test
suite"; paid external calls are mocked and exercised for real only in "a limited nightly integration
test". A default is offered so that a product without a decision still has CI; it is shown as the
default until the author saves their own.
*Check:* `tests/test_ci_schedule.py`

**COMMIT TESTS CALL NO PAID SERVICE** *(Vibe Coding, ch. 13 §4.1)*
A test that runs on every commit or pull request calls no external service that charges per call;
it uses a recorded or constructed response instead.
*Occasion:* "every test run should not charge the account" (ch. 13 §4.1). Mocks also make rare
failure paths — timeout, rate limit, malformed answer — testable at all.
*Check:* `tests/test_ci_schedule.py` — a commit-level test that opens a connection to a configured
paid endpoint fails the run.

**THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE** *(PO A. Maier, 2026-09-24)*
A product's CI configuration — a GitHub Actions workflow on GitHub, a GitLab CI pipeline on a GitLab
server — is generated from its declared test schedule.
*Occasion:* two places that both say which tests run when will disagree; the schedule is the one
the dashboard shows, so it is the one that must be true. Generated, the configuration reaches the
default branch through a pull request like any other code.
*Check:* `tests/test_ci_schedule.py` — the generated configuration triggers exactly the levels the
schedule names for each event.

**A JOB RECORD STARTS NO CI RUN** *(PO A. Maier, 2026-09-24)*
The generated CI configuration starts no run for a commit that changes only job records under
`docs/jobs/`.
*Occasion:* every job writes its record twice, at its start and at its end (`A JOB IS RECORDED IN ITS
PRODUCT REPOSITORY`). A test run for each of those commits would test nothing new and double the CI
load of every job.
*Check:* `tests/test_ci_schedule.py` — the generated configuration ignores a push touching only
`docs/jobs/`; counter-proof: a push also touching code starts a run.

**A RELEASE RUNS EVERY TEST AT EVERY LEVEL** *(PO A. Maier, 2026-09-24)*
A release is tagged only after every test of the product, at every level, has run on the release
candidate's commit.
*Occasion:* PO, 2026-09-24: "Release should trigger a full run of the test-suite." Release testing
evaluates "a concrete release candidate" (ch. 13 §6); a test that did not run on that commit is no
evidence for it.
*Check:* `tests/test_release_run.py`

**EVERY TEST RUN LEAVES A RESULT RECORD** *(PO A. Maier, 2026-09-24)*
Every test run leaves a record naming the commit, the levels run, the participant that ran it, the
date, and each test's outcome.
*Occasion:* PO, 2026-09-24: "the execution and review of actual test results on specific commits".
A result that cannot be tied to a commit cannot be reviewed, compared or shown to an auditor.
*Check:* `tests/test_result_records.py`

**A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 5)*
A deterministic test with both a passing and a failing outcome recorded on the same commit is shown
as flaky, never as passed.
*Occasion:* a check that is sometimes red without a change teaches everyone to ignore red. Shown
as its own state, it is repaired or removed instead of being retried until green.
*Check:* `tests/review-core.test.mjs`

**THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 13 §7)*
The report of a release run counts as accepted only when an approval record names its text.
*Occasion:* the audit must say who accepted the evidence, not only that tests ran. The book's
acceptance step is a decision — accept, accept with known limitations, or reject — and a decision is
recorded like every other gate (`THE GATE IS RECORDED`).
*Check:* `tests/review-core.test.mjs`

**ACCEPTING THE RELEASE TEST REPORT RELEASES** *(PO A. Maier, 2026-09-25)*
Accepting a release test report on the dashboard also commits the changelog entry and sets the release
tag on the tested commit, as part of the same click.
*Occasion:* the acceptance is the release decision (ch. 13 §7: accept, accept with limitations, or
reject). A separate *Release* click after it decides nothing new, and is one more place to stop halfway
with an accepted report and no release.
*Check:* `tests/test_release_run.py` — after accepting a green report the tag exists on the tested
commit; counter-proof: rejecting it sets no tag.

**THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE** *(PO A. Maier, 2026-09-24)*
The audit view of a release lists every requirement valid at that release with the tests guarding
it, their outcomes on the release commit, and the acceptance of the release test report — including
requirements with no test or no passing outcome.
*Occasion:* PO, 2026-09-24: "dash boards … for tests for auditing". A normative process source such
as IEC 62304 asks for evidence that each requirement was verified (ch. 13 §6: "regulators may demand
evidence"); a list that omits the gaps is not evidence. The view is derived like the traceability
matrix and exported as Markdown (`ARTIFACTS ARE MARKDOWN`).
*Check:* `tests/test_audit_view.py`

**A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED** *(PO A. Maier, 2026-09-24)*
A release whose run has failing tests or worse rates is tagged only after a person accepts the
release test report with each failing test and the reason recorded in the approval.
*Occasion:* PO, 2026-09-24: the book's conditional acceptance (ch. 13 §7) is right. A release that
knowingly ships with a limitation must say so where an auditor looks — the approval and the
changelog — not in someone's memory.
*Check:* `tests/test_release_run.py` — a red run without a recorded limitation cannot be tagged;
counter-proof: with one it can.

**TEST RESULTS ARE KEPT IN THE REPOSITORY** *(PO A. Maier, 2026-09-24)*
Every result record is committed to the branch `test-results` of the product repository.
*Occasion:* PO, 2026-09-24: "we need to be able to audit the test results. Therefore, they need a
permanent location in the repo." CI servers delete run logs after a retention period. A branch of
their own keeps the results permanent without a commit on the default branch per run — which would
also trigger CI again.
*Check:* `tests/test_result_records.py`

**A RESULT RECORD IS NEVER REWRITTEN** *(PO A. Maier, 2026-09-24)*
The branch `test-results` only grows: no record on it is changed or deleted, and it is never
force-pushed.
*Occasion:* evidence that can be edited afterwards is no evidence. Appending only makes every audit
repeatable against the same records.
*Check:* `tests/test_result_records.py` — the branch's history is checked for rewritten or deleted
records; counter-proof with a fixture that amends one.
## 13. Process execution and jobs

**A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED** *(PO A. Maier, 2026-09-24)*
A process model definition can be declared for a product only after Agent M has validated it
without errors.
*Occasion:* PO, 2026-09-24: "we need to be able to configure process models". Once readers write
their own definitions (`THE CATALOGUE IS DATA`), a broken one, such as a gate that checks an
artifact no phase produces, would otherwise surface only when a job reaches that gate.
*Check:* `tests/test_model_validation.py`. Each rule has a definition that breaks it and must be
rejected: a transition naming a phase the model lacks, a verification pair naming a phase the model lacks, a gate
without artifacts or condition, a role without capabilities, a phase without a role, a missing
declaration of whether work is planned or pulled from a backlog. Each book model in the shipped
catalogue must pass.

**A PLAN COVERS THE WHOLE SPECIFICATION** *(PO A. Maier, 2026-09-24)*
In a model that plans its work in advance, the product's plan contains every accepted requirement
in every phase the model defines.
*Occasion:* PO, 2026-09-24: "V-Model: implement entire spec". Plan-driven models define most of the
work in advance, and progress is measured against that plan (Vibe Coding, ch. 6 §2). A requirement
missing from the plan is never designed, built or verified, and nobody notices.
*Check:* `tests/test_plan_coverage.py`. For a fixture product with N accepted requirements and a
V-model definition of P phases, the derived plan has exactly N × P entries. Accepting one more
requirement adds P entries.

**AGILE IMPLEMENTATION STARTS FROM THE BACKLOG** *(PO A. Maier, 2026-09-24)*
In a model that pulls its work from a backlog, every implementation job implements one item of the
product's backlog.
*Occasion:* PO, 2026-09-24: "agile methods need backlogs". The backlog is the synchronisation
artifact that stops parallel agents from duplicating or contradicting each other's work (Vibe Coding,
ch. 7 §5).
*Check:* `tests/test_job_from_backlog.py`. Starting an implementation job without an item is refused
for a Scrum and a Kanban fixture.

**THE BACKLOG LIVES IN THE PRODUCT REPOSITORY** *(PO A. Maier, 2026-09-24)*
A product's backlog is kept as Markdown under `docs/backlog/` of the product's own repository.
*Occasion:* the backlog is an artifact of the product. Kept anywhere else, it would be lost when
Agent M is removed (`THE PRODUCT REPOSITORY IS SELF-SUFFICIENT`), and it could not be versioned
alongside the code it describes.
*Check:* `tests/test_backlog_layout.py`

**A BACKLOG ITEM NAMES WHAT IT REALISES** *(PO A. Maier, 2026-09-24)*
Every backlog item names at least one requirement or use case that it realises.
*Occasion:* an item that realises nothing is either a missing requirement or work nobody asked for.
This rule applies `EVERY ARTIFACT NAMES ITS ORIGIN` to the backlog. It also makes the progress of
a requirement readable from its items.
*Check:* `tests/test_backlog_item_fields.py`

**NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED** *(PO A. Maier, 2026-09-24)*
An implementation job starts for a backlog item only when every requirement and use case the item
names is accepted.
*Occasion:* PO, 2026-09-24: "issues need to be transferable into the backlog". A change request may
enter the backlog early so that it is not lost. It still goes through the specification first
(`EVOLUTION ENTERS THROUGH THE SPECIFICATION`). This rule is what makes it wait.
*Check:* `tests/test_job_preconditions.py`. An item that names one open proposal cannot be started.
The same item can be started after an approval record names the proposal's text.

**NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT** *(Vibe Coding, ch. 7 §4)*
When a product's model sets a work-in-progress limit, no implementation job starts while the number
of the product's items in progress has reached that limit.
*Occasion:* the book's pull rule: new work is pulled only when active work is below the limit. With
agents, spawning is cheap, so the limit protects review capacity and budget instead of headcount
(ch. 7 §4). An item waiting for review counts as in progress.
*Check:* `tests/test_wip_limit.py`. With limit 2 and two items in progress, a third start is refused
with the limit named. With one of the two done, the start succeeds.

**A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT** *(Vibe Coding, ch. 7 §5)*
When a product's model works in time boxes, implementation jobs start only for items selected for
the current time box.
*Occasion:* in Scrum, sprint planning selects a subset of the product backlog into the sprint
backlog, and the team works from that (ch. 7 §5). The process repository runs its own sprints the
same way: sprint scope is fixed at planning (`SOFTWARE_MAINTENANCE.md`, phase 2).
*Check:* `tests/test_time_box_selection.py`

**A JOB GOES ONLY TO A HOLDER OF ITS ROLE** *(PO A. Maier, 2026-09-24)*
A job is handed only to a participant that the product has assigned to the role the job belongs to.
*Occasion:* the process model organises the people and agents of a product
(`A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`). This holds only if the jobs follow the roles, so
that a participant that was never assigned as a Developer is never given code to write.
*Check:* `tests/test_job_assignment.py`

**A JOB STOPS AT EVERY GATE** *(PO A. Maier, 2026-09-24, corrected 2026-09-29; Vibe Coding, ch. 11 §8)*
A job that reaches a gate of the product's workflow waits in the state *waiting at a gate* until the
decision of that gate's decider is recorded.
*Occasion:* a gate is a checkpoint the work does not pass by itself (ch. 6: a phase gate says afterwards
what was verified). PO, 2026-09-29: "Job gates can also be assigned to CI, Agents and the like" — who
decides is part of the gate (`A GATE NAMES WHO DECIDES IT`); a gate decided by a CI check or an agent
is passed as soon as that decision is recorded, and only a gate that names a person waits for one — the
book's human-in-the-loop checkpoint (ch. 11 §8). Gates come from the model and from process
requirements (`A PROCESS REQUIREMENT ADDS TO THE MODEL`). Merging a job's pull request is not a gate of
its own; it follows the product's Definition of Done (`A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION
OF DONE HOLDS`), which includes every gate recorded before it.
*Check:* `tests/test_job_gate.py`. A fixture job reaching a gate does not proceed while no decision of
the gate's decider is recorded, nor on a record by anyone else. It proceeds on the decider's record — a
person's, an agent's or a CI check's, as the gate names.

**A GATE NAMES WHO DECIDES IT** *(PO A. Maier, 2026-09-29)*
Every gate names its decider: a role of the model, held by a person or an agent as the role allows, or
an automated check whose result decides.
*Occasion:* PO, 2026-09-29: "Job gates can also be assigned to CI, Agents and the like." A security scan
is decided by CI, a documented review by an agent, a release sign-off that a process requirement such as
IEC 62304 demands by a person — the gate says which, as a role says who may hold it (`A PROCESS MODEL
ORGANISES PEOPLE AND AGENTS`).
*Check:* `tests/test_model_validation.py` — a gate without a decider is rejected; counter-proof: a gate
decided by a role and one decided by a named CI check both pass validation.

**A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS** *(PO A. Maier, 2026-09-29; Vibe Coding, ch. 12 §2, ch. 13 §6)*
A gate's decision recorded by the participant that did the work the gate checks does not pass it.
*Occasion:* an agent that implements a change and also decides the review of that change reviews its own
assumptions — the reason the book separates finding problems from fixing them, and release testing from
feature development (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Another agent, a CI check or a
person may decide.
*Check:* `tests/test_job_gate.py` — the implementing agent's own record leaves the job waiting;
counter-proof: a second agent holding the deciding role passes it.

**A JOB IS RECORDED IN ITS PRODUCT REPOSITORY** *(PO A. Maier, 2026-09-24)*
Every job has a record `docs/jobs/JOB-<id>.md` in the repository of the product it works on — the
instance's own repository for a job of the instance — naming its inputs, participant, runtime and
start, and, once it has ended, its end state and results.
*Occasion:* PO, 2026-09-24: "jobs need identifiers and they live in the respective product repo …
probably in a subfolder thereof". Read only from the runtimes, a job that ran in another browser or
on a bridge that is switched off is invisible, and CI servers delete their logs; the record keeps it.
The start is written by the click that starts the job; the end is written by the job itself, in the
same commit as its result where the result is a commit.
*Check:* `tests/test_job_record.py`

**A JOB IDENTIFIER IS NEVER REUSED** *(PO A. Maier, 2026-09-24)*
No two jobs of a product share an identifier, a retried job included.
*Occasion:* several browsers and bridges start jobs at the same time; an identifier made from the
start time and a random part cannot collide, where a running number would. A retry that reused the
identifier would overwrite the evidence of the failure it retries; the new job names the one it
retries instead.
*Check:* `tests/test_job_record.py`

**PROGRESS AND JOB STATE ARE DERIVED, NOT STORED** *(PO A. Maier, 2026-09-24)*
Everything the process dashboard and the job dashboard show is computed from the repositories and
the runtimes. Neither dashboard stores a status of its own.
*Occasion:* a stored status drifts from what it describes (`STATUS IS DERIVED FROM THE RECORDS`,
`THE TRACEABILITY MATRIX IS DERIVED`). There is also no server to keep one (`NO SERVER`). An item is
in progress because a job for it is running or a pull request for it is open, not because a field
says so.
*Check:* `tests/test_progress_derived.py`. Deleting all local storage and reloading shows the same
progress and the same job states.

**PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 15 §2–3)*
The process dashboard shows a product's progress in the measure its model definition names: plan
entries per phase against the plan, remaining items per time box, or items per state over time.
*Occasion:* PO, 2026-09-24: "the software processes need dash boards to check the progress".
Software progress is intangible, and reporting exists so that drift is seen early enough to act on
(ch. 15 §2). A V-model product and a Kanban product have no common measure of "done". Each is shown
in the one its model defines.
*Check:* `tests/test_progress_view.py`. A V-model, a Scrum and a Kanban fixture each render their
declared measure. A definition naming an unknown measure fails validation.

**ONE DASHBOARD SHOWS EVERY JOB** *(PO A. Maier, 2026-09-24)*
The job dashboard of an instance lists every job of every product it manages. Each job appears with
its state (queued, running, waiting at a gate, done, failed or cancelled), its participant, where
it runs, what it works on, its elapsed time and a link to its log.
*Occasion:* PO, 2026-09-24: "There should be dashboard that shows all running stages which allows
to inspect their status". Jobs run in several places at once: CI, a CLI agent, a sandbox. Without
one view, nobody knows what is running. The book's human-above-the-loop oversight also needs one
place to watch from (ch. 11 §8).
*Check:* `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in
one list. A job state outside the six is rejected.

**A CANCELLED JOB WRITES NOTHING MORE** *(PO A. Maier, 2026-09-24)*
After a person cancels a job, the job commits nothing further to any repository.
*Occasion:* a cancel that lets the job finish its push is not a cancel, and the person believes the
work stopped (compare `A CLEAR IS A REAL CLEAR`).
*Check:* `tests/test_job_cancel.py`. A fixture job cancelled between its test commit and its
implementation commit leaves the branch at the test commit.

**NO COST IS GUESSED** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 15 §4)*
A job shows a cost only when its runtime reports one, or when the runtime reports usage and the
participant declares a price for it. In every other case the cost is shown as unknown.
*Occasion:* PO's draft: "cost where known". The book warns that a precise-looking number can hide
weak inputs ("Radosophie", ch. 15 §4). An estimated cost shown beside measured ones reads as
measured.
*Check:* `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows
"unknown", never zero.

**A PRODUCT DECLARES ITS DEFINITION OF DONE** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 7 §5, after the Scrum Guide)*
A product declares, in a data file of its own repository, the conditions an implementation job's
pull request must meet before it counts as done.
*Occasion:* PO, 2026-09-24, asked whether a Scrum Master deciding each merge is really how Scrum
works. It is not: in Scrum, work belongs to the increment when it meets the Definition of Done, and
the Developers are accountable for meeting it; the Scrum Master coaches the process and removes
obstacles (ch. 7 §5). Written down, the Definition of Done is the same check for a person and an
agent.
*Check:* `tests/test_definition_of_done.py`

**THE DEFAULT DEFINITION OF DONE IS THE JOB RULES** *(PO A. Maier, 2026-09-24)*
Without a declaration, a pull request is done when its CI run is green, the job's first commit held
only failing tests — or, for a refactoring job, CI was green on every commit and no expected result
changed —, it changes only the job's modules, and every gate the workflow places before the merge is
recorded.
*Occasion:* these conditions already bind every implementation job (`AN IMPLEMENTATION JOB BEGINS
WITH A FAILING TEST`, `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`, `A JOB STOPS AT EVERY GATE`);
the default names them in one place, and a product adds its own — a review by a second developer, for
example.
*Check:* `tests/test_definition_of_done.py`

**A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS** *(PO A. Maier, 2026-09-24)*
An implementation job's pull request is merged only when every condition of the product's Definition
of Done holds, checked in the product's CI.
*Occasion:* who merges stays open (`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN
CI`: an agent may merge its own change); what must hold does not. Checked in CI, the condition holds
whoever presses merge.
*Check:* `tests/test_definition_of_done.py` — a pull request missing one condition is not mergeable;
counter-proof: with all conditions met it is.

**A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT** *(Vibe Coding, ch. 7 §5)*
A time box of a product is closed only after a review of its increment is recorded: what was done,
who took part, and the feedback, which enters the backlog as items.
*Occasion:* the book: "at the end of the sprint, the review checks what was actually achieved", and
the backlog is adapted from it (ch. 7 §5). Without a record, the inspection that Scrum rests on
leaves no trace, and the feedback is lost with the meeting.
*Check:* `tests/test_time_box_close.py`

**A SPRINT ENDS WITH A RETROSPECTIVE** *(Vibe Coding, ch. 7 §5)*
A time box of a product is closed only after its retrospective is recorded: what the team — people
and agents — will change in how it works.
*Occasion:* the book: "the retrospective reflects on how the team itself should improve before the
next cycle". A change it decides for the process model goes through its configuration (UC-031); a
change for the agents' instructions through their definition.
*Check:* `tests/test_time_box_close.py`

**A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN** *(PO A. Maier, 2026-09-24)*
A product may give a phase or a time box — a sprint, for example — a branch of its own, into which
its work is merged; merging that branch into the default branch is then the gate at its end, decided
by the role the model names for that gate — in Scrum the Product Owner, after the review of the
increment.
*Occasion:* PO, 2026-09-24: "an entire scrum phase can be assigned an additional branch in git; then
the merge is the gate at the end of the phase, but this is optional." A sprint is a time box, not a
phase in the book's sense (ch. 6: a phase groups activities), so both are named. Releasing the
increment is the Product Owner's decision; the review informs it.
*Check:* `tests/test_phase_branch.py`

**WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET** *(PO A. Maier, 2026-09-24)*
Without a branch for the current phase or time box, the work of every job is merged into the default
branch.
*Occasion:* PO, 2026-09-24: "it should be main by default." A branch per sprint is extra ceremony
that a small product does not need.
*Check:* `tests/test_phase_branch.py`
## 14. Issues, mail and personal data

*(not yet approved — proposal of queue 2026-09-24g)*

## 15. Product resources

*(not yet approved — proposal of queue 2026-09-24g)*