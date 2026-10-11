// ci.mjs — the CI route (docs/architecture/MOD-runtimes.md, Parts: "ci.mjs — the CI route: queueing, live state, log
// and cancel through the repository host"). Of it, ITM-253 builds queueing: live state, the log and cancelling through the host
// are UC-036's and are not built yet. ITM-322 adds jobWorkflowFiles, the files of Agent M's job workflow for a product, from the
// templates workflow/github.yml and workflow/gitlab.yml, which it reads once, when it is loaded, from the disk, in Node.
//
// Module: MOD-runtimes
//
// Gap (MOD-runtimes.md, front matter `uses:` and its "## Uses" section): neither lists MOD-repository-hosts.
// repositoryInfo, yet commitFiles' `branch` must be a real branch name — never a commit SHA (confirmed against
// src/repository-hosts/github.mjs's commitFiles, which resolves it through `heads(branch)` = `heads/<branch>`, the
// GitHub Git Data API's reference path) — and queueJob's own signature carries no branch. Every other place in this
// codebase that commits "to the default branch" reads it through repositoryInfo(), declared where it is used
// (MOD-artifact-edits.md `uses:`; MOD-notifications.md, Data: "each repository's default branch, read once per
// page"). queueOnCi calls host.repositoryInfo() the same way; the gap is noted here rather than by editing the
// architecture file.

import { startRecord } from "../job-ledger/index.mjs";

// RuntimeError — the failures MOD-runtimes throws of its own (MOD-runtimes, Interfaces: queueJob): WorkflowMissing
// { files }, for the CI route of a product without Agent M's job workflow at the head a job is queued on.
export class RuntimeError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields ?? {});
  }
}

// Agent M's job workflow in a product (MOD-runtimes.md, Data), by the repository's server: one file.
const WORKFLOW_PATH = { github: ".github/workflows/agent-m-jobs.yml", gitlab: ".gitlab/agent-m-jobs.yml" };

// queueOnCi(host, start, head) -> Promise<{ path, commit }> — MOD-runtimes' queueJob (Interfaces), for the CI route:
// commits the job's start record (MOD-job-ledger's startRecord) at its path, on the head that was read, in one
// commit, as the person's commit — the host's commitFiles, on the branch its repositoryInfo names, with
// expectedHead the head given; the push starts the product's job workflow (Data). Refused with WorkflowMissing,
// naming the job workflow's file, while the snapshot at the head read does not hold it: nothing is committed then.
// Crosses the network through the host; fails as it fails — Moved, TokenRefused, PermissionMissing, RateLimited,
// Unreachable — unchanged, and with WorkflowMissing of its own.
export async function queueOnCi(host, start, head) {
  const [{ defaultBranch }, snapshot] = await Promise.all([host.repositoryInfo(), host.readSnapshot(head)]);
  const workflowPath = WORKFLOW_PATH[snapshot.repository.server];
  if (!snapshot.paths.includes(workflowPath)) {
    throw new RuntimeError("WorkflowMissing", { files: [workflowPath] },
      `${snapshot.repository.path} has no Agent M job workflow yet — add ${workflowPath}.`);
  }
  const { path, text } = startRecord(start);
  const { commit } = await host.commitFiles({
    branch: defaultBranch, expectedHead: head, files: [{ path, text }],
    message: `Queue job ${start.id}: ${start.kind}`,
  });
  return { path, commit };
}

// ---------------------------------------------------------------- the job workflow's files

const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// A template, read from the disk, in Node; null in a browser. Reading it there would be a fetch of the module's own data file,
// which the repository's check NO SERVER (tests/test_no_backend.py) allows only a module it lists, and it does not list this one:
// a browser gets a failure by name from jobWorkflowFiles, and the rest of the module loads.
const templateAt = (name) => disk?.readFileSync(new URL(`./workflow/${name}`, import.meta.url), "utf8") ?? null;

// A template is the head of the file, a line that begins `# --- one job`, and the lines of one job, written once for each route.
const TEMPLATES = { github: templateAt("github.yml"), gitlab: templateAt("gitlab.yml") };
const JOB_MARKER = /^# --- one job.*\n/m;

const SECRET_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/, LABEL = /^[A-Za-z0-9_.:-]+$/, COMMIT = /^[0-9a-f]{40}$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

// A text with each @@name@@ of the template replaced by the value given.
const fill = (template, values) => template.replace(/@@([a-z-]+)@@/g, (_, name) => values[name]);

/**
 * jobWorkflowFiles(server: "github" | "gitlab", instance: { repository: string, commit: string }, secrets: { token: string, keys:
 * string[] }, runners: string[]) -> { path: string, text: string }[] — the files of Agent M's job workflow in a product
 * (MOD-runtimes, Data), for the caller to commit on a person's click: on GitHub .github/workflows/agent-m-jobs.yml; on GitLab
 * .gitlab/agent-m-jobs.yml and, as the second file, the text the product's .gitlab-ci.yml needs to include it, to be added to
 * that file and not to replace it. One job for each route of the product's CI agents: the server's runners, `hosted`, and each
 * self-hosted runner by its label in `runners`. `instance.repository` is `owner/name` on github.com and `instance.commit` a
 * 40-digit commit, at which each job checks out the instance. `secrets.token` is the name of the secret that holds the person's
 * Agent M token, `secrets.keys` the names of those that hold the agents' keys: the files name them and hold no value. Pure.
 * The templates are read from the disk, in Node: in a browser it throws an Error that says so. Throws TypeError for a server that is neither, a repository or commit of another form, or a name of a secret or a runner label
 * that is not a plain name.
 * @param {"github" | "gitlab"} server
 * @param {{ repository: string, commit: string }} instance
 * @param {{ token: string, keys: string[] }} secrets
 * @param {string[]} runners
 * @returns {Array<{ path: string, text: string }>}
 */
export function jobWorkflowFiles(server, instance, secrets, runners) {
  if (!Object.hasOwn(WORKFLOW_PATH, server)) throw new TypeError(`the job workflow is written for GitHub or GitLab, not ${server}`);
  if (!REPOSITORY.test(instance.repository)) throw new TypeError(`the instance is owner/name: ${instance.repository}`);
  if (!COMMIT.test(instance.commit)) throw new TypeError(`the instance is at a commit of 40 hexadecimal digits: ${instance.commit}`);
  for (const name of [secrets.token, ...secrets.keys]) {
    if (!SECRET_NAME.test(name)) throw new TypeError(`a secret is named by a plain name: ${JSON.stringify(name)}`);
  }
  for (const label of runners) if (!LABEL.test(label)) throw new TypeError(`a runner is named by a plain label: ${JSON.stringify(label)}`);

  if (TEMPLATES[server] === null) throw new Error("MOD-runtimes: the job workflow's templates are read in Node; a browser cannot read them yet");
  const [head, job] = TEMPLATES[server].split(JOB_MARKER);
  const github = server === "github";
  const common = { repository: instance.repository, commit: instance.commit, token: secrets.token, "key-names": secrets.keys.join(" ") };
  const routes = [{ runner: "hosted", id: "hosted", "runs-on": "ubuntu-latest", tags: "" },
    ...runners.map((label) => ({ runner: label, id: `runner-${label}`, "runs-on": `[self-hosted, ${JSON.stringify(label)}]`,
      tags: `  tags: [${JSON.stringify(label)}]\n` }))];
  const jobs = routes.map((route) => fill(job, { ...common, ...route, runner: JSON.stringify(route.runner), route: route.runner,
    id: github ? route.id : `agent-m-${route.id}`, "key-env": secrets.keys.map((name) => `      ${name}: \${{ secrets.${name} }}\n`).join("") }));
  const files = [{ path: WORKFLOW_PATH[server], text: `${fill(head, common)}${jobs.join("\n")}` }];
  if (!github) files.push({ path: ".gitlab-ci.yml", text: `include:\n  - local: "${WORKFLOW_PATH.gitlab}"\n` });
  return files;
}
