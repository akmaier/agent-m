## 14. Issues and mail

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
they see there. Taken over from `ticket_db.ingest` (read-only select, `BODY.PEEK`). Flags are set only
by `THE MAILBOX FLAG MARKS WHAT IS OPEN`.
*Check:* `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`,
`MOVE`, `EXPUNGE` and no non-peek `FETCH`.

**A MAIL IS RECORDED ONCE** *(PO A. Maier, 2026-09-24)*
A mail whose `Message-ID` is already in the private tracker is not recorded again.
*Occasion:* reading the mailbox twice must not produce a second report or a second proposal for the
same mail. Taken over from `ticket_db.py` (`UNIQUE(service, message_id)`; a mail without an ID is
keyed by the SHA-256 of its bytes).
*Check:* `tests/test_mail_import.py`

**MAIL STAYS IN THE PRIVATE TRACKER** *(PO A. Maier, 2026-09-24)*
The text of a mail, its sender, its reply address and its attachments are written only to the private
tracker.
*Occasion:* PO decision 2026-09-24 — mails carry personal data; the private tracker keeps the report
and whom to answer, the product's tracker gets a neutral issue. Mirrors `SOFTWARE_MAINTENANCE.md`
§0.5: personal data stays local.
*Check:* `tests/test_mail_privacy.py` — after a full run on test mails, no write to the product or the
instance repository contains a sender address, a sender name, the body of a mail as a whole, or
one of its attachments. (A technical detail such as an error message may reach the issue through the
neutral text the person confirmed.)

**THE PRIVATE TRACKER IS NOT PUBLIC** *(PO A. Maier, 2026-09-24)*
Agent M accepts as private tracker only a repository whose visibility is private, or a folder on the
bridge's machine.
*Occasion:* PO decision 2026-09-24 names exactly these two places. A public repository — the instance
is a public fork — would publish every mail, and the history would keep it after deletion.
*Check:* `tests/test_mail_privacy.py` — a repository reported as public or internal is refused before
anything is written; counter-proof with a private one.

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

**A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL** *(PO A. Maier, 2026-09-24)*
A mail whose `In-Reply-To` or `References` names a mail already in the private tracker is attached to
that mail's report, before any participant sees it.
*Occasion:* what can be decided without a model is decided without one (`SOFTWARE_MAINTENANCE.md`
§4.0a rule 3). A reporter's answer to a question must land at their issue, not become a new one.
*Check:* `tests/test_mail_import.py`

**A DUPLICATE MAIL ADDS A REPORT, NOT AN ISSUE** *(PO A. Maier, 2026-09-24)*
A mail the person confirms as describing an existing issue is recorded as a further report of that
issue instead of creating a new one.
*Occasion:* several people report the same fault; each must be answered when it is solved — "keeping
track who to reply". Same pattern as `A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`.
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

**A SECOND REPLY NEEDS A SECOND CONFIRMATION** *(PO A. Maier, 2026-09-24)*
When the private tracker already records a reply to a report, another reply to it is sent only after
an additional confirmation that names the earlier reply.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 (`already_replied`, enforced on the server
side), where accidental second answers had been sent.
*Check:* `tests/test_bridge_mail.py`

**A REPLY IS THREADED ON THE REPORTER'S MAIL** *(PO A. Maier, 2026-09-24)*
A reply to a report carries that report's `Message-ID` in `In-Reply-To` and `References`, wherever the
reporter stands among the recipients.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6 and `DER THREAD-ANKER IST DER MELDER`
(§6.1). The reporter's answer then arrives in the same thread, which
`A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL` relies on.
*Check:* `tests/test_bridge_mail.py`

**A REPLY GOES TO ONE REPORTER** *(PO A. Maier, 2026-09-24)*
A reply to one report has no reporter of another report among its recipients.
*Occasion:* several people often report the same fault (`A DUPLICATE MAIL ADDS A REPORT, NOT AN
ISSUE`). One mail to all of them would give each reporter the others' addresses — personal data
disclosed by the tool meant to keep it private.
*Check:* `tests/test_mail_replies.py` — an issue with three reports yields three mails, each with one
reporter.

**EVERY REPORT OF A CLOSED ISSUE IS OFFERED A REPLY** *(PO A. Maier, 2026-09-24)*
For every report whose issue is closed and which has no reply yet, the dashboard offers a reply draft.
*Occasion:* "keeping track who to reply once the issue was solved". An issue is often closed
elsewhere — by a merged pull request —, so the offer is derived from the issue's state, not from a
click in Agent M.
*Check:* `tests/test_mail_replies.py`

**AN ANSWER ENDS THE DEFERRAL** *(PO A. Maier, 2026-09-24)*
An issue counts as deferred only while no mail has arrived in the thread of one of its reports since
it was deferred.
*Occasion:* "defer issues until a reply is received". Derived rather than stored, the deferral ends by
itself when the answer is read — as `STATUS IS DERIVED FROM THE RECORDS` does for approvals — and no
write to the product's tracker is needed.
*Check:* `tests/test_mail_replies.py`

**A CLOSED ISSUE IS REOPENED ONLY BY A PERSON** *(PO A. Maier, 2026-09-24)*
A closed issue returns to open only by a person's click.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §6.1 ("kein Reopen terminaler Tickets"). A
reporter's "thank you" in the thread of a solved issue must not reopen it; the mail is shown, the
person decides.
*Check:* `tests/test_mail_replies.py`

**THE MAILBOX FLAG MARKS WHAT IS OPEN** *(PO A. Maier, 2026-09-24)*
The original mail of a report whose issue is open or deferred carries the IMAP flag `\Flagged`; the
original mail of a report whose issue is closed does not.
*Occasion:* taken over from `SOFTWARE_MAINTENANCE.md` §9 (option A): in common mail clients
`\Flagged` is the follow-up flag, so the mailbox itself shows what is still to do. Standard IMAP has
no "completed" mark; *no flag* means done.
*Check:* `tests/test_bridge_mail.py` — IMAP mocked: open → `+FLAGS`, closed → `-FLAGS`, repeated sync
is a no-op.
