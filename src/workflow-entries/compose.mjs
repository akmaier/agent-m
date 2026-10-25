// compose.mjs — what an entry composes before it works (MOD-workflow-entries, Parts): the CiEnvironment it reads, in the instance the
// checkout connected through Access's local clone with the workflow's own token (ITM-364), and in a product's job workflow the product's and
// the instance's checkouts connected through the local clone with the person's token, with the strategies of the modules that offer them
// registered with the job runner (ITM-365).
//
// Module: MOD-workflow-entries
//
// Reads secrets only from the environment (Files). The names are GitHub Actions': GITHUB_ACTIONS, GITHUB_EVENT_NAME, GITHUB_EVENT_PATH,
// GITHUB_WORKSPACE, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_REF_NAME and GITHUB_SHA are its default environment variables (docs.github.com, "Variables"
// reference); GITHUB_TOKEN is the workflow's own token, which a workflow passes to the step as `env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
// (docs.github.com, "Use GITHUB_TOKEN for authentication in workflows"). A product's job workflow (src/runtimes/workflow/github.yml, which
// MOD-runtimes' jobWorkflowFiles writes) gives its entries, besides: AGENT_M_RUNNER, the route's runner — `hosted`, or a self-hosted runner's
// label —; AGENT_M_PRODUCT_DIR, the product's checkout; AGENT_M_TOKEN_NAME, the name of the secret that holds the person's Agent M token, and
// AGENT_M_TOKEN, its value; AGENT_M_KEY_NAMES, the names of the secrets that hold the agents' keys, separated by blanks, each of which the
// workflow gives the entry as a variable of that name — on the agent's machine only the one at the place AGENT_M_KEY names —; AGENT_M_PART, the machine
// (`agent` or `write`), and AGENT_M_RESULT_DIR, the folder of the result between them; GITHUB_OUTPUT, the file of a step's outputs. The instance is checked
// out into `instance/` of GITHUB_WORKSPACE, from which the entry runs.

import { parseAddress, connect } from "../repository-hosts/index.mjs";
import { registerStrategies } from "../job-runner/index.mjs";
import * as approvals from "../approvals/index.mjs";
import * as specChanges from "../spec-changes/index.mjs";
import * as artifactEdits from "../artifact-edits/index.mjs";
import * as sourceRegister from "../source-register/index.mjs";
import * as workPlans from "../work-plans/index.mjs";
import * as runPlanner from "../run-planner/index.mjs";
import * as runtimes from "../runtimes/index.mjs";
import { prepareResult } from "./result.mjs";

const fs = globalThis.process?.getBuiltinModule?.("node:fs");
const path = globalThis.process?.getBuiltinModule?.("node:path");

/**
 * CiEnvironment — { entry: string, service: "github" | "gitlab", event: { name: string | null, payload: object | null }, checkout: string,
 * repository: string, branch: string | null, agentM: { commit: string | null }, token: string | null, now: Date, job: { runner: string | null,
 * productDir: string | null, instanceDir: string | null, actor: string | null, runUrl: string | null, tokenName: string, personToken: string | null,
 * keys: Record<string, string | null>, summaryFile: string | null } } — what an entry reads from the workflow's environment; `job` is what a product's job workflow adds:
 * the runner, the checkouts, the run's address, the name and value of the person's token and each key secret's value by its name, and the file GITHUB_STEP_SUMMARY names
 * for the run's summary, where it is set. `token` is the workflow's own token, by its name GITHUB_TOKEN, never by value in a file; `branch` the branch the workflow runs for.
 * `service` is `gitlab` where GITLAB_CI is `true`, else `github`; a GitLab job's variables are read as gitlabEnvironment states.
 */
export function ciEnvironment(entry, env, now) {
  return env.GITLAB_CI === "true" ? gitlabEnvironment(entry, env, now) : githubEnvironment(entry, env, now);
}

// A GitHub Actions job: the variables of the header above.
function githubEnvironment(entry, env, now) {
  let payload = null;
  try { payload = env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, "utf8")) : null; } catch { payload = null; }
  return {
    entry, service: "github", event: { name: env.GITHUB_EVENT_NAME ?? null, payload },
    checkout: env.GITHUB_WORKSPACE ?? "", repository: env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}` : "",
    branch: env.GITHUB_REF_NAME || null, agentM: { commit: env.GITHUB_SHA ?? null }, token: env.GITHUB_TOKEN || null, now,
    ...(entry === "onReleaseTagged" ? { release: releaseOf(env) } : {}),
    job: {
      runner: env.AGENT_M_RUNNER || null, productDir: env.AGENT_M_PRODUCT_DIR || null,
      instanceDir: env.GITHUB_WORKSPACE ? path.join(env.GITHUB_WORKSPACE, "instance") : null, actor: env.GITHUB_ACTOR || null,
      runUrl: env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` : null,
      tokenName: env.AGENT_M_TOKEN_NAME || "AGENT_M_TOKEN", personToken: env.AGENT_M_TOKEN || null,
      keys: keysOf(env),
      summaryFile: env.GITHUB_STEP_SUMMARY || null,
      ...partOf(env), outputFile: env.GITHUB_OUTPUT || null,
    },
  };
}

// What the instance's release workflow adds, for the entry onReleaseTagged only (`release`): the tag (GITHUB_REF_NAME), the run's phase `build` or `publish` (RELEASE_PHASE), the platform a build
// runs on (RELEASE_PLATFORM), the folder a build writes (RELEASE_FOLDER), the folders a publish run reads (RELEASE_FOLDERS, separated by blanks), and the BRIDGE_* signing
// secrets each by its name, an unset or empty one as null.
const RELEASE_SECRETS = ["BRIDGE_MACOS_CERTIFICATE", "BRIDGE_MACOS_CERTIFICATE_PASSWORD", "BRIDGE_NOTARY_KEY", "BRIDGE_NOTARY_KEY_ID", "BRIDGE_NOTARY_ISSUER",
  "BRIDGE_WINDOWS_CERTIFICATE", "BRIDGE_WINDOWS_CERTIFICATE_PASSWORD", "BRIDGE_UPDATE_KEY"];
function releaseOf(env) {
  return { tag: env.GITHUB_REF_NAME || null, phase: env.RELEASE_PHASE || null, platform: env.RELEASE_PLATFORM || null, folder: env.RELEASE_FOLDER || null,
    folders: String(env.RELEASE_FOLDERS ?? "").split(/\s+/).filter(Boolean), secrets: Object.fromEntries(RELEASE_SECRETS.map((name) => [name, env[name] || null])) };
}

// A GitLab job (src/runtimes/workflow/gitlab.yml): the service is `gitlab` where GITLAB_CI is `true`; the event is CI_PIPELINE_SOURCE, its payload the inputs the template sets as
// AGENT_M_INPUT_JOB, AGENT_M_INPUT_TASK, AGENT_M_INPUT_ENDPOINT and AGENT_M_INPUT_SECRET, each held only where it is not empty; the instance is cloned to `../instance` next to the project's checkout.
// GitLab has no step summary, and no instance workflow runs on GitLab: there is no summary file and no workflow token. The machine, its result's folder and its key
// are read as on GitHub (partOf); the plan's output is the dotenv file AGENT_M_OUTPUT names.
function gitlabEnvironment(entry, env, now) {
  const inputs = Object.fromEntries([["job", env.AGENT_M_INPUT_JOB], ["task", env.AGENT_M_INPUT_TASK], ["endpoint", env.AGENT_M_INPUT_ENDPOINT], ["secret", env.AGENT_M_INPUT_SECRET]].filter(([, value]) => value));
  return {
    entry, service: "gitlab", event: { name: env.CI_PIPELINE_SOURCE ?? null, payload: { inputs } },
    checkout: env.CI_PROJECT_DIR ?? "", repository: env.CI_PROJECT_URL ?? "", branch: env.CI_COMMIT_REF_NAME || null, agentM: { commit: env.CI_COMMIT_SHA ?? null }, token: null, now,
    job: {
      runner: env.AGENT_M_RUNNER || null, productDir: env.AGENT_M_PRODUCT_DIR || null,
      instanceDir: env.CI_PROJECT_DIR ? path.join(env.CI_PROJECT_DIR, "..", "instance") : null, actor: env.GITLAB_USER_LOGIN || null, runUrl: env.CI_PIPELINE_URL || null,
      tokenName: env.AGENT_M_TOKEN_NAME || "AGENT_M_TOKEN", personToken: env.AGENT_M_TOKEN || null,
      keys: keysOf(env),
      summaryFile: null, ...partOf(env), outputFile: env.AGENT_M_OUTPUT || null,
    },
  };
}

// The machine a job workflow's job is (src/runtimes/workflow/github.yml, gitlab.yml): AGENT_M_PART `agent` or `write`, else null, where it is neither — the plan —; the
// result's folder, AGENT_M_RESULT_DIR; and, on the agent's machine, the key it was given, AGENT_M_KEY, by its place among AGENT_M_KEY_NAMES from 1, 0 for none.
function partOf(env) {
  const part = ["agent", "write"].includes(env.AGENT_M_PART) ? env.AGENT_M_PART : null;
  const at = /^\d+$/.test(env.AGENT_M_KEY ?? "") ? Number(env.AGENT_M_KEY) : 0;
  return { part, resultDir: part ? env.AGENT_M_RESULT_DIR || null : null, agentKey: part === "agent" ? Object.keys(keysOf(env))[at - 1] ?? null : null };
}

// Each key secret's value by its name: AGENT_M_KEY_NAMES lists the names, separated by blanks, and the workflow gives each as a variable of that name.
function keysOf(env) {
  return Object.fromEntries(String(env.AGENT_M_KEY_NAMES ?? "").split(/\s+/).filter(Boolean).map((name) => [name, env[name] || null]));
}

/**
 * composeInstance(env: CiEnvironment) -> { host } — the instance's checkout connected through the local clone, with the workflow's own token:
 * files are read and committed in the checkout and pushed with the credentials the checkout was made with.
 */
export function composeInstance(env) {
  return { host: connect(parseAddress(env.repository), { token: env.token, clone: env.checkout }) };
}

// ---------------------------------------------------------------- a product's job workflow

// A host for a checkout through the local clone: files are read and committed in the clone and pushed with the credentials the checkout was made
// with, the person's token given as a secret, with every key, that no commit may hold. The clone does no server operation, so the repository's
// information is what the workflow knows: the branch it runs for. A commit pushed through the clone leaves the clone's own branch where it was,
// so the host remembers the newest commit it made — or the one the origin answered `Moved` with — and reads `HEAD`, or the branch, at that commit.
function checkoutHost(address, dir, branch, token, secrets) {
  const host = connect(parseAddress(address), { token, clone: dir, secrets });
  let latest = null;
  const at = (ref) => (latest && (ref === "HEAD" || ref === branch) ? latest : ref);
  return { ...host,
    repositoryInfo: async () => ({ defaultBranch: branch, visibility: "private", canWrite: true, archived: false, description: "" }),
    readSnapshot: (ref) => host.readSnapshot(at(ref)),
    async commitFiles(change) {
      try {
        const made = await host.commitFiles(change);
        latest = made.commit;
        return made;
      } catch (error) {
        if (error?.name === "Moved" && error.head) latest = error.head;
        throw error;
      }
    } };
}

// The address of the repository a checkout was made from: its origin's, where that is an address a repository has; else the product's, which
// then stands for it in the checkout's host — the checkout, not the address, is what the host reads.
function originOf(dir, fallback) {
  try {
    const origin = globalThis.process.getBuiltinModule("node:child_process").execFileSync("git", ["-C", dir, "remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    parseAddress(origin);
    return origin;
  } catch { return fallback; }
}

// The strategies the modules that offer them give the job runner, registered once for the program that runs, as the runner asks.
const OFFERED = [["MOD-approvals", approvals, "approvalStrategies"], ["MOD-spec-changes", specChanges, "specStrategies"],
  ["MOD-artifact-edits", artifactEdits, "editStrategies"], ["MOD-source-register", sourceRegister, "sourceStrategies"],
  ["MOD-work-plans", workPlans, "workStrategies"], ["MOD-run-planner", runPlanner, "runStrategies"], ["MOD-runtimes", runtimes, "routeStrategies"]];
let registered = false;
function registerStrategiesOnce() {
  if (registered) return;
  registered = true;
  for (const [owner, module, name] of OFFERED) if (module[name]) registerStrategies(owner, module[name]);
}

/**
 * composeProduct(env: CiEnvironment) -> { product: { address, host }, instance: { address, host, checkout }, result?: { pullRequest, end } } — the product's and
 * the instance's checkouts connected through the local clone, with the person's token from AGENT_M_TOKEN, every secret's value given as a secret no commit
 * may hold; and the strategies of the modules that offer them, registered with the job runner. On the agent's machine (`job.part` `agent`) the checkouts are
 * connected without a token, and `result` keeps what is written later (composeAgentPart).
 */
export function composeProduct(env) {
  const { job } = env;
  const secrets = [job.personToken, ...Object.values(job.keys)].filter(Boolean);
  registerStrategiesOnce();
  if (job.part === "agent") return composeAgentPart(env, secrets);
  return {
    product: { address: env.repository, host: checkoutHost(env.repository, job.productDir, env.branch, job.personToken, secrets) },
    instance: { address: originOf(job.instanceDir, env.repository),
      host: checkoutHost(originOf(job.instanceDir, env.repository), job.instanceDir, env.branch, job.personToken, secrets), checkout: job.instanceDir },
  };
}

// The agent's machine: no token. The product's checkout pushes into the result's own repository (result.mjs' prepareResult), so that every commit a job makes
// travels in the result; a pull request the writer `branch-and-pull-request` opens is kept for the writing machine, which opens it — or takes the one the
// branch has —, and stands under its pending address until then; the server is asked for no pull request here, so the writer finds none.
function composeAgentPart(env, secrets) {
  const { job } = env;
  const result = prepareResult(job.productDir, job.resultDir, env.branch);
  const product = checkoutHost(env.repository, job.productDir, env.branch, null, secrets);
  const instanceAddress = originOf(job.instanceDir, env.repository);
  return {
    product: { address: env.repository, host: { ...product, listPullRequests: async () => [], openPullRequest: async (request) => ({ url: result.pullRequest(request) }) } },
    instance: { address: instanceAddress, host: checkoutHost(instanceAddress, job.instanceDir, env.branch, null, secrets), checkout: job.instanceDir },
    result,
  };
}
