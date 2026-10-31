// The route `plan` — the implementation plan (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md; Interfaces: view,
// route plan; UC-045 steps 1 and 4, alternative flows 1a and 1b): the architecture's system, subsystems and modules beside the plan's
// steps in the plan's order, each with its derived state and what it waits for, and a Mermaid diagram of the steps and what each waits
// for, drawn through renderMermaid; a folded What is this? (explain). A product whose model works from a backlog has no plan and gets a
// link to the backlog (1a); an architecture file that is open or changed is named, and nothing is planned (1b); a step whose module or subsystem file was changed or removed after the step
// was saved is marked, naming the file, and a module without a step is named (1c, ITM-1036), both from MOD-work-plans' planFindings with the history of the product's host. The marks
// write nothing: the steps stand as they are until the planner saves. Not built here: Draft the plan, Save plan and + Step.
//
// Module: MOD-implementation-pages
//
// It reads the declaration and the declared model's file first (modelFirst), the file at the commit the declaration names through the instance's readFileAt: for a model that
// works from a backlog it links the backlog and reads nothing else (UC-045 1a). The route `board` reads them the same way, through modelFirst. The model is the catalogue's
// reading of that file (MOD-model-catalogue's catalogue over the one file); a commit the instance cannot read, or a version that is no commit identifier, leaves the model unknown.
//
// The steps and their states are those MOD-progress-measures' productFacts gives with the scope `work`: it reads the plan (docs/plan/,
// in the order of docs/plan/order.md), the approval statuses, the job records and the pull requests and derives each state with
// MOD-work-plans' itemStates; no state is stored. The architecture comes from MOD-trace-graph's latestGraph — the graph stored for the commit, or, while that is not
// stored yet, the graph stored last, with the line naming both commits above the page; the states and the statuses stay the head's. The system is the
// decision that refines no other, a subsystem one that refines it and designs a module, a module a module file; a module no subsystem
// designs stands under the system. An architecture file is open when MOD-approvals' status of it, in the facts, is not accepted.

import { renderMermaid } from "../markdown-render/index.mjs";
import { productFacts } from "../progress-measures/index.mjs";
import { latestGraph } from "../trace-graph/index.mjs";
import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { catalogue } from "../model-catalogue/index.mjs";
import { declarationSchema } from "../product-process/index.mjs";
import { planFindings } from "../work-plans/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { heads } from "./index.mjs";

const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const idOf = (document) => String(document?.id ?? document?.fields?.id ?? "");
const listOf = (value) => (Array.isArray(value) ? value.map(String) : []);
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const mermaidId = (id) => id.replace(/[^A-Za-z0-9]/g, "_");
// The first element below `root` that carries the attribute.
const placeOf = (root, attribute) => {
  for (const child of root.childNodes) {
    if (child.nodeType !== 1) continue;
    if (child.getAttribute(attribute) !== null) return child;
    const inner = placeOf(child, attribute);
    if (inner) return inner;
  }
  return null;
};
const REVIEWED = new Set(["architecture-decision", "module"]);
const DECLARATION = "docs/process.md";
// The failures with which the instance cannot read the commit a declaration names.
const UNREADABLE = new Set(["NotFound", "TokenRefused", "PermissionMissing", "Unreachable"]);

/**
 * The declared model as the instance held it at the commit the declaration's model_version names, its file read with the instance host's readFileAt and read as the catalogue
 * reads a model: { model: Model | null | "unknown", unread: { commit, error } | null } — null for a file the catalogue does not hold, "unknown" where the commit cannot be read.
 * @param {object} context the route's ViewContext @param {object | null} declaration the product's docs/process.md as a document
 */
export async function declaredModelOf(context, declaration) {
  if (declaration === null) return { model: null, unread: null };
  const file = String(declaration.fields?.model_file ?? ""), version = String(declaration.fields?.model_version ?? "");
  if (!/^[0-9a-f]{40}$/.test(version)) return { model: "unknown", unread: { commit: version, error: "NotFound" } };
  let held;
  try {
    held = (await context.instance.host.readFileAt(file, [version])).get(version) ?? null;
  } catch (error) {
    if (!UNREADABLE.has(error?.name)) throw error;
    return { model: "unknown", unread: { commit: version, error: error.name } };
  }
  const at = { paths: held === null ? [] : [file], read: async (path) => (path === file ? held : null), readMany: async () => {}, blob: () => null };
  return { model: (await catalogue(at)).models.find((each) => each.path === file) ?? null, unread: null };
}

/**
 * What `plan` and `board` read first: the product's snapshot at the branch shown, its declaration and the declared model (declaredModelOf) -> { ref, snapshot, declaration, model }.
 * @param {object} context the route's ViewContext
 */
export async function modelFirst(context) {
  const { product } = context;
  const ref = product.ref ?? (await product.host.repositoryInfo()).defaultBranch;
  const snapshot = await product.host.readSnapshot(ref);
  const declared = await snapshot.read(DECLARATION);
  const declaration = declared === null ? null : readDocument(declarationSchema, DECLARATION, declared);
  return { ref, snapshot, declaration, ...(await declaredModelOf(context, declaration)) };
}
const ASSEMBLES = "AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES";

// The findings of the plan against the architecture as it stands (planFindings with the history of the host): of them those that mark a step whose module or subsystem file was changed or
// removed after it, and a module, subsystem or system without a step. The architecture is read as documents with MOD-documents' schemas. The marks could not be read: none.
async function marksOf(facts, graph, host) {
  try {
    const schemas = artifactSchemas();
    const architecture = await Promise.all([...graph.nodes.values()].filter((node) => node.kind === "ARC" || node.kind === "MOD")
      .map(async (node) => readDocument(node.kind === "ARC" ? schemas.decision : schemas.module, node.path, (await facts.snapshot.read(node.path)) ?? "")));
    const found = await planFindings(facts.plan.order, facts.plan.items, architecture, null, facts.snapshot, { host }, graph);
    return found.filter((each) => each.rule === ASSEMBLES);
  } catch {
    return [];
  }
}

// The architecture of the graph as the page lists it: [{ id, kind, under, title }] — the system, each of its subsystems followed by
// its modules, then the modules no subsystem designs.
function architectureOf(graph) {
  const nodes = [...graph.nodes.values()];
  const from = (id, via) => graph.edges.filter((edge) => edge.from === id && edge.via === via);
  const decisions = nodes.filter((node) => node.kind === "ARC").sort(byId);
  const systems = decisions.filter((node) => from(node.id, "refines").length === 0);
  const modules = nodes.filter((node) => node.kind === "MOD").sort(byId);
  const rows = [];
  const placed = new Set();
  for (const system of systems) {
    rows.push({ id: system.id, kind: "system", under: null, title: system.title });
    const subsystems = decisions.filter((node) => from(node.id, "refines").some((edge) => edge.to === system.id) && from(node.id, "designs").length > 0);
    for (const subsystem of subsystems) {
      rows.push({ id: subsystem.id, kind: "subsystem", under: system.id, title: subsystem.title });
      for (const edge of from(subsystem.id, "designs")) {
        const module = modules.find((node) => node.id === edge.to);
        if (module && !placed.has(module.id)) { placed.add(module.id); rows.push({ id: module.id, kind: "module", under: subsystem.id, title: module.title }); }
      }
    }
    for (const module of modules) {
      if (!placed.has(module.id)) { placed.add(module.id); rows.push({ id: module.id, kind: "module", under: system.id, title: module.title }); }
    }
  }
  return rows;
}

// The flowchart of the steps in the plan's order, each labelled with its state, an edge from each step a step builds on.
function diagramOf(steps) {
  const shown = new Set(steps.map((step) => step.id));
  return ["flowchart TD",
    ...steps.map((step) => `  ${mermaidId(step.id)}["${step.id} — ${step.state}"]`),
    ...steps.flatMap((step) => step.buildsOn.filter((id) => shown.has(id)).map((id) => `  ${mermaidId(id)} --> ${mermaidId(step.id)}`))].join("\n");
}

export const route = {
  ...heads.plan,

  async render(target, context) {
    const { instance, product } = context;
    const note = (html) => { target.innerHTML = `<section class="panel"><h2>Plan</h2>${html}</section>`; };
    const first = await modelFirst(context);
    if (first.declaration === null) {
      note(`<p class="warn">No process model is declared for this product, so there is no plan to show. <a href="#process">Declare one</a>.</p>`);
      return;
    }
    if (first.model === null || first.model === "unknown") {
      note(`<p class="warn">The declared process model could not be read, so there is no plan to show. <a href="#process">Open the declaration</a>.</p>`);
      return;
    }
    if (first.model.kind === "pulled") {
      note(`<p>This product's model, ${h(first.model.name)}, works from a backlog and has no implementation plan. <a href="#backlog">Open the backlog</a>.</p>`);
      return;
    }
    const instanceInfo = await instance.host.repositoryInfo();
    const instanceSnapshot = await instance.host.readSnapshot(instanceInfo.defaultBranch);
    const facts = await productFacts(product.host, instanceSnapshot, (commit) => instance.host.readSnapshot(commit), new Date(), { scope: "work" });

    const open = [...facts.statuses].filter(([, entry]) => REVIEWED.has(entry.kind) && entry.status !== "accepted").sort(([a], [b]) => (a < b ? -1 : 1));
    if (open.length > 0) {
      note(`<p class="warn">The architecture is not accepted, so nothing is planned. Still to accept:</p>
        <ul>${open.map(([path, entry]) => `<li>${h(path)} — ${entry.status === "changed" ? "changed since it was accepted" : "open"}</li>`).join("")}</ul>
        <p class="muted small">Accept it first (<a href="#arc">the architecture</a>).</p>`);
      return;
    }

    const { graph, line } = await latestGraph(facts.snapshot, facts.snapshot.commit);
    const architecture = architectureOf(graph);
    const marked = await marksOf(facts, graph, product.host);
    const marksFor = (id) => marked.filter((each) => each.artifact === id);
    const documents = new Map(facts.plan.items.map((item) => [idOf(item), item]));
    const steps = facts.plan.states.map((state) => {
      const item = documents.get(state.item);
      return { id: state.item, title: String(item?.fields?.title ?? ""), state: state.state, reason: state.reason ?? "", buildsOn: listOf(item?.fields?.builds_on) };
    });

    const tree = architecture.map((row) => `<li data-architecture="${h(row.id)}" data-kind="${row.kind}"${row.under ? ` data-under="${h(row.under)}"` : ""}>`
      + `${h(row.id)}${row.title ? ` — ${h(row.title)}` : ""} <span class="muted small">${row.kind}</span>${marksFor(row.id).map((each) => ` <span class="warn small" data-mark>${h(each.what)}</span>`).join("")}</li>`).join("");
    const table = steps.length === 0 ? `<p class="muted">No plan is saved yet.</p>`
      : `<table><thead><tr><th>Step</th><th>State</th><th>Waits for</th></tr></thead><tbody>${steps.map((step) => `<tr data-step="${h(step.id)}" data-state="${h(step.state)}">`
        + `<td>${h(step.id)}${step.title ? ` — ${h(step.title)}` : ""}${marksFor(step.id).map((each) => ` <span class="warn small" data-mark>${h(each.what)}</span>`).join("")}</td><td>${h(step.state)}</td><td data-waits-for>${h(step.reason)}</td></tr>`).join("")}</tbody></table>`;
    target.innerHTML = `<section class="panel"><h2>Plan</h2>${line ? `<p class="muted small" data-graph-as-of>${h(line)}</p>` : ""}<div data-plan-explain></div>
      <div class="cols"><div><h3>Architecture</h3><ul>${tree}</ul></div><div><h3>Steps</h3>${table}<div data-plan-diagram></div></div></div></section>`;
    placeOf(target, "data-plan-explain").append(explain("implementation-plan"));
    if (steps.length > 0) placeOf(target, "data-plan-diagram").append(await renderMermaid(diagramOf(steps)));
  },
};
