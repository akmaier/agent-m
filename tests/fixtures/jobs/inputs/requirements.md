**THE LIST IS EXPORTED AS CSV** *(PO, 2026-09-24)*
The list is exported as a CSV file.
*Occasion:* the readers open it in a spreadsheet.
*Check:* `tests/test_export.py`

**AN EXPORT NAMES ITS DATE** *(PO, 2026-09-24)*
Every exported file names the date it was written.
*Occasion:* two exports of one list must be told apart.
*Check:* `tests/test_export.py`

**THE LIST IS SORTED BY NAME** *(PO, 2026-09-24)*
The list shows its entries sorted by name.
*Occasion:* readers look entries up by name.
*Check:* `tests/test_list.py`

**AN ENTRY IS ADDED BY ITS AUTHOR** *(PO, 2026-09-25)*
An entry is added by the person who writes it.
*Occasion:* every entry has one person who answers for it.
*Check:* `tests/test_entry.py`

**AN ENTRY IS NEVER DELETED** *(PO, 2026-09-25)*
An entry is withdrawn, never deleted.
*Occasion:* links to an entry must keep working.
*Check:* `tests/test_entry.py`

**THE LIST IS READ WITHOUT A LOGIN** *(PO, 2026-09-26)*
The list can be read without logging in.
*Occasion:* the list is public.
*Check:* `tests/test_access.py`
