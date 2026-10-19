# Job Cancel Cases

The cases of `tests/test_job_cancel.py`: SPEC.md's check of A CANCELLED JOB WRITES NOTHING MORE. Each case states what is given, when the person cancels (`cancelAt`) and what is expected: the commits of the product's repository in order, those of the instance's, how often the writer was called, the failure the job ended with and where the branch stands.

### A job cancelled between its test commit and its implementation commit leaves the branch at the test commit

```json
{
  "given": "A job of the kind implement, nobody attending, whose agent commits its tests to the job's branch, waits, and commits its implementation; the kind's writer commits the pull request. The person cancels after the test commit.",
  "input": {
    "cancelAt": "between the commits"
  },
  "expected": {
    "product": [
      "tests"
    ],
    "instance": [],
    "writerCalls": 0,
    "ended": "Cancelled",
    "branchAt": "tests"
  }
}
```

### A job cancelled after its answer, before its writer, writes nothing more

```json
{
  "given": "A job of the kind implement, nobody attending, whose agent commits its tests to the job's branch, waits, and commits its implementation; the kind's writer commits the pull request. The person cancels as the agent's answer arrives.",
  "input": {
    "cancelAt": "after the answer"
  },
  "expected": {
    "product": [
      "tests",
      "implementation"
    ],
    "instance": [],
    "writerCalls": 0,
    "ended": "Cancelled",
    "branchAt": "implementation"
  }
}
```

### A job cancelled before its first exchange writes nothing

```json
{
  "given": "A job of the kind implement, nobody attending, whose agent commits its tests to the job's branch, waits, and commits its implementation; the kind's writer commits the pull request. The person cancels before the agent is asked.",
  "input": {
    "cancelAt": "before the first exchange"
  },
  "expected": {
    "product": [],
    "instance": [],
    "writerCalls": 0,
    "ended": "Cancelled",
    "branchAt": null
  }
}
```

### A job cancelled during its last step writes nothing more

```json
{
  "given": "A job of the kind implement, nobody attending, whose agent commits its tests, then its implementation and answers; the kind is given one step, which runs after the last exchange, and the person cancels while it runs. The kind's writer commits the pull request.",
  "input": {
    "cancelAt": "during the last step"
  },
  "expected": {
    "product": [
      "tests",
      "implementation"
    ],
    "instance": [],
    "writerCalls": 0,
    "ended": "Cancelled",
    "branchAt": "implementation"
  }
}
```

### Counter-proof: the same job, never cancelled, commits both and the writer's result

```json
{
  "given": "A job of the kind implement, nobody attending, whose agent commits its tests to the job's branch, waits, and commits its implementation; the kind's writer commits the pull request. The person never cancels.",
  "input": {
    "cancelAt": "never"
  },
  "expected": {
    "product": [
      "tests",
      "implementation",
      "pull request"
    ],
    "instance": [],
    "writerCalls": 1,
    "ended": null,
    "branchAt": "pull request"
  }
}
```

