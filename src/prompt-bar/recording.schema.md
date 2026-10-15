# The recording switch

The schema of the switch `docs/conversation-recording.md` of the instance repository, in MOD-documents' schema language:
the format that MOD-prompt-bar's file (`docs/architecture/MOD-prompt-bar.md`) states under Data. The file is front matter
with the one key `recording`, `on` or `off`, and a title line; a missing file or key means `off`, which the schema does not
express: `recordingOf` decides it.

```json
{
  "schema": "recording",
  "shape": "document",
  "rule": "A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON",
  "path": "docs/conversation-recording.md",
  "frontMatter": {
    "recording": { "type": "enum", "values": ["on", "off"], "required": false }
  },
  "title": "# Recording of conversations",
  "sections": [],
  "otherSections": "allowed",
  "diagrams": "none"
}
```
