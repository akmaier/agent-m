// MOD-personal-data — the search of a text for a mail's people. Pure: it calls no other module, sends no request and reads no file.

/**
 * @typedef {{ names: string[], addresses: string[], phones: string[], accounts: string[] }} People
 * @typedef {{ kind: "name" | "address" | "phone" | "account", value: string, line: number, column: number }} Hit
 */

const KINDS = ["name", "address", "phone", "account"];
const LETTER_OR_DIGIT = "\\p{L}\\p{N}";
const NOT_AFTER = `(?<![${LETTER_OR_DIGIT}])`;
const NOT_BEFORE = `(?![${LETTER_OR_DIGIT}])`;
// A run of digits that may start with `+` and be separated by blanks, hyphens, slashes, dots or parentheses, within one line.
const PHONE_RUN = new RegExp(`${NOT_AFTER}\\+?\\d(?:[ \\t\\u00a0\\-/.()]*\\d)*${NOT_BEFORE}`, "gu");

const literal = (text) => text.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");
const digitsOf = (text) => text.replace(/\D/g, "");
const kept = (list) => (Array.isArray(list) ? list : []).filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);

/** Every place where `needle` stands as a whole word in `text`, whatever its case (`lead` may stand before it): { start, end } in UTF-16 units. */
function wordAt(text, needle, lead = "") {
  const places = [];
  for (const match of text.matchAll(new RegExp(`${NOT_AFTER}${lead}${literal(needle)}${NOT_BEFORE}`, "giu"))) {
    places.push({ start: match.index, end: match.index + match[0].length });
  }
  return places;
}

function phonesAt(text, phones) {
  const wanted = new Set(phones.map(digitsOf).filter(Boolean));
  const places = [];
  for (const match of text.matchAll(PHONE_RUN)) {
    if (wanted.has(digitsOf(match[0]))) places.push({ start: match.index, end: match.index + match[0].length });
  }
  return places;
}

/** Where each line of `text` begins, as the offset of its first unit; a line ends at "\n" or "\r\n". */
function lineStarts(text) {
  const starts = [0];
  for (const match of text.matchAll(/\r?\n/g)) starts.push(match.index + match[0].length);
  return starts;
}

/**
 * personHits(text: string, people: People) -> Hit[] — every place in `text` where one of `people` appears: a name whole and
 * by each of its parts (what blanks separate in it), an address whole and by its local part, a phone number by its digits
 * whatever the separators, an account with or without its leading `@`; regardless of case, and only as a whole word — no
 * letter or digit stands directly before or after it. `value` is the text as it stands in `text`; `line` and `column`
 * count from 1, the column in UTF-16 units. A part found inside the whole it belongs to is not a hit of its own. Hits are
 * given by line, then column, and at one place in the order of the kinds name, address, phone, account. An empty result
 * means the text names none of them; it says nothing about people the mail does not name.
 */
export function personHits(text, people) {
  const source = String(text ?? "");
  const found = [];
  const add = (kind, places) => { for (const place of places) found.push({ kind, ...place }); };

  for (const name of kept(people?.names)) {
    add("name", wordAt(source, name));
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length > 1) for (const part of parts) add("name", wordAt(source, part));
  }
  for (const address of kept(people?.addresses)) {
    add("address", wordAt(source, address));
    const at = address.indexOf("@");
    if (at > 0) add("address", wordAt(source, address.slice(0, at)));
  }
  add("phone", phonesAt(source, kept(people?.phones)));
  for (const account of kept(people?.accounts)) {
    const bare = account.replace(/^@/, "");
    if (bare) add("account", wordAt(source, bare, "@?"));
  }

  const contained = (hit) => found.some((other) => other.kind === hit.kind && other.start <= hit.start && hit.end <= other.end
    && (other.end - other.start > hit.end - hit.start));
  const once = new Set();
  const hits = found.filter((hit) => {
    if (contained(hit)) return false;
    const key = `${hit.kind}:${hit.start}:${hit.end}`;
    return once.has(key) ? false : (once.add(key), true);
  });
  hits.sort((a, b) => a.start - b.start || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind));

  const starts = lineStarts(source);
  return hits.map((hit) => {
    let line = starts.length;
    while (starts[line - 1] > hit.start) line -= 1;
    return { kind: hit.kind, value: source.slice(hit.start, hit.end), line, column: hit.start - starts[line - 1] + 1 };
  });
}
