// Every key of MOD-browser-store's catalogue that ITM-204 builds (docs/architecture/MOD-browser-store.md, Data): the
// instance's GitHub token, a GitHub product's own token, a GitLab project's token, the list of products, and, for
// UC-047, the notifications switch and what it notified. ITM-259 adds model endpoints, the paired Bridge and each
// setting's recorded last test. A key outside this catalogue is never written (writeSetting, in index.mjs). The jump
// host, remote sessions, the mailbox, "not an issue" and "acknowledged" are not built yet.
//
// Module: MOD-browser-store

const LITERAL_KEYS = new Set(["github-token", "products", "notifications", "notified", "bridge"]);

// Key families this item names, each parameterised after its prefix: a GitHub product's own token
// (A GITHUB PRODUCT USES A TOKEN OF ITS OWN), a GitLab project's access token (A GITLAB PRODUCT USES A PROJECT ACCESS
// TOKEN).
const KEY_FAMILIES = [/^github-token:.+$/, /^gitlab-token:.+$/, /^endpoint:.+$/, /^last-test:.+$/];

// isKnownKey(key) -> whether `key` is one this item's catalogue names.
export function isKnownKey(key) {
  return LITERAL_KEYS.has(key) || KEY_FAMILIES.some((family) => family.test(key));
}
