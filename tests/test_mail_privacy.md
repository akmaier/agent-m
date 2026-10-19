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
