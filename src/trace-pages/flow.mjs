// The public trace Route for the specification, the gaps and the modules (the modules page draws the component diagram, UC-025 step 5). Above its page it offers the ref its caller hands (current, when that is the default
// branch) and every tag of the product, newest first (UC-020 steps 1, 1a, 1c); choosing one draws the page again at it. The specification page
// reads the SPEC alone. Opening a requirement shows its four fields at once and, beside them, what traces to it (UC-020 step 5): the trace
// graph of the version drawn is built when the first requirement is opened, through the snapshot's readMany, and kept for every later
// opening; the sources with version and part, the use cases with their review status, the decisions, modules and tests that name it,
// and the unknown names they also name, each a link (step 6). The gaps page (step 7) draws, from the graph of the version drawn, the matrix of
// every requirement against the use cases, decisions, modules and tests that name it, and the gaps as MOD-trace-graph's coverageGaps finds them;
// it says so when there are none (7a) and says which kinds of artifact the version does not hold (7b), and a requirement or use case in a list
// opens as it read in that version. The graph of one version is built once and kept, in memory, for every page drawn at it while the page of the frame
// stays loaded. It writes nothing. On the default branch the specification leads to the review pages' editing: Edit beside each requirement and
// + Requirement in each section; at any other ref the view says "as of" it and offers neither. Beside the choice a link leads from the specification to the gaps
// and from the gaps back to the specification, at the ref shown (UC-020 step 7); it reads nothing.
//
// Module: MOD-trace-pages

import { parseSpec } from "../spec-document/index.mjs";
import { renderArtifact, renderMermaid } from "../markdown-render/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { statuses } from "../approvals/index.mjs";
import { linkedVersion, sourceSchemas } from "../source-register/index.mjs";
import { coverageGaps, traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { componentDiagram, moduleFiles } from "./diagram.mjs";
import { descriptorFor } from "./views.mjs";
import { opening, personsSource, subjectOf } from "./subject.mjs";

const SPEC_PATH = "SPEC.md";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const sectionTitle = (heading) => String(heading ?? "").replace(/^##[ \t]*/, "");

function requirementDetail(requirement) {
  const detail = el("section", "requirement-detail", el("h3", null, requirement.name));
  for (const [label, text] of [["Source", requirement.source], ["Rule", requirement.rule], ["Check", requirement.check]]) {
    const field = el("section", "requirement-field", el("h4", null, label));
    field.append(renderArtifact(text ?? ""));
    detail.append(field);
  }
  return detail;
}

// ---------------------------------------------------------------- what traces to an opened requirement (UC-020 steps 5 and 6)

// The address of an artifact's page, in the form the frame reads (a route, then key=value parts, each encoded): a use case, a decision and a module
// at the review pages' routes `use-case`, `decision` and `module` with the part `id`, a test at this module's own route `trace` for the tests view,
// a source at the library's `library` with the part `source`. An identifier of another kind has no page, and is shown unlinked.
const fragment = (route, params) => `#${[route, ...Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)].join("/")}`;
function addressOf(id) {
  if (/^UC-/.test(id)) return fragment("use-case", { id });
  if (/^ARC-/.test(id)) return fragment("decision", { id });
  if (/^MOD-/.test(id)) return fragment("module", { id });
  if (/^TST-/.test(id)) return fragment("trace", { key: "tests", row: id });
  if (/^SRC-/.test(id)) return fragment("library", { source: id });
  return null;
}
const linked = (id, text) => {
  const address = addressOf(id);
  if (address === null) return el("span", null, text);
  const anchor = el("a", "trace-link", text);
  anchor.setAttribute("href", address);
  return anchor;
};

// A fact of the version drawn, read when it is first wanted and kept for every later opening; one that failed is read again at the next.
function kept(make) {
  let held = null;
  return () => {
    held ??= make().catch((failure) => { held = null; throw failure; });
    return held;
  };
}

// The sources of the version drawn: the product's links at the version, and the register of the instance at its default branch (the Host the frame
// gave the route; the version's own snapshot where it gave none), as MOD-review-pages' sourcesOf reads them.
async function sourcesOf(shown) {
  const { snapshot, context } = shown;
  const { entry, links } = sourceSchemas();
  let holder = snapshot;
  if (context.instance?.host) holder = await context.instance.host.readSnapshot((await context.instance.host.repositoryInfo()).defaultBranch);
  const register = await Promise.all(holder.paths.filter((path) => /^docs\/sources\/[^/]+\.md$/.test(path))
    .map(async (path) => readDocument(entry, path, (await holder.read(path)) ?? "")));
  return { links: readDocument(links, "docs/sources.md", (await snapshot.read("docs/sources.md")) ?? ""), register };
}

const REVIEW = { open: "open", accepted: "accepted", changed: "changed since acceptance" };
const problemLine = (what, failure) => el("p", "traces-problem", `${what} could not be read: ${failure?.message ?? failure}`);
const listOf = (items) => el("ul", "trace-list", ...items.map((item) => el("li", null, item)));

// The graph of a commit is built once for the page that holds the browser's store (the Host, where the context has none), whichever page asks and however
// often the version is drawn again: a commit does not change. It is kept in memory only, under the commit.
const graphsOf = new WeakMap();
function graphKept(shown) {
  const { snapshot, context } = shown;
  const make = () => traceGraph(snapshot, { commit: snapshot.commit ?? null });
  if (typeof snapshot.commit !== "string") return kept(make);
  const holder = context.store ?? context.product.host;
  const graphs = graphsOf.get(holder) ?? graphsOf.set(holder, new Map()).get(holder);
  if (!graphs.has(snapshot.commit)) graphs.set(snapshot.commit, kept(make));
  return graphs.get(snapshot.commit);
}

// The facts of the version drawn, each read on its first opening.
function factsOf(shown) {
  return shown.facts ??= { graph: graphKept(shown), sources: kept(() => sourcesOf(shown)) };
}

// Whether the graph holds an artifact of the kind at all.
const holds = (graph, kind) => [...graph.nodes.values()].some((node) => node.kind === kind);

// The sections of one opened requirement, drawn into `box` once the graph is read. A list nothing fills reads `none`; where the version holds no
// artifact of the kind at all — no decision, module or test —, it reads `none yet` and a folded note says which phase produces them (UC-020 2b, 5a).
async function showTraces(box, requirement, shown) {
  const facts = factsOf(shown);
  const section = (title, ...content) => el("section", "requirement-trace", el("h4", null, title), ...content);
  const sections = [];
  let graph;
  try {
    graph = await facts.graph();
  } catch (failure) {
    box.replaceChildren(problemLine("What traces to this requirement", failure));
    return;
  }
  const traces = tracesTo(graph, requirement.name);
  const reviewOf = statuses(shown.snapshot);

  try {
    const { links, register } = await facts.sources();
    sections.push(section("Sources", traces.sources.length ? listOf(traces.sources.map((item) => {
      const found = linkedVersion(links, register, item);
      if (!found) return el("span", null, `${item} — no linked version`);
      return el("span", null, linked(found.source.id, found.source.fields.title ?? found.source.id), ` — version ${found.version.version}${found.part ? `, part ${found.part}` : ""}`);
    })) : el("p", "none", "none")));
  } catch (failure) {
    sections.push(section("Sources", problemLine("The sources", failure)));
  }

  sections.push(section("Use cases", traces.useCases.length ? listOf(traces.useCases.map((id) => {
    const node = graph.nodes.get(id);
    return el("span", null, linked(id, `${id} ${node.title ?? ""}`.trim()), ` — ${REVIEW[reviewOf.get(node.path)?.status] ?? "open"}`);
  })) : el("p", "none", "none")));
  for (const [title, kind, ids] of [["Architecture decisions", "ARC", traces.decisions], ["Modules", "MOD", traces.modules], ["Tests", "TST", traces.tests]]) {
    if (ids.length) sections.push(section(title, listOf(ids.map((id) => linked(id, `${id} ${graph.nodes.get(id)?.title ?? ""}`.trim())))));
    else if (!holds(graph, kind)) {
      sections.push(section(title, el("p", "none-yet", "none yet"),
        explain("trace-none-yet")));
    } else sections.push(section(title, el("p", "none", "none")));
  }

  // Unknown names (UC-020 5b): the names that match no requirement, as coverageGaps finds them, which the artifacts listed above also name.
  const listedIds = new Set([...traces.useCases, ...traces.decisions, ...traces.modules, ...traces.tests]);
  const unknown = coverageGaps(graph).unknownNames
    .map(({ name, namedBy }) => ({ name, namedBy: [...new Set(namedBy.map((place) => place.id).filter((id) => listedIds.has(id)))] }))
    .filter(({ namedBy }) => namedBy.length);
  sections.push(section("Unknown names", unknown.length ? listOf(unknown.map(({ name, namedBy }) =>
    el("span", null, `${name} — named by `, ...namedBy.flatMap((id, at) => [...(at ? [", "] : []), linked(id, id)])))) : el("p", "none", "none")));
  box.replaceChildren(...sections);
}

// ---------------------------------------------------------------- the gaps (UC-020 step 7)

// A line of a list that opens, by a click and in place, onto what `detail` makes: a requirement or a use case as it read in the version drawn.
function openable(text, detail) {
  const button = el("button", "gap-open btn small", text);
  button.type = "button";
  const opened = el("div", "gap-opened");
  let open = false;
  button.addEventListener("click", async () => {
    open = !open;
    if (!open) { opened.replaceChildren(); return; }
    opened.replaceChildren(el("p", "traces-reading", "Reading…"));
    try {
      const made = await detail();
      if (open) opened.replaceChildren(made);
    } catch (failure) {
      if (open) opened.replaceChildren(problemLine(text, failure));
    }
  });
  return el("li", null, button, opened);
}

const KINDS = [["UC", "use cases"], ["ARC", "architecture decisions"], ["MOD", "modules"], ["TST", "tests"]];

// The matrix of the version drawn, in the order of the SPEC: each requirement against the artifacts that name it, as tracesTo finds them.
function matrixOf(graph, spec) {
  const cell = (ids) => ids.length ? el("td", null, ...ids.flatMap((id, at) => [...(at ? [", "] : []), linked(id, id)])) : el("td", "none", "none");
  const rows = [...spec.requirements.keys()].map((name) => {
    const traces = tracesTo(graph, name);
    return el("tr", null, el("td", null, name), cell(traces.useCases), cell(traces.decisions), cell(traces.modules), cell(traces.tests));
  });
  return el("table", "list gaps-matrix", el("thead", null, el("tr", null, ...["Requirement", "Use cases", "Architecture decisions", "Modules", "Tests"].map((title) => el("th", null, title)))),
    el("tbody", null, ...rows));
}

// The gaps page, drawn into `box` once the graph is read. The lists are coverageGaps' and nothing is decided here: a list is the gaps of its kind, or reads
// `none`; where every list is empty and the version holds every kind of artifact, the page says there are no gaps (7a); where it holds no requirement or no
// artifact of a kind, it says so (7b), since the lists do not look for what the version cannot hold. A requirement or a use case in a list opens as the
// version drawn holds it.
async function showGaps(box, shown) {
  let graph;
  try {
    graph = await factsOf(shown).graph();
  } catch (failure) {
    box.replaceChildren(problemLine("The gaps", failure));
    return;
  }
  const found = coverageGaps(graph);
  const { ref, spec, snapshot } = shown;
  const missing = [...(spec.requirements.size ? [] : [`SPEC.md holds no requirements at ${ref}.`]),
    ...KINDS.filter(([kind]) => !holds(graph, kind)).map(([, name]) => `No ${name} exist at ${ref}.`)];
  const requirementLine = (name) => openable(name, () => requirementDetail(spec.requirements.get(name)));
  const useCaseLine = (id) => {
    const node = graph.nodes.get(id);
    const title = `${id} ${node.title ?? ""}`.trim();
    return openable(title, async () => el("section", "gap-artifact", el("h4", null, title), renderArtifact((await snapshot.read(node.path)) ?? "")));
  };
  const section = (title, items) => el("section", "gaps-list", el("h3", null, title), items.length ? el("ul", "trace-list", ...items) : el("p", "none", "none"));
  const unknown = found.unknownNames.map(({ name, namedBy }) =>
    el("li", null, `${name} — named by `, ...[...new Set(namedBy.map((place) => place.id))].flatMap((id, at) => [...(at ? [", "] : []), linked(id, id)])));
  const none = !found.requirementsWithoutUseCase.length && !found.requirementsWithoutModule.length && !found.requirementsWithoutTest.length
    && !found.useCasesWithoutRequirement.length && !unknown.length;
  box.replaceChildren(...missing.map((line) => el("p", "gaps-missing", line)),
    ...(none && !missing.length ? [el("p", "no-gaps", `There are no gaps at ${ref}.`)] : [
      section("Requirements realised by no use case", found.requirementsWithoutUseCase.map(requirementLine)),
      ...(holds(graph, "MOD") ? [section("Requirements named by no module", found.requirementsWithoutModule.map(requirementLine))] : []),
      ...(holds(graph, "TST") ? [section("Requirements named by no test", found.requirementsWithoutTest.map(requirementLine))] : []),
      section("Use cases that realise no requirement", found.useCasesWithoutRequirement.map(useCaseLine)),
      section("Unknown names", unknown),
    ]),
    ...(spec.requirements.size ? [el("h3", null, "Matrix"), matrixOf(graph, spec)] : []));
}

// An anchor to a route of the review pages, in the address form the frame reads: the route, then its parts as key=value, each encoded.
function reviewLink(className, text, route, params) {
  const anchor = el("a", `${className} btn small`, text);
  const parts = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  anchor.setAttribute("href", `#${route}/${parts.join("/")}`);
  return anchor;
}

function requirementRows(requirement, editable, shown) {
  const button = el("button", "requirement-name btn small", requirement.name);
  button.type = "button";
  const cell = el("td", null, button);
  if (editable) cell.append(" ", reviewLink("requirement-edit", "Edit", "requirement", { name: requirement.name }));
  const row = el("tr", null, cell);
  const opened = el("tr", "requirement-opened");
  button.addEventListener("click", () => {
    if (opened.textContent) {
      opened.replaceChildren();
      opening(shown.requirements, requirement.name, false);
      return;
    }
    const traces = el("div", "requirement-traces", el("p", "traces-reading", "Reading what traces to it…"));
    const cell = el("td", "panel", requirementDetail(requirement), traces);
    cell.setAttribute("colspan", "1");
    showTraces(traces, requirement, shown);
    opened.replaceChildren(cell);
    opening(shown.requirements, requirement.name, true);
  });
  return [row, opened];
}

function requirementsTable(requirements, editable, shown) {
  const body = el("tbody");
  for (const requirement of requirements) body.append(...requirementRows(requirement, editable, shown));
  return el("table", "list", el("thead", null, el("tr", null, el("th", null, "Requirement"))), body);
}

function overview(spec, editable, shown) {
  const page = el("section", "current-requirements head", el("h2", null, "Current requirements"));
  const sectioned = new Set(spec.sections.flatMap((section) => section.requirements));
  const outside = [...spec.requirements.values()].filter((requirement) => !sectioned.has(requirement.name));

  if (outside.length) page.append(requirementsTable(outside, editable, shown));
  for (const section of spec.sections) {
    const requirements = section.requirements.map((name) => spec.requirements.get(name)).filter(Boolean);
    const table = requirementsTable(requirements, editable, shown);
    const held = { heading: sectionTitle(section.heading), names: requirements.map(({ name }) => name) };
    table.setAttribute("hidden", "hidden");
    const toggle = el("button", "spec-section-toggle btn", sectionTitle(section.heading));
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const collapsed = table.getAttribute("hidden") !== null;
      if (collapsed) {
        table.removeAttribute("hidden");
      }
      else table.setAttribute("hidden", "hidden");
      toggle.setAttribute("aria-expanded", String(collapsed));
      opening(shown.groups, held, collapsed, (a, b) => a.heading === b.heading);
    });
    const group = el("section", "spec-section", el("h3", null, toggle), table);
    if (editable) {
      const added = reviewLink("requirement-new", "+ Requirement", "requirements", { section: section.heading });
      added.setAttribute("style", "display: inline-block; margin: 0 0 12px;");
      group.insertBefore(added, table);
    }
    page.append(group);
  }
  if (!spec.requirements.size) page.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
  return page;
}

// Whether the ref on view is the repository's default branch, which the Host names: editing is offered there only (UC-018). A Host that cannot say is read as no.
async function onDefaultBranch(host, ref) {
  try {
    return (await host.repositoryInfo?.())?.defaultBranch === ref;
  } catch {
    return false;
  }
}

// The tags the Host names, newest first by their vYYYY.MINOR.PATCH numbers; a tag of another form follows them, in the order the Host gave it.
// A Host that cannot say is read as having none.
const RELEASE = /^v(\d+)\.(\d+)\.(\d+)$/;
async function tagsOf(host) {
  try {
    const names = (await host.listTags()).map((tag) => tag.name);
    const numbers = (name) => RELEASE.exec(name)?.slice(1).map(Number) ?? null;
    const released = names.filter((name) => numbers(name)).sort((a, b) => {
      const [x, y] = [numbers(a), numbers(b)];
      return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
    });
    return [...released, ...names.filter((name) => !numbers(name))];
  } catch {
    return [];
  }
}

// The choice above the tree: the ref the caller handed, then the tags; the one shown is selected. Without a tag only the handed ref is offered.
function versionChoice({ shown, handed, current, tags, choose, other }) {
  const select = el("select", "version-choice");
  select.setAttribute("aria-label", "Version");
  for (const [value, text] of [[handed, current ? "current" : handed], ...tags.filter((tag) => tag !== handed).map((tag) => [tag, tag])]) {
    const option = el("option", null, text);
    option.value = value;
    select.append(option);
  }
  select.value = shown.ref;
  select.addEventListener("change", () => choose(select.value));
  const choice = el("div", "version-bar", el("label", null, "Version ", select));
  const across = el("a", `${other.className} btn small`, other.text);
  across.setAttribute("href", fragment("trace", { key: other.key, ref: shown.ref }));
  choice.append(across);
  if (!tags.length) choice.append(el("p", "version-none", "No release is tagged yet (UC-013); only the current text can be shown."));
  if (!shown.onDefaultBranch) choice.append(el("p", "version-as-of", `as of ${shown.ref}`));
  return choice;
}

// The view each of the two leads to, beside its version choice: the specification to the gaps, and the gaps back to the specification, at the ref shown.
const OTHER = {
  specification: { key: "gaps", text: "Gaps", className: "trace-gaps-link" },
  gaps: { key: "specification", text: "Specification", className: "trace-specification-link" },
};

// What each drawn route keeps for its subject, by the context it was drawn with: the frame asks the route for the subject with the same context.
const drawn = new WeakMap();

// The modules page (UC-025 step 5): the component diagram of the modules of the version handed, from the graph of that version, drawn through renderMermaid. It offers no
// version choice and reads no tag: the view's versions are "branch". Where the version holds no module it says so, and where the graph cannot be read it names that.
async function drawModules(target, context, host, ref, descriptor) {
  const shown = { target, ref, onDefaultBranch: false, spec: null, source: null, requirements: [], groups: [], context, snapshot: null, facts: null };
  drawn.set(context, shown);
  const place = el("div", "modules-body", el("p", "traces-reading", "Reading the modules…"));
  target.replaceChildren(el("section", "modules head", el("h2", null, descriptor.title), place));
  let graph;
  try {
    shown.snapshot = await host.readSnapshot(ref);
    graph = await factsOf(shown).graph();
  } catch (failure) {
    place.replaceChildren(problemLine("The modules", failure));
    return;
  }
  const files = moduleFiles(graph);
  if (!files.length) {
    place.replaceChildren(el("p", "gaps-missing", `No modules exist at ${ref}.`));
    return;
  }
  place.replaceChildren(await renderMermaid(componentDiagram(files)));
}

export const route = {
  name: "trace",
  entry: "requirements",
  title: "Current requirements",

  subject: (params, context) => subjectOf({ title: descriptorFor(params.key)?.title ?? route.title, params, context, shown: drawn.get(context) ?? null }),

  async render(target, context, params = {}) {
    target.replaceChildren();
    drawn.set(context, { target, ref: params.ref, onDefaultBranch: false, spec: null, source: null, requirements: [], groups: [] });
    const descriptor = descriptorFor(params.key);
    if (!descriptor || !context.product?.host || !params.ref) {
      target.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
      return;
    }
    const host = context.product.host;
    if (descriptor.key === "modules") {
      await drawModules(target, context, host, params.ref, descriptor);
      return;
    }
    const handed = params.ref;
    const tags = await tagsOf(host);
    let current = false;
    let latest = 0;

    // Draws the SPEC at `ref` under the choice; of two choices made in a row, the later one is what stays. A ref chosen later that cannot be
    // read is named in place of the tree; the handed one is the caller's.
    const draw = async (ref, chosen) => {
      const mine = ++latest;
      const shown = { target, ref, onDefaultBranch: false, spec: null, source: null, requirements: [], groups: [], context, snapshot: null, facts: null };
      drawn.set(context, shown);
      let body;
      let fill = null;
      try {
        const snapshot = await host.readSnapshot(ref);
        shown.snapshot = snapshot;
        const text = await snapshot.read(SPEC_PATH);
        shown.onDefaultBranch = await onDefaultBranch(host, ref);
        shown.spec = parseSpec(text ?? "");
        if (descriptor.key === "gaps") {
          const place = el("div", "gaps-body", el("p", "traces-reading", "Reading the gaps…"));
          body = el("section", "gaps head", el("h2", null, descriptor.title), place);
          fill = () => showGaps(place, shown);
        } else {
          if (shown.onDefaultBranch) shown.source = await personsSource(context, snapshot);
          body = overview(shown.spec, shown.onDefaultBranch, shown);
        }
      } catch (error) {
        if (!chosen) throw error;
        body = el("p", "version-problem", `${ref} could not be read: ${error?.message ?? error}`);
      }
      if (mine !== latest) return;
      if (!chosen) current = shown.onDefaultBranch;
      target.replaceChildren(versionChoice({ shown, handed, current, tags, choose: (next) => draw(next, true), other: OTHER[descriptor.key] }), body);
      if (fill) await fill();
    };
    await draw(handed, false);
  },
};
