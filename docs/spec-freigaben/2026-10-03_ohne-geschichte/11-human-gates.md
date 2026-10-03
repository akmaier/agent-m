## 9. Human gates

**A GENERATED ARTIFACT IS A PROPOSAL** *(PO A. Maier)*
Everything Agent M generates counts as a proposal until a person accepts it.
*Check:* `tests/review-core.test.mjs` — a file without an approval record naming its current text
is shown as open.

**A RECORD IS EVIDENCE, NOT A PROPOSAL** *(PO A. Maier)*
Approval records, gate records, job records and test result records are written once as evidence of
what happened and are never shown for acceptance.
*Check:* `tests/review-core.test.mjs` — a job record without approval is not listed as open;
counter-proof: a use case without approval is.

**A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN** *(PO A. Maier)*
A use case, an architecture decision or a SPEC change proposal may be written directly to the default branch,
where it counts as open until an approval record names its text.
*Check:* `tests/review-core.test.mjs`

**CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI** *(PO A. Maier)*
A change to code, tests, workflows or the dashboard reaches the default branch only through a pull
request whose CI run is green.
*Check:* no automatic check; at review. The repository's branch protection can enforce it.

**A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN** *(PO A. Maier)*
A change to a product's specification is shown beside the text it would replace and is written
only after a person accepts it.
*Check:* `tests/test_spec_gate.py`

**THE APPROVED TEXT IS TAKEN VERBATIM** *(PO A. Maier)*
What stands in the approval field is exactly what is written to the specification; nothing
reformulates it afterwards.
*Check:* `tests/test_verbatim.py`

**NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT** *(PO A. Maier)*
A change is presented together with the specification text that currently holds, not as a summary
of it.
*Check:* `tests/test_proposal_shows_current.py`

**EVOLUTION ENTERS THROUGH THE SPECIFICATION** *(PO A. Maier)*
An issue that changes behaviour — on GitHub or on the product's GitLab server — becomes a
specification change first and a code change second.
*Check:* `tests/test_issue_to_spec.py`

**THE GATE IS RECORDED** *(PO A. Maier)*
Every passed gate records who decided, when, and on which text.
*Check:* `tests/test_gate_record.py`

**THE REPLACED TEXT STAYS REACHABLE** *(PO A. Maier)*
A replaced specification section remains reachable through the git history; no second copy is kept
in the working tree.
*Check:* `tests/test_replaced_in_history.py`

**A PERSON'S OWN INPUT IS COMMITTED DIRECTLY** *(PO A. Maier)*
What a person enters in Agent M themselves — a requirement source, a product, a release — is
committed to the default branch under their own account when they save it.
*Check:* `tests/review-core.test.mjs`

**ADDING A PRODUCT CREATES ITS LAYOUT** *(PO A. Maier)*
When a person adds a product, Agent M writes the missing review layout into the product's default
branch without a pull request.
*Check:* `tests/review-core.test.mjs`

**A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT** *(PO A. Maier)*
When a draft returned by a participant fails one of Agent M's checks, Agent M sends the draft and its
findings back to that participant and asks for a corrected draft before the person sees it.
*Check:* `tests/test_correction_loop.py` — a fixture participant that first returns an unknown name under
`realises` and then a corrected draft is asked once more and the person sees only the corrected draft;
counter-proof: with the loop switched off, the person sees the error.

**A FINDING READS LIKE A COMPILER MESSAGE** *(PO A. Maier)*
Every finding sent back names the artifact and line it concerns, its kind (*error* or *warning*), the
rule it violates by name, and the correction expected, in one fixed text form.
*Check:* `tests/test_correction_loop.py` — every finding of the fixture run matches the template.

**AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED** *(PO A. Maier)*
A draft leaves the loop only when it has no error and every warning is either fixed or answered with a
one-line justification.
*Check:* `tests/test_correction_loop.py` — a justified warning ends the loop; an unfixed error does not.

**WHAT A PERSON DECIDES IS NOT SENT BACK** *(PO A. Maier)*
A conflict with an existing requirement, and every other finding the SPEC leaves to a person, is shown to
the person and never sent back to the participant.
*Check:* `tests/test_correction_loop.py` — a conflict finding appears in no message to the participant.

**THE CORRECTION LOOP HAS A FIXED LIMIT** *(PO A. Maier)*
The loop ends after a number of rounds fixed before the first round, or earlier when a round leaves the
findings unchanged; a draft that still has findings is then shown to the person with them.
*Check:* `tests/test_correction_loop.py` — a participant that never fixes its error is asked exactly
*limit* times, or once more than a round without change, and the person sees the remaining finding.

**THE ROUNDS ARE COUNTED AND SHOWN** *(PO A. Maier)*
The number of correction rounds a draft needed, and the findings of each round, are shown with the draft
and recorded with it.
*Check:* `tests/test_correction_loop.py`
