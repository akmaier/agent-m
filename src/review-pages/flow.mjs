// flow.mjs — the one review flow every reviewed kind goes through (MOD-review-pages, Parts): the files of a kind with their status
// and a tick, one file with its text and its difference to the last accepted text, accepting what was shown, and Review all: every file not yet accepted on one page, with the acceptance of what it shows.
//
// Module: MOD-review-pages
//
// STATUS IS DERIVED FROM THE RECORDS (it is read from MOD-approvals only); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; WITHOUT A
// TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN. Nothing is written while a page is drawn.

import { statuses, lastAcceptedText, acceptShown, acceptanceBlockers, fallbackAcceptLink, approvalSchema } from "../approvals/index.mjs";
import { writeDocument } from "../documents/index.mjs";
import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { explain } from "../site-frame/index.mjs";

const LABEL = { open: "open", accepted: "accepted", changed: "changed since acceptance" };
const TOKEN_STEP = "#add-product";
// The id of the page that shows every file not yet accepted: #<route>/id=all.
const REVIEW_ALL = "all";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
const link = (href, className, text) => {
  const a = el("a", className, text);
  a.setAttribute("href", href);
  return a;
};
const button = (className, text) => {
  const b = el("button", className, text);
  b.type = "button";
  return b;
};

// The token this browser stores for the page's product — its own, never the instance's (A GITHUB PRODUCT USES A TOKEN OF ITS OWN) —,
// or, on the page that shows the instance itself, the instance's.
function storedToken(context) {
  const keys = [];
  try {
    if (context.product) {
      const address = parseAddress(context.product.address);
      if (address.server === "gitlab") keys.push(`gitlab-token:${new URL(address.origin).host}/${address.path}`);
      else keys.push(`github-token:${address.path}`);
    } else keys.push("github-token");
    for (const key of keys) {
      const token = readSetting(context.store, key);
      if (token) return { name: token.name ?? "a reviewer" };
    }
  } catch { /* a store that cannot be read holds no token */ }
  return null;
}

const recordOf = (id, kind, path, blob) => ({ path: `docs/approvals/${id}-${blob.slice(0, 12)}.md`,
  text: writeDocument(approvalSchema, { fields: { kind, file: path, blob } }) });

const shortBody = (body) => body.replace(/^---\n[^]*?\n---\n/, "");

// What an acceptance of several files came to: the commit, and each file left out with its reason and the names it rests on.
const reasonOf = (out) => `${out.reason}${out.names.length ? ` (${out.names.join(", ")})` : ""}`;
function acceptedMessage(result, idOf) {
  const message = el("p", "result", `Accepted in commit ${result.commit.slice(0, 7)}.`);
  for (const out of result.leftOut) message.append(el("br"), `${idOf(out.path)} was left out: ${reasonOf(out)}.`);
  return message;
}
// What a refused acceptance of several files says: the failure, and each file it left out with its reason.
const refusedText = (failure, idOf) => [failure.message, ...(failure.leftOut ?? []).map((out) => `${idOf(out.path)}: ${reasonOf(out)}`)].join(" ");

// What a read that fails says: a private repository without a token that reaches it is named, and nothing is shown.
function problem(failure, token) {
  const text = failure.name === "NotFound" && !token
    ? "This repository is private or does not exist, and this browser stores no token that reaches it. Store the product's token, then reload."
    : failure.message;
  const paragraph = el("p", "problem", text);
  if (!token) paragraph.append(" ", link(TOKEN_STEP, "token-step", "Store a token"));
  return paragraph;
}

export function reviewRoute(kind) {
  const files = (snapshot) => [...statuses(snapshot)].filter(([, file]) => file.kind === kind.kind)
    .map(([path, file]) => ({ path, ...file })).sort((a, b) => a.id.localeCompare(b.id));
  const idOf = (path, snapshot) => statuses(snapshot).get(path)?.id ?? path;

  async function render(target, context, params) {
    const host = (context.product ?? context.instance).host;
    const token = storedToken(context);
    target.replaceChildren();
    let snapshot;
    try {
      const { defaultBranch } = await host.repositoryInfo();
      snapshot = await host.readSnapshot(defaultBranch);
    } catch (failure) {
      target.append(problem(failure, token));
      return;
    }
    const where = { host, token, snapshot, context, target };
    if (params.id === REVIEW_ALL) await showAll(where);
    else if (params.id) await showOne(where, params.id);
    else await showList(where);
  }

  // After a decision: the page again from the repository, and what the decision came to under it.
  const redraw = async (where, params, message) => {
    await render(where.target, where.context, params);
    if (message) where.target.append(message);
  };

  async function showList(where) {
    const { target, snapshot, token, context } = where;
    const rows = el("tbody");
    const ticks = new Map();
    const bar = token ? button("btn accept-ticked", "Accept ticked (0)") : null;
    if (bar) bar.disabled = true;
    for (const file of files(snapshot)) {
      const body = (await snapshot.read(file.path)) ?? "";
      const first = el("td");
      if (token && file.status !== "accepted") {
        const box = el("input", "tick");
        box.type = "checkbox";
        box.addEventListener("change", () => {
          if (box.checked) ticks.set(file.path, snapshot.blob(file.path)); else ticks.delete(file.path);
          bar.disabled = ticks.size === 0;
          bar.textContent = `Accept ticked (${ticks.size})`;
        });
        first.append(box);
      }
      const row = el("tr", null, first, el("td", null, link(`#${kind.route}/id=${encodeURIComponent(file.id)}`, null, file.id)),
        el("td", null, kind.heading(body).replace(/^\S+\s*/, "")), el("td", null, el("span", `badge ${file.status}`, LABEL[file.status])));
      row.setAttribute("data-id", file.id);
      rows.append(row);
    }
    const heading = el("h2", null, kind.title);
    target.append(heading, link(`#${kind.route}/id=${REVIEW_ALL}`, "review-all", "Review all"), explain(kind.explain.list));
    if (bar) {
      bar.addEventListener("click", async () => {
        bar.disabled = true;
        const shown = [...ticks].map(([path, blob]) => ({ path, blob }));
        try {
          const result = await acceptShown(where.host, shown, token.name);
          await redraw(where, {}, acceptedMessage(result, (path) => idOf(path, snapshot)));
        } catch (failure) {
          bar.disabled = ticks.size === 0;
          target.append(el("p", "result problem", refusedText(failure, (path) => idOf(path, snapshot))));
        }
      });
    } else if (context.product && parseServer(context) === "gitlab") {
      target.append(el("p", "problem", "A GitLab product is written with the project's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    }
    target.append(el("table", "list", el("thead", null, el("tr", null, el("th"), el("th", null, "Id"), el("th", null, "Title"), el("th", null, "Status"))), rows));
    if (bar) target.append(bar);
  }

  // Review all: every file not yet accepted in sequence — a changed one as its difference to the last accepted text, a new one in
  // full — and, below them, the acceptance of exactly what is shown.
  async function showAll(where) {
    const { target, snapshot, token, host, context } = where;
    const shown = files(snapshot).filter((file) => file.status !== "accepted");
    target.append(el("h2", null, `Review all — ${kind.title}`), explain(kind.explain.all));
    if (shown.length === 0) {
      target.append(el("p", "nothing", `Nothing to review: every ${kind.noun} is accepted.`));
      return;
    }
    const records = [];
    for (const file of shown) {
      const body = await snapshot.read(file.path);
      const blob = snapshot.blob(file.path);
      records.push({ file, record: recordOf(file.id, kind.kind, file.path, blob), blob });
      const section = el("section", "review-file", el("h3", null, kind.heading(body)), el("span", `badge ${file.status}`, LABEL[file.status]));
      section.setAttribute("data-id", file.id);
      if (file.status === "changed") {
        const diff = el("section", "accepted-diff", el("h4", null, "Changed since it was last accepted"));
        try {
          const last = await lastAcceptedText(file.id, host);
          if (last) diff.append(showDifference(last.text, body));
        } catch (failure) {
          diff.append(el("p", "problem", failure.message));
        }
        section.append(diff);
      } else section.append(renderArtifact(shortBody(body)));
      target.append(section);
    }
    const heading = `Accept all ${shown.length} shown`;
    if (token) {
      const accept = button("btn accept-all", heading);
      accept.addEventListener("click", async () => {
        accept.disabled = true;
        try {
          const result = await acceptShown(host, records.map(({ file, blob }) => ({ path: file.path, blob })), token.name);
          await redraw(where, { id: REVIEW_ALL }, acceptedMessage(result, (path) => idOf(path, snapshot)));
        } catch (failure) {
          accept.disabled = false;
          target.append(el("p", "result problem", refusedText(failure, (path) => idOf(path, snapshot))));
        }
      });
      target.append(accept);
    } else if (parseServer(context) === "gitlab") {
      target.append(el("p", "problem", "A GitLab product is written with the project's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    } else {
      for (const { file, record } of records) {
        const offered = fallbackAcceptLink(record, snapshot);
        target.append(el("p", "github-fallback", `${file.id}: `, link(offered.url, "github-page", "Open GitHub's page to commit the record")));
      }
    }
  }

  async function showOne(where, id) {
    const { target, snapshot, token, host } = where;
    const file = files(snapshot).find((candidate) => candidate.id === id);
    if (!file) {
      target.append(el("p", "problem", `No ${kind.noun} ${id} on the default branch.`), link(`#${kind.route}`, null, `All ${kind.plural}`));
      return;
    }
    const body = await snapshot.read(file.path);
    const blob = snapshot.blob(file.path);
    target.append(el("h2", null, kind.heading(body)), el("span", `badge ${file.status}`, LABEL[file.status]),
      el("p", "shown", `Text shown: blob ${blob.slice(0, 12)}`), explain(kind.explain.one));
    if (file.status === "changed") {
      const diff = el("section", "accepted-diff", el("h3", null, "Changed since it was last accepted"), explain(kind.explain.changed));
      try {
        const last = await lastAcceptedText(file.id, host);
        if (last) diff.append(showDifference(last.text, body));
      } catch (failure) {
        diff.append(el("p", "problem", failure.message));
      }
      target.append(diff);
    }
    target.append(renderArtifact(shortBody(body)));
    if (file.status === "accepted") return;
    if (kind.restsOn) {
      const open = await acceptanceBlockers(file.path, snapshot);
      if (open.length) {
        const rests = el("section", "rests-on", el("h3", null, "Rests on what is not accepted"));
        const names = el("ul");
        for (const name of open) names.append(el("li", "open-name", name));
        rests.append(el("p", null, `${file.id} can be accepted once everything it names is accepted.`), names);
        target.append(rests);
        return;
      }
    }
    const record = recordOf(file.id, kind.kind, file.path, blob);
    const result = el("p", "result");
    const offerGitHub = () => {
      const offered = fallbackAcceptLink(record, snapshot);
      if (offered.refused) {
        target.append(el("p", "problem", "A GitLab product is written with the project's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
        return;
      }
      const copy = (text) => { const b = button("btn copy", "Copy"); b.addEventListener("click", () => globalThis.navigator?.clipboard?.writeText?.(text)); return b; };
      target.append(el("div", "github-fallback", explain(kind.explain.fallback),
        link(offered.url, "github-page", "Open GitHub's page to commit the record"),
        el("p", null, "Path ", el("code", "record-path", offered.path), " ", copy(offered.path)),
        el("pre", "record", offered.text), copy(offered.text)));
    };
    if (token) {
      const accept = button("btn accept", "Accept");
      accept.addEventListener("click", async () => {
        accept.disabled = true;
        try {
          const done = await acceptShown(host, [{ path: file.path, blob }], token.name);
          await redraw(where, { id }, el("p", "result", `Accepted in commit ${done.commit.slice(0, 7)}.`));
        } catch (failure) {
          accept.disabled = false;
          result.textContent = refusedText(failure, (path) => idOf(path, snapshot));
          target.append(result);
          if (failure.name === "PermissionMissing") offerGitHub();
        }
      });
      target.append(accept);
    } else offerGitHub();
  }

  return { name: kind.route, entry: kind.entry, title: kind.title, render };
}

const parseServer = (context) => { try { return parseAddress(context.product.address).server; } catch { return null; } };
