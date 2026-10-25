# 13. Process execution and jobs: a given-up increment holds no item

**The change.** In `A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH`, the sentence names a third end of the
hold: the Product Owner gives up the sprint's increment. The check follows an increment given up. The rest of the section
is as it stands.

**Why.** akmaier, 2026-10-25: "A done item should not go back to the backlog." UC-041 7b said that when the Product Owner
gives up an increment, "its done items go back to the backlog and are no longer held". A done item stays done: a merged
pull request naming it decides its state (MOD-work-plans, `ItemState`), and a change to it is a new item. Without going
back to the backlog, the sentence as it stands would hold such an item for good, since its change never reaches the
default branch; the modules it changes or uses would stay closed to every other team.

**Impact list.**
- A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH: changed; its check `tests/test_parallel_sprints.py` gains
  the case of an increment given up.
- UC-041 7b: a given-up increment's done items stay done and are no longer held (changed beside this entry, for
  acceptance).
- MOD-work-plans, the paragraph on held items: "its done items are back in the backlog" becomes "its done items stay
  done" (changed beside this entry, for acceptance). `heldItems` and `giveUpIncrement` keep their interfaces.
- ITM-1034: its Outcome follows the changed texts.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
