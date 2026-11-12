# 14. Issues, mail and personal data: the send dashboard reads Drafts for the last 30 days, as the inbox and Sent

**The change.**
- `THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS`: the drafts it shows are those of the last 30 days in the
  *Drafts* folder that reply to a listed mail, where it said every draft there. Its check is unchanged.

Every other byte of the section is carried over.

**Why.** akmaier, 2026-11-12: "Reading the mailbox now takes very long. How can we improve on this?", and then: "first
limit the Drafts and Sent reads to the last 30 days, selected by the server as the inbox is (if the accepted texts
allow it; otherwise draft the smallest text change and stop there)." Every reading of the mail page — when it opens and
every five minutes after — reads the whole *Drafts* folder in full. The rule says *every draft*, so the reading cannot be
limited without this change. Sent is limited in the code already: no text names a period for it.

**What follows.** A reply draft older than 30 days is no longer shown under its issue. It stays in *Drafts* and the
mail program still shows it. The issue stays *to answer* until the draft is sent from the mail program, or until
the author drafts the reply again.

**Measured.** One reading (readNewMail and repliesDue) against a loopback IMAP fixture holding 1,100 inbox mails, 730
sent mails and 20 drafts of about 6 KB each, with 20 ms per server answer at 2.5 MB/s. With Sent limited, reading Drafts
whole took 0.25 s of 5.4 s. Ten `find` calls for the listed mails took 4.3 s, because each one fetches every envelope
of the inbox.

**Impact list.**
- `THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS`, changed: named by UC-039, ARC-044, MOD-mail-handling
  (`repliesDue`) and `tests/test_mail_replies.py`. UC-039 step 1 and MOD-mail-handling's `repliesDue` would name the
  period once this entry is accepted.

**Origin.** github.com/akmaier, in a conversation with Claude Code on 2026-11-12.
