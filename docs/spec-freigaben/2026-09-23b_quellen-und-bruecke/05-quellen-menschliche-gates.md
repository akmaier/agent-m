## 9. Human gates

**A GENERATED ARTIFACT IS A PROPOSAL** *(PO A. Maier, 2026-09-23)*
Everything Agent M generates enters the product repository as a proposal — a branch, a pull
request, or a queued entry — never as a direct write to the default branch.
*Occasion:* generation is cheap and review is not, so the volume of candidate changes grows faster
than the capacity to check them. A tool that writes straight to the default branch converts that
imbalance into accumulated unreviewed state.
*Check:* `tests/test_no_direct_write.py`

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
A GitHub issue that changes behaviour becomes a specification change first and a code change
second.
*Occasion:* this is the whole argument of the book's evolution chapter made mechanical. A code
change that precedes its requirement leaves the specification describing a product that no longer
exists, and the next reader believes the specification.
*Check:* `tests/test_issue_to_spec.py`

**THE GATE IS RECORDED** *(PO A. Maier, 2026-09-23)*
Every passed gate records who decided, when, and on which text.
*Occasion:* an unrecorded approval is indistinguishable from no approval three months later, and
it is precisely the evidence a regulated profile (§5) has to produce.
*Check:* `tests/test_gate_record.py`

**THE REPLACED TEXT STAYS REACHABLE** *(PO A. Maier, 2026-09-23; after "DER ERSETZTE TEXT BLEIBT
AUFFINDBAR")*
A replaced specification section remains reachable through the git history; no second copy is kept
in the working tree.
*Occasion:* a shortening is safe only if the removed part can still be moved where it belongs. A
duplicate folder did that a second time and drifted away from the history.
*Check:* `tests/test_replaced_in_history.py`
