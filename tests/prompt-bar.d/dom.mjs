// The part of a browser's DOM that the prompt bar uses, which its tests share (tests/prompt-bar.test.mjs, tests/prompt-bar-fixed.test.mjs,
// tests/prompt-bar-one-kind.test.mjs, tests/prompt-bar-endpoints.test.mjs, tests/prompt-bar-account-and-named-product.test.mjs,
// tests/prompt-bar-actions-setup.test.mjs, tests/prompt-bar-hand-over.test.mjs): text nodes and elements with children, attributes, an innerHTML kept as text, textContent, a classList
// (tests/dom-class-list.mjs) and events; no `style` object, only the attribute. Importing it installs `document` as a global that creates such
// elements. It is test code; it holds no expected result.
//
// Module: MOD-prompt-bar
// Level: unit

import { classListOf } from "../dom-class-list.mjs";

export class Text { constructor(data) { this.data = String(data); this.parentNode = null; } get textContent() { return this.data; } }
export class Element extends EventTarget {
  constructor(name) {
    super();
    Object.assign(this, { localName: name, childNodes: [], className: "", value: "", type: "", hidden: false, disabled: false, parentNode: null, attrs: {}, html: "" });
  }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  set innerHTML(value) { this.html = String(value); }
  get innerHTML() { return this.html; }
  get textContent() { return this.html + this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.html = ""; this.replaceChildren(String(value)); }
  get classList() { return classListOf(this); }
  focus() {}
}
globalThis.document = { createElement: (name) => new Element(name) };
