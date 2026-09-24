# §15: product resources

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

## Open questions of the drafting group

1. **Identifier for a resource entry.** Jobs and tests refer to resources, so an entry needs a
   stable name. `EVERY ARTIFACT HAS AN IDENTIFIER` fixes the scheme `SRC- REQ- UC- ARC- MOD- TST-`.
   Add `RES-`? That is a change to an existing requirement and needs its impact list. The drafts use
   a short slug per entry (`alex-gpu`) until this is decided.
2. **Package-manager dependencies.** Should libraries already pinned by the product's lock file
   (`package-lock.json`, `uv.lock`, …) also appear in `docs/resources.md`? A possible rule —
   *PACKAGE DEPENDENCIES STAY IN THE LOCK FILE: a dependency pinned by the product's package
   manager is read from the lock file and never declared a second time* — avoids two lists drifting
   apart. Not proposed as a requirement because the brief does not decide it.
3. **Per product or per instance?** Participants are configured once per instance
   (`PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`); a SLURM cluster is also shared by several
   products. The draft keeps resources per product (self-sufficiency: the product's repository must
   say what it runs on without the instance). Alternative: an instance register of compute and
   endpoints, linked per product like sources. Which?
4. **Pinning compute.** Hardware has no version; the software environment on it (container image
   digest, module list) does. Should a `compute` entry pin an environment, or does that belong in
   the product's job scripts?
5. **Hugging Face from the browser.** Whether the Hub API answers cross-origin requests from a Pages
   origin (and for gated models with a token) is **not measured**. UC-040 therefore offers a manual
   revision entry as fallback. `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` asks for a dated
   measurement before this route is released.
6. **Restricted content reaching a resource.** `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE
   PERMITS` names participants only. Should it be extended to resources (a job sending a restricted
   norm's text to a compute resource)? That would be a change to an existing requirement.
7. **Read access to private dependencies.** A private dependency repository must be readable by
   the person's token; `A TOKEN IS SCOPED TO WHAT IT WRITES` constrains write access only. Is
   read-only access to additional repositories acceptable in the same token, or should a separate
   read-only token be asked for?
8. **File name of UC-015.** The title becomes "Link requirement sources to a product". Rename the
   file to `UC-015-link-requirement-sources-to-a-product.md` (references use the ID, so nothing
   breaks), or keep the old slug?

**Decided by the PO on 2026-09-24** — see the table on the queue's index page; the questions below that it answers are settled, the others stay open.
