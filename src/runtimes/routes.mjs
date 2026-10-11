// routes.mjs — which routes a participant has (MOD-runtimes, Parts: routes.mjs; Interfaces: RouteOffer, ResourceNeed, routesFor).
// Pure: no request is made.
//
// Module: MOD-runtimes
//
// A participant's route in the register (MOD-participant-list, Data): `endpoint <name>` for a model endpoint, `ci hosted secret
// <NAME>` or `ci runner:<label> secret <NAME>` for a CI agent, `bridge <bridge> agent <agent>` for a CLI or a sandboxed agent; a
// person's `account …` is no route of a job. Participant is MOD-participant-list's type, Route MOD-runtimes' own (index.mjs).

// The job workflow's files in a product, by its server (MOD-runtimes, Data). routesFor is given no server, so a refusal names both.
const WORKFLOW_FILES = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];

// The route a register row names, or null for a row that names none.
function routeOf(row) {
  const text = String(row ?? "").trim();
  if (/^endpoint\s+\S+/.test(text)) return { kind: "tab" };
  const ci = /^ci\s+(hosted|runner:(\S+))\s+secret\s+\S+/.exec(text);
  if (ci) return { kind: "ci", runner: ci[2] ?? "hosted" };
  const bridge = /^bridge\s+(\S+)\s+agent\s+\S+/.exec(text);
  return bridge ? { kind: "bridge", bridge: bridge[1] } : null;
}

// The route of a need — `bridge <name>` or `runner:<label>` — as a Route, or null for one that is neither.
function needRoute(text) {
  const bridge = /^bridge\s+(\S+)$/.exec(text), runner = /^runner:(\S+)$/.exec(text);
  if (bridge) return { kind: "bridge", bridge: bridge[1] };
  return runner ? { kind: "ci", runner: runner[1] } : null;
}

const same = (a, b) => a !== null && a.kind === b.kind && a.bridge === b.bridge && a.runner === b.runner;

/**
 * routesFor(participant: Participant, product: { visibility: "public" | "private" | "internal", jobWorkflow: boolean }, needs:
 * ResourceNeed[]) -> RouteOffer[] — the participant's route as one offer, `{ route, available, reason }`, or none for a participant
 * whose route is no route of a job. The reason, of one line, is null for an offer that can be taken, else the first that holds of:
 * the CI route while the product has no job workflow, naming the job workflow's files (GitHub's and GitLab's); a self-hosted runner
 * for a product the server does not report private, naming the runner and the visibility; a need the route does not reach, naming
 * the resource and its route — `bridge <name>` is reached by a participant whose route names that Bridge, `runner:<label>` by that
 * runner, and the tab and the server's own runners by none.
 * @param {{ route: string }} participant
 * @param {{ visibility: "public" | "private" | "internal", jobWorkflow: boolean }} product
 * @param {Array<{ resource: string, route: string }>} needs
 * @returns {Array<{ route: object, available: boolean, reason: string | null }>}
 */
export function routesFor(participant, product, needs) {
  const route = routeOf(participant.route);
  if (route === null) return [];
  const refuse = (reason) => [{ route, available: false, reason }];
  if (route.kind === "ci" && !product.jobWorkflow) {
    return refuse(`the product has no Agent M job workflow yet: add ${WORKFLOW_FILES.join(" or ")}`);
  }
  if (route.kind === "ci" && route.runner !== "hosted" && product.visibility !== "private") {
    return refuse(`the self-hosted runner ${route.runner} serves private repositories only, and this one is ${product.visibility}`);
  }
  const unreached = needs.find((need) => !same(needRoute(need.route), route));
  if (unreached) return refuse(`the job needs ${unreached.resource}, reached by ${unreached.route}, which this route does not reach`);
  return [{ route, available: true, reason: null }];
}
