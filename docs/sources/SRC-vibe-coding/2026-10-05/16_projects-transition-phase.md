---
course: vibe-coding
title: Projects in the Transition Phase from Prompt Engineering over Vibe Coding to Autonomous Agents
chapter: 16
source: vhb_vibe_coding/VIBE_16_Examples/chapter.tex
course_url: https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901
book: "Vibe Coding (Maier et al., Springer, CC BY)"
book_url: https://link.springer.com/book/9783032399069
license: CC BY
---

# Chapter 16 — Projects in the Transition Phase from Prompt Engineering over Vibe Coding to Autonomous Agents

**Andreas Maier, Siyuan Mei, Mahfuzur Rahman Chowdhury, Moritz Zaiss, and Adarsh Bhandary Panambur**
Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)

## Abstract

We present two end-to-end case studies from the transition phase between prompt engineering and vibe coding. The projects were not fully vibe coded but built with heavy artificial intelligence (AI) coding assistance, reflecting the state of practice during 2024–2025. A key focus is the use of common open-source libraries—OpenCV, Tesseract, No Language Left Behind (NLLB), PyPulseq—that are well-suited for vibe coding projects because they do not incur additional token cost at runtime. Much of what we present could have been achieved with vision-language models, but at significantly higher runtime cost; we deliberately chose lightweight, locally deployable alternatives. The first case study describes High-Definition Multimedia Interface (HDMI) Babelfish, a real-time translation pipeline for Japanese role-playing games combining HDMI capture, optical character recognition (OCR), neural machine translation, and rendered overlays. The second case study discusses large language model (LLM)-assisted magnetic resonance imaging (MRI) pulse-sequence coding, demonstrating that the reach of AI coding extends well beyond standard libraries into highly specialized scientific domains. Across both examples, we emphasize architecture choices, integration constraints, and the practical role of human oversight.

## Programming with AI Through Real Projects

This chapter works as a bridge between abstract process discussions and concrete implementation work. The projects presented here were developed during 2024–2025, a period when AI coding assistance was powerful but not yet at the level of fully autonomous vibe coding. We used LLMs extensively for code generation, debugging, and iteration, but human developers remained in control of architecture, integration, and validation. The result is a set of projects that illustrate the transition phase: heavy AI assistance within a human-governed engineering workflow.

A deliberate choice in both projects is the use of established open-source libraries—OpenCV for video processing, Tesseract for text recognition, NLLB for translation, PyPulseq for MRI sequence design. These libraries are ideal for vibe coding because they are well-documented—which helps LLMs generate correct code—locally deployable—which avoids per-inference application programming interface (API) costs—and community-maintained, ensuring long-term availability. Much of the functionality we demonstrate—text detection, translation, image rendering—could alternatively be achieved with vision-language models or cloud APIs, but at significantly higher runtime cost. For edge deployment and real-time applications, lightweight local inference is essential.

The MRI case study extends this principle into a specialized scientific domain, showing that AI coding assistance is not limited to standard web or data-science libraries. When domain-specific packages like PyPulseq provide structured APIs, LLMs can generate physics-correct code that would otherwise require years of expert training.

A recurring theme across both projects is decomposition: identify a target workflow, map it to components with well-defined interfaces, automate what can be reliably automated, and keep human control at points where errors would be expensive.

## HDMI Babelfish for Real-Time RPG Translation

The first project is motivated by a practical user problem that emerged from personal experience with Japanese role-playing games. These games often contain large amounts of story text and dialogue that create language barriers for non-native players. The project goal is not offline subtitle generation or a smartphone lens application. Instead, the ambition is an HDMI-in to HDMI-out translation path (Figure 16.1) that can be used while playing on a console without interrupting the gaming experience.

**Figure 16.1.** HDMI Babelfish project concept. The slide shows an HDMI cable running from a game console through a translation device to a monitor. The goal is a real-time translation pipeline that accepts video from a gaming console on an HDMI input, detects and translates on-screen text, and outputs the translated content back on HDMI to the display.

Why HDMI in particular? The key advantage is that the translation happens transparently at the signal level, without requiring modifications to the game itself or constant manual intervention. A player can simply plug in the device and play, with translations appearing in real time. This is technically much more complex than offline batch processing or a smartphone lens, but it provides a better user experience and demonstrates a more realistic engineering challenge. Figure 16.2 shows the language barrier that motivates the project.

**Figure 16.2.** User motivation. The title image shows *The Legend of Heroes: Trails of Cold Steel II*, a Japanese RPG with hours of story dialogue and interface text presented in untranslated Japanese. Without translation, non-Japanese speakers face significant comprehension barriers that reduce enjoyment and immersion.

### Architecture Overview

The architecture is a staged pipeline with four major components. First, the HDMI signal from a PlayStation (PS) 3 console is captured using a video acquisition card. Next, captured frames are processed with OCR using the Tesseract engine to detect Japanese text and estimate bounding boxes of text regions. Then, recognized strings are translated using the NLLB model family, a state-of-the-art neural machine translation model designed to support 200+ languages [NLLB Team 2022]. Finally, translated text is rendered back onto output frames and streamed to an HDMI display. The most time-consuming part was not implementing the algorithm but rather engineering the hardware and signal-path constraints.

### Hardware and Signal Constraints

The first substantial obstacle was High-bandwidth Digital Content Protection (HDCP)-protected output from a PS 3 console. HDCP is a digital rights management protocol that encrypts the HDMI signal to prevent unauthorized recording. When we tried direct capture with standard grabber cards, the frames came back black because the encrypted output was rejected by the standard capture mechanism. The PS 3 detects whether the receiving device is approved to display content, and if not, it breaks the encryption.

The practical solution was an HDMI extender device, which became a critical piece of the hardware architecture. The extender device accepts an HDMI signal from the PS 3, converts it to an intermediate representation transmitted over Ethernet, and outputs it back as HDMI. During this conversion, the extender performs what is essentially a man-in-the-middle handshake: it communicates with the PS 3 as if it were a trusted display, and it communicates with the downstream grabber card as if it were the original PS 3. This handshake breaks the encryption in a controlled way because the extender holds both the PS 3 and the capture device in a state where they both think the connection is secure, but the unencrypted signal is available in the middle.

Setup requires care. To establish trust with the PS 3, the extender must first be connected to an actual television or monitor. This performs the HDCP handshake and establishes trust credentials. Once the credentials are cached, the extender can be moved to the intermediate position, plugged into a grabber card, and the frames can be processed in real time. The extender can transmit over standard Ethernet cables for up to 200 feet, which makes it far more flexible than trying to place the entire processing pipeline right next to the console.

The broader engineering lesson here is architectural. AI can accelerate code synthesis, but hardware-interface constraints still dominate system feasibility in multimedia projects. No amount of better prompting would have solved the HDCP problem. The integration depended on understanding the physical constraints of the hardware, the trust semantics of the protocol, and the practical workarounds available. This is exactly the kind of domain knowledge that human engineers need to provide to shape what the LLM support tackles.

### OCR, Translation, and Rendering Pipeline

Once the video signal was accessible, the next challenge was to extract text from video frames reliably. OCR was implemented with Tesseract, an open-source OCR engine originally developed by Google. Tesseract supports Japanese language detection through specialized training data and language models. The basic approach is straightforward: load a frame, call the Tesseract API, and receive back bounding boxes of detected text regions and the recognized strings.

However, a key engineering issue emerged immediately: bounding-box instability across frames. When the OCR ran on video frames one after another, the detected bounding boxes would jump around erratically. A text region might be detected in one frame, miss in the next frame due to lighting or rendering artifacts, then reappear in a slightly different position in the following frame. This instability propagated directly into the translation pipeline and rendering. Because each frame's text was translated independently, the same text would produce different translations in consecutive frames, creating a visually unstable overlay that flickered and jittered.

The solution required temporal filtering. We implemented a percentile-based strategy: after detecting bounding boxes across a sliding window of frames, the algorithm computed percentile bounds to identify the most stable regions. Bounding boxes that appeared in less than a threshold percentile of the collected frames were filtered out as noise. The main text region was identified as the box that appeared most consistently across the window. This temporal smoothing reduced jitter dramatically and made the overlay visually coherent.

Without temporal filtering, the detected bounding boxes are unstable across frames, causing visible jitter in the final overlay. To support these operations, we developed several helper functions. One function computed the bounding-box percentile by collecting all detected boxes across a frame window and returning the \(p\)-th percentile bounding coordinates. Another function filtered outliers based on the percentile and returned the main text region. These functions were synthesized quickly with LLM assistance but required human iteration to get the percentile thresholds and window sizes right.

Video frame capture and processing was implemented using OpenCV (see Geek Box: OpenCV), a library that provides simple interfaces to open video files, read frames, and perform basic transformations. The processing loop reads frames at a fixed interval, runs OCR on selected frames to reduce computational load, and processes only every few frames rather than every single frame. This trade-off reduced real-time demands while still providing frequent updates.

Tesseract (see Geek Box: Tesseract) configuration was another area requiring careful tuning. The initial setup included page-segmentation mode selection and Japanese language data. We experimented with different segmentation modes because Tesseract's layout assumptions affect bounding-box accuracy. A uniform-block assumption that treats the image as a single block of text performed better than modes that tried to infer complex layouts. Language selection was straightforward: load the Japanese language model to enable character recognition for Japanese scripts.

Per-frame processing involved several stages. First, a region of interest (ROI) was extracted around the detected bounding box (Figure 16.3) to isolate the text from the surrounding background. This ROI was then passed to a refined OCR step that operated on a cropped image, improving character recognition accuracy. The refined output was annotated back into the full frame with bounding boxes and recognized strings for visualization.

**Figure 16.3.** Per-frame text extraction and annotation pipeline. The slide is a flowchart of the processing steps from input frame to annotated output. Regions of interest are extracted around detected text, refined OCR is applied, and results are annotated back into the frame for debugging and display.

Translation was performed using the NLLB model family (see Geek Box: NLLB), specifically the distilled 600M variant for practical runtime and memory constraints. NLLB was trained on 200+ language pairs and represents a major effort by Meta AI to provide high-quality neural machine translation without requiring large commercial APIs. We loaded the model through the HuggingFace transformers library, which provides a unified interface to thousands of pre-trained models. The distilled variant was chosen because the full model would have required graphics processing unit (GPU) acceleration, and the project initially had no graphics hardware available. The distilled model runs on central processing unit (CPU) with reasonable latency.

The final stage was rendering the translated text back onto the output frames. We used the Python Imaging Library (PIL) to draw text onto frames. The approach was to compute the average color of the bounding-box region to determine whether the background is light or dark, then render translated text in a complementary color—white text on dark backgrounds, dark text on light backgrounds—for readability. The rendered frame was then written back to the output video stream or displayed on screen, as shown in Figure 16.4.

> **Geek Box: OpenCV: the Swiss army knife of computer vision**
>
> OpenCV (Open Source Computer Vision Library) is an open-source library with over 2,500 optimized algorithms for image and video processing, originally developed by Intel in 1999 and now maintained by a global community [Bradski 2000]. It provides bindings for C++, Python, and Java and runs on all major platforms including embedded devices.
>
> The library covers the full spectrum of computer vision tasks: image I/O and format conversion (`imread`, `imwrite`), color-space transforms (`cvtColor`), geometric operations (resize, warp, rotate), filtering (Gaussian blur, edge detection, morphology), feature detection (SIFT, ORB, Hough transforms), object detection (Haar cascades, DNN module for running neural networks), video capture and streaming (`VideoCapture`, `VideoWriter`), and camera calibration. All operations work on NumPy arrays, making OpenCV seamlessly composable with the Python scientific stack.
>
> For the HDMI Babelfish pipeline, we use three core functions. `cv2.VideoCapture()` opens video streams from files or capture devices and provides frame-by-frame access. `cap.read()` returns individual frames as NumPy arrays, enabling direct integration with other Python libraries. `cv2.cvtColor()` converts between color spaces—here between BGR (OpenCV's default) and RGB (required by PIL for text rendering). OpenCV's core advantage for vibe coding is its extensive documentation and widespread use in tutorials, which means LLMs generate correct OpenCV code with high reliability.

> **Geek Box: Tesseract: open-source OCR from printed page to game screen**
>
> Tesseract is an open-source OCR engine originally developed at Hewlett-Packard Labs in the 1980s, later released as open source by Google in 2006 [Smith 2007]. Version 4 introduced an LSTM-based recognition engine that significantly improved accuracy for complex scripts including Japanese, Chinese, and Korean. Tesseract supports over 100 languages through downloadable training data.
>
> The core pipeline works in three stages. First, *layout analysis* segments the input image into text regions using connected-component analysis and identifies lines, words, and characters. The page-segmentation mode (PSM) controls this stage—PSM 6 (uniform block) works well for game dialogue boxes where text appears in a single rectangular region. Second, *recognition* passes each segmented region through the LSTM network, which outputs character sequences with confidence scores. Third, *post-processing* applies language-model constraints to correct common recognition errors. A minimal Python example for OCR on a single image:
>
> ```python
> import pytesseract
> from PIL import Image
> img = Image.open("screenshot.png")
> data = pytesseract.image_to_data(img,
>     lang="jpn", config="--psm 6",
>     output_type=pytesseract.Output.DICT)
> for i, text in enumerate(data['text']):
>     if text.strip():
>         x, y, w, h = (data['left'][i],
>             data['top'][i], data['width'][i],
>             data['height'][i])
>         print(f"[{x},{y},{w},{h}]: {text}")
> ```
>
> The code loads an image, runs Tesseract with Japanese language data and uniform-block segmentation (PSM 6), and retrieves a dictionary containing bounding-box coordinates and recognized text for each detected region. The loop filters empty results and prints each text region with its position.

> **Geek Box: NLLB: No Language Left Behind**
>
> NLLB is a family of neural machine translation models developed by Meta AI, trained on 200+ language pairs with the goal of providing high-quality translation for low-resource languages [NLLB Team 2022]. The architecture is an encoder-decoder Transformer: the encoder maps source-language tokens into a shared multilingual representation space, and the decoder generates target-language tokens auto-regressively.
>
> For edge deployment, model size is critical. The full NLLB-200 model (3.3B parameters) requires multiple GPUs for inference. The distilled 600M variant used in HDMIBabelfish V1 trades some translation quality for dramatically lower memory and latency, running on CPU with acceptable speed. In practice, calling the model through HuggingFace requires only a few lines:
>
> ```python
> from transformers import pipeline
> translator = pipeline("translation",
>     model="facebook/nllb-200-distilled-600M",
>     src_lang="jpn_Jpan", tgt_lang="eng_Latn")
> result = translator("こんにちは世界")  # Insert Japanese text
> print(result[0]['translation_text'])
> ```
>
> The pipeline handles tokenization, inference, and detokenization transparently. For the V2 system, the even smaller Marian OPUS model was chosen for its lower latency on the Jetson Orin NX [Chowdhury 2026].

### Prototype Results and Development Time

The first demonstrator was built in approximately three hours of actual implementation work. This rapid timeline illustrates the advantage of LLM support for routine implementation tasks. However, the most time-consuming part was not algorithm development or model integration, but rather the hardware capture setup. The HDCP problem took multiple days of research, hardware acquisition, and testing to solve. This is a useful process insight for student projects: integration complexity often dominates algorithm complexity in early prototypes.

**Figure 16.4.** Prototype result demonstrating feasibility of HDMI-based translation. The result slide shows a game screenshot with detected regions and translated strings displayed on the game content. Blue bounding boxes mark the detected text regions, and white overlays show the English translations rendered back into the frame.

The prototype showed that the architecture was viable, but several engineering challenges remained. Bounding-box stability was still problematic despite the temporal filtering. The OCR output varied across frames, and feeding unstable recognition directly into translation created visible jitter in the overlay. Rendering also could be optimized: text sometimes overlapped with important game elements, and the automatic color selection did not always produce readable text. These limitations are typical of a proof-of-concept: the system demonstrates that the idea works, but a production system would need further refinement (see Geek Box: Why the details dominate in multimedia prototyping).

> **Geek Box: Why the details dominate in multimedia prototyping**
>
> The HDMI Babelfish experience illustrates a principle that applies across multimedia projects: the detail work—not the core algorithm—often takes the longest to get right. This is sometimes called the *90% complete 10% of the time, 10% complete 90% of the time* principle.
>
> Two factors dominated development time in this project. First, the HDCP hardware constraint was a showstopper: we could not proceed with any algorithm testing until we had working video capture, which required understanding cryptographic protocols, hardware handshakes, and the economics of HDMI licensing. Second, achieving stable bounding-box detection across frames proved surprisingly difficult. The temporal percentile filter was a reasonable first approach, but getting detection truly stable and flicker-free required careful tuning of thresholds, window sizes, and outlier rejection—work that eventually grew into the full tracking and stability architecture of HDMIBabelfish V2 (see Geek Box: HDMIBabelfish V2).
>
> The practical implication is that infrastructure constraints and signal-quality details should be addressed first in system design. Prototype the capture pipeline with minimal processing, then add algorithm complexity once the signal path is stable. LLM support can accelerate the algorithmic parts enough that these detail bottlenecks become even more obvious by contrast.

### Version 2 and Embedded Direction

The prototype was successful enough to attract further development. The project evolved into a stronger second version that was continued in a master's thesis context, targeting embedded execution on small-form-factor hardware like the NVIDIA Jetson platform (see Geek Box: HDMIBabelfish V2). The goal of Version 2 was to achieve true real-time operation with better end-to-end usability and lower latency. The public repository for the next iteration is available on GitHub as HDMIBabelfishV2 [PRLab-FAU 2025], where the thesis work is documented and code is openly shared.

This continuation reflects a common pattern in AI-assisted development: a fast LLM-assisted prototype validates viability and demonstrates that the idea solves a real problem. Once viability is established, structured engineering work improves stability, reduces latency, optimizes resource usage, and hardens deployment readiness. Version 2 benefited from lessons learned in the prototype, including better temporal filtering strategies, GPU acceleration via the Jetson hardware, and more aggressive optimization of the inference pipeline. HDMIBabelfish V2 was just accepted at IEEE ICME 2026 [Chowdhury 2026].

> **Geek Box: HDMIBabelfish V2: real-time translation on edge devices (ICME 2026)**
>
> The three-hour prototype evolved into a full real-time system running on an NVIDIA Jetson Orin NX [Chowdhury 2026]. HDMIBabelfish V2 captures live HDMI video, detects Japanese text using a fine-tuned YOLOv11-nano detector trained on a custom JRPG dataset, tracks text regions with simple online and realtime tracking (SORT) for temporal stability, recognizes characters via Tesseract with PaddleOCR fallback, translates using a Marian OPUS model fine-tuned on 2.7M Japanese-English subtitle pairs (JESC corpus, improving character-level F-score (chrF) by 6%), and renders English overlays back onto the live video stream.
>
> **Figure 16.5.** Architecture diagram of the HDMIBabelfish V2 multi-threaded pipeline. It shows the detection, tracking, OCR, translation, caching, and rendering modules, with an I/O thread compositing overlays at full frame rate while detection and translation run asynchronously.
>
> **Latency-aware architecture.** The key engineering contribution is a multi-threaded scheduling strategy that decouples lightweight detection from expensive OCR/NMT. An I/O thread captures frames into a bounded queue and composites overlays at full frame rate. A detection thread runs YOLOv11-nano and SORT tracking, emitting stable text regions only after a 200 ms stability check. A pool of translation workers performs OCR and NMT asynchronously, writing results into a shared overlay map that the I/O thread reads without blocking. A similarity-based cache using normalized Levenshtein distance with threshold $\theta = 0.85$ avoids redundant translations of recurring dialogue lines.
>
> | Metric | Description | Value |
> | --- | --- | ---: |
> | Average frames per second (FPS) | Overall system throughput | 33.5 |
> | Average latency | Mean frame processing delay | 14.9 ms |
> | Cache hit rate | Reused translations from cache | 4.8% |
> | OCR latency | Average per OCR operation | 268.8 ms |
> | Translation latency | Average per translation | 416.0 ms |
> | Max GPU memory | Maximum utilization | 0.40 GB |
>
> The system sustains 33.5 FPS with 14.9 ms latency on the Jetson Orin NX—well within the 30 FPS target. The architecture is language-agnostic; preliminary tests on Latin and CJK RPGs indicate broader applicability. Code: <https://github.com/PRLab-FAU/HDMIBabelfish> [Chowdhury 2026].

## Can LLMs Code MRI Sequences?

The second example addresses a high-skill domain where mistakes are expensive and correctness criteria are strict: MRI pulse-sequence programming. The motivation for this case study is not entertainment but fundamental scientific and medical engineering. MRI systems are complex, expensive (costing millions of dollars), and failures can have direct consequences for patient care. The question is whether current language models can assist in this highly specialized domain (Figure 16.6).

The foundation for this work was laid by Pulseq [Layton 2017], a hardware-independent pulse sequence prototyping framework, and its Python implementation PyPulseq [Ravi 2019], which provides a structured API for sequence design. On the AI side, MRzero [Loktyushin 2024; Loktyushin 2021; Endres 2024] is a python MRI simulator that can interpret and simulate Pulseq sequences, acting as feedback and final check of the AI generated MR sequences, and in [Zaiss 2024], GPT-4 was first explored as an MRI sequence and reconstruction programming assistant (see also Chapter 4).

Building on these results, the "MR Physicist's Last Exam" experiment series was started at FAU in early 2025 [Zaiss 2025b], concluding in the article on agentic MR sequence development [Zaiss 2026]. The project asked whether current LLMs can generate a valid spin-echo echo-planar imaging (EPI) sequence under three progressively richer conditions: (i) a bare LLM receiving only a compact prompt, (ii) the same LLM enriched with detailed MR and Pulseq context (LLM4MR), and (iii) an agentic setup with skills to run code, test simulated sequences, and check the resulting images (Agent4MR). A human developer was given the same task and tools as a reference. This is not a trivial task: MRI sequence programming requires understanding quantum mechanics, pulse physics, gradient control, and the complex interactions between hardware and signal processing. For decades, this domain was so specialized that only experts could write sequences reliably. The broader context is whether language models have reached a point where they can begin to bridge the expertise gap.

**Figure 16.6.** Research context for LLM-assisted MRI programming. The background slide introduces the LLM4MR question with a stylized image of an MRI scanner. The question is whether large language models can code MRI pulse sequences, a task that traditionally required years of specialized training. Performance improves when moving from bare LLMs (left) to context-equipped LLMs, or full agents (right).

### Why MRI Sequence Programming Is Hard

Before discussing the experiment results, it is important to understand why MRI coding is hard. An MRI scanner is a superconducting magnet that creates a static magnetic field of several Tesla. The physics of nuclear magnetic resonance causes hydrogen nuclei in tissue to precess at frequencies proportional to the magnetic field. By applying radiofrequency (RF) pulses and switching magnetic-field gradients at precise times, the scanner can excite nuclei, manipulate their coherence, and collect signals that encode spatial and contrast information.

A pulse sequence is a carefully timed program that specifies RF pulses, gradient waveforms, and data acquisition windows. Errors in sequence design have immediate consequences. A missing slice-selection gradient rewind means the magnetization vectors will be in the wrong state for subsequent acquisitions, producing artifacts or data loss. Reversed k-space acquisition will mirror the image. Incorrectly scaled readout gradients will compress or stretch the image spatially. Neglecting refocusing pulse k-space navigation will produce severe artifacts. These errors are not "off-by-one" bugs that might be caught by a unit test; they are physics-based consequences that invalidate the entire measurement.

Traditionally, MRI sequence programming required a degree in physics and years of on-the-job training under expert supervision. The domain is so specialized that probably fewer than a few hundred people worldwide are considered expert sequence developers. This scarcity has been a limiting factor for MRI research and development because even simple new sequences take weeks to develop and validate. A compact introduction to the physics behind MRI is given in the Geek Box below.

> **Geek Box: How MRI works: from nuclear spins to images**
>
> MRI exploits the magnetic properties of hydrogen nuclei ($^1$H) in the human body [Maier 2018]. When placed in a strong static magnetic field $\mathbf{B}_0$ (typically 1.5–3 T), the spin axes of hydrogen nuclei partially align with the field, creating a net magnetization vector $\mathbf{M}$. This magnetization precesses around $\mathbf{B}_0$ at the *Larmor frequency* $f_\ell = \gamma \cdot \|\mathbf{B}_0\|$, where $\gamma = 42.576$ MHz/T is the gyromagnetic ratio of hydrogen.
>
> **Excitation and relaxation.** A short RF pulse at the Larmor frequency tips $\mathbf{M}$ away from equilibrium. After the pulse, two relaxation processes occur simultaneously: $T_1$ relaxation (longitudinal recovery toward $\mathbf{B}_0$) and $T_2$ relaxation (transverse decay due to spin dephasing). Different tissues have different $T_1$ and $T_2$ values, which is the origin of soft-tissue contrast in MRI.
>
> **Spatial encoding and k-space.** To form an image, the scanner applies magnetic-field gradients that make the Larmor frequency spatially dependent: $f_\ell(z) = \gamma \cdot (\|\mathbf{B}_0\| + z)$. Slice selection uses a gradient during RF excitation to excite only a thin slab. Spatial encoding within the slice uses phase and frequency encoding gradients to sample the 2D Fourier transform of the image—a space called *k-space*. Each gradient configuration samples one point in k-space; a complete image requires filling k-space systematically.
>
> **Figure 16.7.** A filled 2D k-space with associated phase patterns [Maier 2018]. Grey values encode similarity: dark = low, bright = high. Selected k-space positions are annotated with their corresponding phase patterns. The image is reconstructed by inverse Fourier transform. CC BY 4.0.
>
> **Pulse sequences.** A pulse sequence is the timed program that controls RF pulses, gradient switching, and data acquisition to fill k-space in a specific pattern. Different sequences—spin echo, gradient echo, EPI—trade off speed, contrast, and artifact sensitivity. Errors in sequence design (missing gradient rewinds, reversed k-space traversal, incorrect timing) produce physics-based artifacts that invalidate the measurement, which is why this domain has traditionally required deep expert knowledge. For a comprehensive treatment of MRI physics, imaging principles, and advanced techniques, see [Maier 2018].

### From LLM4MR to Agent4MR

The study [Zaiss 2026] evaluated a spin-echo EPI task under three progressively richer conditions—a *bare LLM* receiving only the prompt, *LLM4MR* receiving the prompt plus PyPulseq examples and MR context, and *Agent4MR* where the model could execute code, run MRI simulations, and receive a physics-aware validation report—and compared all three against a *human developer* given the same task and tools. The prompt given to all participants (Figure 16.8) was compact:

> *"Code a spin echo EPI sequence (64x64, FOV=(0.2, 0.2, 0.008)m, TE=100 ms)."*

This is far shorter than earlier attempts, which required multi-page prompts with detailed physics instructions. The reduction from pages to a single sentence reflects the rapid capability growth of language models in constrained domains.

**Figure 16.8.** Example output from bare LLM (a–e) and Agent4MR (f–j) for the prompt "Code spin-echo EPI sequence (64×64, FOV = (0.2, 0.2, 0.008) m, TE = 100 ms)". The bare LLM makes several careless mistakes: a phase rewinder after the refocusing pulse, leading to remaining z-dephasing visible in (c) and to signal cancellation in (e); a wrong x-prewinder, leading to wrong k-space coverage in (b), leading to FOV error in (e); and a wrong echo time. The Agent4MR correctly implemented all these features (f), leading to correct k-space coverage (g–i) and image (j).

### Effect of Context and Agentic Refinement

For each of three base LLMs (Gemini 2.5 Pro, GPT-5, Claude 4.1 Opus), the study compared the three setups: (1) **LLM**—direct instruction without any specialized context or tools; (2) **LLM4MR**—instruction using a concise, MRI-specific and PyPulseq-specific context, but no tools; (3) **Agent4MR**—the agent-based system with automated code execution and physics-aware validation feedback via MRzero [Loktyushin 2024; Loktyushin 2021; Endres 2024]. Each setup was applied five times per model; Figure 16.9 summarizes the mean and standard deviation of user interactions required to reach a valid sequence.

Across all models, providing the concise MRI-specific context (LLM4MR) substantially reduced the number of required user interactions compared with the bare baseline (LLM). Without context, models required multiple corrective interactions to resolve syntax errors, incorrect PyPulseq usage, or missing sequence components. Introducing the MR- and PyPulseq-context improved task grounding and reduced both the mean interaction count and its variability, indicating more stable behavior across repeated trials.

However, even with the LLM4MR context, many generated sequences still exhibited errors in key parameters such as TE, TR, k-space trajectory, or gradient timing (Figure 16.8, left). LLM-only sequences frequently showed physically inconsistent trajectories or incorrect timing; LLM4MR sequences improved but still contained residual errors that no amount of static context could prevent.

**Figure 16.9.** Average number of user interactions per condition for each base LLM: (a) Gemini 2.5 Pro, (b) GPT-5, (c) Claude 4.1 Opus Thinking. The bar charts show that adding MRI-specific context (LLM4MR, green) reduces interactions compared with the bare LLM (blue); the agentic loop (Agent4MR, red) reduces them further to single-interaction level across all models. Error bars show standard deviation over five runs. Adapted from [Zaiss 2026].

In contrast, the Agent4MR configuration, where the model could execute code, run the MRzero simulator to produce a synthetic image, and receive a structured validation report flagging timing violations, k-space coverage gaps, or image artifacts, generated sequences that were consistently correct (Figure 16.8, right). The agent's iterative refinement loop allowed it to autonomously detect and correct errors in TE, TR, and gradient events, producing fully valid sequences across all evaluated LLMs in a single user interaction [Zaiss 2026]. The key was not a better model but a better *harness*: the physics-based validation report gave the agent the same kind of structured feedback that a human expert would provide during code review.

### Autonomous MR Autoresearch

A separate challenge tested whether agents could go beyond generating a correct sequence and *improve* it autonomously, following Karpathy's autoresearch approach discussed in Chapter 1. The task: refine a FLAIR spin-echo EPI sequence and its reconstruction within a 10-second scan-time budget to match a target image contrast as closely as possible, measured by mean absolute error (MAE). Each agent posted its result to a leaderboard (Figure 16.10).

**Figure 16.10.** Autoresearch leaderboard. The plot tracks MAE improvement over 28 experiments, from a baseline of 0.266 down to a best of 0.167, through progressive agent-driven refinements. Autonomous agents iteratively improved sequence parameters and reconstruction. Adapted from [Zaiss 2026].

Over 28 experiments the agents tried shorter readout durations to reduce distortions, differentiable optimization of timing parameters via MRzero [Loktyushin 2024; Loktyushin 2021; Endres 2024], and adaptive multi-shot reconstruction—improving MAE from ~0.266 to ~0.167. The winning strategy combined several earlier ideas: two-shot EPI with per-shot signal scaling and optimized timing before image reconstruction. The entire competition ran on a single PC in a few hours at a token cost of approximately 10 €.

A human expert tackling the same task achieved a nearly identical MAE, though with a faster single-shot design. Later model generations outperformed this human baseline. The broader lesson: the same agentic loop that works for software engineering—generate, execute, validate, revise—extends to autonomous scientific experimentation in a highly constrained physical domain.

> **Geek Box: Why Structured Libraries Enable AI Coding in Expert Domains**
>
> A key insight from the LLM4MR and Agent4MR experiments is that structured libraries and APIs significantly improve the quality of AI-generated code in expert domains. Both used PyPulseq [Ravi 2019], an open-source Python package for MRI pulse-sequence design built on the hardware-independent Pulseq framework [Layton 2017], together with MRzero-Core [Loktyushin 2024; Loktyushin 2021; Endres 2024], an open-source Python MRI simulation package that can simulate any Pulseq sequence.
>
> PyPulseq provides a high-level API that abstracts away low-level hardware details. Instead of manually calculating gradient waveforms, timing, and data acquisition windows, the programmer calls functions with physics-based parameters. The library handles the underlying hardware limitations and time validation. This structured approach has two major advantages for AI coding. First, the API constrains the solution space by restricting what code can do, which reduces the chance of generating invalid combinations. Second, many PyPulseq functions include built-in validation through sanity checks for parameter ranges and physical constraints, catching obvious errors before they propagate.
>
> If the task required hand-coded low-level gradient waveforms or direct hardware register manipulation, LLM reliability would drop dramatically. The structured library is not a replacement for expert validation, but it significantly improves the baseline quality of generated code. With agentic skills and MR simulation feedback, running code can be turned into physically plausible MR sequences.
>
> This principle applies broadly: LLM code generation is most reliable when the target system provides high-level, well-documented APIs with built-in constraints. When documentation is publicly accessible, reasoning models can retrieve it autonomously, further reducing the need for manual prompt engineering. The common pattern is that good abstractions combined with accessible documentation improve both human code quality and AI code reliability.

### Interpretation: When Should You Trust AI Code in Expert Domains?

The engineering interpretation of the Agent4MR results is nuanced. The context-only baseline (LLM4MR) already showed that reasoning-focused models can produce near-correct sequences, but near-correct is not good enough in a domain where a missing gradient rewind invalidates a clinical scan. Agent4MR's physics-aware validation loop closed this gap: by giving the model structured, domain-specific feedback, all tested models converged on artifact-free sequences, not because the models were better, but because the *harness* was better. The lesson generalizes: an appropriate agentic harness with domain-specific validation can turn general-purpose LLMs into reliable tools for expert domains.

Open tooling mattered enormously (see Geek Box: Why Structured Libraries Enable AI Coding in Expert Domains). PyPulseq constrained the solution space, and MRzero provided simulation-based ground truth that no amount of prompt engineering could replace. If the task required hand-coded low-level gradient waveforms or direct hardware register manipulation, agent reliability would drop dramatically. The availability of structured APIs and simulators changes what is practical to automate.

The autoresearch result points further ahead: agents that can autonomously refine sequences toward a target contrast are no longer coding assistants—they are automated experimenters. This does not justify removing expert oversight in safety-relevant contexts, but it does show that the role of the human expert is shifting from writing and debugging code to defining objectives, designing validation criteria, and reviewing agent-generated results.

## Lessons Learned

Looking back at both projects, the patterns we discovered by doing are exactly the patterns that software engineering has formalized over decades—decomposition, validation at boundaries, structured interfaces, and risk-first prototyping. This is not a coincidence: these methods exist because they solve real coordination problems, and those problems do not disappear when the developer is an AI agent. The value of this chapter is not that we discovered new principles, but that we experienced firsthand why the established ones matter.

Starting with viability rather than optimization proved essential. The HDMI Babelfish prototype was built in three hours and did not run in real time, but it proved that the architecture was sound and enabled us to pursue Version 2 with confidence. This is the agile development principle from Chapter 7 applied directly: validate the concept before investing in production quality. Similarly, the fact that hardware and integration challenges dominated development time—not algorithm implementation—is exactly what the requirements and architecture chapters predict: the hardest constraints are often at the system boundaries, not inside individual components.

The role of structured libraries and APIs maps directly to the architectural patterns from Chapter 10. PyPulseq, OpenCV, and Tesseract all constrain the solution space in ways that make AI-generated code more reliable—the same principle that makes well-designed interfaces valuable for human developers. Validation strategy turned out to be the decisive factor in the MRI case: the Agent4MR framework showed that physics-aware feedback loops, not better models, made the difference between near-correct and artifact-free sequences. This is the testing and quality-assurance discipline from Chapters 13 and 15, applied to AI-generated artifacts rather than human-written code.

Programming is a skill learned by doing, and this is exactly what we did in this chapter. The experience confirms that awareness of software engineering methods does not replace the need to practice them—but it does help recognize the right patterns when they appear in new contexts.

## Conclusion

The projects in this chapter document the transition from prompt engineering to vibe coding through real constraints. We deliberately built on open-source libraries—OpenCV, Tesseract, NLLB, PyPulseq—that are well-suited for AI-assisted development because they are well-documented, locally deployable, and free of per-inference cost. This choice matters: while vision-language models and cloud APIs can achieve similar functionality, their runtime cost makes them impractical for edge deployment and real-time applications.

The HDMI Babelfish demonstrates this across a full stack, from hardware constraints through real-time signal processing to neural model deployment—evolving from a three-hour prototype to an ICME-accepted real-time system running at 33.5 FPS on an edge device. The Agent4MR project demonstrates that AI coding assistance extends well beyond standard libraries: when specialized packages like PyPulseq and MR-zero provide structured APIs and physics-aware validation closes the loop, LLMs consistently produce artifact-free MRI sequences—and can even conduct autonomous research by iteratively refining sequences toward a target contrast.

The broader message is that vibe coding is partnership coding. Humans provide architecture, validation strategy, and final responsibility; LLMs provide rapid scaffolding and code synthesis. The projects were not fully vibe coded, but they show clearly where the boundary was in 2024–2025 and how quickly it is moving.

## Exercise Problems

The following exercises ask you to design and plan complete vibe coding projects using the methods presented throughout this book.

**Exercise Problem 1.** How would you implement HDMI Babelfish today, using the full vibe coding workflow presented in this book?

*Instruction.* The original project was built with heavy manual coding assistance during 2024–2025. Today, with agentic coding tools, markdown-based skills, and CI/CD pipelines, many of the manual steps could be automated. Design a project plan that uses the methods from Chapters 11–15: define SMART objectives, create markdown skill documents for each pipeline stage, specify quality gates and test cases, and plan the software process.

*Example task.* Phase 1: Write a markdown skill for an agent to set up HDMI capture using OpenCV, including error handling for missing devices. Phase 2: Write a skill for text detection using YOLOv11-nano with a custom JRPG dataset, including training and evaluation steps. Phase 3: Write a skill for OCR with Tesseract and translation with a fine-tuned Marian OPUS model, including a similarity-based cache for repeated dialogue. Phase 4: Write a skill for overlay rendering with adaptive color selection. Define continuous integration (CI) tests for each phase. Estimate how much of the original three-hour prototype plus months of V2 development could be compressed with an agentic workflow, and identify which parts still require human expertise.

**Exercise Problem 2.** Design a "virtual presence device" based on the OpenBot platform (<https://www.openbot.org>).

*Instruction.* OpenBot converts a standard Android smartphone into a low-cost robot platform with wheels, sensors, and camera access. Design a system that enables remote virtual presence: a user connects from a web browser, sees the robot's camera feed, and can steer it through a room. Plan the architecture using the decomposition principles from this chapter: identify the major components (video streaming, motor control, user interface, network communication), define interfaces between them, and specify which parts an AI coding agent can implement and which require hardware integration work.

*Example task.* Phase 1: Set up the OpenBot hardware and verify basic motor control from the smartphone app. Phase 2: Implement a WebRTC video stream from the phone camera to a browser client. Phase 3: Add browser-based steering controls that send motor commands back to the robot via a WebSocket connection. Phase 4: Add autonomous obstacle avoidance using the phone's depth sensor or ultrasonic sensors, so the remote user cannot drive the robot into walls. Write markdown skills for each phase, define test cases for latency and video quality, and identify the hardware constraints that—as in the HDMI Babelfish case—will likely dominate development time.

**Exercise Problem 3.** Design a "3D copy machine for human figures" that reconstructs a printable 3D mesh from a single photograph.

*Instruction.* PLIKS (Pseudo-Linear Inverse Kinematic Solver) reconstructs a full 3D mesh of the human body from a single 2D image by combining a linearized formulation of a parametric body model with pixel-aligned 2D vertex predictions [Shetty 2023]. The output is a posed, shaped 3D mesh that can be exported as an STL file for 3D printing. Design a complete pipeline from smartphone photo to printed figurine.

*Example task.* Phase 1: Set up the PLIKS inference pipeline from the public repository (<https://github.com/karShetty/PLIKS>). Run it on sample images and export the resulting mesh as OBJ or STL. Phase 2: Add a post-processing step that prepares the mesh for 3D printing: close open surfaces, add a flat base for stability, and scale to the desired figurine height. Phase 3: Build a simple web interface where a user uploads a photo and receives a downloadable STL file. Phase 4: Slice the STL using an open-source slicer and print on a standard FDM printer. Write markdown skills for each phase, define quality gates for mesh integrity, and document which steps the agent can handle fully and where human review of the 3D geometry is needed.

## Bibliography

- [Bradski 2000] Bradski, G. *The OpenCV Library.* Dr. Dobb's Journal of Software Tools, 25(11):120–123, 2000.
- [Chowdhury 2026] Chowdhury, M. R., Maier, A. *HDMIBabelfish: Latency-Aware Real-Time Translation of Japanese Role-Playing Games on Edge Devices.* 2026 IEEE International Conference on Multimedia and Expo (ICME), 2026. In press.
- [Endres 2024] Endres, J., Weinmüller, S., Glang, F., Loktyushin, A., Herz, K., Zaiss, M. *Phase Distribution Graphs for Fast, Differentiable, and Spatially Encoded Bloch Simulations of Arbitrary MRI Sequences.* Magnetic Resonance in Medicine, 92(3):1189–1204, 2024.
- [Layton 2017] Layton, K. J., Kroboth, S., Jia, F., Littin, S., Yu, H., Leupold, J., Nielsen, J.-F., Stöcker, T., Zaitsev, M. *Pulseq: A Rapid and Hardware-Independent Pulse Sequence Prototyping Framework.* Magnetic Resonance in Medicine, 77(4):1544–1552, 2017.
- [Loktyushin 2021] Loktyushin, A., Herz, K., Dang, N., Glang, F., Deshmane, A., Weinmüller, S., Doerfler, A., Schölkopf, B., Scheffler, K., Zaiss, M. *MRzero—Automated Discovery of MRI Sequences Using Supervised Learning.* Magnetic Resonance in Medicine, 86(2):709–724, 2021.
- [Loktyushin 2024] Loktyushin, A., Glang, F., Herz, K., Weinmüller, S., Zaiss, M. *MR-zero Core: A Framework for MRI Sequence Optimization and Simulation.* Python package, 2024. <https://mrsources.github.io/MRzero-Core/>
- [Maier 2018] Maier, A., Steidl, S., Christlein, V., Hornegger, J. *Medical Imaging Systems: An Introductory Guide.* Springer, LNCS 11111, 2018.
- [NLLB Team 2022] NLLB Team, Costa-jussà, M. R., Cross, J., Çelebi, O., et al. *No Language Left Behind: Scaling Human-Centered Machine Translation.* arXiv preprint arXiv:2207.04672, 2022.
- [PRLab-FAU 2025] PRLab-FAU. *HDMIBabelfish — HDMI-based Real-Time Game Translation System.* 2025. <https://github.com/PRLab-FAU/HDMIBabelfish>
- [Ravi 2019] Ravi, K. S., Geethanath, S., Vaughan, J. T. *PyPulseq: A Python Package for MRI Pulse Sequence Design.* Journal of Open Source Software, 4(42):1725, 2019.
- [Shetty 2023] Shetty, K., Birkhold, A., Jaganathan, S., Strobel, N., Kowarschik, M., Maier, A., Egger, B. *PLIKS: A Pseudo-Linear Inverse Kinematic Solver for 3D Human Body Estimation.* IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2023.
- [Smith 2007] Smith, R. *An Overview of the Tesseract OCR Engine.* Ninth International Conference on Document Analysis and Recognition (ICDAR), pp. 629–633, 2007.
- [Zaiss 2024] Zaiss, M., Rajput, J. R., Dang, H. N., Golkov, V., Cremers, D., Knoll, F., Maier, A. *Exploring GPT-4 as MR Sequence and Reconstruction Programming Assistant.* Bildverarbeitung für die Medizin 2024, p. 94, Springer, 2024.
- [Zaiss 2025b] Zaiss, M. *MR Physicist's Last Exam — LLM4MR.* MRT-Forschung am Universitätsklinikum Erlangen, March 2025. <https://www.mr-physik.med.fau.de/2025/03/03/mr-physicists-last-exam-llm4mr/>
- [Zaiss 2026] Zaiss, M., Aly, A., Endres, J., Dornstetter, T., Weinmüller, S., Maier, A. *Agentic MR Sequence Development: Leveraging LLMs with MR Skills for Automatic Physics-Informed Sequence Development.* arXiv:2604.13282, 2026. <https://arxiv.org/abs/2604.13282>

## Source

This chapter is derived from the *Vibe Coding* book (Maier et al., Springer, CC BY, <https://link.springer.com/book/9783032399069>), chapter source `vhb_vibe_coding/VIBE_16_Examples/chapter.tex`. It is part of the VHB course *Vibe Coding*: <https://www.studon.fau.de/studon/ilias.php?baseClass=ilrepositorygui&ref_id=6720901>
