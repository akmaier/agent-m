// The browser harness of the tests of MOD-review-pages: the part of a browser's DOM that the renderer and the pages use, set as the
// globals `document` and `window`, and a `localStorage` over a Map, set as a global for MOD-browser-store. node has no DOM, and the
// module runs in a browser; this file takes the frame's fixture DOM, tests/site-frame-dom.mjs, with which the renderer runs as it is.
// Imported by every test file of the review pages that draws a route, and by the helpers they share; it holds no test and no expected result.
//
// Module: MOD-review-pages
// Level: unit
//
// Importing it sets the globals and nothing else; `emptyStorage()` gives the next store an empty localStorage. Nothing reaches the network.

import "./site-frame-dom.mjs";

// ---------------------------------------------------------------- what the review pages' tests add to the fixture DOM
//
// A browser marks the events a person makes as trusted (`isTrusted`) and those a script makes as not. node marks every Event untrusted,
// so the harness stands for the person: an event dispatched through a node is trusted, unless the test made it with `scripted()` or the node
// stands within an element of a class that the file using the harness names in globalThis.reviewPagesScriptedWithin
// (tests/uc-019-prompt-bar-harness.mjs lists the prompt bar's hand-over, which its tests click as a script first).
const { Node } = globalThis.window;
const standsWithin = (node, classes) => {
  for (let at = node; at; at = at._parent) {
    if (at._type === 1 && String(at.className ?? "").split(" ").some((name) => classes.includes(name))) return true;
  }
  return false;
};
Node.prototype.dispatchEvent = function dispatchEvent(event) {
  const within = globalThis.reviewPagesScriptedWithin ?? [];
  const scriptedHere = within.length > 0 && standsWithin(this, within);
  if (!event.scripted && !scriptedHere) Object.defineProperty(event, "isTrusted", { value: true });
  return EventTarget.prototype.dispatchEvent.call(this, event);
};

// A localStorage over a Map, for MOD-browser-store.
let kept = new Map();
globalThis.localStorage = { getItem: (k) => (kept.has(k) ? kept.get(k) : null), setItem: (k, v) => { kept.set(k, String(v)); },
  removeItem: (k) => { kept.delete(k); }, key: (i) => [...kept.keys()][i] ?? null, get length() { return kept.size; } };

// The next store this browser opens finds nothing kept.
export function emptyStorage() { kept = new Map(); }

// An event a script makes, as a script in a browser makes one: not trusted, so a control that writes does not answer it.
export const scripted = (type = "click") => Object.assign(new Event(type), { scripted: true });
