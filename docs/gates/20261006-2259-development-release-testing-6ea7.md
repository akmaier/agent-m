---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a9244eb1749bedbaf1bf41c214e4f17ec2783dc4
  - https://github.com/akmaier/agent-m/pull/130
date: 2026-10-06 22:59 UTC
---
# Development → Release testing: ITM-220

**REGISTER**

## Reason

ITM-220, pull request #130 by developer-opus-b, on head `a9244eb`, against the item as `main` holds it since `51a1bc0`.
All five points hold:
- The first commit, `7a86f72`, holds only `tests/markdown-render.test.mjs`, and CI was red on it: that file failed, since
  its module did not exist yet.
- CI is green on the head, in a run made after #128 had merged into `sprint/06`.
- Only MOD-markdown-render's folder — its code, and `vendor/` with marked, DOMPurify, their licences and the README — and
  the new test naming the module change.
- The 9 new tests have 9 counter-proofs.
- The Acceptance holds: rendering and sanitising, an image as a link, a Mermaid block as its source, the same HTML for
  the same text, and the editor's preview, marks, *Save* and refusal.

What is not built is needed by no part of UC-002's page; ITM-221 needs no `setMarks`. The developer's gaps do not bear on
this item.
