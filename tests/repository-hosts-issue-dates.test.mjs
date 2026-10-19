// MOD-repository-hosts' `Issue` names when it was opened and closed (ITM-1102), as the accepted text of docs/architecture/MOD-repository-hosts.md:138-140 states it (read from main): "`Issue` — `{ number, title, body, labels, state, url,
// opened: string, closed: string | null, comments: { author, body, date }[] }`: `opened` the date and time the issue was opened, `closed` the date and time the server reports it closed, `null` while it is open." The servers report both:
// GitHub's issue has `created_at` and `closed_at`, GitLab's `created_at` and `closed_at` ("List repository issues", "Create an issue"; "List project issues", "New issue").
// Run: node --test tests/repository-hosts-issue-dates.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-041; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// The servers are fakes of `fetch`, deterministic, no network. The reading the pull request names: `opened` is the server's `created_at` and `closed` its `closed_at`, both as the server gives them; `closed` is null for an open issue, whatever the server
// holds for a reopened one (an open issue has none). The counter-proofs are recorded in the pull request. Each test states its input and its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
const serving = (answer) => async (input, init = {}) => {
  const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
  return answer({ method: init.method ?? "GET", path: url.pathname, query: Object.fromEntries(url.searchParams), body: init.body === undefined ? null : JSON.parse(init.body) });
};

const GH_WEB = "https://github.com/carol/release-tool", GH_PREFIX = "/repos/carol/release-tool";
const GL_WEB = "https://gitlab.example.org/space/release-tool", GL_PREFIX = "/api/v4/projects/space%2Frelease-tool";
const hub = () => connect(parseAddress(GH_WEB), { token: "github_pat_CAROLreleaseTOOL0123456789abcdef" });
const lab = () => connect(parseAddress(GL_WEB), { token: "glpat-SPACEreleaseTOOL0123456789" });

const OPENED = "2026-10-05T08:00:00Z", CLOSED = "2026-10-07T16:30:00Z", OTHER = "2026-09-20T10:00:00Z";
const GH = [
  { number: 3, title: "Open", body: "", labels: [], state: "open", html_url: `${GH_WEB}/issues/3`, comments: 0, created_at: OPENED, closed_at: null },
  { number: 5, title: "Closed without a comment", body: "", labels: [], state: "closed", html_url: `${GH_WEB}/issues/5`, comments: 0, created_at: OTHER, closed_at: CLOSED },
  { number: 6, title: "Reopened", body: "", labels: [], state: "open", html_url: `${GH_WEB}/issues/6`, comments: 0, created_at: OTHER, closed_at: CLOSED },
];
const GL = [
  { iid: 7, title: "Open", description: "", labels: [], state: "opened", web_url: `${GL_WEB}/-/issues/7`, created_at: OPENED, closed_at: null },
  { iid: 8, title: "Closed without a note", description: "", labels: [], state: "closed", web_url: `${GL_WEB}/-/issues/8`, created_at: OTHER, closed_at: CLOSED },
];
const github = () => serving((r) => {
  if (r.path === `${GH_PREFIX}/issues` && r.method === "GET") return json(200, Number(r.query.page ?? 1) === 1 ? GH : []);
  if (r.path === `${GH_PREFIX}/issues` && r.method === "POST") return json(201, { number: 9, title: r.body.title, body: r.body.body, labels: r.body.labels.map((name) => ({ name })), state: "open", html_url: `${GH_WEB}/issues/9`, created_at: OPENED, closed_at: null });
  return json(404, { message: "Not Found" });
});
const gitlab = () => serving((r) => {
  if (r.path === `${GL_PREFIX}/issues` && r.method === "GET") return json(200, Number(r.query.page ?? 1) === 1 ? GL : []);
  if (r.path === `${GL_PREFIX}/issues` && r.method === "POST") return json(201, { iid: 10, title: r.body.title, description: r.body.description, labels: r.body.labels.split(","), state: "opened", web_url: `${GL_WEB}/-/issues/10`, created_at: OPENED, closed_at: null });
  return json(404, { message: "404 Not found" });
});
const datesOf = (issues) => issues.map(({ number, opened, closed }) => [number, opened, closed]);

// TST-1102001 · level: unit · module: MOD-repository-hosts
// guards: UC-041
// given: a GitHub repository with the open issue 3, the closed issue 5 (no comment) and the issue 6, reopened after it was closed; the same on GitLab as 7 (opened) and 8 (closed)
// input: listIssues({ state: "all" }) on each
// expect: GitHub: 3 opened 2026-10-05T08:00:00Z, closed null; 5 opened 2026-09-20T10:00:00Z, closed 2026-10-07T16:30:00Z; 6 opened 2026-09-20T10:00:00Z, closed null (it is open); GitLab: 7 opened …, closed null; 8 opened …, closed …
test("listIssues — each issue names when it was opened and, when closed, when", async () => {
  assert.deepEqual(datesOf(await using(github(), () => hub().listIssues({ state: "all" }))), [[3, OPENED, null], [5, OTHER, CLOSED], [6, OTHER, null]]);
  assert.deepEqual(datesOf(await using(gitlab(), () => lab().listIssues({ state: "all" }))), [[7, OPENED, null], [8, OTHER, CLOSED]]);
});

// TST-1102002 · level: unit · module: MOD-repository-hosts
// guards: UC-041
// given: both servers, which answer a new issue as open, created at 2026-10-05T08:00:00Z, with no closing
// input: createIssue({ title, body, labels }) on each
// expect: the Issue returned has opened 2026-10-05T08:00:00Z and closed null, besides its number, title, body, labels, state open and url
test("createIssue — the issue made names when it was opened and is not closed", async () => {
  const made = async (host, server) => using(server, () => host.createIssue({ title: "Export fails", body: "Empty file.", labels: ["defect"] }));
  const [a, b] = [await made(hub(), github()), await made(lab(), gitlab())];
  for (const issue of [a, b]) assert.deepEqual([issue.opened, issue.closed, issue.state], [OPENED, null, "open"]);
  assert.deepEqual([a.number, b.number], [9, 10]);
});
