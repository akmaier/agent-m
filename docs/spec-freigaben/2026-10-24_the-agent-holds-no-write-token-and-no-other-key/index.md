# SPEC approvals — queue 2026-10-24 · the agent holds no write token and no other key

**PO decision:** open for akmaier's acceptance. Proposed on akmaier's request of 2026-10-24 ("Yes, I think this is
decent. Please do that.").

**Size:** two entries.
- **01, §6 *Runtimes*.** `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`: the agent's runner machine receives only
  the key of the participant the job names.
- **02, §7 *Configuration and secrets*.** `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`: the token is read
  only on a runner machine on which no agent works; the agent's result is checked before it is written and deleted once
  written.

Every other line of the two sections is carried over byte for byte.

**Zieldatei aller Einträge:** `SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 6. Runtimes | — | — |
| 02 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
