# The conversation record

The schema of a conversation record `docs/conversations/<yyyymmdd>-<hhmm>-<4 hex>.md`, in MOD-documents' schema language:
the format that MOD-prompt-bar's file (`docs/architecture/MOD-prompt-bar.md`) states under Data. A record is evidence,
written by the first message and then only appended to, one section per message (`A RECORD IS EVIDENCE, NOT A PROPOSAL`);
its body holds no title line — the text after the front matter begins directly with the first section.

- The language names an appended section by its fixed heading. A message's section is headed
  `## <date and time> — <account or participant>` and a hand-over's `## <date and time> — handed over`, headings that differ
  from section to section, so the schema names no section and lets sections of its level stand (`otherSections`);
  MOD-prompt-bar's `record.mjs` writes them, and the lines of a section — `page:`, `model:`, `withheld:`, `job:` — are
  those the module file's Data table gives.
- `started` is the date and time of the first message in UTC, `YYYY-MM-DD HH:MM UTC`; `started_by` the person's account.

```json
{
  "schema": "conversation",
  "shape": "document",
  "rule": "A RECORD IS EVIDENCE, NOT A PROPOSAL",
  "path": "docs/conversations/{any}.md",
  "frontMatter": {
    "started": { "type": "time", "required": true },
    "started_by": { "type": "text", "required": true }
  },
  "sections": [],
  "otherSections": "allowed",
  "diagrams": "none"
}
```
