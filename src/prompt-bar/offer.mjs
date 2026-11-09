// MOD-prompt-bar, offer.mjs — the endpoints and CLI sessions offered, read from this browser's configuration, and the place each is named with
// (docs/architecture/MOD-prompt-bar.md: Parts, Interfaces: startPromptBar, endpointLacks, endpointsOffered, sessionsOffered). This browser's own
// endpoints that declare a place, a context and a model (endpointsOffered), and whether one runs through GitHub Actions (throughActions); and the CLI
// sessions this browser's Bridges offer, each agent a Bridge kept under `bridge:<name>` lists ready, whose `session:<bridge>:<agent>` declares a place,
// once for each model it names with its context (sessionsOffered) (UC-049 Precondition, 1, 1a, 1b): each a Connection of MOD-participant-list. No
// participant list is read for the offer. readParticipants joins the rows of the instance's docs/participants.md with those connections, which the
// job's preparation and a hand-over's route take (send.mjs, hand-over.mjs).
//
// Module: MOD-prompt-bar
//
// It reads settings of the store and the register of the instance, and sessionsOffered asks each Bridge the store keeps MOD-bridge-client's testBridge,
// its two requests `GET /v1/pair` and `GET /v1/agents`; it writes nothing.

import { listSettings, readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf, testBridge } from "../bridge-client/index.mjs";
import { readRegister } from "../documents/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";

const REGISTER = "docs/participants.md";

/** The one kind every message of the bar runs, on every page (MOD-prompt-bar, Responsibility; UC-049 step 3). */
export const BAR_KIND = "converse";

/**
 * readParticipants(snapshot: Snapshot, connections: Connection[]) -> Promise<Participant[]> — the participants of the instance's register at that
 * snapshot, in its order, joined with the connections given (MOD-participant-list's participantsOf): each agent once on each connection that offers its
 * model, and once without a route where none does; none for an instance without the register.
 */
export async function readParticipants(snapshot, connections = []) {
  const read = await snapshot.read(REGISTER);
  return read === null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, read).document, connections);
}

/**
 * placeOf(participant: Participant) -> string — where the participant processes data, as the selector names it; a participant whose connection
 * declares none is named as having none, never left unnamed (THE PAGE NAMES WHERE IT SENDS).
 */
export const placeOf = (participant) => participant.place ?? "no processing place declared";

/**
 * endpointsOffered(store: Store) -> Connection[] — this browser's model endpoints (`endpoint:<name>`, in the store's order) whose configuration
 * declares a place, a context and a model, one MOD-participant-list Connection each (MOD-prompt-bar, Interfaces: endpointsOffered): the type
 * *model endpoint*, its model and context, its place, the capabilities *draft text* and *read the repository*, and *use tools* where its last test
 * found that the model calls tools, and the route `endpoint <name>`, with ` secret <NAME>` where it names the CI secret of its key. One that lacks a
 * place, a context or a model is not offered (UC-049 1b), nor one named through a Bridge this browser does not keep.
 */
export function endpointsOffered(store) {
  const offered = [];
  for (const { key } of listSettings(store)) {
    if (!key.startsWith("endpoint:")) continue;
    const name = key.slice("endpoint:".length);
    const setting = readSetting(store, key);
    if (!setting || typeof setting !== "object") continue;
    if (endpointLacks(setting).length) continue;
    const place = setting.place.trim();
    const context = Number(setting.context);
    const model = setting.model.trim();
    if (setting.bridge && readSetting(store, `bridge:${setting.bridge}`) === null) continue;
    const tools = readSetting(store, `last-test:${key}`)?.tools === true;
    const secret = typeof setting.secret === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(setting.secret) ? setting.secret : null;
    offered.push({ name, type: "model endpoint", model, context, place,
      capabilities: ["draft text", "read the repository", ...(tools ? ["use tools"] : [])],
      route: `endpoint ${name}${secret ? ` secret ${secret}` : ""}` });
  }
  return offered;
}

/**
 * sessionsOffered(store: Store) -> Promise<Connection[]> — the CLI sessions this browser's Bridges offer (MOD-prompt-bar, Interfaces: sessionsOffered): for
 * each Bridge the store keeps under `bridge:<bridge>`, in the store's order, each agent MOD-bridge-client's testBridge lists ready whose
 * `session:<bridge>:<agent>` declares a place, one MOD-participant-list Connection for each model its `models` names with its context, in their order:
 * named `<bridge>:<agent>`, as its setting is, the type *CLI agent*, that model with its context, the place and capabilities the declaration gives, and
 * the route `bridge <bridge> agent <agent>`. A session that lacks a place or names no model offers none, and a model without its context is not offered
 * (UC-049 1b). A Bridge that cannot be tested — no answer, a refused token, no jump host stored for one at a port — offers none, and is not named here:
 * the settings page tests it where it is configured. Crosses the network: testBridge's two requests per Bridge kept.
 */
export async function sessionsOffered(store) {
  const offered = [];
  for (const { key } of listSettings(store)) {
    if (!key.startsWith("bridge:")) continue;
    const bridge = key.slice("bridge:".length);
    const stored = readSetting(store, key);
    if (!stored || typeof stored !== "object") continue;
    let agents;
    try {
      agents = (await testBridge(bridgeAt(settingsOf({ name: bridge, ...stored }, readSetting(store, "jump-host"))))).agents;
    } catch {
      continue;
    }
    for (const agent of Array.isArray(agents) ? agents : []) {
      if (agent?.ready !== true || typeof agent.name !== "string") continue;
      const declared = readSetting(store, `session:${bridge}:${agent.name}`);
      if (!declared || typeof declared !== "object" || !text(declared.place)) continue;
      const capabilities = Array.isArray(declared.capabilities) ? declared.capabilities.filter((each) => typeof each === "string") : [];
      for (const { model, context } of modelsOf(declared)) {
        if (context === null) continue;
        offered.push({ name: `${bridge}:${agent.name}`, type: "CLI agent", model, context, place: declared.place.trim(), capabilities,
          route: `bridge ${bridge} agent ${agent.name}` });
      }
    }
  }
  return offered;
}

// A setting's text, trimmed; "" for anything that is no string.
const text = (value) => (typeof value === "string" ? value.trim() : "");

// A context in tokens as a whole number above 0, or null.
function contextOf(value) {
  const context = Number(value);
  return Number.isInteger(context) && context > 0 ? context : null;
}

// The models a CLI session's declaration names, each { model, context }, context null where it is not declared; a model without a name is none.
const modelsOf = (declared) => (Array.isArray(declared?.models) ? declared.models : [])
  .filter((each) => text(each?.model)).map((each) => ({ model: text(each.model), context: contextOf(each.context) }));

/**
 * endpointLacks(setting: object) -> string[] — what an endpoint's configuration, or a CLI session's declaration, lacks for the bar to offer it (UC-049 1b),
 * each as the settings page names it: for an endpoint, the place where it processes data, its context in tokens, its model; for a CLI session — a
 * declaration with `models` —, the place where it processes data, a model, and the context in tokens of each model named without it; empty when it lacks
 * nothing.
 */
export function endpointLacks(setting) {
  const place = !text(setting?.place) && "the place where it processes data";
  if (Array.isArray(setting?.models)) {
    const models = modelsOf(setting);
    return [place, !models.length && "a model", ...models.filter((each) => each.context === null).map((each) => `the context in tokens of ${each.model}`)]
      .filter(Boolean);
  }
  return [place, contextOf(setting?.context) === null && "its context in tokens", !text(setting?.model) && "its model"].filter(Boolean);
}

/**
 * throughActions(participant: Participant, store: Store) -> boolean — whether a message to the participant runs through GitHub Actions: a model endpoint of
 * this browser whose configuration names the CI secret of its key and no Bridge, so that the tab does not call it and its work is
 * spawned as a job (UC-049 4a); the bar's button then reads *Spawn job*.
 */
export function throughActions(participant, store) {
  const name = /^endpoint\s+(\S+)\s+secret\s+\S+$/.exec(String(participant?.route ?? "").trim())?.[1];
  if (name === undefined) return false;
  const setting = readSetting(store, `endpoint:${name}`);
  return Boolean(setting?.secret) && !setting.bridge;
}
