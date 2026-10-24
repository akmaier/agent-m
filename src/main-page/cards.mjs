// cards.mjs — the cards of the route `home` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `home`): one card for a product — or for Agent M while this browser
// keeps none —, with its name, its process model, its bar of six stages each filled by its share, the stage it is in marked, and its build, the steps or items in progress, each with the
// job working on it, its participant, state and elapsed time. A card whose repository could not be read says which.
//
// Module: MOD-main-page
//
// THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED. These functions draw what
// MOD-progress-measures derives (stageShares, currentStage, buildInProgress) and compute no share, no stage and no state of their own. They read and store nothing.

import { menuOf } from "../site-frame/index.mjs";

export const el = (name, className, ...children) => {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
};

const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-");
const percent = (share) => (share === null ? "?" : `${Math.round(share * 100)} %`);

// The elapsed time in hours, minutes and seconds.
export const clock = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 3600)}h ${Math.floor((whole % 3600) / 60)}m ${whole % 60}s`;
};

// The bar of six stages: one <li class="stage"> per stage of stageShares, in its order, with its name, its share and its detail; the one `current` names is also <li class="stage is-current">.
function stageBar(shares, current, entries) {
  const bar = el("ol", "stages");
  bar.setAttribute("aria-label", "Progress by stage");
  for (const [at, { stage, share, detail }] of shares.entries()) {
    // The six stages and the first six entries of the menu stand in the order of the process: the nth stage leads to the nth entry.
    const link = el("a", "stage-link", el("span", "stage-name", stage), " ", el("span", "stage-share", percent(share)), " ", el("span", "stage-detail", detail));
    if (entries[at]?.href) link.setAttribute("href", entries[at].href);
    const item = el("li", `stage${stage === current ? " is-current" : ""}${share === null ? " is-unknown" : ""}`, link);
    item.setAttribute("data-stage", stage);
    item.setAttribute("style", `--share: ${share ?? 0}`);
    bar.append(item);
  }
  return bar;
}

// The build: the steps or items in progress, each with the job working on it. A job whose runtime does not answer is marked as not reachable, with the state its record gives.
function buildList(rows) {
  if (rows.length === 0) return null;
  const list = el("ul", "build-rows");
  for (const row of rows) {
    const line = el("li", `build-row is-${slug(row.state)}`, el("span", "build-item", row.item), " ", el("span", "build-job", row.job), " ",
      el("span", "build-participant", row.participant ?? "participant not named"), " ", el("span", "build-state", row.state), " ",
      el("span", "build-elapsed", clock(row.elapsed)));
    if (!row.reachable) line.append(" ", el("span", "not-reachable", "not reachable"));
    line.setAttribute("data-item", row.item);
    list.append(line);
  }
  return el("section", "build", el("h3", null, "The build"), list);
}

const head = (title, address) => {
  const link = el("a", "card-repo", address.replace(/^https:\/\//, ""));
  link.setAttribute("href", address);
  return el("header", "card-head", el("h2", null, title), link);
};

/**
 * productCard({ title, address, model, shares, current, build, own }) -> Element — the card of a product whose facts were read: `model` the name of its process model, or null where it declares none
 * (its Implementation stage then says that the process is configured when implementation starts); `shares`, `current` and `build` as MOD-progress-measures' stageShares, currentStage and
 * buildInProgress give them.
 */
export function productCard({ title, address, model, shares, current, build, own = false }) {
  // Each stage links to the menu's entry of the same place in the process, for the card's product; Agent M's own card (`own`) has no product.
  const entries = menuOf("main", [], own ? null : address);
  const card = el("article", "card", head(title, address),
    el("p", "card-model", model ? `Developed with ${model}` : "Its process is chosen when implementation starts"), stageBar(shares, current, entries));
  const rows = buildList(build);
  if (rows) card.append(rows);
  card.setAttribute("data-card", address);
  return card;
}

/** readingCard({ title, address }) -> Element — a card whose facts are being read. */
export function readingCard({ title, address }) {
  const card = el("article", "card is-reading", head(title, address), el("p", "muted", "Reading…"));
  card.setAttribute("data-card", address);
  return card;
}

/** errorCard({ title, address, reason, go }) -> Element — a card whose repository could not be read, with the reason its host gives and a button to the token's setting, which calls `go("settings")`. */
export function errorCard({ title, address, reason, go }) {
  const setting = el("button", "token-setting btn", "Open the token's setting");
  setting.setAttribute("type", "button");
  setting.addEventListener("click", () => go("settings"));
  const card = el("article", "card is-error", head(title, address), el("p", "warn", reason), setting);
  card.setAttribute("data-card", address);
  return card;
}
