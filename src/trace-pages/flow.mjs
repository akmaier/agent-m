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

function requirementButton(requirement, detail) {
  const button = el("button", "requirement-name", requirement.name);
  button.type = "button";
  button.addEventListener("click", () => detail.replaceChildren(requirementDetail(requirement)));
  return button;
}

function overview(spec) {
  const page = el("section", "current-requirements", el("h2", null, "Current requirements"));
  const detail = el("div", "requirement-reading");
  const sectioned = new Set(spec.sections.flatMap((section) => section.requirements));
  const outside = [...spec.requirements.values()].filter((requirement) => !sectioned.has(requirement.name));

  for (const requirement of outside) page.append(requirementButton(requirement, detail));
  for (const section of spec.sections) {
    const group = el("section", "spec-section", el("h3", null, sectionTitle(section.heading)));
    for (const name of section.requirements) {
      const requirement = spec.requirements.get(name);
      if (requirement) group.append(requirementButton(requirement, detail));
    }
    page.append(group);
  }
  if (!spec.requirements.size) page.append(el("p", "empty", "No current requirements are recorded in SPEC.md."));
  page.append(detail);
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
