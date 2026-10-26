# Non-functional requirements NFR-01 to NFR-10 — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 2. Non-Functional Requirements. The text is the original's, unchanged.

---

### 2. Non-Functional Requirements — Quality Requirements

| ID | Requirement | Measurable acceptance criterion for the prototype |
|---|---|---|
| NFR-01 | Ease of use | At least 4 out of 5 test participants **per persona group** can start a case without help. |
| NFR-02 | Understandable language | Instructions avoid unnecessary jargon or explain technical terms directly. |
| NFR-03 | Low complexity | A case can be started in no more than 3 required input steps. Profile and inventory are optional and never block the start. |
| NFR-04 | Performance | For normal test cases, the AI response appears within an agreed target, e.g. 10 seconds at the 95th percentile. |
| NFR-05 | Reliability | Incorrect or incomplete AI outputs are detected and are not displayed without validation. |
| NFR-06 | Data protection | Users are informed how text, photos and inventory data are processed. Unnecessary personal data is not collected. |
| NFR-07 | Accessible use | Adequate contrast, readable text, clear labels, usability without relying on color alone. |
| NFR-08 | Maintainability | Prompts, test cases, and changes are versioned and documented in a traceable way. |
| NFR-09 | Adaptive depth | The same test case produces visibly different detail levels for "beginner" and "advanced" profiles, while safety content is identical. |
| NFR-10 | Account security | If FR-08 is implemented: passwords are stored hashed, data export and full deletion are possible within the app. |

UX principles for both personas:

- Users do not need to know how to write a good prompt.
- The app asks for missing information in everyday language.
- Instructions use short sentences, numbered steps, and illustrative images where available.
- Users can go back at any time, simplify an explanation, or expand a skipped basic step.
- The app always gives understandable feedback when the AI does not know something or an error occurs.
