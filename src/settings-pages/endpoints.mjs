// MOD-settings-pages' direct endpoint configuration route (UC-003). The endpoint call and its
// diagnosis remain MOD-endpoint-calls' responsibility; this route owns only the browser form and
// the conversion between the browser-store record and EndpointConfig.

import { testEndpoint } from "../endpoint-calls/index.mjs";
import { bridgeAt, probe } from "../bridge-client/index.mjs";
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

function bridgeFailureText(error) {
  if (error?.name === "TokenRefused") return "The Bridge refused its pairing token. Copy its current token and pair it again.";
  if (error?.name === "JumpHostLoginRefused") return "The jump host refused its web login. Check that login in Bridge settings and save it again.";
  if (error?.name === "NoAnswer") return `The Bridge gave no answer. Check ${error.likely?.join(", ") ?? "its address"}.`;
  if (error?.name === "Timeout") return "The Bridge did not answer in time. Check that it is running, then test again.";
  if (error?.name === "BridgeFailed") return `The Bridge could not test this endpoint: ${error.message}`;
  return `The Bridge could not test this endpoint: ${error?.message ?? error}.`;
}

function bridgeSettings(store) {
  const bridge = readSetting(store, "bridge");
  if (!bridge?.address || !bridge?.token) return null;
  const jumpHost = readSetting(store, "jump-host");
  const login = bridge.address.startsWith("https://") && jumpHost?.httpsAddress === bridge.address ? jumpHost.login : null;
  return { address: bridge.address, token: bridge.token, ...(login ? { login } : {}) };
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
    const disclosure = el("p", "endpoint-disclosure");
    const test = el("button", "endpoint-test", "Save and test");
    const clear = el("button", "endpoint-clear", "Clear");
    const result = el("p", "endpoint-result");
    const fields = { name, url, kind, model, key, throughBridge };

    const discloseDestination = () => {
      const configuredBridge = bridgeSettings(context.store);
      disclosure.textContent = throughBridge.checked
        ? `Agent M sends one short test request to the paired Bridge at ${configuredBridge?.address ?? "the Bridge you set up"}. The endpoint key is inside that Bridge request, and its pairing token and any jump-host login are authorisation headers, never URLs or repository data.`
        : "Agent M sends one short test request to this endpoint. Its optional key is sent only in that request's authorisation header, never in a URL or repository.";
    };

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
    discloseDestination();
    throughBridge.addEventListener("change", discloseDestination);

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
        const settings = bridgeSettings(context.store);
        if (!settings) {
          const setup = el("button", "endpoint-bridge-setup", "Set up the Bridge");
          setup.addEventListener("click", () => context.go("bridge", {}));
          result.replaceChildren("This local model needs Bridge setup before it can be tested. Its endpoint setting remains stored. ", setup);
          return;
        }
        result.textContent = "Testing the endpoint through the Bridge…";
        try {
          result.textContent = resultText(await probe(bridgeAt(settings), "endpoint-test", endpointConfig(chosenName, stored)));
        } catch (error) {
          result.textContent = bridgeFailureText(error);
        }
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
