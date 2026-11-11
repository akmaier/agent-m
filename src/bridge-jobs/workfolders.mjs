// workfolders.mjs — the clones in an agent's working folder (MOD-bridge-jobs, Parts: workfolders.mjs; Data), laid out as a local clone of
// Agent M is: the working folder itself a clone of the instance, one clone per served product in `products/<name>/`, one working clone per
// running job in `jobs/<id>/`, made from the Bridge's clone of its product, with its outbox and its relay's folders beside it, all removed when the job
// ends, and the agent's home `home/`, which with `jobs/` git does not see in the instance's clone. An agent started in the working folder finds Agent M's
// AGENTS.md at its root. A working clone fetches from the Bridge's clone over a local path and needs no credential.
//
// Module: MOD-bridge-jobs
//
// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: every clone is made, fetched and pushed by git with the Bridge's credentials — the repository token its
// paired browser handed it, which git reads from the file tokens.mjs keeps, or, for a repository it holds none for, the login git finds on this computer —,
// and no token is entered anywhere. Access's local clone (MOD-repository-hosts' connect with a `clone`) reads files and makes commits in these clones, and,
// with the token, reaches the server's API for pull or merge requests; the default branch it reports is the one the clone's origin names.

import { execFile } from "node:child_process";
import { appendFile, mkdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { tokenOf } from "./tokens.mjs";

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
  job: (id) => join(folder, "jobs", id) });

// What the Bridge keeps in the instance's clone beside Agent M's own files, which no command of git there is to see.
const BESIDE_THE_INSTANCE = ["/home/", "/jobs/"];

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
 * its commits one at a time with the clone's fetches: a push updates the clone's remote-tracking ref, which a fetch at the same moment would also lock.
 */
export async function hostOf(address, folder) {
  const host = connect(parseAddress(address), { clone: folder, token: await tokenOf(address) });
  const { branch } = await defaultHead(folder);
  return Object.freeze({ ...host, commitFiles: (change) => exclusively(folder, () => host.commitFiles(change)), repositoryInfo: async () => ({ defaultBranch: branch, visibility: null, canWrite: null, archived: false, description: null }) });
}

/** The clone at one commit, detached, its files as that commit holds them. */
export function checkoutAt(folder, commit) {
  return exclusively(folder, () => git(folder, ["checkout", "--quiet", "--force", "--detach", commit]).then(() => folder));
}

/**
 * workingClone(clone, folder) -> Promise<folder> — the working clone of one job (MOD-bridge-jobs, Data: The working clone's fetch address), made from the Bridge's
 * clone of its product: an empty repository whose `origin` is that clone's path, fetching the origin's branches as the clone holds them —
 * `+refs/remotes/origin/*:refs/remotes/origin/*` without `refs/remotes/origin/HEAD` — and all their tags, fetched once; `origin/HEAD` the branch the clone names
 * as the origin's default, checked out and tracking it. Its fetches cross no network and need no credential; the clone's own branches and `refs/agent-m/` are
 * not among what it fetches.
 */
export async function workingClone(clone, folder) {
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
  return folder;
}

/** The working clone removed. */
export const removeClone = (folder) => rm(folder, { recursive: true, force: true });

// The branches of a repository: { "<name>": commit }.
async function branchesOf(folder, prefix = "refs/heads/") {
  const listed = await git(folder, ["for-each-ref", "--format=%(refname) %(objectname)", prefix]);
  return Object.fromEntries(listed.split("\n").filter(Boolean).map((line) => line.split(" ")).map(([ref, commit]) => [ref.slice(prefix.length), commit]));
}

/**
 * makeOutbox(working) -> Promise<{ path, base }> — the job's outbox (MOD-bridge-jobs, Data): a bare repository `<working>.out.git` cloned from the working
 * clone, set as the working clone's push address, so that the agent's pushes land there; `base` its branches now. Made before the agent starts: the Bridge
 * runs git in the working clone only then.
 */
export async function makeOutbox(working) {
  const path = `${working}.out.git`;
  await rm(path, { recursive: true, force: true });
  await git(dirname(working), ["clone", "--bare", "--quiet", "--", working, path]);
  await git(working, ["remote", "set-url", "--push", "origin", path]);
  return { path, base: await branchesOf(path) };
}

/**
 * relayFolders(working) -> Promise<{ requests, answers }> — the relay's two folders beside the working clone, made empty before the agent starts (MOD-bridge-jobs,
 * Data: The relay): `<working>.requests`, which the agent may write, and `<working>.answers`, which only the Bridge writes.
 */
export async function relayFolders(working) {
  const folders = { requests: `${working}.requests`, answers: `${working}.answers` };
  for (const folder of Object.values(folders)) {
    await rm(folder, { recursive: true, force: true });
    await mkdir(folder, { recursive: true });
  }
  return folders;
}

/**
 * forwarding(outbox) -> { path, base, outbox, forwarded, refused } — what the Bridge keeps of one job's forwards, in memory while the job runs (MOD-bridge-jobs,
 * Data): the outbox's branches at the last look, at first its base; what it last forwarded of each branch, at first the base; and each forward the origin
 * refused, `{ commit, said }`, with what git said.
 */
export const forwarding = (outbox) => ({ path: outbox.path, base: { ...outbox.base }, outbox: { ...outbox.base }, forwarded: { ...outbox.base }, refused: {} });

/**
 * forward(state, { clone, job, again }) -> Promise<state> — one look at the outbox (MOD-bridge-jobs, Data: Each push is forwarded at once): its branches fetched
 * into the Bridge's clone of the product, under `refs/agent-m/<job>/`; every branch new or moved against what was last forwarded of it pushed to the origin under
 * its name, never forced, with the clone's own credentials — the push also moves the clone's `refs/remotes/origin/` of it —, and the clone's branch of that name
 * pointed at it, unless it is the branch checked out there. A push the origin refuses is kept in `state.refused` with what git said and offered again only once
 * the branch moved, or with `again`, the forward after the agent's answer. One at a time with the clone's fetches. Fetching from the outbox runs no command its
 * configuration names.
 */
export function forward(state, { clone, job, again = false }) {
  return exclusively(clone, async () => {
    const space = `refs/agent-m/${job}/`;
    await git(clone, ["fetch", "--quiet", "--no-tags", "--", state.path, `+refs/heads/*:${space}*`]);
    const fetched = await branchesOf(clone, space);
    state.outbox = fetched;
    const current = await git(clone, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(() => null);
    try {
      for (const [branch, commit] of Object.entries(fetched)) {
        if (state.forwarded[branch] === commit) continue;
        if (!again && state.refused[branch]?.commit === commit) continue;
        try {
          await git(clone, ["push", "--quiet", "origin", `${commit}:refs/heads/${branch}`]);
        } catch (error) {
          state.refused[branch] = { commit, said: error.message };
          continue;
        }
        delete state.refused[branch];
        state.forwarded[branch] = commit;
        if (branch !== current) await git(clone, ["update-ref", `refs/heads/${branch}`, commit]);
      }
    } finally {
      for (const branch of Object.keys(fetched)) await git(clone, ["update-ref", "-d", `${space}${branch}`]).catch(() => {});
    }
    return state;
  });
}

/** The commit the Bridge's clone holds of the origin's branch, as it last fetched or forwarded it; null where it holds none. */
export const originOf = (clone, branch) => git(clone, ["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}^{commit}`]).catch(() => null);

/** The origin's branches as the Bridge's clone holds them: { "<branch>": commit }, origin/HEAD left out. */
export async function originBranches(clone) {
  const branches = await branchesOf(clone, "refs/remotes/origin/");
  delete branches.HEAD;
  return branches;
}
