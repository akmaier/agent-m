---
id: MOD-mail-handling
title: Mail into issues, and closed issues into replies
folder: src/mail-handling/
realises:
follows:
  - ARC-044
uses:
  - MOD-mail-routes.Mailbox
  - MOD-mail-routes.Mail
  - MOD-mail-routes.ShownMail
  - MOD-mail-routes.DraftRef
  - MOD-mail-records.listedMailIds
  - MOD-mail-records.withMailIds
  - MOD-mail-records.noteText
  - MOD-mail-records.notesOf
  - MOD-mail-records.threadMatch
  - MOD-mail-records.undecided
  - MOD-mail-records.issueLabels
  - MOD-personal-data.peopleIn
  - MOD-personal-data.personHits
  - MOD-personal-data.People
  - MOD-repository-hosts.listIssues
  - MOD-repository-hosts.createIssue
  - MOD-repository-hosts.commentOnIssue
  - MOD-repository-hosts.setIssueLabels
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.RepositoryInfo
  - MOD-repository-hosts.listPullRequests
  - MOD-repository-hosts.listTags
  - MOD-browser-store.readSetting
  - MOD-browser-store.writeSetting
  - MOD-job-runner.Strategies
provides:
  - readNewMail
  - decideMail
  - repliesDue
  - storeReplies
  - sendReply
  - askReporter
  - noReply
  - mailStrategies
  - NewMail
  - MailDecision
  - RepliesDue
---
# MOD-mail-handling Mail into issues, and closed issues into replies

## Responsibility

It belongs to Issues and mail (ARC-044). It carries mails into the issues of the instance's products (UC-038) and closed
issues back to the people who reported them (UC-039): reading new mail and leaving out what is decided, attaching a
mail in a known thread at once, carrying out a person's decision on a mail, finding the replies due, storing drafted
replies in the mailbox, sending each only as the exact mail a person was shown, and noting every reply, question and
decision in the issue — identifier and date only. It offers the recipes and the writer of the kinds that propose issues
and draft replies. It runs in the browser: the mailbox connection and the browser's marks are there, and so are the
mails while they are handled.

## Parts

- `index.mjs` — the interface.
- `intake.mjs` — reading new mail and a person's decision on a mail.
- `replies.mjs` — the replies due, storing, sending and noting them, asking a reporter.
- `strategies.mjs` — the recipes `mail-batch` and `reply-inputs`, and the writer `mail-drafts`.

## Data

It keeps nothing: mails are held in memory while a page shows them; what a mail's handling leaves is in the issue, in the
forms of MOD-mail-records (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`); the identifiers marked *not an issue*
are kept by Access in this browser.

## Interfaces

- `NewMail` — `{ proposable: { mail: Mail, people: People }[], attached: { id: string, product: string, issue: number
  }[], decided: number }`: the mails to propose, each with its people, kept in memory for the checks; the mails attached
  to an issue of their thread; how many were left out as decided.
- `readNewMail(mailbox: Mailbox, products: { address: string, host: Host }[], marked: string[]) -> Promise<NewMail>` —
  reads the named folders without changing anything, names each mail by its identifier, reads the issues of every
  product and the identifiers they list, and leaves out every mail an issue lists or this browser marked *not an issue*
  (`A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN`). A mail whose `In-Reply-To` or `References` names a listed mail is
  attached to that issue at once — a `mail-added` note —, without any participant (`A MAIL IN A KNOWN THREAD IS MATCHED
  WITHOUT A MODEL`); a closed issue stays closed (`A CLOSED ISSUE IS REOPENED ONLY BY A PERSON`). Crosses the network to
  the mailbox and the repository servers. Errors: the mailbox's and Access's — nothing is read when the mailbox cannot
  be reached; an issue that cannot be written to is named, and its mail stays proposable.
- `MailDecision` — `{ kind: "create", product: string, title: string, text: string, label: "defect" | "change" } | {
  kind: "add", product: string, issue: number } | { kind: "not-an-issue" }`.
- `decideMail(mail: { id: string, people: People }, decision: MailDecision, host: Host | null) -> Promise<{ issue:
  number | null }>` — carries out the person's one click on a mail (`A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK`):
  *create* searches the title and text once more for the mail's people and refuses on a hit, then creates the issue in
  the product's tracker with the person's token, labelled `defect` or `change`, its text ending with the mail's
  identifier (`THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`, `AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE`); *add* lists
  the mail on an existing issue by a `mail-added` note (`A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE`); *not an
  issue* adds the identifier to this browser's marks. Errors: `PersonFound` with the hits — nothing written —, and
  Access's `TokenRefused` and `MissingPermission` naming the product.
- `RepliesDue` — `{ toAnswer: Due[], answerReceived: Due[], open: Due[] }`, where `Due` is `{ product: string, issue:
  number, closedBy: string | null, release: string | null, mails: { id: string, mail: Mail | null, draft: DraftRef |
  null, noted: boolean }[] }`; `mail` is `null` for a mail no longer in the named folders.
- `repliesDue(mailbox: Mailbox, products: { address: string, host: Host }[]) -> Promise<RepliesDue>` — every issue that
  lists mails, grouped: closed with a listed mail that has no note — whoever closed it (`CLOSING AN ISSUE PREPARES ITS
  REPLIES`); labelled `waiting-for-reporter` with a newer mail in the thread (`A REPORTER'S ANSWER IS SHOWN AT ITS
  ISSUE`); open. Each listed mail is found in the mailbox by its identifier, with its draft in Drafts if there is one
  (`THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS`). A reply found in Sent that no issue notes yet is noted in its
  issue now (`A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO`). Crosses the network; errors as `readNewMail`.
- `storeReplies(mailbox: Mailbox, replies: { mail: Mail, body: string }[]) -> Promise<{ id: string, draft: DraftRef |
  null, problem: string | null }[]>` — each reply stored as a draft in Drafts, threaded on its mail, addressed to that
  mail's reporter only, subject `Re:` its subject, the original quoted below it. A mail without a usable reply address
  gets no draft and the problem *not sendable*. Errors: the mailbox's.
- `sendReply(mailbox: Mailbox, host: Host, issue: number, id: string, shown: ShownMail) -> Promise<void>` — sends the draft
  only as `shown` (`EVERY OUTGOING MAIL IS RELEASED BY A PERSON`) and then notes `reply-sent` in the issue; when sending
  fails, nothing is noted and the draft stays (`A SENT REPLY IS NOTED IN THE ISSUE`). Errors: the mailbox's
  `DraftChanged`, `ConfirmationRefused`, `SendRefused`, and Access's when the note cannot be written — then the page names
  the reply as sent and not noted, and offers the note again.
- `askReporter(mailbox: Mailbox, host: Host, issue: number, id: string, shown: ShownMail) -> Promise<void>` — sends a
  question as `sendReply` sends a reply, labels the issue `waiting-for-reporter` and notes `question-sent`; the issue
  stays open (`AN ISSUE WAITING FOR A REPORTER IS LABELLED`). Errors: as `sendReply`.
- `noReply(host: Host, issue: number, id: string) -> Promise<void>` — notes the decision not to answer a mail. Errors:
  Access's.
- `mailStrategies` — of MOD-job-runner's type `Strategies`:
  - recipe `mail-batch` — for proposing issues: one part per chosen mail with its text, and the text of the attachments
    the person ticked for it; one part with the instance's products, each with the one-line `description` of its
    `RepositoryInfo`; one part with the titles and numbers of their open issues. Each mail's people go into the job's
    context for the check `people-search`, never into a part.
  - recipe `reply-inputs` — for drafting replies: the issue, what solved it — the closing pull request or commit, and the
    release that contains it, where known —, and each listed mail without a reply.
  - writer `mail-drafts` — the drafted texts stored as drafts through `storeReplies`; it sends nothing.

`Host` is the host Access's `connect` returns; `People` is MOD-personal-data's.

## Files

It writes no repository file. It writes issues, comments and labels in the products' trackers through Access, drafts in
the mailbox through MOD-mail-routes, and the marks *not an issue* through Access's browser store.

## Uses

- `MOD-mail-routes.Mailbox`, `MOD-mail-routes.Mail`, `MOD-mail-routes.ShownMail`, `MOD-mail-routes.DraftRef` — the
  mailbox, its mails and drafts.
- `MOD-mail-records.listedMailIds`, `withMailIds`, `noteText`, `notesOf`, `threadMatch`, `undecided`, `issueLabels` — the
  marks a mail's handling leaves in an issue.
- `MOD-personal-data.peopleIn`, `MOD-personal-data.personHits`, `MOD-personal-data.People` — the people of each mail,
  and the last search before an issue is created.
- `MOD-repository-hosts.listIssues`, `createIssue`, `commentOnIssue`, `setIssueLabels` — the products' issues with their
  comments, read and written with the person's token.
- `MOD-repository-hosts.repositoryInfo`, `RepositoryInfo` — each product's one-line `description`, for the recipe
  `mail-batch`.
- `MOD-repository-hosts.listPullRequests`, `MOD-repository-hosts.listTags` — what solved an issue, and the release that
  contains it.
- `MOD-browser-store.readSetting`, `MOD-browser-store.writeSetting` — the identifiers marked *not an issue*.
- `MOD-job-runner.Strategies` — the type of `mailStrategies`.
