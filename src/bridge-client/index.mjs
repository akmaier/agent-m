// The page's client for the Bridge API used by UC-003 endpoint tests.
//
// Module: MOD-bridge-client
// Public: BridgeError, bridgeAt, pair, probe

import { bridgeApi } from "../bridge-http/index.mjs";

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
  try {
    answer = await fetch(address, { ...init, headers, signal, credentials: "omit", cache: "no-store" });
  } catch (error) {
    if (error?.name === "TimeoutError") throw new BridgeError("Timeout", {}, "The Bridge request timed out.");
    const likely = likelyNoAnswer(bridge);
    throw new BridgeError("NoAnswer", { likely }, `The Bridge gave no answer: ${String(error?.message ?? error)}`);
  }
  const body = await answerJson(answer);
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

export async function pair(address, pairingToken) {
  const bridge = bridgeAt({ address, token: pairingToken });
  await call(bridge, "/v1/pair", { method: "GET" });
  return { address: bridge.address, token: pairingToken };
}

export async function probe(bridge, kind, args) {
  if (kind !== "endpoint-test") throw new TypeError("this Bridge client implements endpoint-test probes");
  const route = bridgeApi.routes.find((candidate) => candidate.method === "POST" && candidate.path === "/v1/probes/{kind}" && candidate.kinds.includes(kind));
  if (!route) throw new TypeError("bridgeApi does not define endpoint-test");
  const body = await call(bridge, route.path.replace("{kind}", kind), { method: route.method, body: JSON.stringify({ args }) });
  return body?.answer;
}
