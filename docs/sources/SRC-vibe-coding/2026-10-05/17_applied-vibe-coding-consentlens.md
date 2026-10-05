---
course: vibe-coding
title: "Applied Vibe Coding in 2026: ConsentLens"
chapter: 17
source: vhb_vibe_coding/VIBE_17_Examples_02/chapter.tex
course_url: https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901
book: "Vibe Coding (Maier et al., Springer, CC BY)"
book_url: https://link.springer.com/book/9783032399069
license: CC BY
---

# Chapter 17 — Applied Vibe Coding in 2026: ConsentLens

**Andreas Maier, Moritz Zaiss, and Siming Bayer**
Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)

## Abstract

We present *ConsentLens*, the first project in this book that was designed from the outset to follow the complete software engineering workflow described in the preceding chapters—from requirements elicitation and use-case modeling through architecture, implementation, testing, and deployment planning. A team of five MBA students built a working prototype for artificial intelligence (AI)-assisted informed consent in clinical settings over approximately three weekends with roughly 4.5 combined effective working days.

This chapter is deliberately contemporary for early 2026. The tools, platforms, and AI services we describe—from Replit and Cursor to Synthesia and NotebookLM—represent the state of practice at the time of writing and have a high probability of being outdated or substantially changed within months. We therefore focus on the *engineering patterns* rather than the specific tools: how to evaluate and select platforms, how to manage the transition from no-code prototyping to code-centric development, and how to maintain architectural discipline when AI makes initial progress deceptively fast.

The central finding is that AI provides genuine acceleration in prototyping and code generation, but only when teams maintain rigorous discipline in requirements clarity, architecture definition, and integration validation. Speed without structure leads to accumulating technical debt. We document the workflow, tool landscape, implementation experience, and lessons learned as a reference for similar projects.

## Informed Consent as a Software Engineering Challenge

This project represents the first attempt in this book to implement an entire workflow following the software engineering best practices outlined in the preceding chapters. We chose informed consent in clinical settings because it combines genuine social impact with technical complexity: natural language processing, multilingual support, regulatory compliance, audit logging, and real-time clinician-patient interaction. The tools and platforms we describe reflect the state of practice in early 2026 and will likely evolve substantially—but the engineering methodology remains stable.

**Figure 17.1.** Informed consent depicted as a structured, trust-building communication process in a clinical setting, showing clinicians and a patient in a consent conversation rather than a mere signature ceremony. The image conveys that the goal is genuine understanding and shared decision-making about risks, benefits, and alternatives, not paperwork. (Image generated with Google Nano Banana.)

Informed consent is fundamentally a communication process, not a form-filling ceremony. Before any medical procedure, especially surgery, a clinician must explain what will happen, why it is necessary, what risks exist, what alternatives are available, and critically, that the patient may refuse or withdraw consent at any time. The goal is to build genuine understanding and support patient autonomy while establishing an ethical and legal foundation for the intervention (Figure 17.1).

In practice, this high-stakes communication is often squeezed into narrow time windows and encumbered by dense, standardized documentation. Clinicians face staffing constraints and administrative overhead. Patients may struggle to understand complex medical terminology, especially if language barriers exist. Current workflows, particularly in German healthcare systems, are heavily paper-based and primarily German-language, which creates a significant barrier for patients with different language backgrounds. This is not merely inconvenient: when comprehension fails, both legal compliance and care quality degrade.

The ConsentLens team—Ananta Das, Michael Ekassov, Walter Sauermann, Dr. Mario Sičaja, and Martin Wolf, five participants in the Digital Business & AI MBA programme at FAU (<https://www.fau.eu/degree-program/digital-business-ai-mba/>)—working in Fall 2025, saw this gap as an ideal test case for vibe coding. Informed consent sits at the intersection of language understanding, regulatory requirements, workflow integration, and human trust—exactly where AI can add measurable value if applied thoughtfully. The motivation was clear: AI could support adaptive, multilingual explanations, verify comprehension through targeted questions, streamline documentation and audit trails, and preserve clinician authority and oversight throughout.

Building on this foundation, the ConsentLens team adopted a systematic software-engineering approach despite the time pressure inherent in a student project. This design choice proved critical: rapid prototyping with AI is possible, but only when underpinned by clear requirements, explicit architecture, and disciplined validation. We trace that journey from problem analysis through toolchain evaluation and final lessons learned.

## Systemic Challenges and AI Opportunities

German healthcare faces structural pressures that ripple through clinical workflows. Staffing shortages, particularly among physicians and nursing staff, create time scarcity. Administrative burden from fragmented health information systems forces clinicians to spend time on documentation rather than patient interaction. Costs rise steadily while staffing capacity stagnates. Under these pressures, informed consent can degrade from a genuine communication into a procedural checkbox.

The result is predictable: consent conversations become time-squeezed, standardized explanations are insufficient for individual patient comprehension levels, language barriers create additional friction, and clinicians carry the cognitive load of juggling multiple patients, families, and documentation requirements. Meanwhile, patients may sign forms without genuine understanding, creating both legal risk and ethical concern.

This scenario is where AI offers genuine leverage. If AI can generate personalized, language-adaptive explanations; check comprehension and clarify misunderstandings; manage documentation and audit trails; and coordinate scheduling and follow-up, then clinician time is freed for what matters most: building trust and making high-stakes decisions collaboratively with patients. The project therefore targeted a dual objective that became its organizing principle: strengthen patient understanding while reducing operational burden for staff. This is not an either-or tradeoff; it is a genuine win-win that, if achieved, improves both care quality and operational efficiency.

## Use-Case Structure of the Consent Conversation

Before designing any system, the team analyzed the actual consent conversation as it should happen. This analysis revealed a logical sequence that, when explicitly modeled, became the blueprint for later user interface (UI) design and application programming interface (API) requirements.

The conversation begins with *introduction and purpose*. The clinician explains why the patient is being offered this specific procedure, what problem it addresses, and what the intended outcome is. This phase builds context and answers the fundamental question: *Why are we doing this?*

Next comes *procedure explanation*. Step by step, the clinician describes what will happen during the intervention: positioning, anesthesia (if relevant), specific examination or treatment steps, duration, immediate aftercare, and what to expect in recovery. Patients need concrete mental models of the experience, not just abstract medical terminology.

Then the team explicitly modeled the *risks and complications discussion*. Rather than overwhelming patients with every rare occurrence, this phase organizes risks by frequency category: common complications (things most patients experience), occasional complications (rare but real), and rare but severe complications. This categorization helps patients calibrate realistic concern without inducing paralysis.

Following this comes *patient questions*. Active solicitation of questions is essential. Many patients are hesitant to interrupt; explicitly inviting clarification signals that the clinician values their understanding.

*Alternatives* are then discussed where applicable. What other interventions or management approaches exist? What would happen if the patient chose to defer or refuse? Comparing options helps patients see this as one choice among several, not a one-way street.

Finally comes *review and confirmation*. Key points are summarized, the patient confirms understanding, and formal consent is documented through signature or digital acknowledgment.

A critical practical constraint shapes this entire workflow: in most German hospitals, informed consent must be completed at least 24 hours before a scheduled surgical procedure. This timeline creates real time pressure. Clinicians cannot always schedule extended conversation sessions immediately before surgery. Documentation must be solid, audit trails must be clear, and the process must be reliably repeatable. This explains why scaling communication support through AI is not optional—it is a practical necessity.

## Current-State Workflow and Documentation Burden

To design an effective replacement, the team first documented the existing state. In typical German hospital practice, consent operates as follows. A clinic obtains pre-written consent forms—often lengthy, standardized templates that cover many procedures. These forms are printed and given to patients along with limited verbal explanation due to time constraints. The patient reviews (or fails to review) pages of small-print medical text. The physician discusses the form, often focusing on signature rather than comprehension. The form is signed, scanned, and filed.

This workflow creates friction at every step. Patients struggle to understand dense medical text. Non-German speakers are essentially locked out unless translation services are available, which is often not the case in routine outpatient settings. Clinicians cannot easily customize explanations for individual comprehension levels or prior knowledge. Follow-up questions are difficult to track. And critically, documentation is static—once signed, there is no easy mechanism to update explanations or verify that understanding was genuine.

> **Geek Box: Draw.io — from sketch to formal diagram**
>
> **Draw.io** (also known as diagrams.net, <https://app.diagrams.net>) is a free, browser-based diagramming tool. Diagrams can be exported as XML, SVG, or PNG and version-controlled alongside code. Draw.io also supports AI-assisted diagramming: configurable large language model (LLM) backends—including OpenAI, Anthropic, and local models—can generate, modify, and explain diagrams from natural-language prompts (<https://www.drawio.com/doc/faq/configure-ai-options>).
>
> **Figure 17.2.** The same actor model shown twice: (a) an iPad sketch of five key actors and their relationships—unstructured brainstorming that needs a vision-language model (VLM) for machine access; and (b) the same model redrawn in Draw.io with formal notation, workflow paths, and a context box showing system boundaries—version-controllable, exportable, and AI-editable. The content is identical; only the tool differs.

## Actors, Responsibilities, and Interaction Flow

Informed consent is not a two-actor process. It is embedded in a larger organizational context. The team identified the key roles and their responsibilities:

- **Patient:** the primary stakeholder. Must receive clear, comprehensible information and confirm genuine understanding. Holds the ultimate decision authority.
- **Treating physician / clinician:** bears legal and ethical responsibility for the consent process. Must ensure the patient has sufficient information for an autonomous decision. May delegate explanation to trained nurses or AI assistants, but ultimate accountability remains with them.
- **Clinical staff:** nurses, physician assistants, and care coordinators who support the process by preparing materials, answering routine questions, documenting outcomes, and escalating complex issues to the physician.
- **Hospital information system:** stores procedure templates, patient records, consent documents, and audit logs. Integration with hospital scheduling ensures consent is completed on time.
- **Case management / scheduling:** coordinates the timing of consent discussions with procedure schedules, manages language-support requests, and ensures proper handoff between clinic and procedure venue.

The team's key insight was that each role has distinct responsibilities and information needs. This meant that a monolithic *consent form* was inadequate; instead, the system needed to support *role-specific views and workflows*. A patient view focuses on comprehension and decision-making. A physician view emphasizes accountability and documentation completeness. A scheduling view tracks timing and compliance.

Understanding these roles proved invaluable. Rather than design by guesswork, the team had a concrete context for later requirements and API specifications. Notably, the team did *not* skip this modeling step despite using AI tools for rapid prototyping. Instead, they treated actor and use-case modeling as enabling infrastructure for clear prompting and focused implementation. The progression from an initial iPad sketch to a formal Draw.io diagram (see the Draw.io Geek Box above) illustrates a lesson learned: in hindsight, using the structured tool directly would have been preferable, since the hand-drawn version had to be recreated anyway. When unstructured input already exists—such as a whiteboard photo or a hand-drawn sketch—a VLM can convert it into a structured format automatically. But for new designs, starting directly in a digital diagramming tool saves the conversion step entirely.

> **Geek Box: Mermaid.js — diagrams as code**
>
> Mermaid (<https://mermaid.js.org>) defines diagrams as text in a lightweight markup language—sequence diagrams, flowcharts, class diagrams, and Gantt charts can be written directly in markdown files and rendered automatically. For AI-assisted development, Mermaid is particularly powerful because LLMs can both generate and interpret its syntax, enabling workflows where the agent produces diagrams from requirements text and updates them as the design evolves.
>
> Mermaid integrates natively with GitHub: any ` ```mermaid ` code block in a markdown file or issue is rendered as a diagram automatically, making it ideal for documenting architecture decisions in README files and pull requests. GitLab, Notion, and many other platforms support the same syntax.
>
> **Figure 17.3.** A ConsentLens sequence diagram rendered from Mermaid markup, showing the chronological interaction between the patient, clinician, hospital system, and case management. The text-based notation makes the diagram both human-readable and AI-editable.

## Sequence Diagrams with AI Assistance

Once actors and their responsibilities were clear, the team moved to dynamic modeling: sequence diagrams. These diagrams show *when* messages are exchanged, *in what order*, and *what triggers transitions* between states. A sequence diagram answers questions like: does the patient confirm understanding before the clinician finalizes consent? What happens if clarification is needed mid-conversation? When does the audit log update? How does the hospital system receive notification that consent is complete?

Draw.io was used for static actor and use-case diagrams (see the Draw.io Geek Box). Mermaid was used for sequence diagrams (see the Mermaid.js Geek Box) because it renders from text notation and integrates naturally into AI prompts. A prompt like

> *"Generate a Mermaid sequence diagram for the consent workflow, including a clarification branch when the patient requests simplified explanation."*

produces a renderable diagram directly, which Mermaid's text format makes trivial for AI to generate, edit, and refine.

The sequence view revealed several critical insights. First, certain steps cannot be parallelized—the patient must receive an explanation before they can meaningfully consent to it. Second, failure branches are common: a patient may request clarification, a clinician may be unavailable, or language support may be needed unexpectedly. These branches have to be explicitly handled in code, not left as implicit assumptions. Third, the integration with hospital scheduling is tighter than it appears: if consent is not finalized by a deadline, the system must notify case management so the procedure can be rescheduled.

This phase is a critical software-engineering bridge that remains important even with AI assistance. By making timing, dependencies, and failure cases explicit, the team reduced ambiguity before any code was written. That discipline directly improved later AI prompt quality: developers could reference concrete diagrams and specific interaction contracts rather than vague feature requests like "make it easy for patients." Clear contracts mean AI can focus on implementation details rather than inventing architecture.

> **Geek Box: Figma — UI design and AI-driven requirements engineering**
>
> Figma (<https://www.figma.com>) is a browser-based collaborative design tool that the ConsentLens team used for visual requirements engineering. Unlike traditional requirements documents, Figma allows all team members to contribute to interface design, information architecture, and workflow visualization in real time. Figma serves a dual purpose for vibe coding projects: it produces the UI mockups that guide implementation, and it functions as a living requirements document where design decisions are visible and traceable.
>
> **Figma Make and AI Feature Spec Generator.** Figma Make (<https://www.figma.com/solutions/ai-feature-spec-generator/>) extends the platform into AI-driven requirements specification. Given a natural-language feature description, it generates structured specification documents with user stories, acceptance criteria, and UI wireframes—turning a one-paragraph feature request into a reviewable spec. For ConsentLens, this capability could transform a description like "multilingual consent explanation with comprehension verification" into a structured specification with screens, data flows, and test criteria.
>
> **Figure 17.4.** A requirements-document view created with Figma, showing a structured layout with sections for functional requirements organized by actor, non-functional requirements, and compliance matrices. Figma's component system and auto-layout features make it straightforward to create consistent, reusable design patterns that AI coding tools can reference when generating frontend code.

## Requirements Engineering and Compliance Scope

A striking outcome from the project was that the team produced a comprehensive requirements document in the first weekend. This was not a minimal list; it included functional requirements (what the system must do), non-functional requirements (performance, usability, security), and critically, regulatory and compliance matrices showing how each requirement traced to legal obligations.

Functional requirements were organized by actor and workflow phase. For patients: the system must explain procedures in simple language, support multiple languages, verify comprehension through targeted questions, allow consent withdrawal at any time, and provide a clear audit trail. For clinicians: the system must present a single-page overview of consent status, allow override and signature, support customization of templates for complex cases, and generate documentation meeting legal standards. For case management: the system must track procedural deadlines, alert on overdue consents, and integrate with hospital scheduling.

Non-functional requirements addressed the reality of clinical deployment. The system must support rapid loading even over slow hospital WiFi. It must function on various devices (mobile phones, tablets, desktops) given that clinics vary widely in IT infrastructure. Availability must be high—downtime cannot delay procedures. Data must be encrypted at rest and in transit. Access control must integrate with hospital identity systems.

Regulatory requirements were grounded in German and European law. Healthcare data is subject to strict privacy regulations (General Data Protection Regulation (GDPR), German Hospital Care Data Regulation (KDV-VO)). Informed consent documentation must be auditable: every modification to a consent record, every clinician interaction, every patient response must be logged with timestamps. There can be no ambiguity about who consented to what, when, and with what understanding.

Compliance matrices explicitly mapped each requirement to its source. For example, "Patient must confirm understanding of risks" traced to (1) ethical obligation (autonomy), (2) German Medizinrecht (medical law requiring informed consent), and (3) EU AI Act governance provisions for high-risk medical AI. By making this traceability visible, the team ensured that no requirement was arbitrary and that cut corners would be visibly non-compliant.

The team completed this work in the first weekend using Figma (see the Figma Geek Box) as a collaborative documentation environment. This choice proved powerful because Figma's design-tool interface made it easy for all team members—not just technical ones—to contribute to, critique, and refine requirements. The visual representation made assumptions explicit: when someone sketched a workflow, gaps and inconsistencies became immediately visible.

This front-loading of requirements is not a luxury; it is a necessity for AI-assisted development. The core methodological finding is this: AI acceleration is maximized when teams establish clarity in objectives and constraints before prompting. Conversely, when requirements are vague, AI agents make arbitrary architectural choices, hallucinate features that sound good but don't integrate properly, and create technical debt.

## Toolchain Exploration and Implementation Experience

With requirements in hand, the team faced a decision that every vibe coding team must make: which tools and AI services maximize productivity while preserving control and flexibility? The answer is not "pick one and commit." Instead, the team deliberately experimented with multiple approaches and measured tradeoffs.

For *research and design support*, the team used Perplexity AI (see the Perplexity AI Geek Box) to explore existing informed-consent solutions, regulations, and technical approaches. From Google's toolbox (see the Google Geek Box), the team explored NotebookLM primarily for its audio synthesis capability—generating spoken summaries that allowed team members to absorb dense regulatory text while multitasking. The team deliberately did not use OpenAI's tools (see the OpenAI Geek Box) for this project—they were already familiar with the OpenAI ecosystem and wanted to explore alternative platforms to broaden their practical experience.

For *code generation*, the team evaluated two contrasting paradigms. No-code platforms like Replit and Lovable (see the Replit/Lovable/n8n Geek Box) promised the most dramatic speedup. Code-centric tools like Cursor, Claude Code, and GitHub Copilot (see the Code-centric AI development tools Geek Box) provided more granular control but required the developer to drive architecture and integration logic.

> **Geek Box: Perplexity AI — grounded search for regulatory research**
>
> Perplexity AI (<https://www.perplexity.ai>) represents a different paradigm from conventional LLMs: AI-powered search that retrieves, synthesizes, and cites real-time web sources rather than generating answers from training data alone. Answers are grounded in retrieved sources with explicit citations, reducing hallucination risk for factual queries—critical when researching regulatory requirements where accuracy is non-negotiable.
>
> **Regulatory research for ConsentLens.** The EU AI Act, entered into force August 1, 2024, classifies medical decision-support systems as "high-risk," triggering requirements for explainability, documentation, human oversight, and performance monitoring [European Union 2024]. An informed-consent system using AI to generate explanations falls squarely into this category. Simultaneously, medical law requires genuine patient autonomy and comprehension. ConsentLens must satisfy both frameworks: support patient understanding while being transparent about where AI assists. Perplexity enabled the team to research this dual regulatory landscape rapidly—retrieving the relevant EU AI Act articles, GDPR provisions, and German medical law with source citations in seconds rather than hours of manual document search. The practical lesson: embed compliance thinking from day one, and use grounded search tools to ensure the regulatory basis is accurate and traceable.

> **Geek Box: Google — Gemini, NotebookLM, and moonshot projects**
>
> Google's AI ecosystem (<https://ai.google>) offers complementary capabilities across the full development stack.
>
> **Gemini** (<https://gemini.google.com>) is Google's multimodal foundation model family, capable of processing text, images, audio, and video in a single context window of up to two million tokens—large enough to ingest entire codebases or medical guideline documents at once. For ConsentLens-style projects, this means a single prompt can reference the full regulatory framework, clinical guidelines, and existing consent templates simultaneously without chunking or retrieval augmentation.
>
> **Google Colab with Gemini** (<https://colab.research.google.com>) is arguably the lowest-barrier programming environment available: nothing more than a browser and a Google account is needed. Gemini's built-in integration lets users describe intent in plain language and have code cells generated, explained, and debugged entirely in the cloud—an ideal starting point for anyone new to AI-assisted development.
>
> **Antigravity** (<https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/>) is Google's agent-first IDE, announced November 2025 alongside Gemini 3. Built as a modified VS Code fork, it deploys autonomous agents that plan tasks, write code, run terminal commands, and test applications in a built-in Chrome browser—all in parallel. It supports multiple LLM backends including Gemini, Claude, and open-source models, and produces verifiable "Artifacts" such as task lists, implementation plans, and browser recordings.
>
> **Google AI Studio (Build Mode)** (<https://aistudio.google.com/vibe-code>) is a browser-based environment that combines the Antigravity agent with Firebase and Cloud Run for one-click deployment. A key strength is how easily Gemini can be embedded into custom applications—a few API calls turn any website or app into an AI-powered product with chatbot agents, content generation, or adaptive user interaction.
>
> **NotebookLM** (<https://notebooklm.google>) transforms uploaded documents into interactive research assistants. Its distinctive feature is podcast-style audio synthesis: upload a set of papers or regulatory documents, and NotebookLM generates a conversational audio summary that team members can listen to while commuting or multitasking—a potential pathway for audio-based consent explanations for patients with reading difficulties.

**Nano Banana** (<https://ai.google.dev/gemini-api/docs/nanobanana>) is Google's AI image generation and editing model, built on Gemini 3 Flash. Launched in August 2025, it became viral for photorealistic "3D figurine" images and attracted over 10 million new users within weeks. It enables multi-image blending, character-consistent storytelling, and targeted transformations from natural-language prompts—useful for generating procedure-specific illustrations for consent materials.

> **Geek Box: OpenAI — GPT, DALL-E, and Codex**
>
> OpenAI's ecosystem (<https://openai.com>) spans the major modalities relevant to vibe coding projects.
>
> **GPT-4o and GPT-5** (<https://platform.openai.com>) provide a conversational AI backbone for generating text adapted to individual reading levels, answering clarification questions in real time, and producing comprehension-verification questions. The multimodal capabilities of GPT-4o allow processing text, images, and audio in a single call, enabling workflows where a user uploads a document and the model generates a simplified explanation with visual annotations. While ConsentLens did not use OpenAI tools—the team deliberately chose alternative platforms to broaden their experience—GPT models remain the most widely deployed foundation for projects of this type.
>
> **DALL-E 3** (<https://openai.com/dall-e-3>) generates images from text descriptions with high fidelity to the prompt. For healthcare projects, this enables procedure-specific illustrations—showing what a knee arthroscopy looks like, how a catheter is positioned, or what recovery involves—without licensing stock photography or commissioning medical illustrators. The images can be generated in consistent visual styles and adapted for different patient populations.
>
> **Codex** (<https://openai.com/index/openai-codex/>), now integrated into ChatGPT and the API, translates natural-language specifications into working code. Codex powers much of the vibe coding workflow described throughout this book: given a requirement like "build a REST endpoint that returns consent status for a patient ID," it generates the implementation, tests, and documentation.

> **Geek Box: Replit, Lovable, and n8n — rapid prototyping and workflow automation**
>
> **Replit** (<https://replit.com>) is a browser-based IDE with built-in hosting, database, and authentication. A developer can describe a feature and have a full-stack prototype running in the cloud within minutes—no local setup, no deployment configuration. ConsentLens used Replit for initial scaffolding: the patient-facing consent form with login, procedure selection, and basic explanation display was functional within hours. The limitation emerged when the team needed custom backend orchestration for LLM API calls and video synthesis.
>
> **Figure 17.5.** A Replit prototype screenshot showing a patient consent interface with a login form, procedure description sections, and a consent button—an early full-stack scaffold running in the browser within hours.
>
> **Lovable** (<https://lovable.dev>, formerly GPT Engineer) generates complete web applications from natural-language descriptions, producing React frontends with Supabase backend integration in minutes. Lovable focuses strongly on a no-code paradigm, aiming to eliminate manual coding entirely for standard application patterns. For ConsentLens, Lovable could generate the patient dashboard, clinician overview, and scheduling views from prose descriptions of each screen's purpose and data requirements.
>
> **n8n** (<https://n8n.io>) is a fair-code licensed, self-hostable workflow automation platform allowing free self-hosting for internal business or personal use, with over 400 pre-built integrations. It connects APIs visually through a node-based editor. For ConsentLens, n8n can orchestrate the multi-service pipeline: patient submits form → LLM generates explanation → translation service localizes → Synthesia creates video → audit log records the interaction. Because n8n is self-hostable, it can run on hospital infrastructure without sending patient data to external services—a critical property for GDPR compliance.

> **Geek Box: Code-centric AI development tools**
>
> **VS Code** (<https://code.visualstudio.com>) is Microsoft's open-source code editor and the foundation on which both Cursor and Google's Antigravity are built. While VS Code itself is not an AI tool, its extension ecosystem makes it the primary integration point for AI coding assistants: GitHub Copilot, Claude Code's Cowork mode, and numerous third-party LLM extensions all run inside VS Code. For teams that do not want to switch editors, VS Code with Copilot or Claude extensions provides AI-assisted development without leaving a familiar environment.
>
> **Cursor** (<https://cursor.com>) is a code editor built on VS Code that integrates LLM assistance directly into the development workflow. The standout feature is *Cursor Cloud Agents*: complete cloud mode hands the codebase off to the agent, which can plan, edit across many files, run tests, and prepare pull requests on Cursor's servers while the local editor stays free. The agents work like angels in the sky, hovering above the repository and finishing background tasks while the developer moves on to the next thing.
>
> **GitHub Copilot** (<https://github.com/features/copilot>) is the most widely adopted AI coding assistant, integrated into VS Code, JetBrains IDEs, and GitHub's web editor. Copilot provides inline code suggestions, chat-based code generation, and pull-request summaries. Its strength lies in the breadth of its training data and tight integration with GitHub's ecosystem—code review, issue tracking, and continuous integration (CI)/CD workflows. For teams already using GitHub, Copilot provides the lowest friction path to AI-assisted development, though it offers less autonomous agency than Claude Code or Cursor's multi-file editing.
>
> **Grok** (<https://x.ai>) is xAI's family of large language models. While xAI offers its own chat interface, Grok's models are predominantly consumed through third-party coding tools: Cursor, VS Code extensions, and GitHub Copilot all support Grok as a selectable backend. Grok-3 with thinking mode demonstrated strong performance in the LLM4MR challenge in Chapter 16, producing near-correct magnetic resonance imaging (MRI) sequences through deliberate chain-of-thought reasoning. The practical implication is that model choice and IDE choice are increasingly decoupled—developers select their preferred editor and their preferred model independently, mixing and matching based on task requirements.
>
> **Claude Code** (<https://claude.ai/code>) is Anthropic's agentic coding tool that operates as a terminal-based agent with full access to the local filesystem, shell, and version control. Unlike IDE-integrated assistants, Claude Code runs autonomously: it reads files, writes code, executes builds and tests, and iterates until the task is complete. This book was itself produced using Claude Code and Codex—the agents managed LaTeX compilation, figure generation, bibliography management, and production checks across all 17 chapters.

For *specialized features*, the team explored multiple services. Synthesia AI (see the Descript/Synthesia Geek Box) was used for video generation—passing text to Synthesia produces a speaking avatar in seconds, useful for explaining procedures in standardized, repeatable fashion. Gamma and Prezi (see the Prezi/GAMMA Geek Box) were tested for automated presentation generation from documents. Open-source AI tools, from media synthesis to local coding agents (see the Open-source AI Geek Box), offer on-premise deployment critical for healthcare data privacy, but were not considered in the project.

> **Geek Box: Descript and Synthesia — AI video production**
>
> **Descript** (<https://www.descript.com>) treats video editing like document editing: upload footage or screen recordings, and the platform generates a transcript that becomes the primary editing interface. Delete a sentence from the transcript, and the corresponding video segment is removed automatically. This paradigm makes video editing accessible to non-specialists who are comfortable editing text but intimidated by timeline-based editors.
>
> Descript's AI features go further: filler-word removal automatically cleans "um" and "uh" from recordings, eye-contact correction adjusts the speaker's gaze to appear as if looking at the camera, and voice cloning enables re-recording corrections by typing new text in the speaker's synthesized voice. For ConsentLens, Descript could post-process clinician-recorded explanation videos, cleaning up delivery and generating multilingual subtitles automatically.
>
> **Synthesia** (<https://www.synthesia.io>) generates videos with realistic AI avatars from text scripts—no camera, studio, or actor required. The platform offers over 200 avatar personas speaking 140+ languages, with lip-synced speech generated from the input text. A single script produces a professional-looking video in minutes.
>
> For ConsentLens, Synthesia could produce multilingual procedure explanation videos where a virtual clinician walks patients through surgery steps, risks, and alternatives in their native language. The combination of text-to-video generation with multilingual LLM translation creates a pipeline where a single procedure description in German produces localized video explanations in Turkish, Arabic, English, and other languages at scale. The ConsentLens team used Synthesia during prototyping but noted that per-video-minute pricing becomes a material cost factor when iterating frequently.

> **Geek Box: Prezi, Prezi AI, and GAMMA — AI-assisted presentations**
>
> **Prezi** (<https://prezi.com>) pioneered non-linear, zoomable presentations that emphasize spatial relationships over slide-by-slide linearity. Instead of advancing through a fixed sequence, presenters navigate a canvas by zooming into topics and panning between related concepts. This format is particularly effective for architectural overviews where the audience needs to see both the big picture and individual components—exactly the kind of system-level communication that ConsentLens required for stakeholder reviews.
>
> **Prezi AI** extends the platform with automated content generation. Given a topic description or a set of bullet points, Prezi AI suggests layouts, generates slide content, and refines visual design from natural-language instructions. A prompt like
>
> > *"Create a presentation about our consent workflow with sections for architecture, regulatory compliance, and prototype results."*
>
> produces a structured starting point that the team can refine rather than build from scratch.
>
> **GAMMA** (<https://gamma.app>) takes a more radical approach: paste a document, report, or set of notes, and GAMMA generates a complete presentation deck with consistent visual design, section structure, and speaker notes. For vibe coding projects, GAMMA compresses the time from project outcome to stakeholder presentation from days to hours. The ConsentLens team used presentation tools for milestone reviews and stakeholder communication throughout the project.

> **Geek Box: Open-source AI — from media synthesis to local coding**
>
> **Whisper** (<https://github.com/openai/whisper>) is OpenAI's open-source speech recognition model [Radford 2023], supporting 99 languages with near-human accuracy. For ConsentLens, Whisper enables transcribing patient questions during consent conversations, generating subtitles for explanation videos, and creating searchable text from audio recordings—all running locally without sending audio data to external services.
>
> **Bark** (<https://github.com/suno-ai/bark>) is an open-source text-to-speech model by Suno [Suno AI 2023] that generates natural-sounding speech in multiple languages, including non-verbal sounds like laughter, hesitation, and breathing. Unlike commercial TTS services, Bark runs entirely on local hardware, enabling audio consent explanations without per-request API costs. For multilingual consent, Bark can generate spoken explanations in Turkish, Arabic, or Vietnamese from text that an LLM translated from the German original.
>
> **SadTalker** (<https://github.com/OpenTalker/SadTalker>) [Zhang 2023] animates a single portrait photo with audio-driven lip sync and head motion, creating basic talking-head videos locally. Given a clinician's photo and a Bark-generated audio file, SadTalker produces a video of the clinician appearing to speak the explanation. While the result lacks the polish of Synthesia's commercial avatars, it runs entirely on-premise—critical for healthcare applications where patient data must not leave the hospital network.
>
> **MusicGen** (<https://github.com/facebookresearch/audiocraft>) [Copet 2023] is Meta's open-source music generation model that produces high-quality audio from text descriptions or melody inputs. For patient-facing applications, MusicGen can generate calming background audio for consent explanation videos, creating a more comfortable viewing experience without licensing commercial music.
>
> **CogVideo** (<https://github.com/THUDM/CogVideo>) [Hong 2023; Yang 2025] is an open-source text-to-video generation model that produces short video clips from text prompts. While not yet at the quality level of commercial services like Sora, open-source video generation is advancing rapidly and offers a path toward fully on-premise video production pipelines for healthcare content where data sovereignty is paramount.
>
> **OpenCode** (<https://opencode.ai>) is an open-source coding agent that lets developers switch model endpoints freely. Local hosting and integration are straightforward with Ollama (<https://ollama.com>), which serves downloaded models behind an OpenAI-compatible endpoint that OpenCode can target. On a MacBook Pro with 64 GB of unified memory, OpenCode can drive a VLM such as Google DeepMind's Gemma 4 (26 billion parameters) on-device while still leaving enough headroom to use the laptop for everyday work. A 26-billion-parameter model is less capable than the trillion-parameter frontier models reached through cloud API services at the time of writing, but it keeps source code and design documents on the device.

As the project progressed, tool choices had to be refined based on concrete constraints. The no-code platforms (Replit and Lovable) excelled at rapid UI prototyping. A developer could sketch a feature description and within minutes have a working interface with authentication, database scaffolding, and basic API endpoints. This was genuinely impressive and validated the vibe coding premise: setup and boilerplate overhead vanished.

However, the constraint became apparent when the team needed to integrate with external AI services. Consider a scenario where a patient reads a procedure explanation and indicates they do not understand the risk discussion. The system should *automatically generate a simplified version* using an LLM API call. Or, if the patient requests video explanation, the system should *call Synthesia's API to generate a custom video*. These integration patterns require close control over the backend—the server-side logic in a client-server architecture that handles request authentication, error handling, and asynchronous workflows. No-code platforms abstract away this server-side layer, which means you cannot easily wire up custom API orchestration.

The result was that Replit and Lovable got the team to a functional prototype very quickly (see the Replit/Lovable/n8n Geek Box), but around the 60% mark, integration complexity began limiting progress. For the remaining 40%, the team gave up on no-code tools entirely and shifted to code-centric environments. A key reason was that no-code platforms tend to make the underlying source code difficult to access and export. When the team wanted to continue building on what they had already created, they found that the no-code artifacts could not be easily transferred to a code-centric workflow. They effectively had to restart parts of the implementation. The lesson is that users must be aware of these limitations before committing to a no-code platform: use it for rapid validation, but plan for the transition to code-centric tools from the start.

An often-overlooked operational reality also emerged: usage-based costs. When prototyping volume is high (the team was iterating multiple times per day, generating new variations of explanations, creating test videos, running simulation tests), API costs accumulate quickly. Synthesia AI, for example, charges per-video-minute generated. For a project that created hundreds of test videos, costs became a material planning factor. The team had to balance perfectionism (more iterations = better results) against budget constraints. This is not a novel problem, but it is more visible in vibe coding workflows where iteration cycles are faster than traditional development.

A deeper observation from the team: the decision between no-code and code-centric tools is not about programmer skill or laziness—it is about *problem scope*. A simple project with clear boundaries (e.g., a form processor) may remain within no-code reach indefinitely. But a project requiring custom orchestration of multiple external services, novel business logic, and tight integration with existing hospital systems will eventually demand explicit code control.

## Project Outcome and Core Takeaways

The ConsentLens team's timeline is worth examining in detail because it provides concrete evidence of vibe coding productivity. Development spanned three weekends in Fall 2025. On each weekend, team members contributed approximately one and a half working days (roughly 12 person-hours total per weekend). With five contributors, that yields about 4.5 *focused team days* of effort for the entire project, from problem analysis to functional prototype.

Within that constraint, the team delivered substantial outcomes. First, a comprehensive problem analysis that included current-state workflow documentation, stakeholder interviews, and regulatory research. Second, explicit use-case models and sequence diagrams showing interaction flows and failure branches. Third, a detailed requirements specification with traceability matrices linking each requirement to legal obligations and design rationale. Fourth, a working prototype that included patient-facing interfaces for procedure explanation and comprehension verification, clinician-facing dashboards for consent status and override capabilities, basic integration with hospital scheduling systems, audit logging and compliance documentation, and multilingual support infrastructure (with initial German and English implementation).

This breadth of outcome in 4.5 days is remarkable when compared to traditional software development. A hospital IT team might spend several months on requirements and architecture alone, then hand off to developers for another 6–12 months of coding. ConsentLens showed that with vibe coding discipline, a core prototype demonstrating all key capabilities could be delivered in a matter of weeks by a small team.

The team's reflection on their process is worth quoting directly. They noted that initial progress in no-code environments was seductively fast—authentication and basic UI scaffolding appeared within hours. But as features grew in sophistication, the no-code constraints became limiting. When they shifted to more explicit code-centric development, progress actually accelerated on complex features (like AI orchestration and video generation) even though the setup felt more heavyweight.

Their critical insight: the value of vibe coding is not just raw speed. It is the ability to maintain architectural discipline while iterating rapidly. Teams that use AI tools to "get something working" without thinking through requirements and architecture will hit a productivity ceiling around 60% completion. Teams that invest upfront in clarity—use cases, requirements, architecture, and explicit API contracts—can use AI to reach 100% more consistently.

The final takeaway is both encouraging and sobering. AI significantly accelerates implementation and lowers entry barriers for software development. A student team can now accomplish in three weekends what would have required months or years in traditional settings. However, this acceleration does not eliminate the underlying engineering disciplines. Requirements quality, explicit architecture, controlled integration, and disciplined validation remain decisive. In fact, they become more important, not less, because the speed of AI generation can mask poor design decisions if you are not paying attention. The same pattern shows up well beyond healthcare: the ConferenceStats Geek Box documents a project where our disciplines were applied to large-scale academic-trend analysis.

> **Geek Box: ConferenceStats — 88,000 AI papers analyzed with an agentic pipeline (2025)**
>
> The workflow-first, method-driven style behind agentic software engineering also scales well beyond healthcare. With *ConferenceStats* we presented an agentic pipeline that scrapes and analyzes roughly 88,000 papers from AAAI, CVPR, ICCV/ECCV, ICML, and NeurIPS between 2015 and 2025 [Maier 2025]. The reported active prompting time across three days was about 47 minutes, replacing an estimated 2,921 hours of manual inspection. The architecture follows the same pattern as the ConsentLens prototype: deterministic scripts are the load-bearing elements, and LLMs are used surgically to fill narrow gaps—here, inferring country affiliations when regex-based rules fail. That LLM pass runs through a locally hosted `qwen3:14b` served via Ollama, which makes the architecture both local and reproducible rather than opaque and purely third party-driven agentic LLMs.
>
> **Figure 17.6.** The five-stage ConferenceStats workflow: Conference Proceedings Collection, First-Page Extraction, Affiliation Linking, Institution Normalization, and Statistics Rendering. Each stage produces an auditable artifact that the next stage consumes, so prompts never replace engineering—they extend it. (Figure from [Maier 2025]; image generated with DALL-E 3.)

## Recent External Signals Relevant to ConsentLens

The regulatory and policy landscape for healthcare AI is evolving rapidly, and recent developments validate the ConsentLens approach and underscore its timeliness.

The European Union's Artificial Intelligence Act, which entered into force on 1 August 2024, establishes a risk-based governance framework explicitly applicable to healthcare systems [European Union 2024]. Medical devices and clinical decision-support systems are classified as high-risk, triggering mandatory requirements for explainability, documented testing, human oversight mechanisms, and post-deployment monitoring. An informed-consent system using AI to generate explanations or verify comprehension falls squarely into this category. The regulation is not opposed to innovation; rather, it requires that innovation in healthcare AI be paired with transparent documentation of how the system works, what its limitations are, and how clinician oversight is preserved.

In the United States, the Food and Drug Administration (FDA) has established a regulatory pathway for AI/machine learning (ML)-enabled medical devices [FDA 2025]. The agency maintains a publicly updated list of approved or cleared AI/ML devices, which demonstrates both regulatory openness to innovation and sustained scrutiny. For informed-consent applications, the FDA pathway would likely require evidence that the system improves patient understanding (validated through comprehension testing) while maintaining or exceeding the safety and documentation standards of existing consent workflows.

Academic work reinforces the direction. A 2025 review in *Artificial Intelligence in Medicine* by Chau, Rahman, and Debnath argues that traditional informed-consent forms do not adequately cover the role, capabilities, and limitations of modern AI systems in healthcare, and identifies the black-box phenomenon, insufficient explanation of algorithms and inherent biases, gaps in healthcare-professional training, and inadequate treatment of data privacy and algorithmic fairness as the central shortcomings of current practice [Chau 2025]. Their recommended strategies—redesigning consent information in plain language with visual aids, personalizing it to individual patient needs, and adding continuous monitoring and feedback mechanisms—map almost directly onto the ConsentLens design intent: adaptive multilingual explanations, transparent documentation of AI involvement, and audit trails that enable ongoing improvement.

However, these regulatory and clinical developments do not imply that every AI consent assistant is production-ready. Rather, they establish the governance framework and evidence base within which responsible innovation must occur. The core message remains: opportunities are substantial, deployment is feasible, but success requires alignment with regulation, evidence-based validation, transparency about AI involvement, and software-quality discipline. A system that is fast to build but fails to document its limitations, undergoes no comprehension validation, or loses audit trails will fail both ethically and legally, regardless of its technical cleverness.

## Conclusion

ConsentLens demonstrates that vibe coding—the disciplined combination of software engineering methodology and AI-assisted development—can deliver substantial outcomes in compressed timescales. A team of five participants, working three weekends, produced not just a working prototype but an entire software project with rigorous requirements, explicit architecture, and regulatory awareness.

The success was not due to AI speed alone. It was due to the team's commitment to classical software-engineering discipline: requirements clarity, use-case modeling, explicit interaction contracts, and disciplined tool selection. AI accelerated the implementation, but the architecture still had to be sound.

For healthcare and other regulated domains, this balance is essential. Regulators and ethics review boards will not approve a system simply because it was built quickly. They will scrutinize how requirements were established, how AI involvement was documented, how human oversight was preserved, and how validation was performed. ConsentLens exemplifies this responsible approach: speed with discipline, not speed at the expense of rigor.

Looking forward, informed consent is one of many high-impact healthcare use cases where vibe coding can improve both care quality and operational efficiency. The methods we demonstrated—use-case modeling, requirements specification, sequence diagramming, and disciplined tool selection—are broadly applicable across healthcare software, e-learning systems, and any domain where communication quality and explainability matter.

We emphasize that the specific tools described in this chapter reflect the state of practice in early 2026. Replit, Lovable, Synthesia, and the other platforms will evolve substantially, and some may not exist in their current form by the time you read this. What persists is the engineering methodology: invest upfront in clarity about the problem, the requirements, and the regulatory context, then leverage whatever AI tools are current to accelerate implementation.

Finally, this project underscores a larger point about the future of software development. AI will not eliminate the need for software engineers; it will distribute engineering capability more widely while raising the bar for those who practice professionally. ConsentLens was the first project in this book that attempted to follow the complete software engineering workflow from the preceding chapters—and the experience confirmed that every method we described was needed.

## Exercises

The following exercises apply the vibe coding methodology from ConsentLens to new project contexts.

**Exercise Problem 1.** Redesign the ConsentLens project using the tools available today.

*Instruction.* The original ConsentLens was built in three weekends during 2024–2025. With current agentic tools, markdown-based software processes, and the methods from this book, plan how you would approach the same project today. Define SMART objectives, create markdown documents for each major component, and specify which AI services you would use for explanation generation, video synthesis, and multilingual support.

*Example task.* Phase 1: Set up a markdown-based process for a patient-facing consent interface with language selection and procedure explanation. Phase 2: Integrate an LLM API to generate adaptive explanations at different reading levels. Phase 3: Define a process for comprehension verification with automated question generation. Phase 4: Create a process for audit logging and GDPR-compliant data handling. Define CI tests for each phase and estimate which parts an agent can handle autonomously versus where clinical expert review is required.

**Exercise Problem 2.** Build a multilingual patient education system for a medical procedure of your choice.

*Instruction.* Select a procedure common in your region. Design a system that generates patient-friendly explanations in at least three languages, includes risk information categorized by frequency, and verifies patient comprehension through interactive questions. Use the vibe coding workflow: requirements first, then architecture, then implementation with AI assistance.

*Example task.* Choose cardiac catheterization. Phase 1: Document the consent conversation phases and map them to system components. Phase 2: Use an LLM to generate explanations at 8th-grade reading level in German, English, and Turkish. Phase 3: Implement comprehension questions that adapt based on patient responses. Phase 4: Add audit logging that traces every interaction to a legal requirement. Write a traceability matrix linking each feature to GDPR, EU AI Act, and German medical law obligations.

**Exercise Problem 3.** Compare no-code and code-centric AI development for a healthcare prototype.

*Instruction.* Implement the same narrow feature—a form where a patient selects a procedure and receives a simplified explanation—using two different approaches: a no-code platform and a code-centric AI workflow. Measure time to first prototype, integration flexibility, and deployment ease.

*Example task.* Build the consent explanation feature once in Replit or Lovable and once using Claude Code with Python, FastAPI for the backend, and a simple HTML/JavaScript frontend. Time both from project creation to working localhost prototype. Document setup time, API integration experience, and blockers encountered. Create a comparison table and recommend which approach suits an initial minimum viable product (MVP) versus a production system with custom backend logic.

**Acknowledgment.** The ConsentLens project was designed and implemented by Ananta Das, Dr. Mario Sičaja, Martin Wolf, Michael Ekassov, and Walter Sauermann. Their commitment to combining software engineering discipline with AI-assisted development produced the results documented in this chapter.

## Bibliography

- [Chau 2025] Chau, M., Rahman, M. G., Debnath, T. *From black box to clarity: Strategies for effective AI informed consent in healthcare.* Artificial Intelligence in Medicine, 167:103169, 2025.
- [Copet 2023] Copet, J. et al. *Simple and Controllable Music Generation (MusicGen).* Advances in Neural Information Processing Systems, 2023.
- [European Union 2024] European Union. *Regulation (EU) 2024/1689 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act).* 2024.
- [FDA 2025] U.S. Food and Drug Administration. *Artificial Intelligence-Enabled Medical Devices.* 2025.
- [Hong 2023] Hong, W., Ding, M., Zheng, W., Liu, X., Tang, J. *CogVideo: Large-scale Pretraining for Text-to-Video Generation via Transformers.* ICLR, 2023.
- [Maier 2025] Maier, A. *I Didn't Read 88,000 Papers. I Built an Agentic Pipeline Instead (ConferenceStats).* Andreas' AI Morning Read (Substack), 2025.
- [Radford 2023] Radford, A. et al. *Robust Speech Recognition via Large-Scale Weak Supervision (Whisper).* ICML, 2023.
- [Suno AI 2023] Suno AI. *Bark: Text-Prompted Generative Audio Model.* 2023.
- [Yang 2025] Yang, Z. et al. *CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer.* ICLR, 2025.
- [Zhang 2023] Zhang, W. et al. *SadTalker: Learning Realistic 3D Motion Coefficients for Stylized Audio-Driven Single Image Talking Face Animation.* IEEE/CVF CVPR, 2023.

## Source

This chapter is derived from the *Vibe Coding* book (Maier et al., Springer, CC BY, <https://link.springer.com/book/9783032399069>), chapter source `vhb_vibe_coding/VIBE_17_Examples_02/chapter.tex`. It is part of the VHB course *Vibe Coding*: <https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901>
