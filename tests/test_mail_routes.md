# Mail Route Release Cases

## Gmail is routed to IMAP without asking Microsoft's service

### Case

```json
{
  "given": "A Gmail address and a fake Microsoft tenant service that would answer if asked.",
  "input": {
    "kind": "route-for",
    "address": "reporter@gmail.com",
    "tenants": ["gmail.com"]
  },
  "expected": {
    "route": "imap",
    "servers": {
      "imap": { "host": "imap.gmail.com", "port": 993, "security": "tls" },
      "smtp": { "host": "smtp.gmail.com", "port": 587, "security": "starttls" }
    },
    "requests": []
  }
}
```

## Microsoft Graph mailbox is read without a Bridge

### Case

```json
{
  "given": "A Microsoft 365 mailbox connection with no password and a fake Graph mailbox.",
  "input": {
    "kind": "mailbox-test",
    "msal": { "account": "reports@contoso.example", "scopes": ["Mail.ReadWrite", "Mail.Send", "offline_access"] },
    "graph": { "inbox": 12, "folders": { "Reports": 3 } },
    "connection": {
      "address": "reports@contoso.example",
      "route": "graph",
      "folders": ["INBOX", "Reports"],
      "places": [{ "place": "this machine", "outsideEu": false }],
      "graph": { "clientId": "11111111-2222-3333-4444-555555555555", "account": "reports@contoso.example" }
    }
  },
  "expected": {
    "answer": {
      "counts": { "INBOX": 12, "Reports": 3 },
      "drafts": true,
      "sent": true,
      "sending": "works",
      "route": "graph",
      "encryption": "TLS to Microsoft Graph"
    },
    "connectionHasPassword": false,
    "graphRequests": [
      { "kind": "graph", "method": "GET", "path": "/me/mailFolders/inbox?$select=totalItemCount", "bearerToken": true },
      { "kind": "graph", "method": "GET", "path": "/me/mailFolders?$filter=displayName eq 'Reports'&$select=totalItemCount", "bearerToken": true },
      { "kind": "graph", "method": "GET", "path": "/me/mailFolders/drafts?$select=id", "bearerToken": true },
      { "kind": "graph", "method": "GET", "path": "/me/mailFolders/sentitems?$select=id", "bearerToken": true }
    ],
    "bridgeRequests": [],
    "silentScopes": [["Mail.ReadWrite", "Mail.Send", "offline_access"]]
  }
}
```

## Gmail mailbox is tested through the laptop Bridge

### Case

```json
{
  "given": "A Gmail IMAP connection naming the laptop Bridge while another Bridge exists only as a counter-example.",
  "input": {
    "kind": "mailbox-test",
    "bridge": { "address": "http://127.0.0.1:4711", "token": "laptop-token" },
    "bridgeAnswer": {
      "counts": { "INBOX": 5 },
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
        "password": "gmail-password-constructed-001"
      }
    }
  },
  "expected": {
    "answer": {
      "counts": { "INBOX": 5 },
      "drafts": true,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through laptop"
    },
    "connectionHasPassword": true,
    "graphRequests": [],
    "bridgeRequests": [
      {
        "kind": "bridge",
        "method": "POST",
        "url": "http://127.0.0.1:4711/v1/mail/test",
        "bridge": "laptop",
        "token": "laptop-token"
      }
    ],
    "silentScopes": []
  }
}
```

## Campus IMAP mailbox is tested through the gpu-box Bridge

### Case

```json
{
  "given": "An IMAP connection naming the gpu-box Bridge, which is reached through a jump-host address.",
  "input": {
    "kind": "mailbox-test",
    "bridge": {
      "address": "https://jump.example.test/bridge/gpu-box",
      "token": "gpu-token",
      "login": { "user": "proxy-user", "password": "proxy-password-constructed-002" }
    },
    "bridgeAnswer": {
      "counts": { "INBOX": 8, "Archive": 21 },
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
        "password": "campus-password-constructed-003"
      }
    }
  },
  "expected": {
    "answer": {
      "counts": { "INBOX": 8, "Archive": 21 },
      "drafts": false,
      "sent": true,
      "sending": "works",
      "route": "imap",
      "encryption": "TLS through gpu-box"
    },
    "connectionHasPassword": true,
    "graphRequests": [],
    "bridgeRequests": [
      {
        "kind": "bridge",
        "method": "POST",
        "url": "https://jump.example.test/bridge/gpu-box/v1/mail/test",
        "bridge": "gpu-box",
        "token": "gpu-token"
      }
    ],
    "silentScopes": []
  }
}
```

## Microsoft sign-in asks only for mail reading, drafts and sending

### Case

```json
{
  "given": "The Microsoft sign-in library stand-in signs in reports@contoso.example.",
  "input": {
    "kind": "sign-in",
    "clientId": "11111111-2222-3333-4444-555555555555",
    "address": "reports@contoso.example",
    "msal": { "account": "reports@contoso.example", "scopes": ["Mail.ReadWrite", "Mail.Send", "offline_access"] }
  },
  "expected": {
    "answer": { "account": "reports@contoso.example" },
    "configs": [
      {
        "clientId": "11111111-2222-3333-4444-555555555555",
        "authority": "https://login.microsoftonline.com/contoso.example",
        "redirectUri": "https://alice.github.io/agent-m/",
        "cacheLocation": "localStorage"
      }
    ],
    "logins": [
      {
        "scopes": ["Mail.ReadWrite", "Mail.Send", "offline_access"],
        "loginHint": "reports@contoso.example"
      }
    ]
  }
}
```
