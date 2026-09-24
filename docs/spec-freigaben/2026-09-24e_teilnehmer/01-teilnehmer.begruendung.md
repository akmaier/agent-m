# Participants: who can do what, and where the data goes

**Five types.** They are distinguished by how Agent M reaches them, and those routes already exist:
- a *person* uses the dashboard;
- a *model endpoint* is reached from the browser (UC-003);
- a *CI agent* runs in a workflow (UC-010);
- a *CLI agent* is reached through the local bridge (UC-011);
- a *sandboxed agent* is the same bridge, run inside a VM or container and reached through a tunnel
  (`REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL`).

"Agent model" is therefore not one thing. A bare endpoint and a full CLI agent differ exactly in what
the other rules name.

**Capabilities are a closed list of six**, so that a role can require them and the dashboard can
check an assignment mechanically: draft text · read the repository · write to the repository · run
code and tests · use tools · reach the web. A free-text description could not be checked.

**Where data is processed.** This is the property people forget to ask about until a legal
department asks them. It becomes decisive with the library (queue `d`): a participant that receives
a source receives its content.

**`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS` is my addition.** You did not ask for it;
it follows from putting two of your decisions together. The library may hold a bought IEC standard
and internal documents; the team may contain an external model. Without this rule, the first stage
that sends a norm's text to a model in another jurisdiction would do so without anyone deciding it.
Strike it if you would rather make that the author's responsibility alone.

**What stays out of `docs/participants.md`:** every key. The file names the participant, its type,
its capabilities and where it processes data; the endpoint key stays in the browser (§7), the CI
agent's key in the repository's Actions secrets.
