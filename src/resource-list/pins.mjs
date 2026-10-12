// pins.mjs — a resource's pin read, its check planned, and a newer state found (MOD-resource-list, Interfaces: Pin, readPin, CheckPlan, checkPlan, newerState).
//
// Module: MOD-resource-list
//
// Pure but for the readers the caller hands in: nothing here makes a request itself. A pin moves only when a person moves it and the list is committed (A PINNED RESOURCE
// MOVES ONLY WHEN A PERSON MOVES IT): nothing here changes a resource.

// A failure of the module's own, by name.
const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

const READ_UPSTREAM = ["repository", "data", "model"];
const BRIDGE_ROUTE = /^bridge (\S+)$/, RUNNER_ROUTE = /^runner:(\S+)$/;
// What a Bridge's harmless probe asks of each kind (UC-040): an endpoint's served models, an agent's answer, a cluster's partitions.
const PROBE = { compute: "partitions", endpoint: "served models", agent: "answers" };

/**
 * @typedef {{ kind: "commit" | "revision" | "files" | "served model", value: string | Record<string, string> }} Pin
 * @typedef {{ how: "read on its host" } | { how: "probe through the Bridge", bridge: string, probe: "served models" | "partitions" | "answers" } |
 *   { how: "check job on a runner", label: string }} CheckPlan
 */

/**
 * readPin(resource, readers: { repositoryHead, hubRevision }) -> Promise<Pin> — the current state upstream, through the readers: a repository's head as a Pin of kind
 * `commit`, the Hub's revision for data and a model as a Pin of kind `revision`. Crosses the network through the readers and fails as they fail: the same error. A Hub reader
 * that rejects with a plain TypeError or Error — a browser's report of a call that did not come back — is HubNotAnswering { resource, address }, the person then pastes a
 * full revision. Compute, an endpoint and an agent have no upstream state to read here: NothingToRead { kind }, and no reader is asked.
 */
export async function readPin(resource, readers) {
  if (resource.kind === "repository") return { kind: "commit", value: await readers.repositoryHead(resource.address) };
  if (resource.kind === "data" || resource.kind === "model") {
    try {
      return { kind: "revision", value: (await readers.hubRevision(resource.address)).revision };
    } catch (error) {
      if (error && (error.name === "TypeError" || error.name === "Error")) {
        throw failure("HubNotAnswering", `the Hub did not answer for ${resource.name} (${resource.address}); paste a full revision instead`,
          { resource: resource.name, address: resource.address, cause: error });
      }
      throw error;
    }
  }
  throw failure("NothingToRead", `a ${resource.kind} has no upstream state to read; it is checked by its probe`, { kind: resource.kind });
}

/**
 * checkPlan(resource) -> CheckPlan — read on its host for a repository, data or a model; for compute, an endpoint and an agent by their route: a harmless probe
 * through the Bridge `bridge <name>` names, a check job on the label `runner:<label>` names, and, for an endpoint or agent whose route is its own address, read on its host.
 * Throws NoCheckRoute { route } for compute whose route is neither.
 */
export function checkPlan(resource) {
  if (READ_UPSTREAM.includes(resource.kind)) return { how: "read on its host" };
  const bridge = BRIDGE_ROUTE.exec(resource.route ?? ""), runner = RUNNER_ROUTE.exec(resource.route ?? "");
  if (bridge) return { how: "probe through the Bridge", bridge: bridge[1], probe: PROBE[resource.kind] };
  if (runner) return { how: "check job on a runner", label: runner[1] };
  if (resource.kind === "compute") throw failure("NoCheckRoute", `a compute resource is reached by \`bridge <name>\` or \`runner:<label>\`, not by ${JSON.stringify(resource.route)}`, { route: resource.route });
  return { how: "read on its host" };
}

/**
 * newerState(resource, upstream: Pin) -> { newer: boolean, upstream: Pin } — whether the upstream state differs from the pin written in the list, a text; a Pin whose value
 * is no text is always different. It moves nothing: the resource
 * and the Pin are returned as they were given.
 */
export function newerState(resource, upstream) {
  return { newer: resource.pin !== upstream.value, upstream };
}
