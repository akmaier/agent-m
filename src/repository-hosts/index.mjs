// The repository hosts — one interface to a repository on GitHub or on a GitLab server: parseAddress, connect, and the host it
// returns, with repositoryInfo, readSnapshot, listTags, commitFiles, createTag and webLinks. Every function of a host that
// reaches a server says so and names how it fails, as a HostError (A REMOTE INTERFACE NAMES HOW IT FAILS).
//
// Module: MOD-repository-hosts
//
// The interface of the module (docs/architecture/MOD-repository-hosts.md, Interfaces); every other file of this folder is
// private to it. The adapters are plug-ins: github.mjs for GitHub's REST API, gitlab.mjs for GitLab's REST API v4. A local clone
// (local-git.mjs, Node only) is not part of this folder yet: connect refuses one with NotSupported.

import { HostError } from "./failures.mjs";
import { githubAdapter } from "./github.mjs";
import { gitlabAdapter } from "./gitlab.mjs";
import { webLinks } from "./web-links.mjs";

export { HostError };

// ---------------------------------------------------------------- parseAddress

const GITHUB_REPOSITORY = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
const GITLAB_SEGMENT = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

// parseAddress(url) -> RepositoryAddress { server: "github" | "gitlab", origin, path, web } — A PRODUCT IS NAMED BY ITS ADDRESS:
// the web address of a repository as a person copies it from the browser — a page of the repository, a trailing slash or
// ".git" included. An address on github.com is a GitHub repository, by its owner and name; one on any other server is taken
// for a GitLab project (GITLAB PRODUCTS ARE SUPPORTED), whose path is every group up to GitLab's "/-/" — whether the server
// answers as GitLab shows the first request. Throws a TypeError naming what is not a repository's address. No request is made.
export function parseAddress(url) {
  const s = String(url ?? "").trim();
  let u;
  try { u = new URL(s); } catch { throw new TypeError("Paste the repository's address, e.g. https://github.com/owner/name."); }
  if (u.protocol !== "https:") throw new TypeError("The address must use https.");
  if (u.username || u.password) {
    throw new TypeError("The address must not contain a user name or token (A CREDENTIAL IS NEVER PLACED IN A URL).");
  }
  const parts = u.pathname.split("/").filter(Boolean);
  if (u.hostname === "github.com") {
    if (parts.length < 2) throw new TypeError("The address names an owner and a repository: https://github.com/owner/name.");
    const path = `${parts[0]}/${parts[1].replace(/\.git$/, "")}`;
    if (!GITHUB_REPOSITORY.test(path) || path.includes("..")) throw new TypeError(`not a repository: ${path}`);
    return { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` };
  }
  const dash = parts.indexOf("-");
  const groups = dash >= 0 ? parts.slice(0, dash) : parts;
  if (groups.length) groups[groups.length - 1] = groups[groups.length - 1].replace(/\.git$/, "");
  if (groups.length < 2) throw new TypeError(`The address names a group and a project on ${u.host}, like ${u.origin}/group/project.`);
  if (!groups.every((g) => GITLAB_SEGMENT.test(g) && !g.includes(".."))) {
    throw new TypeError(`not a GitLab project path: ${groups.join("/")}`);
  }
  const path = groups.join("/");
  return { server: "gitlab", origin: u.origin, path, web: `${u.origin}/${path}` };
}

// ---------------------------------------------------------------- connect

// Tokens of the other kind of server, by the prefixes their servers give them: a GitHub token never goes to a GitLab server,
// a GitLab token never to GitHub.
const GITHUB_TOKEN = /^(github_pat_|gh[pousr]_)/;
const GITLAB_TOKEN = /^gl[a-z]+-/;
const HEAD = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/;

// The address connect is given is one parseAddress reads, field for field: the server a token goes to is never taken from a
// field that disagrees with the repository's own address.
function checkedAddress(address) {
  let read = null;
  try { read = parseAddress(address?.web); } catch { /* refused below */ }
  if (!read || ["server", "origin", "path", "web"].some((k) => read[k] !== address[k])) {
    throw new TypeError("connect needs a repository's address, as parseAddress reads it");
  }
  return Object.freeze(read);
}

// A change as commitFiles takes it: a branch, the commit it is made on, at least one file — each a path in the repository,
// named once, written as text, as bytes, or deleted —, and a message.
function checkedChange(change) {
  const { branch, expectedHead, files, message } = change ?? {};
  if (typeof branch !== "string" || !branch.trim()) throw new TypeError("a change names its branch");
  // null: the repository's first commit — it has none yet (an empty repository).
  if (expectedHead !== null && !HEAD.test(String(expectedHead))) throw new TypeError(`a change names the commit it is made on: ${expectedHead}`);
  if (!Array.isArray(files) || !files.length) throw new TypeError("a change holds at least one file");
  if (typeof message !== "string" || !message.trim()) throw new TypeError("a change has a message");
  const paths = new Set();
  for (const f of files) {
    const p = f?.path;
    if (typeof p !== "string" || !p || p.startsWith("/") || p.split("/").some((s) => s === "" || s === "." || s === "..")) {
      throw new TypeError(`not a path in the repository: ${p}`);
    }
    if (paths.has(p)) throw new TypeError(`a change names ${p} twice`);
    paths.add(p);
    if ([typeof f.text === "string", f.bytes instanceof Uint8Array, f.delete === true].filter(Boolean).length !== 1) {
      throw new TypeError(`${p}: a file is written as text, written as bytes, or deleted — exactly one of them`);
    }
  }
  return { branch, expectedHead, files, message };
}

// A pattern listTags takes, with * as its only wildcard (zero or more characters, e.g. "v*") -> a RegExp matching exactly what
// it allows; every other character is literal.
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const globPattern = (pattern) => new RegExp(`^${pattern.split("*").map(escapeRegExp).join(".*")}$`);

// NO SECRET IN THE REPOSITORY: before anything is sent, a file whose text — or whose bytes, read as text — holds a configured
// secret or the host's own token refuses the whole commit, named by its file and never by the value.
function refuseSecrets(files, secrets) {
  if (!secrets.length) return;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  for (const f of files) {
    const t = typeof f.text === "string" ? f.text : f.bytes ? decoder.decode(f.bytes) : null;
    if (t !== null && secrets.some((s) => t.includes(s))) {
      throw new HostError("SecretRefused", { path: f.path }, `${f.path} holds a configured secret — nothing was written.`);
    }
  }
}

// connect(address, credentials) -> Host — a host for one repository. credentials: { token, tokenName, clone, secrets }: the
// token and the name the person stored it under; the values of every configured secret, which no commit may contain. The token
// goes only into the authorisation header of requests to the API of the server that issued it, for this repository; a token
// of the other kind of server is refused with a TypeError. No request is made yet.
export function connect(address, credentials = {}) {
  const repository = checkedAddress(address);
  const { token = null, tokenName = null, clone = null, secrets = [] } = credentials ?? {};
  if (clone !== null && clone !== undefined) {
    throw new HostError("NotSupported", { what: "working in a local clone" }, "This host reads and writes through the server's API; " +
      "a local clone is not supported here.");
  }
  if (token !== null && token !== "" && typeof token !== "string") throw new TypeError("a token is a text");
  const github = repository.server === "github";
  if (token && (github ? GITLAB_TOKEN : GITHUB_TOKEN).test(token)) {
    throw new TypeError(github ? "That is a GitLab token; a GitHub repository is reached with the GitHub token."
      : "That is a GitHub token; a GitLab project is reached with its own project access token.");
  }
  if (!Array.isArray(secrets) || secrets.some((s) => typeof s !== "string")) throw new TypeError("the secrets are a list of texts");
  const links = webLinks(repository);
  const name = tokenName || (github ? "GitHub token" : `GitLab project token for ${repository.web}`);
  const adapter = (github ? githubAdapter : gitlabAdapter)(repository, { token: token || null, tokenName: name }, links);
  const refused = [...secrets, ...(token ? [token] : [])].filter((s) => s.length > 0);
  // The texts of the blobs read through this host, by their blob SHA: each blob is read once.
  const texts = new Map();

  return Object.freeze({
    // repositoryInfo() -> RepositoryInfo { defaultBranch, visibility, canWrite, archived, description }. Crosses the network;
    // fails with NotFound, TokenRefused, PermissionMissing, RateLimited, Unreachable.
    repositoryInfo: () => adapter.repositoryInfo(),

    // readSnapshot(ref) -> Snapshot { repository, ref, commit, paths, read(path), blob(path) } — the repository at one commit.
    // Crosses the network, and so does read(path); fail with NotFound, TokenRefused, PermissionMissing, RateLimited, Unreachable.
    async readSnapshot(ref) {
      if (typeof ref !== "string" || !ref.trim()) throw new TypeError("readSnapshot names a branch, a tag or a commit");
      const { commit, blobs } = await adapter.snapshot(ref);
      return Object.freeze({
        repository, ref, commit, paths: Object.freeze([...blobs.keys()]),
        blob: (path) => blobs.get(path) ?? null,
        read(path) {
          const sha = blobs.get(path);
          if (!sha) return Promise.resolve(null);
          if (!texts.has(sha)) {
            texts.set(sha, adapter.readFile(commit, path).catch((e) => { texts.delete(sha); throw e; }));
          }
          return texts.get(sha);
        },
      });
    },

    // listTags(pattern) -> { name, commit }[] — the tags of the repository, every one of them across however many pages the
    // server answers in, optionally only those whose name matches pattern, a glob with * as its only wildcard (e.g. "v*").
    // Crosses the network; fails as readSnapshot.
    async listTags(pattern) {
      if (pattern !== undefined && typeof pattern !== "string") throw new TypeError("a pattern is a text");
      const tags = await adapter.listTags();
      return pattern === undefined ? tags : tags.filter((t) => globPattern(pattern).test(t.name));
    },

    // commitFiles({ branch, expectedHead, files, message }) -> { commit, url } — one commit of all the files, made only if the
    // branch still stands at expectedHead; expectedHead null makes an empty repository's first commit — on GitHub two, the first
    // file and then the others —; the message is written as given. Crosses the network; fails with Moved,
    // SecretRefused, TokenRefused, PermissionMissing, RateLimited, Unreachable. Nothing is written on any failure.
    async commitFiles(change) {
      const c = checkedChange(change);
      refuseSecrets(c.files, refused);
      return adapter.commitFiles(c);
    },

    // createTag(name, commit) -> void — sets a tag on a commit; an existing tag is never moved and fails with TagExists
    // { commit }, naming the commit it already stands on (A VERSION IS NOT REWRITTEN). Crosses the network; fails also with
    // PermissionMissing, TokenRefused, RateLimited, Unreachable.
    async createTag(name, commit) {
      if (typeof name !== "string" || !name.trim()) throw new TypeError("createTag names a tag");
      if (!HEAD.test(String(commit))) throw new TypeError(`createTag names the commit to tag: ${commit}`);
      return adapter.createTag(name, commit);
    },

    // webLinks() -> WebLinks — the server's own pages for this repository. No request is made.
    webLinks: () => links,
  });
}
