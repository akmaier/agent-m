## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier)*
The prompts, schemas and job definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY** *(PO A. Maier)*
A self-hosted runner that runs Agent M jobs is registered only to a repository whose visibility is
private, and Agent M starts no job on a runner of a public repository.
*Check:* `tests/review-core.test.mjs` — starting a job on a runner of a repository the API reports as
public is refused; counter-proof: a private one is allowed.

**A RUNTIME IS INTERCHANGEABLE** *(PO A. Maier)*
The same job, given the same inputs, produces the same kind of artifact in all three runtimes.
*Check:* `tests/test_runtime_parity.py`

**THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY** *(PO A. Maier)*
The local bridge accepts a bind address of `127.0.0.1`, `::1` or `localhost` and refuses any other.
*Check:* `tests/test_bridge_loopback.py`

**REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL** *(PO A. Maier)*
Remote work reaches the local bridge only through an authenticated tunnel or port forward, such as
SSH, that ends on the bridge's loopback address.
*Check:* `tests/test_bridge_tunnel.py` — the bridge answers through a forwarded loopback port and
on no non-loopback interface.

**A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL** *(PO A. Maier)*
A bridge on a machine that accepts no incoming connection is reached through an SSH reverse tunnel that
this machine opens to a jump host the person names, and through a forward from the person's own machine
to that jump host.
*Check:* `tests/test_bridge_tunnel.py` — through a reverse and a forward tunnel over a test SSH server,
the dashboard's request reaches the bridge; counter-proof: without the forward, nothing answers.

**A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK** *(PO A. Maier)*
The port a reverse tunnel opens on the jump host is bound to the jump host's loopback address only.
*Check:* `tests/test_bridge_tunnel.py` — the generated reverse-tunnel command names the loopback address;
counter-proof: a command with `0.0.0.0` or an empty bind address fails.

**A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST** *(PO A. Maier)*
The dashboard can reach a bridge through an HTTPS address of the jump host, served with a certificate the
browsers trust, whose web server forwards the requests to the end of the bridge's reverse tunnel on the
jump host's loopback.
*Check:* `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the
dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an
error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and
the settings page names the certificate as a possible cause.

**THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN** *(PO A. Maier)*
The jump host's web server forwards a request to a bridge's tunnel only when the request carries the web
server's own login over TLS.
*Check:* `tests/test_bridge_tunnel.py` — a request without the login is answered `401` and reaches no
bridge; counter-proof: with the login and the bridge's token it is answered by the bridge.

**THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE** *(PO A. Maier)*
The jump host's web server allows cross-origin requests to a bridge only from the instance's Pages origin.
*Check:* `tests/test_bridge_tunnel.py` — a preflight from the Pages origin is allowed; counter-proof: one
from any other origin is refused.

**EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE** *(PO A. Maier)*
Each CLI session reached through the jump host is given one port from the jump host's configured port
range, and no two sessions share a port.
*Check:* `tests/review-core.test.mjs` — a new session gets the lowest free port of the range; a range
with no free port refuses a new session and says so.

**THE DASHBOARD WRITES THE TUNNEL COMMANDS** *(PO A. Maier)*
For each remote session, the dashboard shows the complete commands for both ends of its tunnel, filled
in from the settings.
*Check:* `tests/review-core.test.mjs`

**THE LOCAL BRIDGE REQUIRES A TOKEN** *(PO A. Maier)*
The bridge rejects any request that does not carry the token it was paired with.
*Check:* `tests/test_bridge_token.py`

**THE BRIDGE IS PAIRED ONCE** *(PO A. Maier)*
The bridge keeps its token across restarts, in a file outside every repository that only its user can
read, until the person pairs it anew.
*Check:* `tests/test_bridge_token.py` — after a restart the stored token is accepted and the file is
readable by its owner only; counter-proof: after *pair anew* the old token is rejected.

**AN UNSUPPORTED ENDPOINT SAYS SO** *(PO A. Maier)*
When a configured endpoint cannot be called from the browser, Agent M names the reason and the
runtimes that would work instead; it does not report a generic failure.
*Check:* `tests/test_endpoint_diagnosis.py`

**BROWSER REACHABILITY IS MEASURED, NOT ASSUMED** *(PO A. Maier)*
Before a runtime is released, the browser behaviour it depends on is measured on current browsers
and the result is recorded in `docs/measurements/`.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

**AGENT M WORKS WITHOUT A LOCAL INSTALLATION** *(PO A. Maier)*
Every job that needs no resource on the person's own network can run with nothing installed on the
person's computer — in the browser, or in the product's CI on the server's own machines.
*Check:* `tests/test_runtime_levels.py` — every job kind whose definition names no local resource is
runnable on the hosted-CI route; counter-proof: a job needing a compute resource is not offered there.

**A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET** *(PO A. Maier)*
A job on the server's own machines authenticates its coding agent with a key stored as a CI secret of the
repository, which the dashboard names and whose settings page it opens, and never asks for.
*Check:* `tests/test_runtime_levels.py` — the generated job workflow reads the key only from the named
secret; counter-proof: a workflow with the key written into it fails.

**THE BRIDGE IS ONE FILE PER PLATFORM** *(PO A. Maier)*
The local bridge is delivered as one file for each of Windows on x86-64, macOS and Linux — an executable,
a disk image or an installer —, and needs no other runtime installed.
*Check:* `tests/test_bridge_release.py` — the release build yields one file per platform, and each starts,
after installation where it is an installer, on a machine without Node or Deno.

**THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE** *(PO A. Maier)*
The bridge is compiled from the same JavaScript modules and job definitions the dashboard uses.
*Check:* `tests/test_single_definition.py` — the bridge's build imports the dashboard's modules; no job
definition exists twice.

**THE BRIDGE IS SIGNED BY ITS PUBLISHER** *(PO A. Maier)*
Every released bridge file is signed by the publisher of the Agent M release — for macOS with an Apple
Developer ID and notarised, for Windows with a code-signing certificate.
*Check:* `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or
notarisation cannot be verified.

**THE BRIDGE RUNS AS AN APP** *(PO A. Maier)*
The bridge is started by a double click and runs with an icon in the menu bar or the system tray — or,
where the system shows no tray icon, with its window open —, from which it is paused, quit and opened; it
needs no command line.
*Check:* no automatic check; at review.

**THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW** *(PO A. Maier)*
The bridge shows the token it is paired with in its own window, with a button that copies it.
*Check:* no automatic check; at review.

**THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT** *(PO A. Maier)*
A bridge's own settings — its jump host, its port, its pairing token — are set in its window or read from
a settings file exported by the dashboard.
*Check:* `tests/test_bridge_settings.py`

**THE BRIDGE FINDS THE INSTALLED AGENTS** *(PO A. Maier)*
The bridge lists each supported coding-agent CLI that is installed on its machine, with its version, and
offers only those as participants.
*Check:* `tests/test_bridge_agents.py` — with fixture executables on the path, exactly those are listed.

**THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT** *(PO A. Maier)*
For a supported agent that is not installed, the bridge shows the vendor's installation instructions for
its platform and checks again when the person says it is done.
*Check:* no automatic check; at review.

**A LOCAL AGENT USES THE PERSON'S OWN LOGIN** *(PO A. Maier)*
The bridge runs a coding agent with the login that agent already has on the machine; Agent M asks for no
key for it.
*Check:* `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key
environment variable.

**THE BRIDGE OPENS ITS TUNNELS ITSELF** *(PO A. Maier)*
A bridge whose settings name a jump host opens the SSH connection they call for — the reverse tunnel on the
machine behind NAT, the forward on the person's machine — and keeps it open; the person types no SSH
command.
*Check:* `tests/test_bridge_tunnel.py` — two bridges and a test SSH server: the dashboard's request reaches
the far bridge without any command typed; counter-proof: with the far bridge's tunnel closed, nothing
answers.

**THE BRIDGE CREATES ITS OWN SSH KEY** *(PO A. Maier)*
A bridge that opens tunnels creates its own SSH key pair on first use, keeps the private key on its machine
only, and shows the public key to be added on the jump host.
*Check:* `tests/test_bridge_tunnel.py` — the private key file is readable by its owner only and appears in
no export; counter-proof: an export containing it fails the test.

**THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE** *(PO A. Maier)*
The bridge offers a newer release and installs it only after the person's click, and only when its
signature is valid.
*Check:* `tests/test_bridge_release.py` — an update with an invalid signature is refused; counter-proof: a
valid one is installed after the click.
