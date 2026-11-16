// The selector of the fixture DOMs' querySelector (tests/site-frame-dom.mjs, tests/site-frame-start.d/dom.mjs, tests/desktop-shell.d/dom.mjs): whether an
// element matches a simple selector — a tag, `.class`, `#id`, `[name]` and `[name="value"]`, combined —, or one of a list of them separated by commas,
// as a browser's matches does. A selector with a combinator is not supported and throws. It is code only; it holds no expected result and no test.
//
// Module: MOD-site-frame
// Level: unit

export function selectorMatcher(selector) {
  const each = selector.split(",").map((part) => simpleMatcher(part.trim()));
  return (el) => each.some((matches) => matches(el));
}

function simpleMatcher(selector) {
  if (!/^[\w-]*((\.[\w-]+)|(#[\w-]+)|(\[[\w-]+(="[^"]*")?\]))*$/.test(selector) || selector === "") throw new SyntaxError(`selector not supported: ${selector}`);
  const tag = selector.match(/^[\w-]+/)?.[0];
  const classes = [...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
  const id = selector.match(/#([\w-]+)/)?.[1];
  const attrs = [...selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].map((m) => [m[1], m[2]]);
  return (el) => (!tag || el.localName === tag) && (!id || el.getAttribute("id") === id)
    && classes.every((c) => String(el.className ?? "").split(/\s+/).includes(c))
    && attrs.every(([name, value]) => value === undefined ? el.getAttribute(name) !== null : el.getAttribute(name) === value);
}
