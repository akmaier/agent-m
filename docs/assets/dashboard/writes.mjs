// Writes — the dashboard's five commits: saving an edit, accepting, adding a product, the pseudonymisation setting and the
// collaborators (SPEC §9, §10, §14; UC-001, UC-006, UC-008, UC-042). Each is the direct result of a person's click on the
// button that names it, and goes through the git host's one write path with that person's token (ARC-003 decision 3). The
// kernel computes what they write (review-core.mjs planAcceptance, missingNeeds, missingLayout; pseudonymiser.mjs
// setProductSetting, formatCollaborators); this file commits it.
//
// Module: MOD-dashboard-app
//
// Moved out of docs/assets/review-core.mjs (ITM-124). Since ITM-008 the click handler of the button that names a write makes
// the authority (clickAuthority), and each write hands it to the write path, which refuses a write without one.

import {
  fetchText, parseProductAddress, isGitLab, commitFiles, gitlabProject, gitlabSnapshot, commitFilesGitLab, writeFiles,
} from "../git-host.mjs";
import { identifierKept } from "../artifacts.mjs";
import { missingNeeds, planAcceptance, missingLayout } from "../review-core.mjs";
import { PRODUCT_SETTINGS_PATH, COLLABORATORS_PATH, setProductSetting, formatCollaborators } from "../pseudonymiser.mjs";

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK: the one place in the browser where a person's click becomes the authority to
// write (ARC-003 decision 3), and only from an event the browser marks as trusted — `isTrusted` is set by the browser for real
// user input only and cannot be set by a script. A click a script makes becomes no authority, so no write starts. Called in the
// click handler of the button that names the write, with that handler's event; the write hands the result to the write path.
export function clickAuthority(event) {
  if (!event || event.isTrusted !== true) throw new Error("a write needs a person's click");
  return Object.freeze({ kind: "click" });
}

// Saving an edit of a reviewed file (EDITS ARE PREPARED ON THE DASHBOARD): refused, before anything is sent, when the text
// carries another identifier than the one the file was opened with (AN EDITED FILE KEEPS ITS IDENTIFIER); written only if the
// file is still the text the editor opened (A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE). openedId null: a file without
// an identifier, such as a SPEC proposal.
export async function saveReviewedFile({ repo = null, product = null, branch, token, authority, path, text, openedId, expectBlob }) {
  const refused = identifierKept(openedId, text);
  if (refused) throw new Error(refused);
  return writeFiles({ repo, product, branch, token, authority, message: `edit ${String(path).split("/").pop()} (Agent M dashboard)`,
    files: [{ path, content: text, expectBlob: expectBlob || null }] });
}

// ---------------------------------------------------------------- accepting (UC-006 4–7, 4d, 5a · UC-008 3d)
//
// AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL: with a token, one commit holds the approval
// record, the replaced SPEC section (the proposal byte for byte) and the decision row — the same bytes
// tools/apply_approvals.py writes without a token, which then finds the row and skips the record.
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER · A STALE APPROVAL IS NOT
// APPLIED: every ticked item names the text that was shown; one that changed is left out and named.

// One click: check the order, then plan and commit on the same head. readAt(head, path) -> text | null.
// -> { commit, accepted, leftOut }; commit is null when everything was left out (nothing written).
// product: a GitLab product (parseProductAddress) — the commit is then made there (writeFiles). If GitLab wrote the
// commit on a newer head than the one checked, `warning` names the files this acceptance read that changed in between.
export async function acceptItems({ repo, product = null, branch, token, authority, items, readAt, now = new Date() }) {
  if (!items.length) throw new Error("nothing ticked");
  const gaps = missingNeeds(items);
  if (gaps.length) throw new Error(gaps.map((g) => g.message).join(" "));
  let plan = null;
  const read = new Set();
  try {
    const commit = await writeFiles({ repo, product, branch, token, authority,
      message: () => `accept ${plan.accepted.join(", ")} (Agent M dashboard)`,
      files: async (head) => {
        plan = await planAcceptance({ items, read: (p) => { read.add(p); return readAt(head, p); }, now });
        return plan.files;
      } });
    const changed = (commit.changedMeanwhile || []).filter((p) => read.has(p));
    const warning = changed.length
      ? `GitLab wrote this commit on ${String(commit.parent).slice(0, 7)}, a newer state than the one checked (${String(commit.base).slice(0, 7)}): ` +
        `a commit that arrived at the same moment changed ${changed.join(", ")}. The acceptance was checked on the older text — open ` +
        "these files again and look whether it still covers them."
      : null;
    return { commit, accepted: plan.accepted, leftOut: plan.leftOut, warning };
  } catch (e) {
    if (plan && !plan.files.length) return { commit: null, accepted: [], leftOut: plan.leftOut };
    throw e;
  }
}

// ---------------------------------------------------------------- adding a product (UC-001)

// UC-001 Step C, one click: read the product repository, write only its missing layout into its default
// branch, then add its address to the list in this browser. Nothing is written into the instance
// repository (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY). A refused write adds nothing to the list.
// store: the browser store of settings-store.mjs. -> { commit: { sha, url } | null, product }
// For a GitLab product, `token` is its project token, and the product's server is the only one contacted. authority: the one
// the click on *Add product* made; without it the write path refuses the layout's commit, and the address is not stored.
export async function addProduct({ address, token, authority, store }) {
  const product = parseProductAddress(address);
  if (product.error) throw new Error(product.error);
  if (isGitLab(product)) {
    if (!token) throw new Error("A GitLab product is written with its project token — store it in Step B first.");
    const info = await gitlabProject({ product, token });
    if (!info.default_branch) throw new Error(`${product.address} has no branch yet — push a first commit to it, then add it here.`);
    const snap = await gitlabSnapshot({ product, ref: info.default_branch, token });
    const files = missingLayout(snap.tree.map((e) => e.path), product.repo);
    const commit = files.length
      ? await commitFilesGitLab({ product, branch: info.default_branch, token, authority, files,
        message: "Add the Agent M review layout (Agent M dashboard)" })
      : null;
    store.addProduct(product.address);
    return { commit, product };
  }
  const api = `https://api.github.com/repos/${product.repo}`;
  const info = JSON.parse(await fetchText(api, { headers: { Accept: "application/vnd.github+json" } }, token));
  const tree = JSON.parse(await fetchText(`${api}/git/trees/${encodeURIComponent(info.default_branch)}?recursive=1`, {}, token));
  const files = missingLayout(tree.tree.filter((e) => e.type === "blob").map((e) => e.path), product.repo);
  const commit = files.length
    ? await commitFiles({ repo: product.repo, branch: info.default_branch, token, authority, files,
      message: "Add the Agent M review layout (Agent M dashboard)" })
    : null;
  store.addProduct(product.address);
  return { commit, product };
}

// ---------------------------------------------------------------- product settings (UC-042 4–5, SPEC §14)

// One click commits docs/settings.md to the product (A PERSON'S OWN INPUT IS COMMITTED DIRECTLY); switching
// off needs the tick under the notice. current/currentBlob: the file as shown (null if absent).
export async function savePseudonymisation({ repo, product = null, branch, token, authority, current, currentBlob, off, acknowledged }) {
  if (off && acknowledged !== true) throw new Error("Tick “I have read this” under the notice first.");
  return writeFiles({ repo, product, branch, token, authority, message: `settings: pseudonymisation ${off ? "off" : "on"} (Agent M dashboard)`,
    files: [{ path: PRODUCT_SETTINGS_PATH, content: setProductSetting(current, "pseudonymisation", off ? "off" : null, repo ?? product?.repo),
      expectBlob: currentBlob || null }] });
}

export async function saveCollaborators({ repo, product = null, branch, token, authority, list, currentBlob }) {
  return writeFiles({ repo, product, branch, token, authority, message: "collaborators: update (Agent M dashboard)",
    files: [{ path: COLLABORATORS_PATH, content: formatCollaborators(list, repo ?? product?.repo), expectBlob: currentBlob || null }] });
}
