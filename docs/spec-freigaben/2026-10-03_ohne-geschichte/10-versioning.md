## 8. Versioning

**CALENDAR VERSIONS** *(PO A. Maier)*
Agent M and every product built with it use calendar versioning in the form `YYYY.MINOR.PATCH`.
*Check:* `tests/test_version_format.py`

**EVERY PRODUCT HAS ITS OWN VERSION LINE** *(PO A. Maier)*
One Agent M instance manages several products in parallel; each product's version is independent
of Agent M's and of every other product's.
*Check:* `tests/test_version_independence.py`

**A RELEASE IS TAGGED AND LOGGED** *(PO A. Maier)*
A release raises the version, adds a dated entry to the changelog, and sets the git tag
`vYYYY.MINOR.PATCH`.
*Check:* `tests/test_release_artifacts.py`

**AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT** *(PO A. Maier)*
Every generated artifact records the Agent M version, the model, and the date of its generation.
*Check:* `tests/test_artifact_provenance.py`

**A VERSION IS NOT REWRITTEN** *(PO A. Maier)*
A released version is never re-tagged or overwritten; a correction is a new version.
*Check:* `tests/test_tags_immutable.py`
