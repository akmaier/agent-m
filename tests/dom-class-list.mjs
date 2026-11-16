// The classList of the fixture DOMs (tests/site-frame-dom.mjs, tests/site-frame-start.d/dom.mjs): add, remove, toggle and contains over the
// element's className, as a browser's DOMTokenList does. It is code only; it holds no expected result and no test.
//
// Module: MOD-site-frame
// Level: unit

export function classListOf(el) {
  const names = () => String(el.className ?? "").split(/\s+/).filter(Boolean);
  const write = (list) => { el.className = list.join(" "); };
  return {
    contains: (name) => names().includes(name),
    add: (...added) => write([...new Set([...names(), ...added])]),
    remove: (...removed) => write(names().filter((name) => !removed.includes(name))),
    toggle(name, force) {
      const on = force === undefined ? !names().includes(name) : Boolean(force);
      if (on) this.add(name); else this.remove(name);
      return on;
    },
  };
}
