// MOD-settings-pages' participants route (UC-017): the instance's docs/participants.md — the team, each a person or an agent, an agent with its
// model — as a member list; *+ Add participant* and *Change* take a name, *person* or *agent*, and for an agent its model, selected from the
// models this browser's connections offer (MOD-prompt-bar's endpointsOffered and sessionsOffered), each named with the connections that offer it
// and their processing places. Save commits the register through saveFile as the person's commit; a change to a participant that products use
// names those products and roles, with the assignments the change makes invalid.
//
// Module: MOD-settings-pages

import { saveFile } from "../artifact-edits/index.mjs";
import { readSetting, secretValues } from "../browser-store/index.mjs";
import { documentFindings, readDocument, writeDocument } from "../documents/index.mjs";
import { participantSchema } from "../participant-list/index.mjs";
import { declarationSchema, roleAssignmentFindings, roleAssignmentSchema, productWorkflow } from "../product-process/index.mjs";
import { ciAgentsOffered, endpointsOffered, sessionsOffered } from "../prompt-bar/index.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { sourceSchemas } from "../source-register/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { formatFinding } from "../text-tools/index.mjs";
import { credentialsFor } from "./products.mjs";
import { heads } from "./routes.mjs";

const PATH = "docs/participants.md";
const DECLARATION = "docs/process.md";
const SOURCE_PATH = /^docs\/sources\/SRC-[^/]+\.md$/;
const ASSIGNMENT_FILE = /^docs\/role-assignments\/([^/]+)\.md$/;
const TYPES = ["person", "agent"];
const EMPTY = "# Participants of this instance\n\n| Name | Type | Model |\n|---|---|---|\n";

const text = (value) => (value === undefined || value === null || value === "—" ? "" : String(value));
const listedValues = (value) => (Array.isArray(value) ? value.map(text).filter(Boolean)
  : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const assignmentName = (path) => ASSIGNMENT_FILE.exec(text(path))?.[1] ?? text(path);

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function option(value, label = value) {
  const node = el("option", null, label);
  node.value = value;
  return node;
}

function button(className, label, onClick) {
  const node = el("button", className, label);
  node.type = "button";
  node.addEventListener("click", onClick);
  return node;
}

const participantText = (snapshotText) => (typeof snapshotText === "string" && snapshotText.trim() ? snapshotText : EMPTY);
const participantDocument = (register) => readDocument(participantSchema(), PATH, participantText(register));
const participantRows = (register) => participantDocument(register).sections.flatMap((section) => section.rows ?? []);

async function openedRegister(host) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const register = participantText(await snapshot.read(PATH));
  const sources = [];
  const { entry } = sourceSchemas();
  for (const path of (snapshot.paths ?? []).filter((each) => SOURCE_PATH.test(each)).sort()) {
    const sourceText = await snapshot.read(path);
    if (sourceText) sources.push(readDocument(entry, path, sourceText));
  }
  return { register, openedBlob: snapshot.blob(PATH), sources, snapshot };
}

// The register's line of one row: Name, Type, Model — a person's Model `—`.
const rowLine = ({ name, type, model }) => `| ${name} | ${type} | ${type === "person" || !model ? "—" : model} |`;

// The register with the row of `originalName` replaced by `row`, or with `row` added where no row has that name.
function withRow(register, originalName, row) {
  const base = participantText(register).replace(/\s*$/, "");
  const found = originalName ? participantRows(base).find((candidate) => text(candidate.cells.Name) === originalName) : undefined;
  if (!found) return `${base}\n${rowLine(row)}\n`;
  const lines = base.split("\n");
  lines[found.line - 1] = rowLine(row);
  return `${lines.join("\n")}\n`;
}

// The models this browser's connections offer, in the order of the connections, each with every connection that offers it.
function modelsOffered(connections) {
  const models = new Map();
  for (const connection of connections) {
    if (!models.has(connection.model)) models.set(connection.model, []);
    models.get(connection.model).push(connection);
  }
  return models;
}

const connectionsNamed = (offering) => offering.map((each) => `${each.name} (${each.place})`).join(", ");

function productHostOf(context, web) {
  const injected = context.productHosts instanceof Map ? context.productHosts.get(web) : context.productHosts?.[web];
  if (injected) return injected;
  const address = parseAddress(web);
  return connect(address, { ...credentialsFor(context.store, address), secrets: secretValues(context.store) });
}

function browserProducts(store) {
  const products = readSetting(store, "products");
  return Array.isArray(products) ? products.filter((product) => typeof product === "string" && product.trim()) : [];
}

function rolesNaming(assignment, participantName) {
  return assignment.sections.flatMap((section) => section.rows ?? []).filter((row) => listedValues(row.cells.Participants).includes(participantName))
    .map((row) => ({ assignment: assignmentName(assignment.path), path: assignment.path, role: text(row.cells.Role) }));
}

async function productBasisOf(context, web, specText) {
  const host = productHostOf(context, web);
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const declarationText = await snapshot.read(DECLARATION);
  if (!declarationText) return null;
  const declaration = readDocument(declarationSchema, DECLARATION, declarationText);
  // The product's workflow as it declared it: the model at the instance's commit its declaration names.
  const workflow = await productWorkflow(declaration, (commit) => context.instance.host.readSnapshot(commit), specText ?? "");
  if (workflow === null) return null;
  const assignments = await Promise.all((snapshot.paths ?? []).filter((path) => ASSIGNMENT_FILE.test(path)).sort()
    .map(async (path) => readDocument(roleAssignmentSchema, path, await snapshot.read(path))));
  return { web, workflow, assignments };
}

async function productUseBasis(context, opened) {
  const products = browserProducts(context.store);
  if (!products.length) return [];
  const specText = await opened.snapshot.read("SPEC.md");
  const basis = [];
  for (const web of products) {
    try {
      const product = await productBasisOf(context, web, specText);
      if (product) basis.push(product);
    } catch {
      // A product that cannot currently be read cannot prove that it names this participant.
    }
  }
  return basis;
}

// The products and roles that hold the participant, with the findings of their assignments under the changed register that name it or that the change makes —
// an agent in a role that needs a person (UC-017 4a). `opened` is the register as it was read.
function productUseOf(products, participantName, opened, register, connections, sources) {
  return products.map(({ web, workflow, assignments }) => {
    const roles = assignments.flatMap((assignment) => rolesNaming(assignment, participantName));
    if (!roles.length) return null;
    const usedPaths = new Set(roles.map((role) => role.path));
    const said = (found) => `${found.artifact} ${found.line} ${found.what}`;
    const before = new Set(roleAssignmentFindings(assignments, workflow, participantDocument(opened), connections, sources).map(said));
    const findings = roleAssignmentFindings(assignments, workflow, participantDocument(register), connections, sources)
      .filter((found) => usedPaths.has(found.artifact) && (text(found.what).includes(participantName) || !before.has(said(found))));
    return { web, roles, findings };
  }).filter(Boolean);
}

function productUseView(uses) {
  if (!uses.length) return [];
  return [el("section", "participant-product-use", el("h4", null, "Products using this participant"), ...uses.map((use) =>
    el("div", "participant-product", el("p", null, use.web),
      el("ul", "participant-product-roles", ...use.roles.map((role) => el("li", null, `${role.assignment}: ${role.role} (${role.path})`))),
      ...(use.findings.length ? [el("ul", "participant-product-findings", ...use.findings.map((found) =>
        el("li", found.kind === "error" ? "warn" : "muted", `${found.artifact}: ${found.what} — ${found.fix}`)))] : []))))];
}

export const route = {
  ...heads.participants,
  async render(target, context, params = {}) {
    let opened;
    try { opened = await openedRegister(context.instance.host); } catch (error) {
      target.replaceChildren(el("section", "head", el("h2", null, "Participants")), el("p", "participants-unreadable", `The participants register could not be read: ${error?.message ?? error}.`));
      return;
    }
    const connections = [...endpointsOffered(context.store), ...await sessionsOffered(context.store), ...ciAgentsOffered(context.store)];
    const models = modelsOffered(connections);
    const productUse = productUseBasis(context, opened).catch(() => []);

    const list = el("ul", "participants-list");
    const panel = el("section", "participants-add-panel panel");
    panel.hidden = true;
    const result = el("p", "participants-result");

    // One line per member: its name and type, an agent's model with the connections of this browser that offer it.
    function renderList() {
      const rows = participantRows(opened.register);
      list.replaceChildren(...(rows.length ? rows.map(({ cells }) => {
        const name = text(cells.Name), type = text(cells.Type), model = text(cells.Model);
        const offering = models.get(model) ?? [];
        const about = type === "agent" ? `; model: ${model}; ${offering.length ? `on ${connectionsNamed(offering)}` : "no connection of this browser offers it"}` : "";
        return el("li", "participants-row", `${name} — ${type}${about} `, button("participant-change btn small", `Change ${name}`, () => open(name)));
      }) : [el("li", null, "No participants are registered yet.")]));
    }

    // The form of one participant: `editing` the name of the row it changes, or null for a new one; `values` its name, type and model.
    async function open(editing, values = null) {
      const row = editing ? participantRows(opened.register).find((candidate) => text(candidate.cells.Name) === editing) : undefined;
      const state = values ?? { name: text(row?.cells.Name), type: text(row?.cells.Type), model: text(row?.cells.Model) };
      const name = el("input", "participant-name");
      name.value = state.name;
      name.placeholder = "participant-name";
      name.autocomplete = "off";
      name.spellcheck = false;
      const type = el("select", "participant-type", option("", "Choose person or agent"), ...TYPES.map((each) => option(each)));
      type.value = TYPES.includes(state.type) ? state.type : "";
      const model = el("select", "participant-model");
      const modelBox = el("div", "participant-model-box");
      const findings = el("ul", "participant-findings");
      const useBox = el("div", "participant-product-use-box");
      const save = button("participant-save btn primary", "Save", () => commit());

      function fillModels() {
        const kept = state.model && !models.has(state.model) ? [option(state.model, `${state.model} — no connection of this browser offers it`)] : [];
        model.replaceChildren(option("", "Choose a model"), ...[...models].map(([each, offering]) => option(each, `${each} — ${connectionsNamed(offering)}`)), ...kept);
        model.value = state.model;
        const missing = connections.length ? [] : [el("p", "participant-no-connection",
          "No connection of this browser offers a model yet: configure a model endpoint or a Bridge's coding agent first. ",
          button("participant-go-endpoints btn small", "Endpoints", () => context.go("endpoints", {})), " ",
          button("participant-go-bridge btn small", "Bridges", () => context.go("bridge", {})))];
        modelBox.replaceChildren(...(state.type === "agent" ? [el("p", null, el("label", null, "Model ", model)), ...missing] : []));
      }

      // The register this form would commit, and its findings: the schema's errors block Save.
      function drafted() {
        const register = withRow(opened.register, editing, { name: state.name.trim(), type: state.type, model: state.model });
        const document = readDocument(participantSchema(), PATH, register);
        const errors = documentFindings(participantSchema(), document).filter((each) => each.kind === "error");
        const twice = participantRows(register).filter((each) => text(each.cells.Name) === state.name.trim()).length > 1;
        const named = state.name.trim() ? [] : ["Enter the participant's name."];
        return { register, problems: [...named, ...(twice ? [`${state.name.trim()} is listed already.`] : []), ...errors.map(formatFinding)] };
      }

      async function refresh() {
        fillModels();
        const { register, problems } = drafted();
        findings.replaceChildren(...problems.map((each) => el("li", "warn", each)));
        save.disabled = problems.length > 0 || !state.type;
        if (editing) useBox.replaceChildren(...productUseView(productUseOf(await productUse, editing, opened.register, register, connections, opened.sources)));
      }

      async function commit() {
        const { register, problems } = drafted();
        if (problems.length || !state.type) return;
        const textToSave = writeDocument(participantSchema(), readDocument(participantSchema(), PATH, register));
        const saved = await saveFile(context.instance.host, { path: PATH, text: textToSave, openedBlob: opened.openedBlob, openedId: null });
        if (saved.refused === "changed meanwhile") {
          result.textContent = "Nothing was saved: the participants register changed meanwhile. Reload the page and try again.";
          return;
        }
        if (saved.refused === "identifier changed") {
          result.textContent = "Nothing was saved: the participants register changed its identifier.";
          return;
        }
        opened = { ...opened, register: textToSave, openedBlob: saved.blob };
        renderList();
        panel.hidden = true;
        result.textContent = "Saved.";
      }

      name.addEventListener("input", () => { state.name = name.value; refresh(); });
      type.addEventListener("change", () => { state.type = type.value; if (state.type !== "agent") state.model = ""; refresh(); });
      model.addEventListener("change", () => { state.model = model.value; refresh(); });

      result.textContent = "";
      panel.hidden = false;
      panel.replaceChildren(el("h3", null, editing ? `Change ${editing}` : "Add participant"),
        el("p", null, el("label", null, "Type ", type)), explain("participant-person-or-agent"),
        el("p", null, el("label", null, "Name ", name)), modelBox, findings, el("p", null, save), useBox);
      await refresh();
    }

    renderList();
    target.replaceChildren(el("section", "head", el("h2", null, "Participants")),
      el("p", null, button("participants-add btn primary", "+ Add participant", () => open(null))), panel, result, list);

    // Opened with the parameters `type` and `model` (a resource's *Add as participant*, UC-040 2a): the form of a new participant of that type,
    // with that model selected.
    if (TYPES.includes(params.type)) await open(null, { name: "", type: params.type, model: params.type === "agent" ? text(params.model) : "" });
  },
};
