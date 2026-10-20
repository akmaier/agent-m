# Resource Cases

The cases of `tests/test_resources.py`: SPEC.md's check of the twelve requirements about the list of resources. One section per requirement, named as in the SPEC; each case states what is given, what is done (`input`) and what is expected. A case named Counter-proof is the SPEC's counter-proof of the check before it.

## A PRODUCT DECLARES ITS RESOURCES

### A resource declared in docs/resources.md is found

```json
{
  "given": "A product whose docs/resources.md holds the compute resource cluster on the runner gpu.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-check",
    "product": {
      "docs/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "instance": {},
    "params": {
      "resource": "cluster"
    }
  },
  "expected": {
    "parts": [
      "cluster"
    ],
    "error": null
  }
}
```

### Counter-proof: the same entry written anywhere else is not found

```json
{
  "given": "A product that holds the same list in docs/notes/resources.md and in resources.md, and none at docs/resources.md.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-check",
    "product": {
      "docs/notes/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n",
      "resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "instance": {},
    "params": {
      "resource": "cluster"
    }
  },
  "expected": {
    "error": "ResourceNotFound",
    "parts": null
  }
}
```

## A RESOURCE IS USED, A PARTICIPANT DEVELOPS

### An entry carrying capabilities is rejected

```json
{
  "given": "A resource of the type the module states, an agent, that carries the capabilities draft text and run code and tests.",
  "input": {
    "kind": "findings",
    "resource": {
      "name": "coder",
      "kind": "agent",
      "address": "https://agents.example.org/coder",
      "pin": "coder-v1",
      "licence": null,
      "maintainer": "unknown",
      "route": "bridge workstation",
      "place": "NHR@FAU, Erlangen",
      "paid": false,
      "secret": null,
      "capabilities": [
        "draft text",
        "run code and tests"
      ]
    },
    "rule": "A RESOURCE IS USED, A PARTICIPANT DEVELOPS"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### An entry carrying a role is rejected

```json
{
  "given": "The same agent carrying the role Builders.",
  "input": {
    "kind": "findings",
    "resource": {
      "name": "coder",
      "kind": "agent",
      "address": "https://agents.example.org/coder",
      "pin": "coder-v1",
      "licence": null,
      "maintainer": "unknown",
      "route": "bridge workstation",
      "place": "NHR@FAU, Erlangen",
      "paid": false,
      "secret": null,
      "role": "Builders"
    },
    "rule": "A RESOURCE IS USED, A PARTICIPANT DEVELOPS"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the same entry without them is accepted

```json
{
  "given": "The same agent without capabilities and without a role.",
  "input": {
    "kind": "findings",
    "resource": {
      "name": "coder",
      "kind": "agent",
      "address": "https://agents.example.org/coder",
      "pin": "coder-v1",
      "licence": null,
      "maintainer": "unknown",
      "route": "bridge workstation",
      "place": "NHR@FAU, Erlangen",
      "paid": false,
      "secret": null
    },
    "rule": "A RESOURCE IS USED, A PARTICIPANT DEVELOPS"
  },
  "expected": {
    "rejected": false,
    "refusedFor": false
  }
}
```

## A RESOURCE IS USED, A PARTICIPANT DEVELOPS - a list's columns

### A list whose entry carries the columns Capabilities and Role is rejected

```json
{
  "given": "A docs/resources.md whose table has, besides the ten columns, the columns Capabilities and Role, and one agent that fills them.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Maintainer": "unknown",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no",
        "Capabilities": "draft text",
        "Role": "Builders"
      }
    ],
    "extraColumns": [
      "Capabilities",
      "Role"
    ],
    "rule": "A RESOURCE IS USED, A PARTICIPANT DEVELOPS"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

## THE RESOURCE KIND IS ONE OF A CLOSED SET

### An unknown kind is rejected

```json
{
  "given": "A list with one entry of the kind service.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "service",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ],
    "rule": "THE RESOURCE KIND IS ONE OF A CLOSED SET"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the kind repository is accepted

```json
{
  "given": "A list with one repository entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Maintainer": "Acme Research Group",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: the kind data is accepted

```json
{
  "given": "A list with one data entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "corpus",
        "Kind": "data",
        "Address": "acme/corpus",
        "Pin": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Licence": "CC-BY-4.0",
        "Maintainer": "unknown",
        "Route": "downloaded"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: the kind model is accepted

```json
{
  "given": "A list with one model entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: the kind compute is accepted

```json
{
  "given": "A list with one compute entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: the kind endpoint is accepted

```json
{
  "given": "A list with one endpoint entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "local-llm",
        "Kind": "endpoint",
        "Address": "http://workstation.example.org:8000/v1",
        "Pin": "example-model",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: the kind agent is accepted

```json
{
  "given": "A list with one agent entry, complete for its kind.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Maintainer": "unknown",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

## A RESOURCE IS PINNED TO AN EXACT STATE

### A model without revision or hash fails

```json
{
  "given": "A list with a model entry whose Pin is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE IS PINNED TO AN EXACT STATE"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### A model pinned to a branch name fails

```json
{
  "given": "A model entry pinned to main.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "main",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE IS PINNED TO AN EXACT STATE"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the same entry with a 40-hex revision passes

```json
{
  "given": "The model entry with a revision of 40 hexadecimal digits.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### Counter-proof: a compute entry without a pin passes

```json
{
  "given": "A compute entry whose Pin is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

## A RESOURCE DECLARES ITS LICENCE

### A repository entry without a licence fails

```json
{
  "given": "A repository entry whose Licence is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Maintainer": "Acme Research Group",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE DECLARES ITS LICENCE"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the repository entry with MIT passes

```json
{
  "given": "The same repository entry with the licence MIT.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Maintainer": "Acme Research Group",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A data entry without a licence fails

```json
{
  "given": "A data entry whose Licence is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "corpus",
        "Kind": "data",
        "Address": "acme/corpus",
        "Pin": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Maintainer": "unknown",
        "Route": "downloaded"
      }
    ],
    "rule": "A RESOURCE DECLARES ITS LICENCE"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the data entry with MIT passes

```json
{
  "given": "The same data entry with the licence MIT.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "corpus",
        "Kind": "data",
        "Address": "acme/corpus",
        "Pin": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "downloaded"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A model entry without a licence fails

```json
{
  "given": "A model entry whose Licence is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE DECLARES ITS LICENCE"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the model entry with MIT passes

```json
{
  "given": "The same model entry with the licence MIT.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

## A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED

### A resource of unknown licence is declared by one commit of docs/resources.md

```json
{
  "given": "The product's Resources page, the repository alice/dlls holding files with a sentinel text; the person records the licence unknown.",
  "input": {
    "kind": "declare",
    "licence": "unknown"
  },
  "expected": {
    "commits": 1,
    "committedFiles": [
      "docs/resources.md"
    ],
    "violations": [],
    "contentRead": 0
  }
}
```

### A resource of a restricted licence is declared by one commit of docs/resources.md

```json
{
  "given": "The same, with the licence restricted - internal.",
  "input": {
    "kind": "declare",
    "licence": "restricted - internal"
  },
  "expected": {
    "commits": 1,
    "committedFiles": [
      "docs/resources.md"
    ],
    "violations": [],
    "contentRead": 0
  }
}
```

### Counter-proof: a fixture that adds a file from the resource fails

```json
{
  "given": "The same commit with the file README.md of the resource added to it.",
  "input": {
    "kind": "declare",
    "licence": "unknown",
    "plant": "README.md"
  },
  "expected": {
    "commits": 1,
    "committedFiles": [
      "docs/resources.md",
      "README.md"
    ],
    "violations": [
      "adds README.md",
      "README.md holds the resource's content"
    ],
    "contentRead": 0
  }
}
```

## A RESOURCE NAMES ITS MAINTAINER

### A repository entry with neither a maintainer nor unknown fails

```json
{
  "given": "A repository entry whose Maintainer is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE NAMES ITS MAINTAINER"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the repository entry with unknown passes

```json
{
  "given": "The same repository entry with the maintainer unknown.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A data entry with neither a maintainer nor unknown fails

```json
{
  "given": "A data entry whose Maintainer is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "corpus",
        "Kind": "data",
        "Address": "acme/corpus",
        "Pin": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Licence": "CC-BY-4.0",
        "Route": "downloaded"
      }
    ],
    "rule": "A RESOURCE NAMES ITS MAINTAINER"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the data entry with unknown passes

```json
{
  "given": "The same data entry with the maintainer unknown.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "corpus",
        "Kind": "data",
        "Address": "acme/corpus",
        "Pin": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Licence": "CC-BY-4.0",
        "Maintainer": "unknown",
        "Route": "downloaded"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A model entry with neither a maintainer nor unknown fails

```json
{
  "given": "A model entry whose Maintainer is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Route": "read on its host"
      }
    ],
    "rule": "A RESOURCE NAMES ITS MAINTAINER"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the model entry with unknown passes

```json
{
  "given": "The same model entry with the maintainer unknown.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "tiny",
        "Kind": "model",
        "Address": "someone/tiny",
        "Pin": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "Licence": "MIT",
        "Maintainer": "unknown",
        "Route": "read on its host"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A agent entry with neither a maintainer nor unknown fails

```json
{
  "given": "A agent entry whose Maintainer is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ],
    "rule": "A RESOURCE NAMES ITS MAINTAINER"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the agent entry with unknown passes

```json
{
  "given": "The same agent entry with the maintainer unknown.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Maintainer": "unknown",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

## A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER

### A route bridge <name> is accepted

```json
{
  "given": "A compute entry reached by bridge hpc.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "bridge hpc",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A route runner:<label> is accepted

```json
{
  "given": "A compute entry reached by runner:gpu.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### An entry without a route is rejected

```json
{
  "given": "A compute entry whose Route is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": true
  }
}
```

### An entry with another route is rejected

```json
{
  "given": "A compute entry reached by ssh alex.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "ssh alex",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ],
    "rule": "A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

## A RESOURCE DECLARES WHERE IT PROCESSES DATA

### A compute entry without a processing place fails

```json
{
  "given": "A compute entry whose Processing place is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu"
      }
    ],
    "rule": "A RESOURCE DECLARES WHERE IT PROCESSES DATA"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the compute entry with NHR@FAU, Erlangen passes

```json
{
  "given": "The same compute entry with the place NHR@FAU, Erlangen.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A endpoint entry without a processing place fails

```json
{
  "given": "A endpoint entry whose Processing place is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "local-llm",
        "Kind": "endpoint",
        "Address": "http://workstation.example.org:8000/v1",
        "Pin": "example-model",
        "Route": "bridge workstation",
        "Paid": "no"
      }
    ],
    "rule": "A RESOURCE DECLARES WHERE IT PROCESSES DATA"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the endpoint entry with NHR@FAU, Erlangen passes

```json
{
  "given": "The same endpoint entry with the place NHR@FAU, Erlangen.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "local-llm",
        "Kind": "endpoint",
        "Address": "http://workstation.example.org:8000/v1",
        "Pin": "example-model",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

### A agent entry without a processing place fails

```json
{
  "given": "A agent entry whose Processing place is left out.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Maintainer": "unknown",
        "Route": "bridge workstation",
        "Paid": "no"
      }
    ],
    "rule": "A RESOURCE DECLARES WHERE IT PROCESSES DATA"
  },
  "expected": {
    "rejected": true,
    "refusedFor": true
  }
}
```

### Counter-proof: the agent entry with NHR@FAU, Erlangen passes

```json
{
  "given": "The same agent entry with the place NHR@FAU, Erlangen.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "coder",
        "Kind": "agent",
        "Address": "https://agents.example.org/coder",
        "Pin": "coder-v1",
        "Maintainer": "unknown",
        "Route": "bridge workstation",
        "Processing place": "NHR@FAU, Erlangen",
        "Paid": "no"
      }
    ]
  },
  "expected": {
    "rejected": false
  }
}
```

## A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE

### A job needing a runner:gpu resource is not offered on a GitHub-hosted runner, and is offered on the runner gpu

```json
{
  "given": "A private product with the job workflow whose list holds the compute resource cluster on runner:gpu and the repository tools read on its host; a CI agent on GitHub's hosted runner and one on the runner with label gpu.",
  "input": {
    "kind": "routes",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      },
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Maintainer": "Acme Research Group",
        "Route": "read on its host"
      }
    ],
    "participants": [
      {
        "name": "ci-gpu",
        "route": "ci runner:gpu secret K"
      },
      {
        "name": "ci-hosted",
        "route": "ci hosted secret K"
      }
    ],
    "visibility": "private"
  },
  "expected": {
    "needs": [
      {
        "resource": "cluster",
        "route": "runner:gpu"
      }
    ],
    "offered": {
      "ci-gpu": [
        true
      ],
      "ci-hosted": [
        false
      ]
    }
  }
}
```

### Known positive: with no resource that needs a route the hosted runner is offered too

```json
{
  "given": "The same participants and a list with only the repository tools.",
  "input": {
    "kind": "routes",
    "rows": [
      {
        "Name": "tools",
        "Kind": "repository",
        "Address": "https://github.com/acme/tools",
        "Pin": "0123456789abcdef0123456789abcdef01234567",
        "Licence": "MIT",
        "Maintainer": "Acme Research Group",
        "Route": "read on its host"
      }
    ],
    "participants": [
      {
        "name": "ci-gpu",
        "route": "ci runner:gpu secret K"
      },
      {
        "name": "ci-hosted",
        "route": "ci hosted secret K"
      }
    ],
    "visibility": "private"
  },
  "expected": {
    "needs": [],
    "offered": {
      "ci-gpu": [
        true
      ],
      "ci-hosted": [
        true
      ]
    }
  }
}
```

## THE INSTANCE DECLARES ITS OWN RESOURCES

### A resource of the instance is found in the instance's docs/resources.md

```json
{
  "given": "An instance whose docs/resources.md holds the cluster, and a product whose list holds none.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-check",
    "product": {
      "docs/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n"
    },
    "instance": {
      "docs/resources.md": "# Resources of this instance\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "params": {
      "resource": "cluster"
    }
  },
  "expected": {
    "parts": [
      "cluster"
    ],
    "error": null
  }
}
```

### The instance's list is judged by the schema of every list: an incomplete entry is refused

```json
{
  "given": "A list titled for the instance holding a compute entry without a route.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ],
    "title": "this instance"
  },
  "expected": {
    "rejected": true
  }
}
```

### Counter-proof: the complete entry of the instance's list is accepted

```json
{
  "given": "A list titled for the instance holding the complete compute entry.",
  "input": {
    "kind": "judged",
    "rows": [
      {
        "Name": "cluster",
        "Kind": "compute",
        "Address": "cluster.example.org",
        "Route": "runner:gpu",
        "Processing place": "NHR@FAU, Erlangen"
      }
    ],
    "title": "this instance"
  },
  "expected": {
    "rejected": false
  }
}
```

## INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT

### The product's list does not inherit the instance's entry

```json
{
  "given": "The instance's list holds instance-box and shared (bridge hpc); the product's holds product-box and shared (runner:gpu); jobs on the runner gpu.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-pins",
    "product": {
      "docs/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| product-box | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "instance": {
      "docs/resources.md": "# Resources of this instance\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| instance-box | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | — |\n"
    },
    "params": {
      "route": "ci runner:gpu"
    }
  },
  "expected": {
    "lines": [
      "- product-box (compute)",
      "- shared (compute)"
    ]
  }
}
```

### A change of the instance's list changes nothing on the product's side

```json
{
  "given": "The same, with the instance's list now holding other entries and shared on runner:gpu.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-pins",
    "product": {
      "docs/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| product-box | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "instance": {
      "docs/resources.md": "# Resources of this instance\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| another | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "params": {
      "route": "ci runner:gpu"
    }
  },
  "expected": {
    "lines": [
      "- product-box (compute)",
      "- shared (compute)"
    ]
  }
}
```

### The instance's entry of a shared name is not the product's

```json
{
  "given": "The product's list holds shared on runner:gpu; the instance's holds shared on bridge hpc; a job on the Bridge hpc.",
  "input": {
    "kind": "recipe",
    "recipe": "resource-pins",
    "product": {
      "docs/resources.md": "# Resources of this product\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| product-box | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n"
    },
    "instance": {
      "docs/resources.md": "# Resources of this instance\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| instance-box | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |\n| shared | compute | cluster.example.org | — | — | — | bridge hpc | NHR@FAU, Erlangen | — | — |\n"
    },
    "params": {
      "route": "bridge hpc"
    }
  },
  "expected": {
    "parts": [],
    "lines": []
  }
}
```
