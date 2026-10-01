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

**A PERSON'S OWN INPUT IS COMMITTED DIRECTLY** *(PO A. Maier, 2026-09-24, changed 2026-10-01)*
What a person enters in Agent M themselves — a requirement source, a product, a release — is
committed to the default branch under their own account when they save it.
*Occasion:* the person who typed it has already decided on it; a second review of one's own input
adds a click and no control.
*Check:* `tests/dashboard-app.test.mjs`

**A DECISION OF AN AGENT IN ITS ROLE IS COMMITTED DIRECTLY** *(PO A. Maier, 2026-10-01)*
What an agent decides in a role that the product's model lets an agent hold — the backlog, a sprint's
selection or its end, a gate's decision — is committed to the product repository under the agent's name as
that role's decision, not as a proposal.
*Occasion:* PO, 2026-10-01: the agent `po-fable` holds the Product Owner role of Agent M (`docs/process.md`).
Held as proposals (`A GENERATED ARTIFACT IS A PROPOSAL`), its decisions would wait for a person, and the role
would be that person's after all; a person in the same role commits directly (`A PERSON'S OWN INPUT IS
COMMITTED DIRECTLY`), and an agent already decides a gate (`A GATE NAMES WHO DECIDES IT`). A role decides
only what its rules leave to it: a SPEC change (`A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`),
the acceptance of a use case, decision or module (`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`), the
release test report (`THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON`), a mail (`EVERY OUTGOING MAIL IS
RELEASED BY A PERSON`) and a change to the process (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`)
stay with persons, and an agent's decision on its own work passes no gate (`A GATE IS NOT DECIDED BY THE
PARTICIPANT WHOSE WORK IT CHECKS`).
*Check:* `tests/test_job_assignment.py` — a backlog order written by an agent holding the role that orders
the backlog is committed and listed as no open item; counter-proof: the same order from an agent that holds
no such role is refused.

**ADDING A PRODUCT CREATES ITS LAYOUT** *(PO A. Maier, 2026-09-24, changed 2026-09-24, changed 2026-10-01)*
When a person adds a product, Agent M writes the missing review layout into the product's default
branch without a pull request.
*Occasion:* PO, 2026-09-24: two merges in one setup "is a bit much. Both need to be automated."
The layout is empty folders and a SPEC skeleton; there is nothing in it to review. The product is
not written into the instance repository (`NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY`).
*Check:* `tests/dashboard-app.test.mjs`

**A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT** *(PO A. Maier, 2026-09-30)*
When a draft returned by a participant fails one of Agent M's checks, Agent M sends the draft and its
findings back to that participant and asks for a corrected draft before the person sees it.
*Occasion:* PO, 2026-09-30, on UC-019: Agent M "should report problems … back to the drafting participant
and ask it to fix the problems … So Step 7 should work like a harness until it is completed
successfully." A person should read drafts, not mechanical errors a check already found; the book's agent
loop — reason, act, observe (ch. 11 §2) — with Agent M's checks as the observation.
*Check:* `tests/test_correction_loop.py` — a fixture participant that first returns an unknown name under
`realises` and then a corrected draft is asked once more and the person sees only the corrected draft;
counter-proof: with the loop switched off, the person sees the error.

**A FINDING READS LIKE A COMPILER MESSAGE** *(PO A. Maier, 2026-09-30)*
Every finding sent back names the artifact and line it concerns, its kind (*error* or *warning*), the
rule it violates by name, and the correction expected, in one fixed text form.
*Occasion:* PO, 2026-09-30: "including giving a template text like a compiler on what the problem is that
it detected". For example: `UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE
REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.` The template lives once in the
repository's single definition (`ONE DEFINITION, THREE DRIVERS`).
*Check:* `tests/test_correction_loop.py` — every finding of the fixture run matches the template.

**AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED** *(PO A. Maier, 2026-09-30)*
A draft leaves the loop only when it has no error and every warning is either fixed or answered with a
one-line justification.
*Occasion:* errors are decided without a model — an unknown name, a changed identifier, a missing field,
an unreadable answer — and have one right outcome. A warning is a suspicion, such as an "and" in a rule
(`ONE STATEMENT PER REQUIREMENT`): demanding a fix for a false alarm would never end, so the participant may
keep the text with a reason, which the person reads.
*Check:* `tests/test_correction_loop.py` — a justified warning ends the loop; an unfixed error does not.

**WHAT A PERSON DECIDES IS NOT SENT BACK** *(PO A. Maier, 2026-09-30)*
A conflict with an existing requirement, and every other finding the SPEC leaves to a person, is shown to
the person and never sent back to the participant.
*Occasion:* `A CONFLICT IS DECIDED BY A PERSON`: a loop that let the participant resolve it would take the
decision away from the person, one round at a time.
*Check:* `tests/test_correction_loop.py` — a conflict finding appears in no message to the participant.

**THE CORRECTION LOOP HAS A FIXED LIMIT** *(PO A. Maier, 2026-09-30)*
The loop ends after a number of rounds fixed before the first round, or earlier when a round leaves the
findings unchanged; a draft that still has findings is then shown to the person with them.
*Occasion:* every round is another model call and costs time and money; a participant that cannot fix a
finding would otherwise loop for ever. The same form as the process repository's repair rounds for
unreadable model output (`SOFTWARE_MAINTENANCE.md` §4.0, point 11, addendum of 2026-09-01). The run panel
states the limit before the person presses *Run*.
*Check:* `tests/test_correction_loop.py` — a participant that never fixes its error is asked exactly
*limit* times, or once more than a round without change, and the person sees the remaining finding.

**THE ROUNDS ARE COUNTED AND SHOWN** *(PO A. Maier, 2026-09-30)*
The number of correction rounds a draft needed, and the findings of each round, are shown with the draft
and recorded with it.
*Occasion:* counted, the rounds say how well a participant fits a task — a measure across runs, not a verdict
on one (`SOFTWARE_MAINTENANCE.md` §4.0a rule 4); hidden, a loop would make a weak participant look as good
as a strong one.
*Check:* `tests/test_correction_loop.py`
