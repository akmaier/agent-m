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
