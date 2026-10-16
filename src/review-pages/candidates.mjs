// candidates.mjs — the candidates of a draft of requirements, as the author reviews them (MOD-review-pages, Parts): each candidate with its class, the requirement it refers to beside it, and its
// rule and check, which the author may change; and the draft and the classes as the author left them. Used by the page of a draft of the conversation (requirements-draft.mjs).
//
// Module: MOD-review-pages
//
// A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; A CONFLICT IS DECIDED BY A PERSON. Nothing is read or written here.

import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { el } from "./common.mjs";

export const inputsOf = (root, name, className) => {
  const found = [];
  (function walk(node) {
    for (const child of node.childNodes) {
      if (child.nodeType !== 1) continue;
      if (child.localName === name && child.className.split(" ").includes(className)) found.push(child);
      walk(child);
    }
  })(root);
  return found;
};

function classSelect(value) {
  const select = el("select", "class");
  for (const name of ["new", "change", "duplicate", "conflict"]) {
    const option = el("option", null, name);
    option.value = name;
    option.selected = name === value;
    select.append(option);
  }
  select.value = value;
  return select;
}

export const classOf = (candidate, classes) => classes?.find((each) => each.refs?.includes(candidate.name)) ?? {
  refs: [candidate.name], from: [candidate.passage].filter(Boolean), class: candidate.class, of: candidate.of ?? null,
};

export function candidateRows(panel, outcome, parsed, source, register, onChange) {
  const sourceText = (item) => {
    const id = item.split(",")[0].trim();
    const entry = register.find((each) => each.id === id);
    return `${item} (${entry?.fields.authority ?? "authority not registered"})`;
  };
  const candidates = Array.isArray(outcome.draft?.candidates) ? outcome.draft.candidates : [];
  for (const candidate of candidates) {
    const decided = classOf(candidate, outcome.classes);
    const select = classSelect(decided.class);
    const of = el("input", "of");
    of.value = decided.of ?? "";
    const rule = el("textarea", "candidate-rule");
    rule.value = candidate.rule ?? "";
    const check = el("textarea", "candidate-check");
    check.value = candidate.check ?? "";
    const current = el("section", "current-requirement"), difference = el("section", "candidate-difference");
    const showCurrent = () => {
      const held = parsed.requirements.get(of.value.trim());
      current.replaceChildren(el("h5", null, "Current requirement"), held
        ? renderArtifact(`**${held.name}**\n\n${held.rule ?? ""}\n\n*Sources:* ${held.sources.map(sourceText).join("; ")}\n\n*Check:* ${held.check ?? ""}`)
        : el("p", "none", "This candidate refers to no current requirement."));
      difference.replaceChildren(el("h5", null, "Difference"), showDifference(held?.rule ?? "", rule.value));
    };
    const changed = () => { showCurrent(); onChange(); };
    select.addEventListener("change", changed);
    of.addEventListener("input", changed);
    rule.addEventListener("input", changed);
    check.addEventListener("input", onChange);
    showCurrent();
    const item = el("li", "candidate", el("section", "candidate-draft", el("span", "candidate-name", candidate.name),
      el("label", null, " Class ", select), el("label", null, " of ", of), el("label", null, "Rule", rule),
      el("label", null, "Check", check), el("p", "candidate-source", `Source: ${sourceText(candidate.source ?? source)}.`)), current, difference);
    item.setAttribute("data-name", candidate.name);
    panel.append(item);
  }
}

export function editedResult(panel, outcome) {
  const candidates = (outcome.draft?.candidates ?? []).map((candidate) => {
    const item = inputsOf(panel, "li", "candidate").find((node) => node.getAttribute("data-name") === candidate.name);
    const class_ = inputsOf(item, "select", "class")[0].value;
    const of = inputsOf(item, "input", "of")[0].value.trim();
    const edited = { ...candidate, rule: inputsOf(item, "textarea", "candidate-rule")[0].value,
      check: inputsOf(item, "textarea", "candidate-check")[0].value, class: class_ };
    if (of) edited.of = of;
    else delete edited.of;
    return edited;
  });
  const classes = candidates.map((candidate) => {
    const item = inputsOf(panel, "li", "candidate").find((node) => node.getAttribute("data-name") === candidate.name);
    const before = classOf(candidate, outcome.classes);
    return { refs: [candidate.name], from: before.from ?? [], class: inputsOf(item, "select", "class")[0].value,
      of: inputsOf(item, "input", "of")[0].value.trim() || null };
  });
  return { draft: { candidates }, classes };
}
