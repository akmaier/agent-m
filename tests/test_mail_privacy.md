# Mail Privacy Release Cases

The cases of `tests/test_mail_privacy.py`, over MOD-mail-handling's public functions with a fake mailbox and a fake host of the
accepted interface (MOD-repository-hosts.md:233-240). Four mails are used throughout. A has a sender with a display name, a Reply-To
and a Cc with display names, a signature, an address, a phone number and an account in its body, and an attachment; B has a
sender, a signature and a phone number in its body; C is listed by issue 4; D answers C and is attached to issue 4 at once.

**How a case reads.** `given` is its precondition. `input` holds the day the clock shows (`today`), the mails by key (`mails`),
the keys the mailbox reads (`read`), the issues of the product (`issues`), the `terms` to look for (the names, addresses, phone
numbers and accounts of the mails' people, written out here and not taken from the code under test), and the `steps` carried out
in order. `expected` names only what the case asserts, out of: `results` (one per step), `created` (title, body and labels of each
issue), `comments`, `labelCalls`, `writeCalls`, `writtenVia` (every write to a repository, by the function that wrote it),
`leaks` (a sender address, a sender name, a whole body or a whole attachment found in a write), `present` (a term found in a write),
`mailboxCalls` and `storage` (writes to the browser's storage, requests to the network and writes to the file system). A step
`plant` adds a text to the writes as a job record or reply note would, so that a counter-proof shows the check finds it.
The identifiers are those of tests/test_mail_replies.md.

## MAIL STAYS IN THE MAILBOX

### After a full run no write holds a sender, a body or an attachment

```json
{
  "given": "Mailbox with the new mails A (a sender with a display name, Reply-To, Cc, a signature, a phone number, an attachment) and B, and the mail D in the known thread of issue 4. The run reads, attaches D, builds the parts, creates one issue for A, one for B, adds B to issue 4 and notes the decision not to answer B.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      }
    ]
  },
  "expected": {
    "leaks": [],
    "writtenVia": [
      "commentOnIssue",
      "createIssue",
      "createIssue",
      "commentOnIssue",
      "commentOnIssue"
    ],
    "mailboxCalls": [
      "read"
    ],
    "storage": {
      "storage": [],
      "fetches": [],
      "files": []
    }
  }
}
```

### Counter-proof: a body planted in a job record is found

```json
{
  "given": "The run of the previous case, then the whole body of the mail A written to a job record. The body holds the sender's name in its signature, so that is found with it.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "job record",
        "text": "Hello,\n\nexporting my thesis as PDF fails with the error E42 in version 1.4. I expected a PDF file.\n\nYou can reach me at +49 9131 85-20000 or erika.privat@example.invalid, my account is @erika_m.\n\nKind regards\nErika Mustermann"
      }
    ]
  },
  "expected": {
    "leaks": [
      {
        "write": "job record",
        "what": "sender name"
      },
      {
        "write": "job record",
        "what": "body"
      }
    ]
  }
}
```

### Counter-proof: a sender address planted in a job record is found

```json
{
  "given": "The run of the first case, then the sender address of the mail A in a job record.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "job record",
        "text": "reported by erika@example.invalid"
      }
    ]
  },
  "expected": {
    "leaks": [
      {
        "write": "job record",
        "what": "sender address"
      }
    ]
  }
}
```

### Counter-proof: a sender name planted in a job record is found

```json
{
  "given": "The run of the first case, then the sender name of the mail A in a job record.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "job record",
        "text": "reported by Erika Mustermann"
      }
    ]
  },
  "expected": {
    "leaks": [
      {
        "write": "job record",
        "what": "sender name"
      }
    ]
  }
}
```

### Counter-proof: an attachment planted in a job record is found

```json
{
  "given": "The run of the first case, then the whole text of the attachment of the mail A in a job record.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "job record",
        "text": "Attachment: stack trace E42 at export line 7, written by user erikam"
      }
    ]
  },
  "expected": {
    "leaks": [
      {
        "write": "job record",
        "what": "attachment"
      }
    ]
  }
}
```

## THE PRODUCT ISSUE CARRIES NO PERSONAL DATA

### The issue text holds no header address, display name, body address or phone number

```json
{
  "given": "The mails A and B with their people: every address and display name of their headers, an address, a phone number and an account in the body of A, a phone number in the body of B. The participant's neutral text names none of them.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B"
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
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.",
          "label": "defect"
        }
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
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "present": [],
    "writtenVia": [
      "createIssue",
      "createIssue"
    ],
    "created": [
      {
        "title": "PDF export fails with error E42",
        "body": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected.\n\nMails: `MAIL-ca171c6d1e8e76f0`",
        "labels": [
          "defect"
        ]
      },
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

### Counter-proof: a sender name in the issue text is found

```json
{
  "given": "The oracle is asked about an issue text that names the sender of A and her phone number, written by a step that plants it as an issue.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B"
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
        "do": "plant",
        "via": "createIssue",
        "text": "Erika Mustermann cannot export; call +49 9131 85 20000"
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "present": [
      {
        "write": "createIssue",
        "term": "Erika Mustermann"
      },
      {
        "write": "createIssue",
        "term": "Erika"
      },
      {
        "write": "createIssue",
        "term": "Mustermann"
      },
      {
        "write": "createIssue",
        "term": "+49 9131 85-20000"
      }
    ]
  }
}
```

### A participant text that names the sender or a phone number of the mail creates nothing

```json
{
  "given": "The participant's text names the sender in the title, then the sender's phone number from the body; the person clicks create each time.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B"
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
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "Export fails for Erika Mustermann",
          "text": "The E42 error occurs.",
          "label": "defect"
        }
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Call +49 9131 85-20000 about the E42 error.",
          "label": "defect"
        }
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "created": [],
    "writeCalls": [],
    "present": [],
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0",
          "MAIL-f9f8e80f54bb5fa3"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "error": "PersonFound",
        "issue": null
      },
      {
        "error": "PersonFound",
        "issue": null
      }
    ]
  }
}
```

### A participant text that names a person only of the Cc header creates nothing

```json
{
  "given": "The Cc header of A names Frank Beispiel, who is named nowhere in the body. The participant's text names him by name, then by address; the person clicks create each time.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B"
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
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Frank Beispiel also sees error E42.",
          "label": "defect"
        }
      },
      {
        "do": "decide",
        "mail": "A",
        "decision": {
          "kind": "create",
          "product": "https://github.com/example/thesis-tool",
          "title": "PDF export fails with error E42",
          "text": "Send details to frank@example.invalid about error E42.",
          "label": "defect"
        }
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "created": [],
    "writeCalls": [],
    "present": [],
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0",
          "MAIL-f9f8e80f54bb5fa3"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "error": "PersonFound",
        "issue": null
      },
      {
        "error": "PersonFound",
        "issue": null
      }
    ]
  }
}
```

### Rate: four neutral texts of a fixed set, two of them naming the mail's people

```json
{
  "given": "The mails A and B as proposed by readNewMail, and four texts a participant might return for them. The rate is the share of texts in which MOD-personal-data's search finds a person of the mail; it is reported, not gated. The set holds two texts that name a person, so that the measure is shown to find one.",
  "input": {
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
    "issues": [],
    "today": "2026-10-18",
    "steps": [
      {
        "do": "readNewMail"
      },
      {
        "do": "measure"
      }
    ],
    "neutral": [
      {
        "mail": "A",
        "text": "Exporting a thesis as PDF fails with the error E42 in version 1.4. A PDF file was expected."
      },
      {
        "mail": "B",
        "text": "After updating the fields of a thesis the table of contents stays empty in version 1.4."
      },
      {
        "mail": "A",
        "text": "Erika could not export her thesis; she can be reached on +49 9131 85-20000."
      },
      {
        "mail": "B",
        "text": "Gerda Probe writes that the table of contents stays empty."
      }
    ]
  },
  "expected": {
    "results": [
      {
        "proposable": [
          "MAIL-ca171c6d1e8e76f0",
          "MAIL-f9f8e80f54bb5fa3"
        ],
        "attached": [],
        "decided": 0,
        "unwritten": []
      },
      {
        "measured": 4,
        "found": [
          false,
          false,
          true,
          true
        ]
      }
    ]
  }
}
```

## NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY

### After a full run no issue, comment or label holds a name, address, phone number or account

```json
{
  "given": "The full run of the first case under MAIL STAYS IN THE MAILBOX, with the people of A and B as the terms to look for in everything written: the issues, the thread note, the duplicate note and the note of the decision not to answer.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "present": [],
    "writtenVia": [
      "commentOnIssue",
      "createIssue",
      "createIssue",
      "commentOnIssue",
      "commentOnIssue"
    ],
    "labelCalls": [],
    "comments": [
      [
        4,
        "Mail `MAIL-15192047a5b7d4c1` added on 2026-10-18."
      ],
      [
        4,
        "Mail `MAIL-f9f8e80f54bb5fa3` added on 2026-10-18."
      ],
      [
        4,
        "No reply to `MAIL-f9f8e80f54bb5fa3`, decided on 2026-10-18."
      ]
    ]
  }
}
```

### Counter-proof: an address planted in a job record is found

```json
{
  "given": "The full run, then the sender address of A in a job record, with the people of A and B as the terms.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "job record",
        "text": "reported by erika@example.invalid"
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "present": [
      {
        "write": "job record",
        "term": "Erika"
      },
      {
        "write": "job record",
        "term": "erika@example.invalid"
      }
    ]
  }
}
```

### Counter-proof: a phone number planted in a reply note is found

```json
{
  "given": "The full run, then a phone number of B, written with other separators, in a reply note.",
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
      "B": {
        "id": "MAIL-f9f8e80f54bb5fa3",
        "messageId": "<other@example.invalid>",
        "from": {
          "name": "Gerda Probe",
          "address": "gerda@example.invalid"
        },
        "subject": "Table of contents is empty",
        "text": "Hi,\n\nthe table of contents stays empty after I update the fields. Version 1.4.\n\nThanks\nGerda Probe, tel. 0911 5302-1234"
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
      "B",
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
          "A",
          "B"
        ],
        "ticked": {
          "A": [
            "report.txt"
          ]
        }
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
      },
      {
        "do": "decide",
        "mail": "B",
        "decision": {
          "kind": "add",
          "product": "https://github.com/example/thesis-tool",
          "issue": 4
        }
      },
      {
        "do": "noReply",
        "mail": "B",
        "issue": 4
      },
      {
        "do": "plant",
        "via": "reply note",
        "text": "Call 0911/5302 1234"
      }
    ],
    "terms": {
      "names": [
        "Erika Mustermann",
        "Erika Privat",
        "Frank Beispiel",
        "Gerda Probe"
      ],
      "addresses": [
        "erika@example.invalid",
        "erika.privat@example.invalid",
        "frank@example.invalid",
        "gerda@example.invalid"
      ],
      "phones": [
        "+49 9131 85-20000",
        "0911 5302-1234"
      ],
      "accounts": [
        "@erika_m"
      ]
    }
  },
  "expected": {
    "present": [
      {
        "write": "reply note",
        "term": "0911 5302-1234"
      }
    ]
  }
}
```

# MOD-personal-data release cases

The cases below, under the names of the requirements they check, run MOD-personal-data's public functions (`peopleIn`, `personHits`, `checkersFor`,
`pseudonymisationOf`, `privacyStrategies`) and, for the three checkers, the catalogue's kind `rewrite-without-persons` through MOD-job-runner's
`prepareJob` and `runJob`, with fixture participants and drivers that answer from the case. Nothing reaches the network. Each case has `given` (its
precondition), `input` (`op` names what is run; `mail` is what `peopleIn` reads; `terms` are the names, addresses, phone numbers, IP addresses and paths of the
fixture written out here, searched for as plain text, never taken from the code under test) and `expected` (only what the case asserts).

## A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE

### An issue text with the sender's name is refused and the hit named

```json
{
  "given": "The mail's people are its header name Erika Mustermann, its address, its phone number and its account. The issue text names the sender on its line 3.",
  "input": {
    "op": "search",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "text": "Export fails\n\nErika Mustermann reports that E42 stops the PDF export.",
    "terms": [
      "Erika Mustermann"
    ]
  },
  "expected": {
    "findings": [
      [
        3,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "name",
        "Erika Mustermann",
        3
      ]
    ],
    "present": [
      "Erika Mustermann"
    ]
  }
}
```

### An issue text with a name from the mail's signature is refused and the hit named

```json
{
  "given": "The mail's header holds an address and no display name; its signature, after the line `-- `, gives Gerda Probe. The issue text names that person on its line 2.",
  "input": {
    "op": "search",
    "mail": {
      "addresses": [
        {
          "name": null,
          "address": "gp0815@example.invalid"
        }
      ],
      "text": "Hi,\n\nthe table of contents stays empty.\n\n-- \nGerda Probe\nLab 4"
    },
    "text": "The table of contents stays empty.\nReported by Gerda Probe.",
    "terms": [
      "Gerda Probe"
    ]
  },
  "expected": {
    "findings": [
      [
        2,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "name",
        "Gerda Probe",
        2
      ]
    ],
    "present": [
      "Gerda Probe"
    ]
  }
}
```

### The same texts without the name pass

```json
{
  "given": "The two mails of the cases above; issue texts that describe the fault and name nobody.",
  "input": {
    "op": "search",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "text": "Export fails\n\nThe PDF export stops with E42 in version 1.4.",
    "terms": [
      "Erika Mustermann"
    ]
  },
  "expected": {
    "findings": [],
    "hits": [],
    "present": []
  }
}
```

### A text without the signature's name passes

```json
{
  "given": "The signature mail; an issue text that describes the fault and names nobody.",
  "input": {
    "op": "search",
    "mail": {
      "addresses": [
        {
          "name": null,
          "address": "gp0815@example.invalid"
        }
      ],
      "text": "Hi,\n\nthe table of contents stays empty.\n\n-- \nGerda Probe\nLab 4"
    },
    "text": "The table of contents stays empty.\nSeen in version 1.4.",
    "terms": [
      "Gerda Probe"
    ]
  },
  "expected": {
    "findings": [],
    "hits": [],
    "present": []
  }
}
```

## REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS

### A rewriting that holds none of the five passes, and the participant is sent the log as picked

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the error E42, its line 7 and version 1.4.",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with error E42 at export line 7 in version 1.4; the output file was not created.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "parts": [
      [
        "log",
        "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      ]
    ],
    "findings": [],
    "hits": [],
    "present": []
  }
}
```

### A rewriting that keeps the address is refused

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the mail address.",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42 for em4711@example.invalid in version 1.4.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "findings": [
      [
        1,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "address",
        "em4711@example.invalid"
      ]
    ],
    "present": [
      "em4711@example.invalid"
    ]
  }
}
```

### A rewriting that keeps the phone number is refused, whatever its separators

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the phone number with hyphens in place of blanks.",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42; call +49-9131-85-20000 about it.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "findings": [
      [
        1,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "phone",
        "+49-9131-85-20000"
      ]
    ]
  }
}
```

### A rewriting that keeps the name is refused

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the name.",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "Erika Mustermann hit E42 in version 1.4.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "findings": [
      [
        1,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "name",
        "Erika Mustermann"
      ]
    ],
    "present": [
      "Erika Mustermann"
    ]
  }
}
```

### A rewriting that keeps the home-directory path of the mail's account is refused

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the path with the account's name in it.",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42 when it opens /home/erikam/thesis/main.docx.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "findings": [
      [
        1,
        "error",
        "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE"
      ]
    ],
    "hits": [
      [
        "account",
        "erikam"
      ]
    ],
    "present": [
      "/home/erikam"
    ]
  }
}
```

### A rewriting that keeps the IP address is found by the case's own term scan

```json
{
  "given": "A fixture log holds a name, a mail address, a phone number, an IP address and a home-directory path (its account is the mail's). A fixture participant rewrites it; the case lists those five as terms. The rewriting keeps the IP address. Only the term scan of this case is asserted: MOD-personal-data's peopleIn names no IP address as a kind of person (its file :82-89).",
  "input": {
    "op": "rewrite",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "rewriter": {
      "name": "rw",
      "model": "m0",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42 for the client at 10.20.30.40.",
    "mailbox": [
      "campus"
    ],
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ]
  },
  "expected": {
    "present": [
      "10.20.30.40"
    ]
  }
}
```

## A REWRITTEN TEXT IS CHECKED BY THREE LLMS

### Three checkers are chosen, at the mailbox's place, with three different models

```json
{
  "given": "Participants rw (model m0), c-a (m1), c-b (m2), c-c (m3), c-dup (m1), c-same (m0), all at campus, and c-far (m4) at another place; the mailbox allows campus.",
  "input": {
    "op": "checkers",
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ]
  },
  "expected": {
    "checkers": [
      "c-a",
      "c-b",
      "c-c"
    ],
    "missing": false,
    "models": [
      "m1",
      "m2",
      "m3"
    ]
  }
}
```

### Of three checkers one reports a name: the finding goes back and the job does not pass

```json
{
  "given": "The three checkers c-a, c-b, c-c; c-b reports a name in the rewriting. The kind's writer hands the draft back and commits and opens nothing.",
  "input": {
    "op": "loop",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42.",
    "reviewers": [
      {
        "name": "c-a",
        "findings": []
      },
      {
        "name": "c-b",
        "findings": [
          {
            "artifact": "the text",
            "line": 1,
            "rule": "A REWRITTEN TEXT IS CHECKED BY THREE LLMS",
            "what": "names a person",
            "fix": "drop it"
          }
        ]
      },
      {
        "name": "c-c",
        "findings": []
      }
    ]
  },
  "expected": {
    "blocking": 0,
    "stopped": "unchanged",
    "remaining": [
      [
        "warning",
        "names a person"
      ]
    ],
    "sentBack": [
      [
        [
          "warning",
          "names a person"
        ]
      ]
    ],
    "rewriterAsked": 2,
    "committed": [
      0,
      0,
      null
    ]
  }
}
```

### None of the three reports a name: the job passes at once

```json
{
  "given": "The three checkers; none reports.",
  "input": {
    "op": "loop",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "rewriting": "The export fails with E42.",
    "reviewers": [
      {
        "name": "c-a",
        "findings": []
      },
      {
        "name": "c-b",
        "findings": []
      },
      {
        "name": "c-c",
        "findings": []
      }
    ]
  },
  "expected": {
    "blocking": 0,
    "stopped": "passed",
    "remaining": [],
    "sentBack": [],
    "rewriterAsked": 1,
    "committed": [
      0,
      0,
      null
    ],
    "shown": {
      "text": "The export fails with E42."
    }
  }
}
```

## NO CHECKER IS THE REWRITER

### A checker set with a participant of the rewriter's model is refused before anything is sent

```json
{
  "given": "The rewriter rw uses model m0; c-same uses m0 too; c-a and c-b use other models.",
  "input": {
    "op": "prepare",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "reviewers": [
      "c-same",
      "c-a",
      "c-b"
    ],
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ]
  },
  "expected": {
    "blocking": 1,
    "refused": "NotStartable",
    "asked": []
  }
}
```

### A checker set in which two checkers share a model is refused before anything is sent

```json
{
  "given": "c-a and c-dup both use model m1; c-c uses m3.",
  "input": {
    "op": "prepare",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "reviewers": [
      "c-a",
      "c-dup",
      "c-c"
    ],
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ]
  },
  "expected": {
    "blocking": 2,
    "refused": "NotStartable",
    "asked": []
  }
}
```

### Three other participants with three other models are accepted, and each is asked

```json
{
  "given": "c-a, c-b, c-c use models m1, m2, m3, none the rewriter's.",
  "input": {
    "op": "prepare",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "reviewers": [
      "c-a",
      "c-b",
      "c-c"
    ],
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ]
  },
  "expected": {
    "blocking": 0,
    "refused": null,
    "asked": [
      "rw",
      "c-a",
      "c-b",
      "c-c"
    ]
  }
}
```

### With only two participants whose model differs from the rewriter's and from each other, no three are found

```json
{
  "given": "The rewriter rw (m0); c-same (m0, the rewriter's model), c-a (m1), c-b (m2).",
  "input": {
    "op": "checkers",
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ]
  },
  "expected": {
    "checkers": null,
    "missing": true
  }
}
```

### A participant at a place the mailbox does not allow is not a checker

```json
{
  "given": "The rewriter rw; c-far at another place; c-a and c-b at campus.",
  "input": {
    "op": "checkers",
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ]
  },
  "expected": {
    "checkers": null,
    "missing": true
  }
}
```

### Of two participants with one model only one is chosen

```json
{
  "given": "The rewriter rw (m0); c-a and c-dup (both m1), c-b (m2), c-c (m3), all at campus, in that order.",
  "input": {
    "op": "checkers",
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ]
  },
  "expected": {
    "checkers": [
      "c-a",
      "c-b",
      "c-c"
    ],
    "missing": false,
    "models": [
      "m1",
      "m2",
      "m3"
    ]
  }
}
```

## PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF

### A product without a settings file is on

```json
{
  "given": "The product's docs/settings.md as given; no file where the input is null.",
  "input": {
    "op": "pseudonymisation",
    "file": null
  },
  "expected": {
    "value": "on"
  }
}
```

### A settings file without the key is on

```json
{
  "given": "The product's docs/settings.md as given; no file where the input is null.",
  "input": {
    "op": "pseudonymisation",
    "file": "---\n---\n# Settings of this product\n"
  },
  "expected": {
    "value": "on"
  }
}
```

### A settings file that switches it off is off

```json
{
  "given": "The product's docs/settings.md as given; no file where the input is null.",
  "input": {
    "op": "pseudonymisation",
    "file": "---\npseudonymisation: off\n---\n# Settings of this product\n"
  },
  "expected": {
    "value": "off"
  }
}
```

### A settings file that says on is on

```json
{
  "given": "The product's docs/settings.md as given; no file where the input is null.",
  "input": {
    "op": "pseudonymisation",
    "file": "---\npseudonymisation: on\n---\n# Settings of this product\n"
  },
  "expected": {
    "value": "on"
  }
}
```

## THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED

### A participant at a listed place is given the report data

```json
{
  "given": "The mailbox allows campus; the participant is at campus.",
  "input": {
    "op": "places",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participant": {
      "name": "p",
      "model": "m1",
      "place": "campus"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "mailbox": [
      "campus"
    ]
  },
  "expected": {
    "parts": [
      "log"
    ],
    "refused": null
  }
}
```

### A participant at an unlisted place is given nothing

```json
{
  "given": "The mailbox allows campus; the participant is at eu-cloud.",
  "input": {
    "op": "places",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "participant": {
      "name": "p",
      "model": "m1",
      "place": "eu-cloud"
    },
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "mailbox": [
      "campus"
    ]
  },
  "expected": {
    "parts": [],
    "refused": "PlaceNotAllowed"
  }
}
```

## Rate: report data

### Rate: four rewritings of the fixed set, and four runs of three checkers

```json
{
  "given": "Four rewritings of the log: two clean and technical, one that keeps the address, one that drops the technical content; four checker runs over the same text, in which none, one, none and two checkers report a name. Reported, not gated.",
  "input": {
    "op": "rates",
    "mail": {
      "addresses": [
        {
          "name": "Erika Mustermann",
          "address": "em4711@example.invalid"
        }
      ],
      "text": "Hello,\n\nexporting fails with E42 in version 1.4.\n\nYou can reach me at +49 9131 85-20000, my account is @erikam.\n\nKind regards\nErika Mustermann"
    },
    "terms": [
      "Erika Mustermann",
      "em4711@example.invalid",
      "+49 9131 85-20000",
      "10.20.30.40",
      "/home/erikam"
    ],
    "technical": [
      "E42",
      "1.4"
    ],
    "rewritings": [
      "The export fails with E42 in version 1.4.",
      "The import stops with E42 at line 7 in version 1.4.",
      "The export fails with E42 in version 1.4; reported by em4711@example.invalid.",
      "The export fails."
    ],
    "participants": [
      {
        "name": "rw",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-a",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-b",
        "model": "m2",
        "place": "campus"
      },
      {
        "name": "c-c",
        "model": "m3",
        "place": "campus"
      },
      {
        "name": "c-dup",
        "model": "m1",
        "place": "campus"
      },
      {
        "name": "c-same",
        "model": "m0",
        "place": "campus"
      },
      {
        "name": "c-far",
        "model": "m4",
        "place": "elsewhere"
      }
    ],
    "rewriter": "rw",
    "places": [
      "campus"
    ],
    "pieces": [
      {
        "name": "log",
        "text": "2026-10-18 09:12 export failed for em4711@example.invalid (Erika Mustermann, +49 9131 85-20000) from 10.20.30.40\nopen /home/erikam/thesis/main.docx: E42 at export line 7, version 1.4"
      }
    ],
    "checkRuns": [
      {
        "text": "The export fails with E42.",
        "reviews": [
          {
            "name": "c-a",
            "findings": []
          },
          {
            "name": "c-b",
            "findings": []
          },
          {
            "name": "c-c",
            "findings": []
          }
        ]
      },
      {
        "text": "The export fails with E42.",
        "reviews": [
          {
            "name": "c-a",
            "findings": []
          },
          {
            "name": "c-b",
            "findings": [
              {
                "artifact": "the text",
                "line": 1,
                "rule": "A REWRITTEN TEXT IS CHECKED BY THREE LLMS",
                "what": "names a person",
                "fix": "drop it"
              }
            ]
          },
          {
            "name": "c-c",
            "findings": []
          }
        ]
      },
      {
        "text": "The export fails with E42.",
        "reviews": [
          {
            "name": "c-a",
            "findings": []
          },
          {
            "name": "c-b",
            "findings": []
          },
          {
            "name": "c-c",
            "findings": []
          }
        ]
      },
      {
        "text": "The export fails with E42.",
        "reviews": [
          {
            "name": "c-a",
            "findings": [
              {
                "artifact": "the text",
                "line": 1,
                "rule": "A REWRITTEN TEXT IS CHECKED BY THREE LLMS",
                "what": "names a person",
                "fix": "drop it"
              }
            ]
          },
          {
            "name": "c-b",
            "findings": []
          },
          {
            "name": "c-c",
            "findings": [
              {
                "artifact": "the text",
                "line": 1,
                "rule": "A REWRITTEN TEXT IS CHECKED BY THREE LLMS",
                "what": "names a person",
                "fix": "drop it"
              }
            ]
          }
        ]
      }
    ]
  },
  "expected": {
    "measured": 4,
    "clean": 3,
    "keepsTechnical": 3,
    "checkRuns": 4,
    "passedAllThree": 2
  }
}
```

