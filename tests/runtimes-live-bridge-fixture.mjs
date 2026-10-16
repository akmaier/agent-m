// Module: MOD-runtimes
// The fixture Bridge of the live-state tests of ITM-545 (tests/runtimes-live-state.test.mjs, tests/runtimes-live-bridge.test.mjs), no test of its own: a stand-in for the global `fetch`
// that speaks the three job routes of the Bridge's API as MOD-bridge-client sends them — `GET /v1/jobs`, `GET /v1/jobs/{id}/log?from={line}` and `POST /v1/jobs/{id}/cancel`, each with the
// pairing token in the header `x-agent-m-bridge-token` — and keeps every request in the order it came. It answers a request without the token as token-refused (401), a job it does not know
// as not-found (404), and any other address or route as `stray` (also 404): a request that is not for the Bridge it stands for. No expected result is computed here; each test states its own.
// Nothing reaches the network: the stand-in replaces `fetch` and `restoreFetch()` of tests/runtimes-live-fixture.mjs puts it back.

import { bridgeAt } from "../src/bridge-client/index.mjs";

export const BRIDGE_ADDRESS = "http://localhost:4712";
export const BRIDGE_TOKEN = "token-lab-pc-545";
export const BRIDGES = { "lab-pc": bridgeAt({ address: BRIDGE_ADDRESS, token: BRIDGE_TOKEN }) };
export const bridgeRow = (id, state = "running", usage = null) => ({ id, product: "alice/product", kind: "write-tests", agent: "codex", state, started: "2026-10-16T11:01:00Z", usage });

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const notFound = (id) => json({ error: "not-found", message: `No job ${id}.` }, 404);

/**
 * fixtureBridge({ jobs, outage, onRequest }) -> { requests, stray } — installs the stand-in as the global `fetch`.
 * `jobs` is an array of { row, lines, ended, script, confirm }: the row `GET /v1/jobs` lists; the log's lines and whether it has ended, answered from the line asked, with `next` the number of
 * lines; or, as `script`, the answers to give in turn (each { lines, next, ended }, one per ask of the log, the `from` of each kept in `requests`); and `confirm`, the `confirmed` a cancel
 * answers (true unless given), after which the job's row is `cancelled`. `outage` makes the stand-in throw as a fetch does when the Bridge is not running. `onRequest(request)` is called with
 * each request before it is answered. `requests` is [{ method, url, token }] for the Bridge; `stray` holds every other request.
 */
export function fixtureBridge({ jobs = [], outage = null, onRequest = () => {} } = {}) {
  const requests = [], stray = [];
  const byId = new Map(jobs.map((job) => [job.row.id, job]));
  globalThis.fetch = async (url, init = {}) => {
    const where = new URL(String(url));
    const request = { method: init.method, url: String(url), token: init.headers?.["x-agent-m-bridge-token"] ?? null };
    if (where.origin !== BRIDGE_ADDRESS) { stray.push(request); return notFound("(stray)"); }
    requests.push(request);
    onRequest(request);
    if (outage) throw new TypeError(outage);
    if (request.token !== BRIDGE_TOKEN) return json({ error: "token-refused", message: "pair again" }, 401);
    if (request.method === "GET" && where.pathname === "/v1/jobs") return json({ jobs: jobs.map((job) => job.row) });
    const log = /^\/v1\/jobs\/([^/]+)\/log$/.exec(where.pathname);
    if (request.method === "GET" && log) {
      const job = byId.get(decodeURIComponent(log[1]));
      if (!job) return notFound(decodeURIComponent(log[1]));
      const from = Number(where.searchParams.get("from"));
      request.from = from;
      if (job.script) return job.script.length ? json(job.script.shift()) : json({ error: "upstream-failed", message: "the script of the log has no answer left" }, 502);
      return json({ lines: job.lines.slice(from), next: job.lines.length, ended: job.ended });
    }
    const cancel = /^\/v1\/jobs\/([^/]+)\/cancel$/.exec(where.pathname);
    if (request.method === "POST" && cancel) {
      const job = byId.get(decodeURIComponent(cancel[1]));
      if (!job) return notFound(decodeURIComponent(cancel[1]));
      if (job.confirm ?? true) job.row.state = "cancelled";
      return json({ confirmed: job.confirm ?? true });
    }
    stray.push(request);
    return notFound("(route)");
  };
  return { requests, stray };
}
