# Result Records Cases

Every case is a sequence of runs adding their records to the branch `test-results` of a product repository, held in memory, through MOD-result-records' `appendResult`; the host is a fake that keeps the files of the branch and every commit it is asked for. `existing` is what the branch holds before the first run; `append` the records the runs add, in order, each at its path; `tests` the declared tests the outcomes are read for, as `resultsAt` takes them. A case of the group `history` has no run: it is the history of a branch, one entry for each commit, with the paths the commit added, changed and deleted, which the check of the rule reads.

## a run leaves a record beside the earlier one

### Case

```json
{
  "group": "runs",
  "commit": "cccccccccccccccccccccccccccccccccccccccc",
  "existing": {
    "runs/cccccccccccccccccccccccccccccccccccccccc/20261018-1000-commit-aaaa.md": "---\ncommit: cccccccccccccccccccccccccccccccccccccccc\nlevels:\n  - unit\noccasion: commit\nparticipant: ci-hosted\ndate: 2026-10-18T10:00:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | passed | |\n"
  },
  "append": [
    {
      "path": "runs/cccccccccccccccccccccccccccccccccccccccc/20261018-1100-on-demand-bbbb.md",
      "text": "---\ncommit: cccccccccccccccccccccccccccccccccccccccc\nlevels:\n  - system\noccasion: on-demand\nparticipant: lab-runner\ndate: 2026-10-18T11:00:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-902 | system | failed | |\n"
    }
  ],
  "tests": [
    {"id": "TST-901", "level": "unit"},
    {"id": "TST-902", "level": "system"}
  ],
  "expected": {
    "results": ["added"],
    "branches": ["test-results"],
    "paths": ["runs/cccccccccccccccccccccccccccccccccccccccc/20261018-1100-on-demand-bbbb.md"],
    "kept": true,
    "named": {"commit": "cccccccccccccccccccccccccccccccccccccccc", "levels": ["system"], "participant": "lab-runner", "date": "2026-10-18T11:00:00Z"},
    "outcomes": {"TST-901": "passed", "TST-902": "failed"}
  }
}
```

## two runs of two commits each leave their own record

### Case

```json
{
  "group": "runs",
  "commit": "dddddddddddddddddddddddddddddddddddddddd",
  "existing": {},
  "append": [
    {
      "path": "runs/dddddddddddddddddddddddddddddddddddddddd/20261019-0900-commit-1111.md",
      "text": "---\ncommit: dddddddddddddddddddddddddddddddddddddddd\nlevels:\n  - unit\noccasion: commit\nparticipant: ci-hosted\ndate: 2026-10-19T09:00:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | passed | |\n"
    },
    {
      "path": "runs/dddddddddddddddddddddddddddddddddddddddd/20261019-0905-commit-2222.md",
      "text": "---\ncommit: dddddddddddddddddddddddddddddddddddddddd\nlevels:\n  - unit\noccasion: commit\nparticipant: lab-runner\ndate: 2026-10-19T09:05:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | failed | |\n"
    }
  ],
  "tests": [
    {"id": "TST-901", "level": "unit"}
  ],
  "expected": {
    "results": ["added", "added"],
    "branches": ["test-results", "test-results"],
    "paths": [
      "runs/dddddddddddddddddddddddddddddddddddddddd/20261019-0900-commit-1111.md",
      "runs/dddddddddddddddddddddddddddddddddddddddd/20261019-0905-commit-2222.md"
    ],
    "kept": true,
    "named": {"commit": "dddddddddddddddddddddddddddddddddddddddd", "levels": ["unit"], "participant": "lab-runner", "date": "2026-10-19T09:05:00Z"},
    "outcomes": {"TST-901": "flaky"}
  }
}
```

## a record at the path of an existing record is refused

### Case

```json
{
  "group": "refused",
  "commit": "cccccccccccccccccccccccccccccccccccccccc",
  "existing": {
    "runs/cccccccccccccccccccccccccccccccccccccccc/20261018-1000-commit-aaaa.md": "---\ncommit: cccccccccccccccccccccccccccccccccccccccc\nlevels:\n  - unit\noccasion: commit\nparticipant: ci-hosted\ndate: 2026-10-18T10:00:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | passed | |\n"
  },
  "append": [
    {
      "path": "runs/cccccccccccccccccccccccccccccccccccccccc/20261018-1000-commit-aaaa.md",
      "text": "---\ncommit: cccccccccccccccccccccccccccccccccccccccc\nlevels:\n  - unit\noccasion: commit\nparticipant: intruder\ndate: 2026-10-18T10:00:00Z\n---\n## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | failed | |\n"
    }
  ],
  "tests": [
    {"id": "TST-901", "level": "unit"}
  ],
  "expected": {
    "results": ["Exists"],
    "branches": [],
    "paths": [],
    "kept": true,
    "outcomes": {"TST-901": "passed"}
  }
}
```

## a history that only adds records

### Case

```json
{
  "group": "history",
  "history": [
    {"commit": "1", "added": ["runs/c/a.md"], "changed": [], "deleted": []},
    {"commit": "2", "added": ["runs/c/b.md", "runs/d/c.md"], "changed": [], "deleted": []},
    {"commit": "3", "added": ["runs/d/d.md"], "changed": [], "deleted": []}
  ],
  "expected": {"rewritten": [], "deleted": []}
}
```

## a history in which a commit amends a record (the counter-proof fixture)

### Case

```json
{
  "group": "history",
  "history": [
    {"commit": "1", "added": ["runs/c/a.md"], "changed": [], "deleted": []},
    {"commit": "2", "added": ["runs/c/b.md"], "changed": ["runs/c/a.md"], "deleted": []},
    {"commit": "3", "added": [], "changed": [], "deleted": ["runs/c/b.md"]}
  ],
  "expected": {"rewritten": ["runs/c/a.md"], "deleted": ["runs/c/b.md"]}
}
```
