// Stored — the graph of one commit as a text and back (MOD-trace-graph, Interfaces: graphText, graphFromText), the file
// `<commit>.json` of the branch `trace-cache`. graphText gives the same text for the same graph, and names the commit the graph was
// built for; graphFromText restores the graph from such a text for that commit, or gives null for a text that is no graphText or names
// another commit. Neither reads nor writes anything.
//
// Module: MOD-trace-graph

import { traceGraph } from "./build.mjs";

// The format mark of a stored graph: a text without it, or with another, is no graphText of this module.
const FORMAT = "agent-m-trace-graph";
const VERSION = 1;

/**
 * graphText(graph: Graph) -> string — the graph as one text, the same text for the same graph, that names the commit the graph was
 * built for. The nodes stand in the order of the graph's map, each with its identifier.
 * @param {object} graph
 * @returns {string}
 */
export function graphText(graph) {
  const { commit, nodes, edges, files, links, positions, unread } = graph;
  return `${JSON.stringify({ format: FORMAT, version: VERSION, commit, nodes: [...nodes], edges, files, links, positions, unread })}\n`;
}

/**
 * graphFromText(text: string, commit: string) -> Graph | null — the graph the text holds, or null for a text that is no graphText
 * or names a commit other than `commit`. Reads nothing.
 * @param {string} text
 * @param {string} commit
 * @returns {object | null}
 */
export function graphFromText(text, commit) {
  let held;
  try { held = JSON.parse(text); } catch { return null; }
  if (held === null || typeof held !== "object" || held.format !== FORMAT || held.version !== VERSION) return null;
  if (typeof commit !== "string" || commit === "" || held.commit !== commit) return null;
  const lists = [held.nodes, held.edges, held.files, held.links, held.positions, held.unread];
  if (!lists.every(Array.isArray) || !held.nodes.every((entry) => Array.isArray(entry) && entry.length === 2)) return null;
  return { commit: held.commit, nodes: new Map(held.nodes), edges: held.edges, files: held.files, links: held.links,
    positions: held.positions, unread: held.unread };
}

// The branch the graphs are stored on, and the graph's file on it.
const BRANCH = "trace-cache";
const fileOf = (commit) => `${commit}.json`;

/**
 * publishGraph(host: Host, snapshot: Snapshot) -> Promise<{ commit: string, written: boolean }> — builds the graph of the snapshot's commit from
 * its files and adds `<commit>.json` to the branch `trace-cache` by `commitFiles`, on the head it read; `written` is false when the branch holds
 * the file already, which it then leaves as it is. Crosses the network; fails as `commitFiles` fails — `Moved` when the branch moved meanwhile, so that
 * the run can be made again —, and with `NotFound` naming the branch when the repository has none. (The impact lists a caller may hand in are ITM-941's.)
 * @param {object} host @param {object} snapshot
 * @returns {Promise<{ commit: string, written: boolean }>}
 */
export async function publishGraph(host, snapshot) {
  const commit = snapshot.commit;
  let branch;
  try {
    branch = await host.readSnapshot(BRANCH);
  } catch (error) {
    if (error?.name !== "NotFound") throw error;
    throw Object.assign(new Error(`The repository has no branch ${BRANCH} to add the graph of ${commit} to.`), { name: "NotFound", cause: error });
  }
  if (branch.paths.includes(fileOf(commit))) return { commit, written: false };
  // The graph is built from the files: a source without readOn never uses a stored graph.
  const graph = await traceGraph({ paths: snapshot.paths, read: (path) => snapshot.read(path), readMany: (paths) => snapshot.readMany?.(paths) }, { commit });
  await host.commitFiles({ branch: BRANCH, expectedHead: branch.commit, files: [{ path: fileOf(commit), text: graphText(graph) }],
    message: `trace-cache: the graph of ${commit}\n` });
  return { commit, written: true };
}
