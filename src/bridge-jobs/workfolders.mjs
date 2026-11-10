// workfolders.mjs — the clones in an agent's working folder (MOD-bridge-jobs, Parts: workfolders.mjs; Data), laid out as a local clone of
// Agent M is: the working folder itself a clone of the instance, one clone per served product in `products/<name>/`, one working clone per
// running job in `jobs/<id>/`, removed when the job ends, and the agent's home `home/`, which with `jobs/` git does not see in the instance's clone.
// An agent started in the working folder finds Agent M's AGENTS.md at its root.
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

/** A working clone of `address` for one job, holding the branch the origin names as its default. */
export async function workingClone(address, folder) {
  await mkdir(dirname(folder), { recursive: true });
  await rm(folder, { recursive: true, force: true });
  await git(dirname(folder), ["clone", "--quiet", "--", address, folder]);
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
 * publish({ outbox, clone, job }) -> Promise<{ branch, commit }[]> — after the agent has answered: the outbox's branches fetched into the Bridge's clone of
 * the product, under `refs/agent-m/<job>/`; every branch new or moved against the outbox's base pushed to the origin under its name, never forced, with the
 * clone's own credentials; and the clone's branch of that name pointed at it, unless it is the branch checked out there. Fetching from the outbox runs no
 * command its configuration names. Throws, naming the branch and what git said, where the origin refuses a push.
 */
export function publish({ outbox, clone, job }) {
  return exclusively(clone, async () => {
    const space = `refs/agent-m/${job}/`;
    await git(clone, ["fetch", "--quiet", "--no-tags", "--", outbox.path, `+refs/heads/*:${space}*`]);
    const fetched = await branchesOf(clone, space);
    const current = await git(clone, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(() => null);
    const pushed = [];
    try {
      for (const [branch, commit] of Object.entries(fetched)) {
        if (outbox.base[branch] === commit) continue;
        await git(clone, ["push", "--quiet", "origin", `${commit}:refs/heads/${branch}`]).catch((error) => {
          throw new Error(`the Bridge could not push the agent's branch ${branch}: ${error.message}`);
        });
        if (branch !== current) await git(clone, ["update-ref", `refs/heads/${branch}`, commit]);
        pushed.push({ branch, commit });
      }
    } finally {
      for (const branch of Object.keys(fetched)) await git(clone, ["update-ref", "-d", `${space}${branch}`]).catch(() => {});
    }
    return pushed;
  });
}
