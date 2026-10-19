// MOD-maintenance-pages — the pages of issues and mail (docs/architecture/MOD-maintenance-pages.md): its interface. Of it, ITM-963 builds the route `mail` (mail.mjs) up to the author's decision; ITM-966 builds the routes `replies` and
// `replies/<issue>` (replies.mjs) up to the drafts, for which the view hands the frame MOD-mail-handling's `mailStrategies` (the kind `draft-replies` names its recipe and its writer); ITM-964 adds MOD-personal-data's `privacyStrategies` (the kinds `propose-issues` and `rewrite-without-persons` name the recipe `report-data` and the check `people-search`). The routes `issues` and the sending and asking on the
// replies page are other items'.
//
// Module: MOD-maintenance-pages

import { mailStrategies } from "../mail-handling/index.mjs";
import { privacyStrategies } from "../personal-data/index.mjs";
import { route as mail } from "./mail.mjs";
import { route as replies } from "./replies.mjs";

export const view = { routes: [mail, replies], strategies: [mailStrategies, privacyStrategies] };
