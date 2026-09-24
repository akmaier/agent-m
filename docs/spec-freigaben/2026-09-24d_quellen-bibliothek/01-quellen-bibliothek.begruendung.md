# A library in the instance, links in the product, versions that can be proven

**Three places, three jobs:**
- **The register** (instance, `docs/sources/`) says which sources exist: one file per source, with
  kind, authority, licence, versions.
- **The content** lives where its licence allows: in the instance repository if it may be
  republished (EU law, openly licensed guides), otherwise in the repository the person names —
  a private company repository, a GitLab project, a public repository of someone else.
- **The link** (product, `docs/sources.md`) says which of them apply to *this* product, in which
  version, and which part: IEC 62304 *class B*, the AI Act *provisions for high-risk systems*.

**Why the licence became a field.** Without it, Agent M cannot decide where content may go. A paid
norm committed to a public fork is published, and the git history keeps it after deletion. The
rule `RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE` is the one I would least like to learn by
accident.

**"Which version was actually used"** has two answers, and both are recorded: the *identifier*
(what was meant — `IEC 62304:2006+AMD1:2015`, CELEX `32024R1689` in the consolidated version of a
date) and the *hash* (which bytes were read). A person can mistype an edition; a hash cannot be
mistyped. New editions are added, never written over, so a product stays on its version until it
is deliberately moved — and moving it will show which requirements came from the old one (UC-016).

**Why a workflow for EU law.** Measured, not assumed: the browser gets an empty page from EUR-Lex
and no permission from Cellar. The instance's workflow fetches server-side and records Cellar's
versioned address. Norms cannot be fetched at all — they are bought — so for them the person
uploads their licensed copy into a repository they control, and the register records designation
and hash.
