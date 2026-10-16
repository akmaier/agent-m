// index.mjs — the interface of the main page (docs/architecture/MOD-main-page.md, Parts and Interfaces: `view`): the routes of the main page and the
// strategies the prompt bar's conversations on it need. So far the route `jobs` is built; the routes `home` and `job` are later items.
//
// Module: MOD-main-page
// It uses MOD-source-register (sourceStrategies) through its index.mjs. The frame loads this file (MOD-site-frame, start.mjs) through `view`.

import { sourceStrategies } from "../source-register/index.mjs";
import { jobs } from "./jobs.mjs";

/**
 * view: View — { routes: Route[], strategies: Strategies[] } as MOD-site-frame defines them: the route `jobs`, and `sourceStrategies`, so that a conversation on the main page
 * receives the book's chapters of its page.
 */
export const view = { routes: [jobs], strategies: [sourceStrategies] };
