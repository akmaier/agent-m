## 1. Identity and traceability

**EVERY ARTIFACT HAS AN IDENTIFIER** *(PO A. Maier)*
Every artifact Agent M produces carries an identifier: a requirement its name, every other artifact
one from the scheme `SRC-` · `UC-` · `ARC-` · `MOD-` · `TST-` · `ITM-` · `RES-` · `JOB-`.
*Check:* `tests/test_identifiers.py`

**THE NAME IS THE ID AND IT SURVIVES** *(PO A. Maier)*
An identifier travels with its artifact when the artifact moves between sections or files, and a
withdrawn identifier is never reused.
*Check:* `tests/test_identifier_stability.py` — an identifier that the version history holds and the current
files do not is never given to another artifact.

**A DOCUMENT HOLDS NO HISTORY** *(PO A. Maier)*
The specification, use cases, architecture decisions, backlog items and settings files state only what holds now;
earlier versions, withdrawn entries, and who changed what when are kept only in the version history.
*Check:* `tests/test_no_history.py` — none of these files carries a withdrawal note, an edit stamp or the date of a
change; records and dated measurements are not among them.

**EVERY ARTIFACT NAMES ITS ORIGIN** *(PO A. Maier)*
Each artifact names the identifiers of the artifacts it descends from: a requirement names its source, a use
case names the requirements it realises, an architecture decision names the requirements or use cases that force
it and the modules it designs, and a test names the requirement it guards and the module it exercises.
*Check:* `tests/test_origin_links.py`

**THE TRACEABILITY MATRIX IS DERIVED** *(PO A. Maier)*
The traceability matrix is computed from the artifacts and is never stored as a separately edited
document.
*Check:* `tests/test_matrix_derived.py`

**A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION** *(PO A. Maier)*
A cross-reference names the identifier it points at, never a section number or line number.
*Check:* `tests/test_references.py`

**ARTIFACTS ARE ARRANGED IN NESTED GROUPS** *(PO A. Maier)*
Requirements, use cases, architecture elements, modules and tests can each be arranged in a
hierarchy of named groups of any depth.
*Check:* `tests/test_groups.py`

**A GROUP CARRIES NO IDENTIFIER** *(PO A. Maier)*
A group is named by its title and carries no identifier of the kind `EVERY ARTIFACT HAS AN IDENTIFIER`
gives artifacts.
*Check:* `tests/test_groups.py` — no artifact names a group title where an identifier is expected.

**A GROUP HOLDS ONE KIND OF ARTIFACT** *(PO A. Maier)*
A group contains items and groups of one kind of artifact only.
*Check:* `tests/test_groups.py`

**AN ITEM HAS ONE PLACE IN ITS HIERARCHY** *(PO A. Maier)*
Every item appears exactly once in the hierarchy of its kind, either in one group or at the top
level.
*Check:* `tests/test_groups.py`

**EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN** *(PO A. Maier)*
The groups of each kind of artifact — requirements, use cases, architecture decisions, modules,
tests — are recorded in a file of their own under `docs/groups/` of the product repository, which
names each member by its identifier.
*Check:* `tests/test_groups.py`

**REGROUPING LEAVES THE GROUPED FILE UNCHANGED** *(PO A. Maier)*
Moving a requirement, use case, architecture decision, module or test to another group changes no
byte of the SPEC or of the artifact's file.
*Check:* `tests/test_groups.py` — blob SHAs of `SPEC.md` and of all artifact files are equal before
and after a regrouping.

**AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL** *(PO A. Maier)*
An item that no group names is shown at the top level of its hierarchy.
*Check:* `tests/test_groups.py`

**THE BROWSER SHOWS ANY RELEASED VERSION** *(PO A. Maier)*
The specification browser shows a product's requirements as they stand at any released version or
on the current default branch, as the reader chooses.
*Check:* `tests/test_spec_browser.py`

**A REQUIREMENT SHOWS WHAT TRACES TO IT** *(PO A. Maier)*
For each requirement, the browser lists its sources and every use case, architecture element, module
and test that names it, as derived from the version shown.
*Check:* `tests/test_spec_browser.py`

**OPEN PROPOSALS ARE SHOWN IN THE BROWSER** *(PO A. Maier)*
Every requirement that an open queue entry would add, change or withdraw is shown in the browser
with that entry's status and a link to it.
*Check:* `tests/test_spec_browser.py`

**A REQUIREMENT SHOWS ITS HISTORY** *(PO A. Maier)*
For each requirement, the browser lists every accepted change to its text with date, accepting
person, and the text before and after.
*Check:* `tests/test_spec_browser.py`

**A REGROUPING IS COMMITTED DIRECTLY** *(PO A. Maier)*
A change to a group file is the person's own input and is committed to the default branch when they
save it.
*Check:* `tests/test_groups.py`
