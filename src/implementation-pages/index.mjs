// MOD-implementation-pages — the pages of implementation (docs/architecture/MOD-implementation-pages.md): its
// interface. Of it, the routes `process` — How this product is developed (UC-002) —, `roles` — Roles (UC-048) — and `models` — the
// instance's process models, listed (UC-031 steps 1 and 2b), `models/<name>` not yet — and `plan` — the architecture beside the plan's steps and their states (UC-045 step 1, 1a, 1b; ITM-1057), without its drafting and saving — and `backlog` — the backlog and the
// sprints of each team, with Plan sprint and Start sprint (UC-032, UC-033; ITM-681), without Propose items, + Item, End sprint and the board — are built: `board`, `sprint/<team>/<n>/close`, `implement`, `run` and `progress` are not built
// yet, and this view hands the frame no strategies of its own.
//
// Module: MOD-implementation-pages

import { route as process, modelsRoute as models } from "./process.mjs";
import { route as roles } from "./roles.mjs";
import { route as plan } from "./plan.mjs";
import { route as backlog } from "./backlog.mjs";

export const view = { routes: [process, roles, models, plan, backlog], strategies: [] };
