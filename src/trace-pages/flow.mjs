// The public trace Route for the current SPEC slice. Above the tree it offers the ref its caller hands (current, when that is the default
// branch) and every tag of the product, newest first (UC-020 steps 1, 1a, 1c); choosing one draws the SPEC again at it. Drawing reads
// the SPEC alone. Opening a requirement shows its four fields at once and, beside them, what traces to it (UC-020 step 5): the trace
// graph of the version drawn is built when the first requirement is opened, through the snapshot's readMany, and kept for every later
// opening; the sources with version and part, the use cases with their review status, the decisions, modules and tests that name it,
// and the unknown names they also name, each a link (step 6). Beside them the history of its accepted changes (step 5, 5d), which
// MOD-spec-changes' requirementHistory gives and the view draws as it is, read when the requirement is opened and kept per version and
// name; at a tag it is the history up to that tag. It writes nothing. On the default branch it leads to
// the review pages' editing: Edit beside each requirement and + Requirement in each section; at any other ref the view says "as of" it
// and offers neither.
//
// Module: MOD-trace-pages

import { parseSpec } from "../spec-document/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { statuses } from "../approvals/index.mjs";
import { linkedVersion, sourceSchemas } from "../source-register/index.mjs";
import { coverageGaps, traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { requirementHistory } from "../spec-changes/index.mjs";
import { explain } from "../site-frame/index.mjs";
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

// The facts of the version drawn, each read on its first opening.
function factsOf(shown) {
  return shown.facts ??= {
    graph: kept(() => traceGraph(shown.snapshot, { commit: shown.snapshot.commit ?? null })),
    sources: kept(() => sourcesOf(shown)),
    histories: new Map(),
  };
}

// The history of one requirement of the version drawn, read when it is first wanted and kept for every later opening. The Host handed to
// requirementHistory names the version's ref in its readHistory, so that the history is the one up to it; one that failed is read again.
function historyOf(shown, name) {
  const { histories } = factsOf(shown);
  if (!histories.has(name)) {
    const { host } = shown.context.product;
    const upToRef = { readHistory: (path, options) => host.readHistory(path, { ...options, ref: shown.ref }), readSnapshot: (ref) => host.readSnapshot(ref) };
    histories.set(name, kept(() => requirementHistory(name, upToRef)));
  }
  return histories.get(name)();
}

// A requirement's text of a history entry, or what the entry's other side being none means.
function historyText(text, none) {
  return text === null ? el("p", "none", none) : renderArtifact(text);
}

// The history of one opened requirement, drawn into `box` once it is read (UC-020 step 5, 5d): every accepted change, oldest first, with its
// date, accepting person and commit, its record, and the text before and after. A section written before any record shows the commit that
// introduced it and says that no record names it.
async function showHistory(box, requirement, shown) {
  const section = (...content) => el("section", "requirement-history", el("h4", null, "History"), ...content);
  let changes;
  try {
    changes = await historyOf(shown, requirement.name);
  } catch (failure) {
    box.replaceChildren(section(problemLine("Its history", failure)));
    return;
  }
  box.replaceChildren(section(changes.length ? el("ol", "history-list", ...changes.map((change) => el("li", "history-change",
    el("p", "history-head", `${change.date} — ${change.person} — commit ${change.commit.slice(0, 12)}`),
    el("p", "history-record", change.record === null ? "No approval record names this commit." : `Record ${change.record}`),
    el("section", "history-before", el("h5", null, "Before"), historyText(change.before, "none — this commit introduced it")),
    el("section", "history-after", el("h5", null, "After"), historyText(change.after, "none — this commit withdrew it"))))) : el("p", "none", "none")));
}

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
  const held = (kind) => [...graph.nodes.values()].some((node) => node.kind === kind);
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
    else if (!held(kind)) {
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
    const history = el("div", "requirement-history-box", el("p", "history-reading", "Reading its history…"));
    const cell = el("td", "panel", requirementDetail(requirement), traces, history);
    cell.setAttribute("colspan", "1");
    showTraces(traces, requirement, shown);
    showHistory(history, requirement, shown);
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
function versionChoice({ shown, handed, current, tags, choose }) {
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
  if (!tags.length) choice.append(el("p", "version-none", "No release is tagged yet (UC-013); only the current text can be shown."));
  if (!shown.onDefaultBranch) choice.append(el("p", "version-as-of", `as of ${shown.ref}`));
  return choice;
}

// What each drawn route keeps for its subject, by the context it was drawn with: the frame asks the route for the subject with the same context.
const drawn = new WeakMap();

export const route = {
  name: "trace",
  entry: "requirements",
  title: "Current requirements",

  subject: (params, context) => subjectOf({ title: route.title, params, context, shown: drawn.get(context) ?? null }),

  async render(target, context, params = {}) {
    target.replaceChildren();
    drawn.set(context, { target, ref: params.ref, onDefaultBranch: false, spec: null, source: null, requirements: [], groups: [] });
    const descriptor = descriptorFor(params.key);
    if (!descriptor || !context.product?.host || !params.ref) {
      target.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
      return;
    }
    const host = context.product.host;
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
      try {
        const snapshot = await host.readSnapshot(ref);
        shown.snapshot = snapshot;
        const text = await snapshot.read(SPEC_PATH);
        shown.onDefaultBranch = await onDefaultBranch(host, ref);
        shown.spec = parseSpec(text ?? "");
        if (shown.onDefaultBranch) shown.source = await personsSource(context, snapshot);
        body = overview(shown.spec, shown.onDefaultBranch, shown);
      } catch (error) {
        if (!chosen) throw error;
        body = el("p", "version-problem", `${ref} could not be read: ${error?.message ?? error}`);
      }
      if (mine !== latest) return;
      if (!chosen) current = shown.onDefaultBranch;
      target.replaceChildren(versionChoice({ shown, handed, current, tags, choose: (next) => draw(next, true) }), body);
    };
    await draw(handed, false);
  },
};
