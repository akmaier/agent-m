# Product settings schema

The canonical settings document of one product.

```json
{
  "schema": "product-settings",
  "shape": "document",
  "rule": "PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF",
  "path": "docs/settings.md",
  "frontMatter": {
    "pseudonymisation": { "type": "enum", "values": ["on", "off"] }
  },
  "sections": [],
  "otherSections": "allowed"
}
```
