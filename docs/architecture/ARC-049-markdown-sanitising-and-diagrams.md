---
id: ARC-049
title: Markdown, sanitising and diagrams in the page
refines: ARC-037
forced_by:
  - ARTIFACTS ARE MARKDOWN
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
  - EDITS ARE PREPARED ON THE DASHBOARD
  - THE PAGES ROOT IS THE REPOSITORY ROOT
  - NO SERVER
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - AGENT M'S SOURCE CODE LIVES IN SRC
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-008
  - UC-018
  - UC-022
  - UC-025
  - UC-031
  - UC-044
---
# ARC-049 Markdown, sanitising and diagrams in the page

## Context

Every page of the site, and the Bridge's window (ARC-040), shows Markdown that people and participants wrote:
requirements, use cases with their diagrams, architecture files, proposals, issues, replies (`ARTIFACTS ARE MARKDOWN`).
Its tables must render and its Mermaid blocks must be drawn (`DIAGRAMS ARE MERMAID IN MARKDOWN`), and the editor shows
both live while a person types (`EDITS ARE PREPARED ON THE DASHBOARD`, UC-018). Agent M also draws diagrams of its own
from data when a page opens: the modules' component diagram (UC-025), a process model's phases and gates (UC-031).

None of this text is trusted. A participant's draft or a file in a product repository may carry HTML or script, and the
page that renders it holds the person's tokens in the browser's store, where every script running in the page can read
them. A script brought in by a rendered text could send a token to a server that did not issue it (`A TOKEN GOES ONLY TO
THE SERVER THAT ISSUED IT`).

The site has no build step (`THE PAGES ROOT IS THE REPOSITORY ROOT`) and calls no origin it has not named (`NO SERVER`).
Every library it uses is therefore served from the instance repository itself, under `src/` (`AGENT M'S SOURCE CODE
LIVES IN SRC`), as a file the browser loads as it is.

## Decision

MOD-markdown-render renders with three libraries. Each is vendored in `src/markdown-render/vendor/` as the single file its
package publishes for browsers, beside its licence file, and a README there names each file's package, version and
licence.

- **marked** turns Markdown, tables included, into HTML.
- **DOMPurify** sanitises every HTML string before it reaches the page — marked's output, and every SVG mermaid draws —,
  so that no script, event handler or foreign resource from a text runs in the page.
- **mermaid** draws each `mermaid` block in the page with its default security level `strict`, under which "HTML tags in
  the text are encoded and click functionality is disabled" (its documentation, address below). Its file is loaded only
  by a page that shows a diagram.

The rendered prose is what a reviewer accepts; a diagram that cannot be drawn is shown as its source, with the reason,
and the prose around it is unaffected (`THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW`). A vendored version
moves only by a change that replaces the file, its licence file and its line in the README together.

## Alternatives

- **markdown-it** for Markdown. Its licence is MIT and its adoption wide (below), but its latest version depends on six
  other packages. Vendoring it without a build would mean seven files tied together, or a bundling step the site does
  not have (`KEEP IT SIMPLE`). Rejected.
- **micromark** for Markdown. MIT; its latest version depends on eighteen other packages. Rejected for the same reason.
- **sanitize-html** for sanitising. MIT; its latest version depends on seven other packages, among them `htmlparser2`
  and `postcss`, and the package is now kept in the repository of the Apostrophe CMS, its former repository archived.
  DOMPurify depends on nothing and publishes one file for the browser. Rejected.
- **Diagrams drawn in advance with @mermaid-js/mermaid-cli**, in CI. Its command `mmdc` needs Node and the headless
  browser `puppeteer`, which it names as its peer dependency. Drawing in advance needs a build that writes the drawn
  diagrams beside the texts, and cannot draw the editor's live preview nor the diagrams Agent M derives when a page
  opens. Rejected. The diagram language itself is not a choice: `DIAGRAMS ARE MERMAID IN MARKDOWN`.

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption is the package's downloads from the npm registry between
2026-09-05 and 2026-10-04. Releases count every version the registry lists, and in brackets those without a pre-release
tag. Issues are those of the source repository the registry names.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| marked — chosen | MIT | yes | 2011-07-24 | 18.1.0, 2026-10-05 | 226 (224) | 12 / 1,680 | 326,621,887 | [1] | 2026-10-05 |
| markdown-it | MIT | yes | 2014-12-19 | 15.0.2, 2026-09-11 | 87 (87) | 8 / 940 | 119,440,414 | [2] | 2026-10-05 |
| micromark | MIT | yes | 2014-11-29 | 4.0.3, 2026-09-26 | 43 (39) | 10 / 61 | 245,406,015 | [3] | 2026-10-05 |
| dompurify — chosen | MPL-2.0 OR Apache-2.0 | yes, used under Apache-2.0 with its licence file beside it | 2014-05-21 | 3.4.16, 2026-09-23 | 153 (153) | 0 / 717 | 274,122,222 | [4] | 2026-10-05 |
| sanitize-html | MIT | yes | 2013-09-10 | 2.18.0, 2026-09-30 | 127 (122) | 124 / 1,410 in the Apostrophe CMS repository the registry names, which holds more than this package; 16 / 402 in its former repository, archived | 45,555,651 | [5] | 2026-10-05 |
| mermaid — chosen | MIT | yes | 2014-12-02 | 12.1.0, 2026-10-02 | 263 (179) | 1,480 / 2,371 | 68,978,011 | [6] | 2026-10-05 |
| @mermaid-js/mermaid-cli | MIT | yes | 2020-03-01 | 12.0.0, 2026-09-24 | 83 (78) | 76 / 167 | 2,392,741 | [7] | 2026-10-05 |

No candidate is marked: every licence is known to be compatible with MIT.

Where each fact was read — licence, first release (`time.created`), latest release (`dist-tags.latest` and its time),
releases (`versions`), dependencies and peer dependencies of the latest version from the registry entry; adoption from
the downloads address; open and closed issues as `total_count` of the two searches; a repository's state from its
GitHub entry:

- [1] https://registry.npmjs.org/marked · https://api.npmjs.org/downloads/point/last-month/marked ·
  https://api.github.com/search/issues?q=repo:markedjs/marked+is:issue+is:open and `+is:closed`
- [2] https://registry.npmjs.org/markdown-it · https://api.npmjs.org/downloads/point/last-month/markdown-it ·
  https://api.github.com/search/issues?q=repo:markdown-it/markdown-it+is:issue+is:open and `+is:closed`
- [3] https://registry.npmjs.org/micromark · https://api.npmjs.org/downloads/point/last-month/micromark ·
  https://api.github.com/search/issues?q=repo:micromark/micromark+is:issue+is:open and `+is:closed`
- [4] https://registry.npmjs.org/dompurify · https://api.npmjs.org/downloads/point/last-month/dompurify ·
  https://api.github.com/search/issues?q=repo:cure53/DOMPurify+is:issue+is:open and `+is:closed`
- [5] https://registry.npmjs.org/sanitize-html · https://api.npmjs.org/downloads/point/last-month/sanitize-html ·
  https://api.github.com/search/issues?q=repo:apostrophecms/apostrophe+is:issue+is:open and `+is:closed` ·
  https://api.github.com/repos/apostrophecms/sanitize-html (`archived`: true) and
  https://api.github.com/search/issues?q=repo:apostrophecms/sanitize-html+is:issue+is:open and `+is:closed`
- [6] https://registry.npmjs.org/mermaid · https://api.npmjs.org/downloads/point/last-month/mermaid ·
  https://api.github.com/search/issues?q=repo:mermaid-js/mermaid+is:issue+is:open and `+is:closed` · the security level:
  https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/docs/config/usage.md
- [7] https://registry.npmjs.org/@mermaid-js%2Fmermaid-cli (peer dependency `puppeteer`, command `mmdc`) ·
  https://api.npmjs.org/downloads/point/last-month/@mermaid-js/mermaid-cli ·
  https://api.github.com/search/issues?q=repo:mermaid-js/mermaid-cli+is:issue+is:open and `+is:closed`

## Consequences

- The vendored mermaid file is by far the largest file of the site; a page without a diagram does not load it.
- Each vendored file keeps its own licence; Agent M's MIT licence does not cover it.
- A vulnerability in one of the three is fixed for the instance only when its vendored file is replaced; the README in
  the vendor folder says what is vendored.
- Whatever the sanitiser removes from a text is not shown on the page, even where it was meant harmlessly; the text itself
  is unchanged, and the editor shows it as written.
