// Stored — the graph of one commit as a text and back (MOD-trace-graph, Interfaces: graphText, graphFromText), the file
// `<commit>.json` of the branch `trace-cache`. graphText gives the same text for the same graph, and names the commit the graph was
// built for; graphFromText restores the graph from such a text for that commit, or gives null for a text that is no graphText or names
// another commit. Neither reads nor writes anything.
//
// Module: MOD-trace-graph

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
