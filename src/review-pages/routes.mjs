// review-pages/routes.mjs — the routes of the view, which the frame loads at start (MOD-site-frame, View: loadView): each route's head, and its own
// file imported when the frame first shows it. The view's strategies are in index.mjs, imported only when a job is prepared (loadStrategies).
//
// Module: MOD-review-pages

import { DECISIONS, MODULES, REQUIREMENT, REQUIREMENT_NEW, RELEASE_REPORTS, SPEC_ENTRIES, USE_CASES } from "./kinds.mjs";

// view — what the frame loads: one route for the use cases, `use-case` (the list) and `use-case/id=<id>` (one use case).
// `use-case/id=all` is Review all. ITM-440 adds the routes `decision` and `module` in the same form: the files with their status, one
// file with the section of what it rests on that is not accepted, and accepting it.
// A route given by its head (MOD-site-frame's Route `module`): its `name`, `entry`, `entryShown` and `title` here, the rest in the route's own
// file, which `module` imports once, when the frame first shows the route, embeds it or asks it for its subject. Its `render` imports the
// route and calls the route's own; its `subject`, where the route has one, is the route's own once it is imported, and none before.
function headed(head, load, { subject = false } = {}) {
  let full = null;
  let imported = null;
  const module = () => (imported ??= load().then((route) => (full = route)));
  return { ...head, module, render: async (target, context, params) => (await module()).render(target, context, params),
    ...(subject ? { subject: (params, context) => (full ? full.subject(params, context) : null) } : {}) };
}
// A kind's route: its head from the kind's descriptor, the route itself from flow.mjs's reviewRoute.
// Each route's head, written here once; the route's own file takes its head from here.
export const heads = {
  draftRoute: { name: "draft", entry: null, title: "The draft of the conversation" },
  arrangeRoute: { name: "arrange", entry: null, title: "Arrange" },
};

const kindRoute = (kind) => headed({ name: kind.route, entry: kind.entry, title: kind.title }, async () => (await import("./flow.mjs")).reviewRoute(kind), { subject: true });
const draftRoute = headed(heads.draftRoute, async () => (await import("./conversation-draft.mjs")).draftRoute, { subject: true });
const arrangeRoute = headed(heads.arrangeRoute, async () => (await import("./arrange.mjs")).arrangeRoute);

export const routes = [kindRoute(USE_CASES), kindRoute(DECISIONS), kindRoute(MODULES), kindRoute(SPEC_ENTRIES), kindRoute(RELEASE_REPORTS), kindRoute(REQUIREMENT), kindRoute(REQUIREMENT_NEW), draftRoute, arrangeRoute];

// view: View — the routes, and the strategies of the view's kinds, imported from index.mjs when the runner first looks a strategy up.
export const view = { routes, loadStrategies: async () => (await import("./index.mjs")).view.strategies };
