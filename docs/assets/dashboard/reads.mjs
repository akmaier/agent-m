// Reads — the dashboard's two reads that need both the git host and the kernel: a text by its blob SHA, kept in this browser
// by that SHA, and the last accepted text of an identifier (SPEC §10 A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT,
// AN APPROVAL NAMES THE EXACT TEXT; UC-008 2a). The git host reads (readBlob, commitsTouching); the kernel decides (readByBlob,
// lastAccepted) on what those reads are handed to it as ports — the shell wires the two (ARC-003 decisions 1 and 2).
//
// Module: MOD-dashboard-app
//
// Moved out of docs/assets/review-core.mjs (ITM-130), with the arguments its callers passed there: on GitHub a product or
// its repository (`repo`), on GitLab the product; the token that reads it; a cache of file texts by blob SHA
// (settings-store.mjs fileTexts) and the key the texts are kept under.

import { isGitLab, readBlob as readBlobOnServer, commitsTouching } from "../git-host.mjs";
import { readByBlob, lastAccepted as lastAcceptedOf } from "../review-core.mjs";

// The product a read goes to: a GitLab product itself; on GitHub the repository `repo` names, else the product's own.
const target = (product, repo) => (isGitLab(product) ? product : { ...(product || {}), repo: repo ?? product?.repo });

// The exact text of a blob, by its SHA, from the product's server — refused unless it hashes to that SHA — or from the texts
// this browser keeps, which readByBlob checks against the SHA. cache, cacheKey: where and under which key the text is kept.
export async function readBlob({ product = null, repo = null, blob, token = null, cache = null, cacheKey = null }) {
  const p = target(product, repo);
  return readByBlob({ sha: blob, cache, key: cacheKey, read: () => readBlobOnServer({ product: p, blob, token }) });
}

// The last accepted text of identifier `id` at the pinned commit `commit`: { record, text, committedAt, count } or null when it
// has no record. records: parsed records, each with `_path`. cache, repoKey: this browser's file texts by blob SHA, kept under
// `${repoKey}/${blob}`. When the identifier has several records, the date of each is the newest commit touching its path.
export async function lastAccepted({ product = null, repo = null, commit, token = null, records, id, cache = null, repoKey = null }) {
  const p = target(product, repo);
  return lastAcceptedOf({ records, id,
    committedAt: async (path) => {
      const list = await commitsTouching({ product: p, commit, path, token, limit: 1 });
      if (!list.length) throw new Error(`${path}: no commit found`);
      return list[0].date;
    },
    read: (blob) => readBlob({ product: p, blob, token, cache, cacheKey: repoKey ? `${repoKey}/${blob}` : null }) });
}
