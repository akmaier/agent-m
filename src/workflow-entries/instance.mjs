// instance.mjs — the entries of the instance's workflows (MOD-workflow-entries, Parts): onApprovalsCommitted, onSourcesCommitted and onMainChanged;
// onReleaseTagged runs the Bridge's release.
//
// Module: MOD-workflow-entries
//
// WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED. The entry keeps nothing between runs.

import { readDocument } from "../documents/index.mjs";
import { applyApproved } from "../spec-changes/index.mjs";
import { fetchLegalText, recogniseLegalText, sourceSchemas, versionCommits } from "../source-register/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { lastAcceptedText, statuses } from "../approvals/index.mjs";
import { productFacts, publishOverview } from "../progress-measures/index.mjs";
import { publishGraph } from "../trace-graph/index.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import * as bridgeBuild from "../bridge-build/index.mjs";
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

/**
 * onMainChanged(env: CiEnvironment) -> Promise<EntryStatus> — in the instance, on every push to the default branch: on the commit's snapshot, read once,
 * adds the commit's graph and the impact lists of its decision and module files that are not accepted to the branch trace-cache through MOD-trace-graph's
 * publishGraph — each such file with the text it was last accepted at (MOD-approvals' lastAcceptedText, read once for the file) and that text's commit, which
 * is the commit that added the approval record naming the text —, and the commit's overview of the main page with the views of the progress and the backlog page
 * to the branch overview-cache through MOD-progress-measures' publishOverview, from the facts of the scope `all`, naming both in its summary. A file a branch holds already is left as it is (`nothing to do`). A missing
 * token ends the entry at once as `not run`; a failure — a branch missing, or moved meanwhile, so that the run can be made again — leaves the other record
 * written and ends the entry `failed`, naming it. The pages then derive what is missing as before, so nothing is wrong, only slower.
 */
export async function onMainChanged(env) {
  if (!env.token) return { outcome: "not run", summary: "GITHUB_TOKEN is missing: the workflow's own token is passed to the step as GITHUB_TOKEN. Nothing was written.", findings: [] };
  if (!env.branch) return { outcome: "not run", summary: "GITHUB_REF_NAME is missing: the branch the workflow runs for. Nothing was written.", findings: [] };
  const { host } = composeInstance(env);
  const snapshot = await host.readSnapshot(env.branch);
  const commit = snapshot.commit;
  const moved = (error) => (error?.name === "Moved" ? " The branch moved on meanwhile: run the entry again." : "");
  const done = [], failed = [];
  let written = false;
  try {
    const graph = await publishGraph(host, snapshot, await notAccepted(host, snapshot));
    written ||= graph.written;
    done.push(graph.written ? `Added the graph and the impact lists of ${commit} to trace-cache.` : `trace-cache holds the graph of ${commit} already.`);
  } catch (error) {
    failed.push(`The graph of ${commit} was not added to trace-cache: ${error?.message ?? error}${moved(error)}`);
  }
  try {
    // The facts are read from the snapshot already read: the host answers it for the branch the entry runs for.
    const same = { ...host, readSnapshot: (ref) => (ref === "HEAD" || ref === env.branch ? Promise.resolve(snapshot) : host.readSnapshot(ref)) };
    const facts = await productFacts(same, snapshot, (at) => host.readSnapshot(at), env.now, { scope: "all" });
    const overview = await publishOverview(host, snapshot, facts);
    written ||= overview.written;
    done.push(overview.written ? `Added the overview and the views of progress and backlog of ${commit} to overview-cache.`
      : `overview-cache holds the overview and the views of progress and backlog of ${commit} already.`);
  } catch (error) {
    failed.push(`The overview of ${commit} was not added to overview-cache: ${error?.message ?? error}${moved(error)}`);
  }
  const summary = [...failed, ...done].join(" ");
  return { outcome: failed.length ? "failed" : written ? "done" : "nothing to do", summary, findings: [] };
}

// The decision and module files of the snapshot that are not accepted, each as publishGraph takes it: its path and the text it was last accepted at with
// the commit of that text — null for a file never accepted. MOD-approvals' statuses names the files; lastAcceptedText gives the text, and the commit is
// the one that added the approval record docs/approvals/<id>-<blob12>.md, at which lastAcceptedText read it.
async function notAccepted(host, snapshot) {
  const changed = [];
  for (const [path, { id, kind, status }] of [...statuses(snapshot)].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!["architecture-decision", "module"].includes(kind) || status === "accepted") continue;
    const last = status === "open" ? null : await lastAcceptedText(id, host);
    if (last === null) { changed.push({ path, before: null }); continue; }
    const [adding] = await host.readHistory(`docs/approvals/${id}-${last.blob.slice(0, 12)}.md`, { ref: snapshot.commit, limit: 1, changes: false });
    changed.push({ path, before: { commit: adding.commit, text: last.text } });
  }
  return changed;
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
 * that has no recorded version, and for the entry a run started with the input `source` names, fetches the official text and commits
 * the version row and kept file in one commit; for an entry that has versions, the text is appended as a further version, and nothing is
 * written when it equals an existing version's (`nothing to do`, naming that version). A failed fetch writes nothing and names the source
 * that failed; an input that names no register entry, or an entry that is no EU legal text, fails naming it.
 */
export async function onSourcesCommitted(env) {
  if (!env.token) return { outcome: "not run", summary: "GITHUB_TOKEN is missing: the workflow's own token is passed to the step as GITHUB_TOKEN. Nothing was written.", findings: [] };
  if (!env.branch) return { outcome: "not run", summary: "GITHUB_REF_NAME is missing: the branch the workflow runs for. Nothing was written.", findings: [] };
  const { host } = composeInstance(env);
  const snapshot = await host.readSnapshot(env.branch);
  const { entry: schema } = sourceSchemas();
  const named = env.event?.payload?.inputs?.source;
  const asked = typeof named === "string" && named !== "" ? named : null;
  const waiting = [];
  let found = false;
  for (const path of snapshot.paths.filter((each) => SOURCE_ENTRY.test(each)).sort()) {
    const text = await snapshot.read(path);
    if (text === null) continue;
    const entry = readDocument(schema, path, text);
    if (asked !== null && entry.id === asked) {
      found = true;
      const identifier = recogniseLegalText(entry.fields.identifier);
      if (!identifier) return { outcome: "failed", summary: `${asked} is no EU legal text: its identifier names no CELEX number or ELI. Nothing was written.`, findings: [] };
      waiting.push({ entry, identifier });
      continue;
    }
    const identifier = isWaitingLegalText(entry);
    if (identifier) waiting.push({ entry, identifier });
  }
  if (asked !== null && !found) return { outcome: "failed", summary: `${asked} names no register entry. Nothing was written.`, findings: [] };
  if (waiting.length === 0) return { outcome: "nothing to do", summary: "No EU legal text is waiting for its fetch.", findings: [] };

  const files = [];
  const names = [], unchanged = [], settled = new Set();
  try {
    for (const { entry, identifier } of waiting) {
      const fetched = await fetchLegalText(identifier);
      let plan;
      try {
        plan = await versionCommits(entry, fetched.files.map((file) => ({ ...file, keep: true })), {
          version: fetched.repositoryVersion,
          date: fetched.retrieved,
          retrieved: fetched.retrieved,
          repositoryVersion: fetched.repositoryVersion,
          repository: env.repository,
        });
      } catch (error) {
        if (error?.name !== "SameBytes") throw error;
        unchanged.push(`${entry.id}: the fetched text equals ${error.version}; nothing was written.`);
        settled.add(entry.id);
        continue;
      }
      for (const group of plan) {
        if (group.repository && group.repository !== env.repository) {
          throw Object.assign(new Error(`${entry.id} plans source files outside the instance repository`), { name: "ContentRepositoryOutsideInstance" });
        }
        files.push(...group.files.map(hostFile));
      }
      names.push(entry.id);
      settled.add(entry.id);
    }
  } catch (error) {
    const failed = waiting.find(({ entry }) => !settled.has(entry.id))?.entry ?? waiting[0].entry;
    return { outcome: "failed", summary: failureSummary(failed, error), findings: [] };
  }

  if (names.length === 0) return { outcome: "nothing to do", summary: unchanged.join(" "), findings: [] };
  const message = ["sources: fetched EU legal texts", "", ...names.map((name) => `fetched ${name}`),
    ...(env.agentM.commit ? ["", `Agent-M-Commit: ${env.agentM.commit}`] : [])].join("\n") + "\n";
  await host.commitFiles({ branch: env.branch, expectedHead: snapshot.commit, files, message });
  return { outcome: "done", summary: [`Fetched ${names.join(", ")}.`, ...unchanged].join(" "), findings: [] };
}

// The secrets a platform's build needs (MOD-bridge-build, Data), by the names the release workflow gives them.
const BUILD_SECRETS = {
  macos: ["BRIDGE_MACOS_CERTIFICATE", "BRIDGE_MACOS_CERTIFICATE_PASSWORD", "BRIDGE_NOTARY_KEY", "BRIDGE_NOTARY_KEY_ID", "BRIDGE_NOTARY_ISSUER", "BRIDGE_UPDATE_KEY"],
  windows: ["BRIDGE_WINDOWS_CERTIFICATE", "BRIDGE_WINDOWS_CERTIFICATE_PASSWORD", "BRIDGE_UPDATE_KEY"],
  linux: ["BRIDGE_UPDATE_KEY"],
};
const notRun = (summary) => ({ outcome: "not run", summary: `${summary} Nothing was built or published.`, findings: [] });
const failedWith = (what, error, rest = "") => ({ outcome: "failed", findings: [],
  summary: `${what} failed: ${error?.name && error.name !== "Error" ? `${error.name}: ` : ""}${error?.message ?? error}${error?.file ? ` (${error.file})` : ""}.${rest}` });

/**
 * onReleaseTagged(env: CiEnvironment, functions?: { buildPlatform, publishRelease }) -> Promise<EntryStatus> — in the instance, on a release tag. The release workflow runs it
 * on each platform's runner with env.release.phase `build` and the platform, where it calls MOD-bridge-build's buildPlatform once for that platform; then once with the phase
 * `publish`, where it calls publishRelease once with the folders the builds wrote. `functions` are MOD-bridge-build's by default. A missing tag, platform, folder, token or
 * secret ends the run `not run`, naming it, before a function is called; a failed build or a signature that cannot be verified ends it `failed`, and nothing is published
 * then (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`).
 */
export async function onReleaseTagged(env, functions = bridgeBuild) {
  const release = env.release ?? {};
  if (!release.tag) return notRun("The release tag is missing: GITHUB_REF_NAME names the tag the workflow runs for.");
  if (release.phase === "build") {
    const platform = release.platform;
    if (!platform) return notRun("RELEASE_PLATFORM is missing: the platform this runner builds for (macos, windows or linux).");
    if (!Object.hasOwn(BUILD_SECRETS, platform)) return notRun(`RELEASE_PLATFORM ${platform} is no platform of the Bridge.`);
    if (!release.folder) return notRun("RELEASE_FOLDER is missing: the folder the build writes.");
    const missing = BUILD_SECRETS[platform].filter((name) => !release.secrets?.[name]);
    if (missing.length) return notRun(`The secret ${missing.join(", ")} is missing for the ${platform} build.`);
    try {
      const built = await functions.buildPlatform({ platform, checkout: env.checkout, tag: release.tag, folder: release.folder });
      return { outcome: "done", summary: `Built the Bridge for ${platform} at ${release.tag}: ${built?.files?.length ?? 0} files in ${release.folder}.`, findings: [] };
    } catch (error) {
      return failedWith(`The ${platform} build of ${release.tag}`, error, " The platform's files are not handed on, so nothing is published.");
    }
  }
  if (release.phase === "publish") {
    if (!env.token) return notRun("GITHUB_TOKEN is missing: the workflow's own token is passed to the step as GITHUB_TOKEN.");
    if (!release.secrets?.BRIDGE_UPDATE_KEY) return notRun("The secret BRIDGE_UPDATE_KEY is missing for the release.");
    if (!release.folders?.length) return notRun("RELEASE_FOLDERS is missing: the folders the platforms' builds wrote.");
    try {
      const host = connect(parseAddress(env.repository), { token: env.token });
      const { published, facts } = await functions.publishRelease(host, { tag: release.tag, folders: release.folders });
      return { outcome: "done", summary: `Published ${published.length} files as the release of ${release.tag}; read the due diligence of ${facts.length} packages.`, findings: [] };
    } catch (error) {
      return failedWith(`The release of ${release.tag}`, error, " Nothing was published.");
    }
  }
  return notRun("RELEASE_PHASE is missing: `build` on each platform's runner, or `publish` once.");
}
