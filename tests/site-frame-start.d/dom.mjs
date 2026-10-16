// The small browser fixture of ITM-531's tests (tests/site-frame-start-page.test.mjs, tests/site-frame-start-script.test.mjs):
// a document of elements that hold children, attributes, text and listeners, a window that is an event target, a location, and a
// local storage. It is code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

export class FixtureElement extends EventTarget {
  constructor(document, localName) {
    super();
    this.ownerDocument = document;
    this.localName = localName;
    this.children = [];
    this.attributes = new Map();
    this.className = "";
    this.value = "";
    this._parent = null;
  }
  get textContent() { return this.children.map((child) => typeof child === "string" ? child : child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  append(...children) { for (const child of children) { this.children.push(child); if (typeof child !== "string") child._parent = this; } }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  remove() { if (this._parent) { this._parent.children = this._parent.children.filter((child) => child !== this); this._parent = null; } }
  setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === "class") this.className = String(value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) {
    const found = [];
    for (const child of this.children) if (typeof child !== "string") {
      if (child.localName === name) found.push(child);
      found.push(...child.getElementsByTagName(name));
    }
    return found;
  }
}

// A document with a head and a body; `baseURI` is the address the page is served from, against which a script's `src` is read.
export function fixtureDocument(baseURI) {
  const document = {
    baseURI,
    createElement: (name) => new FixtureElement(document, name),
    getElementsByTagName(name) { return [this.head, this.body].flatMap((element) => element.localName === name ? [element] : element.getElementsByTagName(name)); },
  };
  document.head = document.createElement("head");
  document.body = document.createElement("body");
  return document;
}

export function fixtureStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
}

// Every element of a kind below a root, the root included.
export const all = (root, tag) => [root, ...root.getElementsByTagName(tag)].filter((element) => element.localName === tag);

// Installs the globals a page needs and returns the window, on which a test fires `hashchange`, the location, whose hash a page
// or a test sets, and the document.
export function installPage({ hostname, pathname, hash = "" }) {
  const window = new EventTarget();
  const location = { hostname, pathname, hash, host: hostname, protocol: "https:" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: fixtureStorage() });
  Object.defineProperty(globalThis, "window", { configurable: true, value: window });
  const document = fixtureDocument(`https://${hostname}${pathname}`);
  window.document = document;
  globalThis.document = document;
  return { window, location, document };
}

// A person (or a link) changes the fragment: the location holds it and the window announces it.
export function changeFragment({ window, location }, hash) {
  location.hash = hash;
  window.dispatchEvent(new Event("hashchange"));
}
