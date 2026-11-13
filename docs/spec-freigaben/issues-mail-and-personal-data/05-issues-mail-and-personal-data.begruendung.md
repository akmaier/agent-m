# 14. Issues, mail and personal data: a hit the person marks as naming no one does not hold the text back

**The change.**
- `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`, changed: Agent M writes nothing while a hit is found *that the
  person has not marked as naming no one*; its check gains the counter-proof that a marked hit passes.

Every other byte of the section is carried over from `SPEC.md` as it stands.

**Why.** akmaier, 2026-11-13: an issue could not be created from the mail "Fw: Hi papa". The mail went to the support
mailbox's alias `ai-test-support@fau.de`, whose display name "AI Test Support" stands in the mail's To header. The search
took it as a person of the mail, searched each of its words, and found "test" in "SPEC and test suite"; **Create issue**
stayed disabled. The alias appears nowhere in Agent M's settings, so no rule can tell it from a person. Asked for a
fix, akmaier chose "a 'not a person' button next to each hit".

**What follows.** The search still runs on every text and still names every hit; only the person can let a hit pass, one
hit at a time, for the mail it was found in. A name the person wrongly marks reaches the issue: the decision is theirs,
as the decision to create the issue is (`A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK`).

**Impact list.**
- UC-038, alternative flow 6a: the hit carries **Not a person**; changed in the same draft.
- MOD-maintenance-pages (`mail`, the review of a mail) and `tests/test_mail_privacy.py` would follow once this entry is
  accepted.

**Origin.** github.com/akmaier, in a conversation with Claude Code on 2026-11-13.
