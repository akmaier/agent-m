# §14: issues and mail

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

## Open questions of the drafting group

1. **Wording of two existing requirements.** `CONFIGURATION LIVES IN THE BROWSER` lists "endpoint,
   model, model API key and the repository tokens" — the mailbox connection (server, account,
   password) is not named. `THE SHARED PAGES ORIGIN IS DISCLOSED` speaks of "a token or key". Change
   both under their existing names to include the mailbox connection, or leave them and rely on the
   new §14 rules? (Impact list: UC-001, UC-003, UC-014 realise them.)
2. **Remember or ask each time?** The PO decided on the browser's store. Should Agent M additionally
   offer *do not remember* — the password held only in the open tab and asked for again on the next
   visit — for people who do not have an owner used for nothing else?
3. **Where may mail be processed?** A participant that proposes the issue receives the mail with its
   personal data. May mail go to any participant the person chooses (the page states the place,
   `THE PAGE STATES WHAT IT SENDS WHERE`), or only to participants whose processing place the person
   has marked as permitted for mail — for example, not outside the EU?
4. **Token permissions.** Creating issues needs *Issues: read and write* on GitHub (a GitLab project
   token with `api` already covers it), and a private tracker repository needs *Contents*. Does the
   one instance token get these added (impact on `THE TOKEN LINK IS PREFILLED`,
   `THE REPOSITORY CHOICE IS SPELLED OUT`, UC-001, UC-014), or does the mail feature use a token of its
   own?
5. **Answer protocol from §6.** Make binding in Agent M: the reply quotes the reporter's original
   mail; a per-mailbox copy list (CC) that is always joined with the draft's CC; a sender display name
   that says a draft came from an agent on behalf of a named person? §6 has all three for the support
   process; the brief did not ask for them.
6. **Reading on a schedule.** Mail is read when the person presses *Read mailbox*. Should a
   self-hosted runner or the bridge read periodically — which would require the password on that
   machine and contradict `THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST`?
7. **Address of the private tracker.** Its repository name may itself say something ("alice/
   support-mail"). Stored in the browser like the mailbox connection, or in the instance repository
   so that it is the same in every browser?
