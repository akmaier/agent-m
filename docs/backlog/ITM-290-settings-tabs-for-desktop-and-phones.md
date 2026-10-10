---
id: ITM-290
title: Settings tabs for desktop and phones
level: module
realises:
  - UC-042
  - UC-003
  - UC-017
  - UC-047
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - EVERY STEP EXPLAINS ITSELF
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
modules:
  - MOD-settings-pages
  - MOD-personal-data
  - MOD-browser-store
builds_on:
  - ITM-288
tests:
  - unit
  - component
origin:
  - UC-042
---
# ITM-290 Settings tabs for desktop and phones

**REGISTER**

## Outcome

Organize the actual Settings page into the person's requested preliminary tabs: **General**, **Repositories**,
**Endpoints & Agents**, and **Usability**. Every current setting remains reachable from Settings. The organization
identifies which settings belong to this browser, the instance repository or the chosen product, as UC-042 requires;
changing a tab changes the view, never the stored configuration or a repository.

General holds instance and browser-wide management, including export, import and clear. Repositories holds repository
connections, their tokens and product settings. Endpoints & Agents holds model endpoint, participant and Bridge setup
and their existing guided routes. Usability holds notifications and existing interface preferences. Map the actual
implemented controls in planning; add no speculative setting merely to fill a tab.

## Acceptance

- The four named tabs select their associated content on the same Settings page, with an obvious selected state,
  accessible names, keyboard operation and focus behavior. All settings and their existing actions/explanations are
  reachable; their browser/instance/product scope remains visible.
- Switching tabs preserves unfinished input and displayed test results. Test, Change, Clear, Show, expiry/renewal,
  export/import and repository Edit/Save keep their actual existing behavior and notices. Secrets remain hidden until
  explicitly shown. Tab selection sends no endpoint request, asks no notification permission and writes no repository.
- On phone-width viewports, the tabs and forms fit the page, labels remain readable, touch controls are usable, and
  the page has no horizontal overflow. Long addresses, notices and command text do not force the page wider. Observe
  actual rendered layout on controlled Linux browser fixtures at narrow and desktop widths, rather than claiming
  mobile usability from DOM or CSS text alone. No personal device control is used.
- Browser notification implementation and the person's existing delivery confirmation are preserved; organizing the
  notification controls does not require another native notification experiment.

## Delivery and verification

Read full originals AGENTS/SPEC, affected UC-042/003/017/047 and MOD-settings-pages, and the working public Settings
composition before implementation. Use the existing Settings module and shared page appearance; no new architecture,
duplicate settings store or additional UI framework is needed for this organization. Preserve UC-042's storage-scope
sections within the tab organization. The accepted public caller currently composes canonical and legacy sections;
any necessary unowned caller/style change is separately scoped and reviewed between jobs under SPEC §11, after its
owned prerequisite is delivered. The actual public page, rather than an isolated unused tab widget, is the outcome.

The minimum accepted producer foundation is part of this selected item: MOD-personal-data delivers only
`settingsSchemas()` and `pseudonymisationOf()` with its two schemas through MOD-documents; MOD-browser-store delivers
only `clearEverything()` and `secretValues()` for whole browser clear and the Host's commit refusal. These are separate
owned source jobs before the Settings consumer, with fresh published Starts and tests-only first red CI. They add no
privacy strategy, people search, mailbox setup, participant editor or general expiry scanner. Existing public
ViewContext already includes instance and product Hosts; the later caller supplies that context rather than inventing
another cross-module interface.

The existing product controls read legacy settings bullets and collaborator agreement dates. Their current off state,
names/accounts/consent dates and unrelated document content must survive the public-module replacement. Accepted
schemas own canonical formats. Source delivery demonstrates the supported reading/writing boundary against existing
bytes before the caller removes legacy code; it cannot silently turn off into on or discard consent records. A finding
that cannot be resolved against the accepted originals is returned before implementation changes those contracts.

Source work starts only after PO selection in a sprint and the required tests-only first red CI. Every new case has
readable canonical declarations and its own relevant guarded-code fault/failing result/exact restoration. Independent
release verification and actual public-composition evidence precede completion. Existing expectations and behavior are
preserved except for assertions of layout that this requested organization demonstrably replaces; any such correction
is precisely scoped and independently reviewed. Full/native/browser integration runs on GitHub Linux, never through
native control of the person's Mac or phone. This item changes no SPEC, use case, architecture or process declaration.
