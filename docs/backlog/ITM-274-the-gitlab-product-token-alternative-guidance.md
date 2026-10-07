---
id: ITM-274
title: The GitLab product-token alternative guidance
level: module
realises:
  - UC-001
  - GITLAB PRODUCTS ARE SUPPORTED
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-265
  - ITM-273
tests:
  - unit
origin:
  - UC-001
---
# ITM-274 The GitLab product-token alternative guidance

**REGISTER**

## Outcome

Correct UC-001 alternative3d in the public add-product route. After opening the project's external Access tokens page,
the author can indicate the applicable reason in the existing unsaved screen: the server offers no project access
tokens, or the author is not Maintainer. The active guidance names that reason separately, explains that a personal
token with api scope reaches every project the author can reach on that server, and leaves the decision to the author.
Keep the normal project-token route and its server-local credential handling. Separate, explicitly labeled guidance
branches are sufficient; do not invent automatic detection, another server API, or a persistent reason setting.

The existing failure path is dashboard #add → products.mjs renderSteps/paintStepA → gitlabStepABody →
gitlabNoProjectTokens(host). Both conditions are currently combined in the same conditional text, before and after
checking either a Maintainer or a non-Maintainer fixture. The author cannot select which condition the external page
showed. Accepted repositoryInfo exposes canWrite, not project-token availability; do not infer a specific cause from
that boolean. This is an owned implementation correction under the existing accepted use case and View interface.

## Acceptance

- New unit cases use public view/Route.render and actual author controls to select each reported external-page reason.
  Each resulting branch specifically names the selected condition, has an expandable explanation, and states the
  broader reach of a personal token before the person decides whether to use it or seek project access. No personal
  credential is chosen, generated or substituted automatically. Reason selection stays in the unsaved screen.
- A known-positive normal GitLab project-token path remains available with its Access tokens link, Maintainer/api/
  expiry guidance, notice, Store and check, and trusted Add-product action. Existing successful result, per-project
  token persistence, GitLab-only destination and instance-token preservation remain unchanged.
- Both alternative branches preserve the author-controlled token input/check/add path and the ability to decline
  the broader token. Selecting a reason alone writes no repository, browser credential or product list and contacts
  no server. Test cases do not invent a GitLab availability response or require automatic role detection.
- Only src/settings-pages/ and tests naming MOD-settings-pages change. Preserve every existing add-product and endpoint
  asserted result, public interface and trusted/synthetic write boundary. No repository-hosts/browser-store, unowned
  dashboard, SPEC, use-case or architecture changes are included.
- First writing commit contains tests only with actual red CI at the missing public branch/result; final exact-head
  CI is green. Each new case has a unique identifier, unit level, guard, module, readable precondition/input/expected
  result and an individually observed planted-fault failure followed by restoration. PR evidence names the concrete
  public caller/data path, known positive and actual/expected failure node. Every generated writing commit carries
  Agent-M-Version, Agent-M-Participant and Agent-M-Model provenance. No paid service is called.

Start only after ITM-265 and ITM-273 are merged into sprint/09. This serializes owned MOD-settings-pages changes.
ITM-245 independently tests the corrected integrated UC-001 after this item merges; its test author implements none
of this correction.
