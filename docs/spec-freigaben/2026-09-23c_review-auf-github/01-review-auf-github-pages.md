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

## 10. Review on GitHub Pages

**THE PAGES ROOT IS DOCS** *(PO A. Maier, 2026-09-23)*
The GitHub Pages site of Agent M and of every product it manages is served from the `docs/`
folder of the default branch.
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

**ACCEPTANCE IS A COMMIT IN GITHUB** *(PO A. Maier, 2026-09-23)*
A use case or a SPEC change is accepted by a commit that a person makes in GitHub's web interface
and that adds an approval record to `docs/approvals/`.
*Occasion:* git already records who decided, when, and on which text. The act of approval should
be that record rather than a button in a tool that then writes one.
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

**THE REVIEW DASHBOARD HOLDS NO CREDENTIAL** *(PO A. Maier, 2026-09-23)*
The review dashboard reads through public GitHub endpoints and writes nothing.
*Occasion:* every write then happens in GitHub under the reviewer's own account and permissions. A
reviewer without write access produces a pull request, and the approval only counts once a
maintainer merges it.
*Check:* `tests/review-core.test.mjs` — the dashboard code issues no request other than `GET`.

**EDITS ARE PREPARED ON THE DASHBOARD** *(PO A. Maier, 2026-09-23)*
The dashboard offers an editor with a live preview for a reviewed file, and the edited text is
committed through GitHub's web editor.
*Occasion:* reviewing and correcting belong on one screen. The commit belongs to the person, for
the same reason acceptance does.
*Check:* no automatic check; at review.

**NO TEXT TRAVELS IN A URL** *(PO A. Maier, 2026-09-23)*
A link that prepares a commit in GitHub carries at most a file path and an approval record, never
the reviewed text.
*Occasion:* measured 2026-09-23: a link prefilled with 6 KB of text sent a logged-out reviewer
through GitHub's login redirect, which answered HTTP 500.
*Check:* `tests/review-core.test.mjs`

**AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW** *(PO A. Maier, 2026-09-23)*
Once an approval record for a SPEC change is committed, a GitHub Actions workflow replaces the
anchored SPEC section with the approved proposal text byte for byte.
*Occasion:* the reviewer approves a proposal file; copying it into the SPEC by hand would reopen
the question of whether the approved text arrived verbatim.
*Check:* `tests/test_apply_approvals.py`

**A STALE APPROVAL IS NOT APPLIED** *(PO A. Maier, 2026-09-23)*
The workflow writes nothing when the proposal or the current SPEC section differs from the blob
SHAs named in the approval record.
*Occasion:* the reviewer decided on one proposal beside one current text. If either changed after
the decision, the decision does not cover the new state.
*Check:* `tests/test_apply_approvals.py`
