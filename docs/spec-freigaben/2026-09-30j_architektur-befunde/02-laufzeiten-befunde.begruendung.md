# §6: Windows on ARM deferred; the window stands in for a missing tray; Local Network Access

**Findings (architecture update, PR #19; measurement 2026-09-30, points 1 and 3).**
- `deno desktop`, the build that gives the bridge its tray and window, has no Windows-on-ARM target;
  `THE BRIDGE IS ONE FILE PER PLATFORM` asked for a file for "Windows".
- On KDE Plasma 6 on Wayland the tray fails (Deno issue #36502), and a tray that cannot be created fails
  without an error; `THE BRIDGE RUNS AS AN APP` asked for a tray icon without exception.
- The occasion of `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` named Chrome's Private Network Access
  preflights, which Local Network Access replaced (Chrome 142, Edge 143, Firefox 153); Safari blocks the call
  as mixed content.

**PO decisions, 2026-09-30:** *"2 Windows on ARM is not really a platform that is used for AI agents; i would
defer that at present. If needed, we can do this later."* — *"3 OK"* — *"5 OK"*.

**The changes:**
- `THE BRIDGE IS ONE FILE PER PLATFORM` — narrowed to "Windows on x86-64, macOS and Linux"; the occasion
  quotes the deferral. Adding Windows on ARM later is a new change to this rule.
- `THE BRIDGE RUNS AS AN APP` — "or, where the system shows no tray icon, with its window open"; the occasion
  names the KDE issue and the silent failure the bridge checks for.
- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — the occasion names Local Network Access, Safari's
  mixed-content block, the HTTPS route and SSH, and points to the measurement. Rule and check unchanged.

The rest of §6 is carried over byte for byte.

**Impact list** (files naming the three rules): `SPEC.md`; UC-011, UC-044 (step 2 updated in the same commit —
the tray fallback; and fix 1, the SmartScreen warning, which needed no SPEC change); ARC-011, ARC-017,
MOD-bridge-app already describe the fallback and the missing ARM target.

**Also in this commit, use cases only (PO "1 OK", "6 OK"):** UC-044 step 2 — Windows may warn about a newly
signed release until it has been downloaded often enough, explained in a folded note; UC-017 table and UC-003
(actors, new alternative flow 2a) — a local model server is reached through the bridge on its machine.
