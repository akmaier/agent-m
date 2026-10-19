// The browser harness of the tests of MOD-settings-pages: the helpers that find an element, type into a field and press a button, over the
// frame's fixture DOM (tests/site-frame-dom.mjs), which holds the one copy of the part of a browser's DOM that MOD-site-frame's explain()
// needs. installDocument() sets a fresh document up as the globals `document` and `window`; the modules of the route are loaded by the
// test file after it (a static import of them would run before it). It is code only; it holds no expected result. Used by
// tests/settings-pages-add-product.test.mjs, tests/settings-pages-add-product-new-repository.test.mjs and tests/settings-pages-setup.test.mjs
// (through tests/settings-pages-setup.d/dom.mjs), and by the other tests of the module's route.
//
// Module: MOD-settings-pages; MOD-site-frame
// Level: unit

export { installDocument } from "./site-frame-dom.mjs";

// ---------------------------------------------------------------- DOM helpers: elements, typing, clicking

export function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
export const byTag = (root, name) => elements(root, (e) => e.localName === name);
export const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
export const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
export const turn = () => new Promise((resolve) => setImmediate(resolve));
// A person's click as the browser delivers it: Node creates dispatched Event instances with isTrusted false, so the
// fixture event's own value is set to the trusted browser input that production receives.
export const click = async (button) => {
  const event = new Event("click");
  Object.defineProperty(event, "isTrusted", { value: true });
  button.dispatchEvent(event);
  await turn();
};
// Waits for a host's answer: polls `condition()` by the clock until it holds, for at most `ms` milliseconds; throws `never: <what>` otherwise.
export async function until(condition, what, ms = 5000) {
  const end = Date.now() + ms;
  while (!condition()) {
    if (Date.now() > end) throw new Error(`never: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

