# Rate Reporting Cases

## declaration without runs is named

kind: declaration
path: tests/model-dependent.test.mjs

### Text

```javascript
// TST-411101 · level: release · module: system
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: a model-dependent test declaration with phrasings but no run count
// input: MOD-test-document reads and checks it
// expect: one finding names that the runs are missing
// phrasings: 3
test("model-dependent without runs", () => {});
```

### Expected Findings

```json
[
  {
    "artifact": "TST-411101",
    "line": 1,
    "kind": "error",
    "rule": "A MODEL-DEPENDENT TEST IS MEASURED AS A RATE",
    "what": "the test has phrasings but no runs",
    "fix": "fix the number of runs, at least 2, in a line runs: before the first run"
  }
]
```

## current rate beside last release

kind: rates

### Rate Case

```json
{
  "current": "1111111111111111111111111111111111111111",
  "last_release": "3333333333333333333333333333333333333333",
  "records": [
    {
      "path": "runs/1111111111111111111111111111111111111111/20261013-1000-commit-aaaa.md",
      "commit": "1111111111111111111111111111111111111111",
      "occasion": "commit",
      "rows": [
        ["TST-411201", "release", "failed", "6 of 10"],
        ["TST-411202", "release", "passed", "9 of 10"],
        ["TST-411203", "release", "passed", "5 of 10"]
      ]
    },
    {
      "path": "runs/3333333333333333333333333333333333333333/20260901-1000-release-candidate-bbbb.md",
      "commit": "3333333333333333333333333333333333333333",
      "occasion": "release-candidate",
      "rows": [
        ["TST-411201", "release", "passed", "8 of 10"],
        ["TST-411202", "release", "passed", "7 of 10"]
      ]
    }
  ],
  "expected": [
    { "test": "TST-411201", "now": "6 of 10", "then": "8 of 10", "worse": true },
    { "test": "TST-411202", "now": "9 of 10", "then": "7 of 10", "worse": false },
    { "test": "TST-411203", "now": "5 of 10", "then": null, "worse": false }
  ]
}
```
