# §14: Gmail through the bridge; the narrowest permissions for reading, drafting and sending

**The findings (measurement 2026-09-30, point 6).** Gmail from a page without a server: every Gmail read
scope is *restricted* and needs Google's verification for a public app; a browser-only app gets no refresh
token, so every new token takes a click; the hand-written flow that avoids Google's own library is "strongly
discouraged". Microsoft: the sign-in for single-page apps works without a server; there is no permission for
drafts alone — creating a draft needs `Mail.ReadWrite`, which also allows changing and deleting mail.

**PO decisions, 2026-09-30:** *"B (b)"* — Gmail only through the bridge over IMAP; *"C rewording is fine. We
will need to be able to create new drafts in the mailbox."*

**What this entry does:**
- `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE` — Microsoft 365 through Graph;
  every other mailbox, Gmail included, through the bridge. The name stays (it is the ID); the rule no longer
  names the Gmail API.
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING` — "no permission beyond the narrowest ones
  its provider offers for reading mail, creating drafts and sending mail"; the check names the three Graph
  permissions `Mail.ReadWrite`, `Mail.Send`, `offline_access`. That Agent M changes nothing it reads stays
  guarded by `READING THE MAILBOX CHANGES NOTHING IN IT`.

**Checked by the main agent, 2026-09-30, on Google's pages:** Gmail over IMAP refuses the account password
since 2025-03-14 ("IMAP, SMTP, and POP will no longer work with legacy passwords") with app passwords as the
exception; app passwords "can only be used with accounts that have 2-Step Verification turned on" and are
not offered for many work or school accounts, accounts with only security keys, or Advanced Protection
(support.google.com/accounts/answer/185833; knowledge.workspace.google.com, transition from less secure apps).
Whether Gmail's IMAP works through the bridge in practice is measured with the bridge.

**Impact list** (files naming the two rules or Gmail): `SPEC.md`; UC-037 (route table, actors, step 1,
step 3 names the permissions, step 4 Gmail's app password — updated), UC-038 (actors — updated), UC-044
(level table — updated); architecture ARC-014, MOD-mail-api, MOD-mail-flow follow as an architecture change
(UC-023) after acceptance. The level-1 sentence in §6 is in queue 2026-09-30h, entry 01. The rest of §14 is
carried over byte for byte.
