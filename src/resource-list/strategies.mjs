// strategies.mjs — the recipe `resource-check` (MOD-resource-list, Parts: strategies.mjs; Interfaces: resourceStrategies): the resource a job names and the harmless request
// to make on the runner its check plan names, as one part, for the kind check-resource (UC-040 step 7, 7b).
//
// Module: MOD-resource-list
//
// It reads the lists docs/resources.md of the product and of the instance through MOD-documents with resourceSchema, and writes text: it makes no request and calls no service.
// A resource's credential is named, never given: the part holds the name of the secret and not its value (A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE), and says that it goes
// only to the resource's own address (A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE).

import { readRegister } from "../documents/index.mjs";
import { checkPlan } from "./pins.mjs";
import { resourceSchema } from "./index.mjs";

const LIST = "docs/resources.md";
const SECRET_NAME = /^ci:([A-Za-z_][A-Za-z0-9_]*)$/;

// A failure of the module's own, by name.
const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

// The Resource a row of the list is: a left-out value is null, the Paid mark a boolean.
const resourceOf = ({ cells: c }) => ({ name: c.Name, kind: c.Kind, address: c.Address, pin: c.Pin ?? null, licence: c.Licence ?? null, maintainer: c.Maintainer ?? null,
  route: c.Route ?? "", place: c["Processing place"] ?? null, paid: c.Paid === "yes" ? true : c.Paid === "no" ? false : null, secret: c.Secret ?? null });

// The resource a list holds under the name, or null; a list that is missing or does not read holds none.
async function found(snapshot, name) {
  const text = await snapshot?.read?.(LIST);
  if (typeof text !== "string") return null;
  const rows = readRegister(resourceSchema(), LIST, text).rows;
  const row = rows.find(({ cells }) => cells.Name === name);
  return row ? resourceOf(row) : null;
}

// The harmless request for a kind: the one request a declared resource answers (UC-040 step 7).
function requestOf(resource) {
  if (resource.kind === "compute") {
    return "List the partitions the cluster offers, with the scheduler's own read-only command (for SLURM `sinfo`, which views information about nodes and partitions). "
      + "Report each partition's name and state.";
  }
  if (resource.kind === "endpoint") {
    return `Send GET ${resource.address.replace(/\/+$/, "")}/models, which lists the served models. Report the status, the first lines of the answer and the identifier of the model it serves.`;
  }
  return "Ask it the one-word question `Reply with one word: ok.` and report its answer, the status and the identifier of the model it serves.";
}

// What is said of the resource's credential: its name, never its value.
function credentialOf(secret) {
  const ci = SECRET_NAME.exec(secret ?? "");
  if (ci) {
    return `The key is held in the CI secret \`${ci[1]}\`: read it from the runner's environment, send it only to this resource's address, and never print it.`;
  }
  if (secret === "browser") return "The key is kept in a browser and does not reach the runner: make the request without it.";
  return "No credential is declared for this resource: make the request without one.";
}

/**
 * The recipe resource-check(context, params) -> Part[] — one part: the resource the job names (`params.resource`, the Name of an entry of the product's list, else of the instance's),
 * and the harmless request to make on the runner its check plan names. Throws ResourceNotNamed for a job that names none, ResourceNotFound { resource } for a name no list holds, and
 * NotRunnerCheck { resource, how } for a resource that is not checked by a check job on a runner.
 */
async function resourceCheck(context, params) {
  const name = params?.resource;
  if (typeof name !== "string" || !name) throw failure("ResourceNotNamed", "a resource check names the resource to check");
  const resource = (await found(context.product.snapshot, name)) ?? (await found(context.instance.snapshot, name));
  if (!resource) throw failure("ResourceNotFound", `no list of resources holds ${name}`, { resource: name });
  const plan = checkPlan(resource);
  if (plan.how !== "check job on a runner") {
    throw failure("NotRunnerCheck", `${name} is checked by ${plan.how}, not by a check job on a runner`, { resource: name, how: plan.how });
  }
  const text = [
    `Resource: ${resource.name}, a ${resource.kind} at ${resource.address}${resource.pin ? `, pinned to ${resource.pin}` : ""}.`,
    `You work on the runner \`${plan.label}\`${resource.place ? `; the data given to the resource is processed at ${resource.place}` : ""}.`,
    `Request: ${requestOf(resource)} Make exactly one request, and nothing else.`,
    credentialOf(resource.secret),
  ].join("\n\n");
  return [{ name: resource.name, text, sources: [], required: true, artifacts: [] }];
}

/** @type {Partial<import("../job-runner/index.mjs").Strategies>} */
export const resourceStrategies = { recipes: { "resource-check": resourceCheck } };
