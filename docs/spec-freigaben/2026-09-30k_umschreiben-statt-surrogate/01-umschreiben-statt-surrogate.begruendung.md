# §14: report data is rewritten without persons and checked by three LLMs; surrogates are withdrawn

**What was wrong.** The architecture (ARC-014, MOD-pseudonymiser) had pseudonymisation as a small
deterministic filter that numbers surrogates in order of appearance, so that the same mail always gives the
same surrogates and no mapping needs keeping. The PO pointed to the group's own code, `akmaier/pseudonymization`
(package `pseudonymkit`, MIT): its detection is an ensemble of fifteen detectors — rule-based, classical NER
and LLMs — combined by a rule at a chosen operating point, not deterministic, and written in Python with
PyTorch. Read by the main agent on 2026-09-30: README, ARCHITECTURE, `pyproject.toml` (the 44 000 lines of
source and experiments were not read).

**PO decisions, 2026-09-30:**
- *"I would use three LLMs for this"* — one participant rewrites; three LLMs check, each on its own; one
  finding is enough (chosen over "three rewrite and compare" and "three detect, then one rewrites").
- *"instruct to rephrase without mentioning persons. We simply don't want person names be part of issues."*
  — no surrogates.
- Logs, error messages and attachments are rewritten too, keeping their technical content (chosen over
  "never into issues").
- The switch stays for products on a protected data space (chosen over "always on").

**The changes:**
- **Withdrawn:** `REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX`, `A SURROGATE IS THE SAME WITHIN A
  REPORT`, `THE SURROGATE MAPPING IS NEVER STORED` — each with its note; the names are not reused.
- **New:** `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`, `A REWRITTEN TEXT IS CHECKED BY
  THREE LLMS`.
- **Changed:** `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF` switches the rewriting (the name stays,
  it is the ID); `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL` gives jobs the rewritten
  report data; the counter-proof of `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE` no longer uses a
  surrogate.
- **Unchanged:** `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS` (its notice still says what follows),
  `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`, `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`,
  `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`.

**Consequences to know before accepting.**
- The neutral issue text is itself a rewriting of the mail, so it is checked by the three LLMs as well.
  A product needs three LLM participants at places its mailbox allows; with fewer, the participant's text
  cannot be written, and the author may write the issue by hand — covered by the deterministic search only,
  and without report data (UC-038, 6c).
- `pseudonymkit` is not reused in this design; the checkers are ordinary participants, reached as UC-017
  describes (in the browser, or through the bridge for local models).
- Everything a model decides is measured as a rate (`SOFTWARE_MAINTENANCE.md` §4.0a rule 4); the write is
  gated by the three checks and the deterministic search.

**Impact list** (files naming the changed or withdrawn rules, or surrogates): `SPEC.md`; UC-012 (step 5),
UC-038 (realises, table, step 4, step 6, diagram, 5a, 6b, new 6c), UC-042 (step 4) — updated in the same
commit; architecture ARC-003, ARC-014, MOD-pseudonymiser, MOD-mail-flow, MOD-job-definitions,
MOD-dashboard-app and `docs/groups/modules.md` follow as an architecture change (UC-023) after acceptance.
