// Module: MOD-workflow-entries
// The entry loads the declared workflow and job scope; Process alone evaluates the Definition of Done.
import { artifactSchemaOf, readDocument } from "../documents/index.mjs";
import { catalogue, modelSchema } from "../model-catalogue/index.mjs";
import { recordsNewestFirst } from "../job-ledger/index.mjs";
import { declarationSchema, doneCheck, gateSchema, workflowOf } from "../product-process/index.mjs";
import { composeProduct } from "./compose.mjs";

/** onDoneCheck(env: CiEnvironment) -> Promise<EntryStatus>. Reads facts and reports findings; never merges. */
export async function onDoneCheck(env) {
  if (!env.job.personToken) return { outcome: "not run", summary: `${env.job.tokenName} is missing. Nothing was written.`, findings: [] };
  if (!env.pullRequest) return { outcome: "failed", summary: "The pull request number is missing.", findings: [] };
  const { product, instance } = composeProduct(env);
  const snapshot = await product.host.readSnapshot("HEAD");
  const declaration = readDocument(declarationSchema, "docs/process.md", await snapshot.read("docs/process.md") ?? "");
  const version = await instance.host.readSnapshot(declaration.fields.model_version);
  const cat = await catalogue(version);
  const model = cat.models.find((each) => each.path === declaration.fields.model_file);
  if (!model) throw new Error(`The declared process model ${declaration.fields.model_file} is missing.`);
  const spec = await version.read("SPEC.md") ?? "";
  const named = workflowOf(declaration, model, [], spec).practices;
  const practices = [];
  for (const practice of cat.practices.filter((each) => named.includes(each.name))) {
    const text = await version.read(practice.path);
    if (text === null) throw new Error(`The declared practice ${practice.path} is missing.`);
    practices.push(readDocument(modelSchema.practice, practice.path, text));
  }
  const workflow = workflowOf(declaration, model, practices, spec);
  const facts = await product.host.pullRequestFacts(env.pullRequest);
  let job = null;
  for await (const record of recordsNewestFirst(snapshot)) {
    if (env.job.id ? record.id === env.job.id : `${facts.pullRequest.title} ${facts.pullRequest.branch}`.includes(record.id)) { job = record; break; }
  }
  if (!job || !["implement", "fix-bug", "refactor"].includes(job.kind)) throw new Error("No implementation job record identifies this pull request.");
  const assigned = new Set();
  for (const id of job.worksOn) {
    if (id.startsWith("MOD-")) { assigned.add(id); continue; }
    const path = snapshot.paths.find((each) => each.split("/").at(-1).startsWith(`${id}-`) && artifactSchemaOf(each)?.schema === "item");
    if (!path) throw new Error(`The job's item ${id} is missing.`);
    const item = readDocument(artifactSchemaOf(path), path, await snapshot.read(path));
    for (const module of item.fields.modules ?? []) assigned.add(module);
  }
  const modules = [], gates = [];
  for (const path of snapshot.paths) {
    if (artifactSchemaOf(path)?.schema === "module") modules.push(readDocument(artifactSchemaOf(path), path, await snapshot.read(path)));
    else if (path.startsWith("docs/gates/") && path.endsWith(".md")) gates.push(readDocument(gateSchema, path, await snapshot.read(path)));
  }
  const findings = await doneCheck(facts, workflow, modules, gates, { kind: job.kind, modules: [...assigned] });
  return { outcome: findings.some((each) => each.kind === "error") ? "failed" : "done",
    summary: findings.length ? `The Definition of Done has ${findings.length} finding(s).` : "The Definition of Done holds.", findings };
}
