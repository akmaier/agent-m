---
id: ITM-853
title: The settings page follows a product token's clear and any stored token
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-settings-pages
builds_on:
  - ITM-825
tests:
  - unit
origin:
  - ITM-825's pull request #804 (sprint team1/79), from developer-sonnet-a's findings
---
# ITM-853 The settings page follows a product token's clear and any stored token

**REGISTER**

## Outcome

ITM-825 reconnects the settings page's hosts after *Clear everything* and after clearing a repository token on its line.
Two more places stay:
- **A product's token.** *Clear* on the product list and *Remove* (`src/settings-pages/settings.mjs` ~:438-443 and
  ~:693-698) clear it through `clearProductToken`, but do not reconnect `context.product.host`. A product with its own
  token keeps sending it until a reload, against `A CLEAR IS A REAL CLEAR`.
- **A token stored after a clear** is not used by the page's hosts until a reload. That was so before ITM-825.

Both reconnect through ITM-825's `reconnectHosts`. A test records each request's authorisation after the action.

## Acceptance

- After a product token is cleared, no request of the open page carries it. After a token is stored, the page's next
  request carries it. Tests pin both, with their counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
