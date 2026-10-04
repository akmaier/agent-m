---
id: ARC-012
title: The bridge's loopback HTTP API — loopback only, a bridge token in a header of its own, a host check, CORS and every request for the one paired Pages origin, and a route table its app composes; the dashboard's generic client reaches it on loopback or over HTTPS through the jump host
forced_by:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - EVERY STEP EXPLAINS ITSELF
  - UC-011
  - UC-044
---
# ARC-012 The bridge's loopback HTTP API

## Context

The dashboard, served from `https://<owner>.github.io`, calls the bridge on the same computer, or on another computer through a tunnel that ends on that bridge's loopback address. Loopback is not a permission boundary between programs on one machine (`THE LOCAL BRIDGE REQUIRES A TOKEN`): any web page the person opens can send requests to `127.0.0.1`. The book's OpenClaw box (ch. 10) is the cautionary case: a local gateway that "any website a developer visited could silently connect to".

How browsers treat a request from a public HTTPS page to loopback is recorded, with its sources and quotations, in `docs/measurements/2026-09-30_architecture-open-points.md`, point 3. Chrome from 142, Edge from 143 and Firefox from 153 allow it after one Local Network Access prompt, and "the user will not see another permission prompt" (`https://docs.google.com/document/d/1QQkqehw8umtAgz5z0um7THx-aoU251p705FbIQjDuGs/edit`). Safari blocks it as mixed content: its `allow_loopback_url` is `"version_added": false` (`https://github.com/mdn/browser-compat-data/blob/main/http/mixed-content.json`). For Safari, and for a bridge on another machine without a forward on the person's own, the dashboard reaches the bridge over an HTTPS address of the jump host instead (ARC-013); the bridge receives those requests through its reverse tunnel, on loopback, like any other.

## Decision

1. **Bind** (`MOD-bridge-server.bindCheck`, `MOD-bridge-server.defaultAddress`). The bridge listens on `127.0.0.1`, `::1` or `localhost` only; any other configured address is refused at start (`THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`). Its port is its own setting (ARC-011), 47321 unless set in its window — a port IANA's registry lists as unassigned (the line `,47101-47556,,Unassigned` of `https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.csv`) —, and the dashboard presets `http://127.0.0.1:47321` as the address of a bridge on this computer. Where another program holds the port, the bridge's window says that it is taken.
2. **Plain HTTP with `fetch`, JSON bodies, no WebSockets.** Long-running output, a job's log, is read by polling a cursor (`GET /jobs/<id>/log?after=<n>`). WebSockets fall under the same Local Network Access prompt as `fetch` ("Starting in Chrome 147, LNA restrictions will apply to:", measurement point 3), so the reason is simplicity: one request type to measure, to proxy and to authenticate on every route.
3. **Authentication — the bridge token in a header of its own** (`MOD-bridge-server.admit`). Every request but the preflight carries `Agent-M-Bridge-Token: <pairing token>`, whichever way it came; the bridge compares it without stopping at the first difference and answers `401` without a body otherwise. The preflight, which the browser sends on its own and without the page's headers, is answered with the CORS headers alone and reaches no route. `Authorization` is left to the jump host's web server (ARC-013); the bridge ignores it. The token is 256 random bits (`MOD-bridge-server.newToken`), kept in the bridge's store, readable by its user only, and replaced by *Pair anew* (ARC-011). It never appears in an address, a log line or an export's clear text.
4. **Origin** (`MOD-bridge-server.admit`). The bridge is paired with the origin of the first request it admits while unpaired, which needed the token its window shows (ARC-011). A request whose `Origin` is another web origin is refused before the token is looked at; one without an `Origin`, sent by no web page, goes on to the token. CORS answers name exactly the paired origin — or, while unpaired, the asking one —, never `*`; they allow the methods GET, POST and DELETE and the headers `agent-m-bridge-token`, `authorization` and `content-type`, and a refusal carries the origin too, so that the page can read it.
5. **Host check** (`MOD-bridge-server.admit`). The bridge refuses a request whose `Host` names no loopback address — `127.0.0.1`, `localhost` or `[::1]` —, at whichever port: a forward from another machine (UC-011 1a), a tunnel, or the jump host's web server forwarding to the session port (ARC-013) serves the bridge at a port of its own, while a name rebound to loopback names itself in the `Host`. This guards against such a name, which the token alone also stops but which costs nothing to check; it is checked first.
6. **Local Network Access.** The dashboard calls the bridge at a loopback address, so the browser knows the address space from the address itself; the `fetch` option `targetAddressSpace` serves a name that resolves to loopback — "will work if domainB.example resolves to the loopback address 127.0.0.1" (measurement point 3) — and is not needed. The settings page explains the one-time prompt before the first pairing (`EVERY STEP EXPLAINS ITSELF`). A preflight that still asks `Access-Control-Request-Private-Network: true` is answered with `Access-Control-Allow-Private-Network: true`; it costs nothing.
7. **The mailbox password** reaches the bridge only in the body of a mail request over this API (`THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`), is kept in memory for that request and dropped (ARC-014).
8. **A generic protocol, a composed route table.** The server and the dashboard's client know the protocol — bind, token, origin, host, CORS, errors — and no domain: the bridge app composes the route table from the modules that own the routes (`MOD-bridge-app.routeTable`, ARC-011), and a request goes to the entry its method and path match (`MOD-bridge-server.dispatch`). The endpoints: `GET /hello` — the protocol's major version, the bridge's version, its paired origin, how it shows itself and its agents; the pairing test —, `GET /agents`, `POST /jobs`, `GET /jobs`, `GET /jobs/<id>`, `GET /jobs/<id>/log`, `DELETE /jobs/<id>` (cancel), `GET /endpoint/models`, `POST /endpoint/chat` (local model servers, ARC-009), `POST /mail/test` (a mailbox connection's test, ARC-014), `POST /mail/read` (a mailbox's headers, one mail in full, or its drafts and its replies in *Sent*, read without changing anything, ARC-014), `POST /mail/draft` (a reply stored in *Drafts*, or a draft replaced by its edit, ARC-014), `POST /mail/send` (a draft sent only with the confirmation of the mail shown, ARC-014), `GET /tunnels`. The dashboard refuses a bridge of another major version (`MOD-bridge-server.speaks`).
9. **The dashboard's client** (`MOD-bridge-server.bridgeRequest`, `MOD-bridge-server.callBridge`) takes one of two routes: the bridge's loopback address — on this computer, or a forward to it —, or the HTTPS address of its session on the jump host with the web server's login in `Authorization` (ARC-013). It reads the answer and names each refusal: no answer — the bridge does not run there, the address is wrong, or the browser blocks the call —, the web server refusing its login, the bridge refusing the token or the page's origin, a path or method it does not know.

```mermaid
flowchart LR
    D["dashboard<br/>https://owner.github.io"]
    C["MOD-bridge-server<br/>bridgeRequest, callBridge"]
    S["bridge's server<br/>127.0.0.1:port"]
    A["MOD-bridge-server.admit<br/>host, origin, preflight, token"]
    T["MOD-bridge-server.dispatch<br/>route table of MOD-bridge-app"]
    D --> C -->|"Agent-M-Bridge-Token"| S --> A --> T
```

## Alternatives

- **The bridge token in `Authorization: Bearer` on the loopback route and elsewhere on the HTTPS route** — rejected: two ways to authenticate one protocol; the header of its own works on both routes.
- **WebSocket API** — rejected (decision 2).
- **Pairing by a one-time code in the address** (`http://127.0.0.1:port/pair#code`) — rejected by `A CREDENTIAL IS NEVER PLACED IN A URL`; the token is copied from the bridge's window instead (`THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW`).
- **HTTPS on loopback with a self-signed certificate** — rejected: the person would have to trust a certificate by hand on every computer, and Safari blocks loopback as mixed content regardless (measurement point 3); Safari is served by the HTTPS route of ARC-013, with a certificate the browsers already trust.
- **A port drawn at random on the first start** — rejected: the dashboard could not preset the address, and pairing would need the address typed besides the token.
- **An origin configured by hand** instead of the first admitted one — rejected: one more setting to type; the token already proves that the request comes from the person who read the bridge's window.
- **Domain methods on the client** (`client.mail…`, `client.agents…`) — rejected: the protocol module would know mail, agents and endpoints, and change with each of them; the module that owns a route calls it through the generic client.
- **Native messaging through a browser extension** — rejected: an extension per browser is a second thing to install and review for a non-expert.

## Consequences

- In Chrome, Edge and Firefox the loopback route works after one prompt per site, according to their documentation; in Safari only the HTTPS route of ARC-013 works. The settings page's test of the bridge names the reason and the routes that work (`MOD-settings-page.testSetting`, ARC-026).
- **Open measurement 1 — reachability per browser, loopback.** From `https://akmaier.github.io` to a test server on `http://127.0.0.1:<port>`: whether a `fetch` with the bridge-token header and a JSON body succeeds, which prompt appears, and whether it is remembered — Chrome, Edge and Firefox on macOS and Windows, and Safari 26 on macOS with its console message. Recorded in `docs/measurements/` before the bridge is released (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`).
- The API is the only way into the bridge; a tunnel or the web server forwards to it and adds nothing but the web server's own login.
- A new route is a handler of the module that owns it and a line of the bridge app's table; the protocol module does not change.
- The handlers of the jobs, of local model servers, of mail and of the tunnels are designed with what they serve: the bridge as a job runtime, ARC-009, ARC-014 and ARC-013.
- The earlier module file of `MOD-bridge-server` leaves the working tree: this decision is where the module is designed (ARC-020 decisions 3 and 12).

## Modules

### MOD-bridge-server

```json module
{
  "id": "MOD-bridge-server",
  "folder": "src/bridge-server/",
  "layer": "adapter",
  "responsibility": "The bridge's HTTP protocol on both ends, knowing no domain: on the bridge, the address it binds, whether it admits a request — host, origin, preflight, token — and which route takes it, and a new pairing token; in the dashboard, the request a route takes — loopback, or HTTPS through the jump host — and the answer read, each refusal named, and whether the two ends speak one protocol.",
  "realises": ["THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY", "THE LOCAL BRIDGE REQUIRES A TOKEN"],
  "owns": ["BindAddress", "BridgeDefault", "BridgeRequestIn", "BridgeGate", "Admission", "RouteEntry", "RouteMatch", "BridgeLogin", "BridgeRoute", "BridgeCall", "ProtocolVersion"],
  "uses": ["MOD-contracts"]
}
```

```json interface
{
  "id": "MOD-bridge-server.bindCheck",
  "summary": "The address the bridge listens on: 127.0.0.1, ::1 or localhost, and no other (THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY).",
  "params": [{ "name": "address", "type": "string" }],
  "result": "BindAddress",
  "async": false,
  "refusals": [{ "code": "not-loopback", "when": "the address is none of 127.0.0.1, ::1 and localhost" }],
  "examples": [
    { "name": "the loopback address", "input": { "address": "127.0.0.1" }, "result": { "address": "127.0.0.1" } },
    { "name": "IPv6 loopback", "input": { "address": "::1" }, "result": { "address": "::1" } },
    { "name": "every interface", "input": { "address": "0.0.0.0" }, "refused": "not-loopback" },
    { "name": "the machine's network address", "input": { "address": "192.168.1.20" }, "refused": "not-loopback" }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.defaultAddress",
  "summary": "The port the bridge listens on unless its window sets another — 47321, which IANA's registry lists as unassigned —, and the address of a bridge on this computer that the dashboard presets, so that pairing is the token pasted and one click.",
  "params": [],
  "result": "BridgeDefault",
  "async": false,
  "refusals": [],
  "examples": [
    { "name": "the default", "input": {}, "result": { "port": 47321, "address": "http://127.0.0.1:47321" } }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.admit",
  "summary": "Whether the bridge admits a request, in this order: its Host names a loopback address — 127.0.0.1, localhost or [::1] — at any port, since a forward, a tunnel or the jump host's web server may serve the bridge at a port of its own, while a name rebound to loopback names itself; its Origin, where it has one, is the paired one, or any while the bridge is unpaired, and is refused before the token is looked at; a preflight is answered for that origin, the private-network header too where asked; every other request carries the pairing token, compared without stopping at the first difference. A refused request gets no body, and the origin back where the bridge accepts it, so that the page can read the refusal; the first admitted request of an unpaired bridge names the origin to record as paired.",
  "params": [{ "name": "request", "type": "BridgeRequestIn" }, { "name": "gate", "type": "BridgeGate" }],
  "result": "Admission",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the paired dashboard asks hello",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": true,
        "status": 200,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "",
        "reason": ""
      }
    },
    {
      "name": "the preflight of the paired dashboard",
      "input": {
        "request": {
          "method": "OPTIONS",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io", "access-control-request-method": "GET", "access-control-request-headers": "agent-m-bridge-token", "access-control-request-private-network": "true" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": false,
        "status": 204,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin", "access-control-allow-methods": "GET, POST, DELETE", "access-control-allow-headers": "agent-m-bridge-token, authorization, content-type", "access-control-allow-private-network": "true" },
        "pairs": "",
        "reason": "a preflight, answered"
      }
    },
    {
      "name": "the first request of an unpaired bridge",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "" }
      },
      "result": {
        "admitted": true,
        "status": 200,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "https://alice.github.io",
        "reason": ""
      }
    },
    {
      "name": "no token",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": false,
        "status": 401,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "",
        "reason": "the request carries no token, or not the bridge's"
      }
    },
    {
      "name": "the token before a new pairing",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io", "agent-m-bridge-token": "cf33a859fd1c8745de6b28f0990cc74fb03af8801edc4aa31470ba2e8ceb5e02" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": false,
        "status": 401,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "",
        "reason": "the request carries no token, or not the bridge's"
      }
    },
    {
      "name": "another page with the right token",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:47321", "origin": "https://mallory.example", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": false,
        "status": 403,
        "headers": {},
        "pairs": "",
        "reason": "https://mallory.example is not the origin the bridge is paired with"
      }
    },
    {
      "name": "a name rebound to loopback",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "bridge.attacker.example:47321", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": false,
        "status": 403,
        "headers": {},
        "pairs": "",
        "reason": "the Host bridge.attacker.example:47321 names no loopback address"
      }
    },
    {
      "name": "through a forward to another port",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:50122", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": true,
        "status": 200,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "",
        "reason": ""
      }
    },
    {
      "name": "through the jump host's web server at the session port",
      "input": {
        "request": {
          "method": "GET",
          "path": "/hello",
          "headers": { "host": "127.0.0.1:41001", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
        },
        "gate": { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" }
      },
      "result": {
        "admitted": true,
        "status": 200,
        "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
        "pairs": "",
        "reason": ""
      }
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.dispatch",
  "summary": "The route a request takes in the bridge's table: the entry whose method and path match, with the path's parameters; a path the table does not know is not found, a method its path does not take is not allowed.",
  "params": [
    { "name": "table", "type": "RouteEntry[]" },
    { "name": "method", "type": "string" },
    { "name": "path", "type": "string" }
  ],
  "result": "RouteMatch",
  "async": false,
  "refusals": [
    { "code": "not-found", "when": "no entry of the table has the path" },
    { "code": "not-allowed", "when": "the path's entries take another method" }
  ],
  "examples": [
    {
      "name": "hello",
      "input": {
        "table": [
          { "method": "GET", "path": "/hello", "name": "hello" },
          { "method": "GET", "path": "/agents", "name": "agents" },
          { "method": "POST", "path": "/jobs", "name": "start-job" },
          { "method": "GET", "path": "/jobs", "name": "jobs" },
          { "method": "GET", "path": "/jobs/:id", "name": "job" },
          { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" },
          { "method": "DELETE", "path": "/jobs/:id", "name": "cancel-job" },
          { "method": "GET", "path": "/endpoint/models", "name": "endpoint-models" },
          { "method": "POST", "path": "/endpoint/chat", "name": "endpoint-chat" },
          { "method": "POST", "path": "/mail/test", "name": "mail-test" },
          { "method": "POST", "path": "/mail/read", "name": "mail-read" },
          { "method": "POST", "path": "/mail/draft", "name": "mail-draft" },
          { "method": "POST", "path": "/mail/send", "name": "mail-send" },
          { "method": "GET", "path": "/tunnels", "name": "tunnels" }
        ],
        "method": "GET",
        "path": "/hello"
      },
      "result": { "route": "hello", "params": {} }
    },
    {
      "name": "a job's log from a cursor",
      "input": {
        "table": [
          { "method": "GET", "path": "/hello", "name": "hello" },
          { "method": "GET", "path": "/agents", "name": "agents" },
          { "method": "POST", "path": "/jobs", "name": "start-job" },
          { "method": "GET", "path": "/jobs", "name": "jobs" },
          { "method": "GET", "path": "/jobs/:id", "name": "job" },
          { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" },
          { "method": "DELETE", "path": "/jobs/:id", "name": "cancel-job" },
          { "method": "GET", "path": "/endpoint/models", "name": "endpoint-models" },
          { "method": "POST", "path": "/endpoint/chat", "name": "endpoint-chat" },
          { "method": "POST", "path": "/mail/test", "name": "mail-test" },
          { "method": "POST", "path": "/mail/read", "name": "mail-read" },
          { "method": "POST", "path": "/mail/draft", "name": "mail-draft" },
          { "method": "POST", "path": "/mail/send", "name": "mail-send" },
          { "method": "GET", "path": "/tunnels", "name": "tunnels" }
        ],
        "method": "GET",
        "path": "/jobs/JOB-20261012-1000-1999/log?after=120"
      },
      "result": { "route": "job-log", "params": { "id": "JOB-20261012-1000-1999" } }
    },
    {
      "name": "a cancel",
      "input": {
        "table": [
          { "method": "GET", "path": "/hello", "name": "hello" },
          { "method": "GET", "path": "/agents", "name": "agents" },
          { "method": "POST", "path": "/jobs", "name": "start-job" },
          { "method": "GET", "path": "/jobs", "name": "jobs" },
          { "method": "GET", "path": "/jobs/:id", "name": "job" },
          { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" },
          { "method": "DELETE", "path": "/jobs/:id", "name": "cancel-job" },
          { "method": "GET", "path": "/endpoint/models", "name": "endpoint-models" },
          { "method": "POST", "path": "/endpoint/chat", "name": "endpoint-chat" },
          { "method": "POST", "path": "/mail/test", "name": "mail-test" },
          { "method": "POST", "path": "/mail/read", "name": "mail-read" },
          { "method": "POST", "path": "/mail/draft", "name": "mail-draft" },
          { "method": "POST", "path": "/mail/send", "name": "mail-send" },
          { "method": "GET", "path": "/tunnels", "name": "tunnels" }
        ],
        "method": "DELETE",
        "path": "/jobs/JOB-20261012-1000-1999"
      },
      "result": { "route": "cancel-job", "params": { "id": "JOB-20261012-1000-1999" } }
    },
    {
      "name": "hello posted",
      "input": {
        "table": [
          { "method": "GET", "path": "/hello", "name": "hello" },
          { "method": "GET", "path": "/agents", "name": "agents" },
          { "method": "POST", "path": "/jobs", "name": "start-job" },
          { "method": "GET", "path": "/jobs", "name": "jobs" },
          { "method": "GET", "path": "/jobs/:id", "name": "job" },
          { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" },
          { "method": "DELETE", "path": "/jobs/:id", "name": "cancel-job" },
          { "method": "GET", "path": "/endpoint/models", "name": "endpoint-models" },
          { "method": "POST", "path": "/endpoint/chat", "name": "endpoint-chat" },
          { "method": "POST", "path": "/mail/test", "name": "mail-test" },
          { "method": "POST", "path": "/mail/read", "name": "mail-read" },
          { "method": "POST", "path": "/mail/draft", "name": "mail-draft" },
          { "method": "POST", "path": "/mail/send", "name": "mail-send" },
          { "method": "GET", "path": "/tunnels", "name": "tunnels" }
        ],
        "method": "POST",
        "path": "/hello"
      },
      "refused": "not-allowed"
    },
    {
      "name": "no such path",
      "input": {
        "table": [
          { "method": "GET", "path": "/hello", "name": "hello" },
          { "method": "GET", "path": "/agents", "name": "agents" },
          { "method": "POST", "path": "/jobs", "name": "start-job" },
          { "method": "GET", "path": "/jobs", "name": "jobs" },
          { "method": "GET", "path": "/jobs/:id", "name": "job" },
          { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" },
          { "method": "DELETE", "path": "/jobs/:id", "name": "cancel-job" },
          { "method": "GET", "path": "/endpoint/models", "name": "endpoint-models" },
          { "method": "POST", "path": "/endpoint/chat", "name": "endpoint-chat" },
          { "method": "POST", "path": "/mail/test", "name": "mail-test" },
          { "method": "POST", "path": "/mail/read", "name": "mail-read" },
          { "method": "POST", "path": "/mail/draft", "name": "mail-draft" },
          { "method": "POST", "path": "/mail/send", "name": "mail-send" },
          { "method": "GET", "path": "/tunnels", "name": "tunnels" }
        ],
        "method": "GET",
        "path": "/admin"
      },
      "refused": "not-found"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.newToken",
  "summary": "A new pairing token: 256 random bits as 64 hexadecimal characters, drawn from the random port.",
  "params": [{ "name": "random", "type": "RandomPort" }],
  "result": "string",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "from a draw",
      "input": {
        "random": [0.01, 0.37, 0.92, 0.55, 0.18, 0.73, 0.44, 0.08, 0.64, 0.29, 0.86, 0.12, 0.5, 0.97, 0.23, 0.69, 0.31, 0.78, 0.05, 0.6, 0.94, 0.16, 0.42, 0.87, 0.27, 0.53, 0.11, 0.99, 0.35, 0.66, 0.2, 0.81]
      },
      "result": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.bridgeRequest",
  "summary": "The request a route takes to the bridge: to its loopback address, or to the HTTPS address of its session on the jump host with the web server's login in Authorization (ARC-013); the bridge token in a header of its own, never in the address; a JSON body where there is one.",
  "params": [
    { "name": "route", "type": "BridgeRoute" },
    { "name": "token", "type": "string" },
    { "name": "method", "type": "string" },
    { "name": "path", "type": "string" },
    { "name": "body", "type": "any", "optional": true }
  ],
  "result": "BridgeCall",
  "async": false,
  "refusals": [
    { "code": "no-token", "when": "no bridge token is given" },
    { "code": "not-an-address", "when": "the route's address is no address" },
    { "code": "not-loopback", "when": "a loopback route names another address" },
    { "code": "not-https", "when": "an HTTPS route names another scheme" },
    { "code": "no-login", "when": "an HTTPS route has no web-server login" },
    { "code": "unknown-route", "when": "the route is of another kind" }
  ],
  "examples": [
    {
      "name": "hello on this computer",
      "input": {
        "route": { "kind": "loopback", "address": "http://127.0.0.1:47321" },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello"
      },
      "result": {
        "method": "GET",
        "url": "http://127.0.0.1:47321/hello",
        "headers": { "Agent-M-Bridge-Token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
      }
    },
    {
      "name": "a job through the jump host",
      "input": {
        "route": {
          "kind": "https",
          "url": "https://jump.example.org/agent-m/41001",
          "login": { "user": "alice", "password": "s3cret-for-the-web-server" }
        },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "POST",
        "path": "/jobs",
        "body": { "job": "JOB-20261012-1000-1999" }
      },
      "result": {
        "method": "POST",
        "url": "https://jump.example.org/agent-m/41001/jobs",
        "headers": { "Agent-M-Bridge-Token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "Authorization": "Basic YWxpY2U6czNjcmV0LWZvci10aGUtd2ViLXNlcnZlcg==", "Content-Type": "application/json" },
        "body": { "job": "JOB-20261012-1000-1999" }
      }
    },
    {
      "name": "no token stored",
      "input": {
        "route": { "kind": "loopback", "address": "http://127.0.0.1:47321" },
        "token": "",
        "method": "GET",
        "path": "/hello"
      },
      "refused": "no-token"
    },
    {
      "name": "an address that is not loopback",
      "input": {
        "route": { "kind": "loopback", "address": "http://192.168.1.20:47321" },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello"
      },
      "refused": "not-loopback"
    },
    {
      "name": "the jump host without its login",
      "input": {
        "route": {
          "kind": "https",
          "url": "https://jump.example.org/agent-m/41001",
          "login": { "user": "alice", "password": "" }
        },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello"
      },
      "refused": "no-login"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.callBridge",
  "summary": "The answer of the bridge to one request, each refusal named: no answer — the bridge does not run there, the address is wrong, or the browser blocks the call —; the jump host's web server refusing its login; the bridge refusing the token, the page's origin or the address; a path or method it does not know; another error.",
  "params": [
    { "name": "route", "type": "BridgeRoute" },
    { "name": "token", "type": "string" },
    { "name": "method", "type": "string" },
    { "name": "path", "type": "string" },
    { "name": "body", "type": "any", "optional": true },
    { "name": "fetch", "type": "FetchPort" }
  ],
  "result": "any",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "no bridge token is given" },
    { "code": "not-an-address", "when": "the route's address is no address" },
    { "code": "not-loopback", "when": "a loopback route names another address" },
    { "code": "not-https", "when": "an HTTPS route names another scheme" },
    { "code": "no-login", "when": "an HTTPS route has no web-server login" },
    { "code": "unknown-route", "when": "the route is of another kind" },
    { "code": "unreachable", "when": "no answer arrives" },
    { "code": "login-refused", "when": "the jump host's web server refuses its login" },
    { "code": "token-refused", "when": "the bridge refuses the token" },
    { "code": "refused", "when": "the bridge refuses the page's origin or the address" },
    { "code": "not-found", "when": "the bridge has no such path" },
    { "code": "not-allowed", "when": "the bridge does not take the method" },
    { "code": "bridge-error", "when": "the bridge answers with another error" }
  ],
  "examples": [
    {
      "name": "the bridge greets",
      "input": {
        "route": { "kind": "loopback", "address": "http://127.0.0.1:47321" },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello",
        "fetch": [
          {
            "request": { "method": "GET", "url": "http://127.0.0.1:47321/hello" },
            "response": {
              "status": 200,
              "headers": { "access-control-allow-origin": "https://alice.github.io" },
              "body": {
                "protocol": 1,
                "version": "2026.10.1",
                "pairedOrigin": "https://alice.github.io",
                "shell": { "mode": "tray", "reason": "" },
                "agents": [
                  { "agent": "claude", "version": "2.1.290", "state": "ready", "loginStep": "", "install": "" },
                  { "agent": "codex", "version": "0.48.0", "state": "not-logged-in", "loginStep": "codex login", "install": "" },
                  { "agent": "opencode", "version": "", "state": "missing", "loginStep": "", "install": "https://opencode.ai/docs/#install" }
                ]
              }
            }
          }
        ]
      },
      "result": {
        "protocol": 1,
        "version": "2026.10.1",
        "pairedOrigin": "https://alice.github.io",
        "shell": { "mode": "tray", "reason": "" },
        "agents": [
          { "agent": "claude", "version": "2.1.290", "state": "ready", "loginStep": "", "install": "" },
          { "agent": "codex", "version": "0.48.0", "state": "not-logged-in", "loginStep": "codex login", "install": "" },
          { "agent": "opencode", "version": "", "state": "missing", "loginStep": "", "install": "https://opencode.ai/docs/#install" }
        ]
      }
    },
    {
      "name": "a token the bridge no longer holds",
      "input": {
        "route": { "kind": "loopback", "address": "http://127.0.0.1:47321" },
        "token": "cf33a859fd1c8745de6b28f0990cc74fb03af8801edc4aa31470ba2e8ceb5e02",
        "method": "GET",
        "path": "/hello",
        "fetch": [
          {
            "request": { "method": "GET", "url": "http://127.0.0.1:47321/hello" },
            "response": {
              "status": 401,
              "headers": { "access-control-allow-origin": "https://alice.github.io" },
              "body": ""
            }
          }
        ]
      },
      "refused": "token-refused"
    },
    {
      "name": "nothing answers",
      "input": {
        "route": { "kind": "loopback", "address": "http://127.0.0.1:47321" },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello",
        "fetch": []
      },
      "refused": "unreachable"
    },
    {
      "name": "the web server refuses its login",
      "input": {
        "route": {
          "kind": "https",
          "url": "https://jump.example.org/agent-m/41001",
          "login": { "user": "alice", "password": "s3cret-for-the-web-server" }
        },
        "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf",
        "method": "GET",
        "path": "/hello",
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://jump.example.org/agent-m/41001/hello" },
            "response": { "status": 401, "headers": { "www-authenticate": "Basic realm=\"agent-m\"" }, "body": "" }
          }
        ]
      },
      "refused": "login-refused"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-server.speaks",
  "summary": "Whether the dashboard speaks the bridge's protocol: the major version GET /hello names; a bridge of another major version is refused.",
  "params": [{ "name": "hello", "type": "Hello" }],
  "result": "ProtocolVersion",
  "async": false,
  "refusals": [{ "code": "other-protocol", "when": "the bridge names another major version" }],
  "examples": [
    {
      "name": "this protocol",
      "input": {
        "hello": {
          "protocol": 1,
          "version": "2026.10.1",
          "pairedOrigin": "https://alice.github.io",
          "shell": { "mode": "tray", "reason": "" },
          "agents": [
            { "agent": "claude", "version": "2.1.290", "state": "ready", "loginStep": "", "install": "" },
            { "agent": "codex", "version": "0.48.0", "state": "not-logged-in", "loginStep": "codex login", "install": "" },
            { "agent": "opencode", "version": "", "state": "missing", "loginStep": "", "install": "https://opencode.ai/docs/#install" }
          ]
        }
      },
      "result": { "protocol": 1 }
    },
    {
      "name": "a newer protocol",
      "input": {
        "hello": {
          "protocol": 2,
          "version": "2026.10.1",
          "pairedOrigin": "https://alice.github.io",
          "shell": { "mode": "tray", "reason": "" },
          "agents": [
            { "agent": "claude", "version": "2.1.290", "state": "ready", "loginStep": "", "install": "" },
            { "agent": "codex", "version": "0.48.0", "state": "not-logged-in", "loginStep": "codex login", "install": "" },
            { "agent": "opencode", "version": "", "state": "missing", "loginStep": "", "install": "https://opencode.ai/docs/#install" }
          ]
        }
      },
      "refused": "other-protocol"
    }
  ]
}
```

## Types

```json type
{
  "$id": "BindAddress",
  "description": "The address the bridge listens on.",
  "type": "object",
  "required": ["address"],
  "additionalProperties": false,
  "properties": { "address": { "type": "string", "enum": ["127.0.0.1", "::1", "localhost"] } },
  "examples": [{ "address": "127.0.0.1" }]
}
```

```json type
{
  "$id": "BridgeDefault",
  "description": "The bridge's port unless its window sets another, and the address of a bridge on this computer that the dashboard presets.",
  "type": "object",
  "required": ["port", "address"],
  "additionalProperties": false,
  "properties": {
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "address": { "type": "string", "pattern": "^http://127\\.0\\.0\\.1:[0-9]+$" }
  },
  "examples": [{ "port": 47321, "address": "http://127.0.0.1:47321" }]
}
```

```json type
{
  "$id": "BridgeRequestIn",
  "description": "A request as the bridge's server sees it: its method, its path with any query, and its headers by lower-case name.",
  "type": "object",
  "required": ["method", "path", "headers"],
  "additionalProperties": false,
  "properties": {
    "method": { "type": "string", "minLength": 1 },
    "path": { "type": "string", "pattern": "^/" },
    "headers": { "type": "object", "additionalProperties": { "type": "string" } }
  },
  "examples": [
    {
      "method": "GET",
      "path": "/hello",
      "headers": { "host": "127.0.0.1:47321", "origin": "https://alice.github.io", "agent-m-bridge-token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
    }
  ]
}
```

```json type
{
  "$id": "BridgeGate",
  "description": "What the bridge admits a request by: its pairing token, and the origin it is paired with — empty while unpaired.",
  "type": "object",
  "required": ["token", "pairedOrigin"],
  "additionalProperties": false,
  "properties": {
    "token": { "type": "string", "pattern": "^[0-9a-f]{64}$" },
    "pairedOrigin": { "type": "string", "pattern": "^(https://[^/]+|http://(127\\.0\\.0\\.1|localhost)(:[0-9]+)?)?$" }
  },
  "examples": [
    { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "https://alice.github.io" },
    { "token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "pairedOrigin": "" }
  ]
}
```

```json type
{
  "$id": "Admission",
  "description": "Whether a request is admitted, the status of a request answered here — 204 for a preflight, 401 or 403 for a refusal, 200 for one admitted to its route —, the headers to answer with, the origin to record as paired — empty for none —, and why.",
  "type": "object",
  "required": ["admitted", "status", "headers", "pairs", "reason"],
  "additionalProperties": false,
  "properties": {
    "admitted": { "type": "boolean" },
    "status": { "type": "integer", "minimum": 200, "maximum": 499 },
    "headers": { "type": "object", "additionalProperties": { "type": "string" } },
    "pairs": { "type": "string", "pattern": "^(https://[^/]+|http://(127\\.0\\.0\\.1|localhost)(:[0-9]+)?)?$" },
    "reason": { "type": "string" }
  },
  "examples": [
    {
      "admitted": true,
      "status": 200,
      "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
      "pairs": "",
      "reason": ""
    },
    {
      "admitted": false,
      "status": 401,
      "headers": { "access-control-allow-origin": "https://alice.github.io", "vary": "Origin" },
      "pairs": "",
      "reason": "the request carries no token, or not the bridge's"
    }
  ]
}
```

```json type
{
  "$id": "RouteEntry",
  "description": "An endpoint of the bridge: its method, its path — a segment beginning with a colon names a parameter —, and the name of its handler.",
  "type": "object",
  "required": ["method", "path", "name"],
  "additionalProperties": false,
  "properties": {
    "method": { "type": "string", "enum": ["GET", "POST", "DELETE"] },
    "path": { "type": "string", "pattern": "^/" },
    "name": { "type": "string", "minLength": 1 }
  },
  "examples": [
    { "method": "GET", "path": "/hello", "name": "hello" },
    { "method": "GET", "path": "/jobs/:id/log", "name": "job-log" }
  ]
}
```

```json type
{
  "$id": "RouteMatch",
  "description": "The handler a request goes to and the parameters of its path.",
  "type": "object",
  "required": ["route", "params"],
  "additionalProperties": false,
  "properties": {
    "route": { "type": "string", "minLength": 1 },
    "params": { "type": "object", "additionalProperties": { "type": "string" } }
  },
  "examples": [{ "route": "job-log", "params": { "id": "JOB-20261012-1000-1999" } }]
}
```

```json type
{
  "$id": "BridgeLogin",
  "description": "The jump host's web-server login: its user and password, kept in the browser only.",
  "type": "object",
  "required": ["user", "password"],
  "additionalProperties": false,
  "properties": { "user": { "type": "string" }, "password": { "type": "string" } },
  "examples": [{ "user": "alice", "password": "s3cret-for-the-web-server" }]
}
```

```json type
{
  "$id": "BridgeRoute",
  "description": "How the dashboard reaches a bridge: at a loopback address — the bridge on this computer, or a forward to it —, or at the HTTPS address of its session on the jump host with the web server's login.",
  "anyOf": [
    {
      "type": "object",
      "required": ["kind", "address"],
      "additionalProperties": false,
      "properties": { "kind": { "const": "loopback" }, "address": { "type": "string", "minLength": 1 } }
    },
    {
      "type": "object",
      "required": ["kind", "url", "login"],
      "additionalProperties": false,
      "properties": {
        "kind": { "const": "https" },
        "url": { "type": "string", "minLength": 1 },
        "login": { "$ref": "BridgeLogin" }
      }
    }
  ],
  "examples": [
    { "kind": "loopback", "address": "http://127.0.0.1:47321" },
    {
      "kind": "https",
      "url": "https://jump.example.org/agent-m/41001",
      "login": { "user": "alice", "password": "s3cret-for-the-web-server" }
    }
  ]
}
```

```json type
{
  "$id": "BridgeCall",
  "description": "A request to the bridge as the fetch port sends it: its method, its address, its headers — the bridge token always, the web server's login on the HTTPS route, the content type where there is a body —, and a JSON body only where there is one.",
  "type": "object",
  "required": ["method", "url", "headers"],
  "additionalProperties": false,
  "properties": {
    "method": { "type": "string", "enum": ["GET", "POST", "DELETE"] },
    "url": { "type": "string", "pattern": "^https?://" },
    "headers": { "type": "object", "additionalProperties": { "type": "string" } },
    "body": {}
  },
  "examples": [
    {
      "method": "GET",
      "url": "http://127.0.0.1:47321/hello",
      "headers": { "Agent-M-Bridge-Token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf" }
    },
    {
      "method": "POST",
      "url": "https://jump.example.org/agent-m/41001/jobs",
      "headers": { "Agent-M-Bridge-Token": "025eeb8c2eba7014a34adc1e80f83ab04fc70c99f0286bde45871cfd59a833cf", "Authorization": "Basic YWxpY2U6czNjcmV0LWZvci10aGUtd2ViLXNlcnZlcg==", "Content-Type": "application/json" },
      "body": { "job": "JOB-20261012-1000-1999" }
    }
  ]
}
```

```json type
{
  "$id": "ProtocolVersion",
  "description": "The protocol's major version both ends speak.",
  "type": "object",
  "required": ["protocol"],
  "additionalProperties": false,
  "properties": { "protocol": { "const": 1 } },
  "examples": [{ "protocol": 1 }]
}
```
