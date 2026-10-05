---
course: vibe-coding
title: A Gentle Introduction to Machine Learning and Large Language Models
chapter: 3
source: vhb_vibe_coding/vibe_03/chapter.tex
course_url: https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901
book: "Vibe Coding (Maier et al., Springer, CC BY)"
book_url: https://link.springer.com/book/9783032399069
license: CC BY
---

# Chapter 3 — A Gentle Introduction to Machine Learning and Large Language Models

**Andreas Maier, Sally Zeitler, Aline Sindel, Adarsh Bhandary Panambur, Siyuan Mei, and Vincent Christlein**
Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)

## Abstract

This chapter introduces the deep-learning foundations that matter most for modern vibe coding with large language models. It moves from historical motivation to practical applications, including speech and image recognition, deep reinforcement learning, neural image captioning, and medical-imaging use cases from interventional X-ray guidance. We then discuss the perceptron, the XOR limitation, universal approximation, the role of depth, and why architecture choices, prior knowledge, and data scale determine practical performance. The chapter closes with a compact development history of generative pre-trained transformer (GPT) models, a discussion of openness versus productization, and concrete exercise problems that connect machine-learning concepts to software-engineering practice.

## Why Deep Learning Matters in a Vibe-Coding Textbook

This textbook's treatment of vibe coding is primarily about software engineering with artificial intelligence (AI) support, but it is difficult to reason about strengths and limits of AI coding tools without understanding the technology family that powers them. For this reason, this chapter introduces deep learning as a compact conceptual bridge. The goal is not to replace a dedicated machine-learning curriculum, but to give enough structure that design decisions in AI-assisted programming are technically grounded instead of purely tool-driven.

A practical point is that the deep-learning wave did not emerge suddenly with chat interfaces. The visible ChatGPT moment (released on November 30, 2022) came much later than the first decisive performance jumps in perception tasks. In industry, substantial adoption became obvious when recommendation systems matured, smartphone vision improved, speech interfaces became usable in daily workflows, and autonomous-driving research gained industrial scale. In other words, deep learning was already changing deployed systems before it became a mainstream conversation topic. This industrialization can be seen across companies discussed in the chapter context: Apple and Samsung rely on deep models for on-device vision and speech features, Google, Microsoft, and IBM deploy deep learning across cloud AI products and enterprise tooling, and automotive players such as Daimler have invested heavily in learning-based driver-assistance and autonomy research. These organizations continue to invest in deep-learning infrastructure and routinely recruit machine-learning engineers for research and production roles.

Even modern copiers and scanners illustrate how machine-learning methods have entered traditional office infrastructure. Their pipelines use learned compression and data-driven pattern analysis to optimize quality and file size, which makes them part of the broader machine-learning deployment landscape. This is useful in practice, but it also shows why verification matters whenever these systems process safety-critical or legally binding documents. The Xerox failure case in the Geek Box below shows why a general understanding of these methods is required to prevent such failures in practice. This need for engineering understanding is exactly why this chapter is included in the textbook.

> **Geek Box: Risk case in deployed machine-learning document systems (Xerox WorkCentre)**
>
> This issue was publicly discovered on July 24, 2013. First vendor patches were released on August 22, 2013, and for legally compliant archival use in Germany, lossy JBIG2 usage was later disallowed in 2015 guidance [Kriesel 2013; Kriesel 2014]. The case was presented at the Chaos Communication Congress (CCC), and David Kriesel's blog post, together with his CCC talk, documents the full story, including concerning vendor reactions. The key point is that this is not an optical character recognition (OCR) error (OCR can be disabled); rather, it is a direct pixel-level substitution problem, in which image patches are replaced in a subtle way so that scans can appear correct at first glance even when numbers are wrong.
>
> A concrete example from the published cases is that `65,40` was changed to `85,40`. The cause is symbol matching in the scan pipeline: image segments that the pattern-matching engine classifies as "identical" are stored once and then reused across the page. Building and reusing this symbol dictionary requires extraction and classification/grouping of visual symbols. If this grouping is wrong, one symbol can be replaced by another (for example, `6` by `8`) even when the original character was readable.
>
> It is also important that JBIG2 is an image format standard, not itself a single compression algorithm implementation. In practice, scanners can encode JBIG2 in lossless and lossy modes. The known failure pattern is consistent with a buggy parameterization where lossy substitution behavior was introduced where no information loss should have occurred, likely by omitting or mishandling correction information during symbol reuse. The legal implication is severe: for affected scans, reused patches cannot prove what was on the original paper at those locations, so evidentiary reliability is fundamentally undermined even if no obvious error is visible.
>
> **Figure 3.1.** A side-by-side Xerox scan example (reprinted from David Kriesel's analysis with permission) showing an original snippet next to a reconstructed snippet. In the highlighted center row, the value changes from `65,40` to `85,40`, illustrating how a wrongly grouped symbol silently substitutes one digit for another during compression.

The Netflix Prize is an important example of how benchmark breakthroughs can trigger broad industrial adoption. The challenge started in October 2006 and was solved in September 2009, so breaking the target took roughly three years. Netflix offered a grand prize of \$1,000,000 for a 10% improvement over Cinematch, with additional annual progress prizes of \$50,000, and the winning result emerged from a hybrid ensemble rather than a single method [Wired 2009; Wikipedia 2026]. Put simply, the winning solution family combined deep-learning components (notably Restricted Boltzmann Machine style predictors) with latent-factor models and explicit blending and heuristic weighting rules across many models. This was a turning point because large-scale personalized recommendation moved from being treated as nearly intractable at production quality to an engineering problem with a workable playbook, mirroring the pattern seen in other chapter examples.

One of the strongest historical examples is automatic speech recognition. For years, error rates improved slowly, then dropped sharply as deep models replaced earlier pipelines. Public references report that modern large-scale automatic speech recognition (ASR) models are trained on millions of hours of speech data [Pratap 2024], and Cloud Chirp reports about 98% English recognition accuracy in its published product communication [Google Cloud 2023]. Put simply, 98% means that out of 100 recognized words, about two are wrong on average. Since one million hours corresponds to about $114$ years of continuous listening by a single person (or about $342$ years at 8 hours per day), this scale is far beyond manual data curation workflows. As a pre-deep-learning reference point, the figure below includes a 2012 non-deep-learning Gaussian mixture model (GMM)–hidden Markov model (HMM) value (18.8 word error rate (WER) on English Broadcast News) [Hinton 2012]. It also uses representative dictation-style read-speech milestones on LibriSpeech (test-clean/test-other) [Panayotov 2015; Gulati 2020; Baevski 2020]. This is important for vibe coding because many coding assistants now internally combine language modeling, retrieval, planning, and execution loops that follow the same scaling logic.

**Figure 3.2.** A grouped bar chart of representative dictation-style read-speech recognition milestones, showing word error rate [%] declining sharply through the deep-learning era. A single 2012 non-deep-learning GMM–HMM reference bar sits at 18.8 (English Broadcast News). LibriSpeech test-clean milestones fall from 5.5 (2015 baseline) to 2.1 (2020 Conformer) to 1.8 (2020/21 wav2vec 2.0 era), while the harder test-other milestones fall from 14.0 to 4.3 to 3.3 over the same period. Method references are attached directly to the method labels [Hinton 2012; Panayotov 2015; Gulati 2020; Baevski 2020].

The same period also transformed visual recognition benchmarks through the ImageNet Large Scale Visual Recognition Challenge (ILSVRC). ImageNet provided on the order of $14$ million labeled images over $1000$ object classes and established a standardized yearly competition. Around 2011, top-5 error rates were still close to $25\%$, then dropped sharply after AlexNet and subsequent deeper models. The figure below shows this change quantitatively: top-5 error falls from $25.8\%$ (2011) to about $6.7\%$–$6.8\%$ (2014), a reduction by roughly a factor of four, while model depth grows from shallow systems to networks with around 19–22 layers. The commonly shown $5.1\%$ human reference was estimated by Andrej Karpathy on a subset rather than the full benchmark [Karpathy 2014]. This matters because human annotators make slips and fatigue-related mistakes, and because some scraped web images are inherently ambiguous (for example, containing multiple salient objects), so a single-label assignment is sometimes not uniquely correct. For these reasons, the challenge was considered effectively solved and was discontinued around 2016 as remaining errors became increasingly tied to dataset ambiguity and label noise.

**Figure 3.3.** A bar chart of ImageNet top-5 error paired with a line for network depth (ILSVRC era). Top-5 error drops across 2011 (SVM, 25.8%, shallow), 2012 (AlexNet, 16.4%, 8 layers), 2013 (Zeiler, 11.7%, 8 layers), 2014 (VGG-19, 6.8%, 19 layers), and 2014 (GoogleNet, 6.7%, 22 layers), approaching the $5.1\%$ human reference estimated on a subset by Karpathy. The flattening against this level reflects both model progress and an ambiguity floor from noisy single-label annotations on web-scraped images.

## From Perception to Complex Behavior

**Figure 3.4.** A diagram of deep reinforcement learning: an agent observes raw game frames, selects actions, and learns from reward signals, connecting representation learning to sequential decision making. The illustration spans the range from Atari pixel control [Mnih 2015] to strategic game domains such as Go [Silver 2016].

After benchmark breakthroughs, deep learning expanded into domains that felt less like static classification and more like sequential decision making and generation. Deep reinforcement learning became a milestone in this shift, as illustrated in the figure above. A widely discussed result from this period was Atari performance, where deep reinforcement learning agents learned directly from pixels and achieved strong results across multiple titles, including a train/test setup described as training on one set of Atari games and evaluating transfer behavior on another set [Mnih 2015]. For historical contrast, top-level chess had already been broken in the Deep Blue era (1996/1997 against Garry Kasparov) mainly via massive search and hand-engineered evaluation rather than modern machine learning. The same trajectory then continued to harder domains with much larger branching factors: chess is often estimated around $30$–$40$ legal moves per position on average, while Go is around $200$–$300$ (roughly one order of magnitude larger per ply). This branching gap compounds exponentially with search depth: the game-tree scale is often summarized around $10^{120}$ for chess versus around $10^{360}$ for Go, i.e., about $240$ orders of magnitude larger. By comparison, Moore's-law-style hardware progress from roughly 1996 to 2016 corresponds to only about $3$–$4$ orders of magnitude in raw transistor/compute scaling (around $10^3$ to $10^4$), which is negligible against a $10^{240}$ game-tree gap. AlphaGo's win over Lee Sedol in 2016 (match score 4–1) therefore marked a public turning point because naive brute-force scaling is far less effective in Go [Silver 2016].

**Figure 3.5.** A neural style transfer example in which Van Gogh's *Starry Night* style is transferred onto a Stanford campus content image: the scene content is preserved while the rendering style changes. The source image and implementation are from the referenced GitHub/Zenodo archive [Egan 2018], and the method follows Gatys et al. [Gatys 2015].

Image analysis and generation also demonstrated dramatic progress. Early neural style transfer provided a first practical form of controllable image synthesis: the content of a real scene could be preserved while the rendering style was changed. In the figure above, Van Gogh's Starry Night style is transferred to a Stanford campus image.

As the field progressed, image understanding and language generation were explicitly coupled. CNN-RNN captioning systems combined a convolutional visual encoder with a recurrent decoder that predicts words step by step, producing full sentence-level descriptions from raw images (see the figure below) [Vinyals 2015]. This made multimodal output structurally richer than simple class labels and established a direct interface from visual features to natural-language reasoning.

**Figure 3.6.** An architecture sketch of image captioning: a convolutional visual encoder feeds a recurrent language decoder that predicts words step-by-step to form a full sentence description of the image. This connected visual recognition with language generation and gave a direct path from visual features to natural-language output [Vinyals 2015].

**Figure 3.7.** A visual-analysis output with region-level understanding, produced with an OpenAI GPT-4 Vision module. The model segments and interprets image content at region level and reads fine-grained embedded text, including a slogan printed on a T-shirt.

Newer vision-language systems then improved scene parsing depth and detail resolution. In the figure above, the model output is region-aware and can read fine-grained embedded text, including the text on the T-shirt. This matters because the textual scene description is not only an output for interpretation, but also a reusable intermediate representation for downstream generation.

**Figure 3.8.** An image-generation pipeline that turns an analysis-derived text prompt back into synthesized images in multiple styles, including photo-realistic, manga, and Greek-statue renderings. The prompt text is derived from the visual analysis of Figure 3.7 and generated in a DALL-E 2 style workflow; this 2024 OpenAI model still showed occasional spelling errors in generated imagery.

Figure 3.8 shows image generation using a DALL-E 2 style workflow to render photo-realistic, manga, and Greek-statue variants from the same analysis-derived prompt. The analysis-derived textual description comes from Figure 3.7 and is then reused across these multiple stylistic renderers, so the semantic content is preserved while visual form changes. The example also reflects an important limitation observed in older image generation models: the 2024 OpenAI model still produced occasional spelling errors in generated imagery. Conceptually, this can be viewed as an extreme form of lossy compression and re-synthesis, which links back to the compression discussion in the Xerox Geek Box above.

The rapid progression of the field is absolutely remarkable and may feel like magic to a layman. To actually understand where this magic happens, we investigate the underlying concepts and basic theory in the next section.

## Basic Theory: Perceptron, XOR, and Universal Approximation

The perceptron is historically foundational and mathematically simple. It computes an affine score and applies a threshold, which yields a linear decision boundary in feature space. That simplicity is both its strength and its core limitation. As soon as the target structure is not linearly separable, a single perceptron cannot represent the task, as summarized in the Geek Box below.

> **Geek Box: Formal definition of a perceptron**
>
> Let $\tilde{\mathbf{x}}\in\mathbf{R}^{d}$ be the original network input, $\tilde{\mathbf{w}}\in\mathbf{R}^{d}$, and bias $b\in\mathbf{R}$. In Rosenblatt-style notation, a binary perceptron is written with a sign activation as
>
> $$\hat{y}(\tilde{\mathbf{x}}) = \mathrm{sign}(\tilde{\mathbf{w}}^{\top}\tilde{\mathbf{x}} + b), \quad \mathrm{sign}(t)= \begin{cases} +1 & \mathrm{if}\ t \ge 0,\\ -1 & \mathrm{if}\ t < 0. \end{cases}$$
>
> Define an extended input and weight vector as
>
> $$\mathbf{x}=\begin{bmatrix}\tilde{\mathbf{x}}\\1\end{bmatrix}\in\mathbf{R}^{d+1}, \quad \mathbf{w}=\begin{bmatrix}\tilde{\mathbf{w}}\\b\end{bmatrix}\in\mathbf{R}^{d+1}.$$
>
> Then
>
> $$\mathbf{w}^{\top}\mathbf{x}= \begin{bmatrix}\tilde{\mathbf{w}}\\b\end{bmatrix}^{\top} \begin{bmatrix}\tilde{\mathbf{x}}\\1\end{bmatrix} =\tilde{\mathbf{w}}^{\top}\tilde{\mathbf{x}}+b,$$
>
> so the bias is absorbed into the augmented dot product and the model can be written as
>
> $$\hat{y}(\mathbf{x})=\mathrm{sign}(\mathbf{w}^{\top}\mathbf{x}).$$
>
> The decision boundary is the hyperplane $\mathbf{w}^{\top}\mathbf{x}=0$ (equivalently $\tilde{\mathbf{w}}^{\top}\tilde{\mathbf{x}}+b=0$).
>
> This equation also links directly to the biological intuition: inputs are interpreted as incoming synaptic signals, weights model synaptic strengths (excitatory/inhibitory influence), and the threshold-like sign decision models whether a neuron-like unit "fires" in one class state or the other. The biology link is present, but it is only a weak analogy and not a mechanistic model of real neurons.
>
> **Figure 3.9.** A diagram of a perceptron: it receives weighted inputs, computes a weighted sum, and applies a sign threshold to produce a binary output [Maier 2019].

The XOR example in the figure below is the canonical counterexample. Two classes arranged in alternating corners cannot be separated by a single line. This example is not historical trivia: if a model class cannot express the target structure, optimization effort cannot fix representation mismatch.

Adding hidden units and nonlinear activations resolves this expressivity bottleneck. The multi-layer network figure further below shows this transition from linear to nonlinear composition, and the universal approximation Geek Box summarizes the approximation idea. The universal approximation theorem formalizes that sufficiently wide networks can approximate continuous target functions on compact domains. However, the theorem does not guarantee that the most compact or trainable representation is shallow. In practice, depth often reduces representational inefficiency and can map compositional structure more effectively.

**Figure 3.10.** A two-dimensional XOR classification: four point clouds sit at the corners of a unit square. Class 0 (dark blue circles) sits at $(0,0)$ and $(1,1)$; class 1 (dark orange triangles) sits at $(0,1)$ and $(1,0)$. Two example straight lines $L_1$ and $L_2$ are drawn; each splits one cluster of each class onto the same side and thus fails to separate the classes. No straight line can separate the two classes, demonstrating the representational limit of a single-layer linear classifier. The color and shape coding keeps the distinction visible in grayscale.

**Figure 3.11.** A feedforward neural network with an input layer, hidden layers, and an output layer, illustrating how multi-layer networks enable nonlinear function composition beyond the perceptron's linear limit.

A decision tree is a classifier that makes a sequence of simple yes/no tests and routes each input along a path until a leaf assigns the final class. Since neural networks are universal function approximators, a mapping from such tree logic to a neural-network representation should exist. The analysis in the tree-to-network Geek Box below, consistent with Entropy Nets [Sethi 1990], shows that two hidden layers can represent the tree exactly with roughly the same number of neurons as tree nodes, but reorganized as layered computations. By contrast, forcing the same mapping into a single hidden layer can require substantially more neurons, potentially becoming very large for complex trees.

> **Geek Box: Universal approximation theorem**
>
> Let $\tilde{\mathbf{x}}\in\mathbf{R}^{n}$ be the original input and $\mathbf{x}=\begin{bmatrix}\tilde{\mathbf{x}}\\1\end{bmatrix}\in\mathbf{R}^{n+1}$ the augmented input, consistent with the perceptron notation above. Let $\sigma:\mathbf{R}\rightarrow\mathbf{R}$ be continuous, differentiable, and monotonically increasing (e.g., the sigmoid function). For every compact set $K\subset\mathbf{R}^{n}$, every continuous function $f\in C(K)$, and every $\varepsilon>0$, there exists a one-hidden-layer network
>
> $$g(\mathbf{x})=\sum_{i=1}^{m}\alpha_i\,\sigma(\mathbf{w}_i^{\top}\mathbf{x}), \quad \mathbf{w}_i=\begin{bmatrix}\tilde{\mathbf{w}}_i\\b_i\end{bmatrix}\in\mathbf{R}^{n+1}$$
>
> such that $\sup_{\tilde{\mathbf{x}}\in K}|f(\tilde{\mathbf{x}})-g(\mathbf{x})|<\varepsilon$.
>
> What this means in practice: for any desired approximation quality $\varepsilon$, a neural network can be built that matches the target continuous function on the bounded domain $K$ up to that tolerance. The key theoretical point: one hidden layer is already sufficient for this approximation guarantee, provided it is wide enough. Equivalently, as width grows ($m\to\infty$), the best achievable uniform approximation error can be driven arbitrarily low ($\varepsilon\to 0$).
>
> This result guarantees representational capability, not efficient training, good conditioning, or small model size. In real systems, deeper architectures are still preferred because they often represent structured functions more compactly and can be easier to optimize with modern training pipelines.
>
> **Figure 3.12.** A mathematical slide visualizing how a neural network approximates a target continuous function, illustrating the universal approximation guarantee for a sufficiently wide one-hidden-layer network.

> **Geek Box: Formal definition of tree-to-neural-network mapping**
>
> A binary decision tree classifier with internal tests $h_j(\mathbf{x})=\mathbf{1}[x_{k_j}\le \tau_j]$ assigns each input $\mathbf{x}$ to exactly one leaf $\ell(\mathbf{x})$ through recursive test outcomes. Each leaf stores a class label $c_{\ell}\in\{1,\dots,C\}$, and prediction is
>
> $$T(\mathbf{x}) = c_{\ell(\mathbf{x})}.$$
>
> Equivalently, with leaf indicators $I_{\ell}(\mathbf{x})\in\{0,1\}$ and $\sum_{\ell} I_{\ell}(\mathbf{x})=1$, one can write
>
> $$T(\mathbf{x}) = \sum_{\ell} c_{\ell} I_{\ell}(\mathbf{x}).$$
>
> For image segmentation-style intuition with two pixel coordinates, each pixel location $\mathbf{x}=(x_1,x_2)$ is routed from the root through successive tests until exactly one leaf is reached. The resulting leaf index determines the assigned class value for that pixel.
>
> **Figure 3.13.** A five-step sequence (over two rows) showing progressive partitioning in a tree-style classifier: each step adds another threshold test that subdivides the two-dimensional input space, until distinct regions are assigned to distinct classes.
>
> The same tree can be mapped to a neural-network view by converting each inner decision node into a hidden neuron $h_j$ that models one threshold test. If all such decisions are assembled in only one layer, an exact reconstruction of complex partition structure is generally not obtained. Introducing a second layer that represents the leaf/class decisions $c_{\ell}$ resolves this and yields an exact two-layer construction for this partition logic. Background and a detailed conversion procedure are described in [Sethi 1990].
>
> **Figure 3.14.** An overview diagram summarizing the mapping from tree partitions to layered neural-network decisions: inner decision nodes become first-layer neurons that model threshold tests, and a second layer represents the leaf/class decisions.

The takeaway: depth is not a magic spell but a representational strategy. Additional layers can reduce the number of units required for certain functions, improve factorization of intermediate patterns, and simplify optimization landscapes in many real tasks. The phrase "the deeper, the better?" is best read as a hypothesis that depends on architecture, data regime, and objective, not as an absolute rule.

The practical effect of this end-to-end learning is that many manually engineered intermediate stages are replaced by jointly optimized representations. The Geek Box below contrasts the two workflows and highlights where handcrafted feature design moved to architecture and training choices.

> **Geek Box: Classical pipelines and end-to-end learning**
>
> Before deep learning became dominant, pattern-recognition systems were typically engineered as explicit pipelines: sensor acquisition, preprocessing, handcrafted feature extraction, and a final classifier. This decomposition is still useful today because it makes clear where assumptions enter the system. Classical pipelines follow this explicit separation, while the so-called *end-to-end learning* shows how deep learning compresses these stages into learned representations without the need for handcrafted feature design.
>
> **Figure 3.15.** A classical pattern-recognition pipeline running from raw input through preprocessing and handcrafted feature engineering to a final classifier. Each stage is designed and tuned by a human expert, and the output of one stage is passed as input to the next. This separation makes each step interpretable and debuggable, but it also means that overall performance is bounded by the quality of the handcrafted features.
>
> **Figure 3.16.** A deep-learning pipeline with end-to-end optimization. Feature extraction and classification are no longer separate stages but are learned jointly from data, driven by a single loss function. This removes the bottleneck of handcrafted features and often yields higher accuracy, but it shifts the design effort toward architecture choices, training data, and objective functions — and it makes the internal representations harder to inspect.

From this perspective, the key question is not whether one approach "wins" universally. The question of "How to handcraft the best features?" transformed into "How to handcraft the best networks?". In classical systems, prior knowledge appears as handcrafted transforms and explicit models. In deep systems, prior knowledge appears in architecture choices, augmentation strategies, objective functions, and training curriculum. All of them bear many choices of handcrafting based on experience from evidence-based experimentation. In particular, the architectural choices are now often referred to as hybrid learning or other names such as physics-informed or known operators [Maier 2022].

## How the Actual Learning Works

If a system knows nothing yet, it still needs a place to begin, so the first step is an educated first guess. Thus, training starts with random initialization. These initial settings are usually not good ones, but they are a place to start from. In fact, a certain degree of randomness is useful for learning. If every part of the model were initialized with the same number, all parts would behave in exactly the same way and the process of learning would become more difficult.

The next step in the training process is the forward pass. The model is giving its first answer to the current examples. The input moves through the network layer by layer, with each stage transforming the information a little further. The final output is a prediction. Early on, those predictions are often poor, but that is not a problem. Even a poor first answer is valuable because it gives the training process something concrete to improve on.

**Figure 3.17.** A flow diagram of neural-network training showing the iterative loop: a forward pass produces a prediction, a loss function scores it against the target, backpropagation traces the error back through the network, and gradient-based updates adjust the weights before the next batch. The inset illustration was generated with DALL-E 3.

Once a prediction exists, the model needs feedback. This is the role of the loss function. It acts like a scorecard that compares the prediction with the desired answer and summarizes how far off the model currently is. A high loss means the model made a large mistake. A lower loss means it is moving closer to the target. In this way, the loss turns vague success or failure into a signal that training can actually use.

That signal is then carried back through the network by *backpropagation*. Conceptually, this step traces responsibility for the final error through all earlier processing stages. It estimates which internal settings contributed to the mistake and how they should be adjusted. In more intuitive terms, backpropagation answers a very practical question: which knobs should be turned, and in which direction, so that the next answer is a little better than the last one.

The final step is the parameter update. An optimizer such as stochastic gradient descent or Adam applies many small corrections rather than one large jump. After that, the cycle begins again with the next batch of examples. Over many repetitions, rough guesses can gradually become useful predictions. The figure above gives an overview of this iterative learning loop.

## Why Deep Learning Works and Where It Fails

Deep learning became practical when three factors aligned. The first factor is compute: modern graphics processing units (GPUs) make large matrix operations fast enough to train high-capacity models in reasonable time. The second factor is data: large and diverse datasets expose many task variations, which reduces overfitting to narrow patterns. The third factor is architecture and optimization design: choices such as convolutions, residual connections, normalization, activation functions, and stable optimizers determine whether useful representations can actually be learned.

On compute, recent datacenter-GPU progress studies report roughly 1.4-year doubling times for core GPU throughput, while the long-run CPU-era Moore baseline is about a 2.0-year doubling rate [Del Sozzo 2026; Moore 1965]. On data, the ImageNet challenge made large-scale visual learning measurable at community level. The classification track standardized around 1,000 categories and about 1.2 million training images, making representation learning and fair benchmark comparison possible at unprecedented scale [Russakovsky 2015]. At ecosystem level, global digital data creation continues to grow rapidly. International Data Corporation (IDC) projected growth from 16 ZB in 2016 to 163 ZB in 2025 [IDC 2018]. This is often summarized informally as near-yearly doubling in fast-growth domains, even though the global aggregate grows somewhat slower. Recent web measurements also indicate that AI contributes to this expansion, however, the increase in productivity is yet difficult to quantify. Yet, Cloudflare reported that AI and search crawler traffic grew by 18% from May 2024 to May 2025, with GPTBot requests up by 305% in the same period [Cloudflare 2025], which is a clear number for increased AI use.

Activation-function choice directly affects gradient flow, which in turn determines whether deeper models train reliably or stall. Earlier sigmoidal activations often pushed units into saturated regions where gradients become very small, so learning could get stuck. Modern activations such as the rectified linear unit (ReLU) and its variants keep a linear regime with larger usable gradients over a wide input range, which made deep optimization substantially more stable in practice. Optimizer design was equally important. Adaptive methods such as Adam combine momentum with per-parameter learning-rate adaptation, which typically speeds up convergence and reduces sensitivity to poor initial scaling [Kingma 2015].

**Figure 3.18.** A two-part figure on network building blocks. The top part compares activation functions, showing the nonlinear elements that improved trainability in deep networks. The bottom part shows how architectures shifted from early fully connected layers to convolutional layers combined with pooling layers, which became predominant. Activation design strongly influences both optimization stability and representational power.

Furthermore, new architectures such as convolutional neural networks (CNNs) brought further progress. They apply learned local filters across the image, combine these responses across channels, and then progressively aggregate spatial context through nonlinearities and pooling. This architecture was formalized early for object recognition by LeCun et al. [LeCun 1999]. Conceptually, it is close to classical scale-space heuristics that cascade Gaussian smoothing and derivative-like operators before later decision stages. It also has a biological connection because local receptive fields and hierarchical aggregation resemble key aspects of retinal and early visual processing. The figure above summarizes these practical details.

Yet, so far no single best network or model was found. The no-free-lunch perspective explains why model quality is always task-dependent. If nothing is assumed about data structure, no method dominates on average. Deep models perform well in practice because real data is structured, and architectures encode assumptions that match this structure. The figure below makes this explicit: bias-variance trade-offs still apply, so gains come from better inductive bias and better data coverage, not from model size alone [Maier 2022].

**Figure 3.19.** A bias-variance illustration indicating that reducing both bias and variance simultaneously requires integrating suitable prior knowledge. The trade-off and inductive bias remain central despite deep-model progress. The image is reprinted under the CC BY 4.0 license [Maier 2022].

For software engineering, this has a concrete implication. High training or benchmark performance does not guarantee robust deployment behavior. Overfitting appears when evaluation is too narrow, and the same pattern appears in vibe coding when generated code passes local tests but breaks under integration constraints, unusual inputs, or production load.

## Medical-Imaging Applications as a Concrete Domain Example

Medical imaging provides a useful stress test because errors have immediate clinical consequences. In coronary interventions, physicians navigate tools under fluoroscopy, where motion, noise, dose limits, and projection overlap make visual interpretation difficult. A classical idea in this setting is digital subtraction angiography, often abbreviated as DSA. In simple terms, two X-ray images are acquired: one before injecting contrast agent and one after the blood vessels have been filled with contrast. If both images are subtracted, most of the anatomical background disappears and the contrast-filled vessels remain visible. This works well only if the patient and the organs do not move between the two images. In cardiac applications, this assumption is often violated because the heart beats and the chest moves with breathing. The figure below shows a virtual single-frame subtraction pipeline that addresses this problem by estimating the background from a single acquisition. The method first segments vessel-like structures, then estimates the background in Fourier space, and finally constructs a virtual mask image that enables subtraction without requiring a separate pre-contrast frame [Unberath 2016].

**Figure 3.20.** A clinical image-processing example of virtual single-frame subtraction imaging for interventional vessel analysis. The pipeline combines vessel segmentation, Fourier-domain background estimation, and virtual mask creation so that a subtraction image can be formed from a single frame, enabling vessel analysis and enhancement in X-ray-guided intervention [Unberath 2016; Unberath 2017].

A second example is stent and flow-diverter visualization during endovascular aortic repair. A stent is a small metal mesh that is inserted into a vessel to hold it open when disease has narrowed it too much. A flow diverter can be used in a related but slightly different situation. If a vessel wall has bulged outward or become structurally deformed, blood may circulate too slowly in that enlarged region and clots may form there. Such clots can later lead to severe events such as stroke or heart attack. The purpose of the flow diverter is to redirect the blood stream so that much less flow enters the deformed pouch. Over time, the disturbed region clots, the clot fills the abnormal space, and the vessel wall can resorb this material so that the vessel returns toward a more stable anatomy. In this setting, preoperative three-dimensional vessel information is fused with intraoperative X-ray images to guide the intervention, but that fusion can drift when the patient moves or when inserted devices deform the anatomy. The figure below shows why automatic stent segmentation becomes valuable here: the implanted stent is visible even without additional contrast agent, yet it is difficult to detect because only thin wire structures appear in fluoroscopy. Breininger et al. therefore used a fully convolutional residual network to segment aortic stent grafts directly from single uncontrasted X-ray images and reported high accuracy, with Dice scores above 0.93 in the X-ray-only setting [Breininger 2018]. This kind of segmentation makes it possible to compare intraoperative fluoroscopy with the preoperative plan and, in follow-up work, even support one-click deformation correction for image fusion during endovascular aortic repair [Breininger 2020]. In this context, AI acts as a decision-support layer rather than a replacement for clinical expertise.

**Figure 3.21.** An interventional X-ray example with algorithmic enhancement for stent localization and procedural guidance. A learning-based segmentation of thin stent wires in uncontrasted fluoroscopy improves the visibility of intervention-relevant structures during endovascular aortic repair and can be used to verify and correct the alignment between intraoperative X-ray images and preoperative vessel models [Breininger 2018].

This clinical perspective also clarifies a general engineering principle. Metrics are necessary for model development, but the objective is operational impact in real workflows. In medical settings, this means faster and safer interventions. In software settings, it means fewer failures, clearer decisions, and more reliable systems.

## Large Language Models: Scaling, Openness, and Productization

Large language models extend the same pattern observed in speech and vision: increasing model capacity, training data, and compute can unlock qualitatively new behavior. Richard Sutton, an influential AI researcher, summarized this trend in a blog post called "the bitter lesson". Methods that scale with computation often outperform systems that rely heavily on handcrafted rules. Therefore, research should primarily focus on general methods rather than solving specific tasks [Sutton 2019].

Unfortunately, AI's development was never that straightforward and paved with ups and downs. Neural networks gained attention in the 1960s, lost momentum after early representational limits were exposed, rose again in the 1980s, and then slowed when compute budgets could not support the model ambitions of that time. This explains AI winters as engineering mismatches between what models required and what infrastructure could deliver. At the time of the writing of this book, we are again in a phase in which AI thrives.

However, scaling itself has limits. Even with large data centers, cost, energy use, and high-quality data availability constrain brute-force growth. This is one reason current systems increasingly combine general AI foundation models with retrieval, external tools, and domain procedures. These hybrid designs improve reliability by decomposing tasks instead of forcing one monolithic model to do everything. The lack of compute availability drives us again into the combination of specialized and general models. And given the trend of the extreme data growth [IDC 2018], such hybrids will probably also dominate the near to midterm future [Maier 2022].

**Figure 3.22.** An early GPT architecture slide showing how token embeddings, positional information, and a stack of self-attention transformer blocks combine into a concrete autoregressive language-model pipeline, trained on books and large text corpora [Radford 2018; Vaswani 2017]. The original report is still specific enough in architecture and training setup that a technically informed reader could plausibly re-implement a close approximation of the system.

Transformer models are the key to such powerful AI models. Early GPT publications disclosed relatively concrete setup details, including a first-generation training regime described in the transcript as roughly 7,000 books and about one billion words as shown in the figure above. The architectural core was the transformer idea of attention [Vaswani 2017]. Attention can be understood as a learned form of selective reading. When the model predicts the next word, it does not compress the entire previous sentence into one fixed summary and hope that nothing important gets lost. Instead, it can look back at all earlier words and decide which ones matter most for the current decision. If a sentence contains a pronoun such as "it", or a phrase that depends on something said many words earlier, attention gives the model a mechanism to reconnect those pieces.

In GPT, this becomes self-attention because the words in the current text look at other words from the same text. Each token builds a context-dependent representation by weighting earlier tokens according to their current relevance. One attention pattern may focus on nearby grammatical structure, another may connect a verb with its subject, and another may follow topic words across a longer passage. A single block already allows such interactions. Stacking many transformer blocks in succession makes the system more expressive. Lower blocks can capture short-range regularities such as punctuation, word endings, or common phrases. Higher blocks can combine these simpler cues into broader patterns such as entity references, discourse structure, and increasingly abstract semantic relations. This repeated application of self-attention is one reason even early GPT models could learn far more than local word statistics [Radford 2018; Vaswani 2017].

Later generations shifted to much larger web-scale corpora and larger parameter counts. GPT-2 scaled this significantly, and GPT-3 scaled it further by a large margin [Radford 2018; Radford 2019; Brown 2020]. In parallel, reporting became less implementation-specific as commercial pressure increased. After the ChatGPT release on November 30, 2022, usability increased dramatically, while architectural transparency decreased [Ouyang 2022].

As shown in the figure below, GPT-2 still reported core scaling quantities quite explicitly. The technical report describes model variants from 117 million up to 1.5 billion parameters and introduces the WebText corpus with about 8 million documents and roughly 40 GB of text [Radford 2019]. This is important because the figure does not only advertise better results. It directly connects parameter growth to measured zero-shot performance across multiple tasks. One can therefore still inspect how extra model capacity translated into broader capability, even though the full training dataset was not released publicly.

**Figure 3.23.** A GPT-2 summary slide showing increased parameters, larger data scale, and broader benchmark performance. It marks a major scale increase and broadened practical capability by linking concrete engineering quantities to outcomes: model sizes up to 1.5 billion parameters, training on WebText with about 8 million documents and roughly 40 GB of text, and the resulting performance across a range of benchmark tasks [Radford 2019].

The figure below captures the scale-up phase where parameter count and data scale were the primary performance drivers. By this point, the public material still disclosed headline numbers, but it did so in a much less reconstructive way. The GPT-3 paper reports a 175-billion-parameter model trained for 300 billion tokens on a mixture dominated by filtered Common Crawl, with that Common Crawl portion described as 45 TB of compressed raw text before filtering and about 570 GB after filtering, corresponding to roughly 410 billion byte-pair encoded tokens [Brown 2020]. This is enough to understand the direction of travel. It is no longer enough to reproduce the full system with confidence from the figure alone. One can follow the general logic, but full re-implementation becomes guesswork about data filtering, mixture weights, infrastructure, and exact training procedure rather than reproducible science.

**Figure 3.24.** A GPT-3 slide highlighting further scale-up in model size and training corpus volume. It reinforced the role of scale and in-context behavior in language modeling, conveying a very large decoder-only transformer trained on a massive text mixture and evaluated in zero-shot, one-shot, and few-shot settings. It is now more a strategic overview than a blueprint: the paper reports 175 billion parameters and 300 billion training tokens, but the figure itself no longer provides enough detail for reproducible re-implementation without substantial guesswork [Brown 2020].

This scale also explains why critics later described such systems as "stochastic parrots" [Bender 2021]. If one stores 175 billion parameters in 16-bit precision, the weights alone occupy roughly 350 GB on disk. At 32-bit precision, they occupy about 700 GB. Using the published token counts and storage ratios from the GPT-3 paper, the filtered text mixture is of the same order of magnitude. This disk-size comparison is an inference from the published parameter count and dataset statistics rather than a number stated explicitly in the paper. The point is nevertheless illuminating. The model can be viewed as a compact statistical compression of a huge text collection. It absorbs regularities from that data and then produces new text by sampling from learned next-token probabilities. That is exactly why the phrase "stochastic parrot" became influential: it emphasizes that fluent language generation can emerge from large-scale statistical pattern learning without implying grounded understanding in the human sense [Bender 2021].

The figure below marks the productization phase, where reinforcement-learning-based alignment and interface design made these capabilities broadly usable. At the same time, the public descriptions became markedly more restrictive. The InstructGPT work still explains the alignment idea through supervised fine-tuning and reinforcement learning from human feedback, but model configuration, data composition, and even exact size were no longer disclosed with the earlier level of detail [Ouyang 2022]. One reason is obvious commercial pressure. Another is that later public scrutiny increasingly centered on ethically sensitive parts of the pipeline. TIME reported that OpenAI used outsourced workers in Kenya, paid less than two US dollars per hour, to label traumatic toxic content for safety filtering [Perrigo 2023]. In parallel, OpenAI publicly defended training on publicly available internet material as fair use while also introducing opt-out mechanisms for publishers and data controls for users [OpenAI 2024; OpenAI 2026a].

**Figure 3.25.** A ChatGPT slide indicating reinforcement-learning alignment and broad interactive use. ChatGPT made large-language-model capability visible to a broad user base, emphasizing product behavior, alignment, and usability rather than a fully specified model recipe. This shift mirrors the broader move from research-style disclosure toward productization, commercialization, and tighter control over information about model configuration, training data, and system scale [Ouyang 2022].

One lesson from this period is that providers began to add much stronger output safeguards. In image generation, for example, OpenAI states that DALL·E 3 is designed to decline requests in the style of living artists and includes additional mitigations around public figures and other harmful generations [OpenAI 2023]. These measures do not settle every copyright question, but they show that providers now actively try to prevent direct imitation and other legally sensitive outputs instead of treating generation as unconstrained pattern replay.

A second lesson concerns privacy and user control. OpenAI now exposes clear data controls that let users disable model-improvement training for chats, use temporary conversations, and rely on a default no-training setting for business products and the API [OpenAI 2026a; OpenAI 2026b]. A fair reading is that companies learned that technical capability alone is not enough. People also want to know what happens to their prompts, whether their data is reused for training, and which settings change that behavior.

A third lesson is that acceptable-use boundaries have become part of the product itself. Anthropic stated on February 27, 2026 that negotiations with the U.S. Department of War reached a deadlock because the company refused two requested exceptions: mass domestic surveillance and fully autonomous weapons [Anthropic 2026a]. That position is consistent with Anthropic's public usage policies, which continue to prohibit such categories except under tightly tailored and safeguarded arrangements [Anthropic 2026b]. This shows that frontier-model deployment is no longer only a question of model quality. It is also a question of where providers draw ethical and legal boundaries.

This transition matters directly for vibe coding. Early use cases focused on local tasks such as snippet completion or rewriting. Current workflows are iterative control loops: specify intent, generate code, execute it, evaluate failures, and refine prompts or constraints. But these loops now run inside product environments shaped by alignment choices, privacy settings, licensing safeguards, and provider usage policies. The developer role therefore shifts from pure implementation to system orchestration, where quality gates, test design, architectural consistency, and informed tool selection all remain essential. Also, public trust in AI depends not only on benchmark performance, but also on labor conditions, copyright handling, privacy controls, and transparent limits on deployment. Explainability, predictable behavior, and clearly communicated safeguards are therefore part of deployment quality, not decorative afterthoughts.

## Conclusion and Outlook

Deep learning matters in vibe coding because current coding assistants are downstream products of the same scaling principles that transformed speech, vision, and language over the past decade. The chapter's conceptual thread is therefore straightforward. First, representational power increased through depth and architecture design. Second, practical performance improved through data and compute scaling. Third, robust deployment still depends on domain knowledge, evaluation discipline, and engineering process.

The discussion continues into software-engineering process topics, where the same message remains valid: AI can accelerate implementation dramatically, but it does not remove responsibility for requirements, architecture, testing, and controlled evolution. Practitioners who combine these disciplines can use vibe coding productively without confusing speed with quality.

## Exercises

The following exercises ask you to trace the historical and technical developments covered in this chapter, from early neural networks through modern large language models, and to reason about the engineering trade-offs behind each milestone.

**Exercise Problem 1:** Reconstruct the historical argument of this chapter by writing an essay that links three milestones: speech-recognition improvement, ImageNet-era depth scaling, and ChatGPT adoption. Start by identifying one metric for each milestone, then explain which technical factor changed most (compute, data, or architecture) and why that factor mattered in context. Example: Compare the jump from pre-deep to deep acoustic models with the shift from GPT-2 to GPT-3, and discuss what changed in engineering feasibility for downstream products.

**Exercise Problem 2:** Build a minimal XOR experiment that demonstrates why linear models fail and multilayer models succeed. Begin with a two-feature synthetic dataset, train a linear classifier, visualize its decision boundary, and document the error pattern. Then train a small multilayer network on the same data, visualize the new boundary, and explain the representational difference in terms of nonlinear composition. Example task: implement both models in Python, plot boundaries in one figure, and report how many hidden units are sufficient for near-perfect separation.

**Exercise Problem 3:** Compare openness and reproducibility across GPT, GPT-2, GPT-3, and ChatGPT-era releases using only publicly available technical documentation. Create a structured table with columns for disclosed data sources, architecture detail, training detail, and reproducibility potential, then discuss one implication for academic research and one for industrial deployment.

## Bibliography

- [Anthropic 2026a] Anthropic. *Statement on the Comments from Secretary of War Pete Hegseth.* 2026.
- [Anthropic 2026b] Anthropic. *Exceptions to Our Usage Policy.* Anthropic Help Center, 2026.
- [Baevski 2020] Baevski, A., Zhou, Y., Mohamed, A., Auli, M. *wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations.* Advances in Neural Information Processing Systems, 2020.
- [Bender 2021] Bender, E. M., Gebru, T., McMillan-Major, A., Mitchell, M. *On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?* Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency, 2021.
- [Breininger 2018] Breininger, K., Albarqouni, S., Kurzendorfer, T., Pfister, M., Kowarschik, M., Maier, A. *Intraoperative Stent Segmentation in X-ray Fluoroscopy for Endovascular Aortic Repair.* International Journal of Computer Assisted Radiology and Surgery, 2018.
- [Breininger 2020] Breininger, K., Pfister, M., Kowarschik, M., Maier, A. *Move Over There: One-Click Deformation Correction for Image Fusion During Endovascular Aortic Repair.* MICCAI, 2020.
- [Brown 2020] Brown, T. B. et al. *Language Models are Few-Shot Learners.* Advances in Neural Information Processing Systems, 2020.
- [Cloudflare 2025] Cloudflare. *From Googlebot to GPTBot: Who's Crawling Your Site in 2025.* 2025.
- [Del Sozzo 2026] Del Sozzo, E., Fleming, M., Flamm, K., Thompson, N. *How Much Progress Has There Been in NVIDIA Datacenter GPUs?* arXiv, 2026.
- [Egan 2018] Egan, B. *neural-style-pt.* Software, 2018.
- [Gatys 2015] Gatys, L. A., Ecker, A. S., Bethge, M. *A Neural Algorithm of Artistic Style.* arXiv, 2015.
- [Google Cloud 2023] Google Cloud. *Introducing Chirp: Google Cloud's New Speech-to-Text Model.* 2023.
- [Gulati 2020] Gulati, A. et al. *Conformer: Convolution-augmented Transformer for Speech Recognition.* Interspeech, 2020.
- [Hinton 2012] Hinton, G. et al. *Deep Neural Networks for Acoustic Modeling in Speech Recognition: The Shared Views of Four Research Groups.* IEEE Signal Processing Magazine, 2012.
- [IDC 2018] IDC. *The Digitization of the World from Edge to Core.* 2018.
- [Karpathy 2014] Karpathy, A. *What I Learned from Competing Against a ConvNet on ImageNet.* 2014.
- [Kingma 2015] Kingma, D. P., Ba, J. *Adam: A Method for Stochastic Optimization.* International Conference on Learning Representations, 2015.
- [Kriesel 2013] Kriesel, D. *Xerox WorkCentres Are Switching Written Numbers When Scanning.* 2013.
- [Kriesel 2014] Kriesel, D. *Traue keinem Scan, den du nicht selbst gefälscht hast.* Chaos Communication Congress, 2014.
- [LeCun 1999] LeCun, Y., Haffner, P., Bottou, L., Bengio, Y. *Object Recognition with Gradient-Based Learning.* In *Shape, Contour and Grouping in Computer Vision*, Springer, 1999.
- [Maier 2019] Maier, A., Syben, C., Lasser, T., Riess, C. *A Gentle Introduction to Deep Learning in Medical Image Processing.* Zeitschrift für Medizinische Physik, 2019.
- [Maier 2022] Maier, A., Köstler, H., Heisig, M., Krauss, P., Yang, S. H. *Known Operator Learning and Hybrid Machine Learning in Medical Imaging — A Review of the Past, the Present, and the Future.* Progress in Biomedical Engineering, 2022.
- [Mnih 2015] Mnih, V. et al. *Human-Level Control Through Deep Reinforcement Learning.* Nature, 2015.
- [Moore 1965] Moore, G. E. *Cramming More Components onto Integrated Circuits.* Electronics, 1965.
- [OpenAI 2023] OpenAI. *DALL·E 3.* 2023.
- [OpenAI 2024] OpenAI. *OpenAI and Journalism.* 2024.
- [OpenAI 2026a] OpenAI. *How Your Data Is Used to Improve Model Performance.* OpenAI Help Center, 2026.
- [OpenAI 2026b] OpenAI. *Data Controls FAQ.* OpenAI Help Center, 2026.
- [Ouyang 2022] Ouyang, L. et al. *Training Language Models to Follow Instructions with Human Feedback.* Advances in Neural Information Processing Systems, 2022.
- [Panayotov 2015] Panayotov, V., Chen, G., Povey, D., Khudanpur, S. *Librispeech: An ASR Corpus Based on Public Domain Audio Books.* ICASSP, 2015.
- [Perrigo 2023] Perrigo, B. *Exclusive: OpenAI Used Kenyan Workers on Less Than \$2 Per Hour to Make ChatGPT Less Toxic.* TIME, 2023.
- [Pratap 2024] Pratap, V. et al. *Scaling Speech Technology to 1,000+ Languages.* Journal of Machine Learning Research, 2024.
- [Radford 2018] Radford, A., Narasimhan, K., Salimans, T., Sutskever, I. *Improving Language Understanding by Generative Pre-Training.* OpenAI technical report, 2018.
- [Radford 2019] Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I. *Language Models are Unsupervised Multitask Learners.* OpenAI technical report, 2019.
- [Russakovsky 2015] Russakovsky, O. et al. *ImageNet Large Scale Visual Recognition Challenge.* International Journal of Computer Vision, 2015.
- [Sethi 1990] Sethi, I. K. *Entropy Nets: From Decision Trees to Neural Networks.* Proceedings of the IEEE, 1990.
- [Silver 2016] Silver, D. et al. *Mastering the Game of Go with Deep Neural Networks and Tree Search.* Nature, 2016.
- [Sutton 2019] Sutton, R. *The Bitter Lesson.* 2019.
- [Unberath 2016] Unberath, M., Aichert, A., Achenbach, S., Maier, A. *Virtual Single-Frame Subtraction Imaging.* Int. Conf. Image Form X-Ray CT, 2016.
- [Unberath 2017] Unberath, M., Hajek, J., Geimer, T., Schebesch, F., Amrehn, M., Maier, A. *Deep Learning-Based Inpainting for Virtual DSA.* IEEE Nuclear Science Symposium and Medical Imaging Conference, 2017.
- [Vaswani 2017] Vaswani, A. et al. *Attention Is All You Need.* Advances in Neural Information Processing Systems, 2017.
- [Vinyals 2015] Vinyals, O., Toshev, A., Bengio, S., Erhan, D. *Show and Tell: A Neural Image Caption Generator.* IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2015.
- [Wikipedia 2026] Wikipedia contributors. *Netflix Prize.* 2026.
- [Wired 2009] Wired. *BellKor's Pragmatic Chaos Wins \$1 Million Netflix Prize.* 2009.

## Source

This chapter is derived from the *Vibe Coding* book (Maier et al., Springer, CC BY, <https://link.springer.com/book/9783032399069>), chapter source `vhb_vibe_coding/vibe_03/chapter.tex`. It is part of the VHB course *Vibe Coding*: <https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901>
