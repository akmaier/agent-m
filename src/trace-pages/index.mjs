// MOD-trace-pages — its public View. Its route `trace` draws the views that views.mjs describes: the current specification, the
// gaps and the modules' component diagram.
//
// Module: MOD-trace-pages

import { descriptorFor } from "./views.mjs";

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

// Each route's head, written here once; the route's own file takes its head from here.
export const heads = {
  trace: { name: "trace", entry: "requirements", entryShown: (params = {}) => descriptorFor(params.key)?.entry ?? null, title: "Current requirements" },
};

const route = headed(heads.trace, async () => (await import("./flow.mjs")).route, { subject: true });

export const view = { routes: [route], strategies: [] };
