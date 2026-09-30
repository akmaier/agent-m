**A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT** *(PO A. Maier, 2026-09-24, narrowed 2026-09-30)*
Text that a participant returns to the dashboard from a person's instruction is shown as a difference
against the current text before the person can save it.
*Occasion:* PO, 2026-09-24: specifications and use cases must be modifiable by "a prompt to an LLM or
agent". A model asked to add error handling may also reword three unrelated steps; only the
difference makes that visible. PO, 2026-09-30: a CI agent's draft is written before anyone sees it on
the dashboard; `A CI AGENT'S DRAFT ENTERS AS OPEN` covers that route.
*Check:* `tests/review-core.test.mjs`

**A CI AGENT'S DRAFT ENTERS AS OPEN** *(PO A. Maier, 2026-09-30)*
A change that a CI agent drafts from a person's instruction is committed to the default branch only as
an open use case or as an entry of a SPEC change queue.
*Occasion:* PO, 2026-09-30, on UC-019 (queue 2026-09-24g, entry 05, open question 6): a job in GitHub
Actions or GitLab CI reaches the repository only by commit, so its draft cannot wait in the dashboard's
editor. The person reads the difference at review instead — a use case against its last accepted text
(`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`), a requirement beside the current SPEC
section (`NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`) — and nothing counts before an approval
names it (`A GENERATED ARTIFACT IS A PROPOSAL`).
*Check:* `tests/test_prompted_change_context.py` — a CI-agent fixture's prompted change yields an open
use case or a queue entry and leaves `SPEC.md` byte-identical; counter-proof: neither is shown as
accepted.

**A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES** *(PO A. Maier, 2026-09-24)*
A change to requirements that a participant drafts from a person's instruction is subject to
`DERIVATION SEES THE EXISTING REQUIREMENTS`, `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`,
`A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT` and `EXACT DUPLICATES ARE FOUND WITHOUT A
MODEL`, as a derivation from a source is.
*Occasion:* "split this requirement" produces new requirements just as a derivation does, and can
duplicate an existing one just as easily. The rules exist once; this makes them apply to the second
way in.
*Check:* `tests/test_derivation_context.py` · `tests/test_derivation_classes.py`

**A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS** *(PO A. Maier, 2026-09-24)*
A participant asked to change a use case receives, besides the use case, every requirement it
realises and every other use case of the product.
*Occasion:* a model that sees one use case cannot know that the flow it is asked to add already
exists in another (UC-007 alternative flow 6a), nor which requirements the use case must go on
realising.
*Check:* `tests/test_prompted_change_context.py`

**NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY** *(PO A. Maier, 2026-09-24)*
If a use case, its requirements and the product's other use cases do not fit into the participant's
context, nothing is sent and the dashboard says what does not fit.
*Occasion:* the same failure as for requirements: a context cut to fit produces the duplicate it
was meant to prevent, and looks as if it worked.
*Check:* `tests/test_prompted_change_context.py`

**A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT** *(PO A. Maier, 2026-09-30)*
For a reviewed file that has changed since it was accepted, the dashboard shows the difference between
the text named by the most recent approval record for the same identifier and the current text.
*Occasion:* PO, 2026-09-30: "It would be great to have a diff of the previous accepted and the update to
review them quicker." The approval record already names the accepted text by its blob SHA (`AN APPROVAL
NAMES THE EXACT TEXT`), so git holds it; the reviewer then reads only what changed. Matched by identifier,
not by path, so that a renamed file — UC-010 after 2026-09-30 — still shows what was accepted before.
*Check:* `tests/review-core.test.mjs` — a use case with one changed line shows exactly that line against its
last accepted text; counter-proof: with two approval records, the older text is not the one compared.
