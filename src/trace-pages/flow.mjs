// The public trace Route for the current SPEC slice. It does not choose versions, derive traces, read queues or write:
// the caller hands it the pinned ref of the dashboard it is embedded in. On the default branch it leads to the review pages' editing:
// Edit beside each requirement and + Requirement in each section.
//
// Module: MOD-trace-pages

import { parseSpec } from "../spec-document/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";
import { descriptorFor } from "./views.mjs";

const SPEC_PATH = "SPEC.md";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const sectionTitle = (heading) => String(heading ?? "").replace(/^##[ \t]*/, "");

function requirementDetail(requirement, editable) {
  const detail = el("section", "requirement-detail", el("h3", null, requirement.name));
  for (const [label, text] of [["Source", requirement.source], ["Rule", requirement.rule], ["Check", requirement.check]]) {
    const field = el("section", "requirement-field", el("h4", null, label));
    field.append(renderArtifact(text ?? ""));
    detail.append(field);
  }
  if (editable) detail.append(reviewLink("requirement-prompt", "Change by prompt", "requirement", { name: requirement.name, prompt: 1 }));
  return detail;
}

// An anchor to a route of the review pages, in the address form the frame reads: the route, then its parts as key=value, each encoded.
function reviewLink(className, text, route, params) {
  const anchor = el("a", `${className} btn small`, text);
  const parts = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  anchor.setAttribute("href", `#${route}/${parts.join("/")}`);
  return anchor;
}

function requirementRows(requirement, editable) {
  const button = el("button", "requirement-name btn small", requirement.name);
  button.type = "button";
  const cell = el("td", null, button);
  if (editable) cell.append(" ", reviewLink("requirement-edit", "Edit", "requirement", { name: requirement.name }));
  const row = el("tr", null, cell);
  const opened = el("tr", "requirement-opened");
  button.addEventListener("click", () => {
    if (opened.textContent) {
      opened.replaceChildren();
      return;
    }
    const cell = el("td", "panel", requirementDetail(requirement, editable));
    cell.setAttribute("colspan", "1");
    opened.replaceChildren(cell);
  });
  return [row, opened];
}

function requirementsTable(requirements, editable) {
  const body = el("tbody");
  for (const requirement of requirements) body.append(...requirementRows(requirement, editable));
  return el("table", "list", el("thead", null, el("tr", null, el("th", null, "Requirement"))), body);
}

function overview(spec, editable) {
  const page = el("section", "current-requirements head", el("h2", null, "Current requirements"));
  const sectioned = new Set(spec.sections.flatMap((section) => section.requirements));
  const outside = [...spec.requirements.values()].filter((requirement) => !sectioned.has(requirement.name));

  if (outside.length) page.append(requirementsTable(outside, editable));
  for (const section of spec.sections) {
    const requirements = section.requirements.map((name) => spec.requirements.get(name)).filter(Boolean);
    const table = requirementsTable(requirements, editable);
    table.setAttribute("hidden", "hidden");
    const toggle = el("button", "spec-section-toggle btn", sectionTitle(section.heading));
    const prompt = editable
      ? reviewLink("requirement-group-prompt", "Change by prompt", "requirements", { requirements: JSON.stringify(requirements.map(({ name }) => name)), prompt: 1 })
      : null;
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const collapsed = table.getAttribute("hidden") !== null;
      if (collapsed) {
        table.removeAttribute("hidden");
        if (prompt && !prompt.parentNode) group.insertBefore(prompt, table);
      }
      else table.setAttribute("hidden", "hidden");
      toggle.setAttribute("aria-expanded", String(collapsed));
    });
    const group = el("section", "spec-section", el("h3", null, toggle), table);
    if (editable) group.insertBefore(reviewLink("requirement-new", "+ Requirement", "requirements", { section: section.heading }), table);
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

export const route = {
  name: "trace",
  entry: "requirements",
  title: "Current requirements",

  async render(target, context, params = {}) {
    target.replaceChildren();
    const descriptor = descriptorFor(params.key);
    if (!descriptor || !context.product?.host || !params.ref) {
      target.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
      return;
    }
    const snapshot = await context.product.host.readSnapshot(params.ref);
    const text = await snapshot.read(SPEC_PATH);
    target.append(overview(parseSpec(text ?? ""), await onDefaultBranch(context.product.host, params.ref)));
  },
};
