// subjects.mjs — the subject each route gives the prompt bar (MOD-review-pages, Parts: flow.mjs, "the subject each of its routes gives the prompt bar"; MOD-site-frame, Route.subject;
// MOD-prompt-bar, Subject). The page of a file (`<k>/id=<id>`), its editor, a requirement's editor and a new requirement's give a subject that names the descriptor's change kind
// and the target, and `draft/subject=<key>` as the draft route; every other page of a kind has the subject the frame gives a route that gives none (kind `converse`).
//
// Module: MOD-review-pages
//
// A subject is built by a route's `subject(params, context)`, which is synchronous, and its `paramsFor` too; what they need from the repository — the file's blob, the SPEC section's
// blob, the person's own source — is read when the route is drawn (`remember`) and kept for the context it was drawn in, which the frame hands to both. Nothing is written.
// THE PERSON WHO PROMPTS IS A SOURCE: a change of requirements carries the person's own source, and without one its parameters are refused, naming the missing step (UC-019 4b).

import { statuses } from "../approvals/index.mjs";
import { personSource } from "../source-register/index.mjs";
import { queues } from "../spec-changes/index.mjs";
import { parseSpec, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { accountOf, defaultSnapshot } from "./common.mjs";
import { entryId, sourcesOf } from "./spec-entries.mjs";

const SPEC = "SPEC.md";
// What was read for a context when its route was drawn: { target, facts } — the element the route drew into, and the facts of the subject, or null where the page names none.
const drawn = new WeakMap();

const encoded = encodeURIComponent;
const productOf = (context) => (context.product ? [`product=${encoded(context.product.address)}`] : []);
// The fragment of a page without its leading `#`: the route's name, its parts, then the product, as MOD-site-frame writes the key of its default subject.
const keyOf = (route, parts, context) => [route, ...parts.map(([name, value]) => `${name}=${encoded(value)}`), ...productOf(context)].join("/");

/** begin(context, target) — a route is being drawn in `target` for this context: nothing is known of its subject yet. */
export function begin(context, target) {
  drawn.set(context, { target, facts: null });
}

// The facts of a file's page: the file addressed by its identifier, the blob of its text and its heading.
async function fileFacts({ snapshot }, kind, id) {
  const found = [...statuses(snapshot)].find(([, each]) => each.kind === kind.kind && each.id === id);
  if (!found) return null;
  const [path] = found;
  return { parts: [["id", id]], title: kind.heading((await snapshot.read(path)) ?? "") || id, params: { [kind.change.parameter]: id, version: snapshot.blob(path) } };
}

// The blob of the SPEC section a requirement stands in.
async function sectionVersion(spec, heading) {
  const text = typeof heading === "string" ? sectionText(spec, heading) : null;
  return text === null ? undefined : blobSha(text);
}

// The facts of a requirement's page, or of a new requirement's in the section the page was given.
async function requirementFacts({ snapshot }, kind, params) {
  const spec = (await snapshot.read(SPEC)) ?? "";
  if (kind.fresh) {
    const version = await sectionVersion(spec, params.section);
    return version === undefined ? null : { parts: [["section", params.section]], title: `New requirement in ${params.section}`, source: true,
      params: { requirements: [], section: params.section, version } };
  }
  const requirement = parseSpec(spec).requirements.get(params.name ?? "");
  if (!requirement) return null;
  return { parts: [["name", requirement.name]], title: requirement.name, source: true,
    params: { requirements: [requirement.name], version: await sectionVersion(spec, requirement.section) } };
}

// The facts of a SPEC change entry's page: the requirements of its proposal that the SPEC holds, and the blob of the section of the first of them, which the job reads.
async function entryFacts({ snapshot }, kind, id) {
  const all = await queues(snapshot);
  const queue = all.find((candidate) => candidate.entries.some((item) => entryId(candidate.folder, item.number) === id));
  const item = queue?.entries.find((each) => entryId(queue.folder, each.number) === id);
  if (!item) return null;
  const spec = (await snapshot.read(SPEC)) ?? "";
  const held = parseSpec(spec).requirements;
  const requirements = [...parseSpec((await snapshot.read(item.proposal.path)) ?? "").requirements.keys()].filter((name) => held.has(name));
  const version = await sectionVersion(spec, held.get(requirements[0])?.section);
  return { parts: [["id", id]], title: id, source: true, params: { [kind.change.parameter]: id, requirements, ...(version === undefined ? {} : { version }) } };
}

async function factsOf(where, kind, params) {
  if (!kind.change || params.prompt) return null;
  if (kind.edit) return requirementFacts(where, kind, params);
  if (!params.id || params.id === "all" || params.id === "draft") return null;
  return kind.accept === "queue" ? entryFacts(where, kind, params.id) : fileFacts(where, kind, params.id);
}

// The person's own source — the register entry of the instance's author that the product links — or null.
async function ownSource(where) {
  try {
    const { snapshot, context } = where;
    const instanceSnapshot = context.product ? await defaultSnapshot(context.instance.host) : snapshot;
    const { links, register } = await sourcesOf(where);
    return personSource(links, register, accountOf(instanceSnapshot));
  } catch {
    return null;
  }
}

/**
 * remember(where, kind, params) — after the route is drawn: reads what the subject of this page needs, for the context it was drawn in. A page that names no file or
 * requirement the product holds has none.
 */
export async function remember(where, kind, params) {
  const here = drawn.get(where.context);
  if (!here) return;
  const facts = await factsOf(where, kind, params);
  here.facts = facts === null ? null : { ...facts, source: facts.source ? await ownSource(where) : undefined };
}

function missingSource() {
  return Object.assign(new Error("The author has no personal source linked to this product. Register the person as a source (#library) and link that source to the product (#sources), then ask again."),
    { name: "NoPersonSource" });
}

/**
 * subjectOf(kind, params, context) -> Subject — what a message in the prompt bar is about while the route of `kind` is shown with these `params` in this `context`.
 */
export function subjectOf(kind, params, context) {
  const here = drawn.get(context);
  const facts = here?.facts ?? null;
  if (facts !== null) {
    const key = keyOf(kind.route, facts.parts, context);
    return { key, title: facts.title, kind: kind.change.kind, entry: kind.entry,
      paramsFor: () => {
        if (facts.source === null) throw missingSource();
        return { ...facts.params, ...(facts.source === undefined ? {} : { source: facts.source }) };
      },
      draftRoute: `draft/subject=${encoded(key)}`, withhold: null, refuses: [] };
  }
  const address = context.product?.address ?? `https://github.com/${context.instance.repository}`;
  return { key: keyOf(kind.route, Object.entries(params), context), title: kind.title, kind: "converse", entry: kind.entry,
    paramsFor: () => ({ page: [kind.title, address, here?.target?.textContent ?? ""].join("\n") }), draftRoute: null, withhold: null, refuses: [] };
}
