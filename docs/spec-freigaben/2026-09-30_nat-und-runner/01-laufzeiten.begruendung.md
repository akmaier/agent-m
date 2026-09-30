# §6: machines behind NAT — self-hosted runner and reverse tunnel

**PO decision, 2026-09-30,** on the question how a CLI session behind a local NAT is reached: *"Option 1:
Add one rule: a self-hosted runner that serves Agent M jobs is registered only to a private repository.
Option 2: We need to be able to configure the keys for this in the settings as well as the hostname and the
port range that the CLI sessions will use."*

- **Option 1 — the runner.** The route exists already (`A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A
  SELF-HOSTED RUNNER`, UC-017). New: `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY`,
  following GitHub's own advice for self-hosted runners.
- **Option 2 — the reverse tunnel.** Four new rules: the tunnel itself; its jump-host end on loopback only;
  one port per session from a configured range; the dashboard writes both commands. `REMOTE ACCESS TO THE
  BRIDGE GOES THROUGH A TUNNEL` already covers it — the tunnel still ends on the bridge's loopback address —
  and stays unchanged.

How a request travels: dashboard (browser) → `http://localhost:<port>` on the person's machine → forward
(`ssh -L`) → jump host `127.0.0.1:<port>` → reverse tunnel (`ssh -R`, opened by the NAT machine) → bridge on
the NAT machine's loopback → CLI session. The bridge token is checked at the end, as before.

Impact: UC-011 (new alternative flow), UC-017 (the runner's repository), UC-040 (compute through a runner),
UC-042 (the settings).
