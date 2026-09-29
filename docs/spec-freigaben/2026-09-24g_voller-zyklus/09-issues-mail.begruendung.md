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

**Decided by the PO on 2026-09-24** — see the table on the queue's index page; the questions below that it answers are settled, the others stay open.

**PO decision of 2026-09-28 — personal data from mail** (quoted in the rules). Built in as eleven new
rules; the section heading becomes "Issues, mail and personal data" (entry 05 and the index changed with
it). How they fit together:

1. **Structure first:** mails live only in the private tracker (`MAIL STAYS IN THE PRIVATE TRACKER`); no
   participant that writes to a repository ever receives one; the issue is neutral.
2. **A deterministic last check:** every write outside the private tracker is searched for the people
   known from the recorded mails.
3. **Report data:** attachments and logs are pseudonymised by default — consistent surrogates, mapping
   only in the private tracker; a product may switch it off after a notice.
4. **The link back:** each mail gets `MAIL-<hash>`; the issue lists them, so replies can be found when
   it is closed, wherever it was closed.
5. **Names:** accounts always; names only of collaborators who consented, listed in
   `docs/collaborators.md`.

Interpretations by the main agent — correct them in the edit field if needed:
- "protected non-public data space" is not detected automatically: the person decides by switching
  pseudonymisation off for a product; the notice names the condition, and warns separately for a public
  repository. Switching off is allowed for any repository, as the PO asked for an option to disable.
- Switching pseudonymisation off affects report *data*; issue *texts* stay neutral in every case.
- A `MAIL-` identifier is a pseudonym, not anonymous data: whoever holds the private tracker can link it
  to the mail. Anyone else cannot.

Impact: UC-012, UC-038, UC-039, UC-040 changed; new UC-042 (settings, including the collaborators list
and the pseudonymisation switch).

**Reworked after the PO's objections of 2026-09-29** — *"No; The issue has to record which mail it is
related to. Closing the issue creates a reply in the mail dashboard; this is then sent from the
dashboard."* · *"no; we have issues for this. We don't need double accounting here."* · *"What is not
clear to me is exactly what the 'private tracker' is. The tracker should be based on github / gitlab
issues and not all repositories will have a private branch or tracker."*

The new design has two stores and no third:
- **The mailbox** is the only place mail content lives (`MAIL STAYS IN THE MAILBOX`). The bridge finds a
  mail again by hashing the `Message-ID`s of the named folders (`A MAIL IS FOUND AGAIN BY ITS
  IDENTIFIER`).
- **The product's issues** are the only record of handling (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S
  HANDLING`): the `MAIL-` identifiers of its reports, a comment per sent reply (identifier and date only),
  and the label `waiting-for-reporter`.

Dropped: `THE PRIVATE TRACKER IS NOT PUBLIC`, `A SECOND REPLY NEEDS A SECOND CONFIRMATION`, `THE MAILBOX
FLAG MARKS WHAT IS OPEN`, and the private tracker in every other rule — none of them was ever in the SPEC,
so no withdrawal notes are needed. Renamed and reworded: `A MAIL IS RECORDED ONCE` → `A MAIL ALREADY
DECIDED IS NOT PROPOSED AGAIN`; `A DUPLICATE MAIL ADDS A REPORT, NOT AN ISSUE` → `A DUPLICATE MAIL IS
ADDED TO THE EXISTING ISSUE`; `EVERY REPORT OF A CLOSED ISSUE IS OFFERED A REPLY` → `CLOSING AN ISSUE
PREPARES ITS REPLIES`; `AN ANSWER ENDS THE DEFERRAL` → `AN ISSUE WAITING FOR A REPORTER IS LABELLED` and
`A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE`; the surrogate mapping is no longer stored but derived again
from the mail (`THE SURROGATE MAPPING IS NEVER STORED`).

New by the main agent, following from the design: `THE SEARCH LIST HOLDS ONLY HASHES` — the last check
of every write needs the names and addresses of the reporters; kept in the browser in clear, they would be
readable by every Pages site of the owner, so the browser keeps salted hashes only.

What a duplicate second reply is now prevented by: `CLOSING AN ISSUE PREPARES ITS REPLIES` offers a draft
only for mails without a reply note in the issue, and `EVERY OUTGOING MAIL IS RELEASED BY A PERSON` binds
each send to one click on the mail shown.

**Decided by the PO on 2026-09-29:** a mail deleted from the mailbox can no longer be answered; the
dashboard says *not found in the mailbox*. *"this is acceptable; it's also the proof that the issue does
not store personal information."* Added to the occasion of `A MAIL IS FOUND AGAIN BY ITS IDENTIFIER`.

**Mail access from the Pages site — PO decision of 2026-09-29, after measurement.** The PO asked to run mail
access on the GitHub Pages site, without the bridge, and to keep replies as drafts in the mailbox. Browsers
let no web page open raw TCP connections, so IMAP and SMTP are out of reach of any page (the
`emailjs-imap-client` library, too, needs a relay server for browsers). HTTP mail APIs are reachable
where the provider permits it — measured: Microsoft Graph and the Gmail API do, FAU's Exchange
(`groupware.fau.de`, on-premise) does not. The PO: *"OK. Then we settle with this."*

- **Two routes:** the provider's web API with its own sign-in (Microsoft 365, Gmail) — no password,
  least scopes, token only to the provider — and the bridge over IMAP/SMTP for every other server. The
  password rules now apply to the bridge route only (the first one says so in its occasion).
- **Drafts in the mailbox:** replies are drafted into the *Drafts* folder; the send dashboard lists the
  drafts of listed mails; a reply sent from the person's own mail program is noted in the issue too.
- **Sending:** `EVERY OUTGOING MAIL IS RELEASED BY A PERSON` holds on both routes; its hash-bound
  single-use confirmation is split off as `THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN`,
  because only a separate program needs it.

**Follows for the setup (UC-037):** the API route needs an app registration with Microsoft or Google
whose return address is the instance's dashboard; institutions may restrict such registrations for their
users. The dashboard guides through it step by step.

**Simplified after the PO's objection of 2026-09-29** — *"This can get very slow … I don't think, we need to
store everyone encountered. It is enough to test for the persons in the mail at hand."* `EVERY WRITE IS
SEARCHED FOR THE PEOPLE OF THE MAILS READ` checked every write against a growing list of everyone ever
read, which needed `THE SEARCH LIST HOLDS ONLY HASHES` to keep that list safe in the browser. Both are
replaced by `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`: only texts drawn from a mail are
checked, against the people of that mail. Writes not drawn from a mail cannot contain mail data, because
no writing job ever receives a mail. Nothing about reporters is stored in the browser any more.
