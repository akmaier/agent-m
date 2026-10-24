// The stored trace graph of the tests' fakes: what the workflow "main changed" does at push time (MOD-trace-graph's publishGraph) — the graph
// built by traceGraph from a source without readOn, its graphText gzipped as `<commit>.json.gz` on the branch trace-cache —, done for a fake
// snapshot, so that a page under test reads the stored graph through readOn as it does against a real host and never builds one. The graph is
// built once per commit, on the first read of its file, from the `read` the caller gives here; a fake that logs its reads passes a read that does
// not log, so that building the graph (the push job's work) is no read of the page. It holds no test and no expected result; nothing reaches the network.
//
// Module: MOD-trace-graph
// Level: unit

import { graphText, traceGraph } from "../src/trace-graph/index.mjs";
import { fileOf, gzipped } from "../src/trace-graph/stored.mjs";

// storedGraphBytes({ paths, read, readMany?, commit }) -> Promise<Uint8Array> — the bytes publishGraph writes for the source's commit.
export async function storedGraphBytes({ paths, read, readMany, commit }) {
  const graph = await traceGraph({ paths, read: (path) => read(path), readMany: (wanted) => readMany?.(wanted) }, { commit });
  return gzipped(graphText(graph));
}

// storedGraphReadOn(source: { paths, read, readMany?, commit }, readOn?) -> readOn(branch, path, options) — answers ("trace-cache",
// "<commit>.json.gz", { bytes: true }) with the stored graph's bytes, built once for each commit; every other read is the fake's own `readOn`, or null
// without one. The commits stored are the source's and the one of the snapshot the readOn is called on (a copy of a snapshot that names another commit
// of the same files).
export function storedGraphReadOn(source, readOn = null) {
  const built = new Map();
  return async function storedReadOn(branch, path, options = {}) {
    const commit = [source.commit, this?.commit].find((each) => typeof each === "string" && path === fileOf(each));
    if (branch === "trace-cache" && commit !== undefined && options?.bytes) {
      if (!built.has(commit)) built.set(commit, storedGraphBytes({ ...source, commit }));
      return built.get(commit);
    }
    return readOn ? readOn.call(this, branch, path, options) : null;
  };
}

// withStoredGraph(snapshot, { read }?) -> a copy of the snapshot whose readOn serves its stored graph (storedGraphReadOn); `read` is the read the graph is
// built with, the snapshot's own where none is given.
export function withStoredGraph(snapshot, { read = snapshot.read } = {}) {
  return { ...snapshot, readOn: storedGraphReadOn({ paths: snapshot.paths, read, commit: snapshot.commit }, snapshot.readOn ?? null) };
}
