---
id: ITM-1122
title: A schema form checks the rows of a section the person edited before it offers Save
level: module
realises:
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
  - NO SECRET IN THE REPOSITORY
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-f's release tests of UC-040 (ITM-1041, pull request #1164, head aec01f83)
---
# ITM-1122 A schema form checks the rows of a section the person edited before it offers Save

**REGISTER**

## Outcome

**A defect, built first: a secret's value reaches the repository.** MOD-site-frame's `schemaForm`
(MOD-site-frame.md:219-224, accepted) shows "the findings of `documentFindings` and of `extraChecks` shown beside their
fields while typing; *Save* offered only while no error remains, so an invalid register is never saved". Once a table
section is edited, it checks nothing:
- `src/site-frame/forms.mjs:80-81`: `documentNow` gives an edited section as `{ heading, line, text }`, without `rows`.
- `forms.mjs:102`: `placed` runs `documentFindings(schema, now)` and `extraChecks(now)` over that document. They find no
  row, so they report nothing, and *Save* is offered.
- On the resources page, `onSave` writes the text as typed (`src/settings-pages/resources.mjs:129`).
- f verified it at the failure node. The section handed to `onSave` has no `rows`. In three runs the committed
  `docs/resources.md` held the value `sk-live-0123456789abcdef` in the Secret column, the kind `bogus` and the route
  `ssh alex`.

Every form over a register with a table section goes through this function, the participants register among them. The
edited section is read again by its schema's table before the checks run.

## Acceptance

- In a unit test of `schemaForm` over the resource schema and the participant schema, a value typed into a Secret
  column, an unknown kind and a route that is no route are each named while typing, and *Save* is not offered.
  Counter-proof: the same rows, valid, are saved as typed.
- The `todo` marks of TST-1041017, TST-1041018 and TST-1041109 pass, and their `todo` is removed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
