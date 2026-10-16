// MOD-personal-data — the people of a mail, and the search of a text for them. Pure: it calls no other module, sends no request and reads no file.

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

/**
 * Any stretch of whole digit groups inside a run whose digits equal a phone's digits: it begins at the run's start (a leading
 * `+` included) or after a separator, and ends at the run's end or before a separator.
 */
function phonesAt(text, phones) {
  const wanted = new Set(phones.map(digitsOf).filter(Boolean));
  const places = [];
  for (const run of text.matchAll(PHONE_RUN)) {
    const groups = [...run[0].matchAll(/\d+/g)];
    for (let first = 0; first < groups.length; first += 1) {
      let digits = "";
      for (let last = first; last < groups.length; last += 1) {
        digits += groups[last][0];
        if (wanted.has(digits)) {
          const from = first === 0 ? 0 : groups[first].index;
          places.push({ start: run.index + from, end: run.index + groups[last].index + groups[last][0].length });
        }
      }
    }
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

/**
 * @typedef {{ name: string | null, address: string }} HeaderAddress
 * @typedef {{ addresses: HeaderAddress[], text: string }} MailText
 */

const LOCAL_CHAR = "\\p{L}\\p{N}_%+\\-";
// local@domain: a local part of letters, digits and `_ % + -` joined by single dots, `@`, and a domain of labels joined by single dots,
// so that a dot closing a sentence is not part of the address.
const ADDRESS = new RegExp(`[${LOCAL_CHAR}]+(?:\\.[${LOCAL_CHAR}]+)*@[\\p{L}\\p{N}\\-]+(?:\\.[\\p{L}\\p{N}\\-]+)*`, "gu");
// `@` and letters, digits and `_`, which single `.` or `-` may join.
const HANDLE = /@[\p{L}\p{N}_]+(?:[.\-][\p{L}\p{N}_]+)*/gu;
const MIN_PHONE_DIGITS = 7;

const GREETING = /^(?:Dear|Hello|Hi|Hallo|Liebe|Lieber|Sehr geehrte|Sehr geehrter)[ \t]+(?:(?:Mr|Ms|Herr|Frau|Dr)\.?[ \t]+)?([^,]+)/iu;
const CLOSING = /^(?:Regards|Best regards|Kind regards|Best|Thanks|Cheers|Viele Grüße|Beste Grüße|Mit freundlichen Grüßen|Gruß|Grüße)[,.!]?$/iu;
const SIGNATURE_DELIMITER = "-- ";

/** What a text gives as a name: trimmed, without a closing period, `!`, `?`, `:` or `;`, and only if it holds a letter. */
function nameFrom(text) {
  const name = text.replace(/[.!?:;\s]+$/u, "").trim();
  return /\p{L}/u.test(name) ? name : null;
}

/** The names a text gives, in the order of its lines: after a greeting, after a closing, and the first line after the first `-- ` line. */
function namesIn(text) {
  const lines = text.split(/\r?\n/);
  const signatureAt = lines.indexOf(SIGNATURE_DELIMITER);
  const names = [];
  lines.forEach((line, index) => {
    const greeting = GREETING.exec(line);
    if (greeting) names.push(nameFrom(greeting[1]));
    const nextLine = index + 1 < lines.length ? lines[index + 1] : "";
    if (CLOSING.test(line.trim())) names.push(nameFrom(nextLine));
    if (index === signatureAt) names.push(nameFrom(nextLine));
  });
  return names.filter(Boolean);
}

/**
 * peopleIn(mail: MailText) -> People — every address and display name of the mail's headers, and every name, address, phone number
 * and account handle found in its text and its signature, each by its form. Deterministic; a person found twice (a name, address or
 * account regardless of case, a phone number by its digits) is listed once, as first found: the headers first, then the text.
 */
export function peopleIn(mail) {
  const text = String(mail?.text ?? "");
  const headers = Array.isArray(mail?.addresses) ? mail.addresses : [];

  const addresses = [...text.matchAll(ADDRESS)];
  const insideAddress = (handle) => addresses.some((found) => found.index <= handle.index && handle.index < found.index + found[0].length);
  const handles = [...text.matchAll(HANDLE)].filter((handle) => !insideAddress(handle));
  const phones = [...text.matchAll(PHONE_RUN)].map((run) => run[0]).filter((run) => digitsOf(run).length >= MIN_PHONE_DIGITS);

  const once = (list, key) => {
    const seen = new Set();
    return list.filter((entry) => { const id = key(entry); return seen.has(id) ? false : (seen.add(id), true); });
  };
  const lower = (value) => value.toLowerCase();
  return {
    names: once([...kept(headers.map((header) => header?.name)), ...namesIn(text)], lower),
    addresses: once([...kept(headers.map((header) => header?.address)), ...addresses.map((found) => found[0])], lower),
    phones: once(phones, digitsOf),
    accounts: once(handles.map((handle) => handle[0]), lower),
  };
}
