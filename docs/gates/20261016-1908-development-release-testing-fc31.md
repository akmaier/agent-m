---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6e410ddc1b40c242f7e3aab08f1999d59499c4e6
  - https://github.com/akmaier/agent-m/pull/619
date: 2026-10-16 19:08 UTC
---
# Development → Release testing: ITM-534, The main page's menu links into the review pages without loading their views

**REGISTER**

## Reason

ITM-534, pull request #619 into `sprint/team1/50`, at head `6e410ddc`. developer-sonnet-c wrote it, as `50.md` assigns.
It lists AGENTS.md, SPEC.md, MOD-site-frame, the item, `50.md` and chapters 9, 11, 12 and 13 as read in full.

1. **The tests-only commit is red.** `33fc8a62` was pushed alone. Run 38952033423 failed on it:
   - TST-531009 and TST-531010 on node (0);
   - TST-531013 on node (1).

   The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38952408816, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/site-frame/index.mjs`, `menu.mjs` and `start.mjs` (MOD-site-frame),
   and the two test files of ITM-531.
   - `src/desktop-shell/window.mjs:107` is untouched.
   - ITM-018 passes before and after, the eight site-frame test files pass, and the `fetch` spy saw no call.
4. **Each fault is caught.**
   - Without the main page's check, TST-531009, TST-531010 and TST-531013 fail.
   - With the slugs imported again, TST-531013 fails.

   Restored, the tests pass 15 of 15.
5. **The Acceptance holds.**
   - On the main page, `menuOf` makes each entry a link `docs/index.html#<entry>`, and no view module is imported.
   - `startPage({ page, views })` takes no `menuViews`, and a passed one, even of a missing module, is not refused.
   - The review pages' menu is unchanged.

## Two points

- **TST-531010 changed too.** The item named only TST-531009 and TST-531013. TST-531010 keeps its old assertions and
  gains one: that `menuOf("main", [])` gives the eight links. It tests the function whose output the accepted text
  changes, and it was red in the red run. So it is taken as this item's.

  The item's grep looked for `menuViews` and `data-menu-views`, and not for `menuOf`, the value that changes. That is the
  Product Owner's miss, against sprint 48's agreement to grep for every value an item changes.
- **TST-531012 still gives an empty `data-menu-views`,** and its "given" text says so. The attribute is ignored now, and
  the fixture still holds it, so the text describes its input truly. It stays, as the nine calls that pass
  `menuViews: []` stay.

The doc comment at `src/site-frame/index.mjs:172` says that `menuViews` is a property "which an earlier setup carried".
That is history in a file (AGENTS.md §1). It reads as what holds now if worded "a property `menuViews` is ignored", and
is mended with the module's next change.
