// The route `models` — the instance's process models (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md;
// Interfaces: view, route models; UC-031 steps 1 and 2b). It lists the catalogue of the instance's snapshot (MOD-model-catalogue's
// `catalogue`): the shipped models, then the instance's own, each with its kind of work, the products of this browser whose declaration
// names it, and the findings of the catalogue for it. A shipped model offers *Adapt* and never an edit in place; an instance's model
// offers *Edit*; the page offers *+ New model*. The buttons lead to `models/<name>`, which is not built here. Each part carries a folded
// *What is this?*.
//
// The products are the addresses of the setting `products` (MOD-browser-store's `readSetting`). Each is connected with MOD-site-frame's
// `chosenProduct`, with the fragment `#models/product=<address>`, and its declaration `docs/process.md` is read with that product's host
// (`repositoryInfo`, `readSnapshot`). A product declares the model whose file its `model_file` names, as the route `process` reads it. An
// address that cannot be connected or read is shown with its reason, and the others are still listed.
//
// Module: MOD-implementation-pages

import { explain, chosenProduct } from "../site-frame/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { catalogue } from "../model-catalogue/index.mjs";
import { declarationSchema } from "../product-process/index.mjs";

const DECLARATION_PATH = "docs/process.md";
// Where an instance's own models are kept, by which a model of the instance is told from a shipped one (THE CATALOGUE IS DATA: no model is named here).
const INSTANCE_MODELS = "docs/process-models/";

// A plain element with a class and children — the module runs in a browser, where `document` is global.
function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function link(label, className, href) {
  const anchor = el("a", className, label);
  anchor.setAttribute("href", href);
  return anchor;
}

// The model file each product of this browser declares, or the reason it could not be read: { address, modelFile } | { address, reason }.
// modelFile is null for a product without a declaration.
async function declarationsOf(context) {
  const { store } = context;
  return Promise.all((readSetting(store, "products") ?? []).map(async (address) => {
    try {
      const product = await chosenProduct({ store, fragment: `#models/product=${encodeURIComponent(address)}` });
      const { defaultBranch } = await product.host.repositoryInfo();
      const declaration = await (await product.host.readSnapshot(defaultBranch)).read(DECLARATION_PATH);
      const modelFile = declaration == null ? null : String(readDocument(declarationSchema, DECLARATION_PATH, declaration).fields.model_file ?? "");
      return { address, modelFile };
    } catch (failure) {
      return { address, reason: String(failure?.message ?? failure) };
    }
  }));
}

export const route = {
  name: "models",
  entry: "implementation",
  title: "Process models",

  async render(target, context) {
    const { instance } = context;
    const { defaultBranch } = await instance.host.repositoryInfo();
    const [cat, declarations] = await Promise.all([
      instance.host.readSnapshot(defaultBranch).then((snapshot) => catalogue(snapshot)), declarationsOf(context)]);

    const row = (model, button) => {
      const declaring = declarations.filter((declaration) => declaration.modelFile === model.path);
      const findings = cat.findings[model.path] ?? [];
      const item = el("li", "model", el("h4", null, model.name),
        el("span", "kind", model.kind), explain("model-kind"),
        el("ul", "products", ...declaring.map((declaration) => el("li", null, declaration.address))), explain("model-products"));
      if (findings.length) {
        item.append(el("ul", "findings", ...findings.map((finding) => el("li", null, `${finding.kind}: ${finding.what}`))), explain("model-findings"));
      }
      item.setAttribute("data-model", model.name);
      item.append(button);
      return item;
    };
    const to = (model) => `#models/${encodeURIComponent(model.name)}`;
    const isOwn = (model) => model.path.startsWith(INSTANCE_MODELS);

    const shipped = el("section", "shipped-models", el("h3", null, "Shipped models"), explain("models-shipped"),
      el("ul", null, ...cat.models.filter((model) => !isOwn(model)).map((model) => row(model, link("Adapt", "adapt", to(model))))));
    const own = el("section", "own-models", el("h3", null, "This instance's models"), explain("models-own"),
      el("ul", null, ...cat.models.filter(isOwn).map((model) => row(model, link("Edit", "edit", to(model))))),
      link("+ New model", "new-model", "#models/new"));

    const unreadable = declarations.filter((declaration) => declaration.reason !== undefined);
    const page = el("article", "models-page", el("h2", null, "Process models"));
    if (unreadable.length) {
      page.append(el("ul", "unreadable", ...unreadable.map((declaration) => el("li", "source", `${declaration.address}: ${declaration.reason}`))));
    }
    page.append(shipped, own);
    target.replaceChildren(page);
  },
};
