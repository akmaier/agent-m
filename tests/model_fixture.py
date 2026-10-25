# Module: MOD-model-catalogue
"""The way tests/test_model_validation.py and tests/test_gate_definition.py ask MOD-model-catalogue about a model definition:
`model(text)` the Model `catalogue` reads from it, as an instance's own model docs/process-models/fixture.md of a snapshot that
holds nothing else; `errors(text)` the error findings `modelFindings` gives on it, read with `modelSchema.model` through
MOD-documents' readDocument. The module is asked through node (tests/jsrun.py); the text is handed over in the expression.
"""
import json

from jsrun import js

PATH = "docs/process-models/fixture.md"


def model(text: str) -> dict:
    """The Model catalogue gives for `text` at PATH of an instance's snapshot."""
    return js(f"const files = {{ {json.dumps(PATH)}: {json.dumps(text)} }};"
              "const snapshot = { paths: Object.keys(files), read: async (p) => files[p] ?? null,"
              " blob: (p) => (p in files ? 'b'.repeat(40) : null) };"
              f"return (await modelCatalogue.catalogue(snapshot)).models.find((m) => m.path === {json.dumps(PATH)});")


def errors(text: str) -> list:
    """The error findings of `text` read as a model definition at PATH."""
    return js(f"const doc = documents.readDocument(modelCatalogue.modelSchema.model, {json.dumps(PATH)}, {json.dumps(text)});"
              "return modelCatalogue.modelFindings(doc).filter((f) => f.kind === 'error');")
