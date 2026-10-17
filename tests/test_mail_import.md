# Mail Import Release Cases

The cases of `tests/test_mail_import.py`. Every identifier below was computed outside the code under test: `MAIL-` and the
first sixteen hex digits of the SHA-256 of the UTF-8 text between the angle brackets of a `Message-ID` (SPEC
`A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`).

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
