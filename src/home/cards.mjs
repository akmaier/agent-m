// The main page's cards as HTML: a product's — or Agent M's own — bar of six stages, the build in progress, and what waits for
// a person (UC-046, steps 3–5). Pure functions of the facts src/home/progress.mjs derives; the page (home.mjs) places them.

import { h } from "../site/html.mjs";
import { stages, overall, currentStage, waiting } from "./progress.mjs";

const pct = (share) => (share === null ? "?" : `${Math.round(share * 100)} %`);
const slug = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

// How long a job has been running: "12 min", "1 h 30 min", "2 d 3 h".
export function elapsed(start, now) {
  const minutes = Math.max(0, Math.floor((now.getTime() - Date.parse(start)) / 60000));
  if (Number.isNaN(minutes)) return "for an unknown time";
  const d = Math.floor(minutes / 1440), hrs = Math.floor((minutes % 1440) / 60), min = minutes % 60;
  return d ? `${d} d ${hrs} h` : hrs ? `${hrs} h ${min} min` : `${min} min`;
}

// The bar of six stages. stageHref(stage) -> the address of the stage's page, or null where it has none yet.
export function stagesHtml(list, { stageHref = () => null } = {}) {
  const current = currentStage(list);
  return `<ol class="stages" aria-label="Progress by stage">${list.map((s) => {
    const inner = `<span class="stage-name">${h(s.label)}</span> <span class="stage-share">${pct(s.share)}</span>` +
      `<span class="stage-fill" aria-hidden="true"></span>`;
    const href = stageHref(s);
    return `<li class="stage${s.key === current ? " is-current" : ""}${s.share === null ? " is-unknown" : ""}" data-stage="${h(s.key)}"` +
      ` style="--share: ${s.share ?? 0}">${href ? `<a class="stage-head" href="${h(href)}">${inner}</a>` : `<span class="stage-head">${inner}</span>`}` +
      ` <span class="stage-detail">${h(s.detail)}</span></li>`;
  }).join("")}</ol>`;
}

// The build: the steps or items in progress, each with the job working on it, and those whose pull request is merged.
export function buildHtml(rows, { now }) {
  if (!rows.length) return "";
  const job = (j) => `${h(j.id)} · ${h(j.participant ?? "participant not named")} · ` +
    `${h(j.state === "running" ? `running for ${elapsed(j.start, now)}` : j.state ?? "state unknown")}`;
  return `<section class="build"><h3>The build</h3><ul>${rows.map((r) => `<li class="build-row is-${slug(r.state)}" data-item="${h(r.id)}">` +
    `<span class="build-id">${h(r.id)}</span> <span class="build-title">${h(r.title ?? "")}</span> ` +
    `<span class="badge b-${slug(r.state)}">${h(r.state)}</span>${r.job ? ` <span class="build-job">${job(r.job)}</span>` : ""}</li>`).join("")}</ul></section>`;
}

const KIND = { "use-case": "Use case to accept", architecture: "Architecture file to accept", spec: "SPEC change to decide",
  job: "Failed job" };

// What waits for a person, each linked to the page where it is decided. href(view, item) -> address.
export function waitsHtml(items, { href = () => null } = {}) {
  if (!items.length) return `<p class="muted">Nothing waits for a person.</p>`;
  return `<ul class="waits">${items.map((w) => {
    const to = href(w.view, w);
    const label = `${h(KIND[w.kind] ?? w.kind)}: <strong>${h(w.id)}</strong>${w.product ? ` <span class="muted">· ${h(w.product)}</span>` : ""}`;
    return `<li>${to ? `<a href="${h(to)}">${label}</a>` : label}</li>`;
  }).join("")}</ul>`;
}

// One card. kind: "product" | "agent-m"; facts: as productFacts gives them, or null while they are read; error: why they could
// not be read (UC-046 3b); stageHref, as stagesHtml; now: the time the page is shown.
export function cardHtml({ kind, title, address, facts = null, error = null, stageHref, now = new Date() }) {
  const agentM = kind === "agent-m";
  const head = `<header class="card-head"><h2>${h(title)}</h2>` +
    `<a class="card-repo" href="${h(address)}" target="_blank" rel="noopener">${h(address.replace(/^https:\/\//, ""))}</a></header>`;
  if (error) return `<article class="card is-error" data-card="${h(kind)}">${head}<p class="warn">${h(error)}</p></article>`;
  if (!facts) return `<article class="card is-reading" data-card="${h(kind)}">${head}<p class="muted">Reading…</p></article>`;
  const list = stages(facts, { agentM });
  const whole = overall(list);
  const model = facts.model ? `Developed with <strong>${h(facts.model)}</strong>` : "Its process is chosen when implementation starts";
  const journey = agentM
    ? `<div class="journey"><p><strong>${pct(whole)}</strong> of the way to Agent M's first release</p>` +
      `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(whole * 100)}"` +
      ` aria-label="Agent M's way to its first release"><span style="--share: ${whole}"></span></div></div>`
    : "";
  return `<article class="card" data-card="${h(kind)}">${head}<p class="card-model">${model}</p>${journey}` +
    `${stagesHtml(list, { stageHref })}${buildHtml(facts.implementation.rows, { now })}</article>`;
}

// What waits for a person across the cards: [{ title, facts }] -> items naming their product where there are several.
export function waitingAcross(cards) {
  return cards.filter((c) => c.facts).flatMap((c) => waiting(c.facts).map((w) => ({ ...w, product: cards.length > 1 ? c.title : null, card: c })));
}
