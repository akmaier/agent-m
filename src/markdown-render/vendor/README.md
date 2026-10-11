# The vendored libraries of MOD-markdown-render

**REGISTER**

The libraries ARC-049 decides for Markdown and for sanitising, each the file its package publishes as an ECMAScript module,
copied unchanged from the npm registry, beside its licence file. The site has no build step and calls no origin it has not
named (`NO SERVER`), so they are served from here (`AGENT M'S SOURCE CODE LIVES IN SRC`). Each file keeps its own licence;
Agent M's MIT licence does not cover it.

| Library | Version | Licence | File | Fetched from | SHA-256 of the file |
|---|---|---|---|---|---|
| marked | 18.1.0 | MIT, `LICENSE.marked` | `marked.esm.js`, the package's `lib/marked.esm.js` | https://registry.npmjs.org/marked/-/marked-18.1.0.tgz | `054d73b676031dc8e60e247ef228044fbeebe10af14bac1a6e53852f80f826e5` |
| DOMPurify (`dompurify`) | 3.4.16 | MPL-2.0 OR Apache-2.0, used under Apache-2.0, `LICENSE.dompurify` | `purify.es.mjs`, the package's `dist/purify.es.mjs` | https://registry.npmjs.org/dompurify/-/dompurify-3.4.16.tgz | `c44274a7959cfdd4da871fa78a5d5fbbef55db68d118c5c0833bc4b5cf9633ad` |
| Mermaid | 12.0.0 | MIT, `LICENSE.mermaid` | `mermaid.min.js`, the package's `dist/mermaid.min.js` | copied unchanged from `docs/assets/vendor/mermaid.min.js` | `28fca7ae6ebc7ed7bb63bde63136a74bfef14f296a57e403657eeb8b32836073` |

Fetched on 2026-10-07; each archive matched the `integrity` its registry entry names. The licence files are the packages'
own `LICENSE`. A version moves only by a change that replaces the file, its licence file and its line here together
(ARC-049).
