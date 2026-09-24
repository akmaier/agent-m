# SPEC approvals — queue 2026-09-24d · the instance's library of requirement sources

**PO, 2026-09-24:** *"Agent M should have different requirement sources (a set of pdfs, word
documents, a repository, a set of markdowns, or simply a zip file) … they have to be linked or
selected as applicable to a certain product; this needs to be stored in the product repo, but agent
m should have a list of requirements sources … legal texts (EU-AI-Act) or norms like IEC 62304 Class
B … an easy way to register such legal and norm sources (and to make sure which version of them was
actually used)."* — decisions the same day: sources may be public and private repositories;
legal texts are fetched by a workflow; fetched public texts that violate no copyright live in the
instance repository.

**Measured 2026-09-24** — fetching the EU AI Act (CELEX `32024R1689`) with `Origin:
https://akmaier.github.io`:

| Address | Result |
|---|---|
| `eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689` | `202`, `Allow-Origin: *`, **0 bytes** |
| `eur-lex.europa.eu/eli/reg/2024/1689/oj` | `202`, `Allow-Origin: *`, **0 bytes** |
| `publications.europa.eu/resource/celex/32024R1689` (content negotiation) | `303` → an `http://` Cellar address |
| the same Cellar document via `https://` | `200`, `application/xhtml+xml`, 1 262 391 bytes, full text — **no** `Allow-Origin` |

The `Allow-Origin: *` of EUR-Lex looked like success; the body was empty. A browser cannot fetch the
text; a workflow can.

**Impact analysis:** `A REQUIREMENT HAS A REGISTERED SOURCE` is reworded (source must be linked to
the product) — referenced by UC-005, which follows. `THE SOURCE MODEL IS GENERIC`,
`A SOURCE DECLARES ITS AUTHORITY`, `A LIVING SOURCE IS PINNED`, `THE SOURCE KIND IS ONE OF A CLOSED
SET` are unchanged; UC-004 is rewritten, UC-015 and UC-016 are new.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 2. Requirement sources | — | — |
