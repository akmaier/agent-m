// This browser's connections, for the tests of pages that join the instance's register with them (MOD-participant-list,
// Interfaces: Connection, participantsOf; MOD-prompt-bar's endpointsOffered and sessionsOffered): a Store of
// MOD-browser-store held in memory, with the settings a test names written through writeSetting, so that a key the
// catalogue does not know fails as it would in a browser; and the answers of a Bridge at BRIDGE to MOD-bridge-client's
// testBridge — GET /v1/pair and GET /v1/agents, listing the agents given ready, each with the declaration the Bridge keeps for it
// (MOD-bridge-http, GET /v1/agents) — and to a job's hand-over, POST /v1/jobs, each hand-over kept. Nothing reaches the network.
//
// Module: MOD-participant-list
// Level: fixture

import { writeSetting } from "../src/browser-store/index.mjs";

/** The address of the fixture Bridge — a loopback address, as a Bridge on this machine has. */
export const BRIDGE = "http://127.0.0.1:9418";

/** The capabilities a coding agent declares in these fixtures: every one an implementing job needs. */
export const CODING = ["read the repository", "write to the repository", "run code and tests", "use tools"];

/** localStorage's interface over a Map. */
export class MemoryStorage {
  constructor() { this.entries = new Map(); }
  get length() { return this.entries.size; }
  key(index) { return [...this.entries.keys()][index] ?? null; }
  getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
  setItem(key, value) { this.entries.set(key, String(value)); }
  removeItem(key) { this.entries.delete(key); }
}

/** storeWith(settings, instance) -> Store — MOD-browser-store's Store of the instance, holding each setting { key: value }. */
export function storeWith(settings, instance = "acme/agent-m") {
  const store = { storage: new MemoryStorage(), prefix: `agent-m:${instance}:` };
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  return store;
}

/**
 * session(models, { place, capabilities }) -> the declaration a Bridge keeps for one of its agents (MOD-desktop-shell, `agents`), which its
 * GET /v1/agents lists with the agent: its place, its capabilities, and each model [name, context] it offers.
 */
export const session = (models, { place = "this machine", capabilities = CODING } = {}) =>
  ({ place, capabilities, models: models.map(([model, context = 200000]) => ({ model, context })) });

/** bridgeSetting(token) -> the setting `bridge:<name>` of the fixture Bridge. */
export const bridgeSetting = (token = "pairing-token") => ({ address: BRIDGE, token });

const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * agent(name, models, options) -> an agent of the fixture Bridge's list: its name, with the declaration session(models, options) gives.
 */
export const agent = (name, models, options) => ({ name, ...session(models, options) });

/**
 * bridgeAnswer(agents, handed) -> (url: URL, init) -> Promise<Response | null> — the fixture Bridge's answer to a request for
 * it: testBridge's two requests, listing `agents` ready — each a name, listed without a declaration, or { name, place, capabilities,
 * models }, listed with that declaration —; a hand-over, kept in `handed` with its body; null for a request to any other address,
 * so that a harness's next handler answers it.
 */
export const bridgeAnswer = (agents, handed = []) => async (url, init = {}) => {
  if (url.origin !== BRIDGE) return null;
  const method = String(init.method ?? "GET").toUpperCase();
  if (method === "GET" && url.pathname === "/v1/pair") {
    return reply({ bridge: { name: "fixture-bridge", version: "1.0.0", platform: "linux" }, origin: "https://acme.github.io" });
  }
  if (method === "GET" && url.pathname === "/v1/agents") {
    return reply({ agents: agents.map((each) => (typeof each === "string" ? { name: each, place: null, capabilities: [], models: [] } : each))
      .map(({ name, place = null, capabilities = [], models = [] }) => ({ name, version: "1.0.0", ready: true, loggedIn: true, place, capabilities, models })), missing: [] });
  }
  if (method === "POST" && url.pathname === "/v1/jobs") {
    const body = JSON.parse(init.body ?? "{}");
    handed.push(body);
    return reply({ job: body.record ?? "job" });
  }
  return reply({ error: "not-found", message: `the fixture Bridge has no ${method} ${url.pathname}` }, 404);
};

/**
 * withBridge(agents) -> { handed, restore } — globalThis.fetch answering the fixture Bridge's requests and passing every other
 * one to the fetch it replaces; `restore` puts that one back.
 */
export function withBridge(agents) {
  const handed = [];
  const before = globalThis.fetch;
  const answer = bridgeAnswer(agents, handed);
  globalThis.fetch = async (input, init = {}) => (await answer(new URL(String(input)), init)) ?? before(input, init);
  return { handed, restore: () => { globalThis.fetch = before; } };
}
