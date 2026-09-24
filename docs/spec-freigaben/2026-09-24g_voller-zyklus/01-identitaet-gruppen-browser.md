## 1. Identity and traceability

**EVERY ARTIFACT HAS AN IDENTIFIER** *(PO A. Maier, 2026-09-23, extended 2026-09-24)*
Every artifact Agent M produces carries an identifier from the scheme `SRC-` · `REQ-` · `UC-` ·
`ARC-` · `MOD-` · `TST-` · `ITM-` · `RES-`.
*Occasion:* an artifact that cannot be named cannot be referred to, and therefore cannot be traced
to what justified it or to what checks it. PO, 2026-09-24: backlog items (`ITM-`) and resources
(`RES-`) are artifacts too — jobs, pull requests and tests refer to them.
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
A group is named by its title and carries no identifier from the scheme `SRC-` · `REQ-` · `UC-` ·
`ARC-` · `MOD-` · `TST-`.
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
*Occasion:* the matrix of UC-009 answers "what is missing?"; a reader deciding whether to change one
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