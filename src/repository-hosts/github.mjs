// The adapter for GitHub's REST API: one repository on github.com, read and written with the person's token, sent only to
// GitHub's API for this repository; a public repository is read without one, its files from GitHub's raw host.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), commitFiles(change) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const API = "https://api.github.com", RAW = "https://raw.githubusercontent.com";
const JSON_ACCEPT = "application/vnd.github+json", RAW_ACCEPT = "application/vnd.github.raw+json";
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

// The bytes of a file as base64, in pieces small enough for String.fromCharCode.
function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// address: a RepositoryAddress on github.com; token: the person's GitHub token, or none; tokenName: the name it was stored
// under; links: the host's WebLinks, whose list of tokens is where a refused token is renewed and a repository added to it.
export function githubAdapter(address, { token, tokenName }, links) {
  const repo = `${API}/repos/${address.path}`;
  const gate = { allowed: [repo, `${RAW}/${address.path}`], tokenAt: repo, header: "Authorization",
    value: token ? `Bearer ${token}` : null, token };
  const context = { server: "github", host: "GitHub", web: address.web, authenticated: Boolean(token), tokenName,
    renewal: links.tokens, permission: "Contents", what: address.web };

  // One request to the repository's API -> its answer when the server served it. on: { status: (answer) -> value } for the
  // answers a call names itself; every other refusal becomes its failure (failures.mjs refusal).
  async function call(method, url, { body, accept = JSON_ACCEPT, on = {}, ...more } = {}) {
    const answer = await send(url, { method, headers: { Accept: accept, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body) }, gate);
    if (answer.ok) return answer;
    if (on[answer.status]) return on[answer.status](answer);
    throw await refusal(answer, { ...context, write: method !== "GET", ...more });
  }
  // A read's JSON; what an `on` handler returns instead of an answer is passed on as it is.
  const read = async (url, options) => {
    const answer = await call("GET", url, options);
    return answer instanceof Response ? json(answer, API) : answer;
  };

  // A branch's reference: read at git/ref/heads/…, moved at git/refs/heads/… ("Get a reference", "Update a reference").
  const heads = (branch) => `heads/${encodeURIComponent(branch).replace(/%2F/g, "/")}`;
  // The commit the branch stands at now, or null when there is no such branch.
  const branchHead = async (branch) => (await read(`${repo}/git/ref/${heads(branch)}`, { on: { 404: () => null } }))?.object?.sha ?? null;
  const moved = (branch, head) => new HostError("Moved", { head },
    `${branch} has moved on${head ? ` to ${head.slice(0, 12)}` : ""} since it was read — nothing was written; read it again.`);

  return {
    async repositoryInfo() {
      const r = await read(repo, { permission: "Metadata" });
      return { defaultBranch: r.default_branch ?? null, visibility: r.visibility ?? (r.private ? "private" : "public"),
        canWrite: Boolean(token) && r.permissions?.push === true, archived: r.archived === true, description: r.description ?? "" };
    },

    // The branch, tag or commit resolved to one commit, then that commit's tree: every file, by its blob SHA.
    async snapshot(name) {
      const what = `${address.web} at ${name}`;
      const notFound = () => { throw new HostError("NotFound", { what }, `${what} was not found.`); };
      const c = await read(`${repo}/commits/${encodeURIComponent(name)}`, { what, on: { 422: notFound } });
      const t = await read(`${repo}/git/trees/${c.sha}?recursive=1`, { what });
      return { commit: c.sha, blobs: new Map(t.tree.filter((e) => e.type === "blob").map((e) => [e.path, e.sha])) };
    },

    // One file's text at a commit, or null where the commit does not hold it: with a token through the API — the only place
    // the token may go, which is also what reads a private repository —, without one from GitHub's raw host.
    async readFile(commit, path) {
      const url = token ? `${repo}/contents/${encPath(path)}?ref=${commit}` : `${RAW}/${address.path}/${commit}/${encPath(path)}`;
      const answer = await call("GET", url, { accept: RAW_ACCEPT, what: `${path} at ${commit}`, on: { 404: () => null } });
      return answer === null ? null : answer.text();
    },

    // One commit of all the files on the head that was read: the branch is checked to stand at expectedHead, the tree is built
    // on that commit's tree, the commit's only parent is expectedHead, and the branch is moved to it only as a fast-forward —
    // GitHub refuses that with 422 when the branch moved meanwhile, and nothing is written.
    async commitFiles({ branch, expectedHead, files, message }) {
      const now = await branchHead(branch);
      if (now !== expectedHead) throw moved(branch, now);
      const base = (await read(`${repo}/git/commits/${expectedHead}`)).tree.sha;
      const tree = [];
      for (const f of files) {
        if (f.delete) tree.push({ path: f.path, mode: "100644", type: "blob", sha: null });
        else if (f.bytes) {
          const blob = await json(await call("POST", `${repo}/git/blobs`, { body: { content: base64(f.bytes), encoding: "base64" } }), API);
          tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
        } else tree.push({ path: f.path, mode: "100644", type: "blob", content: f.text });
      }
      const written = await json(await call("POST", `${repo}/git/trees`, { body: { base_tree: base, tree } }), API);
      const commit = await json(await call("POST", `${repo}/git/commits`, { body: { message, tree: written.sha, parents: [expectedHead] } }), API);
      await call("PATCH", `${repo}/git/refs/${heads(branch)}`, { body: { sha: commit.sha, force: false },
        on: { 422: async () => { throw moved(branch, await branchHead(branch).catch(() => null)); } } });
      return { commit: commit.sha, url: commit.html_url ?? `${address.web}/commit/${commit.sha}` };
    },
  };
}
