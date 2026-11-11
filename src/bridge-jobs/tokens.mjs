// tokens.mjs — the repository tokens the paired browser hands the Bridge (MOD-bridge-jobs, Data: The repository tokens; Interfaces: keepRepositoryTokens,
// useRepositoryTokens; the host of a repository through its clone).
//
// Module: MOD-bridge-jobs
//
// NO MODEL READS A CREDENTIAL, A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: the tokens lie in one file of the Bridge's data folder, which every enclosure
// hides, written in git's own configuration format — for each repository the header that authorises git's requests to its address. Every git the Bridge's
// process starts includes that file, named by its path in the process's environment, so that no token stands on a command line, in a remote address or in a
// clone's configuration; an agent's environment is chosen by its enclosure and names no such file. The API's token is read back from the same file with git's
// own matching of addresses, so that one file and one rule say which token goes where.

import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { connect, parseAddress } from "../repository-hosts/index.mjs";

const FILE = "repository-tokens.gitconfig";
// The user of the Basic header each server takes with a token as its password, for git over HTTPS.
const USER = { github: "x-access-token", gitlab: "oauth2" };

// The file every git of this process includes, once useRepositoryTokens has named it; null before.
let included = null;

const fileOf = (dataFolder) => join(dataFolder, FILE);
const refused = (message) => Object.assign(new Error(message), { code: "invalid-request" });
const headerOf = (server, token) => `Authorization: Basic ${Buffer.from(`${USER[server]}:${token}`).toString("base64")}`;

/**
 * keepRepositoryTokens(dataFolder, tokens: { repository, token }[]) -> Promise<number> — the tokens the paired browser handed the Bridge, written as the file of
 * Data, replacing every token kept before; the number kept. A repository that is no repository's address, one named twice, and a token MOD-repository-hosts'
 * connect refuses for its repository throw invalid-request, naming the repository and never the token; nothing is written then.
 */
export async function keepRepositoryTokens(dataFolder, tokens) {
  if (!Array.isArray(tokens)) throw refused("The repository tokens are a list of { repository, token }.");
  const sections = [], named = new Set();
  for (const entry of tokens) {
    let address;
    try { address = parseAddress(entry?.repository); } catch { throw refused(`${entry?.repository} is no repository's address.`); }
    if (named.has(address.web)) throw refused(`${address.web} is named twice.`);
    named.add(address.web);
    if (typeof entry.token !== "string" || !entry.token) throw refused(`The token for ${address.web} is no text.`);
    // connect's refusal names the kind of token, never the token itself.
    try { connect(address, { token: entry.token }); } catch (error) { throw refused(`The token for ${address.web} is refused: ${error.message}`); }
    // The address as a person copies it, and with `.git`, the two forms a clone's origin takes.
    for (const at of [address.web, `${address.web}.git`]) sections.push(`[http "${at}"]\n\textraHeader = ${headerOf(address.server, entry.token)}\n`);
  }
  await mkdir(dataFolder, { recursive: true, mode: 0o700 });
  // Written beside and renamed into place, so that a git started meanwhile reads the old file or the new one, never half of one.
  const written = `${fileOf(dataFolder)}.new`;
  await writeFile(written, `# The repository tokens this Bridge's paired browser handed it, read by the Bridge's own git only (MOD-bridge-jobs).\n${sections.join("")}`,
    { encoding: "utf8", mode: 0o600 });
  await chmod(written, 0o600);
  await rename(written, fileOf(dataFolder));
  return named.size;
}

/**
 * useRepositoryTokens(dataFolder, env = process.env) -> void — includes the file of Data in the configuration of every git the process starts from then on,
 * through git's own variables GIT_CONFIG_COUNT, GIT_CONFIG_KEY_<n> and GIT_CONFIG_VALUE_<n>, after the entries `env` holds already; a second call for the same
 * file adds nothing. Writes no file: git skips an include whose file does not exist yet.
 */
export function useRepositoryTokens(dataFolder, env = process.env) {
  const file = fileOf(dataFolder);
  const count = Number.parseInt(env.GIT_CONFIG_COUNT ?? "0", 10) || 0;
  included = file;
  for (let at = 0; at < count; at += 1) if (env[`GIT_CONFIG_KEY_${at}`] === "include.path" && env[`GIT_CONFIG_VALUE_${at}`] === file) return;
  Object.assign(env, { [`GIT_CONFIG_KEY_${count}`]: "include.path", [`GIT_CONFIG_VALUE_${count}`]: file, GIT_CONFIG_COUNT: String(count + 1) });
}

/**
 * tokenOf(address) -> Promise<string | null> — the token the file holds for a repository's address, by git's matching of addresses (`git config --file …
 * --get-urlmatch http.extraHeader <address>`); null before useRepositoryTokens, and where the file holds none or does not exist. Private to the module.
 */
export function tokenOf(address) {
  if (!included) return Promise.resolve(null);
  return new Promise((resolve) => {
    execFile("git", ["config", "--file", included, "--get-urlmatch", "http.extraheader", address], { encoding: "utf8" }, (error, stdout) => {
      const basic = error ? null : /^Authorization: Basic (\S+)$/.exec(String(stdout).trim())?.[1];
      if (!basic) return resolve(null);
      const pair = Buffer.from(basic, "base64").toString("utf8");
      resolve(pair.slice(pair.indexOf(":") + 1) || null);
    });
  });
}

/**
 * heldTokens() -> Promise<string[]> — every token the file of Data holds, each once, read back from its headers; none before useRepositoryTokens, and none where
 * the file does not exist. For the relay, which replaces each of them in its answers (MOD-bridge-jobs, Data: The relay). Private to the module.
 */
export async function heldTokens() {
  if (!included) return [];
  const text = await readFile(included, "utf8").catch(() => "");
  const tokens = [...text.matchAll(/^\s*extraHeader = Authorization: Basic (\S+)\s*$/gm)].map(([, basic]) => {
    const pair = Buffer.from(basic, "base64").toString("utf8");
    return pair.slice(pair.indexOf(":") + 1);
  });
  return [...new Set(tokens.filter(Boolean))];
}
