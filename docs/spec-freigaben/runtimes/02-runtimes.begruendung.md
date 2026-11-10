# 6. Runtimes: the person chooses one folder for the Bridge's agents

**The change.**
- `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`: among a Bridge's own settings stands the one folder that
  holds the working folder of each agent it offers, where it named the working folder of each agent. Its check is
  unchanged.

Every other byte of the section is carried over.

**Why.** akmaier decided on 2026-11-10 that "in the Bridge window the person chooses ONE folder; the Bridge creates a
working folder per ticked agent inside it automatically (`<folder>/<agent>`), instead of the person choosing a folder per
agent". The working folder of an agent then follows from the one folder and the agent's name, and is no setting of its
own (*Nothing twice*).

`A LOCAL AGENT USES THE PERSON'S OWN LOGIN` stays as it stands: its rule speaks of the login of the coding agent, which
the repository tokens of `configuration-and-secrets/03` do not touch, and its check — the command the Bridge starts
carries no key and no key variable — still holds, since a repository token reaches only the Bridge's own git.

**Impact list.**
- `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`, changed: named by UC-044, ARC-040, ARC-050, MOD-desktop-shell,
  ITM-102, ITM-291, ITM-407, ITM-1053, ITM-1056, ITM-1199, ITM-1229, ITM-1238, ITM-1244, the requirement groups, and the
  headers of `tests/test_bridge_settings.py` (with its cases `tests/test_bridge_settings.md`),
  `tests/mod-desktop-shell-settings.test.mjs`, `tests/mod-desktop-shell-agents.test.mjs`,
  `tests/mod-desktop-shell-jump-host.test.mjs`, `tests/mod-desktop-shell-jump-host-entry.test.mjs`,
  `tests/mod-desktop-shell-pair-answer-1244.test.mjs` and `tests/bridge-http-pair-answer-1244.test.mjs`. UC-044 and
  MOD-desktop-shell are drafted beside this entry. The case *Settings set in the window* of `tests/test_bridge_settings.md`
  sets an agent's working folder (`agentFolder`) and expects it kept; it is to set the one folder and expect the agent's
  working folder `<folder>/claude` — a release test, written again by a participant other than the implementer.

**Origin.** github.com/akmaier, the design decided on 2026-11-10 in a conversation with Claude Code.
