// The fixture DOM of the tests of MOD-site-frame and of the views that load the frame: the small DOM of tests/markdown-render-dom.mjs (the part of a
// browser's DOM that MOD-site-frame's explain() and the renderer it uses need), with what a browser does with the focus and with `dataset`.
// Importing this file installs a document as the globals `document` and `window` (installDocument() installs a fresh one), before the modules of the page
// are loaded by the importer's own dynamic import; it exports that document. It is code only; it holds no expected result and no test. The tests of
// MOD-site-frame and of the views import it, and tests/site-frame.test.mjs imports it too.
//
// Module: MOD-site-frame
// Level: unit

import { installDocument as installBase } from "./markdown-render-dom.mjs";

const FOCUSABLE = new Set(["input", "textarea", "select", "button"]);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Added to the classes of the base DOM, once, as a browser does it: an element takes the focus only while it is in its document, and only if a person
// can type in it or press it; the document's activeElement is the element that has the focus while it is still in the document, and its body otherwise;
// and an element's dataset reads and writes its data-* attributes.
function addBrowserBehaviour(document) {
  const { Node, Element } = globalThis.window;
  if (Object.getOwnPropertyDescriptor(Node.prototype, "isConnected")) return;
  Object.defineProperty(Node.prototype, "isConnected", { configurable: true, get() { let n = this; while (n._parent) n = n._parent; return n === this._doc; } });
  Element.prototype.focus = function focus() { if (this.isConnected && FOCUSABLE.has(this.localName)) this._doc._focused = this; };
  Object.defineProperty(Element.prototype, "dataset", { configurable: true, get() {
    const el = this;
    return new Proxy({}, {
      get: (_, prop) => el.getAttribute(`data-${kebab(String(prop))}`) ?? undefined,
      set: (_, prop, value) => { el.setAttribute(`data-${kebab(String(prop))}`, value); return true; },
    });
  } });
  Object.defineProperty(Object.getPrototypeOf(document), "activeElement", { configurable: true, get() { return this._focused?.isConnected ? this._focused : this.body; } });
}

// Installs a fresh document as the globals `document` and `window`, as a browser has them; the body is empty.
export function installDocument() {
  const document = installBase();
  addBrowserBehaviour(document);
  return document;
}

// Importing this file installs the document once; a test that wants a fresh one calls installDocument().
const document = installDocument();

export { document };
