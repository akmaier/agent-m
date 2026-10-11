---
id: ITM-350
title: The library and registering a source
level: module
realises:
  - UC-004
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - THE SOURCE MODEL IS GENERIC
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - A SOURCE DECLARES ITS AUTHORITY
  - A SOURCE DECLARES ITS LICENCE
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
  - A LIVING SOURCE IS PINNED
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-313
  - ITM-314
  - ITM-345
  - ITM-455
  - ITM-458
tests:
  - unit
origin:
  - UC-004 steps 1 to 6, 4a, 4b, 4c, 1a
---
# ITM-350 The library and registering a source

**REGISTER**

## Outcome

MOD-settings-pages' routes `library` and `library/<source>` in `library.mjs`, as its file states them: the register's
sources with their versions; *+ Register source* by route — an EU legal text with its identifier recognised (ITM-313), a
standard with its designation and its licence preset to restricted, documents hashed in the browser or only hashed, a
repository pinned to its current commit —; the common fields in a form from the entry's schema, a licence `unknown`
counting as restricted; what becomes public stated before *Save*, which commits the plan's files (ITM-314), each in its
repository, under the person's account; a named repository the token cannot reach named, with how to extend the token; a
source already in the library named, with its entry linked. Its explanations are shown folded (ITM-345). The fetch of an
EU legal text after saving, and a new version of a source (UC-016), are not part of this item.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, over a fixture host: each route's form; after
  *Save*, the entry and the republishable content in the instance and the restricted content only in the named
  repository; a file only hashed stored nowhere; an unreachable repository named with the token's page; a registered
  source's name leading to its entry.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
