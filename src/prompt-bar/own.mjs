// MOD-prompt-bar, own.mjs — the module's own data files (docs/architecture/MOD-prompt-bar.md, Parts): read from the disk in Node, and in a browser from the
// address the module itself was loaded from, so that what is read lies beside the module, on the origin it was loaded from (NO SERVER).
//
// Module: MOD-prompt-bar

const OWNER = "MOD-prompt-bar";
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file and
// the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/** ownText(name: string) -> Promise<string> — the text of the module's own file `name`, beside this one. Throws as ownFile does. */
export async function ownText(name) {
  const url = new URL(`./${name}`, import.meta.url);
  return disk ? disk.readFileSync(url, "utf8") : ownFile(url);
}
