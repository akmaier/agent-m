// Every implemented key of MOD-browser-store's catalogue (docs/architecture/MOD-browser-store.md, Data): the instance's
// GitHub token, product tokens, products, notifications, endpoints, the paired Bridge, the jump host, and recorded
// setting tests, plus named remote sessions. A key outside this catalogue is never written (writeSetting, in index.mjs).
// Mailbox, "not an issue" and "acknowledged" are not implemented.
//
// Module: MOD-browser-store

const LITERAL_KEYS = new Set(["github-token", "products", "notifications", "notified", "bridge", "jump-host"]);

// Key families this item names, each parameterised after its prefix: a GitHub product's own token
// (A GITHUB PRODUCT USES A TOKEN OF ITS OWN), a GitLab project's access token (A GITLAB PRODUCT USES A PROJECT ACCESS
// TOKEN).
const KEY_FAMILIES = [/^github-token:.+$/, /^gitlab-token:.+$/, /^endpoint:.+$/, /^remote-session:.+$/, /^last-test:.+$/];

// isKnownKey(key) -> whether `key` is one this item's catalogue names.
export function isKnownKey(key) {
  return LITERAL_KEYS.has(key) || KEY_FAMILIES.some((family) => family.test(key));
}
