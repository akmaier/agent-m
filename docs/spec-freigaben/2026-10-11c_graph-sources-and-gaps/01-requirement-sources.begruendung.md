# 2. Requirement sources: the person who prompts is a source

**The change.** A new requirement, `THE PERSON WHO PROMPTS IS A SOURCE`, follows `A REQUIREMENT HAS A REGISTERED SOURCE`.
The rest of the section is carried over byte for byte.

**Why.** A change of requirements by prompt (UC-019, UC-012) drafts requirements from a person's instruction, not from a
source document, and nothing said which source they name. Asked where a prompted requirement change gets its source, the
PO answered, 2026-10-11: "The user is the source." `A REQUIREMENT HAS A REGISTERED SOURCE` asks for a linked source, but
not for this one; `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES` names the derivation rules a change by
prompt follows, none of them on the source. So no requirement gives it yet. It stands as a rule of its own, rather than
as a sentence added to either, since each of them already states one thing.

**Registered with it.** The PO is registered as the source `SRC-po-a-maier` — kind `person`, authority `normative`,
title "PO A. Maier", identifier `github.com/akmaier` —, its content being the decision records
`docs/spec-freigaben/*/entscheidungen.md` at commit `8fc690f4`, each with its SHA-256, hashed only, since they stand in
this repository. `docs/sources.md` links it, and `docs/collaborators.md` records the PO's consent to be named. With the
link, every requirement that names "PO A. Maier" names a linked source (`A REQUIREMENT HAS A REGISTERED SOURCE`); before
it, 357 did not.

**Against the rest of §2.** The source has an identifier, a kind of the closed set, an authority and a licence; it is one
file of the register; the product links one version of it with that version's hash; its content is a set of Markdown
files whose SHA-256 the version records. Two requirements do not fit it as they stand, and are left as they are:

- `A LIVING SOURCE IS PINNED` asks that a requirement derived from a source maintained elsewhere name the state that was
  read. The requirements name "PO A. Maier" with no version. The decision records are kept in this repository, not
  elsewhere, so whether the requirement applies to this source is open.
- Every accepted queue adds a decision record. The linked version holds the records up to its commit, so a requirement
  accepted later names a source whose linked version does not hold its decision, until a new version is added beside it
  (`A SOURCE VERSION IS NEVER OVERWRITTEN`) and linked.

**Impact list.** No existing name changes. After acceptance: UC-019 realises the requirement (step 6, alternative flow
4b); MOD-job-catalogue's `change-requirements` takes the person's own source as its parameter `source`;
MOD-source-register's `personSource` finds that source by the person's account; MOD-spec-changes' `entrySections` names
the job's source in every requirement it composes; MOD-review-pages sends nothing for a person without a source of their
own that the product links.
