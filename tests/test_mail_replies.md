# Mail Replies Release Cases

The cases of `tests/test_mail_replies.py`. Every identifier below was computed outside the code under test: `MAIL-` and the
first sixteen hex digits of the SHA-256 of the UTF-8 text between the angle brackets of a `Message-ID` (SPEC
`A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`). Five mails are used throughout:

| Key | Message-ID | Identifier |
|---|---|---|
| A | `<sample@example.invalid>` | `MAIL-ca171c6d1e8e76f0` |
| B | `<other@example.invalid>` | `MAIL-f9f8e80f54bb5fa3` |
| C | `<third@example.invalid>` | `MAIL-327d1b3c6e47dfc8` |
| D | `<fourth@example.invalid>` | `MAIL-15192047a5b7d4c1` |
| E | `<fifth@example.invalid>` | `MAIL-4bbaa9c39cbf4f0e` |

**How a case reads.** `given` is its precondition. `input` holds the mails by key (`mails`), the issues of the product as the
repository host lists them (`issues`: number, state, labels, body, comments), the mails the mailbox finds by identifier
(`found`), what Drafts, Sent and a new reading hold (`drafts`, `sent`, `read`), the day the clock shows (`today`), and the
`steps` the case carries out in order. `expected` names only what the case asserts, out of: `results` (one per step; a
`repliesDue` result lists the issues of each group with `closedBy` and, per listed mail, whether the mailbox `found` it, the
`draft` it shows and whether a reply is `noted`), `issues` (their state and labels at the end), `added` (the comments written,
as issue and text), `labelCalls`, `stateCalls` (a call that changes an issue's state), `hostCalls`, `mailboxCalls`, `finds`,
`order`, `recipients` (of each stored draft), `draftUids`, `draftThreads` (the `In-Reply-To` of each draft in Drafts),
`draftBodies` and `storage` (reads and writes of the browser's storage, and requests to the network). The fake mailbox threads a
stored draft on the `Message-ID` of the mail it replies to, as MOD-mail-routes' `storeDraft` does.

## THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING

### Clearing the browser's storage changes no group

```json
{
  "given": "Issue 8 is closed and lists A and B, with a reply noted for B. Issue 9 is open and lists C. Issue 10 is open, labelled waiting-for-reporter, lists D, has a question noted for D and E added after it. The storage of the browser holds, in the first reading, every identifier and the words reply-sent and waiting-for-reporter, and in the second reading nothing.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" },
      "C": { "id": "MAIL-327d1b3c6e47dfc8", "messageId": "<third@example.invalid>", "from": "gerda@example.invalid" },
      "D": { "id": "MAIL-15192047a5b7d4c1", "messageId": "<fourth@example.invalid>", "from": "hans@example.invalid" },
      "E": { "id": "MAIL-4bbaa9c39cbf4f0e", "messageId": "<fifth@example.invalid>", "from": "hans@example.invalid" }
    },
    "found": ["A", "B", "C", "D", "E"],
    "storageText": "MAIL-ca171c6d1e8e76f0 MAIL-f9f8e80f54bb5fa3 MAIL-327d1b3c6e47dfc8 MAIL-15192047a5b7d4c1 MAIL-4bbaa9c39cbf4f0e reply-sent waiting-for-reporter",
    "issues": [
      { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`",
        "comments": [ { "body": "Reply sent to `MAIL-f9f8e80f54bb5fa3` on 2026-10-12." } ] },
      { "number": 9, "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`" },
      { "number": 10, "labels": ["waiting-for-reporter"], "body": "Export fails.\n\nMails: `MAIL-15192047a5b7d4c1`",
        "comments": [ { "body": "Question sent to `MAIL-15192047a5b7d4c1` on 2026-10-12." }, { "body": "Mail `MAIL-4bbaa9c39cbf4f0e` added on 2026-10-14." } ] }
    ],
    "steps": [ { "do": "repliesDue", "storage": "full" }, { "do": "repliesDue", "storage": "cleared" } ]
  },
  "expected": {
    "results": [
      {
        "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
          { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": true } ] } ],
        "answerReceived": [ { "issue": 10, "closedBy": null, "mails": [
          { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-4bbaa9c39cbf4f0e", "found": true, "draft": null, "noted": false } ] } ],
        "open": [ { "issue": 9, "closedBy": null, "mails": [ { "id": "MAIL-327d1b3c6e47dfc8", "found": true, "draft": null, "noted": false } ] } ]
      },
      {
        "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
          { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": true } ] } ],
        "answerReceived": [ { "issue": 10, "closedBy": null, "mails": [
          { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-4bbaa9c39cbf4f0e", "found": true, "draft": null, "noted": false } ] } ],
        "open": [ { "issue": 9, "closedBy": null, "mails": [ { "id": "MAIL-327d1b3c6e47dfc8", "found": true, "draft": null, "noted": false } ] } ]
      }
    ],
    "storage": { "reads": 0, "writes": [], "fetches": [] }
  }
}
```

## AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS

### Closing an issue with two listed identifiers offers two replies, found through the identifiers alone

```json
{
  "given": "Issue 8 is closed and lists A and B in its Mails line; no note yet. The mailbox finds a mail only when it is asked for its identifier.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid", "subject": "Second report" }
    },
    "found": ["A", "B"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`" } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
        { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": false } ] } ],
      "answerReceived": [], "open": [] } ],
    "finds": ["MAIL-ca171c6d1e8e76f0", "MAIL-f9f8e80f54bb5fa3"],
    "mailboxCalls": ["drafts", "sent", "find", "find"]
  }
}
```

### A further report added by a note is listed with the first

```json
{
  "given": "Issue 8 is closed. Its Mails line lists A; a comment says that B was added on 2026-10-14.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" }
    },
    "found": ["A", "B"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
      "comments": [ { "body": "Mail `MAIL-f9f8e80f54bb5fa3` added on 2026-10-14." } ] } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
        { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": false } ] } ],
      "answerReceived": [], "open": [] } ],
    "finds": ["MAIL-ca171c6d1e8e76f0", "MAIL-f9f8e80f54bb5fa3"]
  }
}
```

## A REPLY GOES TO ONE REPORTER

### An issue with three reports yields three drafts, each to one reporter

```json
{
  "given": "An issue lists three reports: A from erika, with frank in Cc; B from frank, whose Reply-To names frank-reply; C from gerda, with erika and frank in Cc. A reply text is written for each.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid", "cc": ["frank@example.invalid"] },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid", "replyTo": ["frank-reply@example.invalid"] },
      "C": { "id": "MAIL-327d1b3c6e47dfc8", "messageId": "<third@example.invalid>", "from": "gerda@example.invalid", "cc": ["erika@example.invalid", "frank@example.invalid"] }
    },
    "issues": [],
    "steps": [ { "do": "storeReplies", "replies": [
      { "mail": "A", "body": "Fixed in 2026.4." }, { "mail": "B", "body": "Fixed in 2026.4." }, { "mail": "C", "body": "Fixed in 2026.4." } ] } ]
  },
  "expected": {
    "results": [ [
      { "id": "MAIL-ca171c6d1e8e76f0", "drafted": true, "problem": null },
      { "id": "MAIL-f9f8e80f54bb5fa3", "drafted": true, "problem": null },
      { "id": "MAIL-327d1b3c6e47dfc8", "drafted": true, "problem": null } ] ],
    "recipients": [ ["erika@example.invalid"], ["frank-reply@example.invalid"], ["gerda@example.invalid"] ]
  }
}
```

### A report without a usable address gets no draft and no other reporter in its place

```json
{
  "given": "Two reports: A from erika, and B whose sender address is empty and which has no Reply-To.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "" }
    },
    "issues": [],
    "steps": [ { "do": "storeReplies", "replies": [ { "mail": "A", "body": "Fixed." }, { "mail": "B", "body": "Fixed." } ] } ]
  },
  "expected": {
    "results": [ [
      { "id": "MAIL-ca171c6d1e8e76f0", "drafted": true, "problem": null },
      { "id": "MAIL-f9f8e80f54bb5fa3", "drafted": false, "problem": "not sendable" } ] ],
    "recipients": [ ["erika@example.invalid"] ]
  }
}
```

## CLOSING AN ISSUE PREPARES ITS REPLIES

### A closed issue listing two mails yields two offers

```json
{
  "given": "Issue 8 is closed and lists A and B; no comment says how it was closed, so it was closed elsewhere; no reply is noted.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" }
    },
    "found": ["A", "B"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`" } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
        { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": false } ] } ],
      "answerReceived": [], "open": [] } ]
  }
}
```

### With a reply noted for one mail, one offer

```json
{
  "given": "The same issue 8, with a comment that a reply was sent to B on 2026-10-12.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" }
    },
    "found": ["A", "B"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`",
      "comments": [ { "body": "Reply sent to `MAIL-f9f8e80f54bb5fa3` on 2026-10-12." } ] } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
        { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": true } ] } ],
      "answerReceived": [], "open": [] } ]
  }
}
```

### With a reply or a decision not to answer noted for every mail, the issue offers nothing

```json
{
  "given": "The same issue 8 closed by a merged pull request, with a reply noted for A and a decision not to answer noted for B.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" }
    },
    "found": ["A", "B"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`",
      "comments": [ { "body": "Closed with https://github.com/example/thesis-tool/pull/31; item `ITM-123`." },
        { "body": "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." }, { "body": "No reply to `MAIL-f9f8e80f54bb5fa3`, decided on 2026-10-12." } ] } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ { "toAnswer": [], "answerReceived": [], "open": [] } ]
  }
}
```

## A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER

### After drafting, the draft is in Drafts with In-Reply-To set, and no write outside the mailbox contains its text

```json
{
  "given": "A reply text 'It is fixed in 2026.4.' for A. Drafts is empty. Writing to the browser's storage and sending a request to the network are both recorded.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "issues": [],
    "steps": [ { "do": "storeReplies", "replies": [ { "mail": "A", "body": "It is fixed in 2026.4." } ] } ]
  },
  "expected": {
    "results": [ [ { "id": "MAIL-ca171c6d1e8e76f0", "drafted": true, "problem": null } ] ],
    "draftThreads": ["<sample@example.invalid>"],
    "draftBodies": ["It is fixed in 2026.4.\n\n> Hello,\n> the export fails with an error.\n> Kind regards"],
    "mailboxCalls": ["storeDraft"],
    "hostCalls": [],
    "storage": { "reads": 0, "writes": [], "fetches": [] }
  }
}
```

## THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS

### A draft replying to a listed mail is shown; an unrelated draft of the person is not

```json
{
  "given": "Issue 8 is closed and lists A and B; issue 9 is open and lists C. Drafts holds draft 5 replying to A, draft 7 replying to C, and draft 6 replying to <stranger@example.invalid>, which no issue lists.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" },
      "C": { "id": "MAIL-327d1b3c6e47dfc8", "messageId": "<third@example.invalid>", "from": "gerda@example.invalid" }
    },
    "found": ["A", "B", "C"],
    "drafts": [
      { "uid": 5, "inReplyTo": "<sample@example.invalid>" },
      { "uid": 6, "inReplyTo": "<stranger@example.invalid>" },
      { "uid": 7, "inReplyTo": "<third@example.invalid>" }
    ],
    "issues": [
      { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`, `MAIL-f9f8e80f54bb5fa3`" },
      { "number": 9, "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`" }
    ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": 5, "noted": false },
        { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": false } ] } ],
      "answerReceived": [],
      "open": [ { "issue": 9, "closedBy": null, "mails": [ { "id": "MAIL-327d1b3c6e47dfc8", "found": true, "draft": 7, "noted": false } ] } ] } ]
  }
}
```

## A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO

### A reply placed in Sent by hand is noted at the next reading

```json
{
  "given": "Issue 8 is closed and lists A; no reply is noted. Sent holds a reply to A dated 2026-10-17 (In-Reply-To the Message-ID of A) and an unrelated sent mail dated 2026-10-17. The issue is read twice.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "R": { "id": "MAIL-8888888888888888", "messageId": "<reply@example.invalid>", "from": "reports@example.invalid", "inReplyTo": "<sample@example.invalid>", "references": ["<sample@example.invalid>"], "date": "2026-10-17T15:30:00Z" },
      "U": { "id": "MAIL-7777777777777777", "messageId": "<else@example.invalid>", "from": "reports@example.invalid", "inReplyTo": "<stranger@example.invalid>", "date": "2026-10-17T16:00:00Z" }
    },
    "found": ["A"],
    "sent": ["R", "U"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "repliesDue" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [
      { "toAnswer": [], "answerReceived": [], "open": [] },
      { "toAnswer": [], "answerReceived": [], "open": [] }
    ],
    "added": [ [8, "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-17."] ]
  }
}
```

### A reply that names the listed mail only in References is noted too

```json
{
  "given": "Issue 8 is closed and lists A. Sent holds a mail dated 2026-10-16 whose In-Reply-To names <middle@example.invalid>, a message no issue lists, and whose References name <sample@example.invalid> after it.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "R": { "id": "MAIL-8888888888888888", "messageId": "<reply@example.invalid>", "from": "reports@example.invalid", "inReplyTo": "<middle@example.invalid>", "references": ["<sample@example.invalid>", "<middle@example.invalid>"], "date": "2026-10-16T09:00:00Z" }
    },
    "found": ["A"],
    "sent": ["R"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ { "toAnswer": [], "answerReceived": [], "open": [] } ],
    "added": [ [8, "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-16."] ]
  }
}
```

### An unrelated sent mail is not noted

```json
{
  "given": "Issue 8 is closed and lists A. Sent holds only a mail replying to <stranger@example.invalid>, which no issue lists.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "U": { "id": "MAIL-7777777777777777", "messageId": "<else@example.invalid>", "from": "reports@example.invalid", "inReplyTo": "<stranger@example.invalid>", "date": "2026-10-17T16:00:00Z" }
    },
    "found": ["A"],
    "sent": ["U"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [ { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false } ] } ],
      "answerReceived": [], "open": [] } ],
    "added": []
  }
}
```

## A SENT REPLY IS NOTED IN THE ISSUE

### After sending, the issue has one comment with the identifier and the date and no address

```json
{
  "given": "Issue 8 is closed and lists A; draft 5 replies to A. The person was shown the mail to erika@example.invalid with subject 'Re: Export fails' and the body 'Fixed in 2026.4.'; the mailbox sends it on 2026-10-18.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "found": ["A"],
    "drafts": [ { "uid": 5, "inReplyTo": "<sample@example.invalid>" } ],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "sendReply", "issue": 8, "mail": "A", "shown": {
      "ref": { "route": "bridge", "uid": 5, "uidValidity": 7 }, "sha256": "abababababababababababababababababababababababababababababababab",
      "from": { "name": null, "address": "reports@example.invalid" }, "to": [ { "name": "Erika Mustermann", "address": "erika@example.invalid" } ], "cc": [],
      "subject": "Re: Export fails", "body": "Fixed in 2026.4.", "attachments": [] } } ]
  },
  "expected": {
    "results": [ { "error": null, "sentAsShown": true } ],
    "added": [ [8, "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-18."] ],
    "order": ["mailbox.sendDraft", "host.commentOnIssue"],
    "draftUids": []
  }
}
```

### After sending, no draft is offered for that mail again

```json
{
  "given": "The same issue 8 and draft 5; the reply is sent, and the replies due are read again.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "found": ["A"],
    "drafts": [ { "uid": 5, "inReplyTo": "<sample@example.invalid>" } ],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "repliesDue" }, { "do": "sendReply", "issue": 8, "mail": "A" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [
      { "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [ { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": 5, "noted": false } ] } ], "answerReceived": [], "open": [] },
      { "error": null, "sentAsShown": true },
      { "toAnswer": [], "answerReceived": [], "open": [] }
    ]
  }
}
```

### A refused send notes nothing and the draft stays

```json
{
  "given": "The same issue 8 and draft 5; the mailbox refuses the send with SendRefused.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "found": ["A"],
    "drafts": [ { "uid": 5, "inReplyTo": "<sample@example.invalid>" } ],
    "sendFails": "SendRefused",
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "sendReply", "issue": 8, "mail": "A" } ]
  },
  "expected": {
    "results": [ { "error": "SendRefused", "sentAsShown": true } ],
    "added": [],
    "order": ["mailbox.sendDraft"],
    "draftUids": [5]
  }
}
```

## AN ISSUE WAITING FOR A REPORTER IS LABELLED

### A question sent to a reporter labels the open issue and leaves it open

```json
{
  "given": "Issue 8 is open and lists A; the person sends a question about A, then the replies due are read.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "found": ["A"],
    "drafts": [ { "uid": 5, "inReplyTo": "<sample@example.invalid>" } ],
    "issues": [ { "number": 8, "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "askReporter", "issue": 8, "mail": "A" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [
      { "error": null, "sentAsShown": true },
      { "toAnswer": [], "answerReceived": [], "open": [ { "issue": 8, "closedBy": null, "mails": [ { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false } ] } ] }
    ],
    "issues": [ { "number": 8, "state": "open", "labels": ["waiting-for-reporter"] } ],
    "added": [ [8, "Question sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-18."] ],
    "labelCalls": [ [8, { "add": ["waiting-for-reporter"] }] ],
    "stateCalls": [],
    "order": ["mailbox.sendDraft", "host.setIssueLabels", "host.commentOnIssue"]
  }
}
```

### The label stays until a person removes it

```json
{
  "given": "Issue 11 is open, labelled waiting-for-reporter, lists A, has a question noted for A and D added after it. The replies due are read, the decision not to answer D is noted, and they are read again.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "D": { "id": "MAIL-15192047a5b7d4c1", "messageId": "<fourth@example.invalid>", "from": "erika@example.invalid" }
    },
    "found": ["A", "D"],
    "issues": [ { "number": 11, "labels": ["waiting-for-reporter"], "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
      "comments": [ { "body": "Question sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." }, { "body": "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-14." } ] } ],
    "steps": [ { "do": "repliesDue" }, { "do": "noReply", "issue": 11, "mail": "D" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "issues": [ { "number": 11, "state": "open", "labels": ["waiting-for-reporter"] } ],
    "labelCalls": [],
    "added": [ [11, "No reply to `MAIL-15192047a5b7d4c1`, decided on 2026-10-18."] ]
  }
}
```

### A refused question labels nothing

```json
{
  "given": "Issue 8 is open and lists A; the mailbox refuses the question with SendRefused.",
  "input": {
    "today": "2026-10-18",
    "mails": { "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" } },
    "found": ["A"],
    "sendFails": "SendRefused",
    "issues": [ { "number": 8, "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`" } ],
    "steps": [ { "do": "askReporter", "issue": 8, "mail": "A" } ]
  },
  "expected": {
    "results": [ { "error": "SendRefused", "sentAsShown": true } ],
    "issues": [ { "number": 8, "state": "open", "labels": [] } ],
    "labelCalls": [],
    "added": []
  }
}
```

## A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE

### A mail answering a waiting issue is shown under it as answer received

```json
{
  "given": "Issue 11 is open, labelled waiting-for-reporter, lists A; a question was sent for A on 2026-10-12, and D was added on 2026-10-14. The mailbox finds both.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "D": { "id": "MAIL-15192047a5b7d4c1", "messageId": "<fourth@example.invalid>", "from": "erika@example.invalid", "inReplyTo": "<sample@example.invalid>", "subject": "Re: Export fails" }
    },
    "found": ["A", "D"],
    "issues": [ { "number": 11, "labels": ["waiting-for-reporter"], "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
      "comments": [ { "body": "Question sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." }, { "body": "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-14." } ] } ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [],
      "answerReceived": [ { "issue": 11, "closedBy": null, "mails": [
        { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false },
        { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false } ] } ],
      "open": [] } ]
  }
}
```

### Without the answer, the label or the order, the issue stays open

```json
{
  "given": "Issue 12 is labelled and has only its question. Issue 13 is not labelled and has a mail added after its question. Issue 14 is labelled and has a mail added before its question.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "B": { "id": "MAIL-f9f8e80f54bb5fa3", "messageId": "<other@example.invalid>", "from": "frank@example.invalid" },
      "C": { "id": "MAIL-327d1b3c6e47dfc8", "messageId": "<third@example.invalid>", "from": "gerda@example.invalid" },
      "D": { "id": "MAIL-15192047a5b7d4c1", "messageId": "<fourth@example.invalid>", "from": "hans@example.invalid" }
    },
    "found": ["A", "B", "C", "D"],
    "issues": [
      { "number": 12, "labels": ["waiting-for-reporter"], "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
        "comments": [ { "body": "Question sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." } ] },
      { "number": 13, "body": "Export fails.\n\nMails: `MAIL-f9f8e80f54bb5fa3`",
        "comments": [ { "body": "Question sent to `MAIL-f9f8e80f54bb5fa3` on 2026-10-12." }, { "body": "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-14." } ] },
      { "number": 14, "labels": ["waiting-for-reporter"], "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`",
        "comments": [ { "body": "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-10." }, { "body": "Question sent to `MAIL-327d1b3c6e47dfc8` on 2026-10-12." } ] }
    ],
    "steps": [ { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [ {
      "toAnswer": [],
      "answerReceived": [],
      "open": [
        { "issue": 12, "closedBy": null, "mails": [ { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": false } ] },
        { "issue": 13, "closedBy": null, "mails": [
          { "id": "MAIL-f9f8e80f54bb5fa3", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false } ] },
        { "issue": 14, "closedBy": null, "mails": [
          { "id": "MAIL-327d1b3c6e47dfc8", "found": true, "draft": null, "noted": false },
          { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false } ] }
      ] } ]
  }
}
```

## A CLOSED ISSUE IS REOPENED ONLY BY A PERSON

### A mail added to a closed issue is offered and the issue stays closed

```json
{
  "given": "Issue 8 is closed and lists A, with a reply noted for A and D added on 2026-10-14 (a thank-you). The replies due are read, the decision not to answer D is noted, and they are read again.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "D": { "id": "MAIL-15192047a5b7d4c1", "messageId": "<fourth@example.invalid>", "from": "erika@example.invalid", "inReplyTo": "<sample@example.invalid>", "subject": "Thanks" }
    },
    "found": ["A", "D"],
    "issues": [ { "number": 8, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
      "comments": [ { "body": "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." }, { "body": "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-14." } ] } ],
    "steps": [ { "do": "repliesDue" }, { "do": "noReply", "issue": 8, "mail": "D" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [
      { "toAnswer": [ { "issue": 8, "closedBy": null, "mails": [
          { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": true },
          { "id": "MAIL-15192047a5b7d4c1", "found": true, "draft": null, "noted": false } ] } ], "answerReceived": [], "open": [] },
      { "error": null },
      { "toAnswer": [], "answerReceived": [], "open": [] }
    ],
    "issues": [ { "number": 8, "state": "closed", "labels": [] } ],
    "stateCalls": [],
    "labelCalls": []
  }
}
```

### A mail read in the thread of a closed issue is attached and the issue stays closed

```json
{
  "given": "Issue 6 is closed and lists A, with a reply noted for A. The mailbox holds a new mail E whose In-Reply-To names A. The mailbox is read, and then the replies due.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": { "id": "MAIL-ca171c6d1e8e76f0", "messageId": "<sample@example.invalid>", "from": "erika@example.invalid" },
      "E": { "id": "MAIL-4bbaa9c39cbf4f0e", "messageId": "<fifth@example.invalid>", "from": "erika@example.invalid", "inReplyTo": "<sample@example.invalid>", "subject": "Still broken" }
    },
    "found": ["A", "E"],
    "read": ["E"],
    "issues": [ { "number": 6, "state": "closed", "body": "Export fails.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
      "comments": [ { "body": "Reply sent to `MAIL-ca171c6d1e8e76f0` on 2026-10-12." } ] } ],
    "steps": [ { "do": "readNewMail" }, { "do": "repliesDue" } ]
  },
  "expected": {
    "results": [
      { "proposable": [], "attached": [ { "id": "MAIL-4bbaa9c39cbf4f0e", "product": "https://github.com/example/thesis-tool", "issue": 6 } ], "decided": 0, "unwritten": [] },
      { "toAnswer": [ { "issue": 6, "closedBy": null, "mails": [
          { "id": "MAIL-ca171c6d1e8e76f0", "found": true, "draft": null, "noted": true },
          { "id": "MAIL-4bbaa9c39cbf4f0e", "found": true, "draft": null, "noted": false } ] } ], "answerReceived": [], "open": [] }
    ],
    "added": [ [6, "Mail `MAIL-4bbaa9c39cbf4f0e` added on 2026-10-18."] ],
    "issues": [ { "number": 6, "state": "closed", "labels": [] } ],
    "stateCalls": [],
    "labelCalls": []
  }
}
```
