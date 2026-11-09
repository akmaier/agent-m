// actionsSetup — what a product lacks of the CI route, and its setup (docs/architecture/MOD-runtimes.md, Parts and Interfaces; UC-010, Precondition; UC-049 4c): the job
// workflow's files against jobWorkflowFiles, and the CI secrets they read against the repository's Actions secrets; setUp, on a person's click, commits the files and stores each
// missing secret this browser keeps a value for. The one place the settings page and the prompt bar learn it.
//
// Module: MOD-runtimes
//
// Private to MOD-runtimes; index.mjs exports actionsSetup. It reads MOD-browser-store through its index.mjs, and the hosts it is handed.

import { listSettings, readSetting } from "../browser-store/index.mjs";
import { WORKFLOW_PATH, jobWorkflowFiles, pinnedInstance } from "./ci.mjs";

const TOKEN_SECRET = "AGENT_M_TOKEN";
const PLAIN_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

// The endpoint settings of `store` that name a CI secret: [{ secret, key }], key null where this browser keeps none.
function endpointSecrets(store) {
  return listSettings(store).filter((setting) => setting.key.startsWith("endpoint:"))
    .map((setting) => readSetting(store, setting.key))
    .filter((setting) => typeof setting?.secret === "string" && PLAIN_NAME.test(setting.secret))
    .map((setting) => ({ secret: setting.secret, key: typeof setting.key === "string" && setting.key !== "" ? setting.key : null }));
}

// The value this browser keeps for the CI secret `name`: the product's token for AGENT_M_TOKEN, else the key of the endpoint setting whose secret names it; null where it keeps none.
function valueOf(store, tokenKey, name) {
  if (name === TOKEN_SECRET) {
    const value = readSetting(store, tokenKey)?.value;
    return typeof value === "string" && value !== "" ? value : null;
  }
  return endpointSecrets(store).find((endpoint) => endpoint.secret === name && endpoint.key !== null)?.key ?? null;
}

/**
 * actionsSetup({ product: { address, host, tokenKey }, instance: { host }, store }) -> Promise<{ missing: { workflow, secrets }, outdated, pins: { instance, product }, unknown, named:
 * { token, keys }, setUp }> (MOD-runtimes, Interfaces). It reads the instance's default branch — its repository and commit — and the product's; `named` is what the job workflow reads:
 * AGENT_M_TOKEN and, without a name twice, the `secret` each endpoint setting of `store` names; the runners are the server's own. `missing.workflow` is true where a file jobWorkflowFiles gives is absent, `outdated` names each that stands with another text. `pins.instance` is the
 * instance commit jobWorkflowFiles is given, `pins.product` the instance commit the product's job workflow file pins, null where that file is absent or names none. On GitHub
 * `missing.secrets` names each secret `named` that ciSecretNames does not list, the token first, and `unknown` those for which this browser keeps no value; on GitLab both are empty.
 * `setUp`, called only on a person's click, commits every absent or outdated file in one commit on the default branch on the head that was read, as the person's commit, then stores
 * with setCiSecret each missing secret this browser keeps a value for; it returns the commit, null where no file was written, and the names stored, never a value. Crosses the
 * network; fails as readSnapshot and ciSecretNames fail, and setUp as commitFiles and setCiSecret fail; what it wrote before a failure stays written.
 */
export async function actionsSetup({ product, instance, store }) {
  const { defaultBranch: instanceBranch } = await instance.host.repositoryInfo();
  const instanceSnapshot = await instance.host.readSnapshot(instanceBranch);
  const keys = [...new Set(endpointSecrets(store).map((endpoint) => endpoint.secret))];
  const runners = [];
  const named = { token: TOKEN_SECRET, keys };

  const { defaultBranch } = await product.host.repositoryInfo();
  const snapshot = await product.host.readSnapshot(defaultBranch);
  const server = snapshot.repository.server;
  const gitlabCi = server === "gitlab" ? (await snapshot.read(".gitlab-ci.yml")) ?? null : null;
  const files = jobWorkflowFiles(server, { repository: instanceSnapshot.repository.path, commit: instanceSnapshot.commit }, named, runners, gitlabCi);
  const standing = await Promise.all(files.map((file) => snapshot.read(file.path)));
  // The instance commit the files are given, and the one the product's job workflow file pins — the one a job queued on the CI route records —, null where it is absent or names none.
  const jobFile = standing[files.findIndex((file) => file.path === WORKFLOW_PATH[server])];
  const pins = { instance: instanceSnapshot.commit, product: jobFile === null || jobFile === undefined ? null : pinnedInstance(jobFile) };
  const absent = files.filter((_, at) => standing[at] === null || standing[at] === undefined);
  const outdated = files.filter((file, at) => standing[at] !== null && standing[at] !== undefined && standing[at] !== file.text).map((file) => file.path);
  // Every file that is absent or stands with another text, in the order jobWorkflowFiles gives them.
  const toWrite = files.filter((file, at) => standing[at] !== file.text);

  let missingSecrets = [];
  if (server === "github") {
    const listed = new Set(await product.host.ciSecretNames());
    missingSecrets = [named.token, ...named.keys].filter((name) => !listed.has(name));
  }
  const unknown = missingSecrets.filter((name) => valueOf(store, product.tokenKey, name) === null);

  async function setUp() {
    let commit = null;
    if (toWrite.length > 0) {
      ({ commit } = await product.host.commitFiles({ branch: defaultBranch, expectedHead: snapshot.commit,
        files: toWrite.map(({ path, text }) => ({ path, text })), message: "Install Agent M job workflow" }));
    }
    const stored = [];
    for (const name of missingSecrets) {
      const value = valueOf(store, product.tokenKey, name);
      if (value === null) continue;
      await product.host.setCiSecret(name, value);
      stored.push(name);
    }
    return { commit, stored };
  }

  return {
    missing: { workflow: absent.length > 0, secrets: missingSecrets },
    outdated,
    pins,
    unknown,
    named,
    setUp,
  };
}
