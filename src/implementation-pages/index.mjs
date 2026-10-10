// MOD-implementation-pages — the pages of implementation (docs/architecture/MOD-implementation-pages.md): its
// interface. Of it, the routes `process` — How this product is developed (UC-002) — and `roles` — Roles (UC-048) — are
// built: `models`, `plan`, `backlog`, `board`, `sprint/<team>/<n>/close`, `implement`, `run` and `progress` are not built
// yet, and this view hands the frame no strategies of its own.
//
// Module: MOD-implementation-pages

import { route as process } from "./process.mjs";
import { route as roles } from "./roles.mjs";

export const view = { routes: [process, roles], strategies: [] };
