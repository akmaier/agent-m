// MOD-maintenance-pages — the pages of issues and mail (docs/architecture/MOD-maintenance-pages.md): its interface. Of it, ITM-963 builds the route `mail` (mail.mjs) up to the author's decision; ITM-966 builds the routes `replies` and
// `replies/<issue>` (replies.mjs) up to the drafts, for which the view hands the frame MOD-mail-handling's `mailStrategies` (the kind `draft-replies` names its recipe and its writer); ITM-964 adds MOD-personal-data's `privacyStrategies` (the kinds `propose-issues` and `rewrite-without-persons` name the recipe `report-data` and the check `people-search`); ITM-582 builds the routes `issues` and
// `issue/<number>` (issues.mjs) up to the class confirmed, corrected or the issue rejected, for which the view hands the frame MOD-issue-handling's `issueStrategies` (the kind `analyse-issue` names its recipe). ITM-584 adds, to the issue route, the change of the SPEC from an issue, for which the view also hands the frame MOD-spec-changes' `specStrategies` and MOD-source-register's `sourceStrategies` (the kind `change-requirements` names the precondition `person-source`, its recipes and its writer). ITM-1250 adds, to the issue route, *Move to backlog* and *Add* of a bug or a change (MOD-issue-handling's `backlogItemFrom` and `moveToBacklog`). ITM-583 adds the fix of a bug, for which the view also hands the frame MOD-runtimes' `routeStrategies` (the kind `fix-bug` names the writer `branch-and-pull-request`), and ITM-654 the expectations its open pull request changes, old beside new. The sending and asking on the
// replies page are other items'.
//
// Module: MOD-maintenance-pages

import { issueStrategies } from "../issue-handling/index.mjs";
import { mailStrategies } from "../mail-handling/index.mjs";
import { privacyStrategies } from "../personal-data/index.mjs";
import { routeStrategies } from "../runtimes/index.mjs";
import { sourceStrategies } from "../source-register/index.mjs";
import { specStrategies } from "../spec-changes/index.mjs";

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
  mail: { name: "mail", entry: "maintenance", title: "Mail" },
  replies: { name: "replies", entry: "maintenance", title: "Replies" },
  issues: { name: "issues", entry: "maintenance", title: "Issues" },
  issue: { name: "issue", entry: null, title: "Issue" },
};

// The file that holds the routes issues and issue, imported once for both.
const issuesFile = () => import("./issues.mjs");

const mail = headed(heads.mail, async () => (await import("./mail.mjs")).route, { subject: true });
const replies = headed(heads.replies, async () => (await import("./replies.mjs")).route, { subject: true });
const issues = headed(heads.issues, async () => (await issuesFile()).routes.find((route) => route.name === "issues"));
const issue = headed(heads.issue, async () => (await issuesFile()).routes.find((route) => route.name === "issue"));

export const view = { routes: [mail, replies, issues, issue], strategies: [mailStrategies, privacyStrategies, issueStrategies, specStrategies, sourceStrategies, routeStrategies] };
