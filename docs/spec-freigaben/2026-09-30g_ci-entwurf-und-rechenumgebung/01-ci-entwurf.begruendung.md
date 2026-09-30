# §10: a prompted change drafted by a CI agent enters as open

**The question (queue 2026-09-24g, entry 05, open question 6).** In UC-019 the author writes one sentence
and a participant drafts the change; in the main flow the draft comes back to the dashboard's editor, the
author sees it as a difference against the current text and presses *Save*. A CI agent runs in GitHub
Actions or GitLab CI and reaches the repository only by commit (UC-010, step 4), so its draft lands on the
default branch without the author having seen the difference first. `A DRAFTED CHANGE IS SHOWN AGAINST THE
CURRENT TEXT` required the difference "before the person can save it" — a route on which the person never
saves was not covered by it.

**PO decision, 2026-09-30: option (b)** — the CI agent's draft is committed as open and reviewed on the
dashboard. The alternatives were (a) the draft returns to the editor through the job record or a branch,
and (c) no prompted changes through CI at all.

**What this entry does:**
- `A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT` is **narrowed** to drafts that return to the
  dashboard (model endpoints, agents behind the bridge); its check is unchanged.
- **New:** `A CI AGENT'S DRAFT ENTERS AS OPEN` — the CI route writes only an open use case or a queue entry,
  never the SPEC and never accepted text. The difference is read at review: UC-008 already shows a changed
  use case against its last accepted text (`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`, accepted
  2026-09-30), UC-006 shows a proposal beside the current section.

**Unchanged by this:** the correction loop still runs before anything is written (it runs in the workflow,
from the same definition — `ONE DEFINITION, THREE DRIVERS`); a conflict with an existing requirement is
still decided by a person, now at UC-006 rather than in the editor.

**The rest of §10 after the anchor** is carried over byte for byte, because the entry must end at a heading
(`## 11.`); the difference on the dashboard shows that only the two rules change.

**Impact list** (every file naming `A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT`, searched in
`docs/`, `tests/`, `tools/` and `SPEC.md`): `SPEC.md`, UC-019. UC-019 alternative flow 6b and its
postcondition are updated in the same commit as this queue, and open for review on the dashboard. The check
file `tests/test_prompted_change_context.py` does not exist yet; it follows with the implementation.

**Format corrected after acceptance (PO, 2026-09-30).** This entry was first anchored on the rule's bold
first line, `**A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT** *(PO A. Maier, 2026-09-24)*`, up to
`## 11.` — unlike every other entry, which begins at a heading, as the index column says. At the PO's request
it now has the usual form: anchor `## 10. Review on GitHub Pages`, the whole §10 as it stands. No word of the
SPEC changed: the accepted text is contained unchanged in the new proposal, and the SPEC is as the PO
accepted it on 2026-09-30 at 17:50 UTC. The first form stays in the git history
(`git show fe95907:docs/spec-freigaben/2026-09-30g_ci-entwurf-und-rechenumgebung/01-ci-entwurf.md`).
