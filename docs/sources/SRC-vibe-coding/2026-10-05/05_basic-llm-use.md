---
course: vibe-coding
title: Basic Large Language Model Use for Technical Writing, Slides, and Verification
chapter: 5
source: vhb_vibe_coding/VIBE_05_BASIC LLM USE/chapter.tex
course_url: https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901
book: "Vibe Coding (Maier et al., Springer, CC BY)"
book_url: https://link.springer.com/book/9783032399069
license: CC BY
---

# Chapter 5 — Basic Large Language Model Use for Technical Writing, Slides, and Verification

**Andreas Maier, Adarsh Panambur, and Siyuan Mei**
Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)

## Abstract

This chapter turns general discussion about large language models (LLMs) into concrete day-to-day practice. It focuses on technical writing, document preparation, slide generation, mathematical verification, vector graphics, and vision-based extraction workflows. A case study starts from a noisy automatic transcript of an old matrix-calculus lecture and shows how that material can be reshaped into textbook prose, Beamer slides, equations, plots, and editable figures. Along the way, the chapter explains why LaTeX is such a strong partner for LLM workflows, why arithmetic should be delegated to executable code instead of polite guessing, and why vision-capable systems are both powerful and security-sensitive. The goal is not to glorify prompt writing as magic. The goal is to show how basic LLM use already becomes highly productive once the task, the format, and the verification steps are made explicit.

## From Prompting to Productive Work

Chapter 1 already introduced the rise of prompt engineering as an early working style for LLMs, and Chapter 3 explained why transformer-based language models can follow long textual instructions in the first place. This chapter picks up from there, but it stays close to the keyboard. The path is simple: before one dreams about autonomous software agents, it is worth mastering the basic interaction patterns that already save time every day. Those patterns include rewriting rough notes, formalizing math, reshaping prose into slides, checking computations with code, and turning verbal descriptions into reusable figures.

That sounds less glamorous than fully autonomous software generation, but it is where a great deal of practical value appears first. Meeting notes need structure. Draft reports need cleanup. Slides need a coherent storyline. Equations need consistent notation. An LLM is unusually helpful in exactly this region between blank page and polished artifact.

**Figure 5.1.** A stylized opening image for the chapter. On the left, the picture shows the kinds of sources people actually have: books, a lecturer working at a board, hand-drawn explanations, plots, and unstructured material. On the right, these inputs collapse into a bright, structured output stream of charts and diagrams. The image is stylized, but the workflow is real: messy human material is not discarded, but transformed into cleaner technical artifacts, provided the human states clearly what the destination should look like.

## What a Good Prompt Actually Specifies

A prompt is not merely a question. In technical work, it is closer to a compact specification. It tells the model what role to take, what source material to use, which output format to produce, what conventions to respect, and which mistakes are unacceptable. White et al. describe such prompt patterns as reusable structures rather than one-off tricks, which is a helpful way to think about them in software-engineering settings [White 2023]. Zamfirescu-Pereira et al. show the other side of the story: prompting is a skill, and people who approach it casually often fail in systematic ways [Zamfirescu-Pereira 2023]. The lesson is not that prompting is mystical. The lesson is that unclear instructions produce unclear results.

In practice, a useful prompt usually answers five questions. First, what is the source? A raw transcript, a table image, a half-finished draft, or an existing LaTeX chapter? Second, what is the task? Summarize, rewrite, convert, formalize, verify, or explain? Third, what output form is required? A textbook section, Beamer frames, TikZ code, Python code, or a short bullet list? Fourth, which conventions matter? Notation, tone, formatting, length, citation style, and whether matrices should stay bold instead of quietly turning into ordinary letters. Fifth, how should the result be checked? This last point is what separates productive use from wishful thinking.

One does not start with the fantasy prompt, "Please generate perfect slides from this messy transcript," and then walk away. The workflow is staged. First, one asks for a coherent explanatory draft. Then one fixes notation. Then one inserts equations. Then one converts the prose into slides. Then one checks the calculations. Then one adjusts figures. The intermediate outputs matter because they reduce ambiguity. They also give the user something concrete to inspect and correct.

This staged workflow was particularly important for earlier models with smaller context windows. The old lecture transcript used in this chapter could not simply be pasted as one monolithic block. It had to be processed in chunks, often only a few minutes at a time. That detail is historically important. It explains why prompt quality was not just a matter of eloquence. It was a matter of decomposition. Each prompt can be considered as a meaningful step towards a goal. As we will see later in this book, understanding this process will also help us to build better and higher degree of automation using software processes.

> **Geek Box: How to read just enough LaTeX to stay in control**
>
> LaTeX is a *typesetting language*: it takes plain-text source with markup commands and produces formatted output such as PDF pages. Typesetting means arranging text, symbols, and figures on a page according to precise rules—historically done by hand with metal type, now handled by software. The idea is similar to HTML, where tags like `<h1>` or `<p>` describe structure rather than appearance. In LaTeX, one writes a section heading with `\section{...}` instead of `<h1>...</h1>`, and a style file decides how headings, margins, and fonts actually look. Both approaches separate content from layout, which is exactly why machines—and LLMs—can process them so well [Lamport 1994].
>
> The basic ideas are compact. A backslash starts a command, braces provide arguments, math mode typesets symbols as mathematics, and environments (`\begin{...}` / `\end{...}`) mark larger blocks. A few examples:
>
> | Command | Meaning |
> |---|---|
> | `\chapter{...}`, `\section{...}` | chapter or section heading |
> | `\section*{...}` | unnumbered section heading |
> | `\label{...}` | cross-reference anchor |
> | `\begin{center}` … `\end{center}` | centers a content block |
> | `\textbf{...}`, `\mathbf{A}` | bold text / bold math $\mathbf{A}$ |
> | `\Sigma` | Greek letter $\Sigma$ |
> | `\gls{...}`, `\glspl{...}` | glossary term (singular / plural) |
> | `\newcommand`, `\definecolor` | define custom command / color |
> | `\pause` | next overlay step in Beamer |
>
> With just these explanations, it becomes fairly easy to read real LaTeX source. In the original chapter, a screenshot shows the opening lines of this very chapter in a LaTeX editor with syntax highlighting—most of the commands are already listed in the table above.

## Why LaTeX and Beamer Work So Well with Large Language Models

LaTeX is not merely a fancy way to print equations. It is a document preparation system in which content and layout are kept separate. One writes sections, figures, references, and equations as structured source. A style file then decides how this structure should look on the page. That separation is exactly what makes LaTeX such a strong partner for LLMs. The model can operate on meaningful text-level structure instead of reverse-engineering visual formatting from a finished page (cf. the LaTeX Geek Box above).

This matters immediately in technical writing. References are handled systematically. Equations are first-class objects instead of decorative screenshots. Figures can be placed, resized, and cited consistently. A chapter can be restyled without rewriting its content. Once a document exists as LaTeX source, the same content can be moved between styles with much less pain than in a purely visual editor. That is one reason the workflow fits software engineering so well. The material becomes versionable, diffable, and reusable.

The Beamer package extends the same idea to presentations. A slide deck is then not a sequence of manually placed boxes, but a structured source file with frames, bullet hierarchies, overlays, and figures. For LLMs, this is a gift. The model can be asked to convert a stable chapter into short slide frames, preserve notation, keep one message per slide, and add incremental reveals where useful. Once the chapter text is stable, slide generation becomes a structured transformation problem rather than a blank-canvas drawing exercise.

Another reason LaTeX works well here is that it lowers the cost of revision. If a matrix symbol should be bold everywhere, the model can be told that once and then keep the convention. If a Lagrange multiplier term was omitted, one can reprompt for that exact correction. If a caption should become more formal, the change is localized. The document is expressed in source code form, and the model can therefore edit it at the same level where the structure lives.

For getting started quickly, browser-based environments such as Overleaf are useful because they remove installation friction and make collaboration easy [Overleaf 2026]. Nonetheless, local installation of the open source package can still be useful: if a free hosted setup hits compilation limits on a large document, nothing prevents one from downloading the source and continuing locally. In other words, the convenient entry point and the reproducible long-term workflow are not enemies. They are stages on the path from simple document editing to a LaTeX software project like a whole book.

## Case Study: From a Ten-Year-Old Lecture Recording to New Slides

The running example of this chapter is a very concrete one. The source material we used was an old matrix-calculus lecture recording, roughly one and a half hours long, recorded more than ten years earlier [Maier 2016]. The lecture was not delivered from finished slides. Much of it happened on the blackboard. That is important, because it means the source was imperfect in two different ways at once. First, the transcript produced by automatic speech recognition was noisy. Second, some of the most useful visual content existed only because the speaker described what was being drawn.

This is where the workflow becomes interesting. The transcript was taken directly from an automatic speech-recognition system rather than from a manually cleaned script. The input therefore contained filler words, spoken detours, missing punctuation, and occasional recognition errors. It was not elegant prose. It was the kind of transcript that sounds confident only until one reads it aloud. Yet it was still enough. The first prompting stage asked the model to reorganize chunks of this transcript into textbook-style explanation. The result was not accepted blindly, but it already converted rough spoken material into much clearer prose.

A second prompting stage imposed notation conventions. Matrices had to stay bold. Vectors had to follow lab conventions. Mathematical expressions had to appear in proper LaTeX form. A third stage asked for missing equations or better structure where needed. Only after a stable chapter-like version existed did the workflow switch into presentation mode and ask for Beamer frames with short bullets, frequent slide breaks, and presentation pacing constraints such as the familiar 7x7 rule.

One side effect of working with LaTeX and Beamer is that restyling an entire slide deck becomes surprisingly easy. The matrix-calculus example deck, for instance, was given black backgrounds and green lettering in deliberate homage to the 1999 film *The Matrix*—a stylistic choice that would be tedious to apply slide by slide in a visual editor but amounts to a few color definitions in LaTeX (see the Geek Box below).

> **Geek Box: When teaching enters the Matrix**
>
> When your lecture topic is literally called *matrix* calculus, the temptation to reference the iconic 1999 science-fiction film *The Matrix* is hard to resist—and in this case nobody tried, well until now. The green-on-black slide design, the movie reference in the title, and the overall staging were used deliberately to make a linear-algebra topic feel memorable rather than dutiful. Good teaching often depends on giving students something they can recall years later when the formulas have become foggy and the mood has not.
>
> In this case, the commitment was not only typographic. The lecture video leaned into the aesthetic with a shaved head, dark glasses, and a title card that treated matrix calculus as if it had briefly wandered into science fiction. Pedagogy occasionally asks for more than a proof. Here it also asked for a razor.
>
> The original chapter shows a thumbnail from the author's YouTube recording [Maier 2026b]. The corresponding Beamer sources are available in the public GitHub repository of the final slide deck [Maier 2026a].

This case study also clarifies what "basic use" really means. No autonomous agent designed the course from scratch. The human decided the target structure, enforced notation, corrected mistakes, and steered the transformation through multiple iterative prompts. The LLM accelerated the heavy lifting in between. That is basic use in the most practical sense: not minimal capability, but disciplined interaction using prompts like building blocks.

## When the Model Should Stop Guessing and Start Computing

A common problem of LLMs concerns arithmetic. A model can write very plausible mathematics while still getting the numbers wrong. That is especially dangerous because the textual explanation often remains smooth even when the actual computation has drifted off the road. The pseudo-inverse used in the lecture is a perfect example. The derivation looked reasonable. The numeric result did not.

> **Geek Box: Why the pseudo-inverse example is such a good verification test**
>
> Suppose we want a straight line that approximates measured points $(x_i,y_i)$. A convenient linear model is
> $$y \approx b_0 x + b_1.$$
> Written in matrix form, this becomes $\mathbf{y} \approx \mathbf{M}\,\mathbf{b}$, where we stack the measurements into the matrix $\mathbf{M}$ and the target vector $\mathbf{y}$:
> $$\mathbf{M} = \begin{bmatrix} x_1 & 1 \\ x_2 & 1 \\ \vdots & \vdots \\ x_n & 1 \end{bmatrix} \quad\text{and}\quad \mathbf{y} = \begin{bmatrix} y_1 \\ y_2 \\ \vdots \\ y_n \end{bmatrix}.$$
> The coefficient vector $\mathbf{b} = [b_0\; b_1]^\top$ can then be estimated by
> $$\mathbf{b} = \mathbf{M}^{+}\,\mathbf{y},$$
> where $\mathbf{M}^{+}$ is the Moore-Penrose pseudo-inverse. The pseudo-inverse is needed because $\mathbf{M}$ is usually not a square matrix and therefore has no ordinary inverse. Conceptually, it returns the least-squares solution: the line whose total squared error is smallest.
>
> An LLM can of course attempt to guess or reason its way to the numeric solution on a token-by-token basis, but its arithmetic is fundamentally approximate. A computer implementation in, say, Python will deliver the correct result deterministically. That makes executable code the natural verification tool: to identify numerical hallucination, run the problem in code to check whether the LLM output is actually right.

The practical remedy is straightforward: do not keep arguing with the model in plain text when the task is executable. Give it code. Most systems can write short Python snippets, run them in sandboxed environments, and then feed the computed results back into the explanation. The resulting workflow is much more reliable because the model still handles the narrative, while the arithmetic is delegated to a deterministic tool (see the executable-verification Geek Box below).

TikZ is the figure analogue of LaTeX itself: instead of drawing in a visual editor, one writes source code that describes geometry. For LLMs, this is extremely convenient—if a user can describe the geometry in words, the model can draft TikZ code, and corrections are sentences rather than mouse operations. A worked example is shown in the TikZ Geek Box below.

> **Geek Box: TikZ: when figures become source code**
>
> The following TikZ source code draws a unit circle with two highlighted directions:
>
> ```latex
>   \begin{tikzpicture}[scale=1.25]
>       \draw[thick,->] (-1.2,0) -- (1.2,0) node[right] {$x$};
>       \draw[thick,->] (0,-1.2) -- (0,1.2) node[above] {$y$};
>       \draw[black] (0,0) circle (1cm);
>       \draw[thick, red, ->] (0,0) -- (1,0)
>            node[anchor=north west] {$\lambda_1$};
>       \draw[thick, red, ->] (0,0) -- (0,1)
>            node[anchor=south east] {$\lambda_2$};
>   \end{tikzpicture}
> ```
>
> Even without prior TikZ experience, the structure is readable: `draw` draws a line or shape, `->` adds an arrowhead, `node` places a label, and `circle (1cm)` produces a unit circle. Small changes in scale, color, label position, or axis length are easy to request in text, and the result remains vector-based and therefore crisp at any resolution.
>
> The rendered result is a minimal source-based geometric figure: coordinate axes ($x$ horizontal, $y$ vertical), a unit circle centered at the origin, and two highlighted directions labeled $\lambda_1$ (pointing right) and $\lambda_2$ (pointing up). It is redrawn from the slide source in the matrix-slides repository [Maier 2026a]. The image contains nothing more than axes, a circle, and two highlighted directions, which is exactly why it is a good example for iterative prompt-based editing.

A complete worked example showing this code-based verification workflow—from the Python snippet through the resulting regression plot—is given in the executable-verification Geek Box below. This is the general pattern of safe LLM use in technical work: let the model draft the explanation, but let code settle the argument.

> **Geek Box: Executable verification: from Python snippet to regression plot**
>
> The following Python snippet imports NumPy, builds the small matrix $\mathbf{M}$ and vector $\mathbf{y}$ from the points $(1,2)$, $(2,4)$, $(3,6)$, $(4,7)$, and $(5,9)$, computes the pseudo-inverse, and obtains the regression coefficients with one line of linear-algebra code:
>
> ```python
>   import numpy as np
>   M = np.array([[1,1],[2,1],[3,1],[4,1],[5,1]])
>   y = np.array([2,4,6,7,9])
>   M_plus = np.linalg.pinv(M)
>   b = M_plus @ y
>   b
> ```
>
> This is not a glamorous algorithmic breakthrough. That is precisely why it matters. It is the kind of routine technical step that should be handed to a computer instead of entrusted to a language model's confidence.
>
> The accompanying figure is a source-based regression plot: it displays the five sample points $(1,2)$, $(2,4)$, $(3,6)$, $(4,7)$, $(5,9)$ and the fitted line computed from the pseudo-inverse solution, with a numeric table of the points shown to the right. The numeric table reminds us that the figure is not decorative—it comes from explicit data. The five points are plotted together with the fitted line as a slide-ready visualization in its print-adapted form.

> **Geek Box: Why a matrix turns circles into ellipses**
>
> A linear map $\mathbf{A}$ transforms a unit circle into an ellipse. Conceptually the figure has three parts: on the left the unit circle with two highlighted directions $\lambda_1$ and $\lambda_2$, in the center the matrix $\mathbf{A}$ acts (shown as an arrow labeled $\mathbf{A}\cdot$), and on the right the resulting rotated ellipse appears in transformed coordinates $x', y'$.
>
> The geometric heart of this is the singular value decomposition, which exists for any matrix $\mathbf{A}$:
> $$\mathbf{A} = \mathbf{U}\,\boldsymbol{\Sigma}\,\mathbf{V}^{\top}.$$
> The three factors have distinct geometric roles. The matrix $\mathbf{V}^{\top}$ rotates or reflects the input coordinate system. The diagonal matrix $\boldsymbol{\Sigma}$ then scales the axes by the singular values, which is where the circle stretches into an ellipse. Finally, $\mathbf{U}$ rotates the result into its final orientation. Strictly speaking, when $\mathbf{A}$ acts on a vector, the factors are applied from right to left: first $\mathbf{V}^{\top}$, then $\boldsymbol{\Sigma}$, then $\mathbf{U}$. For teaching, however, it is often helpful to discuss the three effects individually.
>
> A companion three-panel figure does exactly that. The left panel ("Apply $\mathbf{U}$") shows a circle whose axes have been rotated. The middle panel ("Apply $\boldsymbol{\Sigma}$") shows axis scaling that creates an ellipse. The right panel ("Apply $\mathbf{V}^{\top}$") shows the final rotated ellipse.
>
> Both figures are redrawn from the slide source in the matrix-slides repository [Maier 2026a]. They also show why TikZ and LLMs work so well together: the images are conceptually structured, so the instructions that generate them can also be conceptually structured. The full story behind the SVD and its geometric interpretation is told in the original lecture recording [Maier 2016] and the reworked slide deck [Maier 2026b].

The deeper linear-algebra story behind the circle-to-ellipse transformation, including the singular value decomposition and its geometric interpretation, is developed in the Geek Box above. Surprisingly, these figures could be recovered from verbal blackboard description alone, then refined by slight re-prompting until the geometry looked right.

Iterative figure editing through prompts is often faster than drawing vector graphics by hand, especially once a figure needs several small adjustments. "Move the subfigure 0.5 cm to the left" or "shift the label up by 1 mm" is exactly the kind of change that source-based graphics handle gracefully and manual TikZ editing does not.

## Vision, OCR, and Hidden Instructions

Vision-capable systems extend the workflow further because they can read images as well as text. We have already seen hints of this capability earlier: the DVD database example in Chapter 1 used a shelf photograph as input for vision-based text extraction, and Chapter 3 demonstrated that modern vision-language models can parse fine-grained detail in photographs, including reading the text on a T-shirt. Optical character recognition (OCR) generalizes this: it turns a photograph or screenshot into machine-readable text by detecting characters and reconstructing their sequence [Smith 2007]. In practical terms, that means a scanned table, a figure embedded in a PDF, or a slide screenshot can become editable source again. Take a picture of a table, paste it into the model, and ask for a LaTeX version. For technical work, that is a major convenience because it collapses a tedious retyping task into a review task.

If a model can read an image and produce structured text, it can also read a figure and produce TikZ-like code that approximates it. For example, the code-health chart in the Tornhill geek box in Chapter 1 was created by feeding slide 11 of the original presentation to GPT-5.4 and asking it to reproduce the figure in TikZ. Once the figure exists as editable source, labels can be translated, dimensions can be changed, and the image can be reused in a much more flexible way. This is one of those cases where the combination of two basic capabilities - OCR and source-code generation - becomes more useful than either one in isolation.

OCR systems often boost contrast internally. As a result, text that looks almost invisible to a human may still be perfectly visible to the machine. That creates a pathway for indirect prompt injection, where hidden instructions inside an external document try to influence the model's behavior. Yi et al. study exactly this attack class and show that language-model systems are broadly vulnerable when they cannot clearly distinguish trusted instructions from untrusted external content [Yi 2025]. A vivid example comes from academic peer review. In scientific publishing, submitted manuscripts are evaluated by anonymous reviewers who are expected to read the paper carefully and judge its quality. In practice, reviewers are busy researchers themselves, and some resort to LLMs to help draft their reviews. Authors have started exploiting this by embedding hidden instructions in their papers—white text on a white background, or text in microscopic font sizes—that tell the model to praise the work and recommend acceptance. A human reviewer who reads attentively would never be influenced by invisible text, but a vision-capable LLM that processes the PDF may obediently follow the injected instruction. The result is a fake-positive review that undermines the integrity of the entire peer-review process.

This is where Chapter 4's black-box and gray-box distinction becomes practically important. A safe workflow does not treat OCR output as trusted instruction. It treats OCR output as untrusted content that still has to pass through explicit checks, trust boundaries, and human review. Newer systems have become better at recognizing prompt-injection patterns, but this is not a reason to relax. It is a reason to design the surrounding workflow properly.

## Presentation Pacing, Beamer Overlays, and Tool Choice

Once the text, equations, and figures are in place, a final layer of productivity comes from presentation pacing. Beamer overlays such as `\pause` let a presenter reveal content incrementally instead of dumping an entire slide on the audience at once. This is not cosmetic. It changes cognitive load. A derivation can be shown step by step. A figure can be built in stages. A bullet list can follow the spoken explanation rather than racing ahead of it.

**Figure 5.2.** A source-based diagram showing matrix-vector multiplication as a weighted sum of columns. On the right, the coefficients $x_1, x_2, x_3, \ldots, x_n$ are stacked as the vector $\mathbf{x}$; on the left, the matrix $\mathbf{A}$ is written out as its columns $[\mathbf{a}_1\ \mathbf{a}_2\ \mathbf{a}_3\ \cdots\ \mathbf{a}_n]$. Curved arrows connect each coefficient $x_j$ to its corresponding column $\mathbf{a}_j$, and the compact result $\sum_{j=1}^{n} x_j \mathbf{a}_j$ appears as the summary of all weighted contributions. The figure is also a good candidate for staged Beamer overlays because the arrows and summation terms can be revealed one after another.

Figure 5.2 is a good example. It visualizes matrix-vector multiplication by connecting the coefficients $x_1, x_2, x_3, \ldots, x_n$ on the right with the corresponding columns $a_1, a_2, a_3, \ldots, a_n$ on the left. The final expression $\sum_{j=1}^{n} x_j a_j$ then appears as the compact summary of all these weighted contributions. In a live presentation, this figure becomes much clearer if the arrows and terms are introduced gradually.

Direct end-to-end PowerPoint generation with standard models is more unreliable, especially once images and detailed layouts were involved. A reasonable compromise is to let the model generate the textual backbone and perhaps draft visual assets, then assemble and polish the final deck in the native slide tool. However, with more advanced models this is likely to improve soon.

Agentic execution modes like computer use improve that situation somewhat. When the model can manipulate files through external tools, tasks such as translating an existing PowerPoint while keeping the layout intact become more realistic. This preserves the structure, replaces the text, and avoids destroying the formatting. The broader lesson is that tool choice needs to follow the task. If the work is mathematically dense, notation-heavy, and revision-intensive, LaTeX plus Beamer remains an unusually strong combination. If the work lives inside established corporate PowerPoint templates, a mixed workflow may be the better engineering decision.

## Conclusion

Basic LLM use is not the dull preface to more exciting systems. It is where a large share of dependable value first appears. Clear prompting, iterative refinement, notation control, executable verification, source-based figure generation, and security-aware vision use form building blocks for a coherent working style. The chapter's running example shows that even a noisy transcript from an old lecture can become a polished slide deck if the transformation is broken into explicit steps.

Roughly 230 slides were produced in about three hours with this workflow, and that was already some time ago. The exact number is less important than the underlying point. The speedup did not come from skipping engineering discipline. It came from moving the repetitive drafting work to the model while keeping structure, notation, and verification under human control. If the model writes a smooth paragraph, that is helpful. If the model writes a smooth paragraph and the numbers underneath were checked by code, a workflow arises.

## Exercises

The following exercises practice the core workflows of this chapter: turning rough material into structured text, verifying computations with code, building figures from source, and handling vision input safely.

**Exercise Problem 1:** Turn a short raw transcript into structured technical prose, then turn that prose into slide frames. Start with ten minutes of spoken material, produce a textbook-style explanation, and only after that convert it into Beamer slides. Example task: use a short recording on a mathematical or technical topic and create a two-page chapter section plus a six-slide deck.

**Exercise Problem 2:** Compare two prompt styles for the same task: one vague and one structured. Record which information was missing in the weak prompt and how the stronger prompt fixed the result. Example task: ask an LLM once to "make slides from this transcript" and once with explicit context, output format, notation rules, and review constraints.

**Exercise Problem 3:** Reproduce the regression example with executable verification. Define the matrix $\mathbf{M}$, compute the pseudo-inverse, derive the regression coefficients, and plot the fitted line. Example task: use five measured points, ask the model to solve the fit once in plain text and once through Python execution, then compare the two outputs.

**Exercise Problem 4:** Design a review workflow for OCR and vision input that treats extracted text as untrusted. Include trust boundaries, manual checks, and fallback rules for suspicious documents. Example task: define how a team should handle scanned student submissions or image-based reports when hidden prompt text must not influence any automated recommendation.

## Bibliography

- [Lamport 1994] Lamport, L. *LaTeX: A Document Preparation System — User's Guide and Reference Manual.* 2nd ed. Addison-Wesley Professional, 1994.
- [Maier 2016] Maier, A. *Refresher Course SVD.* YouTube lecture recording, 2016. <https://www.youtube.com/watch?v=oDeXE2iliiY>
- [Maier 2026a] Maier, A. *matrix_slides.* GitHub repository, 2026. <https://github.com/akmaier/matrix_slides>
- [Maier 2026b] Maier, A. *Enter the Matrix.* YouTube video, 2026. <https://youtu.be/BLVtanj3JuM>
- [Overleaf 2026] Overleaf. *Overleaf Documentation.* 2026. <https://www.overleaf.com/learn>
- [Smith 2007] Smith, R. *An Overview of the Tesseract OCR Engine.* Ninth International Conference on Document Analysis and Recognition (ICDAR 2007), vol. 2, pp. 629–633, 2007.
- [White 2023] White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., Schmidt, D. C. *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT.* Proceedings of the 30th Conference on Pattern Languages of Programs, pp. 1–31, 2023.
- [Yi 2025] Yi, J., Xie, Y., Zhu, B., Kiciman, E., Sun, G., Xie, X., Wu, F. *Benchmarking and Defending Against Indirect Prompt Injection Attacks on Large Language Models.* Proceedings of the 31st ACM SIGKDD Conference on Knowledge Discovery and Data Mining, pp. 1809–1820, 2025.
- [Zamfirescu-Pereira 2023] Zamfirescu-Pereira, J. D., Wong, R. Y., Hartmann, B., Yang, Q. *Why Johnny Can't Prompt: How Non-AI Experts Try (and Fail) to Design LLM Prompts.* Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems, pp. 1–21, 2023.

## Source

This chapter is derived from the *Vibe Coding* book (Maier et al., Springer, CC BY, <https://link.springer.com/book/9783032399069>), chapter source `vhb_vibe_coding/VIBE_05_BASIC LLM USE/chapter.tex`. It is part of the VHB course *Vibe Coding*: <https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901>
