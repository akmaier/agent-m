// flow.mjs — the one review flow every reviewed kind goes through (MOD-review-pages, Parts): the files of a kind with their status
// and a tick, one file with its text and its difference to the last accepted text, and accepting what was shown.
//
// Module: MOD-review-pages
//
// STATUS IS DERIVED FROM THE RECORDS (it is read from MOD-approvals only); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; WITHOUT A
// TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN. Nothing is written while a page is drawn.

import { statuses, lastAcceptedText, acceptShown, fallbackAcceptLink, approvalSchema } from "../approvals/index.mjs";
import { writeDocument } from "../documents/index.mjs";
import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { explain } from "../site-frame/index.mjs";

const LABEL = { open: "open", accepted: "accepted", changed: "changed since acceptance" };
const TOKEN_STEP = "#add-product";

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

// The token this browser stores for the page's product: the product's own, and for a GitHub product, else the instance's.
function storedToken(context) {
  const keys = [];
  try {
    if (context.product) {
      const address = parseAddress(context.product.address);
      if (address.server === "gitlab") keys.push(`gitlab-token:${new URL(address.origin).host}/${address.path}`);
      else keys.push(`github-token:${address.path}`, "github-token");
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
    if (params.id) await showOne(where, params.id);
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
    target.append(heading, explain(kind.explain.list));
    if (bar) {
      bar.addEventListener("click", async () => {
        bar.disabled = true;
        const shown = [...ticks].map(([path, blob]) => ({ path, blob }));
        try {
          const result = await acceptShown(where.host, shown, token.name);
          const message = el("p", "result", `Accepted in commit ${result.commit.slice(0, 7)}.`);
          for (const out of result.leftOut) {
            message.append(el("br"), `${idOf(out.path, snapshot)} was left out: ${out.reason}${out.names.length ? ` (${out.names.join(", ")})` : ""}.`);
          }
          await redraw(where, {}, message);
        } catch (failure) {
          const left = (failure.leftOut ?? []).map((out) => `${idOf(out.path, snapshot)}: ${out.reason}`);
          bar.disabled = ticks.size === 0;
          target.append(el("p", "result problem", [failure.message, ...left].join(" ")));
        }
      });
    } else if (context.product && parseServer(context) === "gitlab") {
      target.append(el("p", "problem", "A GitLab product is written with the project's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    }
    target.append(el("table", "list", el("thead", null, el("tr", null, el("th"), el("th", null, "Id"), el("th", null, "Title"), el("th", null, "Status"))), rows));
    if (bar) target.append(bar);
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
          result.textContent = failure.message;
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
