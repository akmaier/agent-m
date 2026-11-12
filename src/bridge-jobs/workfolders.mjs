// workfolders.mjs — the clones in an agent's working folder (MOD-bridge-jobs, Parts: workfolders.mjs; Data), laid out as a local clone of
// Agent M is: the working folder itself a clone of the instance, one clone per served product in `products/<name>/`, one checkout per running CLI
// session in `products/<name>-<id>/`, made from the Bridge's clone of its product, whose origin is then the product's repository, removed with its token file when
// the session ends, and the agent's home `home/`, which git does not see in the instance's clone. An agent started in the working folder
// finds Agent M's AGENTS.md at its root.
//
// Module: MOD-bridge-jobs
//
// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: every clone of the Bridge is made, fetched and pushed by git with the Bridge's credentials — the repository
// token its paired browser handed it, which git reads from the file tokens.mjs keeps, or, for a repository it holds none for, the login git finds on this
// computer —, and no token is entered anywhere. A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE: a session's checkout holds its product's
// token alone, in `.agent-m-token`, which its `.git/info/exclude` names and its credential helper reads, so that the token stands in no configuration,
// remote address or command line. Access's local clone (MOD-repository-hosts' connect with a `clone`) reads files and makes commits in the Bridge's clones,
// and, with the token, reaches the server's API for pull or merge requests; the default branch it reports is the one the clone's origin names.

import { execFile } from "node:child_process";
import { appendFile, chmod, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { tokenOf, userOf } from "./tokens.mjs";

const TIMEOUT_MS = 120_000;

// One git command in `cwd` -> its output; a command that fails is an Error that says what git said.
function git(cwd, args) {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd, encoding: "utf8", timeout: TIMEOUT_MS, maxBuffer: 1 << 26, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } },
      (error, stdout, stderr) => {
        if (!error) return resolve(stdout.trim());
        reject(new Error(String(stderr ?? "").trim() || (error.killed ? "git did not answer in time" : error.message)));
      });
  });
}

// The repository's name in its address, the folder `git clone` gives it: `https://github.com/acme/widget.git/` -> `widget`.
const nameOf = (address) => address.replace(/\/+$/, "").replace(/\.git$/, "").split(/[/:]/).pop();

// The Bridge's folders for one agent: the working folder itself is the instance's clone.
export const foldersOf = (folder) => ({ instance: folder, product: (address) => join(folder, "products", nameOf(address)),
  job: (id, address) => join(folder, "products", `${nameOf(address)}-${id}`) });

// What the Bridge keeps in the instance's clone beside Agent M's own files, which no command of git there is to see.
const BESIDE_THE_INSTANCE = ["/home/"];
// What a session's start leaves in the instance's clone, beside what git tracks: the Bridge's own folders, the clones of the products among them.
const KEPT_IN_THE_INSTANCE = [...BESIDE_THE_INSTANCE, "/products/"];
// The file of a session's checkout that holds its product's token (MOD-bridge-jobs, Data: The token file).
const TOKEN_FILE = ".agent-m-token";

// Work on one key — a clone, a product's taking — runs one after another: a clone's refs are one writer's at a time.
const queues = new Map();
export function exclusively(folder, work) {
  const run = (queues.get(folder) ?? Promise.resolve()).then(work, work);
  queues.set(folder, run.catch(() => {}));
  return run;
}

const exists = (path) => stat(path).then(() => true, () => false);

/**
 * cloneOrFetch(address, folder, exclude = []) -> Promise<folder> — a clone of `address` made in `folder` itself, whatever the folder already holds, and
 * brought up to what the origin holds; `exclude`, the patterns git is not to see there, written when the clone is made. Its default branch is checked out
 * once, and git refuses that checkout where it would overwrite a file of the folder. Throws, naming both, where the folder holds a clone of another
 * repository.
 */
export function cloneOrFetch(address, folder, exclude = []) {
  return exclusively(folder, async () => {
    if (await exists(join(folder, ".git"))) {
      const origin = await git(folder, ["config", "--get", "remote.origin.url"]).catch(() => null);
      if (origin !== address) throw new Error(`${folder} holds a clone of ${origin ?? "no repository"}, not of ${address}`);
    } else {
      await mkdir(folder, { recursive: true });
      await git(folder, ["init", "--quiet"]);
      await git(folder, ["remote", "add", "origin", address]);
      if (exclude.length) {
        await mkdir(join(folder, ".git", "info"), { recursive: true });
        await appendFile(join(folder, ".git", "info", "exclude"), exclude.map((pattern) => `${pattern}\n`).join(""));
      }
    }
    await git(folder, ["fetch", "--quiet", "--prune", "--tags", "origin"]);
    // The first checkout, after the clone was made — or after a checkout git refused, which is tried again and refused again.
    if ((await git(folder, ["rev-parse", "--verify", "--quiet", "HEAD"]).catch(() => null)) === null) {
      await git(folder, ["remote", "set-head", "origin", "--auto"]);
      const { branch } = await defaultHead(folder);
      await git(folder, ["checkout", "--quiet", "-B", branch, "--track", `origin/${branch}`]);
    }
    return folder;
  });
}

/** instanceClone(address, folder) -> Promise<folder> — the instance's clone in the agent's working folder itself, its home and jobs out of git's sight. */
export const instanceClone = (address, folder) => cloneOrFetch(address, folder, BESIDE_THE_INSTANCE);

/** The branch the clone's origin names as its default, and its head as the clone last fetched it. */
export async function defaultHead(folder) {
  const branch = (await git(folder, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"])).replace(/^origin\//, "");
  return { branch, commit: await git(folder, ["rev-parse", "--verify", `refs/remotes/origin/${branch}^{commit}`]) };
}

/**
 * MOD-repository-hosts' host for `address` through the clone in `folder` and with the token the Bridge holds for that address (tokens.mjs): its pull or merge
 * requests and the rest of the server's API with that token, NotSupported without one; its repositoryInfo answering the default branch the origin names, and
 * its commits one at a time with the clone's fetches: a push updates the clone's remote-tracking ref, which a fetch at the same moment would also lock. A
 * branch the clone does not hold — one a CLI session pushed to the origin itself — is read, after a fetch of the clone, as the origin holds it.
 */
export async function hostOf(address, folder) {
  const host = connect(parseAddress(address), { clone: folder, token: await tokenOf(address) });
  const { branch } = await defaultHead(folder);
  const readSnapshot = async (name, ...more) => {
    try {
      return await host.readSnapshot(name, ...more);
    } catch (error) {
      if (error?.name !== "NotFound" || typeof name !== "string" || name.startsWith("-")) throw error;
      await cloneOrFetch(address, folder);
      const commit = await originOf(folder, name);
      if (!commit) throw error;
      return host.readSnapshot(commit, ...more);
    }
  };
  return Object.freeze({ ...host, readSnapshot, commitFiles: (change) => exclusively(folder, () => host.commitFiles(change)), repositoryInfo: async () => ({ defaultBranch: branch, visibility: null, canWrite: null, archived: false, description: null }) });
}

/**
 * checkoutAt(folder, commit) -> Promise<folder> — the instance's clone at one commit, detached, its files as that commit holds them, and every file of it that
 * git neither tracks nor ignores removed (MOD-bridge-jobs, Data: The clones at the session's start): nothing an earlier session left there stays. The agent's
 * home and `products/` stay.
 */
export function checkoutAt(folder, commit) {
  return exclusively(folder, async () => {
    await git(folder, ["checkout", "--quiet", "--force", "--detach", commit]);
    await git(folder, ["clean", "--quiet", "--force", "-d", ...KEPT_IN_THE_INSTANCE.flatMap((pattern) => ["-e", pattern])]);
    return folder;
  });
}

/**
 * workingClone(clone, folder, address?) -> Promise<folder> — the checkout of one CLI session (MOD-bridge-jobs, Data: The session's checkout), made from the
 * Bridge's clone of its product: an empty repository fetching the origin's branches as the clone holds them — `+refs/remotes/origin/*:refs/remotes/origin/*`
 * without `refs/remotes/origin/HEAD` — and all their tags, fetched once over a local path; `origin/HEAD` the branch the clone names as the origin's default,
 * checked out and tracking it. With `address`, the product's, its origin is then that address with git's usual fetch refspec, so that the session fetches,
 * pulls and pushes the product's repository itself.
 */
export async function workingClone(clone, folder, address = null) {
  const { branch } = await defaultHead(clone);
  await rm(folder, { recursive: true, force: true });
  await mkdir(folder, { recursive: true });
  await git(folder, ["init", "--quiet"]);
  await git(folder, ["remote", "add", "origin", clone]);
  await git(folder, ["config", "remote.origin.fetch", "+refs/remotes/origin/*:refs/remotes/origin/*"]);
  await git(folder, ["config", "--add", "remote.origin.fetch", "^refs/remotes/origin/HEAD"]);
  await git(folder, ["config", "remote.origin.tagOpt", "--tags"]);
  await git(folder, ["fetch", "--quiet", "origin"]);
  await git(folder, ["symbolic-ref", "refs/remotes/origin/HEAD", `refs/remotes/origin/${branch}`]);
  await git(folder, ["checkout", "--quiet", "-B", branch, "--track", `origin/${branch}`]);
  if (address) {
    await git(folder, ["remote", "set-url", "origin", address]);
    await git(folder, ["config", "--replace-all", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  }
  return folder;
}

// A text in single quotes for the shell.
const quoted = (text) => `'${String(text).replace(/'/g, "'\\''")}'`;

/**
 * leaveToken(folder, address) -> Promise<string | null> — the token file of a session's checkout (MOD-bridge-jobs, Data: The token file): where the Bridge holds
 * a token for the product at `address`, that token alone as the text of `<folder>/.agent-m-token`, readable by its user only, named in the checkout's
 * `.git/info/exclude`, and the checkout's credential helper — after an empty entry that sets aside the computer's own helpers — a shell function that answers
 * git's `get` with the server's user and the file's text, by the shell's builtins alone; the file's path. Null, and nothing written, for a product it holds no
 * token for.
 */
export async function leaveToken(folder, address) {
  const token = await tokenOf(address);
  if (!token) return null;
  const file = join(folder, TOKEN_FILE);
  await writeFile(file, token, { encoding: "utf8", mode: 0o600 });
  await chmod(file, 0o600);
  await mkdir(join(folder, ".git", "info"), { recursive: true });
  await appendFile(join(folder, ".git", "info", "exclude"), `/${TOKEN_FILE}\n`);
  const helper = `!f() { test "$1" = get || return 0; IFS= read -r t < ${quoted(file)} || [ -n "$t" ]; printf 'username=%s\\npassword=%s\\n' ${quoted(userOf(parseAddress(address).server))} "$t"; }; f`;
  await git(folder, ["config", "--add", "credential.helper", ""]);
  await git(folder, ["config", "--add", "credential.helper", helper]);
  return file;
}

/** The checkout removed. */
export const removeClone = (folder) => rm(folder, { recursive: true, force: true });

/** The commit the Bridge's clone holds of the origin's branch, as it last fetched it; null where it holds none. */
export const originOf = (clone, branch) => git(clone, ["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}^{commit}`]).catch(() => null);
