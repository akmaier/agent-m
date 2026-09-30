# §6: two levels — nothing installed, or the Agent M Bridge app

**PO, 2026-09-30,** in the discussion of the local backend: *"Single binary is very appealing because it is easy
to install on windows and Mac clients. Otherwise, you need to be a computer scientist to operate the local
backend. … Users will not be coding experts. They can operate Claude, opencode, and codex as apps, but may not
even have experience with CLIs"* — and then: *"I sign personally. CLI for the users is ok. It's easy to install.
We will need both levels. Write the spec updates."*

**Level 1 — nothing installed:** `AGENT M WORKS WITHOUT A LOCAL INSTALLATION`, `A HOSTED JOB AUTHENTICATES ITS
AGENT WITH A CI SECRET`.

**Level 2 — the bridge as an app:** one file per platform, built from the dashboard's code, signed by the
publisher, run as an app, paired by a token shown in its window, configured in its window or from an export,
finding the installed agents and guiding the installation of missing ones, using the person's own login,
opening its tunnels itself with its own SSH key, updated only by the person's choice.

**Measured 2026-09-30 (documentation):** `deno compile` — one executable for Windows (x86-64, ARM64), macOS
(x86-64, ARM64) and Linux, cross-compiled from any host, icon on Windows, ad-hoc signature on macOS only
(proper signing and notarisation are a separate step); Claude Code `claude -p` with `--output-format json`
reporting `total_cost_usd`, using the normal login unless `--bare`; Codex `codex exec` with `--json`; opencode
`opencode serve` with an OpenAPI-described HTTP interface. Not measured: whether the desktop apps bring the
CLIs along — the PO decided the CLI is acceptable to install.

**Proposed by the main agent, not asked for — strike if not wanted:** `THE BRIDGE CREATES ITS OWN SSH KEY` and
`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`. The decision of 2026-09-30 that SSH keys are not browser
settings stands: the private key stays on the bridge's machine.

**Unchanged:** the existing bridge rules (loopback only, token, paired once, tunnel through the jump host's
loopback); `THE DASHBOARD WRITES THE TUNNEL COMMANDS` stays for machines without a bridge.

**Cost the PO takes on:** an Apple Developer ID (annual fee) and a Windows code-signing certificate.

Impact: new UC-044 (install and pair the bridge); UC-010, UC-011, UC-014, UC-017, UC-042.
