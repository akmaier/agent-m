// access.mjs — whether this computer's own git login reaches the repositories (MOD-bridge-jobs, Interfaces: testAccess). ITM-406 builds it;
// the Bridge's *Test access* (ITM-407) calls it.
//
// Module: MOD-bridge-jobs
//
// A LOCAL AGENT USES THE PERSON'S OWN LOGIN: the test asks git, with the login git finds on this computer — its credential helper, its
// SSH key, its configuration —, and no token is entered anywhere. Each repository is fetched once, its newest commit and no history,
// into an empty repository made for the purpose in a temporary folder and removed after: no clone of the Bridge is touched, no branch
// moves, nothing is written to the repository that is asked.

import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TIMEOUT_MS = 60_000;
// What git says when it got in and there was nothing to fetch: an empty repository has no HEAD.
const EMPTY = /couldn't find remote ref HEAD/i;

function git(cwd, args) {
  return new Promise((resolve) => {
    execFile("git", args, { cwd, encoding: "utf8", timeout: TIMEOUT_MS, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } }, (error, stdout, stderr) => {
      if (!error) return resolve({ ok: true });
      const said = String(stderr ?? "").trim() || (error.killed ? "git did not answer in time" : error.message);
      resolve({ ok: false, said });
    });
  });
}

// One repository: reached, or not, with git's own words.
async function reach(repository) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-access-"));
  try {
    const made = await git(folder, ["init", "--quiet"]);
    if (!made.ok) return { repository, reachable: false, reason: made.said };
    const fetched = await git(folder, ["fetch", "--quiet", "--depth", "1", "--no-tags", "--", repository, "HEAD"]);
    if (fetched.ok || EMPTY.test(fetched.said)) return { repository, reachable: true, reason: null };
    return { repository, reachable: false, reason: fetched.said };
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}

/**
 * testAccess(config: { instance: string, products: string[] }) -> Promise<{ repository: string, reachable: boolean, reason: string | null }[]> —
 * whether this computer's own git login reaches the instance and each served product: one fetch of each, changing nothing; the instance
 * first, then the products in the order given. A repository it does not reach is named with the reason git gives; an empty repository,
 * which git reaches and has nothing to fetch from, is reached. Crosses the network to the repository servers.
 */
export async function testAccess(config) {
  const answer = [];
  for (const repository of [config.instance, ...config.products]) answer.push(await reach(repository));
  return answer;
}
