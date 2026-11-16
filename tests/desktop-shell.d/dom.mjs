// The small DOM the Bridge window's tests draw the window in (tests/mod-desktop-shell-job-console.test.mjs, tests/mod-desktop-shell-window-look.test.mjs):
// text nodes and elements with children, attributes and text, a `style` that writes the `style` attribute as a browser's does, querySelectorAll for
// simple selectors and their descendants (tests/dom-selector.mjs), and a local storage. It is test code; it holds no expected result.
//
// Module: MOD-desktop-shell
// Level: unit

import { selectorMatcher } from "../dom-selector.mjs";

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
export class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.innerHTML = ""; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) { return descendants(this, (node) => node.localName === name); }
  // A declaration set through `style` stands in the element's `style` attribute, as `name: value;` in the order set.
  get style() {
    const element = this;
    return new Proxy({}, {
      get: (_, name) => (element.getAttribute("style") ?? "").match(new RegExp(`(?:^|; )${kebab(String(name))}: ([^;]*);`))?.[1] ?? "",
      set: (_, name, value) => {
        const kept = (element.getAttribute("style") ?? "").split("; ").filter((part) => part && !part.startsWith(`${kebab(String(name))}:`)).map((part) => part.replace(/;$/, ""));
        element.setAttribute("style", [...kept, `${kebab(String(name))}: ${value}`].map((part) => `${part};`).join(" "));
        return true;
      },
    });
  }
  // The elements below this one that the last simple selector matches, each below one that the selector before it matches, and so on.
  querySelectorAll(selector) {
    return selector.trim().split(/\s+/).reduce((roots, part) => {
      const matches = selectorMatcher(part);
      return [...new Set(roots.flatMap((root) => descendants(root, matches)))];
    }, [this]);
  }
}
export class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
export const descendants = (root, predicate) => { const found = []; const visit = (node) => { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } }; visit(root); return found; };
