// ci.mjs — the CI route (docs/architecture/MOD-runtimes.md, Parts: "ci.mjs — the CI route: queueing, live state, log
// and cancel through the repository host"). Of it, this item (ITM-253) builds queueing alone: live state, the log and
// cancelling through the host are UC-036's and are not built yet.
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
