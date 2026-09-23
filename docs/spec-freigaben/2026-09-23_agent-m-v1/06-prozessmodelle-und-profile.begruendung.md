# Why models are data and profiles are overlays

The Product Owner asked for selection of standard SE models and pointed at the book. The book has
them, and it also has the framing that makes the design decision: Boehm and Turner's reading that
choosing between plan-driven and agile is a risk-balancing exercise rather than a religious war
about methodology. Chapter 6 states it and chapter 7 repeats it from the other side — large-scale
agility usually ends up embedded in a plan-driven frame, and that is a recognition rather than a
betrayal.

Two design consequences follow.

**Models as data, because the catalogue is open.** Nine models ship, but the interesting reader is
the one who brings a tenth — an internal process, a customer's mandated lifecycle, a variant of
Scrum their organisation actually runs. If a model is a code path, the tenth is a pull request
against Agent M. If it is a data file, the tenth is a data file. The check is written as a
mutation-style guard for the same reason as the one in §2: the only reliable way to keep a
catalogue generic is a test that fails when a model name is hard-coded.

**Profiles as overlays, because the alternative forces a false choice.** The obvious modelling
would be to treat "IEC 62304 class C" as another entry in the catalogue. It is the wrong shape.
Chapter 6's regulated-software section describes a company that spends most of a person-year on
process definition, documentation templates, traceability rules and approval paths — but it does
not describe them abandoning their development rhythm. The regulation adds obligations to the
rhythm. Modelling it as a separate model would make the reader choose between working the way
their team works and satisfying their auditor, which is not a choice anyone actually has.

The overlay shape also makes the cost visible, which is the honest thing to do. A reader who
switches on class C sees exactly which additional artifacts appeared and can decide whether the
project really needs them. A reader who picks a monolithic "regulated" model sees a wall of
requirements and no way to tell which came from the regulation and which from the process.

**What the gate rule is guarding against.** The failure mode here is a workflow with stage
transitions that look like gates and check nothing — a pause where somebody clicks continue. The
book's account of the V-model is specific that its contribution is the horizontal arrows: whenever
something is defined on the way down, one should already know how it will be checked on the way
up. A gate that does not name its artifacts and its condition has lost the arrow and kept the
diagram.

**Honest limitation:** Agent M can express these models and enforce their gates. It cannot make a
team follow one, and the book's own conclusion applies — process quality, not code speed, is what
sustained performance depends on. The tool lowers the cost of discipline; it does not supply it.
