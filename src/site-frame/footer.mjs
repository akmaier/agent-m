// footer.mjs — the footer of the main and the review pages (docs/architecture/MOD-site-frame.md, Parts): the book *Vibe Coding* and the
// Pattern Recognition Lab of FAU Erlangen-Nürnberg, each a link; that no server is operated and that a page writes only when the person
// clicks, one commit under the person's own account; and a link to Agent M's source repository, where its MIT licence stands.
//
// Module: MOD-site-frame
// Private to the module: index.mjs draws it after the route and before the page's foot (startPage).

const BOOK = "https://link.springer.com/book/9783032399069";
const LAB = "https://lme.tf.fau.de/";

function link(href, text) {
  const anchor = document.createElement("a");
  anchor.setAttribute("href", href);
  anchor.textContent = text;
  return anchor;
}

function line(...parts) {
  const paragraph = document.createElement("p");
  paragraph.append(...parts);
  return paragraph;
}

/**
 * siteFooter(upstream: string) -> Element — the footer. `upstream` is the repository `owner/name` of Agent M's source, the upstream instance
 * named in the frame's data.
 */
export function siteFooter(upstream) {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  const inner = document.createElement("div");
  inner.className = "inner";
  inner.append(
    line("Agent M — the companion tool to the book ", link(BOOK, "Vibe Coding"), " (Springer), from the ",
      link(LAB, "Pattern Recognition Lab"), " of FAU Erlangen-Nürnberg."),
    line("No server: this page reads the repositories directly and writes only when you click — one commit under your own account."),
    line("Source and MIT licence: ", link(`https://github.com/${upstream}`, `github.com/${upstream}`), "."),
  );
  footer.append(inner);
  return footer;
}
