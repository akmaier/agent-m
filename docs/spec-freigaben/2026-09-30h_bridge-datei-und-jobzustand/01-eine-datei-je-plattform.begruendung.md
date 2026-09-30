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
