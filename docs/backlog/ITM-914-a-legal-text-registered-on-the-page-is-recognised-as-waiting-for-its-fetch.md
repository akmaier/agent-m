---
id: ITM-914
title: An EU legal text registered on the page is recognised as waiting for its fetch
level: module
realises:
  - UC-004
modules:
  - MOD-source-register
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

**Stopped at its first task (sprint team1/89, developer-sonnet-a): the text has to change, not the page.** Measured on the
page (probe `ITM-914-probe.mjs`):

| `identifier` of an entry with no version | `recogniseLegalText` | The page shows |
|---|---|---|
| bare CELEX `32024R1689` | `null` | no fetch state, no *Fetch again* |
| ELI `http://data.europa.eu/eli/reg/2024/1689/oj` | recognised | "Waiting for fetch." and one *Fetch again* |
| EUR-Lex `…?uri=CELEX:32024R1689` | recognised | "Waiting for fetch." and one *Fetch again* |

- The form writes a bare CELEX (`tests/settings-pages-library.test.mjs:209-210`), as MOD-source-register's Data row and
  UC-004 step 4 say: `identifier` is "an EU legal text's CELEX number or ELI".
- MOD-source-register.md:102 defines a waiting entry by what `recogniseLegalText` recognises, and :183 lets it read an
  address only. For a bare CELEX the two cannot both hold.
- By reading, MOD-workflow-entries' `isWaitingLegalText` (`src/workflow-entries/instance.mjs:43-48`) calls the same
  recogniser, so the fetch would never pick such an entry up either.
- **The draft for akmaier, on `main`:** MOD-source-register.md, `recogniseLegalText` also recognises "a CELEX number or an
  ELI given by itself, as a register entry's `identifier` holds it". One recogniser fixes the page and the workflow.
- **So the item's module is MOD-source-register** (`src/source-register/legal-text.mjs`). Its tests:
  - `recogniseLegalText("32024R1689")` gives `{ celex }`;
  - a bare-CELEX entry shows its waiting state, and *Fetch again* after a failed run, with a counter-proof.
- It waits for akmaier's acceptance of the draft.

