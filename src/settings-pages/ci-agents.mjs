// MOD-settings-pages' coding agents on CI (UC-010), beside the endpoints of the Settings page's tab Endpoints & Agents: each kept under
// `ci-agent:<name>` = { agent, runner, secret, place, capabilities, models: [{ model, context }] } — the agent among those MOD-agent-processes
// supports, its runner (`hosted` for the server's own, else a self-hosted runner's label), the name of the CI secret of its key, the place where it
// processes data, its capabilities, preset to every capability, and each model it can run with its context. One lacking a place, a model or a
// model's context is named as not offered (endpointLacks); *Clear* removes it. The page sends nothing.

import { clearSetting, listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { endpointLacks } from "../prompt-bar/index.mjs";
import { CAPABILITIES } from "./bridge.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

// A kept coding agent on CI: its name, agent and runner, what it lacks for being offered, and *Clear*.
function keptLine(store, key, changed) {
  const setting = readSetting(store, key);
  if (!setting || typeof setting !== "object") return null;
  const name = key.slice("ci-agent:".length);
  const lacks = endpointLacks({ ...setting, models: Array.isArray(setting.models) ? setting.models : [] });
  const clear = el("button", "ci-agent-clear btn small", "Clear");
  clear.type = "button";
  clear.addEventListener("click", () => { clearSetting(store, key); changed(); });
  const runner = setting.runner && setting.runner !== "hosted" ? `the self-hosted runner ${setting.runner}` : "the server's own runners";
  return el("p", "ci-agent-line", el("strong", "ci-agent-name", name), ` — ${setting.agent ?? "no agent"} on ${runner}, its key in the CI secret ${setting.secret ?? "(none)"}. `,
    ...(lacks.length ? [el("span", "notice ci-agent-lacks", `Not offered: it lacks ${lacks.join(" and ")}. `)] : []), clear);
}

/**
 * ciAgentsPanel(store) -> HTMLElement — the coding agents on CI this browser keeps, one line each, and the form that keeps one.
 */
export function ciAgentsPanel(store) {
  const list = el("div", "ci-agents-list");
  const listAgents = () => list.replaceChildren(...listSettings(store).filter((setting) => setting.key.startsWith("ci-agent:"))
    .map((setting) => keptLine(store, setting.key, listAgents)).filter(Boolean));
  const input = (className, placeholder) => { const node = el("input", className); node.placeholder = placeholder; node.autocomplete = "off"; node.spellcheck = false; return node; };
  const name = input("ci-agent-form-name", "Name"), agent = input("ci-agent-form-agent", "claude, codex or opencode");
  const runner = input("ci-agent-form-runner", "hosted, or a self-hosted runner's label"), secret = input("ci-agent-form-secret", "CI secret of its key, e.g. CLAUDE_KEY");
  const place = input("ci-agent-form-place", "Provider and country");
  runner.value = "hosted";
  const capabilities = CAPABILITIES.map((capability) => { const box = el("input", "ci-agent-form-capability"); box.type = "checkbox"; box.value = capability; box.checked = true; return box; });
  const models = el("div", "ci-agent-form-models");
  const modelRow = () => el("p", "ci-agent-form-model-row", el("label", null, "Model ", input("ci-agent-form-model", "Model name")), " ",
    el("label", null, "Context (tokens) ", input("ci-agent-form-context", "Context in tokens")));
  models.append(modelRow());
  const addModel = el("button", "ci-agent-form-add-model btn small", "+ Add model");
  addModel.type = "button";
  addModel.addEventListener("click", () => models.append(modelRow()));
  const save = el("button", "ci-agent-form-save btn primary", "Save coding agent on CI");
  save.type = "button";
  const result = el("p", "ci-agent-form-result");
  save.addEventListener("click", () => {
    const named = name.value.trim();
    if (!named || !agent.value.trim() || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(secret.value.trim())) {
      result.textContent = "Enter a name, the agent and the CI secret of its key (letters, digits and _).";
      return;
    }
    const value = { agent: agent.value.trim(), runner: runner.value.trim() || "hosted", secret: secret.value.trim(), place: place.value.trim(),
      capabilities: capabilities.filter((box) => box.checked).map((box) => box.value), models: [] };
    for (const row of models.querySelectorAll(".ci-agent-form-model-row")) {
      const model = row.querySelector(".ci-agent-form-model").value.trim(), tokens = Number(row.querySelector(".ci-agent-form-context").value.trim());
      if (model) value.models.push({ model, ...(Number.isInteger(tokens) && tokens > 0 ? { context: tokens } : {}) });
    }
    try {
      writeSetting(store, `ci-agent:${named}`, value);
      result.textContent = `The coding agent on CI ${named} is kept in this browser.`;
    } catch (error) {
      result.textContent = `The coding agent on CI could not be kept: ${error?.message ?? error}.`;
    }
    listAgents();
  });
  listAgents();
  return el("section", "ci-agents panel", el("h4", null, "Coding agents on CI"), list,
    el("p", null, el("label", null, "Name ", name), " ", el("label", null, "Agent ", agent)),
    el("p", null, el("label", null, "Runner ", runner), " ", el("label", null, "CI secret of the key ", secret)),
    el("p", null, el("label", null, "Processing place ", place)),
    el("p", null, "Capabilities ", ...capabilities.flatMap((box) => [el("label", null, box, ` ${box.value}`), " "])),
    models, el("p", null, addModel), el("p", null, save), result);
}
