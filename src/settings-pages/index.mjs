// MOD-settings-pages — the public settings routes for browser-held product, endpoint, and Bridge configuration.
//
// Module: MOD-settings-pages

import { route as addProduct } from "./products.mjs";
import { route as endpoints } from "./endpoints.mjs";
import { route as bridge } from "./bridge.mjs";
import { route as mailbox } from "./mailbox.mjs";
import { route as library } from "./library.mjs";
import { route as participants } from "./participants.mjs";
import { route as settings } from "./settings.mjs";
import { route as setup } from "./setup.mjs";

export const view = { routes: [settings, setup, addProduct, endpoints, participants, bridge, mailbox, library], strategies: [] };
