// A data file of this module's own, read as MOD-spec-document reads its skeleton (MOD-test-schedule, Parts): from the
// disk in Node, from the file's own address — beside this module, on the origin it was loaded from — in a browser.
//
// Module: MOD-test-schedule

const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`MOD-test-schedule: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * ownText(path: string) -> Promise<string> | string — the text of the module's own file at a path below its folder.
 */
export function ownText(path) {
  const url = new URL(`./${path}`, import.meta.url);
  return disk ? disk.readFileSync(url, "utf8") : ownFile(url);
}
