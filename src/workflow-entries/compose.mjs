// compose.mjs — what an entry composes before it works (MOD-workflow-entries, Parts): the CiEnvironment it reads, and, in the instance, the
// checkout connected through Access's local clone with the workflow's own token. ITM-364 builds the instance's part; the product's part is
// ITM-365's.
//
// Module: MOD-workflow-entries
//
// Reads secrets only from the environment (Files). The names are GitHub Actions': GITHUB_ACTIONS, GITHUB_EVENT_NAME, GITHUB_EVENT_PATH,
// GITHUB_WORKSPACE, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_REF_NAME and GITHUB_SHA are its default environment variables (docs.github.com, "Variables"
// reference); GITHUB_TOKEN is the workflow's own token, which a workflow passes to the step as `env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
// (docs.github.com, "Use GITHUB_TOKEN for authentication in workflows").

import { parseAddress, connect } from "../repository-hosts/index.mjs";

const fs = globalThis.process?.getBuiltinModule?.("node:fs");

/**
 * CiEnvironment — { entry: string, service: "github" | "gitlab", event: { name: string | null, payload: object | null }, checkout: string,
 * repository: string, branch: string | null, agentM: { commit: string | null }, token: string | null, now: Date } — what an entry reads from the workflow's
 * environment. `token` is the workflow's own token, by its name GITHUB_TOKEN, never by value in a file; `branch` the branch the workflow runs for.
 */
export function ciEnvironment(entry, env, now) {
  let payload = null;
  try { payload = env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, "utf8")) : null; } catch { payload = null; }
  return {
    entry, service: "github", event: { name: env.GITHUB_EVENT_NAME ?? null, payload },
    checkout: env.GITHUB_WORKSPACE ?? "", repository: env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}` : "",
    branch: env.GITHUB_REF_NAME || null, agentM: { commit: env.GITHUB_SHA ?? null }, token: env.GITHUB_TOKEN || null, now,
  };
}

/**
 * composeInstance(env: CiEnvironment) -> { host } — the instance's checkout connected through the local clone, with the workflow's own token:
 * files are read and committed in the checkout and pushed with the credentials the checkout was made with.
 */
export function composeInstance(env) {
  return { host: connect(parseAddress(env.repository), { token: env.token, clone: env.checkout }) };
}
