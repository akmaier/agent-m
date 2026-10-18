---
id: ITM-914
title: An EU legal text registered on the page is recognised as waiting for its fetch
level: module
realises:
  - UC-004
modules:
  - MOD-settings-pages
builds_on:
  - ITM-591
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-705's pull request #884 (sprint team1/89)
---
# ITM-914 An EU legal text registered on the page is recognised as waiting for its fetch

**REGISTER**

## Outcome

**A lead, measured in part by developer-sonnet-a.** The library's form stores the bare CELEX number or ELI as the entry's
`identifier` (`src/settings-pages/library.mjs:530-531`, `state.identifier = found.celex ?? found.eli`).
MOD-source-register.md:102 defines "an EU legal text that waits for its fetch" as an entry "whose `identifier`
`recogniseLegalText` recognises". But `recogniseLegalText` takes an address (MOD-source-register.md:183), and
`recogniseLegalText("32024R1689")` returns `null`. So `isLegalText(entry)` (`library.mjs:77`) is false for a legal text
registered on the page. By reading, the entry then shows neither its waiting state nor *Fetch again* (UC-004 7, 7a). This
has not been measured on the page.

**First task, the stop clause:**
- register a legal text through the route in a test and see what the page shows;
- read whether the entry's `identifier` should hold what `recogniseLegalText` recognises (an address), or whether the
  recogniser should accept the bare number.
The item changes MOD-settings-pages' side only if the accepted text says the identifier is an address. If the text has to
change instead, it stops and the draft goes to akmaier.

## Acceptance

- A legal text registered through the library's route shows its waiting state and, after a failed fetch, *Fetch again*.
  A test checks this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it if the lead holds. No stub is committed.
