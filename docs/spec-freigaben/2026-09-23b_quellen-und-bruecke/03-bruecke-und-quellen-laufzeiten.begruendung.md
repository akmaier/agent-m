# The bridge requirement becomes two

PO instruction, 2026-09-23: *"Fix the bridge requirement; it needs to be two requirements."*

The accepted text combined two statements: the bridge listens only on loopback, and remote work
goes through a tunnel. §3 `ONE STATEMENT PER REQUIREMENT` exists for exactly this case. With both
in one entry, neither can be changed or withdrawn on its own, and the named check
(`test_bridge_loopback.py`) only covered the first half.

**The substance is yours, unchanged:** loopback bind, with SSH tunnels or forwards for remote
access. This is the same pattern as the remote access to the support cockpit in the process
repository. The bridge never widens its bind, and remoteness is added from outside by a mechanism
that brings its own authentication. The second requirement gets its own check, which proves both
directions: reachable through a forwarded loopback port, and unreachable on every other interface.

**On the name.** The accepted name ("THE LOCAL BRIDGE BINDS CAN BE TUNNELED OR FORWARDED TO ALLOW
REMOTE WORK", with a trailing space) is replaced, not kept as a withdrawn stub. §1 `THE NAME IS THE
ID AND IT SURVIVES` protects identifiers across versions. No version has been released, no test
and no artifact references the name, and the git history keeps it. A stub for a name that existed
for an hour with a typo in it would record noise, not a decision.

The same entry also adds the PO source to `THE LOCAL BRIDGE REQUIRES A TOKEN`, which lost it in the
first round.
