---
id: ARC-002
title: Plain ES modules without a build step, and three vendored libraries for Markdown, sanitising and Mermaid
forced_by:
  - NO SERVER
  - ARTIFACTS ARE MARKDOWN
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - AGENT M IS MIT-LICENSED
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - AGENT M'S SOURCE CODE LIVES IN SRC
keeps:
  - AGENT M IS MIT-LICENSED
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
---
# ARC-002 Plain ES modules without a build step, and three vendored libraries

## Context

The pages render Markdown artifacts with Mermaid diagrams written by people and by models. They are served as static
files (ARC-001) and read by readers of a book who fork Agent M and may change it. The same modules must also run under
`node --test` in CI and be compiled into the bridge with Deno.

Rendering untrusted Markdown into a page that holds tokens in `localStorage` needs an HTML sanitiser; a Markdown parser
and the Mermaid renderer are needed because artifacts are Markdown and their diagrams Mermaid. No CDN may serve code to
the page.

## Decision

1. **No build step.** Agent M is plain ECMAScript modules (`.mjs`) under `src/`, loaded by the browser as they are in
   the repository, imported unchanged by `node --test` and by the bridge's Deno entry point. No bundler, no transpiler,
   no package manager at run time. Book ch. 10 §3: KISS — a fork's owner can read and change what runs.
2. **Three libraries, vendored** in `src/vendor/`, copied unchanged from the npm registry with their licence files; the
   table in `src/vendor/README.md` names package, version and licence. Updating one is a pull request that replaces the
   file and its table row.
   - `marked` — Markdown to HTML;
   - `dompurify` — every HTML string from Markdown passes `DOMPurify.sanitize` before it reaches the DOM;
   - `mermaid` — renders diagrams, with `securityLevel: "strict"`.
3. **Agent M's licence is MIT**, stated in `LICENSE` at the root of the repository. A library is vendored only under a
   licence compatible with it — one that permits redistribution in an MIT project with its notice kept —, and its
   licence file lies beside it in `src/vendor/`.

### Due diligence (read 2026-09-30)

Sources: npm registry document `https://registry.npmjs.org/<package>`; downloads
`https://api.npmjs.org/downloads/point/last-month/<package>`; repository `https://api.github.com/repos/<owner>/<repo>`;
issue counts `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open` (and `is:closed`,
`closed:>=2025-09-30`). Agent M's licence is MIT; a licence is compatible when it permits redistribution in an MIT
project with its notice kept.

| Candidate | Role | Licence (source) | Against MIT | Releases | Issues | Adoption |
|---|---|---|---|---|---|---|
| **marked** 18.0.14 — chosen | Markdown | MIT (`LICENSE` of markedjs/marked; npm field `MIT`) | compatible | first 2011-07-24, latest 2026-09-22, 25 versions in the last 12 months (npm) | 11 open, 1 680 closed, 85 closed in 12 months (GitHub search) | 303 248 258 downloads last month; 37 218 stars |
| markdown-it 15.0.2 | Markdown | MIT (npm, GitHub) | compatible | first 2014-12-19, latest 2026-09-11, 8 versions in 12 months (npm) | 8 open, 940 closed, 58 closed in 12 months | 115 274 620; 21 950 stars |
| micromark 4.0.3 | Markdown | MIT (npm, GitHub) | compatible | first 2014-11-29, latest 2026-09-26, 1 version in 12 months (npm) | 10 open, 61 closed, 2 closed in 12 months | 228 631 736; 2 229 stars |
| **dompurify** 3.4.16 — chosen | sanitiser | MPL-2.0 OR Apache-2.0 (npm field; GitHub reports Apache-2.0) | compatible (either licence, file kept unchanged) | first 2014-05-21, latest 2026-09-23, 22 versions in 12 months | 0 open, 716 closed, 64 closed in 12 months | 256 255 372; 17 423 stars |
| sanitize-html 2.17.7 | sanitiser | MIT (npm) | compatible | first 2013-09-10, latest 2026-08-13, 8 versions in 12 months | lives in apostrophecms/apostrophe: 121 open, 1 408 closed (whole monorepo) | 42 319 677 |
| Browser Sanitizer API (`Element.setHTML`) | sanitiser | built into the browser | n/a | in Chrome 146 and Firefox 148, not in Safari (mdn/browser-compat-data `api/Element.json`) | n/a | n/a |
| **mermaid** 12.0.0 — chosen | diagrams | MIT (npm, GitHub) | compatible | first 2014-12-02, latest 2026-09-10, 15 versions in 12 months | 1 476 open, 2 370 closed, 250 closed and 426 opened in 12 months | 64 319 010; 90 490 stars |

## Alternatives

- **A bundler and a framework (Vite, React)** — a build step between the repository and what runs; a fork's owner would
  need Node and the toolchain to change one line, and the bridge would compile a build output instead of the modules
  the tests import.
- **Loading the libraries from a CDN** — a further origin that could serve changed code to a page holding tokens.
- **markdown-it or micromark instead of marked** — both are maintained and MIT-licensed; marked is a single ES module
  file and has the most recent and most frequent releases of the three.
- **sanitize-html instead of DOMPurify** — it parses with its own HTML parser for server use and is released as part of
  a CMS monorepo; DOMPurify uses the browser's own parser, is the smaller dependency and has no open issue.
- **The browser Sanitizer API** — not available in Safari; when it is, DOMPurify can be removed in one pull request.
- **Rendering no diagrams, showing Mermaid source only** — reviewers read architecture and use cases by their diagrams;
  GitHub renders Mermaid, and the pages do too.

## Consequences

- `mermaid.min.js` is the largest file of the site and loads on every page; loading it on the first diagram is an
  implementation option.
- Mermaid has many open issues; a diagram that fails to render is shown with the error beside its source.
- Updating a library is a deliberate pull request with CI; nothing changes under the reader.
- The licence files travel with the vendored files; the README table is the product's own record of reuse and is kept in
  step with them.
