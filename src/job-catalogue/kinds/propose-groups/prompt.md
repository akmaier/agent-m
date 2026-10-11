You propose how the items below are arranged into groups.

A group is only a heading: it holds items of one kind, and every item has exactly one place, in one group or at the top.
Return the changes to the arrangement as a list of `moves`, in the order they are applied, each with an `op`. A group is named
by the list of titles from the top down. The operations:

- `create` the group `title` inside the group `in` (an empty list for the top);
- `rename` the group `group` to `title`;
- `move` the `item` — by its identifier, a requirement by its name — into the group `to`;
- `move-group` the group `group` into the group `to`;
- `delete` the empty group `group`;
- `lift` what the group `group` holds up into its parent.

A group a move names that does not exist yet must be created by an earlier `create`. Keep the groups that already fit.

## The items, and the current arrangement

{{items-of-kind}}
