## 14. Issues, mail and personal data

**THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE** *(PO A. Maier, 2026-09-24)*
Before a mailbox password is stored, Agent M states that every GitHub Pages site under the same
`<owner>.github.io` can read it, and what it grants: reading every mail of the mailbox and sending
mail in its name.
*Occasion:* PO decision 2026-09-24 — the password is kept in the browser's store and the shared
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
To show or answer a mail an issue lists, the bridge finds it in the mailbox by hashing the `Message-ID`s
of the folders the mailbox connection names — `INBOX` unless others are named.
*Occasion:* with the mailbox as the only store (`MAIL STAYS IN THE MAILBOX`), the identifier in the issue
must lead back to the mail. IMAP delivers the `Message-ID` headers of a folder in one read-only request;
hashing them is cheap. Mails the person has filed into other folders are found once those folders are
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

**EVERY OUTGOING MAIL IS RELEASED BY A PERSON** *(PO A. Maier, 2026-09-24)*
The bridge sends a mail only with a single-use confirmation from a person's click that names the
SHA-256 of the complete mail shown to them — recipients, subject, body and attachments.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §0.1 ("kein Auto-Reply") and §6.1 (explicit
click with confirmation, single-use nonce). Binding the confirmation to the hash makes the gate
structural: a participant can draft a mail, never send one, and a mail changed after the preview is
not the one released.
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
When an issue that lists mails is closed, the mail dashboard offers a reply draft for every listed mail
that has no sent reply noted in the issue.
*Occasion:* PO, 2026-09-29: "Closing the issue creates a reply in the mail dashboard; this is then sent
from the dashboard." An issue is often closed elsewhere — by a merged pull request —, so the drafts are
derived from the issue's state, not from a click in Agent M.
*Check:* `tests/test_mail_replies.py` — a closed issue listing two mails yields two drafts; counter-proof:
with a reply noted for one, one draft.

**A SENT REPLY IS NOTED IN THE ISSUE** *(PO A. Maier, 2026-09-29)*
When a reply is sent, the issue receives a comment naming the mail's identifier and the date, and
nothing of the reply's text or recipient.
*Occasion:* the note is the issue's own record that this reporter was answered
(`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`); the reply itself is in the mailbox's *Sent*
folder, threaded on the reporter's mail.
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

**EVERY WRITE IS SEARCHED FOR THE PEOPLE OF THE MAILS READ** *(PO A. Maier, 2026-09-29)*
Before Agent M writes text to a repository or an issue tracker, it searches the text for every name,
mail address, phone number and account found in the mails read so far, and writes nothing while one is
found.
*Occasion:* a check against the people actually known is deterministic and cannot be talked out of a hit
(`SOFTWARE_MAINTENANCE.md` §4.0a rule 3). It catches what the drafting participant and the person both
missed, at the last point before the data would leave.
*Check:* `tests/test_mail_privacy.py` — a write containing a reporter's name is refused and the hit named;
counter-proof: the same write with a surrogate passes.

**THE SEARCH LIST HOLDS ONLY HASHES** *(PO A. Maier, 2026-09-29)*
The list of names, addresses, phone numbers and accounts the search uses is kept in the browser as salted
hashes, never as the data itself.
*Occasion:* the browser's storage can be read by every Pages site of the same owner (`THE SHARED PAGES
ORIGIN IS DISCLOSED`); a plain list of every reporter would be exactly the data the search protects. A
text is checked by hashing its words and word groups the same way.
*Check:* `tests/test_mail_privacy.py` — the stored list contains no address in clear; counter-proof: a
text with a listed address is still found.

**A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL** *(PO A. Maier, 2026-09-28)*
A job that writes to a repository is given the neutral issue and pseudonymised report data, never the
text or attachments of a mail.
*Occasion:* only the participant that proposes an issue (UC-038) or drafts a reply (UC-039) reads mails,
and neither writes anywhere — a person decides. A coding agent that fixes the bug never needs to know
who reported it.
*Check:* `tests/test_mail_privacy.py` — the inputs of an implementation job started from a mail's issue
contain no text of the mail.

**REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX** *(PO A. Maier, 2026-09-29)*
Attachments, logs, screenshots' text and data files from a mail that go into an issue or a repository
have every personal datum replaced by a surrogate.
*Occasion:* PO, 2026-09-28: "bug report data should have personal information replaced with surrogates
such that we don't share personal information by accident". A log from a reporter's machine carries their
user name, paths and addresses; the bug is usually reproducible with *user1* and *user1@example.org*.
*Check:* `tests/test_mail_privacy.py` — a fixture log with name, address, phone number, IP address and
home-directory path yields surrogates for each; counter-proof: the technical content around them is
unchanged.

**A SURROGATE IS THE SAME WITHIN A REPORT** *(PO A. Maier, 2026-09-28)*
Within one report, the same personal datum is always replaced by the same surrogate.
*Occasion:* a log in which one user becomes three different surrogates no longer shows what happened;
consistency keeps the data useful for reproducing the bug.
*Check:* `tests/test_mail_privacy.py`

**THE SURROGATE MAPPING IS NEVER STORED** *(PO A. Maier, 2026-09-29)*
The mapping from surrogates back to personal data is written nowhere; the same surrogates are derived
again from the mail whenever they are needed.
*Occasion:* the mapping is the key that makes surrogates personal data again. Derived in order of
appearance from the mail, it gives the same surrogates every time, so there is nothing to keep — and
nothing that can leak.
*Check:* `tests/test_mail_privacy.py` — two pseudonymisations of the same mail give the same surrogates;
no write contains a mapping entry.

**PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF** *(PO A. Maier, 2026-09-28)*
Pseudonymisation of report data applies to every product whose settings do not switch it off.
*Occasion:* PO, 2026-09-28: "These requirements are very important in the EU; for the US it might not
matter as much; I would enable the anonymization layer by default but have an option to disable the
feature." The setting belongs to the product, in its own repository, where everyone working on it can
see which rule applies.
*Check:* `tests/test_mail_privacy.py` — a product without the setting gets surrogates; counter-proof: a
product that switched it off gets the original data.

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
