// propose.mjs — the sections a draft of requirements changes, the writer of classified candidates and the writer of drafted texts (MOD-spec-changes, Parts: propose.mjs; Interfaces: entrySections, specStrategies).
//
// Module: MOD-spec-changes
//
// Pure: it reads only the texts it is given, and performs no input or output. A section's bytes are MOD-spec-document's: the slice of
// the SPEC from its heading line to the next heading of level two. A draft is `{ candidates }` as the kind derive-requirements
// returns it, and `classes` are MOD-documents' Classified, one for the candidates merged into it, whose first ref is
// the name of the candidate whose rule and check it takes. Where the module file leaves a reading open, this file states the one it takes:
//
//   - A `new` requirement is added at the end of the section of the requirement its class's `of` names when the SPEC holds it, else of the
//     last section; with no section in the SPEC there is no place, and it is a RangeError.
//   - A `change` replaces the requirement's block by its name as it stands, the sources it states with the job's added, and the
//     candidate's rule and check, each on one line; a `duplicate` adds the job's sources to the head line and touches no other byte. A
//     `change` or a `duplicate` of a requirement the SPEC does not hold is RequirementNotFound { requirements }, naming every such name
//     in the order of the classes. The sources of the rule a candidate points to are those the requirement states: they are kept.
//   - The job's source is one item for each passage of the class, `<source>, <passage>`, or the source alone for none; a person's account,
//     as MOD-source-register's namesAccount tells it, stands alone whatever passage the class names. An item the requirement names already
//     is not added again.
//   - A candidate without a class, and a `conflict`, are not composed: a conflict is composed as the person resolved it, that is, as the
//     class they gave it. A section whose text the draft leaves as it is is not returned; the sections come in the order of the SPEC.
//   - Two candidates change one requirement when two of the classes composed are `change` with one `of`. That is TwoChanges, thrown after
//     RequirementNotFound: its `candidates` are the names of every such candidate in the order of the classes, its `requirement` the name
//     they change (the error's own `name` is its kind, as with every error of this module). A `change` and a `duplicate` of one requirement
//     are not two changes: the duplicate adds its source to the block the change left.
//   - The line end of a section is that of its first line.

import { classifyCandidates, documentFindings, readDocument } from "../documents/index.mjs";
import { provenanceLines } from "../job-runner/index.mjs";
import { linkedVersion, namesAccount, sourceSchemas } from "../source-register/index.mjs";
import { fallbackEditLinks } from "../artifact-edits/fallback.mjs";
import { parseSpec, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { requirementImpact } from "../trace-graph/index.mjs";
import { graphOf, impactOf } from "./accept.mjs";
import { issueLine, nextEntry, PLACES_SUFFIX, queueRationaleSchema, queues, spanText } from "./queues.mjs";

const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });
const folded = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const HEADING = /^#{1,6}\s/;
const SOURCE_START = "*(";
const SOURCE_END = ")*";

// The lines of a text, each with its line end.
const linesOf = (text) => text.split(/(?<=\n)/);
const isBlank = (line) => line.trim() === "";

// The requirement `name` of a section's text: the places of its first and last line in `lines`, and the requirement.
function located(sectionText_, lines, name) {
  const spec = parseSpec(sectionText_);
  const requirement = spec.requirements.get(name);
  const others = new Set([...spec.requirements.values()].map((each) => each.line - 1));
  const first = requirement.line - 1;
  let end = first + 1;
  while (end < lines.length && !isBlank(lines[end]) && !HEADING.test(lines[end]) && !others.has(end)) end++;
  return { first, end, requirement };
}

// A head line block with the items added to its source: raw source text kept, items after it; a block without a source gets one
// after its name.
function withSources(block, name, items) {
  if (items.length === 0) return block;
  const head = `**${name}**`;
  const at = block.indexOf(SOURCE_START, head.length);
  const end = at < 0 ? -1 : block.indexOf(SOURCE_END, at);
  if (end < 0) return `${head} ${SOURCE_START}${items.join("; ")}${SOURCE_END}${block.slice(head.length)}`;
  return `${block.slice(0, end).trimEnd()}; ${items.join("; ")}${block.slice(end)}`;
}

/**
 * entrySections(spec, draft, classes, source) -> Array<{ anchor, until, text, places }> — the sections of `spec` that the draft's candidates
 * change, each as the whole section's new text, composed by `classes`, and the places of the candidates it adds as `new` that name a place —
 * { requirement, place: Place }, of merged candidates the one whose rule it takes —; every other candidate keeps the place of the requirement it
 * refers to. No place stands in the text. Every other byte of a section stays as it is. Pure. Throws TwoChanges
 * { requirement, candidates } when two candidates change one requirement, and composes nothing.
 * @param {string} spec
 * @param {unknown} draft
 * @param {Array<{ refs: string[], from: string[], class: string, of: string | null }>} classes
 * @param {string} source the job's source
 */
export function entrySections(spec, draft, classes, source) {
  if (typeof source !== "string" || source.trim() === "") throw new TypeError("entrySections needs the job's source as text");
  const text = String(spec ?? "");
  const parsed = parseSpec(text);
  const drafted = Array.isArray(draft?.candidates) ? draft.candidates : [];
  const composed = (Array.isArray(classes) ? classes : []).map((each) => ({ each, candidate: drafted.find((item) => item?.name === each.refs?.[0]) }))
    .filter(({ each, candidate }) => candidate && each.class !== "conflict" && ["new", "change", "duplicate"].includes(each.class));

  const missing = composed.filter(({ each }) => each.class !== "new" && !parsed.requirements.has(each.of)).map(({ each }) => each.of);
  if (missing.length > 0) {
    const names = [...new Set(missing)];
    throw failure("RequirementNotFound", `the SPEC holds no requirement ${names.join(", ")}`, { requirements: names });
  }

  const changing = new Map();
  for (const { each, candidate } of composed) if (each.class === "change") changing.set(each.of, [...(changing.get(each.of) ?? []), candidate.name]);
  const twice = [...changing].find(([, names]) => names.length > 1);
  if (twice) {
    const [requirement, names] = twice;
    throw failure("TwoChanges", `${names.slice(0, -1).join(", ")} and ${names.at(-1)} change ${requirement}: one block would replace the other. Nothing was composed.`,
      { requirement, candidates: names });
  }

  const texts = new Map(), places = new Map();
  const current = (heading) => (texts.has(heading) ? texts.get(heading) : sectionText(text, heading));
  for (const { each, candidate } of composed) {
    const held = parsed.requirements.get(each.of);
    const heading = each.class === "new"
      ? (held?.section ?? parsed.sections.at(-1)?.heading)
      : held.section;
    if (heading === undefined || heading === null) throw new RangeError("the SPEC has no section to add a requirement to");
    const section = current(heading);
    const eol = /\r\n/.test(section.split(/(?<=\n)/)[0] ?? "") ? "\r\n" : "\n";
    // A passage is only a locator into a registered source; a person's account stands alone, whatever passage the draft holds.
    const items = (each.from.length > 0 && !namesAccount(source) ? each.from : [null]).map((passage) => (passage === null ? source : `${source}, ${passage}`));
    if (each.class === "new") {
      const block = `**${folded(candidate.name)}** ${SOURCE_START}${[...new Set(items)].join("; ")}${SOURCE_END}${eol}${folded(candidate.rule)}${eol}*Check:* ${folded(candidate.check)}`;
      const next = section.endsWith(`${eol}${eol}`) ? `${section}${block}${eol}${eol}`
        : section.endsWith("\n") ? `${section}${eol}${block}${eol}` : `${section}${eol}${eol}${block}`;
      texts.set(heading, next);
      const place = placeOf(candidate.place);
      if (place) places.set(heading, [...(places.get(heading) ?? []), { requirement: folded(candidate.name), place }]);
      continue;
    }
    const lines = linesOf(section);
    const { first, end, requirement } = located(section, lines, each.of);
    const added = [...new Set(items)].filter((item) => !requirement.sources.includes(item));
    const old = lines.slice(first, end).join("");
    const last = old.match(/(\r?\n)?$/)[0];
    const body = old.slice(0, old.length - last.length);
    const block = each.class === "duplicate" ? withSources(body, requirement.name, added)
      : withSources(`**${requirement.name}**${requirement.source === null ? "" : ` ${SOURCE_START}${requirement.source}${SOURCE_END}`}${eol}${folded(candidate.rule)}${eol}*Check:* ${folded(candidate.check)}`, requirement.name, added);
    texts.set(heading, [...lines.slice(0, first), `${block}${last}`, ...lines.slice(end)].join(""));
  }
  return parsed.sections.filter((section) => texts.has(section.heading) && texts.get(section.heading) !== sectionText(text, section.heading))
    .map((section) => ({ anchor: section.heading, until: null, text: texts.get(section.heading), places: places.get(section.heading) ?? [] }));
}

// A candidate's place as a MOD-group-document Place { group, new }, or null where it names none: `group` a list of titles, `new` a title or null.
function placeOf(place) {
  if (!place || typeof place !== "object" || !Array.isArray(place.group)) return null;
  const title = typeof place.new === "string" && place.new.trim() !== "" ? place.new.trim() : null;
  return { group: place.group.map((each) => String(each).trim()), new: title };
}

// ---------------------------------------------------------------- the writer of classified candidates (specStrategies: queue-entries)
//
// queue-entries(result, context) -> WriteOutcome — the candidates of the job's result written by the classes the person left them in, each section they touch as an entry of that section's
// queue of the SPEC it belongs in: a candidate that constrains the development process in the instance's SPEC, every other in the product's; one commit for each of the two that gets an entry.
// Where the module file leaves a reading open, this file states the one it takes:
//   - A candidate's class is the one in `result.classes` for its name; one without a class is not written, and a note names it (`<name> has no class; it is not written.`); a
//     draft that holds no candidate writes nothing, its one note `the draft holds no requirement; nothing is written.`. A process candidate's class is decided anew with classifyCandidates over the
//     instance's SPEC and the requirements of its open queues, with the name and the rule as the key; a candidate that restates a requirement only an open entry holds, or that changes,
//     adds a source to or contradicts one its SPEC does not hold, is not written and the outcome's notes name it.
//   - A candidate's `source` names a source it points to; `linkedVersion` over the product's links and the instance's register gives none for one the product does not link, and the candidate
//     is not written: the note names the candidate and the source, as the hint to link it first (UC-005 5a).
//   - Each entry goes into its section's queue as `sectionEntry` writes it, and `SPEC.md` is every entry's target. The files this call has written in a repository count as the repository's,
//     so that a product that is its own instance gives no number twice.
//   - The impact list of an entry names, for each requirement it changes, the artifacts MOD-trace-graph's requirementImpact finds that name it, or that none does; a new requirement has none.
//   - Nothing is written to a repository when every section already stands as written; the SPEC is never written.
//   - The version of the source that a rationale's origin names is the one `linkedVersion` gives for the job's source, the version the product links and the job read: the sentence `Source version: <version>.`
//     follows the sentence that names the source and its passages. A source the product links at no version is named without one.
//   - The job's parameter `issue` counts when it is a positive whole number, given as a number or its digits; the issue is the product's, at the context's `product.address`. Each rationale's
//     origin names it after the source, `issue #<number> of <address>`, and each rationale, the instance's too, holds its line `**Issue:**` after the origin. Without it, nothing names an issue.

const REGISTER_FILE = /^docs\/sources\/SRC-[^/]+\.md$/;

const slugOf = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const headingText = (heading) => heading.replace(/^#+\s*/, "");
// A section's heading without its number, `## 10. Review on GitHub Pages` read as `Review on GitHub Pages`; the preamble's title line has none.
const unnumbered = (heading) => headingText(heading).replace(/^\d+[a-z]?[.)]?\s+/, "");
// The package of a section, the name of its queue (MOD-spec-changes, Data): its heading without its number, in lower case, each run of characters other than letters and digits one `-`.
const packageOf = (heading) => slugOf(unnumbered(heading)) || "section";
const pad2 = (n) => String(n).padStart(2, "0");

// One new entry of a section's queue, docs/spec-freigaben/<package>/ (MOD-spec-changes, Data), planned into `planned`, the texts by path this call writes in the repository, which are read
// before the snapshot: the queue's index with the entry's row appended, or, where there is no such queue yet, its index and its decisions started; the proposal NN-<package>.md and the
// rationale NN-<package>.begruendung.md, and the places file NN-<package>.plaetze.md where `places` holds a place. Its number is one more than any the queue's
// index or decisions name. -> { folder, number, paths }, the paths it planned, the rationale's last.
async function sectionEntry(snapshot, { target, anchor, until, text, rationale, places = [] }, planned) {
  const held = new Map();
  const read = async (path) => {
    if (planned.has(path)) return planned.get(path);
    if (!held.has(path)) held.set(path, await snapshot.read(path));
    return held.get(path);
  };
  const name = packageOf(anchor), folder = `docs/spec-freigaben/${name}`, heading = unnumbered(anchor);
  const index = await read(`${folder}/index.md`);
  const number = await nextEntry({ read }, folder);
  const row = `| ${pad2(number)} | \`${target}\` | ${anchor} | ${until ?? "—"} | — |\n`;
  const paths = [`${folder}/index.md`, `${folder}/${pad2(number)}-${name}.md`, `${folder}/${pad2(number)}-${name}.begruendung.md`];
  if (index === null) {
    planned.set(paths[0], [`# SPEC approvals — queue ${name} · ${heading}`, "", `**Zieldatei aller Einträge:** \`${target}\``, "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", row].join("\n"));
    planned.set(`${folder}/entscheidungen.md`, `# Decisions — queue ${name} ${heading}\n\nAppend-only.\n`);
    paths.splice(1, 0, `${folder}/entscheidungen.md`);
  } else {
    planned.set(paths[0], `${index}${index === "" || index.endsWith("\n") ? "" : "\n"}${row}`);
  }
  planned.set(paths.at(-2), text);
  planned.set(paths.at(-1), rationale);
  const proposed = (Array.isArray(places) ? places : []).filter((each) => each?.place && Array.isArray(each.place.group));
  if (proposed.length > 0) {
    const placesPath = `${folder}/${pad2(number)}-${name}${PLACES_SUFFIX}`;
    planned.set(placesPath, placesText(heading, number, proposed));
    // Before the proposal and the rationale, so that the rationale stays the last path, as the callers read it.
    paths.splice(paths.length - 2, 0, placesPath);
  }
  return { folder, number, paths };
}

// The text of an entry's places file (MOD-spec-changes, Data; queue-places.schema.md): the title line `# Places — <heading>: entry NN` and the places
// table, one row per requirement, `Group` the titles from the top separated by ` / ` and `—` for the top level, `New group` its title or `—`.
const placeCell = (value) => String(value).replace(/\|/g, "\\|");
function placesText(heading, number, places) {
  const rows = places.map(({ requirement, place }) => `| ${placeCell(requirement)} | ${place.group.length ? place.group.map(placeCell).join(" / ") : "—"} | ${place.new ? placeCell(place.new) : "—"} |`);
  return [`# Places — ${heading}: entry ${pad2(number)}`, "", "| Requirement | Group | New group |", "|---|---|---|", ...rows, ""].join("\n");
}

// What an entry changes: the requirements of its new section that the composed candidates account for, each as its candidate's class says.
function changesOf(section, composed, spec) {
  const names = new Set(parseSpec(section.text).requirements.keys());
  const found = [];
  for (const { each, candidate } of composed) {
    if (each.class === "new" && names.has(candidate.name)) found.push({ kind: "new", name: candidate.name, each });
    if (each.class === "change" && names.has(each.of)) found.push({ kind: "change", name: each.of, each });
    if (each.class === "duplicate" && names.has(each.of)) found.push({ kind: "duplicate", name: each.of, each });
  }
  return found.filter((change) => change.kind === "new" || spec.requirements.has(change.name));
}

const describeChange = (change) => (change.kind === "new" ? `adds ${change.name}` : change.kind === "change" ? `changes ${change.name}` : `adds a source to ${change.name}`);

// The origin a prompt names: a conversation in the prompt bar on its page, never a message of it.
const conversationOf = (page) => `a conversation in the prompt bar${page ? ` on ${page}` : ""}`;

// The origin of a drafted entry: the source with its passages, the issue it comes from, the source's version, and the conversation it was asked in — never a message of it.
const originText = (job, passages = []) => `Source ${job.source}${passages.length ? `, passages: ${passages.join("; ")}` : ""}${job.issue ? `; issue #${job.issue.number} of ${job.issue.product}` : ""}.${job.sourceVersion ? ` Source version: ${job.sourceVersion}.` : ""}${job.prompted ? ` Asked in ${conversationOf(job.page)}.` : ""}`;

// The job's parameter `issue`, when it is a positive whole number: the product's issue, at the context's address; null otherwise.
const issueOfJob = (context) => (/^[1-9]\d*$/.test(String(context.params?.issue ?? "").trim()) ? { number: Number(context.params.issue), product: context.product.address } : null);

// The text of one rationale, in the schema queue-rationale.
function rationaleOf(section, changes, graph, job) {
  const impact = changes.map((change) => {
    if (change.kind === "new") return `- ${change.name}: new; nothing names it yet.`;
    const names = requirementImpact(graph, change.name).map((entry) => `${entry.id} (${entry.via})`);
    return `- ${change.name}: ${names.length ? `named by ${names.join(", ")}` : "nothing names it"}.`;
  });
  // The origin names no passage of a person's instruction: what an account draws on is a message of the conversation.
  const passages = namesAccount(job.source) ? [] : [...new Set(changes.flatMap((change) => change.each.from))];
  const candidates = changes.map((change) => `${change.name}: ${change.candidate.rule}`);
  return [`# ${headingText(section.anchor)}: ${changes.map(describeChange).join("; ")}`, "",
    `**The change.** ${changes.map(describeChange).join("; ")}. The rest of the section is carried over byte for byte.`, "",
    `**Why.** Drafted from ${job.source}${job.prompted ? " on the person's instruction" : ""}: ${candidates.join(" · ")}`, "",
    "**Impact list.**", ...impact, "",
    `**Origin.** ${originText(job, passages)}`, "",
    ...(job.issue ? [issueLine(job.issue), ""] : []),
    `**Provenance.** Agent M ${job.agentM.version}, commit ${job.agentM.commit}; participant ${job.participant.name}; model ${job.participant.model ?? "none"}; ${job.date}; correction rounds: ${job.rounds}.`, ""].join("\n");
}

// The requirements a SPEC holds and those the open entries of its queues hold, for classifyCandidates: { id, keys }, an open entry's tagged with its queue.
async function existingOf(snapshot, specText) {
  const inSpec = [...parseSpec(specText).requirements.values()].map((requirement) => ({ id: requirement.name, keys: [requirement.name, requirement.rule ?? ""] }));
  const open = [];
  for (const queue of await queues(snapshot)) {
    for (const entry of queue.entries.filter(({ state }) => state !== "in SPEC")) {
      const proposal = await snapshot.read(entry.proposal.path);
      for (const requirement of parseSpec(proposal ?? "").requirements.values()) open.push({ id: requirement.name, keys: [requirement.name, requirement.rule ?? ""], queue: queue.folder });
    }
  }
  return { inSpec, open };
}

export async function queueEntries(result, context) {
  const drafted = Array.isArray(result?.draft?.candidates) ? result.draft.candidates : [];
  const classes = Array.isArray(result?.classes) ? result.classes : [];
  const source = String(context.params?.source ?? "");
  const prompted = typeof context.params?.instruction === "string";
  const page = typeof context.params?.page === "string" && context.params.page.trim() ? context.params.page.trim() : null;
  const issue = issueOfJob(context);
  const notes = [];
  // A draft that holds no candidate writes nothing, and its one note says so, so that a run that writes nothing names why.
  if (drafted.length === 0) return { commits: [], files: [], pullRequest: null, shown: null, notes: ["the draft holds no requirement; nothing is written."] };

  // The sources the product links.
  const { entry: entrySchema, links: linksSchema } = sourceSchemas();
  let linked = null;
  const linkOf = async (name) => {
    if (linked === null) {
      const linksText = await context.product.snapshot.read("docs/sources.md");
      const register = [];
      for (const path of context.instance.snapshot.paths.filter((each) => REGISTER_FILE.test(each))) {
        const text = await context.instance.snapshot.read(path);
        if (text !== null) register.push(readDocument(entrySchema, path, text));
      }
      linked = (item) => (linksText === null ? null : linkedVersion(readDocument(linksSchema, "docs/sources.md", linksText), register, item));
    }
    return linked(name);
  };
  const isLinked = async (name) => (await linkOf(name)) !== null;
  const writable = [];
  for (const candidate of drafted) {
    if (typeof candidate.source === "string" && candidate.source !== "" && !(await isLinked(candidate.source))) {
      notes.push(`${candidate.name} points to ${candidate.source}, which the product does not link: link the source first (UC-015); the candidate is not written.`);
    } else writable.push(candidate);
  }

  const outcome = { commits: [], files: [], pullRequest: null, shown: null, notes };
  const date = context.now.toISOString().slice(0, 10);
  const sourceVersion = (await linkOf(source))?.version.version ?? null;
  const job = { source, sourceVersion, prompted, page, issue, agentM: context.agentM, participant: result.drafter ?? { name: "none", model: null }, rounds: result.rounds?.length ?? 0, date };
  // A product that is its own instance may be held in two checkouts, as a hosted job holds it: its process queue is written through the product's
  // host too, the one whose commits the job's result carries.
  const web = (side) => side?.snapshot?.repository?.web ?? null;
  const ownInstance = web(context.product) !== null && web(context.product) === web(context.instance);
  const targets = [
    { where: context.product, mine: writable.filter((candidate) => candidate.constrains !== "process"), decide: false },
    { where: ownInstance ? { ...context.instance, host: context.product.host } : context.instance, mine: writable.filter((candidate) => candidate.constrains === "process"), decide: true },
  ];
  // Every target's sections are composed before any commit is made, so that a refusal of the second target (TwoChanges) leaves the first unwritten too.
  const plans = [];
  for (const { where, mine, decide } of targets) {
    if (mine.length === 0) continue;
    const specText = await where.snapshot.read("SPEC.md");
    if (specText === null) { notes.push(`${mine.map((candidate) => candidate.name).join(", ")}: the SPEC of the repository could not be read; nothing is written there.`); continue; }
    const spec = parseSpec(specText);
    let decided;
    if (decide) {
      const { inSpec, open } = await existingOf(where.snapshot, specText);
      decided = classifyCandidates(mine.map((candidate) => ({ ref: candidate.name, keys: [candidate.name, candidate.rule ?? ""], from: [candidate.passage].filter(Boolean),
        proposed: { class: candidate.class, of: candidate.of ?? null } })), [...inSpec, ...open]);
      for (const each of decided) {
        const held = open.find((item) => item.id === each.of && !spec.requirements.has(item.id));
        if (each.class !== "new" && held) notes.push(`${each.refs[0]} restates or changes ${held.id}, which only the open queue ${held.queue} holds; it is not written.`);
      }
    } else {
      // A candidate of the product's SPEC for which the classes hold none is not written, and a note names it.
      decided = [];
      for (const candidate of mine) {
        const found = classes.find((each) => each.refs?.includes(candidate.name));
        if (found) decided.push(found);
        else notes.push(`${candidate.name} has no class; it is not written.`);
      }
    }
    const composable = decided.filter((each) => each.class === "new" || spec.requirements.has(each.of));
    for (const each of decided) {
      if (each.class !== "new" && !spec.requirements.has(each.of) && !notes.some((note) => note.startsWith(`${each.refs[0]} `))) {
        notes.push(`${each.refs[0]} is classed ${each.class} of ${each.of}, which the SPEC does not hold; it is not written.`);
      }
    }
    const sections = entrySections(specText, { candidates: mine }, composable, source);
    if (sections.length > 0) plans.push({ where, mine, spec, composable, sections });
  }

  // Every refusal that depends only on the draft and the context is raised before the first commit, so that a refusal of the second repository leaves the first unwritten too:
  // NoHost for every repository that gets a queue, then the composing of each queue, whose rationale breaks its schema or not. Moved is known only by committing and stays in the second loop.
  for (const { where } of plans) {
    if (!where.host) throw Object.assign(new Error("the repository the queue belongs to has no host to commit to"), { name: "NoHost" });
  }

  // The texts this call writes, by repository, so that a repository that gets entries twice — a product that is its own instance — gives no number twice.
  const written = new Map();
  const prepared = [];
  for (const { where, mine, spec, composable, sections } of plans) {
    const graph = await graphOf(where.snapshot);
    const repository = web(where) ?? where.snapshot;
    if (!written.has(repository)) written.set(repository, new Map());
    const planned = written.get(repository);
    const composed = composable.map((each) => ({ each, candidate: mine.find((candidate) => candidate.name === each.refs[0]) })).filter(({ candidate }) => candidate);
    const paths = [], ids = [];
    for (const section of sections) {
      const changes = changesOf(section, composed, spec).map((change) => ({ ...change, candidate: composed.find(({ each }) => each === change.each).candidate }));
      const rationale = rationaleOf(section, changes, graph, job);
      const entry = await sectionEntry(where.snapshot, { target: "SPEC.md", anchor: section.anchor, until: section.until, text: section.text, rationale, places: section.places }, planned);
      const findings = documentFindings(queueRationaleSchema, readDocument(queueRationaleSchema, entry.paths.at(-1), rationale));
      if (findings.length) throw Object.assign(new Error(`the rationale of entry ${pad2(entry.number)} of the queue ${entry.folder} breaks its schema: ${findings[0].what}`), { name: "RationaleInvalid" });
      paths.push(...entry.paths.filter((path) => !paths.includes(path)));
      ids.push(`${entry.folder.split("/").pop()} ${pad2(entry.number)}`);
    }
    const trailers = provenanceLines({ agentM: context.agentM, jobId: context.jobId ?? "none", kind: context.kind?.name ?? "none", participant: job.participant, rounds: job.rounds });
    prepared.push({ where, planned, paths, message: `Propose ${sections.length} SPEC ${sections.length === 1 ? "change" : "changes"} as ${sections.length === 1 ? "the entry" : "the entries"} ${ids.join(", ")}\n\n${trailers.join("\n")}` });
  }

  // Two commits through one host follow each other: the second is committed on the first.
  let last = null;
  for (const { where, planned, paths, message } of prepared) {
    const { defaultBranch } = await where.host.repositoryInfo();
    const head = last?.host === where.host ? last.commit : where.snapshot.commit ?? null;
    const files = paths.map((path) => ({ path, text: planned.get(path) }));
    const committed = await where.host.commitFiles({ branch: defaultBranch, expectedHead: head, files, message });
    last = { host: where.host, commit: committed.commit };
    outcome.commits.push(committed.commit);
    outcome.files.push(...paths);
  }
  return outcome;
}
// ---------------------------------------------------------------- a person's edit of one section
//
// proposeSection: the edit is an entry of its section's queue, as `sectionEntry` writes it. Where the module file leaves a reading open, this file takes the one it names:
//   - `alsoReplacing` names every entry of any queue, not in SPEC, for the same target file and anchor; the new entry replaces none of them.
//   - A host with no token is one whose repositoryInfo says `canWrite: false`; the server is the snapshot's repository.server.

// The rationale of an edit of one section: the change, the Why, the impact list and the origin, in the schema queue-rationale.
function sectionRationale(change, impact, origin = `${folded(change.origin)}; saved by ${change.person}.`) {
  const named = impact.length ? impact.map((item) => item.name).join(", ") : "no requirement";
  const what = impact.length ? impact.map((item) => `${item.change} ${item.name}`).join("; ") : "changes the text of the section";
  const lines = impact.length
    ? impact.map((item) => `- ${item.name}: ${item.change}; ${item.referencedBy.length ? `named by ${item.referencedBy.join(", ")}` : "nothing names it"}.`)
    : ["- no requirement of the section changes."];
  return [`# ${headingText(change.anchor)}: ${named}`, "", `**The change.** ${what[0].toUpperCase()}${what.slice(1)}; the rest of the section is as the person wrote it.`, "",
    `**Why.** ${folded(change.why)}`, "", "**Impact list.**", ...lines, "", `**Origin.** ${origin}`, "", ...(change.issue ? [issueLine(change.issue), ""] : [])].join("\n");
}

// The paths the repository held when the edit was opened on the commit `openedHead`: none for an edit opened on no commit (an empty repository), those of `snapshot` — the one the save has
// read — where it stands at that commit, else those of the repository at that commit, read for the purpose.
async function pathsWhenOpened(host, snapshot, openedHead) {
  if (openedHead === null) return new Set();
  if (openedHead === snapshot.commit) return new Set(snapshot.paths);
  return new Set((await host.readSnapshot(openedHead)).paths);
}

// The pages of GitHub's web interface for the files of an entry, each marked as differing where its file exists on the default branch otherwise than at the commit the edit was opened on.
async function pagesFor(host, snapshot, openedHead, files) {
  const began = await pathsWhenOpened(host, snapshot, openedHead);
  return fallbackEditLinks(files.map((file) => ({ ...file, existing: began.has(file.path) })), snapshot);
}

// The commit of an entry, or, where GitHub refuses it for a missing write permission (`PermissionMissing`), nothing written and GitHub's pages instead, as for a person with no token (UC-018 6b).
// On GitLab, which has no such fallback, and for every other failure, the failure is thrown as it came.
async function commitOrPages(host, snapshot, openedHead, files, commit) {
  try {
    return await host.commitFiles(commit);
  } catch (failure) {
    if (failure?.name !== "PermissionMissing" || snapshot.repository.server === "gitlab") throw failure;
    return { fallback: await pagesFor(host, snapshot, openedHead, files) };
  }
}

export async function proposeSection(host, change) {
  const info = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(info.defaultBranch);
  const targetText = await snapshot.read(change.target);
  const before = typeof targetText === "string" ? spanText(targetText, change.anchor, change.until) : null;
  if ((before === null ? null : await blobSha(before)) !== change.openedBlob) return { refused: "changed meanwhile", current: before };
  if (!info.canWrite && snapshot.repository.server === "gitlab") throw failure("TokenRequired", "a GitLab product is written with a token");

  const sameSection = (entry) => entry.file === change.target && entry.anchor === change.anchor && entry.state !== "in SPEC";
  const alsoReplacing = (await queues(snapshot)).flatMap((queue) => queue.entries.filter(sameSection).map((entry) => ({ queue: queue.folder, entry: entry.number })));

  const impact = await impactOf(snapshot, before ?? "", change.text, before === null && typeof targetText === "string" ? parseSpec(targetText).requirements : null, true);
  const rationale = sectionRationale(change, impact);
  const planned = new Map();
  const { folder, number, paths } = await sectionEntry(snapshot, { target: change.target, anchor: change.anchor, until: change.until, text: change.text, rationale, places: change.places }, planned);
  const findings = documentFindings(queueRationaleSchema, readDocument(queueRationaleSchema, paths.at(-1), rationale));
  if (findings.length) throw failure("RationaleInvalid", `the rationale of the entry breaks its schema: ${findings[0].what}`);
  const files = paths.map((path) => ({ path, text: planned.get(path) }));

  if (!info.canWrite) return { fallback: await pagesFor(host, snapshot, change.openedHead, files) };
  const trailers = change.trailers?.length ? `\n\n${change.trailers.join("\n")}` : "";
  const committed = await commitOrPages(host, snapshot, change.openedHead, files, { branch: info.defaultBranch, expectedHead: snapshot.commit, files,
    message: `Propose an edit of ${headingText(change.anchor)} as entry ${pad2(number)} of the queue ${folder.split("/").pop()}${trailers}` });
  return committed.fallback ? committed : { commit: committed.commit, queue: folder, entry: number, alsoReplacing };
}

// saveEntry (ITM-394): an open entry saved in its own queue. Where the module file leaves a reading open, this file takes the one it names:
//   - The entry's state is read before its text: an entry that is not open is refused naming its state, whatever its proposal's blob; one the queue does not hold is a RangeError.
//   - The rationale is made anew from the edit — title, change and impact list from the new text against the section that holds now, the Why from `why` —; its Origin, and its Provenance
//     where a job drafted the entry, are kept as they stood. The index is not written.
export async function saveEntry(host, edit) {
  const info = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(info.defaultBranch);
  const queue = (await queues(snapshot)).find((each) => each.folder === edit.queue);
  const entry = queue?.entries.find((each) => each.number === edit.entry);
  if (!entry) throw new RangeError(`saveEntry: the snapshot holds no entry ${edit.entry} of the queue ${edit.queue}`);
  if (entry.state !== "open") return { refused: "not open", state: entry.state };
  const held = (await snapshot.read(entry.proposal.path)) ?? "";
  if (entry.proposal.blob !== edit.openedBlob) return { refused: "changed meanwhile", current: held };
  if (!info.canWrite && snapshot.repository.server === "gitlab") throw failure("TokenRequired", "a GitLab product is written with a token");

  const targetText = await snapshot.read(entry.file);
  const before = typeof targetText === "string" ? spanText(targetText, entry.anchor, entry.until) : null;
  const old = (await snapshot.read(entry.rationale)) ?? "";
  const origin = /\*\*Origin\.\*\* ([^\n]*)/.exec(old)?.[1] ?? `an edit of the entry; saved by ${edit.person}.`;
  const provenance = /\n\*\*Provenance\.\*\*[^\n]*\n/.exec(old)?.[0] ?? "";
  const impact = await impactOf(snapshot, before ?? "", edit.text, before === null && typeof targetText === "string" ? parseSpec(targetText).requirements : null);
  const rationale = `${sectionRationale({ anchor: entry.anchor, why: edit.why }, impact, origin)}${provenance}`;
  const findings = documentFindings(queueRationaleSchema, readDocument(queueRationaleSchema, entry.rationale, rationale));
  if (findings.length) throw failure("RationaleInvalid", `the rationale of the entry breaks its schema: ${findings[0].what}`);
  const files = [{ path: entry.proposal.path, text: edit.text }, { path: entry.rationale, text: rationale }];

  if (!info.canWrite) return { fallback: await pagesFor(host, snapshot, edit.openedHead, files) };
  const committed = await commitOrPages(host, snapshot, edit.openedHead, files, { branch: info.defaultBranch, expectedHead: snapshot.commit, files,
    message: `Save the edit of entry ${pad2(entry.number)} of the queue ${edit.queue.split("/").pop()}${edit.trailers?.length ? `\n\n${edit.trailers.join("\n")}` : ""}` });
  return committed.fallback ? committed : { commit: committed.commit };
}

// ---------------------------------------------------------------- the writer of drafted texts (specStrategies: spec-edits)
//
// spec-edits(result, context) -> WriteOutcome — a draft of change-requirements as the person left it, `{ sections, proposals, groups, why }`, each text on the text the job's snapshot holds:
// each section an entry of its queue through proposeSection, its anchor its heading line; each proposal of an open entry saved in that entry through saveEntry; a changed group file as a
// pull request of the branch agent-m/<job>. Where the module file leaves a reading open, this file takes the one it names:
//   - A text that stands as it is is not written. A section whose heading line the SPEC does not hold, a path that is no open entry's proposal, a text changed meanwhile, and a text that
//     could not be committed for want of a token are each a note, and nothing of it is written; a draft none of whose texts differs says so in its one note.
//   - The origin is queue-entries' (originText), with the issue's line where the job names an issue; the person who saves is the context's, else the job's source.
//   - `files` names each entry's proposal and the group file.
const GROUPS_PATH = "docs/groups/requirements.md";
export async function specEdits(result, context) {
  const draft = result?.draft ?? {};
  const { snapshot, host } = context.product;
  const outcome = { commits: [], files: [], pullRequest: null, shown: null, notes: [] };
  const source = String(context.params?.source ?? "");
  const job = { source, issue: issueOfJob(context), prompted: typeof context.params?.instruction === "string",
    page: typeof context.params?.page === "string" && context.params.page.trim() ? context.params.page.trim() : null };
  const participant = result?.drafter ?? { name: "none", model: null };
  const trailers = provenanceLines({ agentM: context.agentM, jobId: context.jobId ?? "none", kind: context.kind?.name ?? "none", participant, rounds: result?.rounds?.length ?? 0 });
  const common = { why: folded(draft.why), person: context.person ?? source, openedHead: snapshot.commit, trailers };
  const origin = originText(job).replace(/\.$/, "");
  const sections = Array.isArray(draft.sections) ? draft.sections.filter((text) => typeof text === "string") : [];
  const proposals = Array.isArray(draft.proposals) ? draft.proposals.filter((each) => typeof each?.path === "string" && typeof each?.text === "string") : [];
  const spec = (await snapshot.read("SPEC.md")) ?? "";
  let changes = 0;
  const refused = (name, out) => (out.refused === "changed meanwhile" ? `${name} changed meanwhile; it is not written.`
    : out.refused ? `${name} is ${out.state ?? out.refused}; it is not written.` : `${name} could not be committed without a token; it is not written.`);
  for (const text of sections) {
    const heading = parseSpec(text).sections[0]?.heading ?? text.split("\n")[0];
    const current = sectionText(spec, heading);
    if (current === null || current === undefined) { changes++; outcome.notes.push(`the SPEC holds no section ${heading}; it is not written.`); continue; }
    if (current === text) continue;
    changes++;
    const out = await proposeSection(host, { ...common, target: "SPEC.md", anchor: heading, until: null, text, origin, openedBlob: await blobSha(current), ...(job.issue ? { issue: job.issue } : {}) });
    if (out.commit) {
      outcome.commits.push(out.commit);
      outcome.files.push(`${out.queue}/${pad2(out.entry)}-${out.queue.split("/").pop()}.md`);
    } else outcome.notes.push(refused(heading, out));
  }
  const entries = proposals.length ? (await queues(snapshot)).flatMap((queue) => queue.entries.map((entry) => ({ queue: queue.folder, entry }))) : [];
  for (const { path, text } of proposals) {
    const found = entries.find(({ entry }) => entry.proposal.path === path && entry.state === "open");
    if (!found) { changes++; outcome.notes.push(`${path} is no open entry's proposal; it is not written.`); continue; }
    if ((await snapshot.read(path)) === text) continue;
    changes++;
    const out = await saveEntry(host, { ...common, queue: found.queue, entry: found.entry.number, text, openedBlob: found.entry.proposal.blob });
    if (out.commit) {
      outcome.commits.push(out.commit);
      outcome.files.push(path);
    } else outcome.notes.push(refused(path, out));
  }
  if (typeof draft.groups === "string" && draft.groups !== (await snapshot.read(GROUPS_PATH))) {
    changes++;
    const branch = `agent-m/${context.jobId ?? "conversation"}`;
    const { commit } = await host.commitFiles({ branch, expectedHead: snapshot.commit, files: [{ path: GROUPS_PATH, text: draft.groups }],
      message: `propose ${GROUPS_PATH}\n\n${trailers.join("\n")}` });
    const { defaultBranch } = await host.repositoryInfo();
    const opened = await host.openPullRequest({ branch, base: defaultBranch, title: `${context.jobId ?? "conversation"}: ${context.kind?.name ?? "change-requirements"}`, body: trailers.join("\n") });
    outcome.commits.push(commit);
    outcome.files.push(GROUPS_PATH);
    outcome.pullRequest = opened.url;
  }
  if (changes === 0) outcome.notes.push("the draft changes nothing; nothing is written.");
  return outcome;
}
