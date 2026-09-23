## 8. Versioning

**CALENDAR VERSIONS** *(PO A. Maier, 2026-09-23)*
Agent M and every product built with it use calendar versioning in the form `YYYY.MINOR.PATCH`.
*Occasion:* the Product Owner's instruction, and the scheme already in use across the taskforce's
products. A year in the version number tells a reader how old a release is without a changelog.
*Check:* `tests/test_version_format.py`

**EVERY PRODUCT HAS ITS OWN VERSION LINE** *(PO A. Maier, 2026-09-23)*
One Agent M instance manages several products in parallel; each product's version is independent
of Agent M's and of every other product's.
*Occasion:* a shared version line would couple unrelated products, so that one product's release
would renumber the others.
*Check:* `tests/test_version_independence.py`

**A RELEASE IS TAGGED AND LOGGED**
A release raises the version, adds a dated entry to the changelog, and sets the git tag
`vYYYY.MINOR.PATCH`.
*Occasion:* a version number that exists only in a file cannot be checked out. The tag is what
makes a stated version recoverable.
*Check:* `tests/test_release_artifacts.py`

**AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT** *(PO A. Maier, 2026-09-23)*
Every generated artifact records the Agent M version, the model, and the date of its generation.
*Occasion:* when output quality changes, the first question is what changed — the prompt, the
model, or the source. Without the record, none of the three can be ruled out.
*Check:* `tests/test_artifact_provenance.py`

**A VERSION IS NOT REWRITTEN** *(PO A. Maier, 2026-09-23)*
A released version is never re-tagged or overwritten; a correction is a new version.
*Occasion:* a tag that moves makes every reference to it a statement about an unknown state, and
the dashboard's comparison across versions becomes meaningless.
*Check:* `tests/test_tags_immutable.py`
