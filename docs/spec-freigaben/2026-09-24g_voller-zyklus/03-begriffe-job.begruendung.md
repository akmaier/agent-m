# "Job" for a run, instead of "stage"

**PO decision, 2026-09-24:** *"I would prefer the term 'job' or 'task' over 'stage'"* — decided: *job*.
Two rules of §6 change one word each; no name changes. UC-010 and UC-011 were reworded to "job"
(their file names keep the old slug, because UC-010 is accepted and its approval record names the file).

**Comfort review by the main agent, 2026-09-25:** the bridge printed a new session token at every start,
so every restart meant copying a token into the dashboard again — mail (UC-037), local agents (UC-011)
and compute resources (UC-040) all depend on the bridge. `THE LOCAL BRIDGE REQUIRES A TOKEN` now names
"the token it was paired with" (reworded under its name; impact: UC-011, UC-017, UC-024, UC-034, UC-037,
UC-040 realise it, unchanged), and `THE BRIDGE IS PAIRED ONCE` keeps that token across restarts.
