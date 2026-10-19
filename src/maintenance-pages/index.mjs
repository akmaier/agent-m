// MOD-maintenance-pages — the pages of issues and mail (docs/architecture/MOD-maintenance-pages.md): its interface. Of it, ITM-963 builds the route `mail` (mail.mjs) up to the author's decision: reading the mailbox, the
// undecided mails and the decisions Create issue, Add to #n and Not an issue, without a participant (UC-038 4b). The routes `issues` and `replies` and the proposals through a participant are other items'; this view therefore hands the
// frame no strategies yet.
//
// Module: MOD-maintenance-pages

import { route as mail } from "./mail.mjs";

export const view = { routes: [mail], strategies: [] };
