// MOD-test-pages — the pages of tests and releases (docs/architecture/MOD-test-pages.md): its interface. Of it,
// ITM-256 builds the route `release` alone, as this item's own Outcome narrows it — the version and changelog entry,
// *Start release candidate*, the candidate and its queued run, the levels/rates/report once the run has ended, and
// *Accept and release*. `schedule`, `runs` and `generate` are not built yet, and this view hands the frame no
// strategies of its own (this item needs none: `release` calls MOD-release-evidence directly, on a person's click).
//
// Module: MOD-test-pages

import { route as release } from "./release.mjs";

export const view = { routes: [release], strategies: [] };
