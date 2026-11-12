// session.mjs — a CLI session's start (MOD-bridge-jobs, Parts: session.mjs; Data: The clones at the session's start, The session's checkout, The token file,
// What the session is told of its checkout): the clones of the agent's working folder fetched and brought to the session's commits, its checkout of the
// product made, the token file left in it, and the text its input is given about them.
//
// Module: MOD-bridge-jobs
//
// A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE, A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE: the checkout is a job's or an ask's alike, so
// that a job and a message of the prompt bar start their session one way. The token stands in no text this file gives: token.md names the file only.

import { readFile } from "node:fs/promises";
import { checkoutAt, cloneOrFetch, foldersOf, instanceClone, leaveToken, workingClone } from "./workfolders.mjs";

const TOKEN = new URL("./token.md", import.meta.url);
const BRANCH = new URL("./branch.md", import.meta.url);

/**
 * startSession({ folder, instance, commit, product, id }) -> Promise<{ working, instanceFolder, clone, file }> — in the working folder `folder` of an agent: the
 * Bridge's clone of the product at `product` fetched from its origin (`clone`), the instance's clone, at `instance`, fetched and checked out at `commit` with what
 * git neither tracks nor ignores removed (`instanceFolder`), the session's checkout in `products/<name>-<id>/`, made anew from the product's clone, its origin the
 * product's address (`working`), and its token file, or null where the Bridge holds no token for the product (`file`). Crosses the network to the
 * repository servers; throws what git says.
 */
export async function startSession({ folder, instance, commit, product, id }) {
  const folders = foldersOf(folder);
  const clone = await cloneOrFetch(product, folders.product(product));
  const instanceFolder = await checkoutAt(await instanceClone(instance, folder), commit);
  const working = await workingClone(clone, folders.job(id, product), product);
  return { working, instanceFolder, clone, file: await leaveToken(working, product) };
}

/**
 * toldOf({ file, address, branch?, merges? }) -> Promise<string> — what a session's input is told of its checkout, after the input it is given: token.md
 * filled in with the file and the product's address, where a file is left; for a job whose kind delivers a branch, branch.md filled in with its branch and who
 * merges — `you`, or `a person` where the job's parameters say `merges: person`. "" where neither applies.
 */
export async function toldOf({ file, address, branch = null, merges = null }) {
  const parts = [];
  if (file) parts.push((await readFile(TOKEN, "utf8")).replace(/\{\{file\}\}/g, file).replace(/\{\{address\}\}/g, address).trimEnd());
  if (branch) parts.push((await readFile(BRANCH, "utf8")).replace(/\{\{branch\}\}/g, branch).replace(/\{\{merges\}\}/g, merges === "person" ? "a person" : "you").trimEnd());
  return parts.join("\n\n");
}
