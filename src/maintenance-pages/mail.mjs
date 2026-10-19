// The route `mail` — mail read into issues (UC-038 steps 1 to 3, 7 to 9, 10, and 2a, 4b, 6a, 7a, 7b, 8a), as docs/architecture/MOD-maintenance-pages.md states it and ITM-963 builds it: *Read mailbox*; the mails no issue lists and
// nobody marked *not an issue*, with sender, subject and date in this browser only; per mail, the mail in full beside the proposal (empty here: UC-038 4b), its text editable, every hit of the mail's people marked; *Create issue* — only
// without a hit —, *Add to #n*, *Not an issue*. The participant, the run panel and *Propose* are ITM-964's.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them):
//   - Reading the mailbox and each decision are made on a click the browser marks as a person's (`isTrusted`): reading may write a note that lists a reply on the issue of its thread, and a decision writes.
//   - After Create issue or Add to #n the mail stays in the list with what came of the click (7b: Create issue once per concern); after Not an issue it leaves it. The next reading leaves out every mail an issue lists or the store marks.
//   - Create issue is disabled while a hit of the mail's people stands in the title or the text, and while either is empty. A created issue of the kind change is followed by a link to its route `issue/<n>` (step 10: Propose SPEC change).
//   - The products are those this browser keeps (`products`), each connected with its own token (else, for GitHub, the instance's). The mailbox is the stored connection; on the Bridge route the Bridge it names, by its stored name.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as the schedule page of MOD-test-pages does).
//   - The subject the route gives the prompt bar holds the `MAIL-` identifiers of the listed mails and no text of any mail, and refuses `propose-edit` and `hand-over` (MOD-maintenance-pages.md, Interfaces); ITM-510 extends it for a
//     participant the mailbox allows.

import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { mailbox, signIn } from "../mail-routes/index.mjs";
import { decideMail, readNewMail } from "../mail-handling/index.mjs";
import { personHits } from "../personal-data/index.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";

const STEP_TEXT = {
  read: "Read mailbox reads the folders named in the mailbox connection, read-only: nothing is marked as read, moved or flagged. Each mail gets the identifier MAIL- plus sixteen hex digits of the hash of its Message-ID. A mail whose thread an issue lists is attached to that issue at once, with a note, and shown under it. Book: ch. 14, Evolution Processes and Change Identification.",
  list: "These mails are listed with sender, subject and date, in this browser only. A mail an issue already lists, or that you marked not an issue in this browser, is left out. Nothing here is stored anywhere but in the mailbox.",
  review: "Each mail is shown in full beside its proposal. No participant proposed anything, so the proposal is empty: write the neutral title and text yourself. The text is searched, without a model, for the mail's people; a hit is marked and Create issue stays disabled until you have edited it out.",
  decide: "One click decides a mail. Create issue writes one issue to the product's tracker, labelled defect or change, listing the mail's identifier and naming no reporter. Add to #n lists the mail on an existing issue. Not an issue marks the mail in this browser by its identifier. Nothing else of the mail is written to a repository.",
};

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
const fold = (text) => el("details", "explain", el("summary", null, "What is this?"), el("p", null, text));
const link = (href, className, text) => { const anchor = el("a", className, text); anchor.setAttribute("href", href); return anchor; };
// A listener that answers only a click the browser marks as a person's (THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK).
function button(className, text, listener) {
  const node = el("button", className, text);
  node.setAttribute("type", "button");
  node.addEventListener("click", (event) => { if (event?.isTrusted === true && !node.disabled) listener(event); });
  return node;
}

// The mail identifiers of the mails now listed: what the subject of this route gives the prompt bar.
let listedIds = [];

// The hosts of the products this browser keeps, by their address as the store lists it: each with its own token, else, for GitHub, the instance's.
export function productsOf(store) {
  const hosts = new Map();
  for (const url of readSetting(store, "products") ?? []) {
    try {
      const address = parseAddress(url);
      const key = address.server === "gitlab" ? `gitlab-token:${new URL(address.origin).host}/${address.path}` : `github-token:${address.path}`;
      const stored = readSetting(store, key) ?? (address.server === "github" ? readSetting(store, "github-token") : null);
      hosts.set(url, { address: url, name: address.path, host: connect(address, stored?.value ? { token: stored.value } : {}) });
    } catch { /* an address that cannot be read is no product */ }
  }
  return hosts;
}

export function mailboxOf(store) {
  const connection = readSetting(store, "mailbox");
  if (!connection) return null;
  if (connection.route === "graph") return { connection, box: mailbox(connection, null) };
  const entry = readSetting(store, `bridge:${connection.imap?.bridge}`);
  const bridge = entry ? bridgeAt(settingsOf({ name: connection.imap.bridge, ...entry }, readSetting(store, "jump-host"))) : null;
  return { connection, box: mailbox(connection, bridge) };
}

const who = (address) => (address.name ? `${address.name} <${address.address}>` : address.address);

// The review of one mail: the mail in full beside an empty proposal, its hits, and the three decisions.
function reviewOf({ mail, people }, { products, store, context, onMarked }) {
  const product = el("select", "mail-product", ...[...products.values()].map((each) => { const option = el("option", null, each.name); option.setAttribute("value", each.address); return option; }));
  const kind = el("select", "mail-kind", ...["defect", "change"].map((name) => { const option = el("option", null, name); option.setAttribute("value", name); return option; }));
  kind.value = "defect";
  const title = el("input", "mail-title");
  const body = el("textarea", "mail-body");
  const hitsList = el("ul", "mail-hits");
  const number = el("input", "mail-issue-number");
  const result = el("p", "mail-result");
  const chosen = () => products.get(product.value) ?? [...products.values()][0] ?? null;
  const issueNumber = () => (/^\d+$/.test(String(number.value ?? "").trim()) ? Number(number.value) : null);

  const create = button("create-issue", "Create issue", () => decide({ kind: "create", product: chosen()?.address, title: title.value, text: body.value, label: kind.value }));
  const add = button("add-to-issue", "Add to #n", () => decide({ kind: "add", product: chosen()?.address, issue: issueNumber() }));
  const none = button("not-an-issue", "Not an issue", () => decide({ kind: "not-an-issue" }));
  create.disabled = true;
  add.disabled = true;

  function refresh() {
    const hits = [...personHits(String(title.value ?? ""), people), ...personHits(String(body.value ?? ""), people)];
    hitsList.replaceChildren(...hits.map((hit) => el("li", "mail-hit", `${hit.kind}: ${hit.value}`)));
    create.disabled = hits.length > 0 || !String(title.value ?? "").trim() || !String(body.value ?? "").trim() || chosen() === null;
    const n = issueNumber();
    add.textContent = n === null ? "Add to #n" : `Add to #${n}`;
    add.disabled = n === null || chosen() === null;
  }
  for (const [node, type] of [[title, "input"], [body, "input"], [number, "input"], [product, "change"], [kind, "change"]]) node.addEventListener(type, refresh);

  async function decide(decision) {
    const found = chosen();
    const which = found?.name ?? "the product";
    try {
      const { issue } = await decideMail({ id: mail.id, people }, decision, found?.host ?? null, store);
      if (decision.kind === "not-an-issue") { onMarked(mail.id); return; }
      result.replaceChildren(decision.kind === "create" ? `Created issue #${issue} in ${which}.` : `Added to #${decision.issue} of ${which}.`);
      if (decision.kind === "create" && decision.label === "change") result.append(" ", link(`#issue/${issue}`, "issue-link", "Propose SPEC change"));
    } catch (failure) {
      if (failure?.name === "PersonFound") { result.textContent = `The text names the mail's people: ${(failure.hits ?? []).map((hit) => hit.value).join(", ")}. Nothing was written.`; return; }
      if (failure?.name === "TokenRefused" || failure?.name === "PermissionMissing") {
        const token = link("#add-product", "token-step", "Store the token for this product");
        token.addEventListener("click", (event) => { event?.preventDefault?.(); context.go("add-product", found ? { address: found.address } : {}); });
        result.replaceChildren(failure.name === "PermissionMissing" ? `The token for ${which} lacks the permission to create issues or comments. Nothing was written. ` : `The token for ${which} was refused. Nothing was written. `, token);
        return;
      }
      result.textContent = `${failure?.name ?? "Error"}: ${failure?.message ?? failure}. Nothing was written.`;
    }
  }

  const shown = el("section", "mail-step-review", el("h3", null, "The mail and its proposal"),
    el("p", "mail-head", el("span", "mail-sender", who(mail.from)), " · ", el("span", "mail-subject", mail.subject), " · ", el("span", "mail-date", mail.date)),
    el("pre", "mail-text", mail.text),
    el("label", null, "Product ", product), " ", el("label", null, "Kind ", kind),
    el("p", null, el("label", null, "Title ", title)), el("p", null, el("label", null, "Text ", body)), hitsList, fold(STEP_TEXT.review));
  const decisions = el("section", "mail-step-decide", create, " ", el("label", null, "Issue number ", number), " ", add, " ", none, result, fold(STEP_TEXT.decide));
  const item = el("li", "mail", shown, decisions);
  item.setAttribute("data-mail", mail.id);
  return item;
}

async function render(target, context) {
  const out = el("div", "mail-out");
  const read = button("read-mailbox", "Read mailbox", async () => {
    out.replaceChildren(el("p", "muted", "Reading the mailbox…"));
    const store = context.store;
    const products = productsOf(store);
    const have = mailboxOf(store);
    if (!have) { out.replaceChildren(el("p", "mailbox-problem", "No mailbox is connected in this browser. Connect one on the Settings page first.")); return; }
    let found;
    try {
      found = await readNewMail(have.box, [...products.values()].map((each) => ({ address: each.address, host: each.host })), readSetting(store, "not-an-issue") ?? []);
    } catch (failure) {
      const problem = el("p", "mailbox-problem", `The mailbox could not be read, so nothing was read: ${failure?.name ?? "Error"}${failure?.reason ? ` (${failure.reason})` : ""}: ${failure?.message ?? failure}`);
      if (failure?.name === "SignInExpired" && have.connection.graph) {
        const again = button("sign-in-again", "Sign in again", async () => {
          try { await signIn(have.connection.graph.clientId, have.connection.address); problem.textContent = "Signed in. Read the mailbox again."; } catch (error) { problem.textContent = `Signing in failed: ${error?.name ?? "Error"}: ${error?.message ?? error}`; }
        });
        out.replaceChildren(problem, again);
      } else out.replaceChildren(problem);
      listedIds = [];
      return;
    }
    const list = el("ul", "mail-list");
    const shown = new Map();
    const onMarked = (id) => { shown.get(id)?.remove(); listedIds = listedIds.filter((each) => each !== id); };
    for (const entry of found.proposable) {
      const item = reviewOf(entry, { products, store, context, onMarked });
      shown.set(entry.mail.id, item);
      list.append(item);
    }
    listedIds = found.proposable.map(({ mail }) => mail.id);
    const attached = el("ul", "mail-attached", ...found.attached.map((each) => {
      const issue = link(`#issue/${each.issue}`, "issue-link", `#${each.issue}`);
      return el("li", "mail-attached-item", `Mail ${each.id} belongs to the thread of issue `, issue);
    }));
    out.replaceChildren(el("p", "mail-decided", `${found.decided} mail${found.decided === 1 ? " was" : "s were"} left out as decided.`), attached,
      el("section", "mail-step-list", el("h3", null, "Mails to decide"), list, fold(STEP_TEXT.list)));
  });
  target.replaceChildren(el("h2", null, "Mail"), el("section", "mail-step-read", el("p", null, read), fold(STEP_TEXT.read)), out);
}

function subject() {
  return { key: "mail", title: "Mail", kind: "converse", entry: null, paramsFor: () => ({ page: ["Mail", ...listedIds].join("\n") }), draftRoute: null, withhold: null, refuses: ["propose-edit", "hand-over"] };
}

export const route = { name: "mail", entry: "maintenance", title: "Mail", render, subject };
