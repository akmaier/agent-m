---
id: ITM-1165
title: The live app serves add-product and get-your-own and main-page navigation reaches review routes
level: module
realises:
  - THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
  - UC-014
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
  - component
origin:
  - ITM-684's main-page takeover and the human main-page repair priority
---
# ITM-1165 Main-page navigation reaches the existing settings and review routes

**REGISTER**

## Outcome

The live review app serves MOD-settings-pages' add-product and get-your-own routes, including step=, and keeps
the existing add alias. From the main page, existing public ViewContext.go reaches review routes not loaded
there, without loading their views on main. Loaded main routes home/jobs/job still use their own hash.

Accepted MOD-site-frame's public go promises navigation and chosen-product propagation, not hash-only
navigation. Use its existing private fragment/address-writing path for review destinations; selector Add
uses that same navigation path. No public addressOf, duplicate serializer, embedRoute address exception,
new caller API, helper or architecture change is required. ITM-1111 is not a prerequisite.

## Acceptance

- docs/index.html#add-product and #get-your-own draw the settings module's routes; step= is passed.
  An address no view answers remains the negative control; #add keeps working.
- Main-page go reaches use-case, spec-entry, process, settings and add-product in the review page, preserving
  identifiers, parameters and chosen or explicitly supplied product, including the instance's empty product.
  The main page loads none of these review views. Selector Add follows the same existing navigation path.
- Loaded home/jobs/job and existing loaded review routes retain their navigation and product semantics.
  Keep menu order, bridge behavior, tokens and notification address-writing behavior unchanged.
- Scope is only Frame-owned production and its focused unit/component cases. Preserve existing expected
  outcomes, including site-frame.test.mjs's loaded go("pair") hash assertion and site-frame-start-script.test.mjs's
  review registration and empty-view fallback cases. No harness/stub/optional-call or legacy in-place repair.
- The first commit is tests-only with unused TST identifiers and actual intended automatic server red before
  explicit SM Source permission. Each new case has an actual owned-code fault/failure/exact restoration,
  truthful attempts and records; no planted fixture replaces the production failure node.

## Readiness

The accepted Frame contract permits this implementation. Start after recorded publication on the integrated
1173 sprint base; no parallel Frame writer. The completed1173 hold until default is not an active writer.
KISS and One Thing at a Time keep navigation inside Frame; Nothing Twice reuses its private address writer.
