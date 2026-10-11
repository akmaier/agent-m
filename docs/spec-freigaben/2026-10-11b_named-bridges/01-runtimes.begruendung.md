# 6. Runtimes: a bridge's name, the agents it offers and their working folders

**The change.** `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT` names, besides the jump host, the port and the
pairing token, the bridge's name and the working folder of each agent it offers. `THE BRIDGE FINDS THE INSTALLED AGENTS`
still lists every installed agent, and offers as participants only those the person has chosen in the bridge's window.
Both keep their names. Each check now says how its test works and what it checks. The rest of the section is carried
over byte for byte.

**Why.** Asked whether the instance should learn from a bridge which agents it offers, the PO answered, 2026-10-11: "I
want the choice. In particular you also have to configure paths where the agent is running". And: "Folders where the
agents work: in the Bridge's window, each offered agent gets a working folder, where the clones of the instance and the
products are kept." Several bridges are told apart by their names, which the participants' routes already carry
(`bridge <name> agent <agent>`); the name is therefore one of the bridge's own settings.

**Design principles.** *Nothing the SPEC already says*: the requirement that already lists a bridge's own settings gains
the two new ones, and no new requirement repeats it. *One responsibility per rule*: where an agent works is a setting of
the bridge; what is kept in that folder belongs to the architecture (MOD-bridge-jobs). The SPEC's other bridge
requirements hold unchanged for every bridge: each listens on loopback only, requires its token and is paired once.

**Where.** The two requirements. `THE BRIDGE FINDS THE INSTALLED AGENTS` read literally already allowed offering fewer
agents than are installed ("only those"); the change says who chooses.

**Impact list.**
- `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`: UC-044; ARC-040, ARC-050; MOD-desktop-shell; ITM-291. Its
  check `tests/test_bridge_settings.py` is not yet written.
- `THE BRIDGE FINDS THE INSTALLED AGENTS`: UC-011, UC-017, UC-044; ARC-037, ARC-040, ARC-046, ARC-050;
  MOD-agent-processes, MOD-bridge-jobs, MOD-desktop-shell; ITM-320, ITM-324, ITM-326, ITM-353. Its check
  `tests/test_bridge_agents.py` is not yet written.
