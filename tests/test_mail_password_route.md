# Mail Password Route Release Cases

## Laptop Bridge receives the laptop mailbox password

### Case

```json
{
  "given": "Two Bridges are stored, and the mailbox connection names laptop.",
  "input": {
    "bridges": {
      "laptop": { "address": "http://127.0.0.1:4711", "token": "laptop-token" },
      "gpu-box": {
        "address": "https://jump.example.test/bridge/gpu-box",
        "token": "gpu-token",
        "login": { "user": "proxy-user", "password": "proxy-password-constructed-002" }
      }
    },
    "bridgeAnswer": {
      "counts": { "INBOX": 4 },
      "drafts": true,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through laptop"
    },
    "connection": {
      "address": "reporter@gmail.com",
      "route": "imap",
      "folders": ["INBOX"],
      "places": [{ "place": "this machine", "outsideEu": false }],
      "imap": {
        "bridge": "laptop",
        "jumpHostNoted": false,
        "imap": { "host": "imap.gmail.com", "port": 993, "security": "tls" },
        "smtp": { "host": "smtp.gmail.com", "port": 587, "security": "starttls" },
        "account": "reporter@gmail.com",
        "password": "laptop-mail-password-constructed-001"
      }
    }
  },
  "expected": {
    "selectedBridge": "laptop",
    "storedBridgeNames": ["gpu-box", "laptop"],
    "answer": {
      "counts": { "INBOX": 4 },
      "drafts": true,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through laptop"
    },
    "requests": [
      {
        "url": "http://127.0.0.1:4711/v1/mail/test",
        "method": "POST",
        "selectedAddress": true,
        "unselectedAddress": false,
        "bodyBridge": "laptop",
        "bodyPassword": "laptop-mail-password-constructed-001",
        "passwordInUrl": false,
        "passwordInHeaders": false,
        "passwordInBody": true,
        "bridgeToken": "laptop-token",
        "jumpHostLogin": false
      }
    ]
  }
}
```

## Jump-host Bridge receives the gpu-box mailbox password

### Case

```json
{
  "given": "Two Bridges are stored, and the mailbox connection names gpu-box.",
  "input": {
    "bridges": {
      "laptop": { "address": "http://127.0.0.1:4711", "token": "laptop-token" },
      "gpu-box": {
        "address": "https://jump.example.test/bridge/gpu-box",
        "token": "gpu-token",
        "login": { "user": "proxy-user", "password": "proxy-password-constructed-002" }
      }
    },
    "bridgeAnswer": {
      "counts": { "INBOX": 6, "Archive": 13 },
      "drafts": false,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through gpu-box"
    },
    "connection": {
      "address": "reports@campus.example",
      "route": "imap",
      "folders": ["INBOX", "Archive"],
      "places": [{ "place": "FAU data centre (EU)", "outsideEu": false }],
      "imap": {
        "bridge": "gpu-box",
        "jumpHostNoted": true,
        "imap": { "host": "imap.campus.example", "port": 993, "security": "tls" },
        "smtp": { "host": "smtp.campus.example", "port": 465, "security": "tls" },
        "account": "reports",
        "password": "gpu-mail-password-constructed-003"
      }
    }
  },
  "expected": {
    "selectedBridge": "gpu-box",
    "storedBridgeNames": ["gpu-box", "laptop"],
    "answer": {
      "counts": { "INBOX": 6, "Archive": 13 },
      "drafts": false,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through gpu-box"
    },
    "requests": [
      {
        "url": "https://jump.example.test/bridge/gpu-box/v1/mail/test",
        "method": "POST",
        "selectedAddress": true,
        "unselectedAddress": false,
        "bodyBridge": "gpu-box",
        "bodyPassword": "gpu-mail-password-constructed-003",
        "passwordInUrl": false,
        "passwordInHeaders": false,
        "passwordInBody": true,
        "bridgeToken": "gpu-token",
        "jumpHostLogin": true
      }
    ]
  }
}
```
