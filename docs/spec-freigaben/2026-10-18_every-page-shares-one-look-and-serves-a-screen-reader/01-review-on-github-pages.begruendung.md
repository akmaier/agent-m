# 10. Review on GitHub Pages: every page shares one look and serves a screen reader

**The change.** Two new requirements, after `THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK`:
- `EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE`: one set of style sheets for every page; buttons and links at least
  WCAG 2.2's minimum target size; and pages that reflow on a phone without scrolling sideways.
- `THE SITE SERVES A SCREEN READER`: WCAG 2.2 level AA on every page.

**Why.** akmaier, 2026-10-18: "We should have a usability requirement that all pages share their look and feel, buttons
are large enough to work on PC and mobile phone; tables and lists adopt to be visible on mobile phones (text width and
number of columns is important here); also we want our page to be accessible for screen readers; that's a second
requirement to be added."

**No sentence of the SPEC gives either today.** The SPEC was searched for "mobile", "phone", "screen reader",
"accessib", "look and feel", "touch", "narrow", "viewport", "WCAG" and "contrast", and its headings for PAGE, LOOK, STYLE,
THEME, LAYOUT, BUTTON, SCREEN and READ. The search works: it finds "phone" in the mail requirements (SPEC.md:2004 and
after). The nearest sentences are these:
- `THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK` names the colours and the logo, and nothing about a shared look of
  the pages, the size of controls or a phone.
- `ONE REVIEW LAYOUT FOR EVERY PRODUCT` is the layout of the files below `docs/`, not of the pages.
- `AGENT M'S SOURCE CODE LIVES IN SRC` says where style sheets lie, not what they do.

**Why the sentences name WCAG 2.2.** An invariant is testable and carries no number of its own (AGENTS.md §1). WCAG 2.2
fixes the thresholds that "large enough" and "visible on mobile phones" need:
- success criterion 2.5.8, *Target Size (Minimum)*, for the buttons;
- success criterion 1.4.10, *Reflow*, for text width and the number of columns: content readable at a phone's width
  without scrolling in two directions.
Level AA is the level that screen readers' users are usually promised. It includes 1.4.1, *Use of Color*: no status by
colour alone, so the coloured badges keep their words.

**What it leaves out.** No figure of its own for the target size or the width; no rule about the Bridge's window beyond
"every page of the instance's site"; no manual audit. The checks are automatic, in a DOM drawn at two widths.

**What follows once it is accepted.** A test of every route at a phone's width and a desktop's, and an automatic WCAG
check of every route, each with its counter-proof; then the fixes those tests demand, module by module. The items are
registered once the requirements are in the SPEC, because an item may realise only a requirement that exists.
