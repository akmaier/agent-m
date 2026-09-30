# §6: the bridge's one file per platform may be a disk image or an installer

**The question (architecture, PR #17, ARC-011).** `THE BRIDGE IS ONE FILE PER PLATFORM` asks for "one
executable file" per platform; `THE BRIDGE RUNS AS AN APP` asks for an icon in the menu bar or tray and a
window. The architecture found the tray and window documented for Deno's app build (`deno desktop`), which
yields a `.dmg` on macOS, an AppImage on Linux, and on Windows a folder or an `.msi` installer — not a single
executable. Whether a plain `deno compile` binary can show a tray icon is not documented; a web search on this
is running and will be recorded in `docs/measurements/`.

**PO decision, 2026-09-30:** "ok with me" — an installer counts as the one file.

**The change:** the rule now reads "one file … — an executable, a disk image or an installer —"; the check
starts each file "after installation where it is an installer". The person still downloads exactly one file
and double-clicks it (UC-044, steps 1–2). Everything else of §6 is carried over byte for byte.

**Impact list** (files naming `THE BRIDGE IS ONE FILE PER PLATFORM`): `SPEC.md`, UC-044, ARC-011, ARC-017,
MOD-bridge-app. UC-044 step 1 is updated in the same commit (open for review); the ARC and MOD files already
describe the `.msi` and change only if the measurement settles the tray question differently.

**Also in this entry, added before acceptance (PO decision of 2026-09-30, Gmail through the bridge — queue
2026-09-30i):** the occasion of `AGENT M WORKS WITHOUT A LOCAL INSTALLATION` no longer names Gmail on the
first level; Gmail's mailboxes are IMAP mailboxes of the second. The rule itself is unchanged. It is here
because §6 is this queue's section; a second entry on §6 would make one of them stale.

**Also added before acceptance (PO decision D (a), 2026-09-30) — the route over HTTPS through the jump host:**
three new rules after `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`:
`A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`, `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN
LOGIN`, `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`.

*Why:* Safari blocks an HTTPS page's call to `http://127.0.0.1` as mixed content; Chrome ≥ 142, Edge ≥ 143 and
Firefox ≥ 153 allow it after one local-network prompt (measurement 2026-09-30, point 3). An HTTPS address on the
person's own server works for every browser — the support cockpit's route (`SOFTWARE_MAINTENANCE.md` §6.1a).
The PO chose (a): the server's own login (Basic authentication over TLS) in addition to the bridge's token,
which then travels in a header of its own. Not chosen: (b) the bridge's token alone, passed through.

*Not measured yet:* the whole route in the four browsers — required before release by `BROWSER REACHABILITY IS
MEASURED, NOT ASSUMED`. A server whose name resolves to a private address would bring back the local-network
prompt in Chrome, Edge and Firefox.

*Also decided, no SPEC change:* the Windows bridge ships its own OpenSSH client (Microsoft's Win32-OpenSSH),
because Windows 10 and 11 have none by default (measurement, point 4); `THE BRIDGE IS ONE FILE PER PLATFORM`
already requires that nothing else be installed. ARC-013 changes accordingly (UC-023).

*Impact list for the three rules:* new names, referenced by UC-011 (1c, 1d), UC-044 (6a, 4c) and UC-042 (settings
table), updated in the same commit; architecture ARC-012, ARC-013, MOD-bridge-tunnel, MOD-bridge-server follow
(UC-023).

**Also added before acceptance (PO, 2026-09-30, "please fill this gap"):** `A BRIDGE CAN BE REACHED OVER HTTPS
THROUGH THE JUMP HOST` names the certificate in its rule — "served with a certificate the browsers trust" —
instead of only in its occasion, and its check gains the counter-proof with an untrusted certificate. The SSH
side needs no certificate: the bridge's own key pair and the jump host's host key (`THE BRIDGE CREATES ITS OWN
SSH KEY`).
