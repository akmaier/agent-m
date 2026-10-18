---
id: ITM-512
title: The settings test an endpoint's tools and name a subagent's starter
level: module
realises:
  - UC-003
  - UC-017
  - UC-049
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-483
  - ITM-487
  - ITM-511
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-settings-pages, Interfaces: view (`endpoints`, `participants`)
---
# ITM-512 The settings test an endpoint's tools and name a subagent's starter

**REGISTER**

## Outcome

The route `endpoints` shows, after the test request, whether the model called the tool — *can use tools* or *text
only*. With *text only*, the endpoint's message, if it gave one, is shown folded (UC-003 5a; MOD-endpoint-calls'
`testEndpoint` already returns it as `toolMessage`). The route `participants` offers, for a subagent, the CLI agent that starts it; for a model endpoint, *use tools*
preset from its last test and the CI secret of its key; and a folded explanation of when the prompt bar appears
(UC-049 1a).

## Acceptance

- In a small DOM with fixture endpoints, both answers of the test are shown, and a text-only endpoint's message is
  folded. The participants' parts are ITM-998's and ITM-999's.

**Narrowed at its stop (sprint team1/92, developer-sonnet-a).** This item builds the route `endpoints`' answer, *can use
tools* or *text only*, with the message folded (MOD-settings-pages.md:168, UC-003 5a). `testEndpoint`'s branches were
run against a fake fetch:
- tools true;
- text only, with a message;
- empty;
- a 400 "tools not supported";
- a 401.

The two other parts need what no accepted text gives:
- the preset of *use tools* needs a stored source, which is ITM-998's;
- the subagent's CLI agent needs `reachedThrough` in the module's uses, which is ITM-999's.

