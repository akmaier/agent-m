# 14. Issues, mail and personal data: a reply that a model drafts says that it was drafted by AI

**The change.**
- `A REPLY DRAFTED BY A MODEL SAYS SO`, new, after `A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER`: a reply that a
  language model drafts for a listed mail is stored as a draft whose text states that it was drafted by AI.

Every other byte of the section, as it stands with entry 03 accepted, is carried over.

**Why.** akmaier, 2026-11-12, asked "Should AI-drafted replies say they were drafted by AI? That needs a new SPEC
rule.", answered: "yes". Today the prompt of the kind `draft-replies` asks for no such statement, `storeReplies` adds
none, and no requirement asks for one.

**What follows.** The person can still remove the statement from the draft in the mail program or on the send dashboard
before sending: the rule binds the draft Agent M stores, and every outgoing mail stays released by a person
(`EVERY OUTGOING MAIL IS RELEASED BY A PERSON`).

**Impact list.**
- `A REPLY DRAFTED BY A MODEL SAYS SO`, added: no artifact names it yet. UC-039, MOD-mail-handling (`storeReplies`), the
  kind `draft-replies` and `tests/test_mail_replies.py` would name it once this entry is accepted.

**Origin.** github.com/akmaier, in a conversation with Claude Code on 2026-11-12.
