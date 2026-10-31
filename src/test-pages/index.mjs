// MOD-test-pages — the pages of tests and releases (docs/architecture/MOD-test-pages.md): its interface. Of it,
// ITM-256 builds the route `release` alone, as this item's own Outcome narrows it — the version and changelog entry,
// *Start release candidate*, the candidate and its queued run, the levels/rates/report once the run has ended, and
// *Accept and release*. ITM-758 builds the route `schedule` up to Save, ITM-759 its Save, merge, drift and last runs (schedule.mjs). ITM-760 builds the reading part of `runs` (runs.mjs). ITM-761 builds Run on this commit, for which the view hands the frame `routeStrategies`. ITM-763 builds the route `generate` up to the proposal (generate.mjs), for which the view hands the frame `resultStrategies` and `approvalStrategies`. ITM-1223 adds the route `tests-views`, the Tests entry's views (views.mjs).
//
// Module: MOD-test-pages

import { scheduleStrategies } from "../test-schedule/index.mjs";
import { resultStrategies } from "../result-records/index.mjs";
import { approvalStrategies } from "../approvals/index.mjs";
import { routeStrategies } from "../runtimes/index.mjs";
import { sourceStrategies } from "../source-register/index.mjs";
import { resourceStrategies } from "../resource-list/index.mjs";

// A route given by its head (MOD-site-frame's Route `module`): its `name`, `entry`, `entryShown` and `title` here, the rest in the route's own
// file, which `module` imports once, when the frame first shows the route, embeds it or asks it for its subject. Its `render` imports the
// route and calls the route's own; its `subject`, where the route has one, is the route's own once it is imported, and none before.
function headed(head, load, { subject = false } = {}) {
  let full = null;
  let imported = null;
  const module = () => (imported ??= load().then((route) => (full = route)));
  return { ...head, module, render: async (target, context, params) => (await module()).render(target, context, params),
    ...(subject ? { subject: (params, context) => (full ? full.subject(params, context) : null) } : {}) };
}

// Each route's head, written here once; the route's own file takes its head from here.
export const heads = {
  release: { name: "release", entry: "releases", title: "Release" },
  schedule: { name: "schedule", entry: "tests", title: "Schedule" },
  runs: { name: "runs", entry: "tests", title: "Runs" },
  generate: { name: "generate", entry: "tests", title: "Generate tests" },
  testsViews: { name: "tests-views", entry: null, title: "Tests" },
};

const release = headed(heads.release, async () => (await import("./release.mjs")).route);
const schedule = headed(heads.schedule, async () => (await import("./schedule.mjs")).route);
const runs = headed(heads.runs, async () => (await import("./runs.mjs")).route);
const generate = headed(heads.generate, async () => (await import("./generate.mjs")).route);
const testsViews = headed(heads.testsViews, async () => (await import("./views.mjs")).route);

export const view = { routes: [release, schedule, runs, generate, testsViews], strategies: [scheduleStrategies, resultStrategies, approvalStrategies, routeStrategies, sourceStrategies, resourceStrategies] };
