// notices.mjs — the notices (docs/architecture/MOD-site-frame.md, Parts; Interfaces: notice): the page's one place for them, a
// message drawn into it, and the notices about a stored token — its expiry from fourteen days before it, and its refusal.
//
// Module: MOD-site-frame
// index.mjs exports `notice`; `noticePlace`, `showTokenNotices` and `refusedNotice` are private to the module: index.mjs calls them
// when it starts a page, and dashboard-app.mjs, the live page's app, calls them for its own place. It uses MOD-browser-store
// (readSetting, expiringSoon) and MOD-repository-hosts (parseAddress) through their index.mjs.

import { readSetting, expiringSoon } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { tokenKeyOf } from "./routing.mjs";

// Where the new value of a renewed token goes (UC-042 1a: Renew opens the token's line in Settings, with its page and the paste field).
const PASTE = "After renewing it, paste the new value in Settings.";

let place = null;

// The page's one place for notices: a new <section class="site-frame-notices">, which `notice` draws into from now on. index.mjs puts
// it into the page it starts.
export function noticePlace() {
  place = document.createElement("section");
  place.className = "site-frame-notices";
  return place;
}

// notice(kind, detail) -> void — one supplied message at the frame's notice place: its text, an optional link, and an optional button
// whose click hands the caller's action the place under the message, to draw into. It performs no action beyond drawing them and
// that hand-over. Throws an Error when no page has been started.
export function notice(kind, { text, link, action } = {}) {
  if (!place) throw new Error("Start a page before showing a notice.");
  const shown = document.createElement("p");
  shown.className = `notice ${kind}`;
  shown.append(String(text ?? ""));
  if (link) {
    const anchor = document.createElement("a");
    anchor.setAttribute("href", link.href);
    anchor.textContent = link.label;
    shown.append(" ", anchor);
  }
  place.append(shown);
  if (action) {
    const button = document.createElement("button");
    button.className = "btn small";
    button.textContent = action.label;
    const opened = document.createElement("div");
    opened.className = "notice-opened";
    button.addEventListener("click", () => action.run(opened));
    shown.append(" ", button);
    place.append(opened);
  }
}

// The tokens a page watches, the instance's first and, where the page shows a product, the product's own: [key, owner] — the key it
// is kept under, and what its name is followed by in a notice. product: { address } or null.
function watchedTokens(product) {
  return [["github-token", ""], ...(product ? [[tokenKeyOf(parseAddress(product.address)), ` for ${product.address}`]] : [])];
}

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED (UC-042 1a, 1b): Renew hands the token's key and the place under the notice to
// `renew`, the caller's way to the token's line of Settings, which opens the token's page, prefilled as when it was set up, with the
// repositories to pick beside it and the paste field for the new value.
const renewal = (key, renew) => ({ action: { label: "Renew", run: (opened) => renew(key, opened) } });

// refusedNotice(failure, { store, product, renew }) -> void — a `token-refused` notice for MOD-repository-hosts' TokenRefused: it
// names the token the failure names, and Renews the watched token stored under that name — the product's own before the instance's
// —, or the instance's where none is stored under it.
export function refusedNotice({ tokenName }, { store, product = null, renew }) {
  const [instanceToken, ownToken] = watchedTokens(product);
  const [key] = [ownToken, instanceToken].find((watched) => watched && readSetting(store, watched[0])?.name === tokenName) ?? instanceToken;
  notice("token-refused", { text: `The server refused your token ${tokenName}. ${PASTE}`, ...renewal(key, renew) });
}

// showTokenNotices({ store, product, renew, now }) -> void — for the instance's token and, where the page shows one, the product's
// own token: a `token-refused` notice while the token's last test is a refusal, otherwise a `token-expiring` notice while its recorded
// expiry is within fourteen days or past (MOD-browser-store's expiringSoon), each with Renew. A token this browser does not keep, and
// one with no recorded expiry that was not refused, shows nothing. product: { address } or null; renew: (key, place: Element) -> void.
export function showTokenNotices({ store, product = null, renew, now = new Date() }) {
  const soon = new Map(expiringSoon(store, now).map((entry) => [entry.key, entry.expires]));
  const today = now.toISOString().slice(0, 10);
  for (const [key, owner] of watchedTokens(product)) {
    const token = readSetting(store, key);
    if (!token) continue;
    const tokenName = `${token.name ?? key}${owner}`;
    if (readSetting(store, `last-test:${key}`)?.outcome === "refused") {
      notice("token-refused", { text: `The server refused your token ${tokenName}. ${PASTE}`, ...renewal(key, renew) });
    } else if (soon.has(key)) {
      const expires = soon.get(key);
      const kind = key.startsWith("gitlab-token:") ? "GitLab project token" : "GitHub token";
      notice("token-expiring", { text: `Your ${kind} ${expires < today ? "expired" : "expires"} on ${expires} (${tokenName}). ${PASTE}`,
        ...renewal(key, renew) });
    }
  }
}
