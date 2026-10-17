# Catalogue Is Data Release Cases

**REGISTER**

The cases of `tests/test_catalogue_is_data.py` (`THE CATALOGUE IS DATA`, MOD-model-catalogue). That file only loads them.

## Code under src names no shipped model or practice

### Case

```json
{
  "given": "The shipped catalogue of MOD-model-catalogue: src/model-catalogue/shipped.md and the name of each file it lists. The code of Agent M: every .mjs and .js file under src/, except a vendored library, which is a file with a folder named vendor in its path (as tests/jsrun.py excepts them).",
  "input": {
    "code_suffixes": [".mjs", ".js"],
    "vendored_folder": "vendor",
    "planted": "// the model {name} is chosen here\nconst x = 1;\n"
  },
  "expected": {
    "hits_in_agent_m_code": []
  }
}
```

## A model file added to an instance's docs/process-models is in the catalogue

### Case

```json
{
  "given": "A fixture instance whose snapshot holds one file, docs/process-models/lab-flow.md, a complete pulled model named lab-flow that is none of the shipped models.",
  "input": {
    "path": "docs/process-models/lab-flow.md",
    "text": "---\nname: lab-flow\nkind: pulled\nmeasure: items per state over time\n---\n# Lab flow\n\nA fixture model, added as a data file.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Plan | Owner | ITM |\n| Build | Builders | TST |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Plan | Build | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n| Plan | Build |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Plan → Build | ITM | the item is selected | Owner |\n\n## Roles\n\n| Name | Filled by | How many | Capabilities |\n|---|---|---|---|\n| Owner | person | one | read the repository |\n| Builders | agent | several | read the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 2 |\n| Time box | none |\n| Sprints | no |\n"
  },
  "expected": {
    "without_it": {"has_lab_flow": false},
    "with_it": {
      "name": "lab-flow",
      "kind": "pulled",
      "path": "docs/process-models/lab-flow.md",
      "phases": ["Plan", "Build"],
      "findings_for_it": [],
      "shipped_models_still_there": true
    }
  }
}
```
