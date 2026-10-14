// Add one run record to test-results on the head read, never replace or retry a moved head.
// Module: MOD-result-records
import { writeDocument } from "../documents/index.mjs";
import { resultSchema } from "./read.mjs";

/**
 * appendResult(host: Host, record: Document) -> Promise<{ commit: string, path: string }>.
 * Crosses the network through Host only. Exists refuses an existing path; Moved and the accepted Host failures propagate.
 */
export async function appendResult(host, record) {
  let snapshot, needsBranch = false;
  try {
    snapshot = await host.readSnapshot("test-results");
  } catch (error) {
    if (error.name !== "NotFound") throw error;
    snapshot = await host.readSnapshot("HEAD");
    needsBranch = snapshot.commit !== null;
  }
  const path = record.path;
  if (snapshot.paths.includes(path)) {
    throw Object.assign(new Error(`The result record ${path} already exists.`), { name: "Exists" });
  }
  const text = writeDocument(resultSchema.run, record);
  if (needsBranch) await host.createBranch("test-results", snapshot.commit);
  const { commit } = await host.commitFiles({
    branch: "test-results", expectedHead: snapshot.commit, files: [{ path, text }],
    message: `Record tests of ${record.fields.commit}: ${path}`,
  });
  return { commit, path };
}
