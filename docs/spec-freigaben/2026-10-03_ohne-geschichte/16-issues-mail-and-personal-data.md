## 14. Issues, mail and personal data

**A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE** *(PO A. Maier)*
The dashboard reaches a Microsoft 365 mailbox directly through Microsoft Graph, and any other mailbox —
Gmail included — through the local bridge over IMAP and SMTP.
*Check:* `tests/test_mail_routes.py` — a Microsoft 365 fixture is read with no bridge request;
counter-proof: an IMAP fixture, a Gmail one included, is read only through the bridge.

**AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN** *(PO A. Maier)*
A mailbox reached through its provider's web API is authorised by that provider's sign-in in the
browser; Agent M asks for no mailbox password.
*Check:* `tests/test_mail_routes.py` — the API route stores no password; counter-proof: the IMAP route
asks for one.

**THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING** *(PO A. Maier)*
The provider sign-in asks for no permission beyond the narrowest ones its provider offers for reading
mail, creating drafts and sending mail.
*Check:* `tests/test_mail_routes.py` — the requested scopes are exactly `Mail.ReadWrite`, `Mail.Send` and
`offline_access`.

**THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER** *(PO A. Maier)*
A mailbox token from a provider sign-in leaves the browser only as the authorisation of requests to that
provider's API.
*Check:* `tests/review-core.test.mjs` — a request to any other origin carries no mailbox token;
counter-proof: the request to the provider carries it.

**THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE** *(PO A. Maier)*
Before a mailbox password is stored, Agent M states that every GitHub Pages site under the same
`<owner>.github.io` can read it, and what it grants: reading every mail of the mailbox and sending
mail in its name.
*Check:* `tests/test_settings_disclosure.py` — the mailbox form stores nothing before the notice is
acknowledged.

**THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE** *(PO A. Maier)*
The mailbox password leaves the browser only inside a request to the local bridge.
*Check:* `tests/test_mail_password_route.py` — every outgoing request of a full mail run is recorded;
the password appears only in requests to the bridge address.

**THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST** *(PO A. Maier)*
The bridge keeps the mailbox password only in memory, for the duration of the request that carried
it.
*Check:* `tests/test_bridge_mail.py` — after a run with a marker password, no file below the bridge's
directories and no log line contains it; counter-proof: a bridge that logs the request fails.

**THE MAIL SERVER IS REACHED ONLY OVER TLS** *(PO A. Maier)*
The bridge sends a login to an IMAP or SMTP server only over an encrypted connection — implicit TLS
or STARTTLS.
*Check:* `tests/test_bridge_mail.py` — against a local test server without TLS, no `LOGIN`/`AUTH` is
sent.

**READING THE MAILBOX CHANGES NOTHING IN IT** *(PO A. Maier)*
Reading mails for issues neither marks a mail as read nor moves, deletes or flags it.
*Check:* `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`,
`MOVE`, `EXPUNGE` and no non-peek `FETCH`.
On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).

**MAIL STAYS IN THE MAILBOX** *(PO A. Maier)*
The text of a mail, its sender, its reply address and its attachments are kept only in the mailbox;
Agent M writes them to no repository, issue tracker or file.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails, no write of Agent M contains a
sender address, a sender name, the body of a mail as a whole or one of its attachments; counter-proof: a
planted body in a job record is found.

**THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING** *(PO A. Maier)*
Which mails an issue concerns, which of them were answered, and whether the issue waits for a reporter
are recorded only in the product's issue tracker.
*Check:* `tests/test_mail_replies.py` — the mail dashboard's groups are computed from issues and the
mailbox alone; counter-proof: clearing the browser's storage changes none of them.

**A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER** *(PO A. Maier)*
Every mail Agent M handles has the identifier `MAIL-` followed by the first sixteen hexadecimal digits
of the SHA-256 of its `Message-ID`, or of its bytes when it has none.
*Check:* `tests/test_mail_import.py` — the identifier is stable across two readings of the same mail;
counter-proof: two mails with different `Message-ID`s get different identifiers.

**A MAIL IS FOUND AGAIN BY ITS IDENTIFIER** *(PO A. Maier)*
To show or answer a mail an issue lists, Agent M finds it in the mailbox by hashing the `Message-ID`s
of the folders the mailbox connection names — `INBOX` unless others are named.
*Check:* `tests/test_bridge_mail.py` — a mail moved to a named folder is found; counter-proof: an
identifier with no matching mail yields *not found in the mailbox*, never a guess.

**AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS** *(PO A. Maier)*
An issue created from a mail, and every issue a further report is added to, lists the `MAIL-`
identifiers of its reports.
*Check:* `tests/test_mail_replies.py` — closing an issue with two listed identifiers offers two replies,
found through the identifiers alone.

**A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN** *(PO A. Maier)*
A mail that an issue lists, or that the person marked *not an issue* in this browser, is not proposed
again.
*Check:* `tests/test_mail_import.py` — a second reading proposes no listed and no marked mail;
counter-proof: an unmarked new mail is proposed.

**THE PRODUCT ISSUE CARRIES NO PERSONAL DATA** *(PO A. Maier)*
An issue created from a mail contains no name, mail address, phone number or signature of anyone
named in the mail.
*Check:* `tests/test_mail_privacy.py` — deterministic: every address and display name from the mail's
headers, and every address and phone number found in its body, is absent from the issue text. How
often the participant's neutral text still contains personal data is measured as a rate on a fixed
set of mails (§4.0a rule 4), reported, not gated.

**A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK** *(PO A. Maier)*
An issue is created from a mail only as the direct result of a person's click on the proposed issue
text.
*Check:* `tests/test_mail_import.py` — a run without the click creates no issue; the participant's
job definition contains no issue-creating call.

**AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE** *(PO A. Maier)*
Every issue created from a mail is labelled either as a defect against the current SPEC or as a
request for changed behaviour.
*Check:* `tests/test_mail_import.py`

**A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL** *(PO A. Maier)*
A mail whose `In-Reply-To` or `References` names a mail that an issue lists is attached to that issue —
its identifier added to the issue's list — before any participant sees it.
*Check:* `tests/test_mail_import.py`

**A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE** *(PO A. Maier)*
A mail the person confirms as describing an existing issue adds its identifier to that issue instead of
creating a new one.
*Check:* `tests/test_mail_import.py`

**EVERY OUTGOING MAIL IS RELEASED BY A PERSON** *(PO A. Maier)*
Agent M sends a mail only as the direct result of a person's click on the complete mail shown to them —
recipients, subject, body and attachments.
*Check:* `tests/test_mail_routes.py` — on both routes, no send request is made without the click;
counter-proof: with it, exactly one.

**THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN** *(PO A. Maier)*
The bridge sends a mail only with a single-use confirmation that names the SHA-256 of the complete mail
shown to the person.
*Check:* `tests/test_bridge_mail.py` — sending mocked: without confirmation, with a reused one, or
with a body changed after the preview, zero SMTP calls.

**A REPLY IS THREADED ON THE REPORTER'S MAIL** *(PO A. Maier)*
A reply to a report carries that report's `Message-ID` in `In-Reply-To` and `References`, wherever the
reporter stands among the recipients.
*Check:* `tests/test_bridge_mail.py`

**A REPLY GOES TO ONE REPORTER** *(PO A. Maier)*
A reply to one report has no reporter of another report among its recipients.
*Check:* `tests/test_mail_replies.py` — an issue with three reports yields three mails, each with one
reporter.

**CLOSING AN ISSUE PREPARES ITS REPLIES** *(PO A. Maier)*
When an issue that lists mails is closed, the mail dashboard offers to draft a reply for every listed mail
that has no sent reply noted in the issue.
*Check:* `tests/test_mail_replies.py` — a closed issue listing two mails yields two offers; counter-proof:
with a reply noted for one, one offer.

**A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER** *(PO A. Maier)*
A reply drafted for a mail an issue lists is stored as a draft in the mailbox's *Drafts* folder, as a
reply to that mail, and nowhere else.
*Check:* `tests/test_mail_replies.py` — after drafting, the draft is in *Drafts* with `In-Reply-To`
set, and no write outside the mailbox contains its text.

**THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS** *(PO A. Maier)*
The send dashboard shows every draft in the *Drafts* folder that replies to a mail an issue lists.
*Check:* `tests/test_mail_replies.py` — a draft replying to a listed mail is shown; counter-proof: an
unrelated draft of the person is not.

**A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO** *(PO A. Maier)*
A reply to a listed mail found in the *Sent* folder is noted in the issue, whether it was sent from the
dashboard or from a mail program.
*Check:* `tests/test_mail_replies.py` — a reply placed in *Sent* by hand is noted at the next reading;
counter-proof: an unrelated sent mail is not.

**A SENT REPLY IS NOTED IN THE ISSUE** *(PO A. Maier)*
When a reply is sent, the issue receives a comment naming the mail's identifier and the date, and
nothing of the reply's text or recipient.
*Check:* `tests/test_mail_replies.py` — after sending, the issue has one comment with the identifier and
date and no address; counter-proof: no draft is offered for that mail again.

**AN ISSUE WAITING FOR A REPORTER IS LABELLED** *(PO A. Maier)*
An issue for which a question has been sent to a reporter carries the label `waiting-for-reporter` until
a person removes it.
*Check:* `tests/test_mail_replies.py`

**A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE** *(PO A. Maier)*
A mail answering an issue labelled `waiting-for-reporter` is shown under that issue in the mail
dashboard as *answer received*.
*Check:* `tests/test_mail_replies.py`

**A CLOSED ISSUE IS REOPENED ONLY BY A PERSON** *(PO A. Maier)*
A closed issue returns to open only by a person's click.
*Check:* `tests/test_mail_replies.py`

**THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED** *(PO A. Maier)*
Each mailbox connection names the processing places to which its mails may be given, and a
participant that processes data elsewhere is never given them.
*Check:* `tests/test_mail_privacy.py` — a mail is not sent to a participant whose processing place is
not listed; counter-proof: it is sent to one whose place is.

**A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT** *(PO A. Maier)*
When a processing place outside the European Union is allowed for a mailbox, the dashboard states,
before saving, that processing personal data there does not comply with the EU's rules — the GDPR
for transferring personal data, and the EU AI Act.
*Check:* `tests/test_settings_disclosure.py`

**NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY** *(PO A. Maier)*
No file, commit message, issue, comment or label that Agent M writes contains personal data taken from
a mail.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails — issue, backlog item, SPEC
proposal, regression test, job record, reply note —, no write contains any name,
address, phone number or account from those mails; counter-proof: a planted address in a job record is
found.

**A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE** *(PO A. Maier)*
Before Agent M writes text drawn from a mail — an issue's text, report data — to an issue tracker or a
repository, it searches the text for every name, mail address, phone number and account found in that
mail, and writes nothing while one is found.
*Check:* `tests/test_mail_privacy.py` — an issue text containing the sender's name, or a name from the
mail's signature, is refused and the hit named; counter-proof: the same text without the name passes.

**A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL** *(PO A. Maier)*
A job that writes to a repository is given the neutral issue and the report data as the issue holds it —
rewritten without persons unless the product switched that off —, never the text or attachments of a mail.
*Check:* `tests/test_mail_privacy.py` — the inputs of an implementation job started from a mail's issue
contain no text of the mail.

**REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS** *(PO A. Maier)*
Attachments, logs, error messages, screenshots' text and data files from a mail go into an issue or a
repository only as a participant's rewriting that mentions no person and keeps their technical content.
*Check:* `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP
address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof:
a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and
version is measured as a rate on a fixed set of reports, reported, not gated.

**A REWRITTEN TEXT IS CHECKED BY THREE LLMS** *(PO A. Maier)*
A text that a participant rewrites from a mail is written only after three LLM participants with three
different models, at places the mailbox allows, have each checked it for any mention of a person and none
of them has found one.
*Check:* `tests/test_mail_privacy.py` — with three fixture checkers of which one reports a name, nothing is
written and the finding goes back; counter-proof: when none reports one, the text is written. How often a
person passes all three is measured as a rate on a fixed set of mails, reported, not gated.

**NO CHECKER IS THE REWRITER** *(PO A. Maier)*
None of the three participants that check a rewritten text is the participant that rewrote it or uses its
model.
*Check:* `tests/test_mail_privacy.py` — a set of checkers that includes the rewriter, or a checker with the
rewriter's model, is refused before anything is sent; counter-proof: three checkers with three other models
are accepted.

**PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF** *(PO A. Maier)*
Rewriting report data without persons applies to every product whose settings do not switch it off.
*Check:* `tests/test_mail_privacy.py` — a product without the setting gets rewritten report data;
counter-proof: a product that switched it off gets the original data.

**SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS** *(PO A. Maier)*
Before a product's pseudonymisation is switched off, the dashboard states that report data will then
enter the product's issues and repository unchanged, that this is advisable only on a protected,
non-public data space, and — for a repository its server reports as public — that the data will be
published.
*Check:* `tests/test_settings_disclosure.py`

**A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT** *(PO A. Maier)*
A repository managed by Agent M names a person only by their account on its server, or by name if the
person is listed as consenting in the repository's `docs/collaborators.md`.
*Check:* `tests/test_collaborators.py` — a name in a generated artifact that is neither an account nor
in `docs/collaborators.md` is reported; counter-proof: a listed collaborator's name passes.
