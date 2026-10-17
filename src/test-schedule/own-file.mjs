// A data file of this module's own, read as src/job-ledger/index.mjs reads its schema (MOD-test-schedule, Parts): from the
// disk in Node, from the file's own address in a browser.
//
// Module: MOD-test-schedule

const disk = globalThis.process?.getBuiltinModule?.("node:fs");

/**
 * ownText(url: URL) -> Promise<string> | string — the text of the module's own file. Throws an Error naming the file and
 * the server's status when a browser is not served it.
 */
export async function ownText(url) {
  if (disk) return disk.readFileSync(url, "utf8");
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`MOD-test-schedule: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}
