// checkout.mjs — the checkout of every working folder (MOD-bridge-jobs, Interfaces: checkOut; UC-044 step 3): in each agent's working folder the clone of the
// instance, then in `products/<name>/` the clone of each served product, made or brought up to its origin as the watching does (workfolders.mjs).
//
// Module: MOD-bridge-jobs
//
// Each clone is reached with the Bridge's credentials — the token its paired browser handed it, or the computer's own login (tokens.mjs) —, and one
// repository's failure stops none of the others: the person sees in the window which repository was not reached, in git's words.

import { cloneOrFetch, defaultHead, foldersOf, instanceClone } from "./workfolders.mjs";

/**
 * checkOut({ instance, products, agents }) -> Promise<{ agent, repository, folder, commit, reason }[]> — for each agent with a working folder, in the order
 * given, the instance first and then each product in the order given: the commit its clone's default branch holds, or commit null and git's reason. An agent
 * without a working folder is left out. Crosses the network to the repository servers.
 */
export async function checkOut({ instance, products = [], agents = [] }) {
  const answer = [];
  for (const agent of agents.filter((each) => each?.folder)) {
    const folders = foldersOf(agent.folder);
    const clones = [[instance, agent.folder, instanceClone], ...products.map((product) => [product, folders.product(product), cloneOrFetch])];
    for (const [repository, folder, clone] of clones) {
      try {
        await clone(repository, folder);
        answer.push({ agent: agent.name, repository, folder, commit: (await defaultHead(folder)).commit, reason: null });
      } catch (error) {
        answer.push({ agent: agent.name, repository, folder, commit: null, reason: error.message });
      }
    }
  }
  return answer;
}
