// index.mjs — the interface of the main page (docs/architecture/MOD-main-page.md, Parts and Interfaces: `view`): the routes of the main page and the
// strategies the prompt bar's conversations on it need. The routes `home` and `jobs` are built; the route `job` is not built yet.
//
// Module: MOD-main-page
// It uses MOD-source-register (sourceStrategies) through its index.mjs. The frame loads this file (MOD-site-frame, start.mjs) through `view`.

import { sourceStrategies } from "../source-register/index.mjs";
import { home } from "./home.mjs";
import { jobs } from "./jobs.mjs";

/**
 * view: View — { routes: Route[], strategies: Strategies[] } as MOD-site-frame defines them: the routes `home`, the first, which the frame shows for an address that names none, and `jobs`; and
 * `sourceStrategies`, so that a conversation on the main page receives the book's chapters of its page.
 */
export const view = { routes: [home, jobs], strategies: [sourceStrategies] };
