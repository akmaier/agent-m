# 14. Issues, mail and personal data: the person checks what a mail becomes, no model does

**The change.**
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS` is withdrawn.
- `NO CHECKER IS THE REWRITER` is withdrawn.

Every other byte of the section is carried over.

**Why.** akmaier on 2026-11-09, on the mail page's *Propose*: "For the issues, the checker is the user. not a model.
That's a wrong read of the spec", and then: "No, the user checks everything." The person reads the proposal and any
rewritten report data, edits them and writes the issue with one click; the search for the mail's people without a model
stays. Three model checkers are therefore not needed, and without them the rule on who may check is void.

**Impact list.**
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`, withdrawn: named by UC-038, ARC-044, ARC-046, MOD-personal-data,
  `src/personal-data` (`checkersFor`), `src/maintenance-pages/mail.mjs`, `tests/test_mail_privacy.py`,
  `tests/maintenance-pages-propose.test.mjs`, `tests/personal-data-checkers-and-consent.test.mjs` and
  `tests/system-uc-038-turn-mails-into-issues.test.mjs`.
- `NO CHECKER IS THE REWRITER`, withdrawn: named by ARC-044, ARC-046, MOD-participant-list and MOD-personal-data.

**Origin.** github.com/akmaier, in a conversation with Claude Code on 2026-11-09.
