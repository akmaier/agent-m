---
id: ITM-642
title: A product's resources page
level: module
realises:
  - UC-040
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
  - system
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-642 A product's resources page

**REGISTER**

## Outcome

MOD-settings-pages' Parts name `resources.mjs`, and its Interfaces the routes `resources` and `resources/instance`.
No such file exists, and no item builds it. ITM-460 to ITM-463 build MOD-resource-list, which the page uses. Its
readings are taken at its start.

## Acceptance

- The routes `resources` and `resources/instance` show and save a product's or the instance's resources as MOD-settings-pages' file states,
  except the *Check* through a Bridge and the pin of a Hugging Face Hub resource, which ITM-997 builds.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Split at its stop (sprint team1/92, developer-sonnet-c).** Two interfaces the page needs are exported but not built:
- `probe` with `partitions` and `endpoint-models` (`src/bridge-client/index.mjs:191`), which ITM-995 builds;
- `hubFacts` (`src/reuse-facts/index.mjs:329-333`), which ITM-996 builds.

This item builds the rest:
- the list shown and saved;
- a repository's pin through the host's head;
- the check job on a runner;
- *Move*;
- *Copy from the instance*.

**Readings:**
- `resources/instance` is the route `resources` with no product, since a route is named by its fragment's first part
  (MOD-site-frame.md:117).
- "the pin, licence and maintainer read where they can be" admits leaving out what no interface of the module's uses
  gives. A repository's licence and maintainer are such facts today.
- Its new test file waits for ITM-958.

