# Bridge Token Release Cases

## Every route refuses a request without the token or with another one

### Case

```json
{
  "given": "A running Bridge on 127.0.0.1 with its pairing token, handlers that answer every route of the protocol, and requests that carry the instance's origin.",
  "input": {
    "kind": "routes",
    "routes": [
      ["GET", "/v1/pair"], ["GET", "/v1/agents"], ["POST", "/v1/jobs"], ["GET", "/v1/jobs"],
      ["GET", "/v1/jobs/j1/log"], ["POST", "/v1/jobs/j1/cancel"], ["POST", "/v1/ask"], ["GET", "/v1/ask/a1"],
      ["POST", "/v1/probes/agent"], ["POST", "/v1/mail/test"], ["GET", "/v1/tunnels"], ["GET", "/v1/unknown"]
    ]
  },
  "expected": {
    "withoutToken": "401 token-refused on every route",
    "withAnotherToken": "401 token-refused on every route",
    "withToken": "no route answers 401, and GET /v1/pair answers 200"
  }
}
```

## After a restart the stored token is accepted and its file is private to its owner

### Case

```json
{
  "given": "A Bridge that started on an empty data folder, made its token and was closed; a second Bridge starts on the same data folder.",
  "input": { "kind": "restart" },
  "expected": {
    "sameTokenAfterRestart": true,
    "storedTokenAccepted": 200,
    "fileMode": "600"
  }
}
```

## After pairing anew the old token is refused, by the running server too

### Case

```json
{
  "given": "A running Bridge with its token, and pairAnew called on its data folder while it keeps running.",
  "input": { "kind": "pair-anew" },
  "expected": {
    "newTokenDiffers": true,
    "oldTokenStatus": 401,
    "oldTokenError": "token-refused",
    "newTokenStatus": 200
  }
}
```
