---
id: ITM-1193
title: The install of xvfb and openbox from the cached archives no longer spends its time before and in dpkg
level: system
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1184
tests:
  - system
origin:
  - the gate of #1310 (ITM-1183), job 120136281734; #1306's job 120081402445
---
# ITM-1193 The install of xvfb and openbox from the cached archives no longer spends its time before and in dpkg

**REGISTER**

## Outcome

Every node shard installs xvfb and openbox from cached archives, and the step takes from 8 to 83 s with nothing or
little fetched. The full logs show where the time goes:
- **Job 120136281734** (node (4), #1310, cancelled at 158 s):
  - 20 s from "Reading package lists" (22:56:21) to "Preconfiguring packages" (22:56:41);
  - 15 s unpacking poppler-data (to 22:56:56);
  - 7 s in libc-bin's trigger (to 22:57:06).
- **Job 120081402445** (node (0), #1306): 17 s from the package list (20:50:46) to "Preconfiguring packages" (20:51:03),
  with no `Get:` line.

The step counts against the job's two minutes, and its variance, not the mirror, is what still lets the heaviest shard
reach the limit.

## Acceptance

- The step's time on the node shards, from the jobs API over two full runs, is recorded before and after. Its slowest
  case is no more than half of today's 40 s on a hit.
- **Each remedy is chosen by what the logs show, and measured on its own.** Candidates:
  - dpkg's `force-unsafe-io` on a throwaway runner;
  - leaving out the preconfiguring step (`DEBIAN_FRONTEND=noninteractive`, no debconf templates extracted);
  - a package set without poppler-data where openbox and xvfb do not need it.
- A remedy that does not move the time it addresses is not kept.
- The tests of ITM-1179, ITM-1183 and ITM-1184 stay green, and a test pins what is kept.
- The first commit holds only the tests, and CI is red on it.
