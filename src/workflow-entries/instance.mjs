// instance.mjs — the entries of the instance's workflows (MOD-workflow-entries, Parts): ITM-364 builds onApprovalsCommitted; onSourcesCommitted
// and onReleaseTagged are other items'.
//
// Module: MOD-workflow-entries
//
// WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED. The entry keeps nothing between runs.

import { readDocument } from "../documents/index.mjs";
import { applyApproved } from "../spec-changes/index.mjs";
import { fetchLegalText, recogniseLegalText, sourceSchemas, versionCommits } from "../source-register/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { composeInstance } from "./compose.mjs";

const RULE = "A STALE APPROVAL IS NOT APPLIED";
const SOURCE_ENTRY = /^docs\/sources\/SRC-[^/]+\.md$/;

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

function isWaitingLegalText(entry) {
  const identifier = recogniseLegalText(entry.fields.identifier);
  if (!identifier) return null;
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  return (versions?.rows?.length ?? 0) === 0 ? identifier : null;
}

function hostFile(file) {
  if (typeof file.content === "string") return { path: file.path, text: file.content };
  if (file.content instanceof Uint8Array) return { path: file.path, bytes: file.content };
  if (typeof file.text === "string" || file.bytes instanceof Uint8Array || file.delete === true) return file;
  throw new TypeError(`${file.path}: a planned file has no content`);
}

function failureSummary(entry, error) {
  const kind = error?.name && error.name !== "Error" ? `${error.name}: ` : "";
  return `${entry.id}: ${kind}${error?.reason ?? error?.message ?? String(error)}`;
}

/**
 * onSourcesCommitted(env: CiEnvironment) -> Promise<EntryStatus> — in the instance: for each EU legal text source entry
 * that has no recorded version, fetches the official text and commits the completed version row and kept file in one commit.
 * A failed fetch writes nothing and names the source that failed.
 */
export async function onSourcesCommitted(env) {
  if (!env.token) return { outcome: "not run", summary: "GITHUB_TOKEN is missing: the workflow's own token is passed to the step as GITHUB_TOKEN. Nothing was written.", findings: [] };
  if (!env.branch) return { outcome: "not run", summary: "GITHUB_REF_NAME is missing: the branch the workflow runs for. Nothing was written.", findings: [] };
  const { host } = composeInstance(env);
  const snapshot = await host.readSnapshot(env.branch);
  const { entry: schema } = sourceSchemas();
  const waiting = [];
  for (const path of snapshot.paths.filter((each) => SOURCE_ENTRY.test(each)).sort()) {
    const text = await snapshot.read(path);
    if (text === null) continue;
    const entry = readDocument(schema, path, text);
    const identifier = isWaitingLegalText(entry);
    if (identifier) waiting.push({ entry, identifier });
  }
  if (waiting.length === 0) return { outcome: "nothing to do", summary: "No EU legal text is waiting for its fetch.", findings: [] };

  const files = [];
  const names = [];
  try {
    for (const { entry, identifier } of waiting) {
      const fetched = await fetchLegalText(identifier);
      const plan = await versionCommits(entry, fetched.files.map((file) => ({ ...file, keep: true })), {
        version: fetched.repositoryVersion,
        date: fetched.retrieved,
        retrieved: fetched.retrieved,
        repositoryVersion: fetched.repositoryVersion,
        repository: env.repository,
      });
      for (const group of plan) {
        if (group.repository && group.repository !== env.repository) {
          throw Object.assign(new Error(`${entry.id} plans source files outside the instance repository`), { name: "ContentRepositoryOutsideInstance" });
        }
        files.push(...group.files.map(hostFile));
      }
      names.push(entry.id);
    }
  } catch (error) {
    const failed = waiting.find(({ entry }) => !names.includes(entry.id))?.entry ?? waiting[0].entry;
    return { outcome: "failed", summary: failureSummary(failed, error), findings: [] };
  }

  const message = ["sources: fetched EU legal texts", "", ...names.map((name) => `fetched ${name}`),
    ...(env.agentM.commit ? ["", `Agent-M-Commit: ${env.agentM.commit}`] : [])].join("\n") + "\n";
  await host.commitFiles({ branch: env.branch, expectedHead: snapshot.commit, files, message });
  return { outcome: "done", summary: `Fetched ${names.join(", ")}.`, findings: [] };
}
