// The route `process` — How this product is developed (MOD-implementation-pages, docs/architecture/
// MOD-implementation-pages.md; Interfaces: view, route process; UC-002). It shows the five catalogue models in their two
// groups, each with what its `about` holds (step 2); the declared model's roles, each with the participants that hold
// every capability it needs and where they process data — only those offered, through MOD-participant-list's `eligible`
// —, a role no participant can hold named by its missing capability (4b); phases, transitions, verification pairs, gates
// and branches; the available practices; what the product's process requirements add, or that it has none (7a); the
// Definition of Done; all beside a form from the declaration's schema (`MOD-product-process.declarationSchema`), with
// each finding of `declarationFindings` beside its field — among them a holder at a place a linked source does not
// permit (4c), the linked sources read with `MOD-source-register.sourceSchemas` —; and *Save*, offered only without an
// error, which writes the product's `docs/process.md` with `saveFile` as the person's own commit, naming the declared
// model's version by the commit of the instance its catalogue was read at. When the author selects another model than
// the declared one, the kinds of artifact the declared model's phases produce and the selected one's do not are listed,
// none of them deleted (3b).
//
// Two gaps ITM-221 left in `schemaForm` are closed here, at the caller: it hands over a document whose edited section
// keeps the rows it was read with, not those of the text just typed — so, before `declarationFindings` judges the
// document and before `saveFile` writes it, it is written with `writeDocument` and read back with `readDocument`
// (`reread`, below); and its one Save is offered only once the form is connected and its own queued focus runs — so the
// route calls `schemaForm` and inserts what it returns into the page in the one turn of that call, never after an
// `await`.
//
// ITM-240 closes six gaps ITM-223's system and release tests of UC-002 found (F1 to F6, below), each at this route: F1
// at the process-vs-rules table (`shownBefore`); F2 and F3 beside phases and branches (`renderPanels`'s phasesPanel,
// `branchEndGate`); F4 beside practices (`practicesWithAdds`, read with the catalogue's own `modelSchema.practice`);
// F5 beside a process requirement's gate (`renderPanels`'s requirementsPanel); F6 at a role's missing-capability link
// (`roleInfo`).
//
// Not part of this item: the comparison of two versions of the declared model when the catalogue's version differs from
// the one the declaration names (UC-031 6a) — this route always reads the catalogue at the instance's current commit —,
// and how the dashboard reaches this route.
//
// Module: MOD-implementation-pages

import { explain, schemaForm } from "../site-frame/index.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { catalogue, modelSchema } from "../model-catalogue/index.mjs";
import { participantSchema, participantsOf, eligible } from "../participant-list/index.mjs";
import { sourceSchemas } from "../source-register/index.mjs";
import { declarationSchema, declarationFindings, workflowOf } from "../product-process/index.mjs";
import { saveFile } from "../artifact-edits/index.mjs";

const DECLARATION_PATH = "docs/process.md";
const PARTICIPANTS_PATH = "docs/participants.md";
const SOURCES_PATH = "docs/sources.md";
const SPEC_PATH = "SPEC.md";

// F1 (UC-002 step 1): whether this module has already rendered the process-vs-rules table once before. A plain
// module-level flag — in memory for this page's lifetime only, never written to the browser's storage, so it is no
// setting: it starts false again on every fresh load of this module and nothing here ever reads or writes a store for
// it.
let shownBefore = false;

// The book's five models in the two groups UC-002 step 2 names them in.
const GROUPS = [
  { label: "Plan-driven", names: ["waterfall", "v-model", "reuse-oriented"] },
  { label: "Agile", names: ["scrum", "kanban"] },
];

// A plain element with a class and children — the module runs in a browser, where `document` is global.
function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

// The read-write round trip of the gap ITM-221 left: a document a form hands over keeps an edited section's rows as
// they stood when it was opened, not those of the text just typed. Writing it and reading it again reparses them, so
// that declarationFindings and saveFile judge and write the rows the person now sees.
const reread = (schema, path, document) => readDocument(schema, path, writeDocument(schema, document));

// The model of `models` whose path is `file`, or null.
const modelAt = (models, file) => models.find((model) => model.path === file) ?? null;

// F3 (UC-002 step 5): the model's own gate at the end of a branch given to `at` — a phase, or the sprint (any branch
// key that names no phase of `workflow`): for a phase, the gate that leaves it; for the sprint, the gate back to the
// model's first phase. "The model's own" excludes a gate added by a process requirement or by a practice, since those
// are not what a phase's or a sprint's branch merges into. Null where the model has no such gate.
function branchEndGate(workflow, at) {
  const ownGates = workflow.gates.filter((gate) => !gate.addedBy && !gate.practice);
  const isPhase = workflow.phases.some((phase) => phase.name === at);
  return ownGates.find((gate) => (isPhase ? gate.from === at : gate.to === workflow.phases[0]?.name)) ?? null;
}

// The elements below `root`, in tree order, that `match` accepts — node has no querySelector, and nothing else here
// needs one.
function elementsOf(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}

// The input of the form's field for `key`.
const fieldInput = (form, key) => elementsOf(form, (node) => node.getAttribute("data-key") === key)[0]
  ?.getElementsByTagName("input")[0];

// Sets a field's value as a person's typing does: the value, then the input event the field listens for.
function setField(form, key, value) {
  const input = fieldInput(form, key);
  input.value = value;
  input.dispatchEvent(new Event("input"));
}

export const route = {
  name: "process",
  entry: "implementation",
  title: "How this product is developed",

  async render(target, context) {
    const { instance, product } = context;

    const [productInfo, instanceInfo] = await Promise.all([product.host.repositoryInfo(), instance.host.repositoryInfo()]);
    const [productSnapshot, instanceSnapshot] = await Promise.all([
      product.host.readSnapshot(productInfo.defaultBranch), instance.host.readSnapshot(instanceInfo.defaultBranch)]);

    const [declarationText, participantsText, sourcesText, instanceSpecText, cat] = await Promise.all([
      productSnapshot.read(DECLARATION_PATH), instanceSnapshot.read(PARTICIPANTS_PATH),
      productSnapshot.read(SOURCES_PATH), instanceSnapshot.read(SPEC_PATH), catalogue(instanceSnapshot)]);

    const openedDeclaration = declarationText != null ? readDocument(declarationSchema, DECLARATION_PATH, declarationText) : null;
    let openedBlob = declarationText != null ? productSnapshot.blob(DECLARATION_PATH) : null;
    // A real Document for workflowOf even for a product without a declaration yet: readDocument never throws on the
    // content, so the empty text reads as a document with no fields and no sections.
    const declarationForWorkflow = readDocument(declarationSchema, DECLARATION_PATH, declarationText ?? "");

    const participants = readDocument(participantSchema(), PARTICIPANTS_PATH, participantsText ?? "");
    const allParticipants = participantsOf(participants);

    const { entry: sourceEntrySchema, links: linksSchema } = sourceSchemas();
    const linksDocument = sourcesText != null ? readDocument(linksSchema, SOURCES_PATH, sourcesText) : null;
    const linkedRows = linksDocument?.sections[0]?.rows ?? [];
    const sourceDocuments = (await Promise.all(linkedRows.map(async ({ cells }) => {
      const path = `docs/sources/${cells.Source}.md`;
      const text = await instanceSnapshot.read(path);
      return text != null ? readDocument(sourceEntrySchema, path, text) : null;
    }))).filter((entry) => entry !== null);

    const instanceSpec = instanceSpecText ?? "";
    const declaredModel = openedDeclaration ? modelAt(cat.models, String(openedDeclaration.fields.model_file ?? "")) : null;

    // F4 (step 6): each catalogue practice's own "## Adds", read from its file in the instance's snapshot — the path
    // `catalogue` names it at, shipped or the instance's own — with the catalogue's own practice schema. A practice
    // whose file this instance's snapshot does not hold (never so for a shipped one, since the instance is the
    // repository that ships them) adds "": nothing crashes, and nothing is shown for it.
    const practicesWithAdds = await Promise.all(cat.practices.map(async (practice) => {
      const text = await instanceSnapshot.read(practice.path);
      const adds = text != null
        ? readDocument(modelSchema.practice, practice.path, text).sections.find((section) => section.heading === "## Adds")?.text ?? ""
        : "";
      return { ...practice, adds };
    }));

    target.replaceChildren();
    const page = el("article", "process-page");
    target.append(page);

    // F1 (step 1): the process-vs-rules table (explain's own "process-model" topic) unfolded this module's first
    // render, folded at every later one — `shownBefore`, in memory only.
    const processVsRules = explain("process-model");
    if (!shownBefore) processVsRules.setAttribute("open", "");
    shownBefore = true;

    // Step 2/3: the catalogue's models, in their two groups, each with its About, and a card to choose it.
    const lost = el("p", "lost-artifacts");
    const modelsSection = el("section", "models", el("h2", null, "Process model"),
      el("div", "process-vs-rules", processVsRules), lost);
    for (const group of GROUPS) {
      const groupModels = group.names.map((name) => cat.models.find((model) => model.name === name)).filter(Boolean);
      const groupEl = el("div", "model-group", el("h3", null, group.label),
        ...groupModels.map((model) => modelCard(model)));
      modelsSection.append(groupEl);
    }
    // The instance's own models, adapted from a shipped one, offered beside the shipped five.
    const own = cat.models.filter((model) => !GROUPS.some((group) => group.names.includes(model.name)));
    if (own.length) modelsSection.append(el("div", "model-group", el("h3", null, "This instance"), ...own.map((model) => modelCard(model))));
    page.append(modelsSection);

    // The form from the declaration's schema — findings beside its fields, Save only without an error.
    const form = schemaForm(declarationSchema, openedDeclaration, {
      onSave: async (edited) => {
        const withVersion = { ...edited, fields: { ...edited.fields, model_version: instanceSnapshot.commit } };
        const text = writeDocument(declarationSchema, withVersion);
        const result = await saveFile(product.host, { path: DECLARATION_PATH, text, openedBlob });
        if (result.refused) {
          notice.textContent = "This declaration changed meanwhile; your edit is kept here, unsaved.";
          return;
        }
        notice.textContent = "";
        openedBlob = result.blob;
      },
      // writeDocument, inside reread, refuses a document missing a required value (model among them, before a model is
      // picked): documentFindings, which schemaForm always runs beside this, already names that finding on its own
      // field, so declarationFindings — which needs a document at least that complete — adds nothing here instead of
      // throwing through the form's one call to both.
      extraChecks: (live) => {
        try {
          return declarationFindings(reread(declarationSchema, DECLARATION_PATH, live), cat, participants, sourceDocuments, instanceSpec);
        } catch {
          return [];
        }
      },
    });
    // Inserted in the same turn schemaForm returns it, so its queued focus finds the form already in the page.
    page.append(form);

    const notice = el("p", "save-notice");
    form.append(notice);
    const extra = el("div", "workflow-extra");
    form.append(extra);

    function modelCard(model) {
      const card = el("div", "model-card",
        el("h4", null, model.name),
        el("p", null, `manages: ${model.about?.manages ?? ""}`),
        el("p", null, `accepts: ${model.about?.accepts ?? ""}`),
        el("p", null, `example: ${model.about?.example ?? ""}`),
        el("p", null, `chapter: ${model.about?.chapter ?? ""}`));
      card.setAttribute("data-model", model.name);
      const choose = el("button", null, "Choose");
      choose.type = "button";
      choose.addEventListener("click", () => pick(model));
      card.append(choose);
      return card;
    }

    // The author selects a model (step 3): its name, file and the version — the commit the catalogue was read at — go
    // into the form's fields, as a person's typing does, so the rest of the page answers through the same reactivity;
    // the workflow panels and the lost-artifacts notice (3b) are drawn for it.
    function pick(model) {
      setField(form, "model", model.name);
      setField(form, "model_file", model.path);
      setField(form, "model_version", instanceSnapshot.commit);
      renderPanels(model);
      lost.textContent = lostArtifacts(declaredModel, model);
    }

    renderPanels(declaredModel);

    // The panels beside the form that follow the picked model alone: the roles' eligible participants (step 4, 4b),
    // phases/transitions/pairs/gates and branches (step 5), the available practices (step 6), what the process
    // requirements add or that there are none (step 7, 7a), and the Definition of Done's preset rules (step 8).
    function renderPanels(model) {
      extra.replaceChildren();
      if (!model) return;
      const workflow = workflowOf(declarationForWorkflow, model, [], instanceSpec);

      const rolesPanel = el("section", "roles-panel", el("h3", null, "Roles"), explain("roles-and-participants"));
      for (const role of workflow.roles) rolesPanel.append(roleInfo(role));
      extra.append(rolesPanel);

      const phasesPanel = el("section", "phases-panel", el("h3", null, "Phases and gates"),
        explain("phases-and-gates"), explain("branch-of-its-own"),
        el("ul", "phases", ...workflow.phases.map((phase) =>
          el("li", null, `${phase.name} (${phase.role}) → ${phase.produces.join(", ")}`))),
        // F2: the transitions between the phases, and which phases pair for verification, beside the phases and gates.
        el("ul", "transitions", ...workflow.transitions.map((transition) =>
          el("li", null, `${transition.from} → ${transition.to} (${transition.kind})`))),
        el("ul", "verification-pairs", ...workflow.pairs.map((pair) =>
          el("li", null, `${pair.phase} checked by ${pair.checkedBy}`))),
        el("ul", "gates", ...workflow.gates.filter((gate) => !gate.addedBy).map((gate) =>
          el("li", null, `${gate.name}: ${gate.artifacts} — ${gate.condition} — decided by ${gate.decider}`))),
        // F3: beside a branch, the gate at its end — merging it into the default branch (`WORK MERGES INTO THE
        // DEFAULT BRANCH UNLESS A BRANCH IS SET`), decided by the model's own gate that leaves the phase, or, for the
        // sprint, the model's own gate back to its first phase.
        el("ul", "branches", ...Object.entries(workflow.branches).map(([at, branch]) => {
          const gate = branchEndGate(workflow, at);
          const end = gate
            ? ` — merging it into the default branch is the gate at its end: ${gate.from} → ${gate.to}, ${gate.artifacts} — ${gate.condition}, decided by ${gate.decider}`
            : "";
          return el("li", null, `${at}: ${branch}${end}`);
        })));
      extra.append(phasesPanel);

      // F4: each practice beside what it adds, read from its file with the catalogue's practice schema.
      const practicesPanel = el("section", "practices-panel", el("h3", null, "Practices"), explain("practices"),
        el("ul", "practices-available", ...practicesWithAdds.map((practice) =>
          el("li", "practice", el("div", null, `${practice.name} (fits: ${practice.fits.join(", ")})`),
            el("div", "practice-adds", practice.adds)))));
      extra.append(practicesPanel);

      // F5: a gate a process requirement adds, with the two phases it stands between.
      const added = workflow.gates.filter((gate) => gate.addedBy);
      const requirementsPanel = el("section", "process-requirements", el("h3", null, "Process requirements"),
        explain("process-requirements"),
        added.length
          ? el("ul", null, ...added.map((gate) =>
            el("li", null, `${gate.name}: ${gate.from} → ${gate.to} — ${gate.artifacts} (${gate.addedBy.source ?? "no such requirement"})`)))
          : el("p", null, "This product has no process requirements yet."));
      extra.append(requirementsPanel);

      const donePanel = el("section", "done-panel", el("h3", null, "Definition of Done"), explain("definition-of-done"),
        el("ul", "done-rules", ...workflow.done.map((rule) => el("li", null, rule))));
      extra.append(donePanel);
    }

    // A role's capabilities and who may hold it, and the participants `eligible` offers for it — each with its place
    // (step 4) —, or, where none is eligible, the capabilities no participant has at all (4b), with a link to the
    // instance's participants.
    function roleInfo(role) {
      const block = el("div", "role-info", el("strong", null, `${role.name} (${role.filledBy})`),
        el("p", null, `needs: ${role.capabilities.join(", ")}`));
      block.setAttribute("data-role", role.name);
      const { eligible: offered } = eligible(allParticipants, { capabilities: role.capabilities });
      if (offered.length) {
        block.append(el("p", "eligible", `offered: ${offered.map((p) => `${p.name} (${p.place ?? "—"})`).join(", ")}`));
      } else {
        const missing = role.capabilities.filter((capability) => !allParticipants.some((p) => p.capabilities?.includes(capability)));
        const link = el("a", null, "the instance's participants");
        // F6: UC-017's own view, #participants — not #settings/participants, the settings view, which has no section
        // for participants.
        link.href = "#participants";
        block.append(el("p", "missing-capability", `no participant has: ${(missing.length ? missing : role.capabilities).join(", ")} — add one under `, link));
      }
      return block;
    }
  },
};

// The kinds of artifact `before`'s phases produce that `after`'s do not (3b); "" where there is nothing to lose,
// including while no model was declared yet.
function lostArtifacts(before, after) {
  if (!before || !after || before.name === after.name) return "";
  const had = new Set(before.phases.flatMap((phase) => phase.produces));
  const now = new Set(after.phases.flatMap((phase) => phase.produces));
  const missing = [...had].filter((kind) => !now.has(kind));
  if (!missing.length) return "";
  return `${before.name} produced ${missing.join(", ")}, which ${after.name} does not; nothing is deleted.`;
}
