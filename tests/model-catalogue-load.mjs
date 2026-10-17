// A counting fake of GitHub for the tests of MOD-model-catalogue's catalogue — a helper, no test of its own. It serves one
// instance repository from files held in memory through the real MOD-repository-hosts host: the commit and the tree of the
// branch main, a file by itself (with a token from the API, without one from the raw host) and many files in one batch request
// (POST /graphql, with a token). Every request is recorded by what it reads. Nothing reaches the network; nothing sleeps.
//
// Module: MOD-model-catalogue

import { createHash } from "node:crypto";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

export const TOKEN = "github_pat_MC841LOAD0123456789abcdefghijkl";
export const INSTANCE = "alice/agent-m";

/** The blob SHA git gives a text: the SHA-1 of `blob <bytes>\0` and the text. */
export const blobOf = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");
const HEAD = createHash("sha1").update(INSTANCE).digest("hex");

/**
 * A fake GitHub serving the instance repository `files` ({ path: text }) at its branch main. `log` holds one entry per request,
 * { kind, files }: kind is "commit", "tree", "file", "batch" or "other", `files` the paths the request reads (one for a file,
 * many for a batch). install() puts the fake in place of fetch; restore() puts the real one back.
 */
export function githubServer(files) {
  const log = [];
  const shas = new Map(Object.entries(files).map(([path, text]) => [path, blobOf(text)]));
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fetchFake = async (input, init = {}) => {
    const url = new URL(String(input)), p = url.pathname, method = (init.method || "GET").toUpperCase();
    const entry = { kind: "other", files: [], what: `${method} ${url.origin}${p}` };
    log.push(entry);
    if (url.origin === "https://raw.githubusercontent.com") {
      const [, owner, name, commit, ...rest] = p.split("/");
      const path = rest.map(decodeURIComponent).join("/");
      entry.kind = "file";
      entry.files = [path];
      return `${owner}/${name}` === INSTANCE && commit === HEAD && path in files ? new Response(files[path], { status: 200 }) : new Response("404", { status: 404 });
    }
    if (url.origin !== "https://api.github.com") return new Response("{}", { status: 500 });
    if (method === "POST" && p === "/graphql") {
      const asks = [...JSON.parse(init.body).query.matchAll(/(f\d+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)].map((m) => [m[1], JSON.parse(m[2])]);
      const repository = {};
      entry.kind = "batch";
      for (const [alias, expression] of asks) {
        const at = expression.indexOf(":"), path = expression.slice(at + 1);
        entry.files.push(path);
        repository[alias] = expression.slice(0, at) === HEAD && path in files ? { text: files[path], isTruncated: false } : null;
      }
      return json({ data: { repository } });
    }
    const repo = /^\/repos\/([^/]+\/[^/]+)(\/.*)?$/.exec(p);
    const rest = repo?.[2] ?? "";
    if (!repo || repo[1] !== INSTANCE) return new Response("{}", { status: 404 });
    if (rest === "/commits/main") { entry.kind = "commit"; return json({ sha: HEAD }); }
    if (rest === `/git/trees/${HEAD}`) {
      entry.kind = "tree";
      return json({ sha: "t".repeat(40), truncated: false, tree: Object.keys(files).sort().map((path) => ({ path, mode: "100644", type: "blob", sha: shas.get(path) })) });
    }
    if (rest.startsWith("/contents/")) {
      const path = rest.slice("/contents/".length).split("/").map(decodeURIComponent).join("/");
      entry.kind = "file";
      entry.files = [path];
      return path in files ? new Response(files[path], { status: 200 }) : new Response('{"message":"Not Found"}', { status: 404 });
    }
    return new Response("{}", { status: 404 });
  };
  const real = globalThis.fetch;
  return { log, install() { globalThis.fetch = fetchFake; }, restore() { globalThis.fetch = real; } };
}

/** The instance's snapshot at main, read through the real host with the token or without one; the log is emptied after it. */
export async function instanceSnapshot(server, { token }) {
  const host = connect(parseAddress(`https://github.com/${INSTANCE}`), token ? { token: TOKEN } : {});
  const snapshot = await host.readSnapshot("main");
  server.log.length = 0; // the snapshot's own commit and tree are the caller's, not catalogue's
  return snapshot;
}
