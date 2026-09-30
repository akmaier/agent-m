# Agent M — Specification

**VERBINDLICH (SPEC)**

This is the single binding document of Agent M. A sentence belongs here when its violation would
be a defect. Everything else — how something is built, what was measured, what is planned —
belongs in `PLAN.md`, in `docs/measurements/`, or in the code, and does not bind.

**No section of this file is written by hand.** Each change is proposed in
`docs/spec-freigaben/<date>_<name>/`, shown on the review dashboard beside the text it would replace,
and written only when the Product Owner accepts it there (§10, `ACCEPTANCE IS A COMMIT BY THE
ACCEPTING PERSON`).

**Form of a requirement** (from `SOFTWARE_MAINTENANCE.md`, *"Wie eine Anforderung aussieht"*):
a **name** in capitals that is the ID and never changes, a **source with a date**, one **rule**
stated as a single testable sentence, an **occasion** of one or two lines, and the **check** that
guards it. One statement per requirement — an "and" in the rule means it is two.

---
## 0. Hard product rules

These five hold for every version of Agent M. A change to any of them is a change to what the
product is.

**NO SERVER** *(PO A. Maier, 2026-09-23)*
Agent M is delivered as a static site, repository conventions, and optional workflows; the project
operates no server, no account system and no database.
*Occasion:* a book companion that requires an account is a service, and a service that outlives
the reader's interest in it is a liability. GitHub Pages plus the reader's own repository has no
such tail.
*Check:* `tests/test_no_backend.py` — the built site contains no call to an origin other than the
configured endpoints, the repository servers of the instance and its products, the mail provider's API
and sign-in, the local bridge, the jump host's HTTPS address, and the package registries and resource
hosts the page names before it calls them.

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

**AGENT M IS MIT-LICENSED** *(PO A. Maier, 2026-09-24)*
Agent M is published under the MIT licence, stated in a `LICENSE` file at the root of its repository.
*Occasion:* PO, 2026-09-24: "I want MIT license for agent m; that should allow virtually any product
license." Every reader forks Agent M; without a licence, default copyright forbids exactly that reuse.
MIT puts no condition on the licence of the products built with it.
*Check:* `tests/test_licence.py` — the root `LICENSE` is the MIT text.
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

**A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY** *(PO A. Maier, 2026-09-30)*
A self-hosted runner that runs Agent M jobs is registered only to a repository whose visibility is
private, and Agent M starts no job on a runner of a public repository.
*Occasion:* PO, 2026-09-30, for machines behind NAT: the runner connects out to GitHub and needs no
incoming connection. GitHub advises self-hosted runners only for private repositories: on a public one,
a pull request from any fork can run its own code on the runner's machine — here, the machine with the
person's coding agent and its credentials.
*Check:* `tests/review-core.test.mjs` — starting a job on a runner of a repository the API reports as
public is refused; counter-proof: a private one is allowed.

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

**A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL** *(PO A. Maier, 2026-09-30)*
A bridge on a machine that accepts no incoming connection is reached through an SSH reverse tunnel that
this machine opens to a jump host the person names, and through a forward from the person's own machine
to that jump host.
*Occasion:* PO, 2026-09-30: machines behind a local NAT "will not be able to accept ssh. So they have to
build the tunnel from their side." Agent M runs no server (`NO SERVER`), so the tunnels meet on a host the
person already controls — the pattern of the process repository's support cockpit
(`SOFTWARE_MAINTENANCE.md` §6.1a). The bridge keeps its loopback bind and its token
(`THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`, `THE LOCAL BRIDGE REQUIRES A TOKEN`).
*Check:* `tests/test_bridge_tunnel.py` — through a reverse and a forward tunnel over a test SSH server,
the dashboard's request reaches the bridge; counter-proof: without the forward, nothing answers.

**A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK** *(PO A. Maier, 2026-09-30)*
The port a reverse tunnel opens on the jump host is bound to the jump host's loopback address only.
*Occasion:* an SSH reverse forward bound to all interfaces would put the bridge on the jump host's
network; bound to loopback (`GatewayPorts no`, SSH's default), it is reachable only by someone who can
log in there — the same protection as the bridge's own loopback bind. Measured for the support cockpit
on 2026-08-24: the tunnel end listened on `127.0.0.1`/`[::1]` only.
*Check:* `tests/test_bridge_tunnel.py` — the generated reverse-tunnel command names the loopback address;
counter-proof: a command with `0.0.0.0` or an empty bind address fails.

**A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST** *(PO A. Maier, 2026-09-30)*
The dashboard can reach a bridge through an HTTPS address of the jump host, served with a certificate the
browsers trust, whose web server forwards the requests to the end of the bridge's reverse tunnel on the
jump host's loopback.
*Occasion:* PO, 2026-09-30: "don't we have the route via a server like lme245? … Safari needs the server
tunnel variant?" Measured 2026-09-30 from documentation (`docs/measurements/2026-09-30_architecture-open-points.md`,
point 3): Chrome from 142, Edge from 143 and Firefox from 153 let an HTTPS page call `http://127.0.0.1`
after one local-network prompt; Safari blocks it as mixed content. An HTTPS address with a valid
certificate on a server the person controls is an ordinary web address for every browser; behind a
certificate the browser does not trust — a self-signed one — a request made by a page fails without any
way to proceed, so the certificate is part of the route: one issued for the host's name by an authority the
browsers trust, such as Let's Encrypt, free and renewed automatically, or the institution's own. The pattern is
the support cockpit's (`SOFTWARE_MAINTENANCE.md` §6.1a); the server is the person's own, like the jump host
(`NO SERVER`). Whether all four browsers reach a bridge this way is measured before release (`BROWSER
REACHABILITY IS MEASURED, NOT ASSUMED`).
*Check:* `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the
dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an
error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and
the settings page names the certificate as a possible cause.

**THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN** *(PO A. Maier, 2026-09-30)*
The jump host's web server forwards a request to a bridge's tunnel only when the request carries the web
server's own login over TLS.
*Occasion:* PO, 2026-09-30, option (a): a login at the server in addition to the bridge's token (`THE LOCAL
BRIDGE REQUIRES A TOKEN`) — "Ohne Authentifizierung kein Proxy" (`SOFTWARE_MAINTENANCE.md` §6.1a). The page
sends the login as Basic authentication in the `Authorization` header; the bridge's token travels in a
header of its own.
*Check:* `tests/test_bridge_tunnel.py` — a request without the login is answered `401` and reaches no
bridge; counter-proof: with the login and the bridge's token it is answered by the bridge.

**THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE** *(PO A. Maier, 2026-09-30)*
The jump host's web server allows cross-origin requests to a bridge only from the instance's Pages origin.
*Occasion:* before each such request the browser asks the server whether the page may send it (a
preflight), and sends no login with that question; the server answers it for the Pages origin only, and the
browser itself then refuses every other site's request. The login of the rule above still guards the
request that follows.
*Check:* `tests/test_bridge_tunnel.py` — a preflight from the Pages origin is allowed; counter-proof: one
from any other origin is refused.

**EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE** *(PO A. Maier, 2026-09-30)*
Each CLI session reached through the jump host is given one port from the jump host's configured port
range, and no two sessions share a port.
*Occasion:* PO, 2026-09-30: the settings name "the port range that the CLI sessions will use". Several
machines behind NAT tunnel to the same jump host; one port each keeps them apart, and a range the
person chose fits the jump host's own rules.
*Check:* `tests/review-core.test.mjs` — a new session gets the lowest free port of the range; a range
with no free port refuses a new session and says so.

**THE DASHBOARD WRITES THE TUNNEL COMMANDS** *(PO A. Maier, 2026-09-30)*
For each remote session, the dashboard shows the complete commands for both ends of its tunnel, filled
in from the settings.
*Occasion:* an SSH reverse forward with the right bind address, port and keep-alive options is easy to get
wrong by hand; generated from the settings, the two commands always match each other and the rules above.
The dashboard cannot run them itself — a web page cannot open SSH.
*Check:* `tests/review-core.test.mjs`

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
*Occasion:* the mechanisms this design rests on — cross-origin calls to model endpoints, a page's calls
to the local bridge (governed from Chrome 142, Edge 143 and Firefox 153 by a Local Network Access
permission, which replaced Chrome's Private Network Access preflights, and blocked by Safari as mixed
content), the route over HTTPS through the jump host, and SSH — are documented and not verified here
(documentation read 2026-09-30: `docs/measurements/2026-09-30_architecture-open-points.md`). A design built on an unverified mechanism fails late
and expensively.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

**AGENT M WORKS WITHOUT A LOCAL INSTALLATION** *(PO A. Maier, 2026-09-30)*
Every job that needs no resource on the person's own network can run with nothing installed on the
person's computer — in the browser, or in the product's CI on the server's own machines.
*Occasion:* PO, 2026-09-30: users "will not be coding experts" — "We will need both levels." The first
level is the one a newcomer meets: the dashboard, jobs in GitHub Actions or GitLab CI, mail through
Microsoft 365. Installing something is the second level, needed only for local agents, IMAP
mailboxes — Gmail's included — and machines on the person's own network.
*Check:* `tests/test_runtime_levels.py` — every job kind whose definition names no local resource is
runnable on the hosted-CI route; counter-proof: a job needing a compute resource is not offered there.

**A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET** *(PO A. Maier, 2026-09-30)*
A job on the server's own machines authenticates its coding agent with a key stored as a CI secret of the
repository, which the dashboard names and whose settings page it opens, and never asks for.
*Occasion:* on the first level there is no machine of the person's where a login could live; the CI
secret is the server's own store for it (`NO SECRET IN THE REPOSITORY`, `THE PAGE STATES WHAT IT SENDS
WHERE`). Such a job is billed per call to the agent's provider; the dashboard says so before it starts.
*Check:* `tests/test_runtime_levels.py` — the generated job workflow reads the key only from the named
secret; counter-proof: a workflow with the key written into it fails.

**THE BRIDGE IS ONE FILE PER PLATFORM** *(PO A. Maier, 2026-09-30, extended 2026-09-30, narrowed 2026-09-30)*
The local bridge is delivered as one file for each of Windows on x86-64, macOS and Linux — an executable,
a disk image or an installer —, and needs no other runtime installed.
*Occasion:* PO, 2026-09-30: "Single binary is very appealing because it is easy to install on windows and
Mac clients. Otherwise, you need to be a computer scientist to operate the local backend." Measured
2026-09-30: `deno compile` embeds a program into one executable for Windows, macOS (x86-64, ARM64) and
Linux, cross-compiled from any one host. PO, 2026-09-30, on ARC-011: an installer counts as the one file —
the build that gives the bridge its tray icon and window (`THE BRIDGE RUNS AS AN APP`) is documented to
yield a folder or an `.msi` installer on Windows, not a single executable. PO, 2026-09-30: Windows on ARM
"is not really a platform that is used for AI agents; i would defer that at present" — `deno desktop` has
no target for it (`docs/measurements/2026-09-30_architecture-open-points.md`, point 1).
*Check:* `tests/test_bridge_release.py` — the release build yields one file per platform, and each starts,
after installation where it is an installer, on a machine without Node or Deno.

**THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE** *(PO A. Maier, 2026-09-30)*
The bridge is compiled from the same JavaScript modules and job definitions the dashboard uses.
*Occasion:* `ONE DEFINITION, THREE DRIVERS`: a bridge in a second language would hold a second copy of the
job logic, which would drift from the first. Compiled from the same modules, the bridge and the browser
cannot disagree about what a job is.
*Check:* `tests/test_single_definition.py` — the bridge's build imports the dashboard's modules; no job
definition exists twice.

**THE BRIDGE IS SIGNED BY ITS PUBLISHER** *(PO A. Maier, 2026-09-30)*
Every released bridge file is signed by the publisher of the Agent M release — for macOS with an Apple
Developer ID and notarised, for Windows with a code-signing certificate.
*Occasion:* PO, 2026-09-30: "I sign personally." An unsigned download is blocked or shown with a warning by
both systems — for a non-expert, that ends the installation. The signature also tells the person which
file they may trust.
*Check:* `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or
notarisation cannot be verified.

**THE BRIDGE RUNS AS AN APP** *(PO A. Maier, 2026-09-30, extended 2026-09-30)*
The bridge is started by a double click and runs with an icon in the menu bar or the system tray — or,
where the system shows no tray icon, with its window open —, from which it is paused, quit and opened; it
needs no command line.
*Occasion:* the person may never have used a terminal; everything the bridge asks of them — pairing,
tunnel settings, which agents to use — happens in its own window. PO, 2026-09-30: where the tray fails,
the window takes its place — documented for KDE Plasma 6 on Wayland (Deno issue #36502), and a tray that
cannot be created fails without an error, so the bridge checks for it (`docs/measurements/2026-09-30_architecture-open-points.md`, point 1).
*Check:* no automatic check; at review.

**THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW** *(PO A. Maier, 2026-09-30)*
The bridge shows the token it is paired with in its own window, with a button that copies it.
*Occasion:* `THE BRIDGE IS PAIRED ONCE` keeps the token; the person has to bring it into the dashboard once.
A copy button is the whole instruction.
*Check:* no automatic check; at review.

**THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT** *(PO A. Maier, 2026-09-30)*
A bridge's own settings — its jump host, its port, its pairing token — are set in its window or read from
a settings file exported by the dashboard.
*Occasion:* a bridge behind NAT must know its jump host before any connection to it exists, so it cannot
be configured only from the dashboard. An export from the dashboard (`SETTINGS ARE EXPORTED AND IMPORTED
WITH THEIR SECRETS`) saves typing.
*Check:* `tests/test_bridge_settings.py`

**THE BRIDGE FINDS THE INSTALLED AGENTS** *(PO A. Maier, 2026-09-30)*
The bridge lists each supported coding-agent CLI that is installed on its machine, with its version, and
offers only those as participants.
*Occasion:* measured 2026-09-30 from their documentation: Claude Code runs a task with `claude -p` and
reports result and cost as JSON; Codex with `codex exec`; opencode through `opencode serve`, an HTTP
interface. Offering an agent that is not there would fail at the first job.
*Check:* `tests/test_bridge_agents.py` — with fixture executables on the path, exactly those are listed.

**THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT** *(PO A. Maier, 2026-09-30)*
For a supported agent that is not installed, the bridge shows the vendor's installation instructions for
its platform and checks again when the person says it is done.
*Occasion:* PO, 2026-09-30: "CLI for the users is ok. It's easy to install." The bridge links the vendor's
own instructions rather than installing on its own, so the person keeps control over what is installed.
*Check:* no automatic check; at review.

**A LOCAL AGENT USES THE PERSON'S OWN LOGIN** *(PO A. Maier, 2026-09-30)*
The bridge runs a coding agent with the login that agent already has on the machine; Agent M asks for no
key for it.
*Occasion:* on the second level the person's subscription does the work — no API key to create, no billing
per call, and the key never passes through Agent M (`NO SECRET IN THE REPOSITORY`).
*Check:* `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key
environment variable.

**THE BRIDGE OPENS ITS TUNNELS ITSELF** *(PO A. Maier, 2026-09-30)*
A bridge whose settings name a jump host opens the SSH connection they call for — the reverse tunnel on the
machine behind NAT, the forward on the person's machine — and keeps it open; the person types no SSH
command.
*Occasion:* the reverse tunnel of `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL` asked the person
to run and keep alive an `ssh` command; for a non-expert, the bridge does it. The commands the dashboard
writes (`THE DASHBOARD WRITES THE TUNNEL COMMANDS`) remain for machines without a bridge. The tunnel's end
stays on the jump host's loopback (`A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`).
*Check:* `tests/test_bridge_tunnel.py` — two bridges and a test SSH server: the dashboard's request reaches
the far bridge without any command typed; counter-proof: with the far bridge's tunnel closed, nothing
answers.

**THE BRIDGE CREATES ITS OWN SSH KEY** *(PO A. Maier, 2026-09-30)*
A bridge that opens tunnels creates its own SSH key pair on first use, keeps the private key on its machine
only, and shows the public key to be added on the jump host.
*Occasion:* creating and placing a key pair is the step non-experts get wrong most often; the bridge does
the first part and says exactly what to do with the second. The private key never leaves the machine —
not into the dashboard, not into an export.
*Check:* `tests/test_bridge_tunnel.py` — the private key file is readable by its owner only and appears in
no export; counter-proof: an export containing it fails the test.

**THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE** *(PO A. Maier, 2026-09-30)*
The bridge offers a newer release and installs it only after the person's click, and only when its
signature is valid.
*Occasion:* a program that replaces itself silently could be replaced by anyone who controls the download;
the signature (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`) and the click keep the person in control.
*Check:* `tests/test_bridge_release.py` — an update with an invalid signature is refused; counter-proof: a
valid one is installed after the click.
## 7. Configuration and secrets

**CONFIGURATION LIVES IN THE BROWSER** *(PO A. Maier, 2026-09-23, extended 2026-09-25)*
Endpoint, model, model API key, the repository tokens, the list of products, the bridge's address and
token, and the mailbox connection are stored in the browser of the person using the site; Agent M has
no other store for them.
*Occasion:* the Product Owner's requirement — no API key is exposed to the repository. With no
server (§0) the browser is the only place left, which makes the property structural rather than a
promise.
*Check:* `tests/test_config_client_side.py`

**SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS** *(PO A. Maier, 2026-09-29)*
The dashboard exports all its browser settings — tokens, keys and passwords included — as one file, and
imports them from such a file.
*Occasion:* PO, 2026-09-29: "I want to be able to move from one browser store to another, so exporting
including secrets is useful." Everything lives in one browser (`CONFIGURATION LIVES IN THE BROWSER`);
with the secrets in the file, a second computer is set up by one import. The file is the person's own
copy: Agent M writes it to no repository (`NO SECRET IN THE REPOSITORY`) and puts it in no URL.
*Check:* `tests/review-core.test.mjs` — an import of an export restores every setting, secrets included;
counter-proof: no export is ever committed or sent anywhere by the dashboard.

**AN EXPORT CAN BE LOCKED WITH A PASSPHRASE** *(PO A. Maier, 2026-09-29)*
The person may protect an export with a passphrase of their choice; the file is then encrypted in the
browser with a key derived from that passphrase and can be imported only with it.
*Occasion:* PO, 2026-09-29: "passphrase is a good option". An export holds every token and password;
locked, a file that is mailed, synced or lost gives nothing away. The browser's own cryptography does the
work (key derivation and authenticated encryption of the Web Crypto API), so no library is added. A
forgotten passphrase cannot be recovered; the dashboard says so before saving.
*Check:* `tests/review-core.test.mjs` — a locked export contains no stored secret in clear and imports
with the passphrase; counter-proof: a wrong passphrase imports nothing.

**AN EXPORT STATES THAT IT CONTAINS SECRETS** *(PO A. Maier, 2026-09-29)*
Before an export is saved, the dashboard states that the file contains every token, key and password it
holds, and what each of them grants.
*Occasion:* a file with the GitHub token and a mailbox password opens the person's repositories and mail
to whoever holds it; the person decides where to keep it knowing that.
*Check:* `tests/test_settings_disclosure.py`

**EVERY SETTING IS REACHED FROM ONE PAGE** *(PO A. Maier, 2026-09-28)*
Every setting Agent M uses — kept in this browser, in the instance repository or in a product's
repository — is reached from one settings page.
*Occasion:* PO, 2026-09-28: settings "such as access tokens, workspace configuration and other user
settings … We should be able to handle this centrally." They were set up in seven use cases (UC-001,
UC-003, UC-011, UC-014, UC-017, UC-037, UC-038); none showed them together, so a person could not see
what is stored where, nor change it.
*Check:* `tests/test_settings_page.py` — every key the dashboard writes to `localStorage` appears on the
page; counter-proof: a fixture key without a place on the page fails.

**A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN** *(PO A. Maier, 2026-09-28)*
Each setting kept in the browser is shown with a test of whether it still works and a control that
clears it.
*Occasion:* "does my token still work?" and "remove the mailbox from this browser" are the two questions a
settings page must answer on the spot (`A CLEAR IS A REAL CLEAR`).
*Check:* `tests/test_settings_page.py`

**A STORED SECRET IS HIDDEN UNTIL SHOWN** *(PO A. Maier, 2026-09-29)*
A stored token, key or password is displayed in a password field with a *Show* control that reveals it
in full.
*Occasion:* PO, 2026-09-29: "It's ok to use password fields, but they should have a 'show' button that
allows to check whether the token is the correct one." Hidden by default for screen shares; shown on
request to compare it with the token on GitHub's page or to copy it.
*Check:* `tests/test_settings_page.py` — a stored secret is rendered hidden; counter-proof: after *Show*
it appears in full.

**A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE** *(PO A. Maier, 2026-09-28)*
For each stored token, the settings page shows the expiry date recorded when it was stored, and the
dashboard warns from fourteen days before it.
*Occasion:* the prefilled GitHub token expires after 90 days (`THE TOKEN LINK IS PREFILLED`), and an
expired token stops everything at once. Measured 2026-09-28: GitHub sends a token's expiry in a response
header that its API does not expose to web pages (`Access-Control-Expose-Headers` omits it), so the date
is the one the person set — preset to the prefilled 90 days — and entered when storing.
*Check:* `tests/test_settings_page.py`

**AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED** *(PO A. Maier, 2026-09-28)*
When a server refuses a stored token, the dashboard names that token and links the page on which it is
renewed with the same permissions and repositories.
*Occasion:* "401" teaches nothing. GitHub's *Regenerate token* keeps a fine-grained token's
permissions and repository selection; only the new value has to be pasted.
*Check:* `tests/review-core.test.mjs` — a refused request yields the token's name and the renewal link.

**A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY** *(PO A. Maier, 2026-09-28)*
Settings that govern how a product is developed — its process model, Definition of Done, test
schedule, pseudonymisation and collaborators — are kept in files of the product's repository, never only
in a browser.
*Occasion:* they bind everyone who works on the product and every agent that runs for it; a setting in one
person's browser would bind no one else.
*Check:* `tests/test_settings_page.py` — changing a product setting on the page commits to the product
repository; counter-proof: `localStorage` holds no product setting.

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

**A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN** *(PO A. Maier, 2026-09-24, changed 2026-09-30)*
For a product on a GitLab server, Agent M guides the person to create a project access token for
that one project, with role *Maintainer* and scope `api`, and to paste it into Agent M.
*Occasion:* a GitLab personal access token with `api` scope reaches every project of its owner,
which `A TOKEN IS SCOPED TO WHAT IT WRITES` rules out. A project access token reaches one project.
It costs one token per GitLab product; where the server does not offer project access tokens, the
person is told so, and why a personal token is broader. PO, 2026-09-30: role *Maintainer*, because
GitLab protects the default branch against pushes by Developers unless a project changes that
setting, so a Developer token could write nothing on a project with default settings.
*Check:* `tests/review-core.test.mjs`

**ONE GITHUB TOKEN SERVES EVERY FEATURE** *(PO A. Maier, 2026-09-24)*
On GitHub, Agent M asks a person for one fine-grained token that carries every permission its
features need on the repositories the person selects — *Contents*, *Issues* and *Pull requests* read
and write, *Actions* and *Workflows* read and write, *Metadata* read.
*Occasion:* PO, 2026-09-24: "Better to keep it in one token; otherwise users are overwhelmed."
Issues from mail need *Issues*, starting a CI run needs *Actions*; a second and a third token would
triple the setup that UC-014 just made manageable. PO, 2026-09-30: a job on the server's machines writes
with this token (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`); opening and merging its
pull requests needs *Pull requests*, and a job that generates the CI configuration (UC-027) needs
*Workflows*. The scope stays limited by the repository
selection (`A TOKEN IS SCOPED TO WHAT IT WRITES`), and a GitLab product keeps its project token
(`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`).
*Check:* `tests/test_token_scope_documented.py` — the prefilled link asks for exactly these
permissions.

**THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS** *(PO A. Maier, 2026-09-30, extended 2026-09-30)*
The jump host's name, SSH user, port range, HTTPS address and web-server login, and for each remote
session its name, port and bridge token, are kept in the browser's settings.
*Occasion:* PO, 2026-09-30: "We need to be able to configure the keys for this in the settings as well as
the hostname and the port range that the CLI sessions will use." They are what the dashboard needs to
reach a session and to write its tunnel commands (`THE DASHBOARD WRITES THE TUNNEL COMMANDS`); like every
browser setting they are tested, cleared and exported on the settings page. PO, 2026-09-30: the HTTPS
address and the login are the route to a bridge that works in every browser (`A BRIDGE CAN BE REACHED OVER
HTTPS THROUGH THE JUMP HOST`, `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`).
*Check:* `tests/test_settings_page.py`

**A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET** *(PO A. Maier, 2026-09-30)*
A job on the server's own machines pushes, opens pull requests and merges them with the person's Agent M
token stored as a CI secret of the product repository, never with the workflow's built-in token.
*Occasion:* PO, 2026-09-30: "can't we use github secrets here?" Measured 2026-09-30 from GitHub's
documentation (`docs/measurements/2026-09-30_architecture-open-points.md`, point 8): events caused with
the workflow's `GITHUB_TOKEN` start no new workflow run, and pull requests it opens start their runs "in an
approval-required state" — a run would stop at a click (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS
JOBS`). GitHub's remedy is a personal access token or a GitHub App token stored as a secret; the PO chose
the person's own token, so that it stays one token (`ONE GITHUB TOKEN SERVES EVERY FEATURE`). A secret
cannot be read back, so the person stores the value twice — in the browser and as the secret —; the
dashboard names the secret and opens its page, as for the agent's key (`A HOSTED JOB AUTHENTICATES ITS
AGENT WITH A CI SECRET`). On GitLab the job token opens no merge request and its pushes start no
pipeline; there the product's project access token is stored as a protected, masked CI/CD variable.
*Check:* `tests/test_runtime_levels.py` — the generated job workflow authenticates its pushes and pull
requests with the named secret; counter-proof: a workflow that uses `GITHUB_TOKEN` for them fails.
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

**A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT** *(PO A. Maier, 2026-09-30)*
When a draft returned by a participant fails one of Agent M's checks, Agent M sends the draft and its
findings back to that participant and asks for a corrected draft before the person sees it.
*Occasion:* PO, 2026-09-30, on UC-019: Agent M "should report problems … back to the drafting participant
and ask it to fix the problems … So Step 7 should work like a harness until it is completed
successfully." A person should read drafts, not mechanical errors a check already found; the book's agent
loop — reason, act, observe (ch. 11 §2) — with Agent M's checks as the observation.
*Check:* `tests/test_correction_loop.py` — a fixture participant that first returns an unknown name under
`realises` and then a corrected draft is asked once more and the person sees only the corrected draft;
counter-proof: with the loop switched off, the person sees the error.

**A FINDING READS LIKE A COMPILER MESSAGE** *(PO A. Maier, 2026-09-30)*
Every finding sent back names the artifact and line it concerns, its kind (*error* or *warning*), the
rule it violates by name, and the correction expected, in one fixed text form.
*Occasion:* PO, 2026-09-30: "including giving a template text like a compiler on what the problem is that
it detected". For example: `UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE
REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.` The template lives once in the
repository's single definition (`ONE DEFINITION, THREE DRIVERS`).
*Check:* `tests/test_correction_loop.py` — every finding of the fixture run matches the template.

**AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED** *(PO A. Maier, 2026-09-30)*
A draft leaves the loop only when it has no error and every warning is either fixed or answered with a
one-line justification.
*Occasion:* errors are decided without a model — an unknown name, a changed identifier, a missing field,
an unreadable answer — and have one right outcome. A warning is a suspicion, such as an "and" in a rule
(`ONE STATEMENT PER REQUIREMENT`): demanding a fix for a false alarm would never end, so the participant may
keep the text with a reason, which the person reads.
*Check:* `tests/test_correction_loop.py` — a justified warning ends the loop; an unfixed error does not.

**WHAT A PERSON DECIDES IS NOT SENT BACK** *(PO A. Maier, 2026-09-30)*
A conflict with an existing requirement, and every other finding the SPEC leaves to a person, is shown to
the person and never sent back to the participant.
*Occasion:* `A CONFLICT IS DECIDED BY A PERSON`: a loop that let the participant resolve it would take the
decision away from the person, one round at a time.
*Check:* `tests/test_correction_loop.py` — a conflict finding appears in no message to the participant.

**THE CORRECTION LOOP HAS A FIXED LIMIT** *(PO A. Maier, 2026-09-30)*
The loop ends after a number of rounds fixed before the first round, or earlier when a round leaves the
findings unchanged; a draft that still has findings is then shown to the person with them.
*Occasion:* every round is another model call and costs time and money; a participant that cannot fix a
finding would otherwise loop for ever. The same form as the process repository's repair rounds for
unreadable model output (`SOFTWARE_MAINTENANCE.md` §4.0, point 11, addendum of 2026-09-01). The run panel
states the limit before the person presses *Run*.
*Check:* `tests/test_correction_loop.py` — a participant that never fixes its error is asked exactly
*limit* times, or once more than a round without change, and the person sees the remaining finding.

**THE ROUNDS ARE COUNTED AND SHOWN** *(PO A. Maier, 2026-09-30)*
The number of correction rounds a draft needed, and the findings of each round, are shown with the draft
and recorded with it.
*Occasion:* counted, the rounds say how well a participant fits a task — a measure across runs, not a verdict
on one (`SOFTWARE_MAINTENANCE.md` §4.0a rule 4); hidden, a loop would make a weak participant look as good
as a strong one.
*Check:* `tests/test_correction_loop.py`
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

**A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT** *(PO A. Maier, 2026-09-24, narrowed 2026-09-30)*
Text that a participant returns to the dashboard from a person's instruction is shown as a difference
against the current text before the person can save it.
*Occasion:* PO, 2026-09-24: specifications and use cases must be modifiable by "a prompt to an LLM or
agent". A model asked to add error handling may also reword three unrelated steps; only the
difference makes that visible. PO, 2026-09-30: a CI agent's draft is written before anyone sees it on
the dashboard; `A CI AGENT'S DRAFT ENTERS AS OPEN` covers that route.
*Check:* `tests/review-core.test.mjs`

**A CI AGENT'S DRAFT ENTERS AS OPEN** *(PO A. Maier, 2026-09-30)*
A change that a CI agent drafts from a person's instruction is committed to the default branch only as
an open use case or as an entry of a SPEC change queue.
*Occasion:* PO, 2026-09-30, on UC-019 (queue 2026-09-24g, entry 05, open question 6): a job in GitHub
Actions or GitLab CI reaches the repository only by commit, so its draft cannot wait in the dashboard's
editor. The person reads the difference at review instead — a use case against its last accepted text
(`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`), a requirement beside the current SPEC
section (`NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`) — and nothing counts before an approval
names it (`A GENERATED ARTIFACT IS A PROPOSAL`).
*Check:* `tests/test_prompted_change_context.py` — a CI-agent fixture's prompted change yields an open
use case or a queue entry and leaves `SPEC.md` byte-identical; counter-proof: neither is shown as
accepted.

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

**A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT** *(PO A. Maier, 2026-09-30)*
For a reviewed file that has changed since it was accepted, the dashboard shows the difference between
the text named by the most recent approval record for the same identifier and the current text.
*Occasion:* PO, 2026-09-30: "It would be great to have a diff of the previous accepted and the update to
review them quicker." The approval record already names the accepted text by its blob SHA (`AN APPROVAL
NAMES THE EXACT TEXT`), so git holds it; the reviewer then reads only what changed. Matched by identifier,
not by path, so that a renamed file — UC-010 after 2026-09-30 — still shows what was accepted before.
*Check:* `tests/review-core.test.mjs` — a use case with one changed line shows exactly that line against its
last accepted text; counter-proof: with two approval records, the older text is not the one compared.
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

**ONE DASHBOARD SHOWS EVERY JOB** *(PO A. Maier, 2026-09-24, extended 2026-09-30)*
The job dashboard of an instance lists every job of every product it manages. Each job appears with
its state (queued, running, waiting at a gate, done, failed, cancelled or ended without record), its
participant, where it runs, what it works on, its elapsed time and a link to its log.
*Occasion:* PO, 2026-09-24: "There should be dashboard that shows all running stages which allows
to inspect their status". Jobs run in several places at once: CI, a CLI agent, a sandbox. Without
one view, nobody knows what is running. The book's human-above-the-loop oversight also needs one
place to watch from (ch. 11 §8). PO, 2026-09-30: a job with a start record, no end record and no
runtime that knows it — the tab was closed, the bridge restarted (UC-036, 1c) — is a state of its own,
*ended without record*; calling it *failed* would claim an outcome nobody observed.
*Check:* `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in
one list. A job state outside the seven is rejected.

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

**A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION** *(PO A. Maier, 2026-09-30)*
A person can start one run over any selection of the product's accepted work — one module, several or
all, or, in a model that works from a backlog, backlog items — and Agent M carries it out as jobs in the
phases, order, roles and gates of the product's declared process model.
*Occasion:* PO, 2026-09-30: "I want to be able to implement any subset including all at once using the
process model configured in UC-031 … In the first pass, i probably want to implement all of them using a
process model autonomously." The model already names its phases, the artifacts each produces, the roles
that do them and the gates between them (`THE MODEL DETERMINES THE PHASES AND THE GATES`); starting every
job of it by hand would repeat that knowledge click by click.
*Check:* `tests/test_process_run.py` — a V-model fixture with three accepted modules yields, from one
start, the jobs of every phase for all three in the model's order.

**A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS** *(PO A. Maier, 2026-09-30)*
Within a run, each job starts by itself as soon as the jobs it depends on are done, until the run is
finished, waits at a gate its model gives to a person, or reaches one of its limits.
*Occasion:* PO, 2026-09-30: "it reads like i have to click everything step by step and that would be very
labor intensive". A person is needed where the model says so (`A JOB STOPS AT EVERY GATE`), not between
jobs that only follow from one another.
*Check:* `tests/test_process_run.py` — a fixture run of five jobs without a person's gate needs one start
and no further click; counter-proof: with a gate decided by a person, it waits there and nowhere else.

**A RUN FOLLOWS THE MODULES' INTERFACES** *(PO A. Maier, 2026-09-30)*
Within a run, a module is implemented only after every module whose interfaces it uses.
*Occasion:* an implementation job is given the interfaces — not the code — of the modules it uses
(UC-024); they must exist before it starts, or it would build against a guess. Modules without a
dependency between them run side by side.
*Check:* `tests/test_process_run.py` — for modules A → B → C and D, C starts after B and B after A, while D
runs alongside; counter-proof: a cycle in the interfaces is refused before the run starts, and named.

**A RUN SETS UP CI BEFORE IT IMPLEMENTS** *(PO A. Maier, 2026-09-30)*
A run whose product has no CI configuration generated from its test schedule creates it before its first
implementation job.
*Occasion:* every implementation job begins with a red CI run and ends on a green one (`AN IMPLEMENTATION
JOB BEGINS WITH A FAILING TEST`); without CI the first job could prove neither.
*Check:* `tests/test_process_run.py`

**A RUN HAS LIMITS FIXED AT ITS START** *(PO A. Maier, 2026-09-30)*
Before a run starts, it states how many jobs may run at once, its cost limit and its correction-round
limit, and it stops starting jobs when one of them is reached.
*Occasion:* autonomy without limits is spending without limits. The work-in-progress limit of the model
(`NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`) caps parallel jobs; the cost limit counts only costs
the runtimes report (`NO COST IS GUESSED`); the round limit is that of the correction loop (`THE
CORRECTION LOOP HAS A FIXED LIMIT`).
*Check:* `tests/test_process_run.py` — a run whose reported cost reaches its limit starts no further job
and says why; counter-proof: below the limit it continues.

**A RUN IS A JOB THAT NAMES ITS JOBS** *(PO A. Maier, 2026-09-30)*
A run is recorded as a job whose record lists every job it started, and each of those jobs names the run.
*Occasion:* the job dashboard and the job records already exist (`ONE DASHBOARD SHOWS EVERY JOB`, `A JOB IS
RECORDED IN ITS PRODUCT REPOSITORY`); a run needs no second kind of record, only the link in both
directions, so that "what did the run of Tuesday do" has one answer.
*Check:* `tests/test_job_record.py`

**A RUN ENDS WITH THE VALIDATION OF ITS MODULES** *(PO A. Maier, 2026-09-30)*
When a run ends, the dashboard shows for its selection what each module realises, which code and tests
belong to it, and every gap.
*Occasion:* after an autonomous pass the question is what exists now and what is missing — the module
validation of UC-025, limited to what the run touched (`MODULE GAPS ARE REPORTED, NOT FORBIDDEN`).
*Check:* `tests/test_process_run.py`

**CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT** *(PO A. Maier, 2026-09-30)*
The Product Owner may assign closing a sprint — its review, its retrospective and the decisions on its
unfinished items — to a participant of the product, a person or an agent.
*Occasion:* PO, 2026-09-30: "we should be able to run this automatically. So product owner should be able
to assign the task to an agent or model." Most of a sprint's close is reading what the repository already
holds — merged items, failed jobs, waiting times, flaky tests, cost — which an agent does as well as a
person, every sprint, without being reminded.
*Check:* `tests/test_time_box_close.py` — a sprint whose close is assigned to an agent fixture is closed
with a review and a retrospective recorded by that agent.

**A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF** *(PO A. Maier, 2026-09-30)*
When closing a sprint is assigned to an agent, its job starts by itself when the sprint's time box ends.
*Occasion:* the point of assigning it is that nobody has to remember; the time box's end date is already
recorded with the sprint (UC-032).
*Check:* `tests/test_time_box_close.py`

**AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM** *(PO A. Maier, 2026-09-30)*
A review recorded by an agent names the sources of its feedback — issues, mails, job records, test
results — and states that no stakeholder took part unless one did.
*Occasion:* the book's review inspects the increment together with stakeholders (ch. 7 §5). An agent can
gather what stakeholders wrote, but it must not present its own reading as their voice.
*Check:* `tests/test_time_box_close.py` — a review by an agent without stakeholder input says so; counter-
proof: a review listing a stakeholder names where their feedback is recorded.

**AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF** *(PO A. Maier, 2026-09-30)*
A change to the process model, the Definition of Done or a participant's instructions that an agent's
retrospective recommends is proposed for a person's acceptance and not applied by the agent.
*Occasion:* these three govern how the agents themselves work; an agent that could change them after its
own sprint would decide on its own rules — the reasoning of `A GATE IS NOT DECIDED BY THE PARTICIPANT
WHOSE WORK IT CHECKS`, one level up. The retrospective's findings are recorded at once; only the changes
wait.
*Check:* `tests/test_time_box_close.py` — after an agent's retrospective, the model, the Definition of Done
and the participants are byte-identical, and the proposed changes are open for acceptance.
## 14. Issues, mail and personal data

**A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE** *(PO A. Maier, 2026-09-29)*
The dashboard reaches a Microsoft 365 mailbox directly through Microsoft Graph, and any other mailbox —
Gmail included — through the local bridge over IMAP and SMTP.
*Occasion:* PO, 2026-09-29, asked for mail access from the GitHub Pages site itself. Browsers let no web
page open a raw TCP connection, so IMAP and SMTP cannot be spoken from a page; an HTTP API can, where
its server permits the page's origin. Measured 2026-09-29: Microsoft Graph answers the preflight from
`https://akmaier.github.io` with `Access-Control-Allow-Origin: *` and the Gmail API with that origin
itself; FAU's Exchange (`groupware.fau.de`) answers `401` without any `Access-Control-*` header, and is
not Microsoft 365. Libraries that promise IMAP in the browser (`emailjs-imap-client`) rely on a relay
server for exactly this reason — which is what the bridge is, on the person's own machine. PO,
2026-09-30: Gmail through the bridge only. Measured 2026-09-30 from Google's documentation
(`docs/measurements/2026-09-30_architecture-open-points.md`, point 6): every Gmail read scope is
restricted and needs Google's verification for a public app, a browser-only app gets no refresh token,
and the flow without Google's own library is strongly discouraged. Over IMAP, Gmail refuses the account
password since 2025-03-14 but accepts an app password, which needs 2-Step Verification and is not offered
for many work or school accounts (support.google.com/accounts/answer/185833, read 2026-09-30).
*Check:* `tests/test_mail_routes.py` — a Microsoft 365 fixture is read with no bridge request;
counter-proof: an IMAP fixture, a Gmail one included, is read only through the bridge.

**AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN** *(PO A. Maier, 2026-09-29)*
A mailbox reached through its provider's web API is authorised by that provider's sign-in in the
browser; Agent M asks for no mailbox password.
*Occasion:* the provider's sign-in gives the dashboard a revocable token for the mailbox; the password
itself never reaches Agent M. That is safer than a stored password, and the provider's own page shows
and withdraws the access.
*Check:* `tests/test_mail_routes.py` — the API route stores no password; counter-proof: the IMAP route
asks for one.

**THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING** *(PO A. Maier, 2026-09-29)*
The provider sign-in asks for no permission beyond the narrowest ones its provider offers for reading
mail, creating drafts and sending mail.
*Occasion:* a mailbox token reaches as far as the mailbox itself; `A TOKEN IS SCOPED TO WHAT IT WRITES`
applied to mail — no calendar, no contacts, no settings of the account. PO, 2026-09-30: "We will need to
be able to create new drafts in the mailbox." Measured 2026-09-30 (point 6 of the measurement above):
Microsoft Graph has no permission for drafts alone — creating one needs `Mail.ReadWrite`, which also
allows changing and deleting mail; the narrowest set is `Mail.ReadWrite`, `Mail.Send` and
`offline_access`. That Agent M changes nothing it reads rests on `READING THE MAILBOX CHANGES NOTHING IN
IT`, not on the permission.
*Check:* `tests/test_mail_routes.py` — the requested scopes are exactly `Mail.ReadWrite`, `Mail.Send` and
`offline_access`.

**THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER** *(PO A. Maier, 2026-09-29)*
A mailbox token from a provider sign-in leaves the browser only as the authorisation of requests to that
provider's API.
*Occasion:* the same boundary as `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` for repository tokens:
a mailbox token that reached another origin could be used to read every mail.
*Check:* `tests/review-core.test.mjs` — a request to any other origin carries no mailbox token;
counter-proof: the request to the provider carries it.

**THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE** *(PO A. Maier, 2026-09-24)*
Before a mailbox password is stored, Agent M states that every GitHub Pages site under the same
`<owner>.github.io` can read it, and what it grants: reading every mail of the mailbox and sending
mail in its name.
*Occasion:* only the bridge route needs a password (`A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API
OR THROUGH THE BRIDGE`). PO decision 2026-09-24 — the password is kept in the browser's store and the shared
origin is an accepted risk (measured 2026-09-23: seven Pages sites share `https://akmaier.github.io`).
A mailbox password reaches further than a repository token, so the notice of
`THE SHARED PAGES ORIGIN IS DISCLOSED` is not enough; the notice recommends an owner used for nothing
else.
*Check:* `tests/test_settings_disclosure.py` — the mailbox form stores nothing before the notice is
acknowledged.

**THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE** *(PO A. Maier, 2026-09-24)*
The mailbox password leaves the browser only inside a request to the local bridge.
*Occasion:* a browser cannot speak IMAP or SMTP, so the bridge is the one place that needs it (PO
decision 2026-09-24). It never goes to a repository server, a model endpoint or a participant —
"passwords and secrets must not be shared".
*Check:* `tests/test_mail_password_route.py` — every outgoing request of a full mail run is recorded;
the password appears only in requests to the bridge address.

**THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST** *(PO A. Maier, 2026-09-24)*
The bridge keeps the mailbox password only in memory, for the duration of the request that carried
it.
*Occasion:* the PO's store is the browser's; a second copy on the bridge's disk would outlive a
disconnect and be readable by every program of that machine. Clearing the browser's store
(`A CLEAR IS A REAL CLEAR`) then removes the password everywhere.
*Check:* `tests/test_bridge_mail.py` — after a run with a marker password, no file below the bridge's
directories and no log line contains it; counter-proof: a bridge that logs the request fails.

**THE MAIL SERVER IS REACHED ONLY OVER TLS** *(PO A. Maier, 2026-09-24)*
The bridge sends a login to an IMAP or SMTP server only over an encrypted connection — implicit TLS
or STARTTLS.
*Occasion:* a login without encryption sends the password in clear text over the network.
*Check:* `tests/test_bridge_mail.py` — against a local test server without TLS, no `LOGIN`/`AUTH` is
sent.

**READING THE MAILBOX CHANGES NOTHING IN IT** *(PO A. Maier, 2026-09-24)*
Reading mails for issues neither marks a mail as read nor moves, deletes or flags it.
*Occasion:* the mailbox is the person's working tool; reading it for Agent M must not change what
they see there. Taken over from `ticket_db.ingest` (read-only select, `BODY.PEEK`). Agent M sets no
flags either: how a mail was handled is recorded in its issue (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S
HANDLING`).
*Check:* `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`,
`MOVE`, `EXPUNGE` and no non-peek `FETCH`.
On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).

**MAIL STAYS IN THE MAILBOX** *(PO A. Maier, 2026-09-29)*
The text of a mail, its sender, its reply address and its attachments are kept only in the mailbox;
Agent M writes them to no repository, issue tracker or file.
*Occasion:* PO, 2026-09-29: the tracker is the product's GitHub or GitLab issues, and "not all
repositories will have a private branch or tracker". The mailbox already holds every mail, with the
protection its owner chose; a second copy anywhere else would be one more place for personal data to
leak from. The dashboard shows a mail while it is open and forgets it with the tab.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails, no write of Agent M contains a
sender address, a sender name, the body of a mail as a whole or one of its attachments; counter-proof: a
planted body in a job record is found.

**THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING** *(PO A. Maier, 2026-09-29)*
Which mails an issue concerns, which of them were answered, and whether the issue waits for a reporter
are recorded only in the product's issue tracker.
*Occasion:* PO, 2026-09-29: "we have issues for this. We don't need double accounting here." Mailbox
flags, a tracker of reports and a list of replies would each be a second account of the same state, and
would disagree with the issue sooner or later.
*Check:* `tests/test_mail_replies.py` — the mail dashboard's groups are computed from issues and the
mailbox alone; counter-proof: clearing the browser's storage changes none of them.

**A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER** *(PO A. Maier, 2026-09-28)*
Every mail Agent M handles has the identifier `MAIL-` followed by the first sixteen hexadecimal digits
of the SHA-256 of its `Message-ID`, or of its bytes when it has none.
*Occasion:* PO, 2026-09-28: mails "should receive a unique identifier (maybe as hash) that can be tracked
in the issue". A `Message-ID` often contains a host or a user name, so it is never written itself; the
hash cannot be turned back into it, and only the mailbox, which holds the mail, links it back.
*Check:* `tests/test_mail_import.py` — the identifier is stable across two readings of the same mail;
counter-proof: two mails with different `Message-ID`s get different identifiers.

**A MAIL IS FOUND AGAIN BY ITS IDENTIFIER** *(PO A. Maier, 2026-09-29)*
To show or answer a mail an issue lists, Agent M finds it in the mailbox by hashing the `Message-ID`s
of the folders the mailbox connection names — `INBOX` unless others are named.
*Occasion:* with the mailbox as the only store (`MAIL STAYS IN THE MAILBOX`), the identifier in the issue
must lead back to the mail. IMAP and both web APIs deliver the `Message-ID` headers of a folder without
reading the mails; hashing them is cheap. Mails the person has filed into other folders are found once those folders are
named. PO, 2026-09-29: a mail deleted from the mailbox can no longer be answered, and the dashboard says
*not found in the mailbox* — "this is acceptable; it's also the proof that the issue does not store
personal information".
*Check:* `tests/test_bridge_mail.py` — a mail moved to a named folder is found; counter-proof: an
identifier with no matching mail yields *not found in the mailbox*, never a guess.

**AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS** *(PO A. Maier, 2026-09-28)*
An issue created from a mail, and every issue a further report is added to, lists the `MAIL-`
identifiers of its reports.
*Occasion:* PO, 2026-09-28: the identifier is tracked in the issue "such that this information can be
used once the issue was solved to reply to the original mail". Whoever closes the issue — in Agent M or
elsewhere — leaves the link to every reporter in place.
*Check:* `tests/test_mail_replies.py` — closing an issue with two listed identifiers offers two replies,
found through the identifiers alone.

**A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN** *(PO A. Maier, 2026-09-29)*
A mail that an issue lists, or that the person marked *not an issue* in this browser, is not proposed
again.
*Occasion:* reading the mailbox twice must not produce a second proposal for the same mail. The issues
say which mails became issues; for the rest — a thank-you, spam — the browser keeps their identifiers
only, which say nothing about their senders.
*Check:* `tests/test_mail_import.py` — a second reading proposes no listed and no marked mail;
counter-proof: an unmarked new mail is proposed.

**THE PRODUCT ISSUE CARRIES NO PERSONAL DATA** *(PO A. Maier, 2026-09-24)*
An issue created from a mail contains no name, mail address, phone number or signature of anyone
named in the mail.
*Occasion:* PO decision 2026-09-24 — the product's issue tracker gets the technical content only.
Product issue trackers are often public.
*Check:* `tests/test_mail_privacy.py` — deterministic: every address and display name from the mail's
headers, and every address and phone number found in its body, is absent from the issue text. How
often the participant's neutral text still contains personal data is measured as a rate on a fixed
set of mails (§4.0a rule 4), reported, not gated.

**A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK** *(PO A. Maier, 2026-09-24)*
An issue is created from a mail only as the direct result of a person's click on the proposed issue
text.
*Occasion:* the participant proposes product, kind, text and duplicates; the person decides
(`A GENERATED ARTIFACT IS A PROPOSAL`). A CLI agent that could create issues on its own would put its
own reading of a mail — including personal data it missed — into the product's tracker.
*Check:* `tests/test_mail_import.py` — a run without the click creates no issue; the participant's
job definition contains no issue-creating call.

**AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE** *(PO A. Maier, 2026-09-24)*
Every issue created from a mail is labelled either as a defect against the current SPEC or as a
request for changed behaviour.
*Occasion:* the two go different ways — a defect to implementation, a change first through the SPEC
(`EVOLUTION ENTERS THROUGH THE SPECIFICATION`, UC-012). The book distinguishes correcting faults from
improving and adapting (ch. 14, *Software Maintenance: Types and Cost Dynamics*).
*Check:* `tests/test_mail_import.py`

**A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL** *(PO A. Maier, 2026-09-24, reworded 2026-09-29)*
A mail whose `In-Reply-To` or `References` names a mail that an issue lists is attached to that issue —
its identifier added to the issue's list — before any participant sees it.
*Occasion:* what can be decided without a model is decided without one (`SOFTWARE_MAINTENANCE.md`
§4.0a rule 3). A reporter's answer to a question must land at their issue, not become a new one.
*Check:* `tests/test_mail_import.py`

**A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE** *(PO A. Maier, 2026-09-29)*
A mail the person confirms as describing an existing issue adds its identifier to that issue instead of
creating a new one.
*Occasion:* several people report the same fault; each must be answered when it is solved — "keeping
track who to reply" —, and the issue's list of identifiers is what keeps track.
*Check:* `tests/test_mail_import.py`

**EVERY OUTGOING MAIL IS RELEASED BY A PERSON** *(PO A. Maier, 2026-09-24, reworded 2026-09-29)*
Agent M sends a mail only as the direct result of a person's click on the complete mail shown to them —
recipients, subject, body and attachments.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §0.1 ("kein Auto-Reply") and §6.1 (explicit
click with confirmation). A participant can draft a mail, never send one. A draft the person sends from
their own mail program is their own click, outside Agent M.
*Check:* `tests/test_mail_routes.py` — on both routes, no send request is made without the click;
counter-proof: with it, exactly one.

**THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN** *(PO A. Maier, 2026-09-24, split 2026-09-29)*
The bridge sends a mail only with a single-use confirmation that names the SHA-256 of the complete mail
shown to the person.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 (single-use nonce). The bridge is a separate
program; binding the confirmation to the hash makes the gate structural there too: a mail changed after
the preview is not the one released, and a repeated request sends nothing.
*Check:* `tests/test_bridge_mail.py` — sending mocked: without confirmation, with a reused one, or
with a body changed after the preview, zero SMTP calls.

**A REPLY IS THREADED ON THE REPORTER'S MAIL** *(PO A. Maier, 2026-09-24)*
A reply to a report carries that report's `Message-ID` in `In-Reply-To` and `References`, wherever the
reporter stands among the recipients.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6 and `DER THREAD-ANKER IST DER MELDER`
(§6.1). The reporter's answer then arrives in the same thread, which
`A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL` relies on.
*Check:* `tests/test_bridge_mail.py`

**A REPLY GOES TO ONE REPORTER** *(PO A. Maier, 2026-09-24)*
A reply to one report has no reporter of another report among its recipients.
*Occasion:* several people often report the same fault (`A DUPLICATE MAIL IS ADDED TO THE EXISTING
ISSUE`). One mail to all of them would give each reporter the others' addresses — personal data
disclosed by the tool meant to keep it private.
*Check:* `tests/test_mail_replies.py` — an issue with three reports yields three mails, each with one
reporter.

**CLOSING AN ISSUE PREPARES ITS REPLIES** *(PO A. Maier, 2026-09-29)*
When an issue that lists mails is closed, the mail dashboard offers to draft a reply for every listed mail
that has no sent reply noted in the issue.
*Occasion:* PO, 2026-09-29: "Closing the issue creates a reply in the mail dashboard; this is then sent
from the dashboard." An issue is often closed elsewhere — by a merged pull request —, so the offer is
derived from the issue's state, not from a click in Agent M.
*Check:* `tests/test_mail_replies.py` — a closed issue listing two mails yields two offers; counter-proof:
with a reply noted for one, one offer.

**A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER** *(PO A. Maier, 2026-09-29)*
A reply drafted for a mail an issue lists is stored as a draft in the mailbox's *Drafts* folder, as a
reply to that mail, and nowhere else.
*Occasion:* PO, 2026-09-29: "Once the issue is closed, the replies can be stored in the draft folder.
This is where the send dashboard will find them." The draft holds the reporter's address and the
quoted mail — personal data that belongs in the mailbox (`MAIL STAYS IN THE MAILBOX`). The person can
review and send it from the dashboard or from their own mail program.
*Check:* `tests/test_mail_replies.py` — after drafting, the draft is in *Drafts* with `In-Reply-To`
set, and no write outside the mailbox contains its text.

**THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS** *(PO A. Maier, 2026-09-29)*
The send dashboard shows every draft in the *Drafts* folder that replies to a mail an issue lists.
*Occasion:* the drafts folder is the list of what is waiting to be sent; the dashboard reads it instead
of keeping a list of its own (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`).
*Check:* `tests/test_mail_replies.py` — a draft replying to a listed mail is shown; counter-proof: an
unrelated draft of the person is not.

**A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO** *(PO A. Maier, 2026-09-29)*
A reply to a listed mail found in the *Sent* folder is noted in the issue, whether it was sent from the
dashboard or from a mail program.
*Occasion:* with drafts in the mailbox, the person may send from wherever they read mail; the issue must
still know that the reporter was answered, or it would offer the reply again.
*Check:* `tests/test_mail_replies.py` — a reply placed in *Sent* by hand is noted at the next reading;
counter-proof: an unrelated sent mail is not.

**A SENT REPLY IS NOTED IN THE ISSUE** *(PO A. Maier, 2026-09-29)*
When a reply is sent, the issue receives a comment naming the mail's identifier and the date, and
nothing of the reply's text or recipient.
*Occasion:* the note is the issue's own record that this reporter was answered
(`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`); the reply itself is in the mailbox's *Sent*
folder, threaded on the reporter's mail. For a reply sent from a mail program, the note is written at
the next reading of the mailbox (`A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO`).
*Check:* `tests/test_mail_replies.py` — after sending, the issue has one comment with the identifier and
date and no address; counter-proof: no draft is offered for that mail again.

**AN ISSUE WAITING FOR A REPORTER IS LABELLED** *(PO A. Maier, 2026-09-29)*
An issue for which a question has been sent to a reporter carries the label `waiting-for-reporter` until
a person removes it.
*Occasion:* "defer issues until a reply is received" — the issue tracker already has labels; deferral
is a state of the issue, readable by everyone working on it, not a note elsewhere.
*Check:* `tests/test_mail_replies.py`

**A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE** *(PO A. Maier, 2026-09-29)*
A mail answering an issue labelled `waiting-for-reporter` is shown under that issue in the mail
dashboard as *answer received*.
*Occasion:* the answer arrives in the mailbox, not in the tracker; showing it at the issue lets the
person decide the next step — remove the label, ask again, close — without searching the mailbox.
*Check:* `tests/test_mail_replies.py`

**A CLOSED ISSUE IS REOPENED ONLY BY A PERSON** *(PO A. Maier, 2026-09-24)*
A closed issue returns to open only by a person's click.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 ("kein Reopen terminaler Tickets"). A
reporter's "thank you" in the thread of a solved issue must not reopen it; the mail is shown, the
person decides.
*Check:* `tests/test_mail_replies.py`

**THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED** *(PO A. Maier, 2026-09-24)*
Each mailbox connection names the processing places to which its mails may be given, and a
participant that processes data elsewhere is never given them.
*Occasion:* PO, 2026-09-24: this "is to be configured; can be ok in the US". Mails carry personal data;
the person who connects the mailbox decides where it may be processed, once, instead of at every
mail.
*Check:* `tests/test_mail_privacy.py` — a mail is not sent to a participant whose processing place is
not listed; counter-proof: it is sent to one whose place is.

**A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT** *(PO A. Maier, 2026-09-24)*
When a processing place outside the European Union is allowed for a mailbox, the dashboard states,
before saving, that processing personal data there does not comply with the EU's rules — the GDPR
for transferring personal data, and the EU AI Act.
*Occasion:* PO, 2026-09-24: US processing "will not comply with EU AI ACT". The person may still choose
it; the choice is then an informed one, and its record says so.
*Check:* `tests/test_settings_disclosure.py`

**NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY** *(PO A. Maier, 2026-09-28)*
No file, commit message, issue, comment or label that Agent M writes contains personal data taken from
a mail.
*Occasion:* PO, 2026-09-28: "nothing in the repository should have personal information from an e-mail
introduced by accident." A repository and its history are copied, forked and kept; personal data that
reached one cannot be taken back. The other rules of this section are the ways this one is kept.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails — issue, backlog item, SPEC
proposal, regression test, job record, reply note —, no write contains any name,
address, phone number or account from those mails; counter-proof: a planted address in a job record is
found.

**A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE** *(PO A. Maier, 2026-09-29)*
Before Agent M writes text drawn from a mail — an issue's text, report data — to an issue tracker or a
repository, it searches the text for every name, mail address, phone number and account found in that
mail, and writes nothing while one is found.
*Occasion:* PO, 2026-09-29: "I don't think, we need to store everyone encountered. It is enough to test
for the persons in the mail at hand." Only a text drawn from a mail can carry its people; every other
write is kept free of mail data by construction — jobs that write never receive a mail (`A PARTICIPANT
THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`), a reply note holds an identifier and a date. A check
against the people of the mail at hand is deterministic, fast, and needs no list kept anywhere
(`SOFTWARE_MAINTENANCE.md` §4.0a rule 3).
*Check:* `tests/test_mail_privacy.py` — an issue text containing the sender's name, or a name from the
mail's signature, is refused and the hit named; counter-proof: the same text without the name passes.

**A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL** *(PO A. Maier, 2026-09-28)*
A job that writes to a repository is given the neutral issue and the report data rewritten without
persons, never the text or attachments of a mail.
*Occasion:* only the participant that proposes an issue (UC-038) or drafts a reply (UC-039) reads mails,
and neither writes anywhere — a person decides. A coding agent that fixes the bug never needs to know
who reported it.
*Check:* `tests/test_mail_privacy.py` — the inputs of an implementation job started from a mail's issue
contain no text of the mail.

**REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX** *(PO A. Maier, 2026-09-29 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons instead of having its personal data replaced by
surrogates. Replaced by `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` and `A REWRITTEN TEXT
IS CHECKED BY THREE LLMS`. The name is not reused.

**REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS** *(PO A. Maier, 2026-09-30)*
Attachments, logs, error messages, screenshots' text and data files from a mail go into an issue or a
repository only as a participant's rewriting that mentions no person and keeps their technical content.
*Occasion:* PO, 2026-09-30, on the architecture's pseudonymiser: "I would instruct to rephrase without
mentioning persons. We simply don't want person names be part of issues." — logs and attachments
included. A surrogate is a second name for a person; a rewriting leaves the person out — "the user's home
folder" instead of a path with a user name. The group's own study of text pseudonymisation found that
"Surrogates are not a privacy control" (`github.com/akmaier/pseudonymization`, README, read 2026-09-30). Whether the technical content survives
the rewriting depends on a model, so it is measured, not assumed (`SOFTWARE_MAINTENANCE.md` §4.0a rule 4).
*Check:* `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP
address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof:
a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and
version is measured as a rate on a fixed set of reports, reported, not gated.

**A REWRITTEN TEXT IS CHECKED BY THREE LLMS** *(PO A. Maier, 2026-09-30)*
A text that a participant rewrites from a mail is written only after three LLM participants with three
different models, at places the mailbox allows, have each checked it for any mention of a person and none
of them has found one.
*Occasion:* PO, 2026-09-30: "I would use three LLMs for this" — one participant rewrites, three check, and a
finding of any one of them is enough. In the group's study an ensemble of detectors caught more than any
single one (`github.com/akmaier/pseudonymization`, README, read 2026-09-30). A finding goes back to the rewriting participant like any other
(`A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`), within the round limit. The checkers read a
text that may still hold a person, so they are held to the mailbox's places (`THE PLACES A MAILBOX'S MAIL
MAY GO ARE CONFIGURED`). The search for the mail's own people (`A TEXT FROM A MAIL IS SEARCHED FOR THAT
MAIL'S PEOPLE`) runs as well and needs no model.
*Check:* `tests/test_mail_privacy.py` — with three fixture checkers of which one reports a name, nothing is
written and the finding goes back; counter-proof: when none reports one, the text is written. How often a
person passes all three is measured as a rate on a fixed set of mails, reported, not gated.

**A SURROGATE IS THE SAME WITHIN A REPORT** *(PO A. Maier, 2026-09-28 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons; there are no surrogates (`REPORT DATA LEAVES THE
MAILBOX ONLY REWRITTEN WITHOUT PERSONS`). The name is not reused.

**THE SURROGATE MAPPING IS NEVER STORED** *(PO A. Maier, 2026-09-29 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons; there are no surrogates and no mapping (`REPORT DATA
LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`). The name is not reused.

**PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF** *(PO A. Maier, 2026-09-28, changed 2026-09-30)*
Rewriting report data without persons applies to every product whose settings do not switch it off.
*Occasion:* PO, 2026-09-28: "These requirements are very important in the EU; for the US it might not
matter as much; I would enable the anonymization layer by default but have an option to disable the
feature." The setting belongs to the product, in its own repository, where everyone working on it can
see which rule applies. PO, 2026-09-30: the switch stays, for products on a protected data space; what it
switches is the rewriting (`REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`).
*Check:* `tests/test_mail_privacy.py` — a product without the setting gets rewritten report data;
counter-proof: a product that switched it off gets the original data.

**SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS** *(PO A. Maier, 2026-09-28)*
Before a product's pseudonymisation is switched off, the dashboard states that report data will then
enter the product's issues and repository unchanged, that this is advisable only on a protected,
non-public data space, and — for a repository its server reports as public — that the data will be
published.
*Occasion:* PO, 2026-09-28: surrogates are needed "unless the repository is on a protected non-public
data space". Switching off is the person's decision; the notice makes it an informed one, as for mail
processed outside the EU (`A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT`). Switching off
pseudonymisation does not switch off `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY` for issue texts,
which stay neutral.
*Check:* `tests/test_settings_disclosure.py`

**A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT** *(PO A. Maier, 2026-09-28)*
A repository managed by Agent M names a person only by their account on its server, or by name if the
person is listed as consenting in the repository's `docs/collaborators.md`.
*Occasion:* PO, 2026-09-28: "What can be in the repo are git(hub) usernames and names of collaborators
(if they agreed; i.e. like co-authors on a paper for example)." Commits already carry accounts; a name
beyond that is a decision of its bearer, written down where it can be checked.
*Check:* `tests/test_collaborators.py` — a name in a generated artifact that is neither an account nor
in `docs/collaborators.md` is reported; counter-proof: a listed collaborator's name passes.
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

**A RESOURCE IS PINNED TO AN EXACT STATE** *(PO A. Maier, 2026-09-24, narrowed 2026-09-30)*
A resource of kind `repository`, `data`, `model`, `endpoint` or `agent` records the exact state the
product uses — a commit for a repository, a revision or the SHA-256 of every file for data or a model,
the identifier of the served model for an endpoint or an agent.
*Occasion:* reuse "buys dependencies", and their maintainers change them (ch. 6 §5). "Which model
did the tests run against?" needs an answer months later — the same reasoning as `A SOURCE VERSION
IS FIXED BY IDENTIFIER AND HASH`, applied to what the product uses. PO, 2026-09-30: a `compute`
resource has no version of its own; what it contributes to a result is the software environment on it,
which `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES` places with the job.
*Check:* `tests/test_resources.py` — a `model` entry without revision or hash fails; counter-proof:
the same entry with a 40-hex revision passes, and a `compute` entry without a pin passes.

**A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES** *(PO A. Maier, 2026-09-30)*
The software environment a job uses on a `compute` resource — a container image by its digest, or the
loaded modules with their versions — is fixed in the product's versioned job files, not in its resource
entry.
*Occasion:* PO, 2026-09-30, on UC-040 (queue 2026-09-24g, entry 10, open question 4): hardware has no
version, the environment on it does. It belongs to the code that uses it — the job script, the CI
configuration, the container definition —, where it changes by commit together with that code; a second
pin in `docs/resources.md` would drift away from it.
*Check:* no automatic check; at review.

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
Every resource of kind `repository`, `data`, `model` or `agent` records who maintains it — by account,
by organisation, or by the name of a consenting collaborator — or states that this is unknown.
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