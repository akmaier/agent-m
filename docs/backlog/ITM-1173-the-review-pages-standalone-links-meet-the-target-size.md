---
id: ITM-1173
title: The review pages' standalone links meet the target size
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-review-pages
  - MOD-site-frame
builds_on:
  - ITM-905
tests:
  - system
origin:
  - Team1 Sprint106 review; PR1278 head aeda2b2fe3bdd68ce48bf72c8d044856f7984184
  - CI39630327573 node4 job119326541360; TST-905037 and TST-905050
---
# ITM-1173 The review pages' standalone links meet the target size

**REGISTER**

## Outcome

The existing real-browser WCAG check still reports target-size on the standalone return links of
#use-case/id=draft and #spec-entry/id=spec-2026-10-18_sample-01/edit=1, at both 390px and1280px.
Its recorded nodes are a[href$="#use-case"] and #main > div > a. On the same measured pages the
menu and explanation repairs are clear; #decision/id=draft is clear too, despite its earlier finding.

The call paths are review-pages/jobs.mjs:96 showDraft -> line100 All-use-cases link, and
review-pages/entry-edit.mjs:39 showEntryEdit -> Back-to-entry link -> common.mjs:27 link with no
control class -> the shared loaded styles -> axe target-size. The whole-page empty-violation
assertions remain; only these actual remaining reasons are TODOs.

## Scope

ReviewPages owns the two standalone controls. Frame is included for its shared look and the existing
Frame-owned system-test file, not a whole-page migration. Use the existing common control style if it
meets the outcome; no new style sheet, public interface or format. One responsibility keeps this link
outcome separate from the waiting-badge contrast; DRY and KISS reuse the existing shared look.

Keep destinations, identifiers, labels, chosen-product behavior, editing/drafting behavior and no-write
behavior. Do not style every inline content link or alter the checker, fixtures, helpers, rule tags,
route set, existing expected values or levels. Other actual findings retain their own reasons.
This is a behavior item with system verification, not a tests-only coverage item.

## Acceptance

- The same two live routes, at the existing phone and desktop widths, have no target-size violation on
  these return controls. TST-905037/050 keep their identifiers, system level and empty-violations
  expectations; only resolved TODO reasons go after the actual checks pass.
- New focused system cases state their inputs and literal expected outcome, begin with unused TST
  identifiers and reuse the unchanged browser/server/axe path. Each has a planted owned-code fault,
  actual failing result and exact-restoration verification.
- The first commit contains only tests and its automatic CI is red before explicit source assignment.
  No unrelated link, badge, table, renderer, helper, formal artifact or old assertion change is included.
