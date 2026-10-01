## 14. Issues, mail and personal data

**A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE** *(PO A. Maier, 2026-09-29)*
The dashboard reaches a Microsoft 365 mailbox directly through Microsoft Graph, and any other mailbox —
Gmail included — through the local bridge over IMAP and SMTP.
*Occasion:* PO, 2026-09-29, asked for mail access from the GitHub Pages site itself. Browsers let no web
page open a raw TCP connection, so IMAP and SMTP cannot be spoken from a page; an HTTP API can, where
its server permits the page's origin. Measured 2026-09-29: Microsoft Graph answers the preflight from
`https://akmaier.github.io` with `Access-Control-Allow-Origin: *` and the Gmail API with that origin
itself; FAU's Exchange (`groupware.fau.de`) answers `401` without any `Access-Control-*` header, and is
not Microsoft 365. Libraries that promise IMAP in the browser (`emailjs-imap-client`) rely on a relay
server for exactly this reason — which is what the bridge is, on the person's own machine. PO,
2026-09-30: Gmail through the bridge only. Measured 2026-09-30 from Google's documentation
(`docs/measurements/2026-09-30_architecture-open-points.md`, point 6): every Gmail read scope is
restricted and needs Google's verification for a public app, a browser-only app gets no refresh token,
and the flow without Google's own library is strongly discouraged. Over IMAP, Gmail refuses the account
password since 2025-03-14 but accepts an app password, which needs 2-Step Verification and is not offered
for many work or school accounts (support.google.com/accounts/answer/185833, read 2026-09-30).
*Check:* `tests/test_mail_routes.py` — a Microsoft 365 fixture is read with no bridge request;
counter-proof: an IMAP fixture, a Gmail one included, is read only through the bridge.

**AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN** *(PO A. Maier, 2026-09-29)*
A mailbox reached through its provider's web API is authorised by that provider's sign-in in the
browser; Agent M asks for no mailbox password.
*Occasion:* the provider's sign-in gives the dashboard a revocable token for the mailbox; the password
itself never reaches Agent M. That is safer than a stored password, and the provider's own page shows
and withdraws the access.
*Check:* `tests/test_mail_routes.py` — the API route stores no password; counter-proof: the IMAP route
asks for one.

**THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING** *(PO A. Maier, 2026-09-29)*
The provider sign-in asks for no permission beyond the narrowest ones its provider offers for reading
mail, creating drafts and sending mail.
*Occasion:* a mailbox token reaches as far as the mailbox itself; `A TOKEN IS SCOPED TO WHAT IT WRITES`
applied to mail — no calendar, no contacts, no settings of the account. PO, 2026-09-30: "We will need to
be able to create new drafts in the mailbox." Measured 2026-09-30 (point 6 of the measurement above):
Microsoft Graph has no permission for drafts alone — creating one needs `Mail.ReadWrite`, which also
allows changing and deleting mail; the narrowest set is `Mail.ReadWrite`, `Mail.Send` and
`offline_access`. That Agent M changes nothing it reads rests on `READING THE MAILBOX CHANGES NOTHING IN
IT`, not on the permission.
*Check:* `tests/test_mail_routes.py` — the requested scopes are exactly `Mail.ReadWrite`, `Mail.Send` and
`offline_access`.

**THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER** *(PO A. Maier, 2026-09-29, changed 2026-10-01)*
A mailbox token from a provider sign-in leaves the browser only as the authorisation of requests to that
provider's API.
*Occasion:* the same boundary as `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` for repository tokens:
a mailbox token that reached another origin could be used to read every mail.
*Check:* `tests/mailbox.test.mjs` — a request to any other origin carries no mailbox token;
counter-proof: the request to the provider carries it.

**THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE** *(PO A. Maier, 2026-09-24)*
Before a mailbox password is stored, Agent M states that every GitHub Pages site under the same
`<owner>.github.io` can read it, and what it grants: reading every mail of the mailbox and sending
mail in its name.
*Occasion:* only the bridge route needs a password (`A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API
OR THROUGH THE BRIDGE`). PO decision 2026-09-24 — the password is kept in the browser's store and the shared
origin is an accepted risk (measured 2026-09-23: seven Pages sites share `https://akmaier.github.io`).
A mailbox password reaches further than a repository token, so the notice of
`THE SHARED PAGES ORIGIN IS DISCLOSED` is not enough; the notice recommends an owner used for nothing
else.
*Check:* `tests/test_settings_disclosure.py` — the mailbox form stores nothing before the notice is
acknowledged.

**THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE** *(PO A. Maier, 2026-09-24)*
The mailbox password leaves the browser only inside a request to the local bridge.
*Occasion:* a browser cannot speak IMAP or SMTP, so the bridge is the one place that needs it (PO
decision 2026-09-24). It never goes to a repository server, a model endpoint or a participant —
"passwords and secrets must not be shared".
*Check:* `tests/test_mail_password_route.py` — every outgoing request of a full mail run is recorded;
the password appears only in requests to the bridge address.

**THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST** *(PO A. Maier, 2026-09-24)*
The bridge keeps the mailbox password only in memory, for the duration of the request that carried
it.
*Occasion:* the PO's store is the browser's; a second copy on the bridge's disk would outlive a
disconnect and be readable by every program of that machine. Clearing the browser's store
(`A CLEAR IS A REAL CLEAR`) then removes the password everywhere.
*Check:* `tests/test_bridge_mail.py` — after a run with a marker password, no file below the bridge's
directories and no log line contains it; counter-proof: a bridge that logs the request fails.

**THE MAIL SERVER IS REACHED ONLY OVER TLS** *(PO A. Maier, 2026-09-24)*
The bridge sends a login to an IMAP or SMTP server only over an encrypted connection — implicit TLS
or STARTTLS.
*Occasion:* a login without encryption sends the password in clear text over the network.
*Check:* `tests/test_bridge_mail.py` — against a local test server without TLS, no `LOGIN`/`AUTH` is
sent.

**READING THE MAILBOX CHANGES NOTHING IN IT** *(PO A. Maier, 2026-09-24)*
Reading mails for issues neither marks a mail as read nor moves, deletes or flags it.
*Occasion:* the mailbox is the person's working tool; reading it for Agent M must not change what
they see there. Taken over from `ticket_db.ingest` (read-only select, `BODY.PEEK`). Agent M sets no
flags either: how a mail was handled is recorded in its issue (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S
HANDLING`).
*Check:* `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`,
`MOVE`, `EXPUNGE` and no non-peek `FETCH`.
On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).

**MAIL STAYS IN THE MAILBOX** *(PO A. Maier, 2026-09-29)*
The text of a mail, its sender, its reply address and its attachments are kept only in the mailbox;
Agent M writes them to no repository, issue tracker or file.
*Occasion:* PO, 2026-09-29: the tracker is the product's GitHub or GitLab issues, and "not all
repositories will have a private branch or tracker". The mailbox already holds every mail, with the
protection its owner chose; a second copy anywhere else would be one more place for personal data to
leak from. The dashboard shows a mail while it is open and forgets it with the tab.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails, no write of Agent M contains a
sender address, a sender name, the body of a mail as a whole or one of its attachments; counter-proof: a
planted body in a job record is found.

**THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING** *(PO A. Maier, 2026-09-29)*
Which mails an issue concerns, which of them were answered, and whether the issue waits for a reporter
are recorded only in the product's issue tracker.
*Occasion:* PO, 2026-09-29: "we have issues for this. We don't need double accounting here." Mailbox
flags, a tracker of reports and a list of replies would each be a second account of the same state, and
would disagree with the issue sooner or later.
*Check:* `tests/test_mail_replies.py` — the mail dashboard's groups are computed from issues and the
mailbox alone; counter-proof: clearing the browser's storage changes none of them.

**A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER** *(PO A. Maier, 2026-09-28)*
Every mail Agent M handles has the identifier `MAIL-` followed by the first sixteen hexadecimal digits
of the SHA-256 of its `Message-ID`, or of its bytes when it has none.
*Occasion:* PO, 2026-09-28: mails "should receive a unique identifier (maybe as hash) that can be tracked
in the issue". A `Message-ID` often contains a host or a user name, so it is never written itself; the
hash cannot be turned back into it, and only the mailbox, which holds the mail, links it back.
*Check:* `tests/test_mail_import.py` — the identifier is stable across two readings of the same mail;
counter-proof: two mails with different `Message-ID`s get different identifiers.

**A MAIL IS FOUND AGAIN BY ITS IDENTIFIER** *(PO A. Maier, 2026-09-29)*
To show or answer a mail an issue lists, Agent M finds it in the mailbox by hashing the `Message-ID`s
of the folders the mailbox connection names — `INBOX` unless others are named.
*Occasion:* with the mailbox as the only store (`MAIL STAYS IN THE MAILBOX`), the identifier in the issue
must lead back to the mail. IMAP and both web APIs deliver the `Message-ID` headers of a folder without
reading the mails; hashing them is cheap. Mails the person has filed into other folders are found once those folders are
named. PO, 2026-09-29: a mail deleted from the mailbox can no longer be answered, and the dashboard says
*not found in the mailbox* — "this is acceptable; it's also the proof that the issue does not store
personal information".
*Check:* `tests/test_bridge_mail.py` — a mail moved to a named folder is found; counter-proof: an
identifier with no matching mail yields *not found in the mailbox*, never a guess.

**AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS** *(PO A. Maier, 2026-09-28)*
An issue created from a mail, and every issue a further report is added to, lists the `MAIL-`
identifiers of its reports.
*Occasion:* PO, 2026-09-28: the identifier is tracked in the issue "such that this information can be
used once the issue was solved to reply to the original mail". Whoever closes the issue — in Agent M or
elsewhere — leaves the link to every reporter in place.
*Check:* `tests/test_mail_replies.py` — closing an issue with two listed identifiers offers two replies,
found through the identifiers alone.

**A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN** *(PO A. Maier, 2026-09-29)*
A mail that an issue lists, or that the person marked *not an issue* in this browser, is not proposed
again.
*Occasion:* reading the mailbox twice must not produce a second proposal for the same mail. The issues
say which mails became issues; for the rest — a thank-you, spam — the browser keeps their identifiers
only, which say nothing about their senders.
*Check:* `tests/test_mail_import.py` — a second reading proposes no listed and no marked mail;
counter-proof: an unmarked new mail is proposed.

**THE PRODUCT ISSUE CARRIES NO PERSONAL DATA** *(PO A. Maier, 2026-09-24)*
An issue created from a mail contains no name, mail address, phone number or signature of anyone
named in the mail.
*Occasion:* PO decision 2026-09-24 — the product's issue tracker gets the technical content only.
Product issue trackers are often public.
*Check:* `tests/test_mail_privacy.py` — deterministic: every address and display name from the mail's
headers, and every address and phone number found in its body, is absent from the issue text. How
often the participant's neutral text still contains personal data is measured as a rate on a fixed
set of mails (§4.0a rule 4), reported, not gated.

**A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK** *(PO A. Maier, 2026-09-24)*
An issue is created from a mail only as the direct result of a person's click on the proposed issue
text.
*Occasion:* the participant proposes product, kind, text and duplicates; the person decides
(`A GENERATED ARTIFACT IS A PROPOSAL`). A CLI agent that could create issues on its own would put its
own reading of a mail — including personal data it missed — into the product's tracker.
*Check:* `tests/test_mail_import.py` — a run without the click creates no issue; the participant's
job definition contains no issue-creating call.

**AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE** *(PO A. Maier, 2026-09-24)*
Every issue created from a mail is labelled either as a defect against the current SPEC or as a
request for changed behaviour.
*Occasion:* the two go different ways — a defect to implementation, a change first through the SPEC
(`EVOLUTION ENTERS THROUGH THE SPECIFICATION`, UC-012). The book distinguishes correcting faults from
improving and adapting (ch. 14, *Software Maintenance: Types and Cost Dynamics*).
*Check:* `tests/test_mail_import.py`

**A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL** *(PO A. Maier, 2026-09-24, reworded 2026-09-29)*
A mail whose `In-Reply-To` or `References` names a mail that an issue lists is attached to that issue —
its identifier added to the issue's list — before any participant sees it.
*Occasion:* what can be decided without a model is decided without one (`SOFTWARE_MAINTENANCE.md`
§4.0a rule 3). A reporter's answer to a question must land at their issue, not become a new one.
*Check:* `tests/test_mail_import.py`

**A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE** *(PO A. Maier, 2026-09-29)*
A mail the person confirms as describing an existing issue adds its identifier to that issue instead of
creating a new one.
*Occasion:* several people report the same fault; each must be answered when it is solved — "keeping
track who to reply" —, and the issue's list of identifiers is what keeps track.
*Check:* `tests/test_mail_import.py`

**EVERY OUTGOING MAIL IS RELEASED BY A PERSON** *(PO A. Maier, 2026-09-24, reworded 2026-09-29)*
Agent M sends a mail only as the direct result of a person's click on the complete mail shown to them —
recipients, subject, body and attachments.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §0.1 ("kein Auto-Reply") and §6.1 (explicit
click with confirmation). A participant can draft a mail, never send one. A draft the person sends from
their own mail program is their own click, outside Agent M.
*Check:* `tests/test_mail_routes.py` — on both routes, no send request is made without the click;
counter-proof: with it, exactly one.

**THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN** *(PO A. Maier, 2026-09-24, split 2026-09-29)*
The bridge sends a mail only with a single-use confirmation that names the SHA-256 of the complete mail
shown to the person.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 (single-use nonce). The bridge is a separate
program; binding the confirmation to the hash makes the gate structural there too: a mail changed after
the preview is not the one released, and a repeated request sends nothing.
*Check:* `tests/test_bridge_mail.py` — sending mocked: without confirmation, with a reused one, or
with a body changed after the preview, zero SMTP calls.

**A REPLY IS THREADED ON THE REPORTER'S MAIL** *(PO A. Maier, 2026-09-24)*
A reply to a report carries that report's `Message-ID` in `In-Reply-To` and `References`, wherever the
reporter stands among the recipients.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6 and `DER THREAD-ANKER IST DER MELDER`
(§6.1). The reporter's answer then arrives in the same thread, which
`A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL` relies on.
*Check:* `tests/test_bridge_mail.py`

**A REPLY GOES TO ONE REPORTER** *(PO A. Maier, 2026-09-24)*
A reply to one report has no reporter of another report among its recipients.
*Occasion:* several people often report the same fault (`A DUPLICATE MAIL IS ADDED TO THE EXISTING
ISSUE`). One mail to all of them would give each reporter the others' addresses — personal data
disclosed by the tool meant to keep it private.
*Check:* `tests/test_mail_replies.py` — an issue with three reports yields three mails, each with one
reporter.

**CLOSING AN ISSUE PREPARES ITS REPLIES** *(PO A. Maier, 2026-09-29)*
When an issue that lists mails is closed, the mail dashboard offers to draft a reply for every listed mail
that has no sent reply noted in the issue.
*Occasion:* PO, 2026-09-29: "Closing the issue creates a reply in the mail dashboard; this is then sent
from the dashboard." An issue is often closed elsewhere — by a merged pull request —, so the offer is
derived from the issue's state, not from a click in Agent M.
*Check:* `tests/test_mail_replies.py` — a closed issue listing two mails yields two offers; counter-proof:
with a reply noted for one, one offer.

**A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER** *(PO A. Maier, 2026-09-29)*
A reply drafted for a mail an issue lists is stored as a draft in the mailbox's *Drafts* folder, as a
reply to that mail, and nowhere else.
*Occasion:* PO, 2026-09-29: "Once the issue is closed, the replies can be stored in the draft folder.
This is where the send dashboard will find them." The draft holds the reporter's address and the
quoted mail — personal data that belongs in the mailbox (`MAIL STAYS IN THE MAILBOX`). The person can
review and send it from the dashboard or from their own mail program.
*Check:* `tests/test_mail_replies.py` — after drafting, the draft is in *Drafts* with `In-Reply-To`
set, and no write outside the mailbox contains its text.

**THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS** *(PO A. Maier, 2026-09-29)*
The send dashboard shows every draft in the *Drafts* folder that replies to a mail an issue lists.
*Occasion:* the drafts folder is the list of what is waiting to be sent; the dashboard reads it instead
of keeping a list of its own (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`).
*Check:* `tests/test_mail_replies.py` — a draft replying to a listed mail is shown; counter-proof: an
unrelated draft of the person is not.

**A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO** *(PO A. Maier, 2026-09-29)*
A reply to a listed mail found in the *Sent* folder is noted in the issue, whether it was sent from the
dashboard or from a mail program.
*Occasion:* with drafts in the mailbox, the person may send from wherever they read mail; the issue must
still know that the reporter was answered, or it would offer the reply again.
*Check:* `tests/test_mail_replies.py` — a reply placed in *Sent* by hand is noted at the next reading;
counter-proof: an unrelated sent mail is not.

**A SENT REPLY IS NOTED IN THE ISSUE** *(PO A. Maier, 2026-09-29)*
When a reply is sent, the issue receives a comment naming the mail's identifier and the date, and
nothing of the reply's text or recipient.
*Occasion:* the note is the issue's own record that this reporter was answered
(`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`); the reply itself is in the mailbox's *Sent*
folder, threaded on the reporter's mail. For a reply sent from a mail program, the note is written at
the next reading of the mailbox (`A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO`).
*Check:* `tests/test_mail_replies.py` — after sending, the issue has one comment with the identifier and
date and no address; counter-proof: no draft is offered for that mail again.

**AN ISSUE WAITING FOR A REPORTER IS LABELLED** *(PO A. Maier, 2026-09-29)*
An issue for which a question has been sent to a reporter carries the label `waiting-for-reporter` until
a person removes it.
*Occasion:* "defer issues until a reply is received" — the issue tracker already has labels; deferral
is a state of the issue, readable by everyone working on it, not a note elsewhere.
*Check:* `tests/test_mail_replies.py`

**A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE** *(PO A. Maier, 2026-09-29)*
A mail answering an issue labelled `waiting-for-reporter` is shown under that issue in the mail
dashboard as *answer received*.
*Occasion:* the answer arrives in the mailbox, not in the tracker; showing it at the issue lets the
person decide the next step — remove the label, ask again, close — without searching the mailbox.
*Check:* `tests/test_mail_replies.py`

**A CLOSED ISSUE IS REOPENED ONLY BY A PERSON** *(PO A. Maier, 2026-09-24)*
A closed issue returns to open only by a person's click.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 ("kein Reopen terminaler Tickets"). A
reporter's "thank you" in the thread of a solved issue must not reopen it; the mail is shown, the
person decides.
*Check:* `tests/test_mail_replies.py`

**THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED** *(PO A. Maier, 2026-09-24)*
Each mailbox connection names the processing places to which its mails may be given, and a
participant that processes data elsewhere is never given them.
*Occasion:* PO, 2026-09-24: this "is to be configured; can be ok in the US". Mails carry personal data;
the person who connects the mailbox decides where it may be processed, once, instead of at every
mail.
*Check:* `tests/test_mail_privacy.py` — a mail is not sent to a participant whose processing place is
not listed; counter-proof: it is sent to one whose place is.

**A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT** *(PO A. Maier, 2026-09-24)*
When a processing place outside the European Union is allowed for a mailbox, the dashboard states,
before saving, that processing personal data there does not comply with the EU's rules — the GDPR
for transferring personal data, and the EU AI Act.
*Occasion:* PO, 2026-09-24: US processing "will not comply with EU AI ACT". The person may still choose
it; the choice is then an informed one, and its record says so.
*Check:* `tests/test_settings_disclosure.py`

**NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY** *(PO A. Maier, 2026-09-28)*
No file, commit message, issue, comment or label that Agent M writes contains personal data taken from
a mail.
*Occasion:* PO, 2026-09-28: "nothing in the repository should have personal information from an e-mail
introduced by accident." A repository and its history are copied, forked and kept; personal data that
reached one cannot be taken back. The other rules of this section are the ways this one is kept.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails — issue, backlog item, SPEC
proposal, regression test, job record, reply note —, no write contains any name,
address, phone number or account from those mails; counter-proof: a planted address in a job record is
found.

**A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE** *(PO A. Maier, 2026-09-29)*
Before Agent M writes text drawn from a mail — an issue's text, report data — to an issue tracker or a
repository, it searches the text for every name, mail address, phone number and account found in that
mail, and writes nothing while one is found.
*Occasion:* PO, 2026-09-29: "I don't think, we need to store everyone encountered. It is enough to test
for the persons in the mail at hand." Only a text drawn from a mail can carry its people; every other
write is kept free of mail data by construction — jobs that write never receive a mail (`A PARTICIPANT
THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`), a reply note holds an identifier and a date. A check
against the people of the mail at hand is deterministic, fast, and needs no list kept anywhere
(`SOFTWARE_MAINTENANCE.md` §4.0a rule 3).
*Check:* `tests/test_mail_privacy.py` — an issue text containing the sender's name, or a name from the
mail's signature, is refused and the hit named; counter-proof: the same text without the name passes.

**A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL** *(PO A. Maier, 2026-09-28, changed 2026-10-01)*
A job that writes to a repository is given the neutral issue and the report data as the issue holds it —
rewritten without persons unless the product switched that off —, never the text or attachments of a mail.
*Occasion:* only the participant that proposes an issue (UC-038) or drafts a reply (UC-039) reads mails,
and neither writes anywhere — a person decides. A coding agent that fixes the bug never needs to know
who reported it. PO, 2026-10-01: with the rewriting switched off (`PSEUDONYMISATION IS ON UNLESS A PRODUCT
SWITCHES IT OFF`), the job gets the original report data the issue holds — never more than the issue.
*Check:* `tests/test_mail_privacy.py` — the inputs of an implementation job started from a mail's issue
contain no text of the mail.

**REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX** *(PO A. Maier, 2026-09-29 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons instead of having its personal data replaced by
surrogates. Replaced by `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` and `A REWRITTEN TEXT
IS CHECKED BY THREE LLMS`. The name is not reused.

**REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS** *(PO A. Maier, 2026-09-30)*
Attachments, logs, error messages, screenshots' text and data files from a mail go into an issue or a
repository only as a participant's rewriting that mentions no person and keeps their technical content.
*Occasion:* PO, 2026-09-30, on the architecture's pseudonymiser: "I would instruct to rephrase without
mentioning persons. We simply don't want person names be part of issues." — logs and attachments
included. A surrogate is a second name for a person; a rewriting leaves the person out — "the user's home
folder" instead of a path with a user name. The group's own study of text pseudonymisation found that
"Surrogates are not a privacy control" (`github.com/akmaier/pseudonymization`, README, read 2026-09-30). Whether the technical content survives
the rewriting depends on a model, so it is measured, not assumed (`SOFTWARE_MAINTENANCE.md` §4.0a rule 4).
*Check:* `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP
address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof:
a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and
version is measured as a rate on a fixed set of reports, reported, not gated.

**A REWRITTEN TEXT IS CHECKED BY THREE LLMS** *(PO A. Maier, 2026-09-30)*
A text that a participant rewrites from a mail is written only after three LLM participants with three
different models, at places the mailbox allows, have each checked it for any mention of a person and none
of them has found one.
*Occasion:* PO, 2026-09-30: "I would use three LLMs for this" — one participant rewrites, three check, and a
finding of any one of them is enough. In the group's study an ensemble of detectors caught more than any
single one (`github.com/akmaier/pseudonymization`, README, read 2026-09-30). A finding goes back to the rewriting participant like any other
(`A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`), within the round limit. The checkers read a
text that may still hold a person, so they are held to the mailbox's places (`THE PLACES A MAILBOX'S MAIL
MAY GO ARE CONFIGURED`). The search for the mail's own people (`A TEXT FROM A MAIL IS SEARCHED FOR THAT
MAIL'S PEOPLE`) runs as well and needs no model.
*Check:* `tests/test_mail_privacy.py` — with three fixture checkers of which one reports a name, nothing is
written and the finding goes back; counter-proof: when none reports one, the text is written. How often a
person passes all three is measured as a rate on a fixed set of mails, reported, not gated.

**A SURROGATE IS THE SAME WITHIN A REPORT** *(PO A. Maier, 2026-09-28 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons; there are no surrogates (`REPORT DATA LEAVES THE
MAILBOX ONLY REWRITTEN WITHOUT PERSONS`). The name is not reused.

**THE SURROGATE MAPPING IS NEVER STORED** *(PO A. Maier, 2026-09-29 — withdrawn 2026-09-30)*
*Withdrawn:* report data is rewritten without persons; there are no surrogates and no mapping (`REPORT DATA
LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`). The name is not reused.

**NO CHECKER IS THE REWRITER** *(PO A. Maier, 2026-10-01)*
None of the three participants that check a rewritten text is the participant that rewrote it or uses its
model.
*Occasion:* PO, 2026-10-01: a checker that wrote the text, or runs the same model, repeats the rewriter's
blind spots — the reasoning of `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`, applied to
the three checks of `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`. Models are compared by the name each
participant declares (`A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`).
*Check:* `tests/test_mail_privacy.py` — a set of checkers that includes the rewriter, or a checker with the
rewriter's model, is refused before anything is sent; counter-proof: three checkers with three other models
are accepted.

**PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF** *(PO A. Maier, 2026-09-28, changed 2026-09-30)*
Rewriting report data without persons applies to every product whose settings do not switch it off.
*Occasion:* PO, 2026-09-28: "These requirements are very important in the EU; for the US it might not
matter as much; I would enable the anonymization layer by default but have an option to disable the
feature." The setting belongs to the product, in its own repository, where everyone working on it can
see which rule applies. PO, 2026-09-30: the switch stays, for products on a protected data space; what it
switches is the rewriting (`REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`).
*Check:* `tests/test_mail_privacy.py` — a product without the setting gets rewritten report data;
counter-proof: a product that switched it off gets the original data.

**SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS** *(PO A. Maier, 2026-09-28)*
Before a product's pseudonymisation is switched off, the dashboard states that report data will then
enter the product's issues and repository unchanged, that this is advisable only on a protected,
non-public data space, and — for a repository its server reports as public — that the data will be
published.
*Occasion:* PO, 2026-09-28: surrogates are needed "unless the repository is on a protected non-public
data space". Switching off is the person's decision; the notice makes it an informed one, as for mail
processed outside the EU (`A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT`). Switching off
pseudonymisation does not switch off `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY` for issue texts,
which stay neutral.
*Check:* `tests/test_settings_disclosure.py`

**A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT** *(PO A. Maier, 2026-09-28)*
A repository managed by Agent M names a person only by their account on its server, or by name if the
person is listed as consenting in the repository's `docs/collaborators.md`.
*Occasion:* PO, 2026-09-28: "What can be in the repo are git(hub) usernames and names of collaborators
(if they agreed; i.e. like co-authors on a paper for example)." Commits already carry accounts; a name
beyond that is a decision of its bearer, written down where it can be checked.
*Check:* `tests/test_collaborators.py` — a name in a generated artifact that is neither an account nor
in `docs/collaborators.md` is reported; counter-proof: a listed collaborator's name passes.
