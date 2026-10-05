# 10. Review on GitHub Pages: the main page

**The change.** Five requirements are added after `THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE`, which says what the
main page is for; they say how it is arranged and how it looks. Every other requirement of the section is carried over
byte for byte.

**Why.** PO decision, 2026-10-05: the building can be observed on the dashboard; the main page at the root follows the
requirements-engineering-driven software process — requirements, use cases, architecture, implementation, testing,
releases, with maintenance (issue tracker, mail handling) and settings in the menu —, has a welcoming, simple design and
an overview of the current progress of the products directly on the main page; while Agent M has no products, the status
of Agent M's own implementation is shown as a progress bar, at 100 % with the first release; the design reflects the
design and colours of https://lme.tf.fau.de, with the lab's logo and icon.

- The stage bar is an overview across products and does not replace the model's own measure on the process dashboard
  (`PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`, UC-035).
- The colours are those lme.tf.fau.de declares in its theme (FAU-Elemental, faculty TF), read on 2026-10-05:
  `--FAU-Col-FAU-Blau-100: #04316a`, `--FAU-Col-FAU-Dunkelblau-100: #041e42`, `--FAU-Col-TF-Metallic-100: #8c9fb1`.
- The Pattern Recognition Lab's logo is used with the lab's consent; it is not covered by Agent M's MIT licence.

**Impact list.** Five new requirements; no artifact names them yet. The new UC-046 "See what goes on in the instance" names
them in the same push, open for review; it can be accepted once this queue is.
