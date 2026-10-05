// The progress the main page shows — THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE · WITHOUT A PRODUCT, THE MAIN PAGE
// SHOWS AGENT M'S OWN PROGRESS · THE BUILD IS SHOWN AS IT HAPPENS (UC-046). Everything is derived when the page is shown, from
// one commit of a product's default branch and from what its server reports; nothing is stored (PROGRESS AND JOB STATE ARE
// DERIVED, NOT STORED). Pure apart from the reads handed in: nothing here sends a request.
//
// The six stages and the share of each, as UC-046 states them:
//   Requirements   — the share of the SPEC change entries that are decided; full when the SPEC holds requirements and no
//                    change is open. An entry is decided when an approval record names its current text, or when its queue's
//                    entscheidungen.md says it was taken over (the entries accepted before approval records existed).
//   Use cases      — the share of the use cases an approval record names (STATUS IS DERIVED FROM THE RECORDS).
//   Architecture   — the share of the architecture's files an approval record names.
//   Implementation — the share of the steps of the implementation plan (docs/plan/), or else of the backlog items
//                    (docs/backlog/), whose pull request is merged.
//   Tests          — the share of the requirements that a passing test guards on the default branch: a requirement is
//                    guarded when its check names a test file the commit holds, and the tests pass when the commit's CI
//                    passed. With CI red no requirement counts; with CI running or unknown, the share is unknown (null).
//   Release        — full once a release is tagged vYYYY.MINOR.PATCH (A RELEASE IS TAGGED AND LOGGED).

import { recordIndex, statusByNames, parseRecord, parseDecisions } from "../../docs/assets/review-core.mjs";
import { ARCHITECTURE_FILE, kindOfPath, reviewedId } from "../../docs/assets/artifacts.mjs";
import { parseRequirements } from "../../docs/assets/artifacts/requirements.mjs";
import { parseItem, frontMatter, backlogOrder } from "../../docs/assets/work-items.mjs";
import { itemState } from "../../docs/assets/work-items/flow.mjs";
import { parseProductAddress } from "../../docs/assets/git-host.mjs";

const SPEC_ENTRY = /^docs\/spec-freigaben\/([^/]+)\/(\d{2,})-[^/]+\.md$/;
const ITEM_FILE = { plan: /^docs\/plan\/ITM-\d{3}-[^/]+\.md$/, backlog: /^docs\/backlog\/ITM-\d{3}-[^/]+\.md$/ };
const JOB_RECORD = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const RELEASE_TAG = /^v\d{4}\.\d+\.\d+$/;
const NAMED_TEST = /\btests\/[\w./-]*[\w]/g;
const BUILD = new Set(["in progress", "blocked", "done"]);

const scalar = (f) => (f && typeof f.value === "string" && f.value ? f.value : null);
const fields = (text) => frontMatter(String(text ?? "").replace(/\r\n/g, "\n").split("\n")).fields;
const time = (t) => (t ? Date.parse(t) : NaN);

// The cards of the main page: one per product this browser manages, or — while it manages none — one for Agent M itself,
// read from the instance's repository. products: the addresses the browser keeps; instance: "<owner>/<name>".
export function cardsFor({ products, instance }) {
  const list = (products ?? []).map(parseProductAddress).filter((p) => !p.error);
  if (!list.length) return [{ kind: "agent-m", repo: instance, address: `https://github.com/${instance}` }];
  return list.map((p) => ({ kind: "product", repo: p.repo, address: p.address }));
}

// A job as its record docs/jobs/JOB-<id>.md names it (A JOB IS RECORDED IN ITS PRODUCT REPOSITORY), in the shape the item
// states read (work-items/flow.mjs): front matter `works_on` (the step or item), `participant`, `runtime`, `start` and, once
// the job has ended, `end` and its end `state`. A record without an end says the job was started and has not ended: the main
// page shows it as running — its live state is its runtime's (UC-036). -> job, or null for no text
export function jobOf(path, text) {
  if (text === null || text === undefined) return null;
  const f = fields(text), v = (k) => scalar(f[k]);
  const end = v("end");
  return { id: v("id") ?? JOB_RECORD.exec(path)?.[1] ?? path, item: v("works_on"), participant: v("participant"),
    runtime: v("runtime"), start: v("start"), end, state: end ? v("state") : "running", waitsForPerson: false };
}

// The facts of one commit of a product. tree: [{ path, sha }] (git-host readSnapshot); text(path) -> the file's text at that
// commit, or null; pullRequests() -> the product's pull requests (git-host pullRequests); ci() -> the CI state of the commit,
// "passed" | "failed" | "running" | "cancelled" | null; tags() -> the names of the repository's tags. A read is asked for
// only where the facts need it: the pull requests only for a product with a plan or a backlog, the CI state only when a
// requirement's check names a test file the commit holds.
export async function productFacts({ tree, text, pullRequests = async () => [], ci = async () => null, tags = async () => [] }) {
  const paths = tree.map((e) => e.path), present = new Set(paths);
  const index = recordIndex(paths);
  const readRecords = (list) => Promise.all(list.map(async (p) => ({ ...parseRecord((await text(p)) ?? ""), _path: p })));
  const reviewed = async (want) => {
    const files = tree.filter((e) => want(e.path));
    const status = await Promise.all(files.map((e) => statusByNames({ index, path: e.path, blob: e.sha, read: readRecords })));
    const open = files.filter((_, i) => status[i].status !== "accepted").map((e) => reviewedId(e.path) ?? e.path);
    return { total: files.length, accepted: files.length - open.length, open };
  };

  const requirements = [...parseRequirements((await text("SPEC.md")) ?? "").values()].filter((r) => !r.withdrawn);
  const entries = tree.filter((e) => !e.path.endsWith(".begruendung.md")).map((e) => [SPEC_ENTRY.exec(e.path), e])
    .filter(([m]) => m).map(([m, e]) => ({ queue: m[1], nr: Number(m[2]), hex: e.sha.slice(0, 12) }));
  const recorded = (en) => (index.spec.get(`${en.queue}#${en.nr}`) || []).some((r) => r.hex === en.hex);
  const unrecorded = [...new Set(entries.filter((en) => !recorded(en)).map((en) => en.queue))];
  const decisions = new Map(await Promise.all(unrecorded.map(async (q) =>
    [q, parseDecisions((await text(`docs/spec-freigaben/${q}/entscheidungen.md`)) ?? "")])));
  const openEntries = entries.filter((en) => !recorded(en) && decisions.get(en.queue)?.get(en.nr)?.decision !== "uebernommen");

  const from = ["plan", "backlog"].find((k) => paths.some((p) => ITEM_FILE[k].test(p))) ?? null;
  const items = from ? await Promise.all(paths.filter((p) => ITEM_FILE[from].test(p)).map(async (p) => parseItem(p, await text(p)))) : [];
  const order = from ? backlogOrder(await text(`docs/${from}/order.md`), items).order : [];
  const ordered = order.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  const jobs = (await Promise.all(paths.filter((p) => JOB_RECORD.test(p)).map(async (p) => jobOf(p, await text(p))))).filter(Boolean);
  const pulls = ordered.length ? await pullRequests() : [];
  const rows = ordered.map((item) => ({ id: item.id, title: item.title, state: itemState(item, { pullRequests: pulls, jobs }).state }))
    .filter((r) => BUILD.has(r.state))
    .map((r) => ({ ...r, job: r.state === "done" ? null : workingOn(r.id, jobs) }));

  const guarded = requirements.filter((r) => [...String(r.check ?? "").matchAll(NAMED_TEST)].some((m) => present.has(m[0])));
  const released = (await tags()).filter((t) => RELEASE_TAG.test(t));

  return {
    model: scalar(fields(await text("docs/process.md")).model),
    requirements: { requirements: requirements.length, entries: entries.length, decided: entries.length - openEntries.length,
      open: openEntries.map(({ queue, nr }) => ({ queue, nr })) },
    useCases: await reviewed((p) => kindOfPath(p) === "use-case"),
    architecture: await reviewed((p) => ARCHITECTURE_FILE.test(p)),
    implementation: { from, total: ordered.length, done: rows.filter((r) => r.state === "done").length, rows },
    tests: { requirements: requirements.length, guarded: guarded.length, ci: guarded.length ? await ci() : null },
    release: { tags: released },
    failedJobs: jobs.filter((j) => j.state === "failed").map((j) => j.id),
  };
}

// The job working on a step or item: the latest of its jobs that has not ended, else the latest that failed. -> job | null
function workingOn(id, jobs) {
  const mine = jobs.filter((j) => j.item === id).sort((a, b) => (time(b.start) || 0) - (time(a.start) || 0));
  return mine.find((j) => j.state === "running" || j.state === "queued") ?? mine.find((j) => j.state === "failed") ?? null;
}

const share = (done, total) => (total ? done / total : 0);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// The six stages of a product's bar, in their order, each with its share of done work (0 to 1, null where it cannot be
// told), a line saying what the share counts, and the menu entry of its page (src/site/menu.mjs). agentM: Agent M's own bar,
// which is full once Agent M's first release is tagged.
export function stages(f, { agentM = false } = {}) {
  const r = f.requirements, u = f.useCases, a = f.architecture, i = f.implementation, t = f.tests;
  const released = f.release.tags.length > 0;
  const testShare = !t.guarded ? 0 : t.ci === "passed" ? t.guarded / t.requirements : t.ci === "failed" || t.ci === "cancelled" ? 0 : null;
  const list = [
    { key: "requirements", label: "Requirements", menu: "requirements",
      share: r.open.length ? share(r.decided, r.entries) : r.requirements ? 1 : 0,
      detail: r.open.length ? `${plural(r.open.length, "change", "changes")} open` : r.requirements
        ? `${plural(r.requirements, "requirement", "requirements")}, no change open` : "no requirement yet" },
    { key: "use-cases", label: "Use cases", menu: "use-cases", share: share(u.accepted, u.total),
      detail: u.total ? `${u.accepted} of ${u.total} accepted` : "no use case yet" },
    { key: "architecture", label: "Architecture", menu: "architecture", share: share(a.accepted, a.total),
      detail: a.total ? `${a.accepted} of ${a.total} files accepted` : "not designed yet" },
    { key: "implementation", label: "Implementation", menu: "implementation", share: share(i.done, i.total),
      detail: i.from ? `${i.done} of ${i.total} ${i.from === "plan" ? "steps" : "items"} done`
        : f.model ? "not planned yet" : "the process is chosen when implementation starts" },
    { key: "tests", label: "Tests", menu: "tests", share: testShare,
      detail: !t.guarded ? "no requirement guarded by a test yet" : t.ci === "passed"
        ? `${t.guarded} of ${t.requirements} requirements guarded, CI green` : t.ci === "failed" || t.ci === "cancelled"
          ? "CI is red on the default branch" : `${t.guarded} of ${t.requirements} requirements have a test; CI ${t.ci ?? "unknown"}` },
    { key: "release", label: "Release", menu: "releases", share: released ? 1 : 0,
      detail: released ? `${f.release.tags.length === 1 ? f.release.tags[0] : `${f.release.tags.length} releases`} tagged` : "no release yet" },
  ];
  return agentM && released ? list.map((s) => ({ ...s, share: 1 })) : list;
}

// The whole bar as one share: the mean of the six stages, an unknown stage counted as nothing done.
export const overall = (list) => list.reduce((n, s) => n + (s.share ?? 0), 0) / list.length;

// The stage a product is in: the first whose share is not full. -> key, or null when every stage is full
export const currentStage = (list) => list.find((s) => s.share === null || s.share < 1)?.key ?? null;

// What waits for a person in a product, each with the view of the review pages where it is decided: open use cases and
// architecture files, open SPEC changes, failed jobs.
export function waiting(f) {
  return [
    ...f.useCases.open.map((id) => ({ kind: "use-case", id, view: "uc" })),
    ...f.architecture.open.map((id) => ({ kind: "architecture", id, view: "arc" })),
    ...f.requirements.open.map(({ queue, nr }) => ({ kind: "spec", id: `${queue} ${String(nr).padStart(2, "0")}`, view: "spec" })),
    ...f.failedJobs.map((id) => ({ kind: "job", id, view: "jobs" })),
  ];
}
