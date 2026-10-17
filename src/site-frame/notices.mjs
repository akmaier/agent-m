// notices.mjs — the notices (docs/architecture/MOD-site-frame.md, Parts; Interfaces: notice): the page's one place for them, a
// message drawn into it, and the notices about a stored token — its expiry from fourteen days before it, and its refusal.
//
// Module: MOD-site-frame
// index.mjs exports `notice`; `noticePlace`, `showTokenNotices` and `refusedNotice` are private to the module: index.mjs calls them
// when it starts a page, and dashboard-app.mjs, the live page's app, calls them for its own place. It uses MOD-browser-store
// (readSetting, expiringSoon) and MOD-repository-hosts (parseAddress, and webLinks of the hosts it is given) through their index.mjs.

import { readSetting, expiringSoon } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { tokenKeyOf } from "./routing.mjs";

// Where the new value of a renewed token goes (UC-042 1a: the renewal page, then the paste field).
const PASTE = "After renewing it, paste the new value in Settings.";

let place = null;

// The page's one place for notices: a new <section class="site-frame-notices">, which `notice` draws into from now on. index.mjs puts
// it into the page it starts.
export function noticePlace() {
  place = document.createElement("section");
  place.className = "site-frame-notices";
  return place;
}

// notice(kind, detail) -> void — one supplied message at the frame's notice place. It performs no action beyond drawing the
// supplied text and optional link. Throws an Error when no page has been started.
export function notice(kind, { text, link } = {}) {
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
}

// refusedNotice({ tokenName, renewal }) -> void — a `token-refused` notice that names the token and links the page where it is
// renewed: what MOD-repository-hosts' TokenRefused carries.
export function refusedNotice({ tokenName, renewal }) {
  notice("token-refused", { text: `The server refused your token ${tokenName}. ${PASTE}`, link: { label: "Renew", href: renewal } });
}

// showTokenNotices({ store, instance, product, now }) -> void — for the instance's token and, where the page shows one, the product's
// own token: a `token-refused` notice while the token's last test is a refusal, otherwise a `token-expiring` notice while its recorded
// expiry is within fourteen days or past (MOD-browser-store's expiringSoon), each with the page where the token is renewed (the host's
// webLinks, a request-free read). A token this browser does not keep, and one with no recorded expiry that was not refused, shows
// nothing. instance: { host }; product: { address, host } or null.
export function showTokenNotices({ store, instance, product = null, now = new Date() }) {
  const soon = new Map(expiringSoon(store, now).map((entry) => [entry.key, entry.expires]));
  const today = now.toISOString().slice(0, 10);
  const watched = [["github-token", instance.host, ""], ...(product ? [[tokenKeyOf(parseAddress(product.address)), product.host, ` for ${product.address}`]] : [])];
  for (const [key, host, owner] of watched) {
    const token = readSetting(store, key);
    if (!token) continue;
    const tokenName = `${token.name ?? key}${owner}`;
    const renewal = host.webLinks().tokens;
    if (readSetting(store, `last-test:${key}`)?.outcome === "refused") {
      refusedNotice({ tokenName, renewal });
    } else if (soon.has(key)) {
      const expires = soon.get(key);
      notice("token-expiring", { text: expires < today ? `Your token ${tokenName} expired on ${expires}. ${PASTE}` : `Your token ${tokenName} expires on ${expires}. ${PASTE}`,
        link: { label: "Renew", href: renewal } });
    }
  }
}
