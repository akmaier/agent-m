// MOD-settings-pages' implemented Settings slice: the endpoint settings MOD-browser-store already enumerates.

import { clearSetting, listSettings, readSetting } from "../browser-store/index.mjs";
import { testEndpoint } from "../endpoint-calls/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function endpointName(key) {
  return key.slice("endpoint:".length);
}

function endpointConfig(name, setting) {
  return { name, kind: setting.kind, baseUrl: setting.url, model: setting.model, key: setting.key ?? null };
}

function resultText(result) {
  if (result.works) return `✓ ${result.model} is working.`;
  const { diagnosis } = result;
  const alternatives = diagnosis.routes.length ? ` Try this job through ${diagnosis.routes.map((route) => route === "ci" ? "CI" : "the Bridge").join(" or ")}.` : "";
  return `✗ ${diagnosis.message}${alternatives}`;
}

function endpointLine(target, context, info) {
  const name = endpointName(info.key);
  const setting = readSetting(context.store, info.key);
  if (!setting) return null;
  const key = el("input", "settings-endpoint-key");
  const show = el("button", "settings-endpoint-show", "Show");
  const test = el("button", "settings-endpoint-test", "Test");
  const change = el("button", "settings-endpoint-change", "Change");
  const clear = el("button", "settings-endpoint-clear", "Clear");
  const result = el("p", "settings-endpoint-result");
  key.type = "password";
  key.value = setting.key ?? "";
  key.autocomplete = "off";
  key.spellcheck = false;

  show.addEventListener("click", () => {
    const hidden = key.type === "password";
    key.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  test.addEventListener("click", async () => {
    if (setting.throughBridge) {
      result.textContent = "This local model requires Bridge setup before it can be tested. Its endpoint setting remains stored.";
      return;
    }
    result.textContent = "Testing the endpoint…";
    result.textContent = resultText(await testEndpoint(endpointConfig(name, setting)));
  });
  change.addEventListener("click", () => context.go("endpoints", { name }));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, info.key);
    await route.render(target, context, {});
  });

  return el("section", "settings-endpoint",
    el("h3", null, info.label),
    el("p", null, `Model: ${setting.model}`),
    el("p", null, el("label", null, "API key ", key, " ", show)),
    el("p", null, test, " ", change, " ", clear),
    result,
  );
}

export const route = {
  name: "settings",
  entry: "settings",
  title: "Settings",
  async render(target, context) {
    const endpoints = listSettings(context.store)
      .filter((setting) => setting.key.startsWith("endpoint:"))
      .map((setting) => endpointLine(target, context, setting))
      .filter(Boolean);
    target.replaceChildren(
      el("h2", null, "Settings"),
      el("h3", null, "This browser"),
      el("div", "settings-endpoints", ...endpoints),
    );
  },
};
