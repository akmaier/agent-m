# Bridge Mail Release Cases

## Composed Bridge tests a mailbox without keeping the password or changing the mailbox

### Case

```json
{
  "given": "MOD-desktop-shell composes the Bridge on loopback with MOD-mail-protocols handlers, local IMAP and SMTP fixture servers offer STARTTLS, and the mailbox password is a marker string.",
  "input": {
    "kind": "success",
    "password": "bridge-mail-marker-password-431",
    "folders": ["INBOX", "Reports"],
    "counts": { "INBOX": 2, "Reports": 1 }
  },
  "expected": {
    "status": 200,
    "body": {
      "counts": { "INBOX": 2, "Reports": 1 },
      "drafts": true,
      "sent": true,
      "sending": "works",
      "route": "imap"
    },
    "encryptionPresent": true,
    "bridgeLoopback": true,
    "imapLoginsSecure": true,
    "smtpAuthsSecure": true,
    "passwordInPlaintextCommands": false,
    "passwordInBridgeFiles": false,
    "passwordInBridgeLogs": false,
    "mutatingImapCommands": [],
    "nonPeekFetchCommands": [],
    "smtpSendCommands": []
  }
}
```

## Composed Bridge refuses mail servers without TLS before login

### Case

```json
{
  "given": "MOD-desktop-shell composes the Bridge on loopback with MOD-mail-protocols handlers, and local IMAP and SMTP fixture servers do not offer STARTTLS.",
  "input": {
    "kind": "no-tls",
    "password": "bridge-mail-no-tls-password-431",
    "folders": ["INBOX", "Reports"],
    "counts": { "INBOX": 2, "Reports": 1 }
  },
  "expected": {
    "status": 502,
    "error": "no-encryption",
    "mailLoginCommands": [],
    "passwordInPlaintextCommands": false
  }
}
```
