// The page's client for the Bridge API used by UC-003 endpoint tests.
//
// Module: MOD-bridge-client
// Public: BridgeError, settingsOf, bridgeAt, pair, testBridge, handOver, ask, probe

import { bridgeApi } from "../bridge-http/index.mjs";
import { bridgePath } from "./paths.mjs";
export { allocatePort, tunnelCommands } from "./tunnels.mjs";
export { proxyConfiguration } from "./proxy.mjs";

export class BridgeError extends Error {
  constructor(name, fields = {}, message = name) {
    super(message);
    this.name = name;
    Object.assign(this, fields);
  }
}

const privateSettings = new WeakMap();
const requestTimeoutMs = 15_000;

function addressOf(address) {
  let url;
  try { url = new URL(address); } catch { throw new TypeError("a Bridge address is an HTTP or HTTPS address"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new TypeError("a Bridge address is HTTP or HTTPS and carries no credential");
  }
  return url.toString().replace(/\/$/, "");
}

function routeOf(address) {
  const { protocol, hostname } = new URL(address);
  if (protocol === "https:") return "jump-host";
  return hostname === "localhost" ? "forward" : "loopback";
}

function neededToken(token) {
  if (typeof token !== "string" || !token) throw new BridgeError("TokenMissing", {}, "The Bridge has no pairing token.");
  return token;
}

function likelyNoAnswer(bridge) {
  const likely = ["not running", "wrong address", "another instance"];
  if (bridge.route === "jump-host") likely.push("certificate not trusted");
  else likely.unshift("blocked by the browser");
  return likely;
}

function basic(login) {
  return `Basic ${btoa(`${login.user}:${login.password}`)}`;
}

function requestHeaders(bridge, contentType = false) {
  const settings = privateSettings.get(bridge);
  const headers = { [bridgeApi.tokenHeader]: neededToken(settings?.token) };
  if (contentType) headers["Content-Type"] = "application/json";
  if (settings?.login) headers.Authorization = basic(settings.login);
  return headers;
}

async function answerJson(answer) {
  const text = await answer.text();
  try { return JSON.parse(text); } catch { return null; }
}

async function call(bridge, path, init) {
  const address = `${bridge.address}${path}`;
  const headers = requestHeaders(bridge, init.body !== undefined);
  const signal = AbortSignal.timeout(requestTimeoutMs);
  let answer;
  let body;
  try {
    answer = await fetch(address, { ...init, headers, signal, credentials: "omit", cache: "no-store" });
    body = await answerJson(answer);
  } catch (error) {
    if (error?.name === "TimeoutError") throw new BridgeError("Timeout", {}, "The Bridge request timed out.");
    const likely = likelyNoAnswer(bridge);
    const httpsRoute = bridge.route === "loopback" ? " Use the HTTPS route through the jump host." : "";
    throw new BridgeError("NoAnswer", { likely }, `The Bridge gave no answer: ${String(error?.message ?? error)}${httpsRoute}`);
  }
  if (answer.ok) return body;
  if (answer.status === 401) {
    if (bridge.route === "jump-host" && privateSettings.get(bridge)?.login && answer.headers.get("www-authenticate")) {
      throw new BridgeError("JumpHostLoginRefused", {}, "The jump host refused its login.");
    }
    throw new BridgeError("TokenRefused", {}, "The Bridge refused its pairing token.");
  }
  const error = body?.error;
  if (typeof error === "string" && Object.hasOwn(bridgeApi.errors, error)) {
    throw new BridgeError("BridgeFailed", { error }, typeof body.message === "string" ? body.message : error);
  }
  throw new BridgeError("BridgeFailed", { error: "upstream-failed" }, `The Bridge answered ${answer.status}.`);
}

export function bridgeAt(settings) {
  const address = addressOf(settings?.address);
  const bridge = Object.freeze({ address, route: routeOf(address) });
  privateSettings.set(bridge, Object.freeze({ token: settings?.token, ...(settings?.login ? { login: { ...settings.login } } : {}) }));
  return bridge;
}

// settingsOf(entry, jumpHost) -> BridgeSettings — the settings of a stored Bridge. A Bridge with an address keeps it and carries no login. A Bridge
// at a port is reached at the jump host's HTTPS address with its path (bridgePath, in paths.mjs, which proxyConfiguration uses as well) and the web
// server's login, or, where the jump host has no HTTPS address, by the forward of its port. Throws JumpHostMissing without a jump host. No request.
export function settingsOf(entry, jumpHost) {
  const { name, token } = entry;
  if (typeof entry.address === "string") return { name, address: entry.address, token };
  if (!jumpHost) throw new BridgeError("JumpHostMissing", {}, `Bridge ${name} is reached through the jump host, and none is stored.`);
  if (typeof jumpHost.httpsAddress !== "string" || !jumpHost.httpsAddress) return { name, address: `http://localhost:${entry.port}`, token };
  return { name, address: `${jumpHost.httpsAddress.replace(/\/+$/, "")}${bridgePath(name)}`, token,
    ...(jumpHost.login ? { login: { ...jumpHost.login } } : {}) };
}

// pair(address, pairingToken, login?) -> the settings it was given, { address, token, login? }, which carry in addition, not enumerable, the name
// the Bridge reports (`name`) and the settings to store under it (`settings`: { name, address, token, login? }).
export async function pair(address, pairingToken, login) {
  const bridge = bridgeAt({ address, token: pairingToken, login });
  const answer = await call(bridge, "/v1/pair", { method: "GET" });
  const given = { address: bridge.address, token: pairingToken, ...(login ? { login: { ...login } } : {}) };
  const name = answer?.bridge?.name;
  return Object.defineProperties(given, { name: { value: name }, settings: { value: { name, ...given } } });
}

function apiRoute(method, path) {
  const route = bridgeApi.routes.find((candidate) => candidate.method === method && candidate.path === path);
  if (!route) throw new TypeError(`bridgeApi does not define ${method} ${path}`);
  return route;
}

export async function testBridge(bridge) {
  const pairRoute = apiRoute("GET", "/v1/pair");
  const paired = await call(bridge, pairRoute.path, { method: pairRoute.method });
  const route = apiRoute("GET", "/v1/agents");
  const agents = await call(bridge, route.path, { method: route.method });
  return { ...paired, ...agents };
}

export async function handOver(bridge, job) {
  const route = apiRoute("POST", "/v1/jobs");
  return call(bridge, route.path, { method: route.method, body: JSON.stringify({ product: job.product, record: job.record, commit: job.commit }) });
}

export async function ask(bridge, target, input) {
  const start = apiRoute("POST", "/v1/ask");
  const { ask: id } = await call(bridge, start.path, { method: start.method, body: JSON.stringify({ ...target, input }) });
  const follow = apiRoute("GET", "/v1/ask/{ask}");
  for (;;) {
    const answer = await call(bridge, follow.path.replace("{ask}", id), { method: follow.method });
    if (answer.state === "done") return { text: answer.text, usage: answer.usage ?? null };
    if (answer.state === "failed") throw new BridgeError("AskFailed", {}, answer.error ?? "The Bridge ask failed.");
  }
}

export async function probe(bridge, kind, args) {
  if (!["endpoint-test", "agent"].includes(kind)) throw new TypeError("this Bridge client implements endpoint-test and agent probes");
  const route = bridgeApi.routes.find((candidate) => candidate.method === "POST" && candidate.path === "/v1/probes/{kind}" && candidate.kinds.includes(kind));
  if (!route) throw new TypeError(`bridgeApi does not define ${kind}`);
  const body = await call(bridge, route.path.replace("{kind}", kind), { method: route.method, body: JSON.stringify({ args }) });
  return body?.answer;
}
