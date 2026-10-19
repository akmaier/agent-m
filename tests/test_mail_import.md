# Mail Import Release Cases

The cases of `tests/test_mail_import.py`. Every identifier below was computed outside the code under test: `MAIL-` and the
first sixteen hex digits of the SHA-256 of the UTF-8 text between the angle brackets of a `Message-ID` (SPEC
`A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`).

The sections after the three above are the cases of MOD-mail-handling: a fake mailbox and a fake host of the accepted interface (MOD-repository-hosts.md:233-240) are built from each case's `input` (`today`, the mails by key, the keys the mailbox reads, the issues of the product, the `steps` carried out in order). `expected` names only what the case asserts, out of: `results` (one per step), `created` (title, body and labels of each issue), `comments` (issue and text), `writeCalls` (the functions of the host that wrote, in order). Identifiers are those of tests/test_mail_replies.md.

## A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER

### The same mail read twice has the same identifier

```json
{
  "given": "A mail with the Message-ID <abc>, read by two separate readings.",
  "input": { "mails": [ { "messageId": "<abc>", "bytes": null }, { "messageId": "<abc>", "bytes": null } ] },
  "expected": { "ids": ["MAIL-ba7816bf8f01cfea", "MAIL-ba7816bf8f01cfea"] }
}
```

### Two mails with different Message-IDs have different identifiers

```json
{
  "given": "Two mails whose Message-IDs are <sample@example.invalid> and <other@example.invalid>.",
  "input": { "mails": [ { "messageId": "<sample@example.invalid>", "bytes": null }, { "messageId": "<other@example.invalid>", "bytes": null } ] },
  "expected": { "ids": ["MAIL-ca171c6d1e8e76f0", "MAIL-f9f8e80f54bb5fa3"] }
}
```

### A mail without a Message-ID is named by its bytes

```json
{
  "given": "A mail with no Message-ID whose complete bytes are the UTF-8 text 'raw mail bytes', CRLF, 'Subject: x', CRLF, CRLF, 'body'.",
  "input": { "mails": [ { "messageId": null, "bytesText": "raw mail bytes\r\nSubject: x\r\n\r\nbody" } ] },
  "expected": { "ids": ["MAIL-983b270c3e3ad2fe"] }
}
```

## A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN

### A second reading proposes no listed and no marked mail

```json
{
  "given": "Four identifiers read a second time: A is listed by an issue, B is marked not an issue in this browser, C and D are unmarked and new.",
  "input": {
    "ids": ["MAIL-1111111111111111", "MAIL-2222222222222222", "MAIL-3333333333333333", "MAIL-4444444444444444"],
    "listed": ["MAIL-1111111111111111"],
    "marked": ["MAIL-2222222222222222"]
  },
  "expected": { "proposed": ["MAIL-3333333333333333", "MAIL-4444444444444444"] }
}
```

### An unmarked new mail is proposed when nothing is decided

```json
{
  "given": "One new identifier; no issue lists anything and nothing is marked.",
  "input": { "ids": ["MAIL-5555555555555555"], "listed": [], "marked": [] },
  "expected": { "proposed": ["MAIL-5555555555555555"] }
}
```

### Nothing is proposed when every mail is decided

```json
{
  "given": "Two identifiers, one listed and one marked.",
  "input": { "ids": ["MAIL-1111111111111111", "MAIL-2222222222222222"], "listed": ["MAIL-1111111111111111"], "marked": ["MAIL-2222222222222222"] },
  "expected": { "proposed": [] }
}
```

## A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL

### A mail answering a listed mail by In-Reply-To is matched to that issue

```json
{
  "given": "Issue 7 lists MAIL-ba7816bf8f01cfea (Message-ID <abc>) and MAIL-ca171c6d1e8e76f0 (<sample@example.invalid>).",
  "input": { "listed": { "MAIL-ba7816bf8f01cfea": 7, "MAIL-ca171c6d1e8e76f0": 7 }, "inReplyTo": "<abc>", "references": [] },
  "expected": { "issue": 7 }
}
```

### A mail naming a listed mail only in References is matched to that issue

```json
{
  "given": "The same two listed mails of issue 7; the mail has no In-Reply-To and an unlisted and a listed Message-ID in References.",
  "input": { "listed": { "MAIL-ba7816bf8f01cfea": 7, "MAIL-ca171c6d1e8e76f0": 7 }, "inReplyTo": null, "references": ["<other@example.invalid>", "<sample@example.invalid>"] },
  "expected": { "issue": 7 }
}
```

### A mail whose In-Reply-To is unlisted but whose References name a listed mail is matched to that issue

```json
{
  "given": "The same two listed mails of issue 7; the mail answers an unlisted mail and carries a listed one in References.",
  "input": { "listed": { "MAIL-ba7816bf8f01cfea": 7, "MAIL-ca171c6d1e8e76f0": 7 }, "inReplyTo": "<other@example.invalid>", "references": ["<abc>"] },
  "expected": { "issue": 7 }
}
```

### A mail naming only unlisted mails is matched to none

```json
{
  "given": "The same two listed mails of issue 7; the mail answers <unlisted-parent@example.invalid>, which no issue lists.",
  "input": { "listed": { "MAIL-ba7816bf8f01cfea": 7, "MAIL-ca171c6d1e8e76f0": 7 }, "inReplyTo": "<unlisted-parent@example.invalid>", "references": ["<other@example.invalid>"] },
  "expected": { "issue": null }
}
```

### A mail naming no mail is matched to none

```json
{
  "given": "The same two listed mails of issue 7; the mail has neither In-Reply-To nor References.",
  "input": { "listed": { "MAIL-ba7816bf8f01cfea": 7, "MAIL-ca171c6d1e8e76f0": 7 }, "inReplyTo": null, "references": [] },
  "expected": { "issue": null }
}
```

## A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK

### A full run without a decision creates no issue

```json
{
  "given": "Mailbox with the new mail A and the mail D that answers the mail C, which issue 4 lists. The run reads the mail, attaches D, builds the participant's parts for A and takes the participant's returned proposal, and no decideMail is called.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      },
      "C": {
        "id": "MAIL-327d1b3c6e47dfc8",
        "messageId": "<third@example.invalid>",
        "from": {
          "name": "Hans Muster",
          "address": "hans@example.invalid"
        },
        "subject": "Export fails (first report)",
        "text": "Hello, the export fails. Hans Muster"
      },
      "D": {
        "id": "MAIL-15192047a5b7d4c1",
        "messageId": "<fourth@example.invalid>",
        "inReplyTo": "<third@example.invalid>",
        "from": {
          "name": "Hans Muster",
          "address": "hans@example.invalid"
        },
        "subject": "Re: Export fails (first report)",
        "text": "Still failing today, same error. Hans"
      }
    },
    "read": [
      "A",
      "D"
    ],
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "batch",
        "mails": [
          "A"
        ]
      },
      {
        "do": "draftWriter",
        "draft": {
          "proposals": [
            {
              "mail": "MAIL-ca171c6d1e8e76f0",
              "kind": "defect",
              "title": "PDF export fails with error E42",
              "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected."
            }
          ]
        }
      }
    ]
  },
  "expected": {
    "created": [],
    "writeCalls": [
      "commentOnIssue"
    ],
    "comments": [
      [
        4,
        "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-18."
      ]
    ]
  }
}
```

### Counter-proof: the same run with the click creates exactly one issue

```json
{
  "given": "The run of the previous case, followed by the person's click on the proposal for A: one decideMail create.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      },
      "C": {
        "id": "MAIL-327d1b3c6e47dfc8",
        "messageId": "<third@example.invalid>",
        "from": {
          "name": "Hans Muster",
          "address": "hans@example.invalid"
        },
        "subject": "Export fails (first report)",
        "text": "Hello, the export fails. Hans Muster"
      },
      "D": {
        "id": "MAIL-15192047a5b7d4c1",
        "messageId": "<fourth@example.invalid>",
        "inReplyTo": "<third@example.invalid>",
        "from": {
          "name": "Hans Muster",
          "address": "hans@example.invalid"
        },
        "subject": "Re: Export fails (first report)",
        "text": "Still failing today, same error. Hans"
      }
    },
    "read": [
      "A",
      "D"
    ],
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "batch",
        "mails": [
          "A"
        ]
      },
      {
        "do": "draftWriter",
        "draft": {
          "proposals": []
        }
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": "defect"
        }
      }
    ]
  },
  "expected": {
    "created": [
      {
        "title": "PDF export fails with error E42",
        "body": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
        "labels": [
          "defect"
        ]
      }
    ],
    "writeCalls": [
      "commentOnIssue",
      "createIssue"
    ]
  }
}
```

### A decision other than create creates no issue

```json
{
  "given": "The mail A is new and the person's click confirms it as a duplicate of issue 4: decideMail add.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      }
    ]
  },
  "expected": {
    "created": [],
    "writeCalls": [
      "commentOnIssue"
    ]
  }
}
```

### The kind propose-issues names no issue-creating call

```json
{
  "given": "The kind propose-issues as the job catalogue holds it; the mail A is new; the participant returns a proposal; the host records any call it receives, including an unaccepted one.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "kind"
      },
      {
        "do": "readNewMail"
      },
      {
        "do": "batch",
        "mails": [
          "A"
        ]
      },
      {
        "do": "draftWriter",
        "draft": {
          "proposals": [
            {
              "mail": "MAIL-ca171c6d1e8e76f0",
              "kind": "defect",
              "title": "PDF export fails with error E42",
              "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected."
            }
          ]
        }
      }
    ]
  },
  "expected": {
    "results": [
      {
        "tools": [],
        "writer": "return-draft",
        "recipes": [
          "mail-batch"
        ]
      },
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "parts": [
          "mail MAIL-ca171c6d1e8e76f0",
          "products",
          "open issues"
        ]
      },
      {
        "commits": [],
        "files": [],
        "pullRequest": null,
        "shown": {
          "proposals": [
            {
              "mail": "MAIL-ca171c6d1e8e76f0",
              "kind": "defect",
              "title": "PDF export fails with error E42",
              "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected."
            }
          ]
        }
      }
    ],
    "created": [],
    "writeCalls": []
  }
}
```

## AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE

### A mail proposed as a defect is created with the label defect

```json
{
  "given": "The mail A is new; the person clicks create with the label defect.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": "defect"
        }
      }
    ]
  },
  "expected": {
    "created": [
      {
        "title": "PDF export fails with error E42",
        "body": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
        "labels": [
          "defect"
        ]
      }
    ],
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "error": null,
        "issue": 101
      }
    ]
  }
}
```

### A mail proposed as a change is created with the label change

```json
{
  "given": "The mail B is new; the person clicks create with the label change.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "Table of contents stays empty after a field update",
          "text": "After updating the fields of a thesis the table of contents stays empty in version 1.4.",
          "label": "change"
        }
      }
    ]
  },
  "expected": {
    "created": [
      {
        "title": "Table of contents stays empty after a field update",
        "body": "After updating the fields of a thesis the table of contents stays empty in version 1.4.\n\nMails: `MAIL-f9f8e80f54bb5fa3`",
        "labels": [
          "change"
        ]
      }
    ]
  }
}
```

### A label other than defect or change creates nothing

```json
{
  "given": "The mail A is new; the person's decision names the label enhancement, then no label at all.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": "enhancement"
        }
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": null
        }
      }
    ]
  },
  "expected": {
    "created": [],
    "writeCalls": [],
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "error": "TypeError",
        "issue": null
      },
      {
        "error": "TypeError",
        "issue": null
      }
    ]
  }
}
```

## A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE

### A confirmed duplicate adds its identifier to the existing issue and creates none

```json
{
  "given": "Issue 7 is open and describes the failure; the mail A is new and the person confirms it as describing issue 7: decideMail add.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      },
      {
        "number": 7,
        "title": "Export crashes with an error",
        "body": "Export crashes with an error."
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 7
        }
      }
    ]
  },
  "expected": {
    "created": [],
    "comments": [
      [
        7,
        "Mail `MAIL-ca171c6d1e8e76f0` added on 2026-10-18."
      ]
    ],
    "writeCalls": [
      "commentOnIssue"
    ],
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "error": null,
        "issue": 7
      }
    ]
  }
}
```

### Counter-proof: a created issue writes no note on issue 7

```json
{
  "given": "The same mail and issues; the person clicks create instead of add.",
  "input": {
    "today": "2026-10-18",
    "mails": {
      "A": {
        "id": "MAIL-ca171c6d1e8e76f0",
        "messageId": "<sample@example.invalid>",
        "from": {
          "name": "Erika Mustermann",
          "address": "erika@example.invalid"
        },
        "replyTo": [
          {
            "name": "Erika Privat",
            "address": "erika.privat@example.invalid"
          }
        ],
        "cc": [
          {
            "name": "Frank Beispiel",
            "address": "frank@example.invalid"
          }
        ],
        "subject": "Export fails",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann",
        "attachments": [
          {
            "name": "report.txt",
            "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
          }
        ]
      }
    },
    "issues": [
      {
        "number": 4,
        "title": "Export fails",
        "body": "Export fails.\n\nMails: `MAIL-327d1b3c6e47dfc8`"
      },
      {
        "number": 7,
        "title": "Export crashes with an error",
        "body": "Export crashes with an error."
      }
    ],
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": "defect"
        }
      }
    ]
  },
  "expected": {
    "created": [
      {
        "title": "PDF export fails with error E42",
        "body": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
        "labels": [
          "defect"
        ]
      }
    ],
    "comments": [],
    "writeCalls": [
      "createIssue"
    ]
  }
}
```
