// Shared fixtures of tests/review-core.test.mjs and the files of this folder — no test of its own. Moved here, unchanged but for
// `export` and the paths relative to this folder, when the file was split by module (ITM-004): the fake git servers, the fake
// browser storage, the dashboard's own files, and the constants several modules' tests use.

import { readFileSync, readdirSync } from "node:fs";
import { gitBlobSha } from "../../docs/assets/review-core.mjs";

// The dashboard's own files (MOD-dashboard-app): the shell, docs/assets/dashboard-app.mjs, and its views and settings sections
// under docs/assets/dashboard/. A test that read the one app file reads them all, or — `shell: false` — the views alone.
export const ASSETS = new URL("../../docs/assets/", import.meta.url);
export const viewFiles = () => readdirSync(new URL("dashboard/", ASSETS), { recursive: true }).filter((f) => f.endsWith(".mjs")).sort()
  .map((f) => new URL(`dashboard/${f}`, ASSETS));
export const dashboardText = ({ shell = true } = {}) => [...(shell ? [new URL("dashboard-app.mjs", ASSETS)] : []), ...viewFiles()]
  .map((u) => readFileSync(u, "utf8")).join("\n");

export const click = { isTrusted: true };

export function fakeGitHub(files = {}) {
  // Minimal git-data API: one branch "main" at commit c0 with tree t0.
  const calls = [];
  const fetchMock = async (u, init) => {
    const url = new URL(u), m = init.method, path = url.pathname;
    calls.push([m, path, init.headers?.Authorization, init.body ? JSON.parse(init.body) : null]);
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (m === "GET" && path.endsWith("/git/ref/heads/main")) return ok({ object: { sha: "c0" } });
    if (m === "GET" && path.endsWith("/git/commits/c0")) return ok({ tree: { sha: "t0" } });
    if (m === "GET" && path.includes("/contents/")) {
      const p = decodeURIComponent(path.split("/contents/")[1]);
      return p in files ? ok({ sha: files[p] }) : new Response("{}", { status: 404 });
    }
    if (m === "POST" && path.endsWith("/git/trees")) return ok({ sha: "t1" });
    if (m === "POST" && path.endsWith("/git/commits")) return ok({ sha: "c1", html_url: "https://github.com/a/b/commit/c1" });
    if (m === "PATCH" && path.endsWith("/git/refs/heads/main")) return ok({ object: { sha: "c1" } });
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}

export async function withFetch(mock, f) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await f(); } finally { globalThis.fetch = real; }
}

export function fakeStorage() {
  const mem = new Map();
  return { mem, getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k), get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
}

export const QD = "docs/spec-freigaben/2026-09-24g_x";
export const WHEN = new Date("2026-09-29T16:03:00Z");
export const B_SPEC = "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nold ten\n";
export const B_P05 = "## 10. R\n\nnew ten\n\n## 11. X\n\n*(not yet approved)*\n";
export const B_P06 = "## 11. X\n\nrule of eleven\n";
export const B_INDEX = "**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n" +
  "| 05 | `SPEC.md` | ## 10. R | — | — |\n| 06 | `SPEC.md` | ## 11. X | — | — |\n";
export const B_UC1 = "---\nid: UC-001\n---\n# one\n", B_UC2 = "---\nid: UC-002\n---\n# two\n";

export const SETTINGS_OFF = "# Settings of alice/thesis\n\nintro\n\n- pseudonymisation: off\n";

export const PEOPLE = [{ name: "Jane Doe", account: "jdoe", agreed: "2026-09-30" }, { name: "Max Müller", account: "max-m", agreed: "2026-10-01" }];

export const GL = "https://gitlab.example.org";
export const GL_ADDR = `${GL}/grp/sub/proj`;
export const GL_TOKEN = "glpat-projectTOKENvalue0123456789";
export const H0 = "a".repeat(40), H1 = "b".repeat(40), NEWC = "c".repeat(40);

// A GitLab server with one project and branch "main" at H0. files: { path: text } at H0.
// moveAt: after this many branch reads, the branch answers H1 (another commit arrived).
// parent: the parent GitLab reports for the commit it wrote (default: the branch head).
export async function fakeGitLab({ files = {}, moveAt = null, parent = null, changed = [], postStatus = 201, postBody = null,
  project = "grp/sub/proj", server = GL } = {}) {
  const calls = [];
  const base = `/api/v4/projects/${encodeURIComponent(project)}`;
  const blobs = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  let branchReads = 0;
  const ok = (o, status = 200) => new Response(JSON.stringify(o), { status });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), m = (init.method || "GET").toUpperCase(), h = init.headers || {};
    calls.push({ origin: url.origin, method: m, path: url.pathname, query: Object.fromEntries(url.searchParams),
      token: h["PRIVATE-TOKEN"], authorization: h.Authorization, body: init.body ? JSON.parse(init.body) : null });
    if (url.origin !== server || !url.pathname.startsWith(base)) return ok({ message: "404 Project Not Found" }, 404);
    const rest = url.pathname.slice(base.length);
    if (rest === "" && m === "GET") return ok({ path_with_namespace: project, default_branch: "main", visibility: "private",
      web_url: `${server}/${project}`, permissions: { project_access: { access_level: 30 } } });
    if (rest === "/repository/branches/main" && m === "GET") {
      branchReads += 1;
      return ok({ name: "main", commit: { id: moveAt !== null && branchReads > moveAt ? H1 : H0 } });
    }
    if (rest.startsWith("/repository/commits/") && m === "GET") return ok({ id: H0 });
    if (rest === "/repository/tree" && m === "GET") {
      const all = [...new Set(Object.keys(files).flatMap((p) => p.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"))))]
        .map((p) => ({ id: "t".repeat(40), path: p, type: "tree" }))
        .concat(Object.keys(files).map((p) => ({ id: blobs[p], path: p, type: "blob" })));
      const per = Number(url.searchParams.get("per_page") || 20), page = Number(url.searchParams.get("page") || 1);
      return ok(all.slice((page - 1) * per, page * per));
    }
    if (rest.startsWith("/repository/files/") && m === "GET") {
      const raw = rest.endsWith("/raw");
      const p = decodeURIComponent(rest.slice("/repository/files/".length).replace(/\/raw$/, ""));
      if (!(p in files)) return ok({ message: "404 File Not Found" }, 404);
      return raw ? new Response(files[p], { status: 200 }) : ok({ file_path: p, blob_id: blobs[p], commit_id: H0, last_commit_id: "d".repeat(40) });
    }
    if (rest === "/repository/commits" && m === "POST") {
      if (postStatus !== 201) return ok(postBody || { message: "refused" }, postStatus);
      return ok({ id: NEWC, parent_ids: [parent || H0], web_url: `${server}/${project}/-/commit/${NEWC}` }, 201);
    }
    if (rest === "/repository/compare" && m === "GET") return ok({ diffs: changed.map((p) => ({ old_path: p, new_path: p })) });
    return ok({ message: "unexpected" }, 500);
  };
  return { calls, fetchMock, blobs };
}

export const UC_OLD = "docs/use-cases/UC-010-run-a-stage-in-github-actions.md", UC_NEW = "docs/use-cases/UC-010-run-a-job-in-github-actions.md";

export const JUMP = { host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003,
  reverseKey: "~/.ssh/agent-m-jump", forwardKey: "~/.ssh/id_ed25519" };
export const BRIDGE_TOKEN = "bridgeTOKEN-0123456789abcdef";
