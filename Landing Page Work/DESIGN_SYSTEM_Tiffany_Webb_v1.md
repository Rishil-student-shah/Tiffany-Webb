# TIFFANY WEBB — MASTER DESIGN SYSTEM v1.0
### The single visual source of truth for every deliverable.
**Upload this to BOTH the Designer chat and the Tech chat. Register it inside Claude Design. Never create a competing system.**

> **Version note:** This is **v1 (Foundations)**. The logo does not exist yet (roadmap Step 12). Section 9 holds the rules the logo must satisfy; once it's designed, this becomes v2. Everything else here is final and buildable today.

> **Scope:** This system covers ALL deliverables — landing page, Media Kit, Capability Kit, one-sheet, Instagram, LinkedIn, and future decks. It supersedes the pitch-deck-only Design System Brief for all production work.

---

# 1. DESIGN PRINCIPLES (the "why" behind every rule)

Derived directly from the Brand Codex archetype — **Caregiver + Sage**:

1. **Editorial, never institutional.** Vogue × TED stage × art gallery. If it could pass for a nonprofit PowerPoint or a hospital brochure, it's wrong.
2. **Warmth carries the message, structure carries the authority.** Cool primaries (emerald/teal/royal) build the frame; warm accents (coral/mustard/burnt) carry the humanity. Never let accents overwhelm legibility.
3. **Culture without costume.** Chicago architecture and Louisiana artistry appear as *subtle* motifs — rhythm, texture, warmth. Never literal landmarks, never themed clip-art.
4. **Dignity over drama.** She works in addiction prevention. Nothing playful about gambling imagery. **Never use dice, cards, chips, roulette, or slot iconography** — it's the single most damaging visual error possible for this brand.
5. **Space is credibility.** Crowded layouts read as cheap. Generous white space is the strongest signal of premium in her category.

---

# 2. COLOR SYSTEM

## 2.1 Full palette with roles

| Token | Hex | Role |
|---|---|---|
| `--ink` | **#14130E** | Primary dark background. Default for hero, dramatic sections, covers. |
| `--char` | **#23211B** | Secondary dark background. Cards on dark, layering. |
| `--ivory` | **#FBF6EA** | Primary light background AND primary text on dark. |
| `--cream` | **#F3EAD6** | Secondary light background. Alternating bands, subtle cards. |
| `--emerald` | **#0E6B54** | Primary brand color. Structure, primary buttons, key surfaces. |
| `--teal` | **#0B5C63** | Secondary structure. Section variety. |
| `--teal-blue` | **#1C6E7A** | Tertiary structure. Links, informational accents. |
| `--royal` | **#223A82** | Authority accent. Capability Kit, professional/clinical contexts. |
| `--berry` | **#6C2D5A** | Depth accent. Story, emotion, cultural richness. |
| `--burnt` | **#C15427** | Alert/emphasis accent. Warnings, flags, urgency. |
| `--mustard` | **#D9A23A** | Highlight accent. Data points, statistics, key numbers. |
| `--coral` | **#E17356** | Warmth accent. Pull quotes, human moments, "Silence." in the tagline. |
| `--gold` | **#C8A24C** | Premium accent. Eyebrows, fine rules, CTA buttons, editorial detail. |
| `--wood` | **#9A6A3E** | Texture accent. Natural warmth, sparingly. |

## 2.2 Semantic tokens (use these names in code — never raw hex)

```css
/* DARK MODE (default for hero, covers, dramatic sections) */
--bg-dark:            #14130E;
--bg-dark-elevated:   #23211B;
--text-on-dark:       #FBF6EA;
--text-on-dark-muted: #A9A294;
--border-on-dark:     rgba(251,246,234,0.13);

/* LIGHT MODE (default for reading, documents, long content) */
--bg-light:            #FBF6EA;
--bg-light-elevated:   #F3EAD6;
--text-on-light:       #14130E;
--text-on-light-muted: #6D6656;
--border-on-light:     rgba(20,19,14,0.12);

/* ACTIONS */
--action-primary:      #0E6B54;  /* primary button fill */
--action-primary-text: #FFFFFF;
--action-accent:       #C8A24C;  /* CTA / booking button fill */
--action-accent-text:  #14130E;
```

## 2.3 THE CONTRAST LAW (non-negotiable — this caused real rework earlier)

> **Dark background → Warm Ivory `#FBF6EA` text.**
> **Light background → Soft Black `#14130E` text.**
> **NEVER ivory or cream text on a white/light background. NEVER dark text on a dark background.**
> Never mix modes within a single section, card, or table row.

**Verified safe pairings** (all meet or exceed WCAG AA 4.5:1):

| Background | Text | Use |
|---|---|---|
| `#14130E` | `#FBF6EA` | Body on dark ✅ |
| `#14130E` | `#D9A23A` | Stats/numbers on dark ✅ |
| `#14130E` | `#C8A24C` | Eyebrows on dark ✅ |
| `#FBF6EA` | `#14130E` | Body on light ✅ |
| `#FBF6EA` | `#0E6B54` | Headings/links on light ✅ |
| `#FBF6EA` | `#223A82` | Authority headings on light ✅ |
| `#0E6B54` | `#FFFFFF` | Button text ✅ |

**Do NOT use:** `#D9A23A` or `#C8A24C` as text on light backgrounds (fails contrast). `#E17356` as body text anywhere (decorative only — headlines and pull quotes at large sizes only).

## 2.4 Color proportion rule
Roughly **60% neutral** (ink/ivory/cream), **30% structural** (emerald/teal/royal), **10% accent** (coral/mustard/gold/berry/burnt). If a layout feels loud, an accent has exceeded 10%.

---

# 3. TYPOGRAPHY

## 3.1 The three faces

| Role | Face | Fallback stack |
|---|---|---|
| **Display / headlines** | **Fraunces** (600 weight; italic for emphasis) | `Fraunces, 'Playfair Display', Georgia, serif` |
| **Body / UI** | **Inter** (400/500/600/700) | `Inter, -apple-system, 'Segoe UI', sans-serif` |
| **Utility / eyebrows / data** | **Space Mono** (400/700) | `'Space Mono', 'Courier New', monospace` |

Load via Google Fonts. Always define fallbacks — a missing font must never break a client-facing page.

## 3.2 Type scale — WEB (px)

| Token | Size | Line-height | Face | Use |
|---|---|---|---|---|
| `display-xl` | 64 | 1.02 | Fraunces 600 | Hero headline (desktop) |
| `display-l` | 48 | 1.05 | Fraunces 600 | Section heroes |
| `h1` | 40 | 1.1 | Fraunces 600 | Page titles |
| `h2` | 32 | 1.15 | Fraunces 600 | Section headings |
| `h3` | 24 | 1.25 | Fraunces 600 | Card titles |
| `body-l` | 18 | 1.65 | Inter 400 | Lead paragraphs |
| `body` | 16 | 1.62 | Inter 400 | Default body |
| `small` | 14 | 1.55 | Inter 400 | Captions, meta |
| `eyebrow` | 12 | 1.4 | Space Mono 400 | ALL-CAPS, letter-spacing `0.14em` |
| `stat` | 40–64 | 1.0 | Fraunces 600 | Big numbers (15+, 4,000+) |

**Mobile:** scale `display-xl` → 40px, `display-l` → 34px, `h1` → 30px, `h2` → 26px. Body stays 16px minimum — never smaller.

## 3.3 Type scale — PRINT / PDF (Media Kit, Capability Kit, one-sheet)

| Element | Size (pt) | Face |
|---|---|---|
| Cover title | 44–56 | Fraunces 600 |
| Page heading | 28 | Fraunces 600 |
| Subheading | 18 | Fraunces 600 |
| Body | 10.5–11 | Inter 400 |
| Caption / label | 8 | Space Mono, tracked |
| Pull quote | 20 | Fraunces 400 italic |

**Print minimum: 9pt.** Anything smaller is unreadable when a committee prints your one-sheet in black and white.

## 3.4 Typographic rules
- **Never more than 2 type sizes competing** in one visual block.
- Eyebrows are ALWAYS Space Mono, uppercase, letter-spaced `0.14em`.
- Body line length: **60–75 characters** on web, **~65** in print. Longer, and it stops being editorial.
- Pull quotes: Fraunces *italic*, with a 3–4px left border in an accent color.
- Never justify text. Left-align everything (except deliberate centered hero moments).

---

# 4. SPACING, GRID & SHAPE

## 4.1 Spacing scale (use ONLY these values)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128` (px)

Section padding: **96px desktop / 48px mobile** (vertical). Card padding: **24–32px**. Element gap: **12–16px**.

## 4.2 Grid
- **Web:** 12-column, max content width **1200px**, gutter 24px, page margin 24px (mobile) / 48px (desktop).
- **Print (kits):** US Letter 8.5×11in portrait, margins 0.6in, 12-column grid.
- **One-sheet:** US Letter, margins 0.5in — it must survive being printed on an office printer.

## 4.3 Breakpoints (web)
`640px` (mobile→large mobile) · `768px` (tablet) · `1024px` (desktop) · `1280px` (wide)

## 4.4 Radius & elevation
- Radius: `8px` (small: inputs, pills) · `12px` (cards) · `16–20px` (large panels) · `999px` (pills/buttons)
- **Photo frames: soft rounded rectangle, 12–16px radius. NEVER circular photo crops** — this was corrected during the pitch deck and looked broken.
- Shadows on dark: avoid. Use border + background elevation instead. On light: `0 10px 30px -20px rgba(0,0,0,0.35)`, subtle only.

---

# 5. COMPONENTS (shared spec — Tech builds in code, Design builds visually)

## 5.1 Buttons
| Variant | Fill | Text | Use |
|---|---|---|---|
| **Primary CTA** | `#C8A24C` | `#14130E` | "Book Tiffany" — the single most important action |
| **Secondary** | transparent, 1px `#FBF6EA` border | `#FBF6EA` | "Watch the reel" |
| **On light** | `#0E6B54` | `#FFFFFF` | In-document actions |

Padding `14px 28px`, radius `999px`, Inter 600, 16px. Hover: darken 8% + `translateY(-1px)`. **Minimum tap target 44×44px.**

## 5.2 Cards
Background `#23211B` (dark) or `#FFFFFF` (light). Border `1px` in the mode-appropriate border token. Radius `12px`. Padding `24–32px`. Optional 4–5px **left border** in an accent color to categorize — this is a signature pattern across the brand.

## 5.3 Eyebrow + heading pair (signature pattern)
```
EYEBROW IN SPACE MONO, GOLD, TRACKED     ← 12px, #C8A24C
Heading in Fraunces                       ← 32-48px, ivory or ink
Supporting line in Inter, muted           ← 16-18px
```
Use this at the top of nearly every section, page, and slide. It is the strongest recognizable pattern in the system.

## 5.4 Stat block
Big number in Fraunces (`#D9A23A` on dark) + Space Mono uppercase label beneath. Used for `15+ YEARS`, `4,000+ HOURS OF OUTREACH`, `21 SPEAKING TOPICS`.

## 5.5 Form fields (booking form)
Background `rgba(0,0,0,0.35)` on dark / `#FFFFFF` on light. Border 1px mode-appropriate. Radius `8px`. Padding `12px 14px`. Focus: border → `#C8A24C`. **Always visible labels — never placeholder-only** (accessibility, and she's a public-health professional; inaccessible forms are an embarrassing contradiction).

## 5.6 Divider
1px line at 12–15% opacity of the opposing mode color. Never a hard black or white rule.

---

# 6. PHOTOGRAPHY DIRECTION

**Style:** Warm, human-led, dignified. Natural light. She should look approachable AND authoritative — the Caregiver–Sage in one frame.

**Shot priorities:**
1. Clean headshot, neutral background (kits, one-sheet, LinkedIn)
2. On stage, mid-gesture, speaking (landing page hero, YouTube, credibility)
3. Candid community/audience interaction (proves "she brings people together")
4. Editorial/environmental portrait (story sections)

**Treatment:** No heavy filters. Slight warmth lift is acceptable; never desaturate her skin tones. Rounded-rectangle frames only.

**Avoid:** Stock photos of generic "diverse teams." Anyone else's branded backdrop (e.g. the `1.800.GAMBLER` step-and-repeat — it brands *their* campaign, not hers). Gambling imagery of any kind.

---

# 7. MOTIFS & GRAPHIC LANGUAGE

- **Sound-wave / equalizer bars** — the signature motif, drawn from "Break the Silence." Use as section dividers, hero accents, background texture at low opacity. **This is the brand's most ownable graphic device.**
- **Organic shapes, watercolor washes, abstract paint strokes** — sparingly, as accents behind or beside content. Never busy backgrounds.
- **Subtle Chicago-architecture rhythm** (vertical repetition, strong lines) and **Louisiana artistry warmth** (organic, handcrafted texture) — expressed as *feeling*, never literal skylines or fleurs-de-lis.
- **Iconography:** thin-line, 1.5–2px stroke, rounded caps, single-color. Never filled/cartoon icons. Never gambling icons.

---

# 8. PER-SURFACE SPECIFICATIONS

## 8.1 Landing page (tiffanywebb.com) — TECH TRACK OWNS
**Section order (locked):** Hero → Credibility Bar → Meet Tiffany → Speaking Topics (4 tracks) → Proof & Press → Booking CTA + Form → Footer.

- **Hero:** dark (`#14130E`). "Break the Silence." — *Silence.* in Fraunces italic `#E17356`. Portrait right. Two buttons: "Book Tiffany →" (gold) + "Watch the reel" (secondary).
- **Credibility bar:** emerald band, Space Mono, `15+ YEARS · 4,000+ HOURS OF OUTREACH · 21 SPEAKING TOPICS`.
- **Meet Tiffany:** light band (`#FBF6EA`). Two-column: portrait + story. "Read her story →" link.
- **Speaking Topics:** 4 cards, each with a colored left border (emerald / teal / royal / berry).
- **Booking band:** dark, centered, primary CTA.
- **Required:** a live **Privacy Policy page** (Meta requires it before the WhatsApp integration goes to production). Link it in the footer.
- Alt text on every image. Keyboard-navigable. Contrast law enforced.

## 8.2 Media Kit (12–15pp) & Capability Kit (12–18pp) — DESIGN TRACK OWNS
- US Letter portrait, 0.6in margins, 12-col grid.
- Alternate dark and light pages for editorial rhythm — never 12 identical pages.
- Every page carries the eyebrow + heading pattern.
- **Media Kit** leans emerald/teal/gold. **Capability Kit** leans royal blue (authority/partnership) — same DNA, distinguishable at a glance.
- **NO fees printed. NO Y Arts! branding** — these are hers to send.
- Export: web PDF **under 5MB** (so it doesn't bounce from email) + print-quality version.

## 8.3 Speaker one-sheet (1 page) — DESIGN TRACK OWNS
US Letter, 0.5in margins. **Must survive black-and-white office printing** — so never rely on color alone to convey structure. Contains: headline, photo, 2–4 signature topics, short bio, proof/logos, contact. Nothing else.

## 8.4 Social templates — DESIGN TRACK OWNS
**Verified 2026 dimensions:**

| Asset | Size | Notes |
|---|---|---|
| Instagram feed (primary) | **1080 × 1350** (4:5) | Most versatile; Meta displays portrait larger |
| Instagram square | 1080 × 1080 (1:1) | Cross-platform flexibility |
| Instagram/TikTok Story & Reel cover | **1080 × 1920** (9:16) | Keep content in central safe zone |
| Instagram carousel | 1080 × 1350, consistent ratio across all slides | |
| IG highlight cover | 1080 × 1920 (icon centered) | Speaking · Topics · Press · GambleFreeGear · About |
| LinkedIn feed post | **1200 × 1200** (1:1) | Square performs best in the LinkedIn feed |
| LinkedIn banner | **1584 × 396** | Keep key content centered — edges crop |
| LinkedIn profile photo | 400 × 400 | Circular crop — center her face |
| YouTube thumbnail (future) | 1280 × 720 | |

**Template types to build (~10):** quote card · stat card · topic announcement · event promo · carousel cover · carousel inner · reel cover · testimonial card · awareness-day card (PGAM/Screening Day) · GambleFreeGear cross-post.

**Rule:** every template must be legible as a thumbnail at 25% size. If the headline is unreadable small, it's too long.

## 8.5 Presentations / decks
16:9, 1920×1080. Same eyebrow + heading pattern. Alternate dark/light for pacing. Footer: studio mark left, page counter right.

---

# 9. LOGO RULES (v2 — pending Step 12)

The logo does **not** exist yet. When designed, it must satisfy:
- Legible at **16px** (favicon) and on a business card
- Works on both `#14130E` and `#FBF6EA`
- Reads as a **person**, not an institution or agency
- Pairs with Fraunces without competing
- Variants required: primary horizontal · stacked · monogram/favicon · light + dark versions
- **Must avoid:** swooshes, medical crosses, globes, and absolutely any gambling iconography
- **GambleFreeGear lockup:** text wordmark + "by Tiffany Webb" endorsement. Do NOT design a final GFG logo — she hasn't chosen one and must not be locked in.

Minimum clear space around logo: equal to the height of its capital letter.

---

# 10. QUICK DO / DON'T

**DO:** Use semantic tokens, not raw hex. Enforce the contrast law on every element. Give layouts room to breathe. Use the eyebrow+heading pattern relentlessly. Attribute every statistic to its named source. Use rounded-rectangle photo frames.

**DON'T:** Circular photo crops. Ivory/cream text on light backgrounds. Gambling iconography. Stock "diverse team" photos. More than 2 accent colors in one view. Justified text. Body text under 16px (web) or 9pt (print). Y Arts! branding on anything Tiffany sends her prospects. Fees printed in kits.

---

# 11. HOW EACH TRACK USES THIS FILE

**Tech chat (landing page):** Sections 2, 3.2, 4, 5, 8.1 are your build spec. Convert Section 2.2 into CSS custom properties verbatim. Section 8.1 is your page structure.

**Designer chat (kits, social, decks):** Sections 2, 3.3, 6, 7, 8.2–8.5 are yours. Register Sections 2–5 inside Claude Design as the saved Design System so every visual inherits it.

**Both:** Sections 1, 9, 10 apply to everything. When in doubt, this file wins over any older brief.
