---
id: ITM-352
title: The participants page
level: module
realises:
  - UC-017
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
  - NO COST IS GUESSED
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - NO SECRET IN THE REPOSITORY
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-318
  - ITM-349
  - ITM-265
  - ITM-290
  - ITM-403
tests:
  - unit
origin:
  - UC-017 steps 1 to 5 and 7, 3a, 3b, 5a
  - UC-017 postcondition
---
# ITM-352 The participants page

**REGISTER**

## Outcome

MOD-settings-pages' route `participants`, in `participants.mjs`, as its file states it: the instance's participants from
`docs/participants.md`; *+ Add participant* with the type chosen first, each type explained (ITM-349); the form from the
participant schema with the type's own part — a person's account; a model endpoint among those configured in this
browser, whose fields of UC-003 open in place when there is none (3a); a CI agent's workflow and model, on the server's
runners or a self-hosted runner, its key's secret by name, with the explanation that a self-hosted runner serves private
repositories only and is refused when a public product's job would run on it (3b); a CLI or sandboxed agent by the
Bridge it runs on, chosen among the Bridges this browser keeps (ITM-403), and its agent — and the model, its context and
its price; capabilities preset by type and the processing place where it can be told, both changeable; before saving,
the sources whose places do not allow the participant's place (5a); *Save*, one click, committing the register through
`saveFile` as the person's commit, with no key in it. The agents a Bridge offers and *Test* (ITM-353) and a change to a
participant that products use (ITM-354) are not part of this item.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with the existing settings tests' stand-ins and
  a fixture instance: each of the five types added and saved as one commit of its row in the schema's form; the
  capability and place presets; a CLI-agent row without a model kept from saving; a CLI agent's route naming the chosen
  Bridge; a self-hosted runner shown with its explanation; a model endpoint with none configured opening UC-003's fields
  in place; a place a fixture source does not allow named with that source before the save; no key in any commit; every
  explanation folded. The postcondition holds: the instance lists the participant with type, capabilities and processing
  place, and no key.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
