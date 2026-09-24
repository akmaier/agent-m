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
