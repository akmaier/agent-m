// requirements-prompt.mjs — changing one requirement or a named group by prompt (MOD-review-pages, UC-019).

import { provenanceLines } from "../job-runner/index.mjs";
import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { personSource } from "../source-register/index.mjs";
import { entrySections, proposeSection } from "../spec-changes/index.mjs";
import { parseSpec, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, button, link, problem, TOKEN_STEP } from "./common.mjs";
import { byClassChecked, loadStage, panelOf, participantList, refineOnTab } from "./jobs.mjs";
import { sourcesOf } from "./spec-entries.mjs";
import { roundsSection } from "./sections.mjs";

const SPEC = "SPEC.md";

const inputsOf = (root, name, className) => {
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

function namesFrom(params) {
  if (typeof params.name === "string" && params.name.trim()) return [params.name];
  try {
    const names = JSON.parse(params.requirements ?? "null");
    if (Array.isArray(names) && names.length > 0 && names.every((name) => typeof name === "string" && name.trim())) return names;
  } catch { /* the route is diagnosed below */ }
  return null;
}

function accountOf(snapshot) {
  const owner = String(snapshot.repository?.path ?? "").split("/")[0];
  if (!owner) return null;
  let server = snapshot.repository?.server === "github" ? "github.com" : null;
  try { server = new URL(snapshot.repository?.origin).host || server; } catch { /* use the canonical GitHub host above */ }
  return server ? `${server}/${owner}` : null;
}

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

const classOf = (candidate, classes) => classes?.find((each) => each.refs?.includes(candidate.name)) ?? {
  refs: [candidate.name], from: [candidate.passage].filter(Boolean), class: candidate.class, of: candidate.of ?? null,
};

function candidateRows(panel, outcome, parsed, source, register, onChange) {
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

function editedResult(panel, outcome) {
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

async function presentRequirementsPrompt(outcome, result, initialRun) {
  if (outcome.stoppedBecause === "unusable") {
    result.replaceChildren(el("p", "unusable", "The participant's answer could not be read as requirements. Nothing was written."),
      el("details", "raw", el("summary", null, "The raw answer"), el("pre", "answer", String(outcome.raw ?? ""))));
    return;
  }
  const state = { outcome, run: initialRun };
  const spec = (await initialRun.snapshot.read(SPEC)) ?? "";
  const parsed = parseSpec(spec);
  const { register } = await sourcesOf(initialRun);
  const opened = new Map();
  for (const section of parsed.sections) opened.set(section.heading, await blobSha(sectionText(spec, section.heading)));

  async function draw() {
    const panel = el("section", "requirements-result", el("h3", null, "Requirement candidates"),
      el("p", "rounds", `Correction rounds: ${state.outcome.rounds.length}`), explain(state.run.kind.explain.draft.loop));
    const left = el("ul", "left");
    for (const finding of state.outcome.remaining) left.append(el("li", "left",
      `${finding.artifact}:${finding.line}: ${finding.kind}: ${finding.what} [${finding.rule}] - ${finding.fix}`));
    panel.append(left, roundsSection(state.outcome.rounds, state.outcome.stoppedBecause));
    const list = el("ul", "candidates"), composed = el("section", "composed-sections");
    const showComposed = () => {
      try {
        const edited = editedResult(panel, state.outcome);
        const sections = entrySections(spec, edited.draft, edited.classes, state.run.params.source);
        composed.replaceChildren(el("h4", null, "Composed sections"), ...sections.map((section) =>
          el("section", "composed-section", el("h5", null, section.anchor), showDifference(sectionText(spec, section.anchor), section.text))));
      } catch (failure) {
        composed.replaceChildren(el("p", "result problem", `${failure.name}: ${failure.message}`));
      }
    };
    candidateRows(list, state.outcome, parsed, state.run.params.source, register, showComposed);
    panel.append(list, composed);
    showComposed();

    const newer = el("div", "newer"), status = el("div", "saved");
    const save = button("btn save", "Save");
    save.addEventListener("click", async () => {
      save.disabled = true;
      newer.replaceChildren();
      status.replaceChildren();
      try {
        const edited = editedResult(panel, state.outcome);
        const sections = entrySections(spec, edited.draft, edited.classes, state.run.params.source);
        if (edited.classes.some((each) => each.class === "conflict")) throw Object.assign(new Error("Decide every conflict before saving."), { name: "ConflictUndecided" });
        const info = await state.run.host.repositoryInfo();
        const latest = await state.run.host.readSnapshot(info.defaultBranch);
        for (const section of sections) {
          const current = sectionText((await latest.read(SPEC)) ?? "", section.anchor);
          if (await blobSha(current) !== opened.get(section.anchor)) {
            newer.replaceChildren(el("p", null, "Nothing was saved: the section changed meanwhile. The draft stays beside the newer section."),
              el("pre", null, current), showDifference(current, section.text));
            return;
          }
        }
        const trailers = provenanceLines({ agentM: state.run.agentM, jobId: state.run.id, kind: state.run.jobKind,
          participant: state.run.chosen, rounds: state.outcome.rounds.length, instruction: state.run.params.instruction });
        const saved = [];
        for (const section of sections) {
          saved.push(await proposeSection(state.run.host, { target: SPEC, anchor: section.anchor, until: section.until, text: section.text,
            why: `Drafted from ${state.run.params.source} on the person's instruction.`, origin: "change by prompt on the dashboard",
            person: state.run.token?.name ?? "anonymous", openedBlob: opened.get(section.anchor), trailers }));
        }
        const fallback = saved.flatMap((each) => each.fallback ?? []);
        if (fallback.length) {
          const pages = el("ul", "pages");
          for (const page of fallback) pages.append(el("li", null, link(page.url, "github-page", `Open GitHub's page for ${page.path}`)));
          status.replaceChildren(el("p", null, "There is no token: GitHub's pages open for the proposal files."), pages);
          return;
        }
        const commit = saved.at(-1)?.commit;
        status.replaceChildren(el("p", "entry", `Saved ${sections.length} proposed section${sections.length === 1 ? "" : "s"} in `,
          link(`${state.run.snapshot.repository.web}/commit/${commit}`, null, "this commit"), "."));
      } catch (failure) {
        status.replaceChildren(el("p", "result problem", `${failure.name}: ${failure.message}`));
      } finally {
        save.disabled = false;
      }
    });

    const refinement = el("textarea", "refinement");
    const refinementStage = el("section", "refinement-stage");
    refinement.setAttribute("aria-label", "Follow-up instruction");
    const refine = button("btn refine", "Refine");
    refine.addEventListener("click", async () => {
      const instruction = String(refinement.value ?? "").trim();
      if (!instruction) { status.replaceChildren(el("p", "result problem", "Write the follow-up instruction.")); return; }
      refine.disabled = true;
      try {
        const edited = editedResult(panel, state.outcome);
        await refineOnTab(state.run, { ...state.run.params, instruction }, edited.draft, { stage: refinementStage,
          onResult: async (next) => presentRequirementsPrompt(next.outcome, result, next.run) });
        refine.disabled = false;
      } catch (failure) {
        refine.disabled = false;
        status.replaceChildren(el("p", "result problem", `${failure.name}: ${failure.message}`));
      }
    });
    panel.append(el("section", "refine", el("h4", null, "Refine"), refinement, refine, refinementStage), el("div", "actions", save), status, newer);
    result.replaceChildren(panel);
  }

  await draw();
}

/**
 * showRequirementsPrompt(where, kind, params) — the requirement prompt routes for one name or an ordered group.
 */
export async function showRequirementsPrompt(where, kind, params) {
  const { target, snapshot, token } = where;
  const names = namesFrom(params);
  target.append(el("h2", null, "Change requirements by prompt"), explain(kind.explain.instruction));
  if (!names) {
    target.append(el("p", "problem", "Name one requirement or pass the requirement group's ordered names."));
    return;
  }
  const spec = parseSpec((await snapshot.read(SPEC)) ?? "");
  const missing = names.filter((name) => !spec.requirements.has(name));
  if (missing.length) {
    target.append(el("p", "problem", `The SPEC on the default branch holds no requirement ${missing.join(", ")}.`));
    return;
  }
  let loaded, source;
  try {
    const sources = await sourcesOf(where);
    loaded = await loadStage(where, kind.prompt);
    source = personSource(sources.links, sources.register, accountOf(loaded.instanceSnapshot));
  } catch (failure) {
    target.append(problem(failure, token));
    return;
  }
  if (!source) {
    target.append(el("p", "no-source", "The author has no personal source linked to this product. ",
      link("#library", "register-source", "Register the person as a source"), " and ", link("#sources", "link-source", "link that source to the product"), "."));
    return;
  }
  const { definition, participants, instanceSnapshot, product, needs, drafters } = loaded;
  if (!drafters.length) {
    target.append(el("p", "none", "No participant of this instance can draft text. "), link("#participants", "participants-link", "Configure participants"));
    return;
  }
  const instruction = el("textarea", "instruction");
  instruction.setAttribute("aria-label", "What should change");
  const offered = participantList(drafters, product, needs);
  target.append(el("h3", null, "What should change"), instruction,
    el("section", "drafters", el("h3", null, "Drafting participant"), explain(kind.explain.draft.participant), offered));
  const stage = el("section", "stage");
  if (!token) {
    target.append(el("p", "problem", "A job is recorded and its result saved with your token. ", link(TOKEN_STEP, "token-step", "Store the token")), stage);
    return;
  }
  const prepare = button("btn prepare", "Show the run panel");
  prepare.addEventListener("click", async () => {
    stage.replaceChildren();
    const said = String(instruction.value ?? "").trim();
    const chosen = drafters.find((participant) => byClassChecked(offered, participant.name));
    if (!said) { stage.append(el("p", "problem", "Write what should change.")); return; }
    if (!chosen) { stage.append(el("p", "problem", "Choose the participant that drafts.")); return; }
    const decoratePanel = (panel, prepared) => {
      const count = prepared.parts.find((part) => part.recipe === "spec-with-queues")?.artifacts?.length ?? 0;
      panel.append(el("p", "requirements-included", `${count} existing requirements included.`),
        el("p", "use-cases-included", "0 use cases included."));
    };
    await panelOf({ ...where, definition, kind, jobKind: kind.prompt, params: { requirements: names, source, instruction: said }, worksOn: names,
      present: presentRequirementsPrompt, chosen, participants, instanceSnapshot, product, needs, stage, decoratePanel });
  });
  target.append(prepare, stage);
}
