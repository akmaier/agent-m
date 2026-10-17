// MOD-test-pages — the pages of tests and releases (docs/architecture/MOD-test-pages.md): its interface. Of it,
// ITM-256 builds the route `release` alone, as this item's own Outcome narrows it — the version and changelog entry,
// *Start release candidate*, the candidate and its queued run, the levels/rates/report once the run has ended, and
// *Accept and release*. ITM-758 builds the route `schedule` up to Save (schedule.mjs). ITM-760 builds the reading part of `runs` (runs.mjs). `generate` is not built yet, and this view hands the frame no
// strategies of its own (these routes need none: `release` calls MOD-release-evidence directly, on a person's click).
//
// Module: MOD-test-pages

import { route as release } from "./release.mjs";
import { route as schedule } from "./schedule.mjs";
import { route as runs } from "./runs.mjs";

export const view = { routes: [release, schedule, runs], strategies: [] };
