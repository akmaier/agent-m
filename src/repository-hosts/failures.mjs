// The failures of a repository host, told apart from the servers' answers, and the one request every adapter sends: the token
// only as the authorisation header of requests to the API of the server that issued it, under the one repository the host is
// for (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT), and never in an address (A CREDENTIAL IS NEVER PLACED IN A URL).
//
// Module: MOD-repository-hosts
//
// Private to the module: the adapters (github.mjs, gitlab.mjs) send through `send` and turn a refused answer into its failure
// with `refusal`; index.mjs offers HostError to the callers.

// HostError — one failure, named by `name`, with its fields (MOD-repository-hosts, Interfaces):
//   TokenRefused { tokenName, renewal } · PermissionMissing { permission, renewal } · RateLimited { limit, resetsAt } ·
//   NotFound { what } · Moved { head } · SecretRefused { path } · NotSupported { what } · Unreachable { reason }
export class HostError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields);
  }
}

// gate: what one host may send where — { allowed: [address], tokenAt: address, header, value, token }: every request goes to an
// address under one of `allowed`; the header `header: value` that carries the token is added to a request under `tokenAt` only.
const under = (u, prefix) => {
  const at = u.origin + u.pathname;
  return at === prefix || at.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`);
};

// The checks every request passes before it is sent -> [address, init]. A request outside the host's addresses, or one whose
// address holds the token, is a fault of the adapter that built it and is refused with a TypeError before anything is sent.
function prepare(url, { method = "GET", headers = {}, body } = {}, gate) {
  const u = new URL(url);
  if (!gate.allowed.some((p) => under(u, p))) throw new TypeError(`not an address of this repository: ${u.origin}${u.pathname}`);
  if (gate.token && u.href.includes(gate.token)) throw new TypeError("a credential is never placed in an address");
  const h = { ...headers };
  if (gate.value && under(u, gate.tokenAt)) h[gate.header] = gate.value;
  return [u, { method, headers: h, credentials: "omit", cache: "no-store", ...(body === undefined ? {} : { body }) }];
}

// One request -> the server's answer, whatever its status. A request the browser cannot make — no network, a server that does
// not answer, a server that does not allow the page's origin — fails with Unreachable, giving the browser's reason.
export async function send(url, options, gate) {
  const [u, init] = prepare(url, options, gate);
  let answer;
  try { answer = await fetch(u, init); } catch (e) {
    const reason = String(e?.message ?? e);
    throw new HostError("Unreachable", { reason }, `${u.origin} could not be reached: ${reason}`);
  }
  return answer;
}

// The JSON of an answer; an answer that is no JSON did not come from the server's API.
export async function json(answer, origin) {
  const t = await answer.text();
  try { return JSON.parse(t); } catch {
    const reason = `${origin} answered with something other than its API's JSON`;
    throw new HostError("Unreachable", { reason }, reason);
  }
}

const header = (answer, name) => answer.headers.get(name);
const resetDate = (v) => (Number(v) > 0 ? new Date(Number(v) * 1000) : null);

// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN: a 403 or 429 that the server's rate-limit headers mark as a used-up
// limit -> { limit: "account" | "network", resetsAt: Date | null }; anything else -> null. GitHub answers a used-up primary
// limit with 403 or 429 and X-RateLimit-Remaining: 0; the limit is the account's (5000 an hour) or, without a token, the
// network's (60 an hour), and X-RateLimit-Reset is when it starts again, in seconds since 1970. A GitLab server answers 429, or
// 403 with RateLimit-Remaining: 0, and tells the time in RateLimit-Reset only where it lets the page read that header. Whose
// limit it is where no header says: the account's when the request carried a token, else the network's.
function usedUpLimit(answer, server, authenticated) {
  if (answer.status !== 403 && answer.status !== 429) return null;
  const whose = authenticated ? "account" : "network";
  if (server === "gitlab") {
    const remaining = header(answer, "ratelimit-remaining");
    if (answer.status !== 429 && remaining !== "0") return null;
    return { limit: whose, resetsAt: remaining === "0" ? resetDate(header(answer, "ratelimit-reset")) : null };
  }
  if (header(answer, "x-ratelimit-remaining") !== "0") return null;
  const perHour = Number(header(answer, "x-ratelimit-limit"));
  return { limit: perHour > 0 ? (perHour <= 60 ? "network" : "account") : whose, resetsAt: resetDate(header(answer, "x-ratelimit-reset")) };
}

// The failure a refused answer means. context: { server: "github" | "gitlab", host: the server's name, web: the repository's
// address, authenticated, tokenName, renewal: the page where the token is renewed or extended, permission: what the request
// needs, write: whether it writes, what: what a 404 of a read did not find }.
//   401 — the token itself is refused: TokenRefused, whatever else the answer says (AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL
//         LINKED); a used-up limit's headers on it do not make it a limit.
//   403, 429 with a used-up limit — RateLimited, never the token.
//   403 — PermissionMissing. 404 — a write's is PermissionMissing too: GitHub answers a token that may not write to a private
//         repository with 404; a read's is NotFound.
//   Any other — the server did not serve the request: Unreachable, with its status.
export async function refusal(answer, context) {
  const { server, host, web, authenticated, tokenName, renewal, permission, write, what } = context;
  if (answer.status === 401) {
    return new HostError("TokenRefused", { tokenName, renewal }, server === "github"
      ? `GitHub refused your ${tokenName} — it has expired, or was regenerated or deleted on GitHub. Renew it on ${renewal}.`
      : `${host} refused your ${tokenName} — it has expired, or was rotated or revoked on GitLab. Renew it on ${renewal}.`);
  }
  const limit = usedUpLimit(answer, server, authenticated);
  if (limit) {
    const whose = limit.limit === "account" ? "the account these requests are made with" : "this network, for requests without a token";
    return new HostError("RateLimited", limit, `${host}'s request limit for ${whose} is used up` +
      (limit.resetsAt ? `; it resets at ${limit.resetsAt.toISOString()}.` : `; ${host} does not tell this page when it resets.`));
  }
  if (answer.status === 403 || (answer.status === 404 && write)) {
    return new HostError("PermissionMissing", { permission, renewal }, authenticated
      ? `Your ${tokenName} may not ${write ? "write to" : "read"} ${web}: it lacks ${permission}. Add the repository and the permission ` +
        `to the token on ${renewal}.`
      : `${web} needs a token with ${permission} to be ${write ? "written" : "read"}.`);
  }
  if (answer.status === 404) {
    return new HostError("NotFound", { what }, `${what} was not found` +
      (authenticated ? "." : " — a private repository is found only with a token that reaches it."));
  }
  const reason = `${host} answered ${answer.status} ${answer.statusText}`.trim();
  return new HostError("Unreachable", { reason }, reason);
}
