---
id: ITM-899
title: The source library and the participants page connect their hosts with the stored secrets
level: module
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-settings-pages
builds_on:
  - ITM-883
tests:
  - unit
origin:
  - the Product Owner's reading at sprint team1/88's start
---
# ITM-899 The source library and the participants page connect their hosts with the stored secrets

**REGISTER**

## Outcome

The settings pages connect five more hosts without `secrets`. Each was read on `sprint/team1/87` at `4b1b8200`:
- the source library's commits of a source's content to a repository the person names:
  `src/settings-pages/library.mjs:207`, `:225`, `:236` and `:543`, each `connect(address, credentialsFor(...) ?? {})`;
- the participants page's product hosts: `src/settings-pages/participants.mjs:252`.
A host connected without `secrets` does not refuse a commit that holds a stored secret (MOD-repository-hosts.md:199). The
library's `commitTo` commits through `:207` (`library.mjs:209`). ITM-868, ITM-882 and ITM-883 closed the same gap on the
other paths. MOD-settings-pages' Uses name `MOD-browser-store.secretValues` (MOD-settings-pages.md:27). Found by the
Product Owner at sprint 88's start, reading the remaining `connect(` calls of the module (`git grep -n "connect(" --
src/settings-pages`, whose known positives are the calls with `secrets` that ITM-868 and ITM-883 wrote).

## Acceptance

- Each of these hosts passes `secrets: secretValues(store)`. A commit through the library's host to a named repository
  that holds a stored secret is refused with `SecretRefused`, and a test pins it, with a counter-proof. A host through
  which no caller commits passes the option untested, named in the pull request, as ruled for ITM-882.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
