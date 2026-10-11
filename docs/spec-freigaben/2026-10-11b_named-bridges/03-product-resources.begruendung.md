# 15. Product resources: a compute resource names its bridge

**The change.** `A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER` reads "a bridge identified by
its name" where it read "the local bridge", so the route of a compute resource is `bridge <name>` or `runner:<label>`. It
keeps its name; its check now says how its test works and what it checks. The rest of the section is carried over byte
for byte.

**Why.** Asked whether compute resources may be reached through a bridge other than this computer's, the PO answered,
2026-10-11: "Any Bridge". A cluster or a GPU box is reached through the bridge on a computer that reaches it, which is
seldom the person's own.

**Design principles.** *Adding one of a kind changes nothing of another* and *No special first case*: a resource names its
bridge as an endpoint, a mailbox and a participant do. *Nothing twice*: the route names the bridge by the same name the
browser keeps it under and the bridge's own settings carry.

**Where.** The requirement. `A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE` holds unchanged: a job needing a resource
reached by `bridge <name>` is offered only where that bridge runs it.

**Impact list.** UC-040; ARC-040, ARC-045; MOD-resource-list. Its check `tests/test_resources.py` is not yet written.
