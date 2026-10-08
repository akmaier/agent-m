// The public trace Route for ITM-277's current SPEC slice. It deliberately does not choose versions, derive traces,
// read queues or write: the caller hands it the pinned ref of the dashboard it is embedded in.
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

function requirementDetail(requirement) {
  const detail = el("section", "requirement-detail", el("h3", null, requirement.name));
  for (const [label, text] of [["Source", requirement.source], ["Rule", requirement.rule], ["Check", requirement.check]]) {
    const field = el("section", "requirement-field", el("h4", null, label));
    field.append(renderArtifact(text ?? ""));
    detail.append(field);
  }
  return detail;
}

function requirementRows(requirement) {
  const button = el("button", "requirement-name", requirement.name);
  button.type = "button";
  const row = el("tr", null, el("td", null, button));
  const opened = el("tr", "requirement-opened");
  button.addEventListener("click", () => {
    const cell = el("td", "panel", requirementDetail(requirement));
    cell.setAttribute("colspan", "1");
    opened.replaceChildren(cell);
  });
  return [row, opened];
}

function requirementsTable(requirements) {
  const body = el("tbody");
  for (const requirement of requirements) body.append(...requirementRows(requirement));
  return el("table", "list", el("thead", null, el("tr", null, el("th", null, "Requirement"))), body);
}

function overview(spec) {
  const page = el("section", "current-requirements", el("h2", null, "Current requirements"));
  const sectioned = new Set(spec.sections.flatMap((section) => section.requirements));
  const outside = [...spec.requirements.values()].filter((requirement) => !sectioned.has(requirement.name));

  if (outside.length) page.append(requirementsTable(outside));
  for (const section of spec.sections) {
    const requirements = section.requirements.map((name) => spec.requirements.get(name)).filter(Boolean);
    const group = el("section", "panel spec-section", el("h3", null, sectionTitle(section.heading)), requirementsTable(requirements));
    page.append(group);
  }
  if (!spec.requirements.size) page.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
  return page;
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
    target.append(overview(parseSpec(text ?? "")));
  },
};
