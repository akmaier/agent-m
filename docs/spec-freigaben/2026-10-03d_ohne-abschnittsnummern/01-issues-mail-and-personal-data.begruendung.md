# 14. Issues, mail and personal data: no reference to the process repository's playbook

**The change.** In the check of `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`, the reference "(§4.0a rule 4)" is removed;
every other requirement of the section is carried over byte for byte.

**Why.** "§4.0a rule 4" is a section of `SOFTWARE_MAINTENANCE.md` in the process repository, which Agent M's SPEC no
longer cites; and a reference names an identifier, never a position (`A REFERENCE NAMES THE IDENTIFIER, NOT THE
POSITION`). What the reference pointed to — a model-dependent result measured as a rate — is Agent M's own
`A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`, and the check already says "measured as a rate …, reported, not gated",
as the other checks of the section do.

**Impact list.** `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA` is named by
`docs/use-cases/UC-038-turn-mails-into-issues.md` and `docs/architecture/MOD-pseudonymiser.md`; neither names the removed
reference. Its rule is unchanged.
