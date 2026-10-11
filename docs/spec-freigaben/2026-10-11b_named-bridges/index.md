# SPEC approvals — queue 2026-10-11b · named bridges

**PO decision:** a person may pair several bridges, each kept under its name — this computer's, one reached through an SSH
forward, one reached through the jump host. A bridge offers only the installed agents the person chooses in its window,
each working in a folder of its own. An endpoint, a mailbox and a compute resource name the bridge that reaches them.
Bridges keep listening on loopback only.

**Size:** three entries. 01, §6 *Runtimes*: `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT` names the bridge's
name and each offered agent's working folder among its settings, and `THE BRIDGE FINDS THE INSTALLED AGENTS` offers only
the agents the person chose. 02, §14 *Issues, mail and personal data*: `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API
OR THROUGH THE BRIDGE` and `THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE` name the bridge the connection
names, and one new requirement follows the second: a mailbox through the jump host is named as readable there. 03, §15
*Product resources*: `A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER` names a bridge by its name.
Every requirement keeps its name; every other requirement of the three sections is carried over byte for byte. Drafted with
it: UC-003, UC-011, UC-017, UC-037, UC-040, UC-042 and UC-044, and the architecture of the bridges, the browser's store,
the settings pages, endpoints, routes, participants, resources and mail. Accept the queue first, then the use cases, then
the architecture.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 6. Runtimes | — | — |
| 02 | `SPEC.md` | ## 14. Issues, mail and personal data | — | — |
| 03 | `SPEC.md` | ## 15. Product resources | — | — |
