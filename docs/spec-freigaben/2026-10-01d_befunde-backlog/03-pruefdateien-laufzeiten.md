## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier, 2026-09-23)*
The prompts, schemas and job definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Occasion:* three independently maintained copies of one rule were the root cause of an entire
measurement complex in the process repository — each copy knew phrases the others lacked, and
nobody could say which was right. Three runtimes make that failure three times as likely.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY** *(PO A. Maier, 2026-09-30, changed 2026-10-01)*
A self-hosted runner that runs Agent M jobs is registered only to a repository whose visibility is
private, and Agent M starts no job on a runner of a public repository.
*Occasion:* PO, 2026-09-30, for machines behind NAT: the runner connects out to GitHub and needs no
incoming connection. GitHub advises self-hosted runners only for private repositories: on a public one,
a pull request from any fork can run its own code on the runner's machine — here, the machine with the
person's coding agent and its credentials.
*Check:* `tests/ci-generator.test.mjs` — starting a job on a runner of a repository the API reports as
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

**A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST** *(PO A. Maier, 2026-09-30)*
The dashboard can reach a bridge through an HTTPS address of the jump host, served with a certificate the
browsers trust, whose web server forwards the requests to the end of the bridge's reverse tunnel on the
jump host's loopback.
*Occasion:* PO, 2026-09-30: "don't we have the route via a server like lme245? … Safari needs the server
tunnel variant?" Measured 2026-09-30 from documentation (`docs/measurements/2026-09-30_architecture-open-points.md`,
point 3): Chrome from 142, Edge from 143 and Firefox from 153 let an HTTPS page call `http://127.0.0.1`
after one local-network prompt; Safari blocks it as mixed content. An HTTPS address with a valid
certificate on a server the person controls is an ordinary web address for every browser; behind a
certificate the browser does not trust — a self-signed one — a request made by a page fails without any
way to proceed, so the certificate is part of the route: one issued for the host's name by an authority the
browsers trust, such as Let's Encrypt, free and renewed automatically, or the institution's own. The pattern is
the support cockpit's (`SOFTWARE_MAINTENANCE.md` §6.1a); the server is the person's own, like the jump host
(`NO SERVER`). Whether all four browsers reach a bridge this way is measured before release (`BROWSER
REACHABILITY IS MEASURED, NOT ASSUMED`).
*Check:* `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the
dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an
error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and
the settings page names the certificate as a possible cause.

**THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN** *(PO A. Maier, 2026-09-30)*
The jump host's web server forwards a request to a bridge's tunnel only when the request carries the web
server's own login over TLS.
*Occasion:* PO, 2026-09-30, option (a): a login at the server in addition to the bridge's token (`THE LOCAL
BRIDGE REQUIRES A TOKEN`) — "Ohne Authentifizierung kein Proxy" (`SOFTWARE_MAINTENANCE.md` §6.1a). The page
sends the login as Basic authentication in the `Authorization` header; the bridge's token travels in a
header of its own.
*Check:* `tests/test_bridge_tunnel.py` — a request without the login is answered `401` and reaches no
bridge; counter-proof: with the login and the bridge's token it is answered by the bridge.

**THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE** *(PO A. Maier, 2026-09-30)*
The jump host's web server allows cross-origin requests to a bridge only from the instance's Pages origin.
*Occasion:* before each such request the browser asks the server whether the page may send it (a
preflight), and sends no login with that question; the server answers it for the Pages origin only, and the
browser itself then refuses every other site's request. The login of the rule above still guards the
request that follows.
*Check:* `tests/test_bridge_tunnel.py` — a preflight from the Pages origin is allowed; counter-proof: one
from any other origin is refused.

**EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE** *(PO A. Maier, 2026-09-30, changed 2026-10-01)*
Each CLI session reached through the jump host is given one port from the jump host's configured port
range, and no two sessions share a port.
*Occasion:* PO, 2026-09-30: the settings name "the port range that the CLI sessions will use". Several
machines behind NAT tunnel to the same jump host; one port each keeps them apart, and a range the
person chose fits the jump host's own rules.
*Check:* `tests/bridge-tunnel.test.mjs` — a new session gets the lowest free port of the range; a range
with no free port refuses a new session and says so.

**THE DASHBOARD WRITES THE TUNNEL COMMANDS** *(PO A. Maier, 2026-09-30, changed 2026-10-01)*
For each remote session, the dashboard shows the complete commands for both ends of its tunnel, filled
in from the settings.
*Occasion:* an SSH reverse forward with the right bind address, port and keep-alive options is easy to get
wrong by hand; generated from the settings, the two commands always match each other and the rules above.
The dashboard cannot run them itself — a web page cannot open SSH.
*Check:* `tests/bridge-tunnel.test.mjs`

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
*Occasion:* the mechanisms this design rests on — cross-origin calls to model endpoints, a page's calls
to the local bridge (governed from Chrome 142, Edge 143 and Firefox 153 by a Local Network Access
permission, which replaced Chrome's Private Network Access preflights, and blocked by Safari as mixed
content), the route over HTTPS through the jump host, and SSH — are documented and not verified here
(documentation read 2026-09-30: `docs/measurements/2026-09-30_architecture-open-points.md`). A design built on an unverified mechanism fails late
and expensively.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

**AGENT M WORKS WITHOUT A LOCAL INSTALLATION** *(PO A. Maier, 2026-09-30)*
Every job that needs no resource on the person's own network can run with nothing installed on the
person's computer — in the browser, or in the product's CI on the server's own machines.
*Occasion:* PO, 2026-09-30: users "will not be coding experts" — "We will need both levels." The first
level is the one a newcomer meets: the dashboard, jobs in GitHub Actions or GitLab CI, mail through
Microsoft 365. Installing something is the second level, needed only for local agents, IMAP
mailboxes — Gmail's included — and machines on the person's own network.
*Check:* `tests/test_runtime_levels.py` — every job kind whose definition names no local resource is
runnable on the hosted-CI route; counter-proof: a job needing a compute resource is not offered there.

**A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET** *(PO A. Maier, 2026-09-30)*
A job on the server's own machines authenticates its coding agent with a key stored as a CI secret of the
repository, which the dashboard names and whose settings page it opens, and never asks for.
*Occasion:* on the first level there is no machine of the person's where a login could live; the CI
secret is the server's own store for it (`NO SECRET IN THE REPOSITORY`, `THE PAGE STATES WHAT IT SENDS
WHERE`). Such a job is billed per call to the agent's provider; the dashboard says so before it starts.
*Check:* `tests/test_runtime_levels.py` — the generated job workflow reads the key only from the named
secret; counter-proof: a workflow with the key written into it fails.

**THE BRIDGE IS ONE FILE PER PLATFORM** *(PO A. Maier, 2026-09-30, extended 2026-09-30, narrowed 2026-09-30)*
The local bridge is delivered as one file for each of Windows on x86-64, macOS and Linux — an executable,
a disk image or an installer —, and needs no other runtime installed.
*Occasion:* PO, 2026-09-30: "Single binary is very appealing because it is easy to install on windows and
Mac clients. Otherwise, you need to be a computer scientist to operate the local backend." Measured
2026-09-30: `deno compile` embeds a program into one executable for Windows, macOS (x86-64, ARM64) and
Linux, cross-compiled from any one host. PO, 2026-09-30, on ARC-011: an installer counts as the one file —
the build that gives the bridge its tray icon and window (`THE BRIDGE RUNS AS AN APP`) is documented to
yield a folder or an `.msi` installer on Windows, not a single executable. PO, 2026-09-30: Windows on ARM
"is not really a platform that is used for AI agents; i would defer that at present" — `deno desktop` has
no target for it (`docs/measurements/2026-09-30_architecture-open-points.md`, point 1).
*Check:* `tests/test_bridge_release.py` — the release build yields one file per platform, and each starts,
after installation where it is an installer, on a machine without Node or Deno.

**THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE** *(PO A. Maier, 2026-09-30)*
The bridge is compiled from the same JavaScript modules and job definitions the dashboard uses.
*Occasion:* `ONE DEFINITION, THREE DRIVERS`: a bridge in a second language would hold a second copy of the
job logic, which would drift from the first. Compiled from the same modules, the bridge and the browser
cannot disagree about what a job is.
*Check:* `tests/test_single_definition.py` — the bridge's build imports the dashboard's modules; no job
definition exists twice.

**THE BRIDGE IS SIGNED BY ITS PUBLISHER** *(PO A. Maier, 2026-09-30)*
Every released bridge file is signed by the publisher of the Agent M release — for macOS with an Apple
Developer ID and notarised, for Windows with a code-signing certificate.
*Occasion:* PO, 2026-09-30: "I sign personally." An unsigned download is blocked or shown with a warning by
both systems — for a non-expert, that ends the installation. The signature also tells the person which
file they may trust.
*Check:* `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or
notarisation cannot be verified.

**THE BRIDGE RUNS AS AN APP** *(PO A. Maier, 2026-09-30, extended 2026-09-30)*
The bridge is started by a double click and runs with an icon in the menu bar or the system tray — or,
where the system shows no tray icon, with its window open —, from which it is paused, quit and opened; it
needs no command line.
*Occasion:* the person may never have used a terminal; everything the bridge asks of them — pairing,
tunnel settings, which agents to use — happens in its own window. PO, 2026-09-30: where the tray fails,
the window takes its place — documented for KDE Plasma 6 on Wayland (Deno issue #36502), and a tray that
cannot be created fails without an error, so the bridge checks for it (`docs/measurements/2026-09-30_architecture-open-points.md`, point 1).
*Check:* no automatic check; at review.

**THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW** *(PO A. Maier, 2026-09-30)*
The bridge shows the token it is paired with in its own window, with a button that copies it.
*Occasion:* `THE BRIDGE IS PAIRED ONCE` keeps the token; the person has to bring it into the dashboard once.
A copy button is the whole instruction.
*Check:* no automatic check; at review.

**THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT** *(PO A. Maier, 2026-09-30)*
A bridge's own settings — its jump host, its port, its pairing token — are set in its window or read from
a settings file exported by the dashboard.
*Occasion:* a bridge behind NAT must know its jump host before any connection to it exists, so it cannot
be configured only from the dashboard. An export from the dashboard (`SETTINGS ARE EXPORTED AND IMPORTED
WITH THEIR SECRETS`) saves typing.
*Check:* `tests/test_bridge_settings.py`

**THE BRIDGE FINDS THE INSTALLED AGENTS** *(PO A. Maier, 2026-09-30)*
The bridge lists each supported coding-agent CLI that is installed on its machine, with its version, and
offers only those as participants.
*Occasion:* measured 2026-09-30 from their documentation: Claude Code runs a task with `claude -p` and
reports result and cost as JSON; Codex with `codex exec`; opencode through `opencode serve`, an HTTP
interface. Offering an agent that is not there would fail at the first job.
*Check:* `tests/test_bridge_agents.py` — with fixture executables on the path, exactly those are listed.

**THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT** *(PO A. Maier, 2026-09-30)*
For a supported agent that is not installed, the bridge shows the vendor's installation instructions for
its platform and checks again when the person says it is done.
*Occasion:* PO, 2026-09-30: "CLI for the users is ok. It's easy to install." The bridge links the vendor's
own instructions rather than installing on its own, so the person keeps control over what is installed.
*Check:* no automatic check; at review.

**A LOCAL AGENT USES THE PERSON'S OWN LOGIN** *(PO A. Maier, 2026-09-30)*
The bridge runs a coding agent with the login that agent already has on the machine; Agent M asks for no
key for it.
*Occasion:* on the second level the person's subscription does the work — no API key to create, no billing
per call, and the key never passes through Agent M (`NO SECRET IN THE REPOSITORY`).
*Check:* `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key
environment variable.

**THE BRIDGE OPENS ITS TUNNELS ITSELF** *(PO A. Maier, 2026-09-30)*
A bridge whose settings name a jump host opens the SSH connection they call for — the reverse tunnel on the
machine behind NAT, the forward on the person's machine — and keeps it open; the person types no SSH
command.
*Occasion:* the reverse tunnel of `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL` asked the person
to run and keep alive an `ssh` command; for a non-expert, the bridge does it. The commands the dashboard
writes (`THE DASHBOARD WRITES THE TUNNEL COMMANDS`) remain for machines without a bridge. The tunnel's end
stays on the jump host's loopback (`A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`).
*Check:* `tests/test_bridge_tunnel.py` — two bridges and a test SSH server: the dashboard's request reaches
the far bridge without any command typed; counter-proof: with the far bridge's tunnel closed, nothing
answers.

**THE BRIDGE CREATES ITS OWN SSH KEY** *(PO A. Maier, 2026-09-30)*
A bridge that opens tunnels creates its own SSH key pair on first use, keeps the private key on its machine
only, and shows the public key to be added on the jump host.
*Occasion:* creating and placing a key pair is the step non-experts get wrong most often; the bridge does
the first part and says exactly what to do with the second. The private key never leaves the machine —
not into the dashboard, not into an export.
*Check:* `tests/test_bridge_tunnel.py` — the private key file is readable by its owner only and appears in
no export; counter-proof: an export containing it fails the test.

**THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE** *(PO A. Maier, 2026-09-30)*
The bridge offers a newer release and installs it only after the person's click, and only when its
signature is valid.
*Occasion:* a program that replaces itself silently could be replaced by anyone who controls the download;
the signature (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`) and the click keep the person in control.
*Check:* `tests/test_bridge_release.py` — an update with an invalid signature is refused; counter-proof: a
valid one is installed after the click.
