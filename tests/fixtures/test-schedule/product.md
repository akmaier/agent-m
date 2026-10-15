---
nightly: 03:30
command: python -m pytest --junitxml=build/results.xml
report: build/results.xml
---
## Levels

| Row | every commit | pull request | nightly | release candidate | on demand | runs on |
|---|---|---|---|---|---|---|
| unit | ✓ | ✓ | | ✓ | ✓ | hosted |
| component | ✓ | | | ✓ | ✓ | |
| system | | ✓ | ✓ | ✓ | ✓ | lab-runner |
| paid | | | ✓ | ✓ | ✓ | |
| release | | | | ✓ | ✓ | |
| user | | | | ✓ | ✓ | |
