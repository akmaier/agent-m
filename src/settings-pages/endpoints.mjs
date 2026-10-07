// MOD-settings-pages' direct endpoint configuration route (UC-003). The endpoint call and its
// diagnosis remain MOD-endpoint-calls' responsibility; this route owns only the browser form and
// the conversion between the browser-store record and EndpointConfig.

import { testEndpoint } from "../endpoint-calls/index.mjs";
import { clearSetting, readSetting, writeSetting } from "../browser-store/index.mjs";
import { explain } from "../site-frame/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function endpointKey(name) {
  return name ? `endpoint:${name}` : null;
}

function sharedPagesNotice(context) {
  const owner = String(context.instance?.repository ?? "").split("/")[0];
  return `Everything Agent M stores in this browser is stored for the address https://${owner}.github.io — every GitHub Pages site under that same ${owner}.github.io domain can read it.`;
}

function settingFrom(fields) {
  const value = {
    url: fields.url.value.trim(),
    kind: fields.kind.value,
    model: fields.model.value.trim(),
    throughBridge: fields.throughBridge.checked,
  };
  const key = fields.key.value.trim();
  if (key) value.key = key;
  return value;
}

function endpointConfig(name, setting) {
  return {
    name,
    kind: setting.kind,
    baseUrl: setting.url,
    model: setting.model,
    key: setting.key ?? null,
  };
}

function resultText(result) {
  if (result.works) return `✓ ${result.model} is working.`;
  const { diagnosis } = result;
  const alternatives = diagnosis.routes.length ? ` Try this job through ${diagnosis.routes.map((route) => route === "ci" ? "CI" : "the Bridge").join(" or ")}.` : "";
  return `✗ ${diagnosis.message}${alternatives}`;
}

function applySetting(fields, name, setting) {
  fields.name.value = name;
  fields.url.value = setting?.url ?? "";
  fields.kind.value = setting?.kind ?? "openai-compatible";
  fields.model.value = setting?.model ?? "";
  fields.key.value = setting?.key ?? "";
  fields.throughBridge.checked = setting?.throughBridge === true;
}

export const route = {
  name: "endpoints",
  entry: "settings",
  title: "Model endpoint",
  async render(target, context, params = {}) {
    const name = el("input", "endpoint-name");
    const url = el("input", "endpoint-url");
    const kind = el("select", "endpoint-kind",
      el("option", null, "openai-compatible"),
      el("option", null, "anthropic"));
    const model = el("input", "endpoint-model");
    const key = el("input", "endpoint-key");
    const throughBridge = el("input", "endpoint-through-bridge");
    const show = el("button", "endpoint-show", "Show");
    const disclosure = el("p", "endpoint-disclosure", "Agent M sends one short test request to this endpoint. Its optional key is sent only in that request's authorisation header, never in a URL or repository.");
    const test = el("button", "endpoint-test", "Save and test");
    const clear = el("button", "endpoint-clear", "Clear");
    const result = el("p", "endpoint-result");
    const fields = { name, url, kind, model, key, throughBridge };

    name.placeholder = "Endpoint name";
    url.placeholder = "Endpoint address";
    model.placeholder = "Model name";
    key.type = "password";
    key.placeholder = "Optional API key";
    throughBridge.type = "checkbox";
    for (const input of [name, url, model, key]) { input.autocomplete = "off"; input.spellcheck = false; }

    show.addEventListener("click", () => {
      const hidden = key.type === "password";
      key.type = hidden ? "text" : "password";
      show.textContent = hidden ? "Hide" : "Show";
    });

    const requestedName = typeof params.name === "string" ? params.name : "";
    applySetting(fields, requestedName, readSetting(context.store, endpointKey(requestedName)));

    test.addEventListener("click", async () => {
      const chosenName = name.value.trim();
      if (!chosenName || !url.value.trim() || !model.value.trim()) {
        result.textContent = "Enter an endpoint name, URL and model first.";
        return;
      }
      const stored = settingFrom(fields);
      const storeKey = endpointKey(chosenName);
      writeSetting(context.store, storeKey, stored);
      if (stored.throughBridge) {
        result.textContent = "This local model requires Bridge setup before it can be tested. Its endpoint setting remains stored.";
        return;
      }
      result.textContent = "Testing the endpoint…";
      const checked = await testEndpoint(endpointConfig(chosenName, stored));
      result.textContent = resultText(checked);
    });

    clear.addEventListener("click", () => {
      const chosenName = name.value.trim();
      if (chosenName) clearSetting(context.store, endpointKey(chosenName));
      applySetting(fields, "", null);
      result.textContent = "The endpoint configuration is cleared from this browser.";
    });

    target.replaceChildren(
      el("h2", null, "Configure a model endpoint"),
      el("p", "muted", "Store an endpoint in this browser, then make one short test request."),
      el("p", null, el("label", null, "Name ", name)),
      el("p", null, el("label", null, "Endpoint URL ", url)),
      explain("endpoint-url"),
      el("p", null, el("label", null, "Kind ", kind)),
      explain("endpoint-kind"),
      el("p", null, el("label", null, "Model ", model)),
      explain("endpoint-model"),
      el("p", null, el("label", null, "API key ", key, " ", show)),
      explain("endpoint-key"),
      el("p", null, el("label", null, throughBridge, " This local model is reached through the Bridge")),
      explain("endpoint-route"),
      el("p", "notice endpoint-shared-origin", sharedPagesNotice(context)),
      disclosure,
      el("p", null, test, " ", clear),
      explain("endpoint-test"),
      explain("endpoint-clear"),
      result,
    );
    name.focus();
  },
};
