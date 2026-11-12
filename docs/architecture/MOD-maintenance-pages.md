---
id: MOD-maintenance-pages
title: The pages of issues and mail
folder: src/maintenance-pages/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.runPanel
  - MOD-site-frame.confirmDecision
  - MOD-site-frame.schemaForm
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.openEditor
  - MOD-browser-store.readSetting
  - MOD-bridge-client.bridgeAt
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.listIssues
  - MOD-repository-hosts.readIssue
  - MOD-repository-hosts.setIssueState
  - MOD-repository-hosts.setIssueLabels
  - MOD-repository-hosts.commentOnIssue
  - MOD-repository-hosts.webLinks
  - MOD-repository-hosts.pullRequestFacts
  - MOD-documents.artifactSchemas
  - MOD-documents.readRegister
  - MOD-documents.readDocument
  - MOD-test-document.isTestFile
  - MOD-test-document.testDeclarations
  - MOD-mail-routes.mailbox
  - MOD-mail-routes.signIn
  - MOD-mail-records.listedMailIds
  - MOD-mail-records.notesOf
  - MOD-mail-records.noteText
  - MOD-personal-data.peopleIn
  - MOD-personal-data.personHits
  - MOD-personal-data.pseudonymisationOf
  - MOD-personal-data.settingsSchemas
  - MOD-personal-data.privacyStrategies
  - MOD-mail-handling.readNewMail
  - MOD-mail-handling.decideMail
  - MOD-mail-handling.repliesDue
  - MOD-mail-handling.storeReplies
  - MOD-mail-handling.sendReply
  - MOD-mail-handling.askReporter
  - MOD-mail-handling.noReply
  - MOD-mail-handling.mailStrategies
  - MOD-issue-handling.backlogItemFrom
  - MOD-issue-handling.moveToBacklog
  - MOD-issue-handling.closeWithLinks
  - MOD-issue-handling.issueStrategies
  - MOD-work-plans.backlogFindings
  - MOD-spec-changes.queues
  - MOD-spec-changes.entryView
  - MOD-spec-changes.specStrategies
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-participant-list.participantsOf
  - MOD-job-catalogue.kindOf
  - MOD-job-runner.prepareJob
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.recordsNewestFirst
  - MOD-runtimes.queueJob
  - MOD-runtimes.runOnTab
  - MOD-runtimes.liveState
  - MOD-runtimes.jobTrail
  - MOD-runtimes.routeStrategies
  - MOD-prompt-bar.Subject
  - MOD-prompt-bar.endpointsOffered
  - MOD-prompt-bar.sessionsOffered
provides:
  - view
---
# MOD-maintenance-pages The pages of issues and mail

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the menu entry Maintenance, on two tabs: **Mail** — mail
read into issues, and the replies to the mails of an issue, with the questions to reporters —, and **Issues** — a
product's issues, open and closed, each with the class its label gives: implementing it or closing it at once, the fix,
the move into the backlog. Everything a
mail contains stays in the mailbox and on this page; what is written to an issue passes Issues and mail's search for the
mail's people first, and every outgoing mail is sent only on the person's click on the complete mail shown.

It serves UC-012, UC-033, UC-038 and UC-039, and gives the prompt bar the subject of its pages (UC-049).

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`, the routes of routes.mjs with the strategies of the view's kinds.
- `routes.mjs` — the routes' heads, the view module the frame loads at start; it imports index.mjs, and with it the
  strategies, only when a job is prepared (`loadStrategies`).
- `tabs.mjs` — the strip of the entry's two tabs, which every route draws at its head: **Mail**, leading to `mail`, and
  **Issues**, leading to `issues`, the tab the route stands under marked as the current one; two links in the look's
  styles, with no style of its own.
- `issues.mjs` — issues, implementing or closing them, the fix and the move into the backlog.
- `mail.mjs` — reading mail into issues.
- `replies.mjs` — replies to answer, answers received, drafts, sending, asking a reporter.

## Data

It keeps nothing but the screen and a mail's text only while it is shown. Its formats are those of the modules it uses.

## Interfaces

- `view: View` — its routes, in the order of the tabs, so that the entry opens on Mail, the first of its routes
  (MOD-site-frame's `startPage`): under **Mail**, `mail`, `replies` and `replies/<issue>`; under **Issues**, `issues` and
  `issue/<number>`; and the strategies its kinds use in the tab — `issueStrategies`, `mailStrategies`,
  `privacyStrategies`, `specStrategies`, `routeStrategies`:
  - `issues`, `issue/<number>` — the product's issues, each with its class as its label `defect` or `change` gives it;
    *Implement*, which puts the request to handle the issue as UC-012
    does, with its number, title and text, into the prompt bar (MOD-prompt-bar's event `agent-m:prompt`); on an open
    issue, *Close*, which closes it at once without a change of code, with the reason the person typed as its comment
    (UC-012 2a); and, before
    its pull request is merged, for each existing test whose expected result the fix changes, the requirement it now
    checks correctly with the old and the new expectation side by side (UC-012 5a); *Move to backlog* with the item prefilled — its fields checked in a
    form while the person edits them —; *Add*, which writes the item and the issue's comment and label with
    `moveToBacklog`, or names the comment to copy
    when the token may not comment; closing an issue with links once its pull request is merged; for an issue that lists
    mails, each of its mails named by its identifier (`listedMailIds`), as a link to `mail/<id>`. The list reads the
    product's open and closed issues without their comments (`listIssues` with `state: "all"` and `comments: false`),
    each with its state; `issue/<number>` and `replies/<issue>` read their one issue with `readIssue`.
  - `mail`, `mail/<id>` — the mailbox read when the page is drawn and again every five minutes while it stays drawn, never while a
    reading runs. An inbox list in this browser only, the newest first, one line per mail with sender, subject and date:
    the proposable mails in bold, the attached and decided ones not, each of these with its issue or its mark *not an
    issue*; each mail that `repliesDue`, read with each reading, gives under `toAnswer` with `noted` false marked *to
    answer*, its details showing under the mail its reply as `replies/<issue>` shows the reply to that one mail — its
    draft, or the text boxes of a reply without one —, with *Draft replies* and its run panel over that mail, *Save
    draft*, *Send* with its confirmation and *No reply*; and a link *Replies* to
    `replies`. With `<id>`, a `MAIL-` identifier, the mail of that identifier is opened — the one of the list, or else
    the one the mailbox's `find` gives, a mail older than 30 days among them — as a mail clicked; one the mailbox does
    not hold is shown as *not found in the mailbox*. The mail clicked shows its details beside the list on a wide screen, and in place of the list, with a way
    back to it, on a narrow one: the mail in full and, for a proposable mail, its proposal, its text editable, every hit
    of the mail's people marked, *Create issue* — only without a hit —, *Add to #n*, *Not an issue*; after an issue of the kind *change* is created,
    *Propose SPEC change*, which puts the request to change the requirements as that issue asks into the prompt bar
    (MOD-prompt-bar's event `agent-m:prompt`). On the right, above the
    mail opened, the participant for the proposals, one select among those at places the mailbox allows, the first
    chosen, a place outside the EU named as not compliant; the run panel and *Propose*, for the mail opened while it is proposable — the mail and the product chosen for it,
    proposed in the name of the account of the instance's token. The author checks every text before it is written: the
    proposal's, and an attachment's, which *Add to the issue* puts into the text box — rewritten without persons where
    the product's pseudonymisation is on. Where this browser manages no product,
    the place of *Propose* says so — nothing can be proposed — and links *Add product* (UC-001). A later reading keeps the
    mail that is open, the proposals and their edits, the chosen participant and a running proposal; a mail decided
    leaves bold and shows its decision.
  - `replies`, `replies/<issue>` — closed issues with mails to answer, answers received, open issues; an issue with what
    solved it and each listed mail found in the mailbox with its draft; *Draft replies* with its run panel, or a reply
    written without a participant; each draft complete — recipient, subject, body, attachments — and editable; *Send* with
    its confirmation repeating recipient and subject; a reply sent but not noted, its note offered again; *No reply*; *Ask
    the reporter* — a question drafted with *Draft question*, the run panel of `draft-replies` with the person's point as
    its parameter `question`, or written by hand — and *Send and wait*; removing the label `waiting-for-reporter`; *Reopen* and *Leave closed* for a mail
    that arrived in a closed issue's thread; *Close and reply*. Where the mailbox's last test (`last-test:mailbox`)
    recorded a `sending` other than `"works"` — present, and naming why sending does not work —, the page says so, with
    that reason, beside *Send* and *Send and wait*, and offers both as before (UC-037 7d); a record without `sending`
    says nothing about sending.

  Each route gives the prompt bar its subject (UC-049 3b): on a route that shows mail, the
  page a participant is given holds the text of a mail, its sender and its attachments only for a participant whose
  processing place the mailbox allows and that does not declare *write to the repository* (`THE PLACES A MAILBOX'S MAIL
  MAY GO ARE CONFIGURED`, `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`), and only the mail's `MAIL-`
  identifier for any other; its `refuses` names `propose-edit` and `hand-over`, so that nothing of a mail reaches a file
  or a participant that writes; and its `withhold` names, for a message to be recorded, each name, mail address, phone
  number or account of that mail's people found in it, with `personHits`, and a passage of the mail's own text (`NO
  PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`, `MAIL STAYS IN THE MAILBOX`). The issues' routes give the issue as the page.

## Files

It writes nothing in a repository itself: every decision is one call of Issues and mail, or of the host — an issue's
state, its labels, a note offered again. It writes a job's start
record through MOD-runtimes. It reads the product's issues and snapshot, the mailbox through its route, and the
instance's participants.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.explain, MOD-site-frame.notice,
  MOD-site-frame.runPanel, MOD-site-frame.confirmDecision, MOD-site-frame.schemaForm — the frame's parts, the run panels,
  the dialog of every send, and the form of a backlog item.
- MOD-markdown-render.renderArtifact, MOD-markdown-render.openEditor — issues, mails and drafts, and their editing.
- MOD-prompt-bar.Subject — the subject its routes give the prompt bar; MOD-prompt-bar.endpointsOffered,
  MOD-prompt-bar.sessionsOffered — this browser's connections, which `participantsOf` joins with the instance's
  participants.
- MOD-browser-store.readSetting — the mailbox connection and its last test, the endpoints' configurations and the
  Bridges' settings;
  MOD-bridge-client.bridgeAt — a handle for each Bridge, handed to the runtimes.
- MOD-repository-hosts.parseAddress, MOD-repository-hosts.connect — the hosts of the instance's products, whose issues a
  mail may concern; MOD-repository-hosts.readSnapshot, MOD-repository-hosts.repositoryInfo,
  MOD-repository-hosts.listIssues — issues and what a job's context needs; MOD-repository-hosts.readIssue — the one
  issue the route `issue` and a reply show; MOD-repository-hosts.setIssueState —
  *Close*, *Close and reply*, *Reopen*; MOD-repository-hosts.setIssueLabels — the label `waiting-for-reporter` removed;
  MOD-repository-hosts.commentOnIssue — a note offered again, and the reason of an issue closed at once; MOD-repository-hosts.webLinks — an issue's page.
- MOD-job-ledger.recordsNewestFirst, MOD-runtimes.jobTrail — an issue's fix: the newest `fix-bug` job whose `works_on`
  names the issue, and the pull request of its branch, which the job's trail gives; the same link serves *closing an
  issue with links once its pull request is merged*. MOD-repository-hosts.pullRequestFacts — that pull request before it
  is merged, with the texts of its changed files on both sides; MOD-test-document.isTestFile,
  MOD-test-document.testDeclarations — the existing tests among those files, and each one's requirement and expected
  result, old and new, side by side (UC-012 5a).
- MOD-documents.artifactSchemas — the item's schema for its form; MOD-documents.readRegister — the participant list;
  MOD-documents.readDocument — the product's `docs/settings.md`, with `settingsSchemas`.
- MOD-mail-routes.mailbox, MOD-mail-routes.signIn — the mailbox, a mail found in it by its identifier (`find`), and
  signing in again when the provider's sign-in has expired.
- MOD-mail-records.listedMailIds, MOD-mail-records.notesOf, MOD-mail-records.noteText — an issue's mails, its notes, and
  the text of a note offered again.
- MOD-personal-data.peopleIn — the people of a mail `repliesDue` gives, which carries none;
  MOD-personal-data.personHits, MOD-personal-data.pseudonymisationOf — the hits of the mail's people, and whether the
  product rewrites report data; MOD-personal-data.settingsSchemas —
  the schema `docs/settings.md` is read with, for `pseudonymisationOf`.
- MOD-mail-handling.readNewMail, MOD-mail-handling.decideMail, MOD-mail-handling.repliesDue,
  MOD-mail-handling.storeReplies, MOD-mail-handling.sendReply, MOD-mail-handling.askReporter,
  MOD-mail-handling.noReply — every decision on a mail and a reply.
- MOD-issue-handling.backlogItemFrom, MOD-issue-handling.moveToBacklog, MOD-issue-handling.closeWithLinks — the move
  into the backlog and closing an issue with links.
- MOD-work-plans.backlogFindings — the item's marks while the person edits it; MOD-spec-changes.queues — the change's
  entries, those whose `issue` names the number of the issue shown and the address of the product the frame has chosen;
  MOD-spec-changes.entryView — the requirements each of them changes or adds, its `impact`, given to
  `backlogItemFrom` as `changed`, since an entry's anchor is the heading of a whole section, not a requirement's name.
- MOD-participant-list.participantSchema, MOD-participant-list.participantsOf, MOD-participant-list.eligible — the
  participants of the register on this browser's connections, and who may propose, rewrite, check or draft.
- MOD-job-catalogue.kindOf, MOD-job-runner.prepareJob — the run panels; MOD-job-ledger.newJobId, MOD-runtimes.queueJob,
  MOD-runtimes.runOnTab, MOD-runtimes.liveState — running the kinds of this page on their routes.
- MOD-issue-handling.issueStrategies, MOD-mail-handling.mailStrategies, MOD-personal-data.privacyStrategies,
  MOD-spec-changes.specStrategies, MOD-runtimes.routeStrategies — the strategies of its kinds, handed to the frame.
