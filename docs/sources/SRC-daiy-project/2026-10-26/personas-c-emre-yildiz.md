# Persona C, Emre Yildiz — extract

From `docs/Personas_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `1dbaf9aeb28710b8860f20153f4c6b827f10dbeff2a6ebb62890ec202fd98732`, not stored here.

Sections kept: Persona C. The text is the original's, unchanged.

---

## Persona C · Emre Yildiz — the budget-conscious student
*Author: vegas1337 (first drafted as "Lukas Brandt"; "David" on the slides)*

> "I want to make my room look great without spending all my money. Just show me what I can build myself, what I actually need, and how to do it without messing things up."

### Profile

| Attribute | Value |
|---|---|
| Age | 22 |
| Housing | Just moved into a small, mostly empty room in a shared flat in Erlangen |
| Occupation | University student with a part-time job |
| Monthly budget | €850–1,100 (student job and family support) |
| Room makeover budget | €50–100 in total |
| Technical affinity | High with apps, social media and online marketplaces |
| Time | Weekends, between lectures, studying and work |

### Skill profile (FR-10)

| Area | Level |
|---|---|
| Woodwork, furniture | Beginner (assembles basic furniture) |
| Painting, walls | None |
| Plumbing | None |
| Electrical | None |
| Network, smart home | Beginner |
| Heating | None |

### Inventory (FR-11, FR-12)

- Tools: none of his own. A flatmate has a cordless drill.
- Materials: an old shelf and a few boxes from his parents' cellar.

### Goals

- Furnish and improve his room for as little money as possible.
- Turn an impersonal room into a comfortable place to relax, study and sleep.
- Learn to build and fix things himself.
- Reuse items, buy second-hand, and buy only essential materials.
- Avoid damaging the rented room or buying the wrong materials.

### Frustrations

- New furniture, tools and decoration are too expensive. He needs to know what he can reuse or get for free.
- He does not know which materials, tools, measurements or construction methods fit a project.
- He spends hours on second-hand listings and tutorials without knowing which solutions are suitable.
- He worries about wasting money, buying incompatible parts or building something unsafe.

### Usage context

- Searches YouTube, TikTok, Pinterest and forums for cheap room ideas.
- Looks for used furniture on Kleinanzeigen and in local student groups.
- Prefers projects with basic tools and little experience; compares prices before buying anything new.
- Needs clear instructions rather than long technical explanations.

### What the app must do for Emre

- Accept a photo of his room or a short description and ask only the essential follow-up questions (FR-01, FR-02).
- Use what he already owns before suggesting purchases (FR-11, SUS-07).
- Compare DIY, second-hand and new options with an estimated total cost, and say which prices or fits still need checking (FR-04, FR-05, SUS-02, AIR-06).
- List missing tools separately with a rent-or-borrow hint (FR-12).
- Give beginner instructions with shopping list, numbered steps, time, tools and warnings, and let him tick off steps and ask for help (FR-03, FR-07).
- Respect his budget and warn when a build is not safe for its use, e.g. furniture he sleeps on (see Gaps, G2).

### User journey

Emre wants a desk and storage for his room but has only €60.

1. **Describe:** "I need a desk and some storage, but I don't want to spend more than €60."
2. **Answer a few questions:** available space, desk dimensions, experience, tools and materials he owns.
3. **Get options:** a simple DIY desk, a suitable second-hand desk, and a low-cost combination of reused shelves and storage boxes.
4. **Compare total costs:** which parts are free, which must be bought, where prices or compatibility still need checking.
5. **Build with guidance:** clear steps, ticks them off, asks when stuck.
6. **Finish:** a working desk within budget, and confidence for the next project.
