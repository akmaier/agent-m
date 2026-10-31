// MOD-implementation-pages — the pages of implementation (docs/architecture/MOD-implementation-pages.md): its
// interface. Of it, the routes `progress` — what goes on now: each team's running sprint, the gates, what is blocked and who works on what (UC-035; ITM-1252), the first of
// the view's routes, which the entry Implementation opens —, `process` — How this product is developed (UC-002) —, `roles` — Roles (UC-048) — and `models` — the
// instance's process models, listed (UC-031 steps 1 and 2b), `models/<name>` not yet — and `plan` — the architecture beside the plan's steps and their states (UC-045 step 1, 1a, 1b; ITM-1057), without its drafting and saving — and `backlog` — the backlog, each
// team's last ended sprint and the planning, with Plan sprint and Start sprint (UC-032, UC-033; ITM-681, ITM-1252), Propose items with Add to backlog, and + Item (UC-032 steps 2 to 4, 2a; ITM-782) — are built, as are `board`
// — the board with Pull (UC-032 step 7; ITM-784) — and `implement` — the ready items started as jobs (UC-034 steps 1 to 4; ITM-789); this view hands the frame the strategies its kinds use in the tab.
//
// Module: MOD-implementation-pages

import { workStrategies } from "../work-plans/index.mjs";
import { runStrategies } from "../run-planner/index.mjs";
import { scheduleStrategies } from "../test-schedule/index.mjs";
import { resultStrategies } from "../result-records/index.mjs";
import { routeStrategies } from "../runtimes/index.mjs";
import { approvalStrategies } from "../approvals/index.mjs";

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
  progress: { name: "progress", entry: "implementation", title: "Progress" },
  process: { name: "process", entry: "implementation", title: "How this product is developed" },
  roles: { name: "roles", entry: "implementation", title: "Roles" },
  models: { name: "models", entry: "implementation", title: "Process models" },
  plan: { name: "plan", entry: "implementation", title: "Plan" },
  backlog: { name: "backlog", entry: "implementation", title: "Backlog" },
  board: { name: "board", entry: "implementation", title: "Board" },
  implement: { name: "implement", entry: "implementation", title: "Implement" },
};

// The files that hold two routes each, imported once for both.
const processFile = () => import("./process.mjs");
const backlogFile = () => import("./backlog.mjs");

const progress = headed(heads.progress, async () => (await import("./progress.mjs")).route);
const process = headed(heads.process, async () => (await processFile()).route);
const roles = headed(heads.roles, async () => (await import("./roles.mjs")).route);
const models = headed(heads.models, async () => (await processFile()).modelsRoute);
const plan = headed(heads.plan, async () => (await import("./plan.mjs")).route);
const backlog = headed(heads.backlog, async () => (await backlogFile()).route);
const board = headed(heads.board, async () => (await backlogFile()).boardRoute);
const implement = headed(heads.implement, async () => (await import("./implement.mjs")).route);

export const view = { routes: [progress, process, roles, models, plan, backlog, board, implement],
  strategies: [workStrategies, runStrategies, scheduleStrategies, resultStrategies, routeStrategies, approvalStrategies] };
