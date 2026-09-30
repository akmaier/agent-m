## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier, 2026-09-23)*
The prompts, schemas and job definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Occasion:* three independently maintained copies of one rule were the root cause of an entire
measurement complex in the process repository — each copy knew phrases the others lacked, and
nobody could say which was right. Three runtimes make that failure three times as likely.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY** *(PO A. Maier, 2026-09-30)*
A self-hosted runner that runs Agent M jobs is registered only to a repository whose visibility is
private, and Agent M starts no job on a runner of a public repository.
*Occasion:* PO, 2026-09-30, for machines behind NAT: the runner connects out to GitHub and needs no
incoming connection. GitHub advises self-hosted runners only for private repositories: on a public one,
a pull request from any fork can run its own code on the runner's machine — here, the machine with the
person's coding agent and its credentials.
*Check:* `tests/review-core.test.mjs` — starting a job on a runner of a repository the API reports as
public is refused; counter-proof: a private one is allowed.

**A RUNTIME IS INTERCHANGEABLE** *(PO A. Maier, 2026-09-23)*
The same job, given the same inputs, produces the same kind of artifact in all three runtimes.
*Occasion:* if runtimes differ in what they produce, the choice of runtime becomes a hidden
product decision and a reader cannot move between them.
*Check:* `tests/test_runtime_parity.py`

**THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY** *(PO A. Maier, 2026-09-23)*
The local bridge accepts a bind address of `127.0.0.1`, `::1` or `localhost` and refuses any other.
*Occasion:* the bridge hands work to a CLI session that is already authenticated on the machine.
Its protection is the loopback bind; a tool that can be started on a LAN address has none.
*Check:* `tests/test_bridge_loopback.py`

**REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL** *(PO A. Maier, 2026-09-23)*
Remote work reaches the local bridge only through an authenticated tunnel or port forward, such as
SSH, that ends on the bridge's loopback address.
*Occasion:* working from another machine is a legitimate need. A tunnel meets it without widening
the bind: the bridge stays invisible on the network, and the tunnel brings its own authentication.
*Check:* `tests/test_bridge_tunnel.py` — the bridge answers through a forwarded loopback port and
on no non-loopback interface.

**A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL** *(PO A. Maier, 2026-09-30)*
A bridge on a machine that accepts no incoming connection is reached through an SSH reverse tunnel that
this machine opens to a jump host the person names, and through a forward from the person's own machine
to that jump host.
*Occasion:* PO, 2026-09-30: machines behind a local NAT "will not be able to accept ssh. So they have to
build the tunnel from their side." Agent M runs no server (`NO SERVER`), so the tunnels meet on a host the
person already controls — the pattern of the process repository's support cockpit
(`SOFTWARE_MAINTENANCE.md` §6.1a). The bridge keeps its loopback bind and its token
(`THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`, `THE LOCAL BRIDGE REQUIRES A TOKEN`).
*Check:* `tests/test_bridge_tunnel.py` — through a reverse and a forward tunnel over a test SSH server,
the dashboard's request reaches the bridge; counter-proof: without the forward, nothing answers.

**A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK** *(PO A. Maier, 2026-09-30)*
The port a reverse tunnel opens on the jump host is bound to the jump host's loopback address only.
*Occasion:* an SSH reverse forward bound to all interfaces would put the bridge on the jump host's
network; bound to loopback (`GatewayPorts no`, SSH's default), it is reachable only by someone who can
log in there — the same protection as the bridge's own loopback bind. Measured for the support cockpit
on 2026-08-24: the tunnel end listened on `127.0.0.1`/`[::1]` only.
*Check:* `tests/test_bridge_tunnel.py` — the generated reverse-tunnel command names the loopback address;
counter-proof: a command with `0.0.0.0` or an empty bind address fails.

**EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE** *(PO A. Maier, 2026-09-30)*
Each CLI session reached through the jump host is given one port from the jump host's configured port
range, and no two sessions share a port.
*Occasion:* PO, 2026-09-30: the settings name "the port range that the CLI sessions will use". Several
machines behind NAT tunnel to the same jump host; one port each keeps them apart, and a range the
person chose fits the jump host's own rules.
*Check:* `tests/review-core.test.mjs` — a new session gets the lowest free port of the range; a range
with no free port refuses a new session and says so.

**THE DASHBOARD WRITES THE TUNNEL COMMANDS** *(PO A. Maier, 2026-09-30)*
For each remote session, the dashboard shows the complete commands for both ends of its tunnel, filled
in from the settings.
*Occasion:* an SSH reverse forward with the right bind address, port and keep-alive options is easy to get
wrong by hand; generated from the settings, the two commands always match each other and the rules above.
The dashboard cannot run them itself — a web page cannot open SSH.
*Check:* `tests/review-core.test.mjs`

**THE LOCAL BRIDGE REQUIRES A TOKEN** *(PO A. Maier, 2026-09-23, reworded 2026-09-25)*
The bridge rejects any request that does not carry the token it was paired with.
*Occasion:* loopback is not a permission boundary between programs on the same machine. Any local
process, including a page from an unrelated site, can reach a loopback port.
*Check:* `tests/test_bridge_token.py`

**THE BRIDGE IS PAIRED ONCE** *(PO A. Maier, 2026-09-25)*
The bridge keeps its token across restarts, in a file outside every repository that only its user can
read, until the person pairs it anew.
*Occasion:* a token printed at every start has to be copied into the dashboard after every restart of
the machine — the step people give up on. Kept like a CLI's own login, the pairing survives; the file
permission keeps other users of the machine out, and *pair anew* replaces a token that may have leaked.
*Check:* `tests/test_bridge_token.py` — after a restart the stored token is accepted and the file is
readable by its owner only; counter-proof: after *pair anew* the old token is rejected.

**AN UNSUPPORTED ENDPOINT SAYS SO** *(PO A. Maier, 2026-09-23)*
When a configured endpoint cannot be called from the browser, Agent M names the reason and the
runtimes that would work instead; it does not report a generic failure.
*Occasion:* browser access to model endpoints is not uniform — some providers reject cross-origin
calls outright, others require an explicit opt-in header, and self-hosted gateways depend on local
configuration. A reader facing an opaque error will conclude the tool is broken.
*Check:* `tests/test_endpoint_diagnosis.py`

**BROWSER REACHABILITY IS MEASURED, NOT ASSUMED** *(PO A. Maier, 2026-09-23)*
Before a runtime is released, the browser behaviour it depends on is measured on current browsers
and the result is recorded in `docs/measurements/`.
*Occasion:* the two mechanisms this design rests on — cross-origin calls to model endpoints, and
Private Network Access preflights or SSH for the local bridge — are documented and neither is
verified here. A design built on an unverified mechanism fails late and expensively.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
