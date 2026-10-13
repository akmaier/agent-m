# Test Battery Cases

## complete declaration passes

path: tests/complete.test.mjs

### Text

```javascript
// TST-410101 · level: release · module: system
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a complete test declaration
// input: MOD-test-document reads and checks it
// expect: no finding is returned
test("complete", () => {});
```

### Expected Findings

```json
[]
```

## missing precondition is named

path: tests/missing-given.test.mjs

### Text

```javascript
// TST-410102 · level: release · module: system
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// input: MOD-test-document reads and checks it
// expect: one finding names the missing precondition
test("missing given", () => {});
```

### Expected Findings

```json
[
  {
    "artifact": "TST-410102",
    "line": 1,
    "kind": "error",
    "rule": "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS",
    "what": "no precondition",
    "fix": "add a line given: that states the precondition"
  }
]
```

## missing input is named

path: tests/missing-input.test.mjs

### Text

```javascript
// TST-410103 · level: release · module: system
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a declaration without an input
// expect: one finding names the missing input
test("missing input", () => {});
```

### Expected Findings

```json
[
  {
    "artifact": "TST-410103",
    "line": 1,
    "kind": "error",
    "rule": "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS",
    "what": "no input",
    "fix": "add a line input: that states the input"
  }
]
```

## empty expected result is named

path: tests/empty-expect.test.mjs

### Text

```javascript
// TST-410104 · level: release · module: system
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a declaration with an empty expected result
// input: MOD-test-document reads and checks it
// expect:
test("empty expect", () => {});
```

### Expected Findings

```json
[
  {
    "artifact": "TST-410104",
    "line": 1,
    "kind": "error",
    "rule": "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS",
    "what": "no expected result",
    "fix": "add a line expect: that states the expected result"
  }
]
```
