// Front matter — reading and writing the block of keys at the top of a text (MOD-text-tools, Data: Front matter).
//
// Module: MOD-text-tools
//
// A text begins with a line `---`, then lines of keys, then a line `---`; the body is every byte after the closing line.
// Lines end in LF or in CR LF, and a value never keeps its CR. A key is [a-z][a-z0-9_-]*, followed by `:`. A key with a value
// on its line holds that value as text, trimmed; a key with nothing after its colon, or with `[]`, holds a list, whose items
// are the following lines of the form `  - item`. There is no nesting, no quoting and no other syntax: a line of another form
// between the two `---` lines is not read. A text without the opening line has no front matter, and all of it is body; so is
// a text whose closing line is missing. Reading is modelled on parseFrontMatter of docs/assets/artifacts.mjs, which reads the
// same block.

const DELIMITER = "---";
const KEY = /^[a-z][a-z0-9_-]*$/;
const KEY_LINE = /^([a-z][a-z0-9_-]*):(.*)$/;
const ITEM_LINE = /^[ \t]+-[ \t]+(.*)$/;

// The line of `text` that begins at `from`: its text without the line ending, and where the next line begins.
function lineAt(text, from) {
  const lf = text.indexOf("\n", from);
  const raw = text.slice(from, lf < 0 ? text.length : lf);
  return { text: raw.endsWith("\r") ? raw.slice(0, -1) : raw, next: lf < 0 ? text.length : lf + 1 };
}

// parseFrontMatter(text: string) -> FrontMatter — the front matter of a text, as defined under Data. It never throws: a text
// without front matter, or whose closing line is missing, has empty `fields` and an empty `order`, and is all body from line
// 1. A caller that requires front matter checks that `order` is not empty. A key that stands twice holds its last value, at
// the place it first stood.
export function parseFrontMatter(text) {
  const t = typeof text === "string" ? text : String(text ?? "");
  const none = { fields: {}, order: [], body: t, bodyLine: 1 };
  const opening = lineAt(t, 0);
  if (opening.text !== DELIMITER) return none;
  const fields = {}, order = [];
  let list = null; // the list that item lines are added to, while a key that holds a list is the last key read
  let at = opening.next, number = 1;
  while (at < t.length) {
    const line = lineAt(t, at);
    number += 1;
    if (line.text === DELIMITER) return { fields, order, body: t.slice(line.next), bodyLine: number + 1 };
    const key = KEY_LINE.exec(line.text);
    if (key) {
      const [, name, rest] = key;
      const value = rest.trim();
      if (!Object.hasOwn(fields, name)) order.push(name);
      list = value === "" || value === "[]" ? [] : null;
      fields[name] = list ?? value;
    } else {
      const item = ITEM_LINE.exec(line.text);
      if (item && list) list.push(item[1].trim());
    }
    at = line.next;
  }
  return none;
}

// A value as it may stand on one line of front matter.
function oneLine(key, value) {
  if (typeof value !== "string") throw new TypeError(`formatFrontMatter: the value of ${key} is neither a text nor a list of texts`);
  if (/[\r\n]/.test(value)) throw new TypeError(`formatFrontMatter: the value of ${key} holds a line break`);
  return value;
}

// formatFrontMatter(fields: Record<string, string | string[]>, order: string[], body: string) -> string — the front matter
// with the keys in `order`, each text value on its key's line, each list one item per line as `  - item` and an empty list as
// `key:` alone, then the body unchanged. Lines end in LF. Without a key, the text is the body alone: a text without front
// matter is written back as it was read. formatFrontMatter of what parseFrontMatter read gives back the same bytes for a text
// written in this form. Throws TypeError for a key that is not [a-z][a-z0-9_-]*, a key without a value in `fields`, or a
// value holding a line break.
export function formatFrontMatter(fields, order, body) {
  const lines = [];
  for (const key of order) {
    if (typeof key !== "string" || !KEY.test(key)) {
      throw new TypeError(`formatFrontMatter: the key ${JSON.stringify(key)} is not of the form [a-z][a-z0-9_-]*`);
    }
    const value = fields != null && Object.hasOwn(fields, key) ? fields[key] : undefined;
    if (Array.isArray(value)) {
      lines.push(`${key}:`, ...value.map((item) => `  - ${oneLine(key, item)}`));
    } else {
      const text = oneLine(key, value);
      lines.push(text === "" ? `${key}:` : `${key}: ${text}`);
    }
  }
  const rest = typeof body === "string" ? body : String(body ?? "");
  return lines.length ? `${DELIMITER}\n${lines.join("\n")}\n${DELIMITER}\n${rest}` : rest;
}
