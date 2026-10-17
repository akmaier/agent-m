// The public trace Route for the current SPEC slice. Above the tree it offers the ref its caller hands (current, when that is the default
// branch) and every tag of the product, newest first (UC-020 steps 1, 1a, 1c); choosing one draws the SPEC again at it. It does not derive
// traces, read queues or write. On the default branch it leads to the review pages' editing: Edit beside each requirement and
// + Requirement in each section; at any other ref the view says "as of" it and offers neither.
//
// Module: MOD-trace-pages

import { parseSpec } from "../spec-document/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";
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
    const cell = el("td", "panel", requirementDetail(requirement));
    cell.setAttribute("colspan", "1");
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
      const shown = { target, ref, onDefaultBranch: false, spec: null, source: null, requirements: [], groups: [] };
      drawn.set(context, shown);
      let body;
      try {
        const snapshot = await host.readSnapshot(ref);
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
