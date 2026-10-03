## 2. Requirement sources

**THE SOURCE MODEL IS GENERIC** *(PO A. Maier)*
A requirement source is a typed record with an identifier, a kind, and an authority; no particular
organisation, standard or system is built into Agent M.
*Check:* `tests/test_source_model.py` — no source identifier appears in Agent M's own code.

**A REQUIREMENT HAS A REGISTERED SOURCE** *(PO A. Maier)*
Every requirement names at least one source linked to its product; a requirement without one cannot
be accepted.
*Check:* `tests/test_requirement_has_source.py`

**A SOURCE DECLARES ITS AUTHORITY** *(PO A. Maier)*
A source declares whether it is `normative`, `advisory` or `informational`; the declaration is
made at the source, not inferred from how often it is cited.
*Check:* `tests/test_source_authority.py`

**A LIVING SOURCE IS PINNED** *(PO A. Maier)*
A source that is maintained elsewhere records the exact state that was read — a commit, a version,
or a retrieval date — and a requirement derived from it names that state.
*Check:* `tests/test_source_pinned.py`

**THE SOURCE KIND IS ONE OF A CLOSED SET** *(PO A. Maier)*
A source has exactly one kind from: `organisation`, `person`, `standard`, `regulation`,
`document`, `system`, `measurement`.
*Check:* `tests/test_source_kind.py`

**THE INSTANCE KEEPS THE SOURCE REGISTER** *(PO A. Maier)*
An instance lists every requirement source it knows in `docs/sources/` of its own repository, one
file per source.
*Check:* `tests/test_source_register.py`

**A PRODUCT LINKS THE SOURCES THAT APPLY** *(PO A. Maier)*
A product names the sources that apply to it in `docs/sources.md` of its own repository, each with
the exact version it uses.
*Check:* `tests/test_source_links.py`

**A LINK NAMES THE PART THAT APPLIES** *(PO A. Maier)*
A link may name the part of a source that applies to the product — a safety class, a chapter, a set
of articles.
*Check:* `tests/test_source_links.py`

**A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY** *(PO A. Maier)*
The content of a source is a set of files (PDF, Word, Markdown), a zip archive of such files, or a
repository at a named commit.
*Check:* `tests/test_source_register.py`

**A SOURCE DECLARES ITS LICENCE** *(PO A. Maier)*
Every source records the licence or terms under which its content may be copied.
*Check:* `tests/test_source_register.py`

**RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE** *(PO A. Maier)*
The content of a source is stored in the instance repository only if its licence permits public
redistribution; otherwise it stays in a repository the person names, public or private.
*Check:* `tests/test_source_register.py`

**A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH** *(PO A. Maier)*
Every version of a source records its official identifier or edition, its date, and the SHA-256 of
every file that was read.
*Check:* `tests/test_source_register.py`

**A SOURCE VERSION IS NEVER OVERWRITTEN** *(PO A. Maier)*
A new edition of a source is added as a new version, and existing versions stay unchanged.
*Check:* `tests/test_source_register.py`

**A STANDARD IS REGISTERED BY ITS DESIGNATION** *(PO A. Maier)*
A standard is registered by its full designation, including edition and amendments — for example
`IEC 62304:2006+AMD1:2015`.
*Check:* `tests/test_source_register.py`

**AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY** *(PO A. Maier)*
An EU legal text is registered from its EUR-Lex or ELI address, and a workflow of the instance
fetches it from the EU's publication repository, recording the retrieval date and the repository's
version identifier.
*Check:* `tests/test_fetch_legal_text.py`
