// instance.mjs — the entries of the instance's workflows (MOD-workflow-entries, Parts): ITM-364 builds onApprovalsCommitted; onSourcesCommitted
// and onReleaseTagged are other items'.
//
// Module: MOD-workflow-entries
//
// WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED. The entry keeps nothing between runs.

import { applyApproved } from "../spec-changes/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { composeInstance } from "./compose.mjs";

const RULE = "A STALE APPROVAL IS NOT APPLIED";

/**
 * onApprovalsCommitted(env: CiEnvironment) -> Promise<EntryStatus> — in the instance: applies, in one commit, every approval of the
 * instance's own SPEC that no decision row names yet, with applyApproved, which the dashboard's acceptance shares its bytes with; nothing
 * for an approval whose text is stale. A missing token ends the entry at once as `not run`, before anything is written. The status names
 * what was applied and what was refused; `failed` when an approval was refused or the commit could not be made.
 */
export async function onApprovalsCommitted(env) {
  if (!env.token) return { outcome: "not run", summary: "GITHUB_TOKEN is missing: the workflow's own token is passed to the step as GITHUB_TOKEN. Nothing was written.", findings: [] };
  if (!env.branch) return { outcome: "not run", summary: "GITHUB_REF_NAME is missing: the branch the workflow runs for. Nothing was written.", findings: [] };
  const { host } = composeInstance(env);
  const snapshot = await host.readSnapshot(env.branch);
  const { files, applied, refused } = await applyApproved(snapshot, env.now);
  const stale = refused.map(({ record, reason }) => finding({ artifact: record, line: 1, kind: "error", rule: RULE, what: reason, fix: "approve the change again on its current text" }));
  const refusedLines = refused.map(({ record, reason }) => `refused ${record.split("/").pop()}: ${reason}`);
  if (applied.length === 0) {
    return refused.length === 0 ? { outcome: "nothing to do", summary: "No approval of the SPEC is waiting to be applied.", findings: [] }
      : { outcome: "failed", summary: `Nothing was applied. ${refusedLines.join(" ")}`, findings: stale };
  }
  const names = applied.map((record) => record.split("/").pop());
  const message = ["spec(freigabe): approved changes written by the apply-approvals entry", "", ...names.map((name) => `applied ${name}`), ...refusedLines,
    ...(env.agentM.commit ? ["", `Agent-M-Commit: ${env.agentM.commit}`] : [])].join("\n") + "\n";
  await host.commitFiles({ branch: env.branch, expectedHead: snapshot.commit,
    files: Object.entries(files).map(([path, text]) => ({ path, text })), message });
  return { outcome: refused.length ? "failed" : "done", summary: [`Applied ${names.join(", ")}.`, ...refusedLines].join(" "), findings: stale };
}
