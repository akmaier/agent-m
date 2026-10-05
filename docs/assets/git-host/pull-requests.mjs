// Git host — the pull requests of a product: a GitHub repository's pull requests and a GitLab project's merge requests, read as
// data, each token only to the API of the server that issued it.
//
// Module: MOD-git-host
//
// A file of the git host beside docs/assets/git-host.mjs (ARC-004): every request goes through its request helper fetchText —
// GET only, the authorisation header built there, never by this file, never in a URL. Reads only; the write
// pullRequests().merge(n, authority) is ITM-055's.
//
// The data of one pull request, the same on both hosts (GITLAB PRODUCTS ARE SUPPORTED):
//   { number, title, head, base, state: "open" | "merged" | "closed", openedAt, mergedAt, mergeCommit, participantLine, ci }
// — times as ISO strings in UTC; a field the server's answer does not carry is null, never taken from another field.
// participantLine: the first line of the body, where the body has one (UC-024: the pull request records who implemented it);
// who that names is the reader's business. ci: the state of the head commit's CI — "running", "passed", "failed",
// "cancelled", or null where the server names none; read by get(n) only, null in a list.
//
// What a read costs (the person's GitHub budget is 5000 requests an hour, A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE
// TOKEN): list — one request per page of 100, newest first, and no page past the one that reaches back before `since`;
// get — one request on GitLab (the merge request carries its head pipeline), two on GitHub (the pull request, then the
// workflow runs of its head commit, with the token's Actions permission).

import { fetchText, isGitLab, gitlabAuth, gitlabApiBase } from "../git-host.mjs";

export const PAGE = 100;
const MAX_PAGES = 1000;
const STATES = Object.freeze(["open", "merged", "closed", "all"]);

const iso = (t) => (t ? new Date(t).toISOString() : null);
const firstLine = (body) => (typeof body === "string" && body.length ? body.split(/\r?\n/)[0] : null);
const json = async (url, auth) => JSON.parse(await fetchText(url, {}, auth));

// ---------------------------------------------------------------- the CI state of a head commit

// GitHub: the workflow runs of the head commit ("List workflow runs for a repository", head_sha). A run not completed is
// running, and so is one completed as action_required (it waits for an approval); skipped, neutral and stale say nothing.
const GITHUB_DONE = { success: "passed", failure: "failed", timed_out: "failed", startup_failure: "failed", cancelled: "cancelled",
  action_required: "running" };
const ORDER = ["running", "failed", "cancelled", "passed"];

function githubCi(runs) {
  const states = runs.map((r) => (r.status !== "completed" ? "running" : GITHUB_DONE[r.conclusion] ?? null)).filter(Boolean);
  return ORDER.find((s) => states.includes(s)) ?? null;
}

// GitLab: the status of the merge request's head pipeline, from the statuses of GitLab's pipelines API.
const GITLAB_PIPELINE = { success: "passed", failed: "failed", canceling: "cancelled", canceled: "cancelled",
  created: "running", waiting_for_resource: "running", preparing: "running", waiting_for_callback: "running",
  pending: "running", running: "running", scheduled: "running", manual: "running" };

// The CI state of one commit — "running", "passed", "failed", "cancelled", or null where the server names none — as get(n)
// reads it for a pull request's head: on GitHub the workflow runs of the commit, on GitLab its newest pipeline. One request.
export async function commitCi({ product, commit, token = null }) {
  if (!/^[0-9a-f]{40}$/.test(String(commit))) throw new Error(`not a commit: ${commit}`);
  if (isGitLab(product)) {
    const list = await json(`${gitlabApiBase(product)}/pipelines?sha=${commit}&order_by=id&sort=desc&per_page=1`, gitlabAuth(product, token));
    return GITLAB_PIPELINE[list[0]?.status] ?? null;
  }
  const runs = (await json(`https://api.github.com/repos/${product.repo}/actions/runs?head_sha=${commit}&per_page=${PAGE}`, token)).workflow_runs ?? [];
  return githubCi(runs);
}

// ---------------------------------------------------------------- each host's answer, as the one shape

function fromGitHub(p) {
  const merged = Boolean(p.merged_at);
  return { number: p.number, title: p.title ?? null, head: p.head?.ref ?? null, base: p.base?.ref ?? null,
    state: p.state === "open" ? "open" : merged ? "merged" : "closed",
    openedAt: iso(p.created_at), mergedAt: iso(p.merged_at),
    // For an open pull request merge_commit_sha names GitHub's test merge commit: no merge commit until it is merged.
    mergeCommit: merged ? p.merge_commit_sha ?? null : null,
    participantLine: firstLine(p.body), ci: null };
}

// GitLab's "locked" is a merge request being merged: still open.
const GITLAB_STATE = { opened: "open", locked: "open", merged: "merged", closed: "closed" };

function fromGitLab(m) {
  const state = GITLAB_STATE[m.state] ?? null;
  return { number: m.iid, title: m.title ?? null, head: m.source_branch ?? null, base: m.target_branch ?? null, state,
    openedAt: iso(m.created_at), mergedAt: iso(m.merged_at),
    mergeCommit: state === "merged" ? m.merge_commit_sha ?? null : null,
    participantLine: firstLine(m.description), ci: null };
}

// ---------------------------------------------------------------- the two hosts' requests

function github(product, token) {
  const api = `https://api.github.com/repos/${product.repo}`;
  return {
    listUrl: ({ base, state }, page) => `${api}/pulls?state=${state === "open" ? "open" : state === "all" ? "all" : "closed"}` +
      `${base ? `&base=${encodeURIComponent(base)}` : ""}&sort=created&direction=desc&per_page=${PAGE}&page=${page}`,
    from: fromGitHub,
    async get(n) {
      const p = await json(`${api}/pulls/${n}`, token);
      const sha = p.head?.sha;
      const runs = sha ? (await json(`${api}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=${PAGE}`, token)).workflow_runs ?? [] : [];
      return { ...fromGitHub(p), ci: githubCi(runs) };
    },
    auth: token,
  };
}

function gitlab(product, token) {
  const auth = gitlabAuth(product, token), api = `${gitlabApiBase(product)}/merge_requests`;
  return {
    listUrl: ({ base, state }, page) => `${api}?state=${state === "open" ? "opened" : state}` +
      `${base ? `&target_branch=${encodeURIComponent(base)}` : ""}&order_by=created_at&sort=desc&per_page=${PAGE}&page=${page}`,
    from: fromGitLab,
    async get(n) {
      const m = await json(`${api}/${n}`, auth);
      return { ...fromGitLab(m), ci: GITLAB_PIPELINE[m.head_pipeline?.status] ?? null };
    },
    auth,
  };
}

// A token of the other host's kind is not sent at all (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT): a GitHub token is never
// a GitLab product's, a GitLab token never GitHub's.
function refuseForeignToken(product, token) {
  if (!token) return;
  if (isGitLab(product) && /^(github_pat_|ghp_|gho_|ghu_|ghs_)/.test(token)) {
    throw new Error("That is a GitHub token; a GitLab product is read with its own GitLab project token.");
  }
  if (!isGitLab(product) && /^(glpat-|gldt-|glptt-)/.test(token)) {
    throw new Error("That is a GitLab token; a GitHub repository is read with the GitHub token.");
  }
}

// ---------------------------------------------------------------- the interface

// pullRequests({ product, token }) -> { list(filter), get(n) } — product as parseProductAddress gives it; token: the GitHub token
// for a github.com product, the project's own token for a GitLab product, or none for a public one.
export function pullRequests({ product, token = null } = {}) {
  if (!product || typeof product.repo !== "string" || (!isGitLab(product) && product.host !== "github.com")) {
    throw new Error("pullRequests needs a product, as parseProductAddress gives it");
  }
  const host = isGitLab(product) ? gitlab(product, token) : github(product, token);
  return {
    // filter: { base, state: "open" | "merged" | "closed" | "all" (default), since } -> [pull request], newest first. Pages of
    // 100; with `since`, the reading stops after the first page that reaches back before it, and only what was opened at or
    // after it is returned; without `since`, it reads to the end.
    async list({ base = null, state = "all", since = null } = {}) {
      refuseForeignToken(product, token);
      if (!STATES.includes(state)) throw new Error(`state is one of ${STATES.join(", ")}: ${state}`);
      if (base !== null && (typeof base !== "string" || !base)) throw new Error("base is a branch name");
      const from = since === null ? null : new Date(since);
      if (from && Number.isNaN(from.getTime())) throw new Error(`since is not a date: ${since}`);
      const out = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const items = (await json(host.listUrl({ base, state }, page), host.auth)).map(host.from);
        out.push(...items);
        if (items.length < PAGE) break;
        if (from && new Date(items.at(-1).openedAt) < from) break;
      }
      return out.filter((p) => (state === "all" || p.state === state) && (!from || new Date(p.openedAt) >= from));
    },
    // n: the pull request's number (GitLab: the merge request's iid) -> one pull request, with the CI state of its head.
    async get(n) {
      refuseForeignToken(product, token);
      if (!Number.isSafeInteger(n) || n < 1) throw new Error(`a pull request is named by its number: ${String(n)}`);
      return host.get(n);
    },
  };
}
