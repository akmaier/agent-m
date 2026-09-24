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

**THE MODEL DETERMINES THE STAGES AND THE GATES** *(Vibe Coding, ch. 6–7; reworded 2026-09-24)*
A model definition names its stages, their order, which stages pair for verification, and where the
gates sit; Agent M derives the workflow from that definition together with the product's process
requirements.
*Occasion:* this is the difference between offering process models and merely naming them. The
V-model's contribution is precisely that a decomposition step is paired with the check that will
verify it; if the pairing is not in the data, the model is decoration. Process requirements add to
it (`A PROCESS REQUIREMENT ADDS TO THE MODEL`).
*Check:* `tests/test_workflow_from_model.py`

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
know, and the one thing a list of stages does not say.
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
hold before the next stage opens.
*Occasion:* an unnamed gate is a pause, not a check. The point of a phase gate is that somebody
can say afterwards what was verified at it.
*Check:* `tests/test_gate_definition.py`
## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier, 2026-09-23)*
The prompts, schemas and stage definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Occasion:* three independently maintained copies of one rule were the root cause of an entire
measurement complex in the process repository — each copy knew phrases the others lacked, and
nobody could say which was right. Three runtimes make that failure three times as likely.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A RUNTIME IS INTERCHANGEABLE** *(PO A. Maier, 2026-09-23)*
The same stage, given the same inputs, produces the same kind of artifact in all three runtimes.
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

**THE LOCAL BRIDGE REQUIRES A TOKEN** *(PO A. Maier, 2026-09-23)*
The bridge rejects any request that does not carry the session token it printed at startup.
*Occasion:* loopback is not a permission boundary between programs on the same machine. Any local
process, including a page from an unrelated site, can reach a loopback port.
*Check:* `tests/test_bridge_token.py`

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

**A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN** *(PO A. Maier, 2026-09-23)*
A use case or a SPEC change proposal may be written directly to the default branch, where it counts
as open until an approval record names its text.
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

**ADDING A PRODUCT CREATES ITS LAYOUT** *(PO A. Maier, 2026-09-24)*
When a person adds a product, Agent M writes the missing review layout into the product's default
branch and the product's entry into the instance's `docs/products.md`, without a pull request.
*Occasion:* PO, 2026-09-24: two merges in one setup "is a bit much. Both need to be automated."
The layout is empty folders and a SPEC skeleton; there is nothing in it to review.
*Check:* `tests/review-core.test.mjs`
## 10. Review on GitHub Pages

**THE PAGES ROOT IS DOCS** *(PO A. Maier, 2026-09-23, products removed 2026-09-23)*
The GitHub Pages site of an Agent M instance is served from the `docs/` folder of its default
branch.
*Occasion:* one known place for everything a reviewer reads. Code, tooling and the SPEC's approval
machinery stay outside the published tree.
*Check:* `tests/test_pages_layout.py`

**ONE REVIEW LAYOUT FOR EVERY PRODUCT** *(PO A. Maier, 2026-09-23)*
Agent M and every managed product use the same layout below `docs/`: use cases in
`docs/use-cases/`, SPEC change queues in `docs/spec-freigaben/`, approval records in
`docs/approvals/`.
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

**ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON** *(PO A. Maier, 2026-09-24)*
A use case or a SPEC change is accepted by a commit, made under the accepting person's own account on
the server that hosts the repository, that adds an approval record to `docs/approvals/`.
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

**THE INSTANCE LISTS ITS PRODUCTS IN A FILE** *(PO A. Maier, 2026-09-23)*
An instance names the product repositories it manages in `docs/products.md` of its own repository.
*Occasion:* the list is then the same in every browser, changes by commit like everything else, and
a reviewer sees which products an instance manages without any settings.
*Check:* `tests/test_products_register.py`

**ONE CLICK PER DECISION** *(PO A. Maier, 2026-09-24)*
A decision a person makes on the dashboard — accept, save, add a product, release — takes one click
once its inputs are complete, and everything that follows from it is done by Agent M.
*Occasion:* PO, 2026-09-24: "Too much clicking kills our user experience." Each extra step between
a decision and its effect is a place to get lost.
*Check:* no automatic check; at review of each use case.

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