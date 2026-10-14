// MOD-settings-pages' participants route (UC-017): the instance's docs/participants.md register in a form from
// MOD-participant-list's schema, with route-specific presets before the row is saved through saveFile as the person's commit.
// Bridge agent discovery and testing are ITM-353; changing a participant already used by products is ITM-354.
//
// Module: MOD-settings-pages

import { saveFile } from "../artifact-edits/index.mjs";
import { listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { bridgeAt, probe, settingsOf, testBridge } from "../bridge-client/index.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { permittedPlaces, sourceSchemas } from "../source-register/index.mjs";
import { explain, schemaForm } from "../site-frame/index.mjs";
import { finding } from "../text-tools/index.mjs";

const PATH = "docs/participants.md";
const SOURCE_PATH = /^docs\/sources\/SRC-[^/]+\.md$/;
const COLUMNS = ["Name", "Type", "Model", "Context", "Price", "Capabilities", "Processing place", "Route"];
const TYPES = ["person", "model endpoint", "CI agent", "CLI agent", "sandboxed agent"];
const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools", "reach the web"];
const HEADER = `| ${COLUMNS.join(" | ")} |\n|${COLUMNS.map(() => "---|").join("")}`;
const EMPTY = `# Participants of this instance\n\n${HEADER}\n`;
const PRESETS = {
  person: CAPABILITIES,
  "model endpoint": ["draft text"],
  "CI agent": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"],
  "CLI agent": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"],
  "sandboxed agent": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"],
};
const TYPE_TOPIC = {
  person: "participant-person",
  "model endpoint": "participant-model-endpoint",
  "CI agent": "participant-ci-agent",
  "CLI agent": "participant-cli-agent",
  "sandboxed agent": "participant-sandboxed-agent",
};
const BRIDGE_TYPES = new Set(["CLI agent", "sandboxed agent"]);

const unquoted = (value) => String(value ?? "").trim().replace(/^`|`$/g, "");

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

function listed(store, prefix) {
  return listSettings(store)
    .filter((setting) => setting.key.startsWith(prefix))
    .map((setting) => setting.key.slice(prefix.length));
}

const endpointNames = (store) => listed(store, "endpoint:");
const bridgeNames = (store) => listed(store, "bridge:");

function participantText(snapshotText) {
  return typeof snapshotText === "string" && snapshotText.trim() ? snapshotText : EMPTY;
}

async function openedRegister(host) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const text = participantText(await snapshot.read(PATH));
  const openedBlob = snapshot.blob(PATH);
  const sources = [];
  const { entry } = sourceSchemas();
  for (const path of (snapshot.paths ?? []).filter((each) => SOURCE_PATH.test(each)).sort()) {
    const sourceText = await snapshot.read(path);
    if (sourceText) sources.push(readDocument(entry, path, sourceText));
  }
  return { text, openedBlob, sources };
}

function cell(value) {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.map((item) => String(item).replace(/\|/g, "\\|")).join(", ");
  return String(value).replace(/\|/g, "\\|");
}

function withDraftRow(text, row) {
  const line = `| ${COLUMNS.map((column) => cell(row[column])).join(" | ")} |`;
  const base = participantText(text).replace(/\s*$/, "");
  return `${base}\n${line}\n`;
}

function firstEndpoint(store) {
  const [name] = endpointNames(store);
  return name ?? "";
}

function typePreset(type) {
  return [...(PRESETS[type] ?? [])];
}

function routeOf(type, state) {
  if (type === "person") return state.account.trim() ? `account ${state.account.trim()}` : "";
  if (type === "model endpoint") return state.endpoint.trim() ? `endpoint ${state.endpoint.trim()}` : "";
  if (type === "CI agent") {
    const workflow = state.workflow.trim(), secret = state.secret.trim();
    return workflow && secret ? `workflow ${workflow} on ${state.runner} secret ${secret}` : "";
  }
  if (BRIDGE_TYPES.has(type)) {
    const bridge = state.bridge.trim(), agent = state.agent.trim();
    return bridge && agent ? `bridge ${bridge} agent ${agent}` : "";
  }
  return "";
}

function modelOf(type, state, store) {
  if (type === "person") return "";
  if (type === "model endpoint") {
    const setting = readSetting(store, `endpoint:${state.endpoint}`);
    return typeof setting?.model === "string" && setting.model ? setting.model : state.endpointModel.trim();
  }
  return state.model.trim();
}

function rowOf(type, state, store) {
  const row = {
    Name: state.name.trim(),
    Type: type,
    Capabilities: state.capabilities,
    Route: routeOf(type, state),
  };
  if (type !== "person") {
    row.Model = modelOf(type, state, store);
    if (state.context.trim() !== "") row.Context = Number(state.context.trim());
    if (state.price.trim()) row.Price = state.price.trim();
    row["Processing place"] = state.place.trim();
  }
  return row;
}

function draftDocument(openedText, type, state, store) {
  return readDocument(participantSchema(), PATH, withDraftRow(openedText, rowOf(type, state, store)));
}

function sourcePlaceWarnings(sources) {
  return (document) => document.sections.flatMap((section) => section.rows ?? []).flatMap((row) => {
    const place = unquoted(row.cells["Processing place"]);
    const name = unquoted(row.cells.Name);
    if (!place || place === "—") return [];
    return sources.flatMap((source) => {
      const allowed = permittedPlaces(source);
      if (allowed === "any") return [];
      const ok = allowed.some((each) => each === place);
      if (ok) return [];
      const permits = allowed.length ? allowed.join(", ") : "no processing place";
      return finding({ artifact: PATH, line: row.line, kind: "warning", rule: "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS",
        what: `${source.id} permits ${permits}, not ${place} for ${name}`,
        fix: "choose an allowed processing place before assigning this participant to work with that source" });
    });
  });
}

function endpointSetting(state) {
  const name = state.endpoint.trim();
  if (!name) return null;
  const setting = { url: state.endpointUrl.trim(), kind: state.endpointKind, model: state.endpointModel.trim() };
  const key = state.endpointKey.trim();
  if (key) setting.key = key;
  return { key: `endpoint:${name}`, setting };
}

function inlineEndpointChecks(type, state) {
  if (type !== "model endpoint" || !state.inlineEndpoint) return [];
  const found = [];
  const add = (what, fix) => found.push(finding({ artifact: PATH, line: 1, kind: "error", rule: "CONFIGURATION LIVES IN THE BROWSER", what, fix }));
  if (!state.endpoint.trim()) add("the inline endpoint has no name", "enter the endpoint name");
  if (!state.endpointUrl.trim()) add(`endpoint ${state.endpoint.trim() || "the inline endpoint"} has no URL`, "enter the endpoint URL");
  if (!state.endpointModel.trim()) add(`endpoint ${state.endpoint.trim() || "the inline endpoint"} has no model`, "enter the endpoint model");
  return found;
}

function agentTestChecks(type, state) {
  if (!BRIDGE_TYPES.has(type) || state.agentTest?.ok !== false || state.saveUntested) return [];
  return [finding({ artifact: PATH, line: 1, kind: "error", rule: "ONE CLICK PER DECISION",
    what: `the test of ${state.agent || "the agent"} through Bridge ${state.bridge || "the chosen Bridge"} failed`,
    fix: "fix the Bridge or choose Save untested before saving this participant" })];
}

function bridgeSettingsOf(store, name) {
  const entry = readSetting(store, `bridge:${name}`);
  if (!entry || typeof entry !== "object") throw new Error(`This browser does not keep Bridge ${name}.`);
  return settingsOf({ name, ...entry }, readSetting(store, "jump-host"));
}

function bridgeFailureText(error) {
  if (error?.name === "TokenMissing") return "The Bridge has no pairing token.";
  if (error?.name === "TokenRefused") return "The Bridge refused its pairing token.";
  if (error?.name === "JumpHostMissing") return error.message;
  if (error?.name === "JumpHostLoginRefused") return "The jump host refused its login.";
  if (error?.name === "Timeout") return "The Bridge request timed out.";
  if (error?.name === "NoAnswer") return `${error.message} Likely: ${error.likely?.join(", ") ?? "not running or wrong address"}.`;
  if (error?.name === "BridgeFailed") return `The Bridge refused the request: ${error.message}`;
  return `The Bridge could not be reached: ${error?.message ?? error}.`;
}

function renderList(box, text) {
  const participants = participantsOf(readDocument(participantSchema(), PATH, participantText(text)));
  box.replaceChildren(...(participants.length ? participants.map((participant) =>
    el("li", "participants-row", `${participant.name} — ${participant.type}; capabilities: ${participant.capabilities?.join(", ") ?? "none"}; `
      + `place: ${participant.place ?? "—"}; route: ${participant.route}`)) : [el("li", null, "No participants are registered yet.")]));
}

function control(label, input) {
  return el("p", null, el("label", null, label, " ", input));
}

export const route = {
  name: "participants",
  entry: "settings",
  title: "Participants",
  async render(target, context) {
    let opened;
    try { opened = await openedRegister(context.instance.host); } catch (error) {
      target.replaceChildren(el("h2", null, "Participants"), el("p", "participants-unreadable", `The participants register could not be read: ${error?.message ?? error}.`));
      return;
    }

    const list = el("ul", "participants-list");
    renderList(list, opened.text);

    const add = el("button", "participants-add btn primary", "+ Add participant");
    const panel = el("section", "participants-add-panel panel");
    panel.hidden = true;
    const type = el("select", "participant-type", option("", "Choose type"), ...TYPES.map((name) => option(name)));
    const fieldsBox = el("div", "participant-type-fields");
    const formBox = el("div", "participants-form-box");
    const result = el("p", "participants-result");
    const state = {
      name: "", account: "", endpoint: "", endpointUrl: "", endpointKind: "openai-compatible", endpointModel: "", endpointKey: "",
      inlineEndpoint: false, model: "", context: "", price: "", place: "", workflow: "", runner: "github-hosted", secret: "",
      bridge: "", agent: "", capabilities: [], agentList: null, agentListText: "", agentTest: null, saveUntested: false,
    };

    function setType(next) {
      state.name = ""; state.account = ""; state.endpoint = ""; state.endpointUrl = ""; state.endpointKind = "openai-compatible";
      state.endpointModel = ""; state.endpointKey = ""; state.inlineEndpoint = false; state.model = ""; state.context = "";
      state.price = ""; state.place = ""; state.workflow = ""; state.runner = "github-hosted"; state.secret = ""; state.bridge = "";
      state.agent = ""; state.capabilities = typePreset(next); state.agentList = null; state.agentListText = ""; state.agentTest = null;
      state.saveUntested = false;
      if (next === "model endpoint") {
        state.endpoint = firstEndpoint(context.store);
        state.inlineEndpoint = state.endpoint === "";
      }
      if (BRIDGE_TYPES.has(next)) state.bridge = bridgeNames(context.store)[0] ?? "";
      if (next === "CI agent") state.place = "GitHub hosted runner";
      if (next === "CLI agent") state.place = "this machine";
      if (next === "sandboxed agent") state.place = "sandbox";
    }

    function buildForm() {
      result.textContent = "";
      if (!type.value) { fieldsBox.replaceChildren(); formBox.replaceChildren(); return; }
      const document = draftDocument(opened.text, type.value, state, context.store);
      const checks = (document) => [...inlineEndpointChecks(type.value, state), ...agentTestChecks(type.value, state),
        ...sourcePlaceWarnings(opened.sources)(document)];
      async function save(document) {
        const text = writeDocument(participantSchema(), document);
        const endpoint = state.inlineEndpoint ? endpointSetting(state) : null;
        const saved = await saveFile(context.instance.host, { path: PATH, text, openedBlob: opened.openedBlob, openedId: null });
        if (saved.refused === "changed meanwhile") {
          result.textContent = "Nothing was saved: the participants register changed meanwhile. Reload the page and try again.";
          return;
        }
        if (saved.refused === "identifier changed") {
          result.textContent = "Nothing was saved: the participants register changed its identifier.";
          return;
        }
        if (endpoint) writeSetting(context.store, endpoint.key, endpoint.setting);
        opened = { ...opened, text, openedBlob: saved.blob };
        renderList(list, opened.text);
        panel.hidden = true;
        result.textContent = "Saved.";
      }
      formBox.replaceChildren(schemaForm(participantSchema(), document, { onSave: save, extraChecks: checks }));
    }

    function rebuild() {
      fieldsBox.replaceChildren(...fieldsFor(type.value));
      buildForm();
    }

    function textInput(className, key, placeholder = "") {
      const input = el("input", className);
      input.value = state[key];
      input.placeholder = placeholder;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.addEventListener("input", () => { state[key] = input.value; buildForm(); routePreview.textContent = routeOf(type.value, state); });
      return input;
    }

    function selectInput(className, key, values) {
      const input = el("select", className, ...values.map((value) => option(value)));
      input.value = state[key];
      input.addEventListener("change", () => { state[key] = input.value; buildForm(); routePreview.textContent = routeOf(type.value, state); });
      return input;
    }

    const routePreview = el("code", "participant-route-preview");

    function capabilitiesBox() {
      const boxes = CAPABILITIES.map((capability) => {
        const box = el("input", "participant-capability");
        box.type = "checkbox";
        box.value = capability;
        box.checked = state.capabilities.includes(capability);
        box.addEventListener("change", () => {
          state.capabilities = CAPABILITIES.filter((name) => boxes.some((candidate) => candidate.value === name && candidate.checked));
          buildForm();
        });
        return el("label", null, box, " ", capability);
      });
      return el("fieldset", "participant-capabilities", el("legend", null, "Capabilities"), ...boxes.map((box) => el("p", null, box)), explain("capabilities-and-place"));
    }

    function commonControls(typeName) {
      const controls = [control("Name", textInput("participant-name", "name", "participant-name"))];
      if (typeName !== "person" && typeName !== "model endpoint") {
        controls.push(control("Model", textInput("participant-model", "model", "model name")));
      }
      if (typeName !== "person") {
        controls.push(control("Context", textInput("participant-context", "context", "tokens")),
          control("Price", textInput("participant-price", "price", "input / output USD per million tokens")),
          control("Processing place", textInput("participant-place", "place", "where data is processed")));
      }
      controls.push(capabilitiesBox());
      return controls;
    }

    function endpointControls() {
      const names = endpointNames(context.store);
      if (!names.length) {
        state.inlineEndpoint = true;
        const name = textInput("participant-endpoint-name", "endpoint", "endpoint name");
        const url = textInput("participant-endpoint-url", "endpointUrl", "https://...");
        const kind = selectInput("participant-endpoint-kind", "endpointKind", ["openai-compatible", "anthropic"]);
        const model = textInput("participant-endpoint-model", "endpointModel", "model name");
        const key = textInput("participant-endpoint-key", "endpointKey", "optional API key");
        key.type = "password";
        return [el("div", "participant-endpoint-inline",
          el("h4", null, "Configure a model endpoint"), control("Name", name), control("Endpoint URL", url), control("Kind", kind),
          control("Model", model), control("API key", key), explain("endpoint-url"), explain("endpoint-model"), explain("endpoint-key"))];
      }
      state.inlineEndpoint = false;
      return [control("Endpoint", selectInput("participant-endpoint", "endpoint", names))];
    }

    function ciControls() {
      const runner = el("select", "participant-runner", option("github-hosted"), option("self-hosted"));
      runner.value = state.runner;
      runner.addEventListener("change", () => { state.runner = runner.value; rebuild(); });
      const explainRunner = el("p", "participant-runner-explanation", state.runner === "self-hosted"
        ? "A self-hosted runner serves private repositories only; on a public repository Agent M refuses a job that would run on it, because outside pull requests could run code on that machine."
        : "A hosted runner runs on the forge's machines and uses a secret by name; no key is stored in the participants register.");
      return [control("Workflow", textInput("participant-workflow", "workflow", "agent-m.yml")), control("Runner", runner),
        control("Key secret name", textInput("participant-secret-name", "secret", "ACTIONS_SECRET_NAME")), explainRunner,
        explain("ci-agent-runner"), explain("job-workflow")];
    }

    function chosenBridge() {
      return bridgeAt(bridgeSettingsOf(context.store, state.bridge));
    }

    async function listBridgeAgents() {
      state.agentListText = "Reading the Bridge's agents...";
      state.agentList = null;
      rebuild();
      try {
        state.agentList = await testBridge(chosenBridge());
        state.agentListText = `Bridge ${state.agentList.bridge?.name ?? state.bridge} answered.`;
      } catch (error) {
        state.agentList = null;
        state.agentListText = bridgeFailureText(error);
      }
      rebuild();
    }

    function addOfferedAgent(agent) {
      const computer = state.agentList?.bridge?.name ?? state.bridge;
      state.agent = agent.name;
      state.model = agent.name;
      state.place = `${computer} Bridge's computer`;
      state.agentTest = null;
      state.saveUntested = false;
      rebuild();
    }

    async function testAgent() {
      if (!state.agent.trim()) {
        state.agentTest = { ok: false, text: "Choose an agent before testing it." };
        state.saveUntested = false;
        rebuild();
        return;
      }
      state.agentTest = { ok: null, text: `Testing ${state.agent} through Bridge ${state.bridge}...` };
      state.saveUntested = false;
      rebuild();
      try {
        const answer = await probe(chosenBridge(), "agent", { agent: state.agent.trim() });
        const version = answer?.version ? ` (${answer.version})` : "";
        state.agentTest = { ok: true, text: `${state.agent} answered${version}.` };
      } catch (error) {
        state.agentTest = { ok: false, text: bridgeFailureText(error) };
      }
      rebuild();
    }

    function agentListView() {
      const children = [];
      if (state.agentListText) children.push(el("p", null, state.agentListText));
      for (const agent of state.agentList?.agents ?? []) {
        if (agent.ready) {
          const add = el("button", "participant-agent-offer btn small", `Add ${agent.name}`);
          add.addEventListener("click", () => addOfferedAgent(agent));
          children.push(el("p", null, add, ` ${agent.version ?? ""}`));
        } else {
          children.push(el("p", "participant-agent-unready", `${agent.name} is not ready${agent.loggedIn === false ? " (not logged in)" : ""}.`));
        }
      }
      for (const agent of state.agentList?.missing ?? []) {
        children.push(el("p", "participant-agent-missing", `${agent.name} is missing.`));
      }
      return el("div", "participant-agent-list-result", ...children);
    }

    function bridgeControls() {
      const names = bridgeNames(context.store);
      const bridge = el("select", "participant-bridge", ...(names.length ? names : [""]).map((name) => option(name)));
      bridge.value = state.bridge;
      bridge.addEventListener("change", () => {
        state.bridge = bridge.value;
        state.agent = "";
        state.agentList = null;
        state.agentListText = "";
        state.agentTest = null;
        state.saveUntested = false;
        buildForm();
        routePreview.textContent = routeOf(type.value, state);
      });
      const agent = el("input", "participant-agent");
      agent.value = state.agent;
      agent.placeholder = "codex";
      agent.autocomplete = "off";
      agent.spellcheck = false;
      agent.addEventListener("input", () => {
        state.agent = agent.value;
        state.agentTest = null;
        state.saveUntested = false;
        buildForm();
        routePreview.textContent = routeOf(type.value, state);
      });
      const listAgents = el("button", "participant-list-agents btn", "List agents");
      listAgents.type = "button";
      listAgents.addEventListener("click", listBridgeAgents);
      const test = el("button", "participant-agent-test btn", "Test");
      test.type = "button";
      test.addEventListener("click", testAgent);
      const testResult = el("p", "participant-agent-test-result", state.agentTest?.text ?? "");
      const saveUntested = el("button", "participant-save-untested btn", "Save untested");
      saveUntested.type = "button";
      saveUntested.addEventListener("click", () => { state.saveUntested = true; buildForm(); });
      const testLine = el("p", null, test);
      if (state.agentTest?.ok === false && !state.saveUntested) testLine.append(" ", saveUntested);
      return [control("Bridge", bridge), el("p", null, listAgents), agentListView(), control("Agent", agent),
        testLine, testResult];
    }

    function fieldsFor(typeName) {
      if (!typeName) return [];
      routePreview.textContent = routeOf(typeName, state);
      return [
        el("h3", null, `Add ${typeName}`),
        explain(TYPE_TOPIC[typeName]),
        ...commonControls(typeName),
        ...(typeName === "person" ? [control("Account", textInput("participant-account", "account", "github.com/name"))] : []),
        ...(typeName === "model endpoint" ? endpointControls() : []),
        ...(typeName === "CI agent" ? ciControls() : []),
        ...(BRIDGE_TYPES.has(typeName) ? bridgeControls() : []),
        el("p", null, "Route ", routePreview),
      ];
    }

    add.addEventListener("click", () => { panel.hidden = false; });
    type.addEventListener("change", () => { setType(type.value); rebuild(); });

    panel.append(el("h3", null, "Add participant"), control("Type", type), fieldsBox, formBox, result);
    target.replaceChildren(el("h2", null, "Participants"), el("p", null, add), panel, list);
  },
};
