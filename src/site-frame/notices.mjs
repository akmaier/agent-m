// notices.mjs — the notices (docs/architecture/MOD-site-frame.md, Parts; Interfaces: notice): the page's one place for them, and a
// message drawn into it.
//
// Module: MOD-site-frame
// index.mjs exports `notice`; `noticePlace` is private to the module, and index.mjs calls it when it starts a page.

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
