// MOD-implementation-pages — the pages of implementation (docs/architecture/MOD-implementation-pages.md): its
// interface. Of it, ITM-222 builds the route `process` — How this product is developed (UC-002) — and nothing else:
// `models`, `plan`, `backlog`, `board`, `sprint/<n>/close`, `implement`, `run` and `progress` are not built yet, and
// this view hands the frame no strategies of its own.
//
// Module: MOD-implementation-pages

import { route as process } from "./process.mjs";

export const view = { routes: [process], strategies: [] };
