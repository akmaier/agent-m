// The adapter for a local clone, through the `git` command: files read at a commit of the clone and committed in it, then pushed
// to the clone's origin with the clone's own credentials — whatever access the clone was made with. Node only: index.mjs
// uses it only there.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — snapshot(ref), readFile(commit, path),
// commitFiles(change) — beside the REST adapter that serves the host's other functions where a token is given. It touches
// neither the clone's working tree nor its branches: a commit is made on the head the caller names, in a temporary index.

import { HostError } from "./failures.mjs";

// Node's own modules, taken when a command is run — which only Node does — and not imported, so that a browser which loads this
// file with the rest of the module meets none of them.
const builtin = (name) => globalThis.process.getBuiltinModule(`node:${name}`);

const HEAD = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/;
// What git says when the origin does not hold what was asked for, as against when it could not be asked.
const ABSENT = /not our ref|couldn't find remote ref|unadvertised object|no such remote ref|did not match any/i;
// What git says when a push is refused because the branch stands elsewhere.
const REFUSED = /rejected|non-fast-forward|fetch first|stale info/i;

// address: a RepositoryAddress; folder: the clone's folder.
export function localAdapter(address, folder) {
  const commitPage = address.server === "github" ? "commit" : "-/commit";

  // One git command in the clone -> its output; `env` adds to the environment, `input` is written to its standard input. A
  // command that fails -> { failed: its error } when `tolerate`, else Unreachable with what git says.
  function git(args, { env = {}, input = null, buffer = false, tolerate = false } = {}) {
    return new Promise((resolve, reject) => {
      const child = builtin("child_process").execFile("git", args, { cwd: folder, encoding: buffer ? "buffer" : "utf8", maxBuffer: 1 << 28,
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0", ...env } }, (error, stdout, stderr) => {
        if (!error) return resolve(stdout);
        const said = String(stderr ?? "").trim() || error.message;
        if (tolerate) return resolve({ failed: said });
        reject(new HostError("Unreachable", { reason: said }, `${address.web}: git could not do it — ${said}`));
      });
      child.stdin.end(input ?? undefined);
    });
  }

  // The commit a name or an identifier stands for in the clone, or null.
  async function resolve(name) {
    if (name.startsWith("-")) return null;
    const r = await git(["rev-parse", "--verify", "--quiet", `${name}^{commit}`], { tolerate: true });
    return typeof r === "string" ? r.trim() : null;
  }

  // The commit, fetched from the origin by its identifier when the clone does not hold it: null where the origin does not either.
  async function commitOf(name) {
    const held = await resolve(name);
    if (held || !HEAD.test(name)) return held;
    const fetched = await git(["fetch", "--quiet", "origin", name], { tolerate: true });
    if (fetched.failed && !ABSENT.test(fetched.failed)) {
      throw new HostError("Unreachable", { reason: fetched.failed }, `${address.web}: the origin could not be reached — ${fetched.failed}`);
    }
    return fetched.failed ? null : resolve(name);
  }

  return {
    // The branch, tag or commit resolved to one commit, then that commit's tree: every file, by its blob SHA.
    async snapshot(name) {
      const commit = await commitOf(name);
      if (!commit) {
        const what = `${address.web} at ${name}`;
        throw new HostError("NotFound", { what }, `${what} was not found in the clone, nor in its origin.`);
      }
      const tree = await git(["ls-tree", "-r", "-z", "--full-tree", commit]);
      const blobs = new Map();
      for (const entry of tree.split("\0").filter(Boolean)) {
        const [meta, path] = entry.split("\t");
        const [, type, sha] = meta.split(" ");
        if (type === "blob") blobs.set(path, sha);
      }
      return { commit, blobs };
    },

    // Whether the branch's history holds the commit: `git merge-base --is-ancestor <commit> <branch>` exits 0 when it does and 1 when it
    // does not; any other exit — a commit or branch the clone does not hold — is not contained either. Nothing is fetched.
    async containsCommit(branch, commit) {
      return typeof (await git(["merge-base", "--is-ancestor", commit, branch], { tolerate: true })) === "string";
    },

    async readFile(commit, path) {
      return new TextDecoder().decode(await git(["cat-file", "blob", `${commit}:${path}`], { buffer: true }));
    },

    // One commit of all the files on the head the caller names, made in a temporary index, then pushed to the branch of the
    // origin with no force: a push that does not fast-forward is refused, and the commit is Moved, with nothing pushed.
    async commitFiles({ branch, expectedHead, files, message }) {
      const { mkdtemp, rm } = builtin("fs/promises");
      const dir = await mkdtemp(builtin("path").join(builtin("os").tmpdir(), "agent-m-index-"));
      try {
        const env = { GIT_INDEX_FILE: builtin("path").join(dir, "index") };
        if (expectedHead) {
          if (!(await commitOf(expectedHead))) throw moved(branch, await originHead(branch));
          await git(["read-tree", expectedHead], { env });
        }
        for (const f of files) {
          if (f.delete) { await git(["update-index", "--force-remove", "--", f.path], { env }); continue; }
          const body = typeof f.text === "string" ? Buffer.from(f.text, "utf8") : Buffer.from(f.bytes);
          const sha = (await git(["hash-object", "-w", "--stdin"], { env, input: body })).trim();
          await git(["update-index", "--add", "--cacheinfo", `100644,${sha},${f.path}`], { env });
        }
        const tree = (await git(["write-tree"], { env })).trim();
        const commit = (await git(["commit-tree", tree, ...(expectedHead ? ["-p", expectedHead] : []), "-m", message])).trim();
        const pushed = await git(["push", "--quiet", "origin", `${commit}:refs/heads/${branch}`], { tolerate: true });
        if (pushed.failed) {
          if (REFUSED.test(pushed.failed)) throw moved(branch, await originHead(branch));
          throw new HostError("Unreachable", { reason: pushed.failed }, `${address.web}: the push failed — ${pushed.failed}`);
        }
        return { commit, url: `${address.web}/${commitPage}/${commit}` };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  };

  // The head of the branch on the origin, or null.
  async function originHead(branch) {
    const r = await git(["ls-remote", "origin", `refs/heads/${branch}`], { tolerate: true });
    return typeof r === "string" ? r.split("\t")[0].trim() || null : null;
  }

  function moved(branch, head) {
    return new HostError("Moved", { head }, `${branch} has moved on${head ? ` to ${head.slice(0, 12)}` : ""} since it was read — nothing was pushed; read it again.`);
  }
}
