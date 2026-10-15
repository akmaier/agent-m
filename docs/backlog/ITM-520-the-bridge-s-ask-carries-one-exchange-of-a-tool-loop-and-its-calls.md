---
id: ITM-520
title: The Bridge's ask carries one exchange of a tool loop and its calls
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-bridge-http
  - MOD-bridge-client
builds_on:
tests:
  - unit
origin:
  - MOD-bridge-http and MOD-bridge-client, accepted by akmaier at 25d4ad40
---
# ITM-520 The Bridge's ask carries one exchange of a tool loop and its calls

**REGISTER**

## Outcome

`POST /v1/ask` takes `{ endpoint, exchange }` besides `{ agent, input }` and `{ endpoint, input }`, and the answer of
`GET /v1/ask/{ask}` carries `calls`, each `{ id, name, args }`, empty for any other request, as MOD-bridge-http's wire
states. MOD-bridge-client's `ask` sends the exchange and returns `{ text, calls, usage }`. The Bridge's side, which
answers an exchange with `endpointExchange`, and the tab's loop through it are ITM-497's.

The existing tests whose expected result the accepted module files change, each named here:

- TST-323001 (`tests/bridge-http-323.test.mjs`): the request of `POST /v1/ask` and the answer of `GET /v1/ask/{ask}`;
- TST-324003 (`tests/bridge-client-324.test.mjs`): `ask` returns `calls` beside `text` and `usage`;
- TST-324902 (`tests/bridge-release-21.test.mjs`), a release test: `ask` returns `calls` beside `text` and `usage`;
  changed by developer-sonnet-e, who implemented none of the Bridge client's behaviour, never by this item's
  implementer (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- `ask` with an exchange sends exactly the wire's body to a fixture Bridge and returns the calls it answered; with an
  agent or an input, `calls` is empty.
- The wire's schema accepts the three request bodies and the answer with `calls`.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); a
  further existing test that the change turns red is not changed here: the Developer stops and names it.
