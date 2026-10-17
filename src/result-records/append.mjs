// Add one supplied run record to the existing test-results branch, never replace one.
// Module: MOD-result-records

import { writeDocument } from "../documents/index.mjs";
import { resultSchema } from "./read.mjs";

/**
 * @param {object} host - the public repository Host.
 * @param {Document} record - the supplied run Document, at its own path.
 * @returns {Promise<{ commit: string, path: string }>}
 */
export async function appendResult(host, record) {
  const branch = "test-results";
  const head = await host.readSnapshot(branch);
  if (head.paths.includes(record.path)) {
    throw Object.assign(new Error(`${record.path} already exists on ${branch}`), { name: "Exists" });
  }
  const text = writeDocument(resultSchema.run, record);
  const { commit } = await host.commitFiles({ branch, expectedHead: head.commit,
    files: [{ path: record.path, text }], message: `record test run ${record.path}` });
  return { commit, path: record.path };
}
