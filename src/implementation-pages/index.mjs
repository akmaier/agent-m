// MOD-implementation-pages — the pages of implementation (docs/architecture/MOD-implementation-pages.md): its
// interface. Of it, the routes `progress` — what goes on now: each team's running sprint, the gates, what is blocked and who works on what (UC-035; ITM-1252), the first of
// the view's routes, which the entry Implementation opens —, `process` — How this product is developed (UC-002) —, `roles` — Roles (UC-048) — and `models` — the
// instance's process models, listed (UC-031 steps 1 and 2b), `models/<name>` not yet — and `plan` — the architecture beside the plan's steps and their states (UC-045 step 1, 1a, 1b; ITM-1057), without its drafting and saving — and `backlog` — the backlog, each
// team's last ended sprint and the planning, with Plan sprint and Start sprint (UC-032, UC-033; ITM-681, ITM-1252), without Propose items and + Item — are built, as are `board`
// — the board with Pull (UC-032 step 7; ITM-784) — and `implement` — the ready items started as jobs (UC-034 steps 1 to 4; ITM-789); this view hands the frame the strategies its kinds use in the tab.
//
// Module: MOD-implementation-pages

import { route as progress } from "./progress.mjs";
import { route as process, modelsRoute as models } from "./process.mjs";
import { route as roles } from "./roles.mjs";
import { route as plan } from "./plan.mjs";
import { route as backlog, boardRoute as board } from "./backlog.mjs";
import { route as implement } from "./implement.mjs";
import { workStrategies } from "../work-plans/index.mjs";
import { runStrategies } from "../run-planner/index.mjs";
import { scheduleStrategies } from "../test-schedule/index.mjs";
import { resultStrategies } from "../result-records/index.mjs";
import { routeStrategies } from "../runtimes/index.mjs";
import { approvalStrategies } from "../approvals/index.mjs";

export const view = { routes: [progress, process, roles, models, plan, backlog, board, implement],
  strategies: [workStrategies, runStrategies, scheduleStrategies, resultStrategies, routeStrategies, approvalStrategies] };
