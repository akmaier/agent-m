---
id: ITM-627
title: The release tests of UC-014 steps 7 to 9 run through the setup route
level: system
realises:
  - UC-014
  - A TOKEN IS SCOPED TO WHAT IT WRITES
modules:
  - MOD-settings-pages
builds_on:
  - ITM-588
tests:
  - release
origin:
  - sprint team1/58: the pull request between jobs for #setup removes three release tests of the live setup view (tests/release-sprint-01-dashboard-app.test.mjs:755, :780, :1103), which would leave UC-014 7–9 without a release test
---
# ITM-627 The release tests of UC-014 steps 7 to 9 run through the setup route

**REGISTER**

## Outcome

Release tests of UC-014 steps 7 to 9, and of `A TOKEN IS SCOPED TO WHAT IT WRITES`, run through MOD-settings-pages'
route `setup`, rendered as the frame renders it. They stand in for the three release tests of the live view, which the
pull request between jobs removes with `setup-view.mjs`:
- `tests/release-sprint-01-dashboard-app.test.mjs:755`, UC-014 step 7;
- `:780`, steps 8–9;
- `:1103`, the token's scope.

They state in their own text each of the old tests' assertions that UC-014 or the requirement asks for:
- **Step 7.**
  - The prefilled token page with name, description and 90 days.
  - Exactly the permissions every feature needs, and no other: Contents, Issues, Pull requests, Actions and Workflows read
    and write; Metadata read.
  - A folded explanation of what each is for.
  - Underneath: *Only select repositories*, the instance named, *Generate token*, and copy it.
- **Steps 8–9.**
  - The shared-origin notice before anything is stored, and nothing stored before *I have read this* is ticked.
  - The expiry preset to 90 days.
  - *Store and check* keeps the token and its date and reads the instance with the token.
  - The instance is shown ready, leading to the use cases and to *+ Add product*.
  - Both steps carry a folded *What is this?*.
- **`A TOKEN IS SCOPED TO WHAT IT WRITES`.** *Only select repositories*, the instance, and each permission with why it is
  needed.

**What is not carried over.** The old tests' ids (`key-*`, `setup-done`) and their exact HTML were the live view's own
markup, which no text asks for.

**The order.** This item is merged into `main` first. The pull request between jobs then removes the old three with the
rest. Release tests are written by a participant who implemented none of the behaviour they test, so not
developer-sonnet-e, who built ITM-588 and ITM-575.

## Acceptance

- Each assertion above is stated and passes through the module's route. A planted fault in the route fails it.
- Each test names its requirement or use-case step under `guards:`.
