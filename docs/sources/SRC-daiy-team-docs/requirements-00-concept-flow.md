# Concept flow — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: Concept Flow. The text is the original's, unchanged.

---

## Concept Flow

```mermaid
flowchart TD
    P["0. Profile and inventory<br/>Skill level, materials, tools (optional at start)"] --> A
    A["1. Capture the problem or project<br/>Photo or text description"] --> R{"Risk check<br/>SAF-01"}

    R -->|Immediate hazard| X["Safety notice and professional<br/>No DIY instructions"]
    R -->|Unclear or OK| B["2. Create an AI plan<br/>Diagnosis, follow-up questions, work packages"]

    B --> W{"Classify each work package<br/>FR-14"}
    W -->|Professional only| Y["Handover brief<br/>for a qualified professional"]
    W -->|DIY or DIY with preparation| M["3. Match materials and tools<br/>against inventory"]

    M --> C{"Source missing items"}
    C --> D["Buy new<br/>e.g. OBI"]
    C --> E["Buy second-hand<br/>e.g. Kleinanzeigen"]
    C --> F["3D printing<br/>Non-safety-critical parts"]

    D --> G["4. Compare the options<br/>Compatibility, price and sustainability"]
    E --> G
    F --> G

    G --> H{"Is the solution suitable and safe?"}
    H -->|Yes| I["5. Carry out the work<br/>Step-by-step instructions"]
    H -->|No| J["Gather more information<br/>Find an alternative or recommend a professional"]

    J --> B
    I --> K["Completed<br/>Result, feedback, inventory updated, saved to history"]

    classDef ai fill:#E5EFFB,stroke:#4779B8,color:#17365D,stroke-width:1.5px
    classDef decision fill:#FFF2D6,stroke:#C58B16,color:#624700,stroke-width:1.5px
    classDef sustainability fill:#E2F3E8,stroke:#398253,color:#174D2B,stroke-width:1.5px
    classDef outcome fill:#F1E8FA,stroke:#8860A8,color:#42265D,stroke-width:1.5px
    classDef safety fill:#FBE5E5,stroke:#B84747,color:#5D1717,stroke-width:1.5px

    class B,M,G ai
    class R,W,C,H decision
    class E,F sustainability
    class I,K outcome
    class X,Y safety
```
