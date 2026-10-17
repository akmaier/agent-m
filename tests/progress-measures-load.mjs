// A counting fake of GitHub for the tests of MOD-progress-measures' productFacts — a helper, no test of its own. It serves one product
// repository (and an instance repository) from files held in memory through the real MOD-repository-hosts host: the repository, the
// commit and the tree of a branch, a file by itself (with a token from the API, without one from the raw host), many files in one
// batch request (POST /graphql, with a token), the pull requests and the tags (none), and no branch test-results. Every request is
// recorded by what it reads. Nothing reaches the network; nothing sleeps.
//
// Module: MOD-progress-measures

import { createHash } from "node:crypto";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

export const TOKEN = "github_pat_PM826LOAD0123456789abcdefghij";
export const PRODUCT = "alice/product";
export const INSTANCE = "alice/agent-m";

const blobOf = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");
const headOf = (repo) => createHash("sha1").update(repo).digest("hex");

const frontMatter = (fields) => ["---", ...Object.entries(fields).flatMap(([key, value]) => (Array.isArray(value)
  ? [`${key}:`, ...value.map((entry) => `  - ${entry}`)] : [`${key}: ${value}`])), "---"].join("\n");

const REGISTER = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents of the fixture instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |", ""].join("\n");

const SPEC = ["# Product — Specification", "", "## 1. Section", "",
  "**FIRST RULE** *(Product Owner)*", "The first rule holds.", "*Check:* `tests/unit.test.mjs`", "",
  "**SECOND RULE** *(Product Owner)*", "The second rule holds.", "*Check:* no automatic check; at review.", ""].join("\n");

const TEST_FILE = ["// TST-001 · level: unit · module: MOD-store", "// guards: FIRST RULE", "// given: a store", "// input: a read",
  "// expect: its text", "test(\"a store reads\", () => {});", ""].join("\n");

const num = (n, width) => String(n).padStart(width, "0");

/** The files of a product with `items` backlog items, `jobs` job records, a SPEC.md of two requirements and one test file. */
export function productFiles({ items, jobs }) {
  const files = { "SPEC.md": SPEC, "tests/unit.test.mjs": TEST_FILE };
  for (let i = 1; i <= items; i++) {
    const id = `ITM-${num(i, 4)}`;
    files[`docs/backlog/${id}-work.md`] = [frontMatter({ id, title: `${id} the work`, level: "module", realises: ["FIRST RULE"], modules: ["MOD-store"] }),
      `# ${id} the work`, ""].join("\n");
  }
  for (let i = 1; i <= jobs; i++) {
    const id = `JOB-20261014-0900-${num(i.toString(16), 4)}`;
    files[`docs/jobs/${id}.md`] = ["---", `id: ${id}`, "kind: implement", "works_on:", "  - ITM-0001", "route: ci hosted", "started_by: alice",
      "start: 2026-10-14 09:00 UTC", "agent_m: unknown, commit unknown", "limit: 1", "---", "## Destinations", "", "## Parameters", "", "```json", "{}",
      "```", ""].join("\n");
  }
  return files;
}

/** The instance: its participant list (and a SPEC.md). */
export const instanceFiles = () => ({ "SPEC.md": "# Instance — Specification\n", "docs/participants.md": REGISTER });

/**
 * A fake GitHub serving `repos` ({ "owner/name": { path: text } }) at their branch main, with the requests recorded:
 * `results` ({ path: text }) gives the product a branch test-results. `log` one entry per request { kind, files }, where kind is "repository", "commit", "tree", "file", "batch", "pull requests", "tags",
 * "other"; `files` the paths the request reads (one for a file, many for a batch). install() puts it in place of fetch; restore() back.
 */
export function githubServer(repos, { results = null } = {}) {
  const log = [];
  const state = Object.fromEntries(Object.entries(repos).map(([repo, files]) => [repo, {
    files, head: headOf(repo), shas: new Map(Object.entries(files).map(([path, text]) => [path, blobOf(text)])),
  }]));
  // `results` ({ path: text }), where given, is the product's branch test-results; without it the repository has none (422).
  const branch = results && { files: results, head: headOf(`${PRODUCT}@test-results`), shas: new Map(Object.entries(results).map(([path, text]) => [path, blobOf(text)])) };
  const byHead = new Map(Object.entries(state).map(([repo, held]) => [held.head, repo]));
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fetchFake = async (input, init = {}) => {
    const url = new URL(String(input)), p = url.pathname, method = (init.method || "GET").toUpperCase();
    const entry = { kind: "other", files: [], auth: JSON.stringify(init.headers ?? {}).toLowerCase().includes("authorization"), what: `${method} ${p}` };
    log.push(entry);
    if (url.origin === "https://raw.githubusercontent.com") {
      const [, owner, name, commit, ...rest] = p.split("/");
      const path = rest.map(decodeURIComponent).join("/"), held = state[`${owner}/${name}`];
      entry.kind = "file";
      entry.files = [path];
      return held && commit === held.head && path in held.files ? new Response(held.files[path], { status: 200 }) : new Response("404", { status: 404 });
    }
    if (url.origin !== "https://api.github.com") return new Response("{}", { status: 500 });
    if (method === "POST" && p === "/graphql") {
      const asks = [...JSON.parse(init.body).query.matchAll(/(f\d+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)].map((m) => [m[1], JSON.parse(m[2])]);
      const repository = {};
      entry.kind = "batch";
      for (const [alias, expression] of asks) {
        const at = expression.indexOf(":"), held = state[byHead.get(expression.slice(0, at))], path = expression.slice(at + 1);
        entry.files.push(path);
        repository[alias] = held && path in held.files ? { text: held.files[path], isTruncated: false } : null;
      }
      return json({ data: { repository } });
    }
    const repo = /^\/repos\/([^/]+\/[^/]+)(\/.*)?$/.exec(p);
    const held = repo && state[repo[1]], rest = repo?.[2] ?? "";
    if (!held) return new Response("{}", { status: 404 });
    if (rest === "") { entry.kind = "repository"; return json({ private: false, default_branch: "main", visibility: "public", permissions: { push: true } }); }
    if (rest === "/commits/main") { entry.kind = "commit"; return json({ sha: held.head }); }
    if (rest === "/commits/test-results") {
      entry.kind = "commit";
      return branch && repo[1] === PRODUCT ? json({ sha: branch.head }) : json({ message: "No commit found for SHA: test-results" }, 422);
    }
    const tree = (from) => json({ sha: "t".repeat(40), truncated: false, tree: Object.keys(from.files).sort().map((path) => ({ path, mode: "100644", type: "blob", sha: from.shas.get(path) })) });
    if (rest === `/git/trees/${held.head}`) { entry.kind = "tree"; return tree(held); }
    if (branch && repo[1] === PRODUCT && rest === `/git/trees/${branch.head}`) { entry.kind = "tree"; return tree(branch); }
    if (rest.startsWith("/contents/")) {
      const path = rest.slice("/contents/".length).split("/").map(decodeURIComponent).join("/");
      entry.kind = "file";
      entry.files = [path];
      return path in held.files ? new Response(held.files[path], { status: 200 }) : new Response('{"message":"Not Found"}', { status: 404 });
    }
    if (rest === "/pulls") { entry.kind = "pull requests"; return json([]); }
    if (rest === "/tags") { entry.kind = "tags"; return json([]); }
    return new Response("{}", { status: 404 });
  };
  const real = globalThis.fetch;
  return { log, install() { globalThis.fetch = fetchFake; }, restore() { globalThis.fetch = real; } };
}

/** The product host and the instance's snapshot for a fake server, as a page holds them; `token` false reads without one. */
export async function hosts(server, { token }) {
  const credentials = token ? { token: TOKEN } : {};
  const host = connect(parseAddress(`https://github.com/${PRODUCT}`), credentials);
  const instanceHost = connect(parseAddress(`https://github.com/${INSTANCE}`), credentials);
  const instance = await instanceHost.readSnapshot("main");
  server.log.length = 0; // the instance's own commit and tree are the caller's, not productFacts'
  return { host, instance, instanceAt: (commit) => instanceHost.readSnapshot(commit) };
}

/** The recorded requests as a count per kind, the sizes of the batches in order, and the paths read by a request of their own. */
export function summary(log) {
  const kinds = {};
  for (const { kind } of log) kinds[kind] = (kinds[kind] ?? 0) + 1;
  return {
    total: log.length, kinds,
    batches: log.filter((r) => r.kind === "batch").map((r) => r.files.length),
    singles: log.filter((r) => r.kind === "file").flatMap((r) => r.files),
    allFiles: log.flatMap((r) => r.files),
  };
}
