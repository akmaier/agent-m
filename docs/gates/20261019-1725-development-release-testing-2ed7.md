---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - cbb731867f3be23a46fe881fa254575e5b3c1950
  - https://github.com/akmaier/agent-m/pull/1109
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1006, the Bridge's icons

**REGISTER**

## Reason

ITM-1006, pull request #1109 into `sprint/team2/97`, passes on `cbb73186`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `f9afb3f0` holds only tests, and CI run 39291977608 failed on it.
2. **The accepted text.** MOD-desktop-shell.md:82: `icons/` holds "the app's icon for each platform, and the icon of the menu
   bar and the tray". `icons/` now holds `macos.png`, `windows.png`, `linux.png` and `tray.png`.
3. **Readings accepted.**
   - The tray's icon is `icons/tray.png`.
   - The platform icons are the lab's sign scaled to 512.
   - The tray was built from `site-frame/brand/prl-lettered.png`, a file of another module. It now takes its own icon
     (`main.mjs`), which fixes the missing brand file the tray depended on.
4. **Scope.** `src/desktop-shell/` and its tests. The icons' `README.md` names where they come from.
