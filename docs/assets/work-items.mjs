// Backlog items and their order — an item file read into its parts, its findings, the order of the backlog, and an item
// from a classified issue (UC-032, UC-033; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY, A BACKLOG ITEM NAMES WHAT IT
// REALISES). Kernel (ARC-003): pure functions over the texts and data they are given; nothing is read, written or committed
// here, and no state is kept in or derived into these files (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED).
//
// Module: MOD-work-items
//
// An item is a Markdown file `docs/backlog/ITM-<nnn>-<slug>.md` of the product repository: front matter
//
//   id: ITM-<nnn>            title: <one line>          kind: <job kind>          level: <number>
//   realises:                — a list: requirement names in capitals and use cases UC-<nnn>
//   modules:, depends_on:    — lists, `[]` for none
//   origin:                  — where it came from: one line, or a list (an issue's address, several for UC-033 4a)
//
// and a body whose `## Outcome` and `## Acceptance criteria` sections are read as text. The order is
// `docs/backlog/order.md`: list items, each an item's identifier. A finding is { artifact, line, kind, rule, what, fix } —
// the compiler form of ARC-007, `line` counting from 1 in the text read; the sentence a person reads is the dashboard's
// (ARC-003 decision 5).

const LIVES = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
const NAMES = "A BACKLOG ITEM NAMES WHAT IT REALISES";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const IDENTIFIER = "EVERY ARTIFACT HAS AN IDENTIFIER";
// UC-032 step 3 flags a draft that restates an existing item; no requirement of the SPEC is broken by it, so the
// warning names the use case that asks for it.
const RESTATES = "UC-032";

const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const ITEM_PATH = new RegExp(`^docs/backlog/(ITM-\\d{3})-${SLUG}\\.md$`);
const ORDER_PATH = "docs/backlog/order.md";
const ITEM_ID = /^ITM-\d{3}$/;
const USE_CASE = /^UC-\d{3}$/;
// A requirement is named by its name in capitals; other identifiers are not names (as MOD-artifacts reads them).
const isRequirementName = (s) => /[A-Z]/.test(s) && !/[a-z]/.test(s) && !/^(UC|ARC|MOD|SRC|TST|ITM|RES|JOB)-/.test(s);
// An issue named by its address: on GitHub …/issues/<n>, on GitLab …/-/issues/<n>.
const ISSUE = /^https?:\/\/[^\s/]+\/\S+\/issues\/\d+$/;
const ORDER_LINE = /^\s*(?:\d+[.)]|[-*+])\s+(ITM-\d{3})\b/;

const finding = (artifact, line, kind, rule, what, fix) => ({ artifact, line, kind, rule, what, fix });

// Front matter: { fields: { key: { value: string | [string], line, items: [line] } }, end } — `end` is the index of the
// line after the closing "---", 0 without front matter. A key with no value followed by "  - " lines is a list; `[]` is
// the empty list; an empty value is "".
function frontMatter(lines) {
  if (lines[0] !== "---") return { fields: {}, end: 0 };
  const fields = {};
  let last = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") return { fields, end: i + 1 };
    const key = lines[i].match(/^([a-z][a-z0-9_]*):[ \t]*(.*?)[ \t]*$/);
    if (key) {
      last = fields[key[1]] = { value: key[2] === "[]" ? [] : key[2], line: i + 1, items: [] };
      continue;
    }
    const item = lines[i].match(/^\s+-\s+(.*?)\s*$/);
    if (item && last && (last.value === "" || Array.isArray(last.value))) {
      if (last.value === "") last.value = [];
      last.value.push(item[1]);
      last.items.push(i + 1);
    }
  }
  return { fields: {}, end: 0 };
}

// The text of the section under "## <heading>" up to the next heading of its level or above, trimmed; "" without one.
function section(lines, start, heading) {
  const at = lines.findIndex((l, i) => i >= start && l.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (at < 0) return "";
  const end = lines.findIndex((l, i) => i > at && /^#{1,2}\s/.test(l));
  return lines.slice(at + 1, end < 0 ? lines.length : end).join("\n").trim();
}

const list = (f) => (f && Array.isArray(f.value) ? [...f.value] : []);
const scalar = (f) => (f && typeof f.value === "string" && f.value ? f.value : null);

// parseItem(path, text) -> item — { path, id, title, kind, level, realises, modules, dependsOn, origins, issues, outcome,
// acceptance, lines: { id, title, realises, realisesItems, origin }, frontMatter, problems }. `origins` is every entry of
// `origin`; `issues` those that are an issue's address. `problems` are the findings of where and what the file is:
// a path other than docs/backlog/ITM-<nnn>-<slug>.md, no front matter, no title, no id or another one than the file name.
export function parseItem(path, text) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const { fields, end } = frontMatter(lines);
  const at = String(path ?? "").match(ITEM_PATH);
  const problems = [];
  if (!at) {
    problems.push(finding(path, 1, "error", LIVES, "the item is not a file docs/backlog/ITM-<nnn>-<slug>.md",
      "keep each backlog item as one Markdown file docs/backlog/ITM-<nnn>-<slug>.md of the product repository."));
  }
  const origin = fields.origin;
  const origins = Array.isArray(origin?.value) ? [...origin.value] : scalar(origin) ? [origin.value] : [];
  const level = scalar(fields.level);
  const item = {
    path, id: scalar(fields.id), title: scalar(fields.title), kind: scalar(fields.kind),
    level: level !== null && /^\d+$/.test(level) ? Number(level) : level,
    realises: list(fields.realises), modules: list(fields.modules), dependsOn: list(fields.depends_on),
    origins, issues: origins.filter((o) => ISSUE.test(o)),
    outcome: section(lines, end, "Outcome"), acceptance: section(lines, end, "Acceptance criteria"),
    lines: { id: fields.id?.line ?? null, title: fields.title?.line ?? null, realises: fields.realises?.line ?? null,
      realisesItems: fields.realises?.items ?? [], origin: origin?.line ?? null },
    frontMatter: end > 0, problems,
  };
  if (!end) {
    problems.push(finding(path, 1, "error", LIVES, "the item has no front matter",
      "begin the file with front matter: id, title, kind, level, realises, modules, depends_on, origin."));
    return item;
  }
  if (!item.id) {
    problems.push(finding(path, 1, "error", IDENTIFIER, "the item has no id",
      "name the item's identifier in its front matter: id: ITM-<nnn>, as in its file name."));
  } else if (at && item.id !== at[1]) {
    problems.push(finding(path, item.lines.id, "error", IDENTIFIER, `id "${item.id}" does not match the file name (${at[1]})`,
      `give the item the identifier of its file name, ${at[1]}, or name the file after its identifier.`));
  } else if (!ITEM_ID.test(item.id)) {
    problems.push(finding(path, item.lines.id, "error", IDENTIFIER, `id "${item.id}" is not ITM-<nnn>`,
      "name a backlog item ITM-<nnn>."));
  }
  if (!item.title) {
    problems.push(finding(path, 1, "error", LIVES, "the item has no title", "give the item a title: one line in its front matter."));
  }
  if (scalar(fields.realises)) {
    problems.push(finding(path, item.lines.realises, "error", NAMES, "realises is not a list",
      "list under realises: one requirement name or use case per line, each as \"  - <NAME>\"."));
  }
  return item;
}

// Words of a title or an outcome, for comparing two items: case, punctuation and spacing do not count.
const words = (s) => String(s ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// itemProblems(item, known) -> [finding] — the item's own problems, then: an error for an item that realises nothing,
// names something that is neither a requirement name nor a use case, names a requirement or a use case the product does
// not know, or names no origin; a warning for one whose title or outcome restates another item's. `known`:
// { requirements: [name] | null, useCases: [UC-<nnn>] | null, items: [item] } — the product's requirement names, in its
// SPEC and in its open change queues, its use cases, and the other items of its backlog; null checks the form only.
// The item may be a draft — a job's answer with title, outcome, realises and origins, without path or lines.
export function itemProblems(item, known = {}) {
  const out = [...(item?.problems ?? [])];
  if (item?.frontMatter === false) return out;
  const artifact = item?.path || item?.id || "new item";
  const lines = item?.lines ?? {};
  const realisesAt = lines.realises ?? 1;
  const requirements = Array.isArray(known?.requirements) ? new Set(known.requirements) : null;
  const useCases = Array.isArray(known?.useCases) ? new Set(known.useCases) : null;
  const realises = Array.isArray(item?.realises) ? item.realises : [];
  if (out.some((f) => f.rule === NAMES)) {
    // parseItem has said already what is wrong with the list (it is no list).
  } else if (!realises.length) {
    out.push(finding(artifact, realisesAt, "error", NAMES, "the item realises nothing",
      "name at least one requirement or use case the item realises, or remove the item."));
  } else {
    realises.forEach((name, i) => {
      const line = lines.realisesItems?.[i] ?? realisesAt;
      if (USE_CASE.test(name)) {
        if (useCases && !useCases.has(name)) {
          out.push(finding(artifact, line, "error", NAMES, `realises "${name}" matches no use case`,
            "name a use case the product has, or remove the line."));
        }
      } else if (isRequirementName(name)) {
        if (requirements && !requirements.has(name)) {
          out.push(finding(artifact, line, "error", NAMES, `realises "${name}" matches no requirement`,
            "use an existing requirement's name, or remove the line."));
        }
      } else {
        out.push(finding(artifact, line, "error", NAMES, `realises "${name}" is neither a requirement name nor a use case`,
          "name a requirement by its name in capitals, or a use case as UC-<nnn>."));
      }
    });
  }
  if (!(item?.origins ?? []).some((o) => String(o).trim())) {
    out.push(finding(artifact, lines.origin ?? 1, "error", ORIGIN, "the item names no origin",
      "name where the item came from under origin: an issue's address, a review, a refinement."));
  }
  const title = words(item?.title), outcome = words(item?.outcome);
  const other = (known?.items ?? []).find((o) => o && o.id !== item?.id
    && ((title && words(o.title) === title) || (outcome && words(o.outcome) === outcome)));
  if (other) {
    out.push(finding(artifact, lines.title ?? 1, "warning", RESTATES, `the item restates ${other.id} ("${other.title}")`,
      `extend ${other.id} instead, or say how this item differs from it.`));
  }
  return out;
}

// backlogOrder(text, items) -> { order, unplaced, problems } — the identifiers of the items in the order the order file
// names them, list item by list item (the numbers are not read), then the items it does not name yet, appended at the
// bottom in the order of their identifiers. A list item naming no item of the backlog, or one named before, is a problem.
export function backlogOrder(text, items) {
  const ids = new Set((items ?? []).map((i) => i?.id).filter(Boolean));
  const order = [], problems = [];
  String(text ?? "").replace(/\r\n/g, "\n").split("\n").forEach((l, i) => {
    const m = l.match(ORDER_LINE);
    if (!m) return;
    if (!ids.has(m[1])) {
      problems.push(finding(ORDER_PATH, i + 1, "error", LIVES, `the order names ${m[1]}, which is no item of the backlog`,
        `remove the line, or add the item docs/backlog/${m[1]}-<slug>.md.`));
    } else if (order.includes(m[1])) {
      problems.push(finding(ORDER_PATH, i + 1, "error", LIVES, `the order names ${m[1]} a second time`,
        "keep one line per item; remove the second."));
    } else {
      order.push(m[1]);
    }
  });
  const unplaced = [...ids].filter((id) => !order.includes(id)).sort();
  return { order: [...order, ...unplaced], unplaced, problems };
}

// itemFromIssue(issue, classification, queue) -> item | null — UC-033 step 2: the title and the outcome from the issue
// ({ title, body, url }), its address as the origin, and what it realises from its class: for a bug
// ({ kind: "bug", violated }) the requirement the code violates, for a change ({ kind: "change" }) the requirement names
// of the queue entries UC-012 wrote for the issue (`queue`: [{ names }]), each once. An issue that is neither a bug nor
// a change gives no item (UC-033 1a). The item has no identifier and no path until it is committed.
export function itemFromIssue(issue, classification, queue) {
  const kind = classification?.kind;
  if (kind !== "bug" && kind !== "change") return null;
  const named = kind === "bug" ? [classification.violated].flat() : (queue ?? []).flatMap((e) => e?.names ?? []);
  const realises = [...new Set(named.filter((n) => typeof n === "string" && n))];
  const url = issue?.url ? String(issue.url) : null;
  const origins = url ? [url] : [];
  return {
    path: null, id: null, title: issue?.title ? String(issue.title) : null, kind: "implementation", level: null,
    realises, modules: [], dependsOn: [], origins, issues: origins.filter((o) => ISSUE.test(o)),
    outcome: issue?.body ? String(issue.body).trim() : "", acceptance: "",
    lines: { id: null, title: null, realises: null, realisesItems: [], origin: null }, frontMatter: true, problems: [],
  };
}
