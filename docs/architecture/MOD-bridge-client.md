---
id: MOD-bridge-client
title: The page's client of a Bridge, and the tunnels that reach it
folder: src/bridge-client/
realises:
follows:
  - ARC-047
uses:
  - MOD-bridge-http.bridgeApi
provides:
  - Bridge
  - BridgeSettings
  - JumpHost
  - RemoteSession
  - TunnelPlan
  - BridgeError
  - bridgeAt
  - pair
  - testBridge
  - handOver
  - askAgent
  - bridgeJobs
  - bridgeJobLog
  - cancelOnBridge
  - mailCall
  - probe
  - allocatePort
  - tunnelCommands
  - proxyConfiguration
---
# MOD-bridge-client The page's client of a Bridge, and the tunnels that reach it

## Responsibility

It belongs to Access (ARC-047). It is the client side of the Bridge's API (ARC-040) and follows that API's protocol,
`bridgeApi`, exactly as MOD-bridge-http defines it — its routes, the header that carries the pairing token, its request
and answer fields, its error codes; the protocol is the Bridge's, and this client reads it from `bridgeApi` itself, so the
two never disagree. It reaches a Bridge directly on the computer's loopback, through a forward to the jump host, or at the
jump host's HTTPS address with the web server's own login, always with the Bridge's token (`THE LOCAL BRIDGE REQUIRES A
TOKEN`); it pairs, tests, hands over jobs, asks an agent to draft, follows and cancels jobs, passes mail operations and
probes; and it names why a Bridge cannot be reached, as far as a browser lets a page know. It also owns the plan of a
tunnel to a computer behind NAT, and writes for a person the commands of both ends and the configuration of the jump
host's web server (`THE DASHBOARD WRITES THE TUNNEL COMMANDS`). It runs in a browser and in Node.

## Parts

- `index.mjs` — the interface.
- `client.mjs` — requests to a Bridge along `bridgeApi`, and the failures they meet.
- `tunnels.mjs` — the tunnel plan, the allocation of ports and the commands.
- `proxy.mjs` — the configuration of the jump host's web server.

## Data

It keeps nothing; its callers read the Bridge's address and token, the jump host and the remote sessions from the
browser's store and hand them in. It owns the **tunnel plan**, which the Bridge's MOD-tunnels opens and the commands
below write out:

```json
{ "direction": "reverse", "jumpHost": "jump.example.org", "user": "alice", "sshPort": 22,
  "remotePort": 40101, "bind": "127.0.0.1", "bridgePort": 4711, "keyFile": "~/.ssh/agent-m-lab" }
```

`direction` is `reverse` on the computer behind NAT — the jump host's `remotePort` forwarded to the Bridge's
`bridgePort` — or `forward` on the person's computer — its local `remotePort` forwarded to the jump host's `remotePort`.
`bind` is always the jump host's loopback (`A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`). `bridgePort` is
the Bridge's port, `bridgeApi`'s default unless the Bridge's settings name another. `keyFile` names the key the command
uses; the key itself stays on its computer.

## Interfaces

- `Bridge` — `{ address: string, route: "loopback" | "forward" | "jump-host" }`: the handle of one Bridge that `bridgeAt`
  returns and every call below takes — its address, and whether it is reached on this computer's loopback, through a
  forward to the jump host, or at the jump host's HTTPS address. It carries the Bridge's token, and the jump host web
  server's login, for its own requests only, and exposes neither.
- `BridgeSettings` — `{ address: string, token: string, login?: { user: string, password: string } }`: the Bridge's
  address — `http://127.0.0.1:<port>`, a forwarded `http://localhost:<port>`, or the jump host's HTTPS address of a remote
  session —, its pairing token, and the jump host web server's login where the address is the jump host's.
- `JumpHost` — `{ hostname: string, user: string, sshPort: number, portRange: [number, number], httpsAddress?: string,
  login?: { user: string, password: string } }`.
- `RemoteSession` — `{ name: string, port: number, token: string }`.
- `TunnelPlan` — as defined under Data.
- `BridgeError` — the failures of every call below that reaches a Bridge:
  `TokenMissing` — no token is stored for this Bridge; no request is made.
  `NoAnswer { likely: ("blocked by the browser" | "not running" | "wrong address" | "another instance" | "certificate not
  trusted")[] }` — the browser let the page read no answer. A browser does not tell a page why, so the failure names what
  may be the cause, the most likely first: `blocked by the browser` where the page, served over HTTPS, calls
  `http://127.0.0.1` in a browser that refuses it, as Safari does, or a local-network permission was not given — with the
  route over HTTPS through the jump host named as the way around —; `not running`; `wrong address`; `another instance`,
  since a Bridge answers across origins only for the instance it is paired with, and its refusal cannot be read by a
  page of another origin; and, for the jump host's HTTPS address, `certificate not trusted`.
  `TokenRefused` — the Bridge answered `token-refused`: no token, or another one than it is paired with; the person pairs
  again.
  `JumpHostLoginRefused` — the jump host's web server refused its own login, before the Bridge saw the request.
  `BridgeFailed { error: "origin-refused" | "not-found" | "invalid-request" | "confirmation-refused" | "no-encryption" |
  "login-refused" | "upstream-failed" | "paused", message: string }` — one of the Bridge's own errors, by its code in
  `bridgeApi`, with the message the Bridge gave.
  `AskFailed { message: string }` — the agent asked to draft failed; `message` is the `error` of the ask's answer.
  `Timeout` — a request got no answer in time; what it asked for may still be carried out on the Bridge.
- `bridgeAt(settings: BridgeSettings) -> Bridge` — the handle of a Bridge for these settings; no request is made.
- `pair(address: string, pairingToken: string) -> Promise<BridgeSettings>` — `GET /v1/pair` at the address, with the token
  the person copied from the Bridge's window, and returns the settings to store (`THE BRIDGE IS PAIRED ONCE`). The page
  proposes `http://127.0.0.1` with `bridgeApi`'s default port as the address. Crosses the network; fails with `NoAnswer`,
  `TokenRefused`, `JumpHostLoginRefused`, `Timeout`.
- `testBridge(bridge: Bridge) -> Promise<{ bridge: { name: string, version: string, platform: string }, origin: string,
  agents: { name: string, version: string, ready: boolean, loggedIn: boolean }[], missing: { name: string }[] }>` — a
  harmless test in two requests: `GET /v1/pair`, whose answer names the Bridge and the `origin` it is paired with — the
  instance's Pages origin it answers —, and `GET /v1/agents`, the coding agents installed on its computer, each ready or
  not and logged in or not, and the supported agents missing there (UC-044, UC-017). Crosses the network; fails with
  every `BridgeError` but `AskFailed`.
- `handOver(bridge: Bridge, job: { product: string, record: string, commit: string }) -> Promise<{ accepted: string }>` —
  `POST /v1/jobs`: hands over a job whose start record is committed — the product's address, the path of its start
  record, and the commit that holds it. The Bridge runs the job from that record, so nothing else travels with it;
  `accepted` is the job's identifier. Crosses the network; fails with every `BridgeError` but `AskFailed`, among them
  `BridgeFailed` with `paused` while the Bridge is paused.
- `askAgent(bridge: Bridge, agent: string, input: unknown) -> Promise<{ text: string, usage: unknown | null }>` —
  `POST /v1/ask` with `{ agent, input }`, then `GET /v1/ask/{ask}` until the answer's state is `done` or `failed`: the
  agent's draft and the usage it reported. MOD-runtimes makes a participant driver of it. Crosses the network; fails with
  every `BridgeError`, `AskFailed` when the answer's state is `failed`, and `BridgeFailed` with `paused` while the Bridge
  is paused.
- `bridgeJobs(bridge: Bridge) -> Promise<{ id: string, product: string, kind: string, agent: string, state: string,
  started: string, usage: unknown | null }[]>` — `GET /v1/jobs`: the jobs the Bridge runs or ran since it started.
  Crosses the network; fails with every `BridgeError` but `AskFailed`.
- `bridgeJobLog(bridge: Bridge, id: string, from: number) -> Promise<{ lines: string[], next: number, ended: boolean }>` —
  `GET /v1/jobs/{id}/log?from={line}`: a job's log from a line on, so that a page can follow it. Crosses the network;
  fails with every `BridgeError` but `AskFailed`, among them `BridgeFailed` with `not-found` for a job the Bridge does not
  know.
- `cancelOnBridge(bridge: Bridge, id: string) -> Promise<{ confirmed: boolean }>` — `POST /v1/jobs/{id}/cancel`: asks the
  Bridge to end the agent's process; `confirmed` is true once it has. Crosses the network; fails as `bridgeJobLog`.
- `mailCall(bridge: Bridge, operation: "test" | "read" | "find" | "drafts" | "sent" | "store-draft" | "update-draft" |
  "show-draft" | "confirm-send" | "send", connection: unknown, args: unknown) -> Promise<unknown>` —
  `POST /v1/mail/{operation}` with `{ connection, args }`: one mailbox operation, with the IMAP connection and its
  password inside the request, which is the only way the password leaves the browser (`THE MAILBOX PASSWORD LEAVES THE
  BROWSER ONLY TO THE BRIDGE`). The fields of the connection, the arguments and the answer are those MOD-mail-routes
  defines; `confirm-send` and `send` carry the single-use confirmation as `bridgeApi` defines it. Crosses the network;
  fails with every `BridgeError` but `AskFailed`, among them `BridgeFailed` with `confirmation-refused`, `no-encryption`,
  `login-refused`, `upstream-failed` — the mail server's own message — or `paused`.
- `probe(bridge: Bridge, kind: "agent" | "endpoint-models" | "partitions", args: unknown) -> Promise<unknown>` and
  `probe(bridge: Bridge, kind: "endpoint-test", args: bridgeApi's endpoint-test configuration) -> Promise<bridgeApi's
  endpoint-test answer>` — `POST /v1/probes/{kind}` with `{ args }`, resolving with the answer's
  `answer`: an agent answers a harmless request, an endpoint lists its served models, the explicitly chosen local
  endpoint configuration receives UC-003's short test on the Bridge, or a cluster lists its partitions. The endpoints
  page maps its saved `{ url, kind, model, key?, throughBridge }` record to the Bridge API endpoint-test configuration only for
  `throughBridge: true`: its selected name and kind, `url` as `baseUrl`, optional `key` as `key ?? null`, and model.
  A result with `works: false` is the provider or local-endpoint diagnosis returned by `testEndpoint`; an invalid body or
  Bridge transport failure is the named `BridgeError`, not a diagnosis. Crosses the network; fails with every
  `BridgeError` but `AskFailed`, among them `BridgeFailed` with `upstream-failed` or `paused`.
- `allocatePort(range: [number, number], sessions: RemoteSession[]) -> number` — the lowest port of the range that no
  session holds (`EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE`). Throws `NoFreePort` naming the range.
- `tunnelCommands(jumpHost: JumpHost, session: RemoteSession, bridgePort: number, keyFiles: { remote: string, local:
  string }) -> { reverse: string, forward: string, plans: TunnelPlan[], service: string }` — the two commands of UC-011,
  filled in: the reverse tunnel for the computer behind NAT, `ssh -N -R 127.0.0.1:<port>:127.0.0.1:<bridge port>`, and
  the forward for the person's computer, `ssh -N -L <port>:127.0.0.1:<port>`, each with keep-alive options and the key
  file it uses, to `<user>@<jump host>`; the plans they carry out; and how to keep the reverse tunnel running as a
  service. No request is made.
- `proxyConfiguration(jumpHost: JumpHost, sessions: RemoteSession[], instanceOrigin: string, server: "apache" | "nginx")
  -> string` — the configuration of the jump host's web server for the route over HTTPS: its own login over TLS before
  anything is forwarded (`THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`); cross-origin requests allowed
  for the instance's Pages origin only, preflights answered by the web server itself and never forwarded (`THE JUMP HOST
  ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`); each session's path forwarded to its port on the jump host's
  loopback (`A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`); and the note that its certificate must come from
  an authority the browsers trust. No request is made.

## Files

It reads and writes no file.

## Uses

- `MOD-bridge-http.bridgeApi` — the protocol of the Bridge's API, as data: its default port, its routes with their methods,
  request and answer fields, the header that carries the token, and its error codes. This client builds every request
  from it and reads every answer by it. A remote use: the Bridge answers over HTTP.
