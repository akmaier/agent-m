---
id: ITM-1003
title: The Bridge's server tells which origin it is paired with
level: module
realises:
  - UC-044
  - THE BRIDGE IS PAIRED ONCE
modules:
  - MOD-bridge-http
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-14 (its MOD-bridge-http part), read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1003 The Bridge's server tells which origin it is paired with

**REGISTER**

## Outcome

UC-044-install-and-pair-the-bridge.md:81-82 (step 4): "… and tests it; the bridge's window shows *paired with
`<owner>.github.io`*." `serveBridge` returns `{ address, token, close }` and no `pairedWith`
(`src/bridge-http/server.mjs:109`). ITM-1004 shows it in the window.

## The accepted text

Quoted from `main` at 40e04d8d, MOD-bridge-http.md:84-88:

> - `serveBridge(config: { host: string, port: number, origin: string, dataFolder: string, paused: () => boolean }, handlers:
>   BridgeHandlers) -> Promise<{ address: string, token: string, pairedWith: () -> string | null, close: () -> Promise<void>
>   }>` — starts the server, and returns its address and the pairing token in force, made on the first start, for the
>   Bridge's window; `pairedWith()` is the origin of the first request since this start that carried the token in force and
>   came from `origin`, and `null` before one did and again after `pairAnew` (UC-044, pairing). It is kept in memory …

## Acceptance

- Unit tests naming MOD-bridge-http, over a server on `127.0.0.1`: `pairedWith()` is `null` after the start; after a
  request with the token from `origin`, it is that origin; after `pairAnew`, `null` again until the next such request.
- Counter-proofs: a request from another origin, or with a wrong token, leaves it `null`; a restart gives `null` (kept in
  memory only, nothing written to the data folder).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-http/` and the tests that name MOD-bridge-http change.
