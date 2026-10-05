# The text of a source version in six runtimes, and what the vendored files request

**MESSUNG** — 2026-10-05, macOS 26.6.2, Node 25.9.0, Deno 2.9.7, Playwright with Chrome 154.0.8037.93, Firefox 155.0
and WebKit 26.6, poppler 26.04.0, mammoth 1.13.0. Run 1 from 07:29:18 to 07:29:31 UTC, run 2 at 07:33 UTC. It records
the text, the headings, the excerpts and the refusals the reference implementation of `MOD-source-text` gives in each
runtime, two cross-checks, pdf.js's two builds in Node, the AI Act's outline, how the vendored files name `fetch` and
which request channels the check of `NO SERVER` finds in them, and the line diff of the passages that changed (ARC-036
decisions 3 to 9; ARC-032 decision 13; ARC-003 decision 7).

## Method

**What was run.** The scripts named here lie in the session's scratchpad, `S/bst`, and are not committed.
`impl/source-text.mjs` of batch bst with its vendored files — pdf.js 6.4.299's
`legacy/build/pdf.min.mjs` and `pdf.worker.min.mjs`, fflate 0.8.3's `esm/browser.js` —, the same bytes as the packages'
(below). One module of cases, `measure/text-cases.mjs`, is run by each runtime with that runtime's own reader of files:
`measure/run-node.mjs` (Node, `node:fs`), `measure/run-deno.mjs` (Deno, `Deno.readFile`; once run, once compiled), and
`measure/browser.html` served on loopback by `browser/run-browsers.mjs` (`fetch` of the page's own files). For each case it
returns the SHA-256 of each text, its characters, lines and headings, the SHA-256 of its headings, what has no text, each
part's sections and scope or its refusal, and the milliseconds the reading took. `measure/same.mjs` gives one digest per
runtime: the first 16 hexadecimal digits of the SHA-256 of the JSON of every case with its milliseconds left out.

**The cases.** The AI Act's PDF, with eight parts; a Word file, its PDF and its Word 97–2003 file, each with its parts; a
zip archive of them with a Markdown file, an image and the `.doc`; a file whose bytes are not those its version records;
and a repository of those files at two commits — its trees' blobs computed in the runtime with `crypto.subtle` (SHA-1 over
`blob <n>\0` and the bytes) —, read whole, by the folder `docs/rules` and by `docs/rules/lab-rules.docx / Protection`,
read between its commits, and given a file whose bytes are not its blob's.

**The files read.** The AI Act's PDF was fetched on 2026-10-04 at 22:45:41 UTC from
`https://publications.europa.eu/resource/celex/32024R1689` with `Accept: application/pdf` and `Accept-Language: eng`; the
server answered `303` to `http://publications.europa.eu/resource/cellar/dc8116a1-3fe6-11ef-865a-01aa75ed71a1.0006.01/DOC_1`,
which answered `200` with the PDF. The other four were made on 2026-10-04 at 22:59 UTC by `measure/make-files.sh`:
`lab-rules.docx` with python-docx 1.2.0 (headings at three levels, a tab, a break within a paragraph, a table),
`lab-rules.pdf` from it by LibreOffice 26.2.3.2 (`soffice --headless --convert-to pdf`), `lab-rules.doc` by macOS's
`textutil -convert doc`, and `lab-guide.zip` by Python 3.14.6's `zipfile`. As read for this run:

```
files/32024R1689.pdf 2583319 bytes, SHA-256 bba630444b3278e881066774002a1d7824308934f49ccfa203e65be43692f55e
files/lab-rules.docx 37015 bytes, SHA-256 2171d390bd7a468d5ee4e6744b9362097aba69572663cb3016b54cbeaa576275
files/lab-rules.pdf 29624 bytes, SHA-256 4ccda6c69126ff478684eb0682f78c919f5141f7ec67c314f82bff4609b6e927
files/lab-rules.doc 19456 bytes, SHA-256 fc06da55254e16b5d6873e0789fcb9e11a077c5816b3f067d70723358213e961
files/lab-guide.zip 55747 bytes, SHA-256 a629538011376ad74f5a88f7dfa1cfff787f91f120a0af5eb39ce19aa64aba27
files/32024R1689.pdf: Creator: Servigistics Arbortext Publishing Engine;Producer: PDFlib+PDI 9.0.7p3 (C++/Win64);Pages: 144;
files/lab-rules.pdf: Creator: Writer;Producer: LibreOffice 26.2.3.2 (AARCH64);Pages: 1;
files/lab-rules.docx: <dc:creator>python-docx <cp:revision>1 
files/lab-rules.doc: Composite Document File V2 Document, Little Endian, Os: MacOS, Version 10.4, Code page: -535, Author: python-docx, Comme
files/lab-guide.zip: 1-intro.md 2-rules.docx 3-rules.pdf images/ images/logo.png old/rules-2019.doc 
```

```
vendor/pdf.min.mjs 523774 bytes, SHA-256 bccc24ea711db8e44503629519904a5292d73b9daaa214bbe7cdcc282b0f4259, the same bytes as pkgs/pdfjs-dist-6.4.299/package/legacy/build/pdf.min.mjs
vendor/pdf.worker.min.mjs 1321307 bytes, SHA-256 145d2dd3ab0c86151011dba95acfa2d5336e2accd59388ea43dbee0efddaaec6, the same bytes as pkgs/pdfjs-dist-6.4.299/package/legacy/build/pdf.worker.min.mjs
vendor/fflate.browser.mjs 90922 bytes, SHA-256 b7ca4450b19559a1d50eb381adcee94b82449674be4cd17789d9beba7e6122a1, the same bytes as pkgs/fflate-0.8.3/package/esm/browser.js
```

**The commands**, run from `S/bst` by `measure/record.sh`, whose output is copied below unchanged:

```
cd measure && node run-node.mjs node
../tools/deno run --allow-read --allow-write run-deno.mjs deno
../tools/deno compile --allow-read --allow-write -o ../tmp/measure-compiled run-deno.mjs && ../tmp/measure-compiled compiled
cd .. && PLAYWRIGHT_BROWSERS_PATH=browser/ms-playwright node browser/run-browsers.mjs
cd measure && node same.mjs
node crosscheck.mjs
node builds.mjs build files/lab-rules.pdf files/32024R1689.pdf; node builds.mjs legacy/build files/lab-rules.pdf files/32024R1689.pdf
node outline.mjs files/32024R1689.pdf 100
python3 vendor-channels.py <S/main17> <the six vendored files>
node --expose-gc diff-peak.mjs old; node --expose-gc diff-peak.mjs new; node diff-random.mjs 3000 1
```

`crosscheck.mjs` compares the text of `lab-rules.pdf`, its form-feed lines set aside, with poppler's
`pdftotext -raw -enc UTF-8` line for line, and the text of `lab-rules.docx` with mammoth's `extractRawText`, whose
paragraphs stand between blank lines. `builds.mjs` reads a PDF with one of pdf.js's two builds per process.
`vendor-channels.py` imports `tests/test_no_backend.py` of agent-m's main at 72074e8 read-only and counts, in each file,
the matches of that check's own patterns of a request channel (`CHANNELS`), beside the word `fetch`, the calls `.fetch(` on
an object, and the methods named `fetch`. `diff-peak.mjs` derives the AI Act's text, makes a copy with three changes far
apart — line 301 amended, line 3201 removed, line 6001 replaced —, and takes the growth of the peak resident memory and the
time of one `MOD-source-library.changedPassages` call, by the full table of S/bsl2 (`old`, main16's ARC-032) or by this
batch's diff (`new`). `diff-random.mjs` gives both diffs 3 000 pairs of random texts of up to 30 lines of seven letters,
the newer made by removing, changing and adding lines (seed 1).

## Results

The record's first and last lines:

```
== start 2026-10-05T07:29:18Z; macOS 26.6.2; node v25.9.0; deno 2.9.7 (stable, release, aarch64-apple-darwin); pdftotext version 26.04.0
== end 2026-10-05T07:29:31Z
```

**Six runtimes.** The digest of every case, its milliseconds left out, and the milliseconds the AI Act and the repository
read whole took:

```
node      9974c03b5f49e05d ai-act 468 ms repository 16 ms
deno      9974c03b5f49e05d ai-act 398 ms repository 12 ms
compiled  9974c03b5f49e05d ai-act 445 ms repository 12 ms
chrome    9974c03b5f49e05d ai-act 352 ms repository 11 ms
firefox   9974c03b5f49e05d ai-act 610 ms repository 14 ms
webkit    9974c03b5f49e05d ai-act 382 ms repository 17 ms
```

Each browser page asked only its own origin:

```
chrome requests: 16 to another origin: [] page errors: 0
firefox requests: 16 to another origin: [] page errors: 0
webkit requests: 16 to another origin: [] page errors: 0
```

The compiled program embedded:

```
Embedded Files

measure-compiled
├── impl/source-text.mjs (24.13KB)
├─┬ measure (7.89KB)
│ ├── run-deno.mjs (545B)
│ └── text-cases.mjs (7.35KB)
└─┬ vendor (1.85MB)
  ├── fflate.browser.mjs (88.79KB)
  ├── pdf.min.mjs (511.5KB)
  └── pdf.worker.min.mjs (1.26MB)

Files: 1.88MB
Metadata: 1.39KB
Remote modules: 12B

exit 0
```

**The cases**, as Node gave them — each runtime gave the same, by the digest above:

```
ai-act: 32024R1689.pdf 595993 characters, 6391 lines, 172 headings, levels 1/2/3; no text: none
  part "Article 5": 32024R1689.pdf:2623-2733 CHAPTER II / Article 5
  part "CHAPTER III / SECTION 1": 32024R1689.pdf:2736-2828 CHAPTER III / SECTION 1
  part "Article 113": 32024R1689.pdf:5754-5774 CHAPTER XIII / Article 113
  part "ANNEX III": 32024R1689.pdf:5867-5955 ANNEX III
  part "CHAPTER XIII": 32024R1689.pdf:5537-5774 CHAPTER XIII
  part "Article 49": refused several-parts
  part "SECTION 1": refused several-parts
  part "safety class B": 32024R1689.pdf:1-6391 ; scope ["safety class B"]
lab-rules-pdf: lab-rules.pdf 360 characters, 14 lines, 5 headings, levels 1/2; no text: none
  part "Protection / Eyes": lab-rules.pdf:6-7 Protection / Eyes
lab-rules-docx: lab-rules.docx 360 characters, 16 lines, 5 headings, levels 1/2; no text: none
  part "Protection": lab-rules.docx:5-10 Protection
  part "Protection / Eyes": lab-rules.docx:6-7 Protection / Eyes
  part "Reporting": lab-rules.docx:11-16 Reporting
lab-rules-doc: ; no text: lab-rules.doc word-97
lab-guide-zip: lab-guide.zip/1-intro.md 101 characters, 7 lines, 2 headings, levels 1/2; lab-guide.zip/2-rules.docx 360 characters, 16 lines, 5 headings, levels 1/2; lab-guide.zip/3-rules.pdf 360 characters, 14 lines, 5 headings, levels 1/2; no text: lab-guide.zip/images/logo.png other-kind, lab-guide.zip/old/rules-2019.doc word-97
  part "lab-guide.zip/1-intro.md": lab-guide.zip/1-intro.md:1-7 
  part "Booking": lab-guide.zip/1-intro.md:5-7 Lab guide / Booking
  part "Protection": refused several-parts
  part "lab-guide.zip/2-rules.docx / Protection": lab-guide.zip/2-rules.docx:5-10 Protection
changed-bytes: refused changed
repository "": read README.md, docs/rules/lab-rules.docx, docs/rules/lab-rules.pdf; named docs/old/lab-rules.doc word-97, tools/measure.py other-kind; excerpt README.md:1-3  | docs/rules/lab-rules.docx:1-16  | docs/rules/lab-rules.pdf:1-14 
repository "docs/rules": read docs/rules/lab-rules.docx, docs/rules/lab-rules.pdf; named none; excerpt docs/rules/lab-rules.docx:1-16  | docs/rules/lab-rules.pdf:1-14 
repository "docs/rules/lab-rules.docx / Protection": read docs/rules/lab-rules.docx; named none; excerpt docs/rules/lab-rules.docx:5-10 Protection
repository, two commits: read in the older README.md, in the newer README.md; named docs/rules/lab-guide.zip other-kind, tools/measure.py other-kind; texts README.md / README.md
repository, bytes not the blob's: refused changed
```

**Cross-checks.**

```
{"check":"lab-rules.pdf against pdftotext -raw","lines":14,"popplerLines":14,"differing":0,"first":[]}
{"check":"lab-rules.docx against mammoth.extractRawText","mammothVersion":"1.13.0","paragraphs":15,"ourLines":16,"notOneToOne":[{"paragraph":"Wear gloves when handling samples.Change them after each sample.","ourLines":["Wear gloves when handling samples.","Change them after each sample."]}]}
```

**pdf.js 6.4.299's two builds in Node 25.9.0.** The build of `build/` printed "Warning: Please use the `legacy` build in
Node.js environments." and stopped on the PDF LibreOffice wrote; on the AI Act's PDF both builds gave the same text:

```
Warning: Please use the `legacy` build in Node.js environments.
{"build":"build","file":"files/lab-rules.pdf","error":"s.getOrInsertComputed is not a function"}
{"build":"build","file":"files/32024R1689.pdf","pages":144,"chars":595849,"sha256":"0592c830c9e6565e"}
{"build":"legacy/build","file":"files/lab-rules.pdf","pages":1,"chars":359,"sha256":"016cf40db8f9bf61"}
{"build":"legacy/build","file":"files/32024R1689.pdf","pages":144,"chars":595849,"sha256":"0592c830c9e6565e"}
```

**The AI Act's outline**, as pdf.js gives it: the act at depth 0 and its thirteen annexes at depth 1,

```
entries: 14
```

**`fetch` and the request channels in the vendored files.** `mermaid.min.js`, `marked.esm.js` and `purify.es.mjs` as agent-m
main holds them under `docs/assets/vendor/`. The check's patterns find in `mermaid.min.js` exactly the three channels
its list permits there (`Worker`, a loading element, `@import`), which shows that they find a channel where one stands
(CLAUDE.md §6a.2):

```
pdf.min.mjs: word fetch 4, .fetch( 1, fetch(…){ 1; channels of test_no_backend.py: fetch 3, XMLHttpRequest 3, Worker 1, import() 2, loading element 2, url() 4
pdf.worker.min.mjs: word fetch 38, .fetch( 30, fetch(…){ 2; channels of test_no_backend.py: fetch 3, XMLHttpRequest 1, import() 1, url() 4
fflate.browser.mjs: word fetch 0, .fetch( 0, fetch(…){ 0; channels of test_no_backend.py: Worker 1
mermaid.min.js: word fetch 28, .fetch( 27, fetch(…){ 1; channels of test_no_backend.py: Worker 1, loading element 1, @import 1
marked.esm.js: word fetch 0, .fetch( 0, fetch(…){ 0; channels of test_no_backend.py: 
purify.es.mjs: word fetch 0, .fetch( 0, fetch(…){ 0; channels of test_no_backend.py: 
```

**The line diff.**

```
{"diff":"old","ms":232,"peakRssGrowthMB":238,"passages":3}
{"diff":"new","ms":145,"peakRssGrowthMB":1,"passages":3}
{"pairs":3000,"seed":1,"sameNumberOfLines":3000,"rebuiltTheNewer":3000,"identicalPassages":1365}
```

**Run 2**, 07:33 UTC: whether the runtime has the method pdf.js's `build/` calls, and lines of the AI Act's text around
its designations, by `measure/lines.mjs`, which prints given lines of the text `MOD-source-text` derives of a file:

```
node -e 'console.log("node", process.version, "Map.prototype.getOrInsertComputed:", typeof Map.prototype.getOrInsertComputed)'
../tools/deno eval 'console.log("deno", Deno.version.deno, "Map.prototype.getOrInsertComputed:", typeof Map.prototype.getOrInsertComputed)'
node lines.mjs files/32024R1689.pdf 2734-2739 5867-5868
```

```
== run 2 start 2026-10-05T07:33:16Z
node v25.9.0 Map.prototype.getOrInsertComputed: undefined
deno 2.9.7 Map.prototype.getOrInsertComputed: function
2734: CHAPTER III
2735: HIGH-RISK AI SYSTEMS
2736: SECTION 1
2737: Classification of AI systems as high-risk
2738: Article 6
2739: Classification rules for high-risk AI systems
5867: ANNEX III
5868: High-risk AI systems referred to in Article 6(2)
== run 2 end 2026-10-05T07:33:16Z
```

## What it settles

- **ARC-036 decision 9.** Node 25.9.0, Deno 2.9.7 run and compiled, Chrome 154.0.8037.93, Firefox 155.0 and WebKit 26.6 gave
  the same texts, headings, excerpts, scopes, files read and refusals of every case above. The AI Act's text has 595 993
  characters in 6 391 lines with 172 headings, at levels 1, 2 and 3, and took 0.35 s to 0.61 s. Not measured: another
  PDF, a PDF whose fonts need pdf.js's character maps, a repository on a server — its trees and blobs were computed here.
- **ARC-036 decisions 3 to 7.** The text of the PDF LibreOffice wrote has the lines of `pdftotext -raw`; the text of the
  Word file has mammoth's paragraphs, and keeps as two lines the one paragraph whose break mammoth's raw text drops. The
  AI Act's outline names the act and its thirteen annexes and no chapter, section or article; in its text "CHAPTER III",
  "SECTION 1", `Article 6` and "ANNEX III" each stand alone on a line, a title on the line after it (run 2); its parts
  resolve as listed, `safety class B` as the scope of the whole text.
- **ARC-036 decision 8.** Each browser page requested its own page, modules, vendored files and the files it read — 16
  requests — and nothing on another origin. The compiled bridge program embedded the module and the vendored files,
  1.88 MB. pdf.js's `build/` does not read the PDF LibreOffice wrote in Node 25.9.0, which has no
  `Map.prototype.getOrInsertComputed` — Deno 2.9.7 has it (run 2) —; `legacy/build/` reads it, and gives the AI Act's text
  that `build/` gives.
- **ARC-003 decision 7.** `mermaid.min.js` names `fetch` 28 times: 27 calls `.fetch(` on an object and one method named
  `fetch`, and the check's pattern of a `fetch` call matches none of them. In pdf.js's two files that pattern matches 3
  times each — methods named `fetch` with parameters among them, which the pattern takes for calls —, and the check of
  `NO SERVER` finds 24 request channels in them, 15 in `pdf.min.mjs` and 9 in `pdf.worker.min.mjs`, and one, a `Worker`,
  in fflate's file. Read in fflate 0.8.3's file: its `Worker` stands in `wk`, which only `cbify` and `astrmify` reach — the
  asynchronous functions and stream classes —, and `unzipSync` names neither. Not measured here: what each of pdf.js's
  channels does when it runs.
- **ARC-032.** On the AI Act's text, the full table raised the peak resident memory of a fresh Node 25.9.0 process by
  238 MB in 232 ms, the diff in memory that grows with the texts' length by 1 MB in 145 ms, with 3 passages each. On 3 000
  pairs of random texts both gave the same number of removed and added lines, the new one's passages rebuilt the newer
  text every time, and 1 365 gave the same passages.
