// MOD-settings-pages — the public settings routes for browser-held product, endpoint, and Bridge configuration.
//
// Module: MOD-settings-pages

import { route as addProduct } from "./products.mjs";
import { route as endpoints } from "./endpoints.mjs";
import { route as bridge } from "./bridge.mjs";
import { route as settings } from "./settings.mjs";

export const view = { routes: [settings, addProduct, endpoints, bridge], strategies: [] };
