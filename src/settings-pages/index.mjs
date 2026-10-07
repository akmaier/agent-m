// MOD-settings-pages — the pages of settings (docs/architecture/MOD-settings-pages.md): its interface. Of it, ITM-207
// builds the route `add-product` — Add a product (UC-001) — and nothing else: `settings`, `get-your-own`/`setup`,
// `endpoints`, `participants`, `library`, `resources`, `mailbox` and `bridge` are not built yet, and this view hands the
// frame no strategies of its own (`resourceStrategies` is the `resources` route's).
//
// Module: MOD-settings-pages

import { route as addProduct } from "./products.mjs";

export const view = { routes: [addProduct], strategies: [] };
