# FILE 2 — UI/UX & DESIGN DIRECTION
## How this website must look, feel, and be structured.
**Prerequisite: read FILE 1 (Master Brain) first.**

---

# 1. THE GOVERNING DESIGN CONSTRAINT

**Tiffany is early in her speaking career. Design accordingly.**

Most premium speaker-site patterns assume abundance — video backgrounds, testimonial carousels, logo walls, press grids. She has strong credentials and a real story, but not yet a reel, a book, or twelve testimonials.

**Copy abundance patterns and the site will look empty. Empty reads as unsuccessful.** This is the single biggest risk on the project.

### Design asset-light by architecture:
| Principle | How it shows up |
|---|---|
| Typography carries weight, not media | Big editorial type is the hero. One strong photo beats five weak ones. |
| Every container works at minimum fill | Testimonial area complete with **2**. Logo row complete with **3**. |
| Space signals confidence | Generous whitespace = premium. Cramming to fill = insecure. |
| Never build something that can look half-full | No carousels showing one slide. No 4-column grid holding 2 items. |
| Empty states are designed, not accidental | "Speaker reel — coming soon" as a deliberate, styled card. |

---

# 2. WHAT MAKES A SITE READ AS TOP-1%

Premium is not decoration. It comes from four things, none of which require assets:

**Restraint.** The best speaker sites do less, better. Clarity is the premium signal — not effects.

**Typographic confidence.** Hero headlines at 64–96px. Real hierarchy. Generous line-height. The cheapest, highest-impact premium lever available.

**Motion with intent.** One meaningful interaction per section. Never animation on everything.

**Considered detail.** Designed focus states. Hover states with physicality. Buttons with real feedback. Empty and loading states that look intentional. *This is what separates a cheap site from an expensive one.*

## 2.1 What this site must never look like
❌ An AI startup (gradient mesh, glow, "futuristic")
❌ A generic nonprofit (stock diverse-hands photos, clip-art icons, weak type)
❌ A developer portfolio (cursor followers, WebGL, terminal aesthetics)
❌ A healthcare brochure (stock clinicians, blue-and-white sterility)
❌ A template (centered everything, identical card grids, no point of view)
❌ **Anything gambling-adjacent** — no dice, chips, neon, casino motifs

---

# 3. COLOR SYSTEM

## 3.1 Tokens — implement exactly
```css
:root{
  /* Neutrals */
  --ink:        #14130E;  /* primary dark bg */
  --char:       #23211B;  /* elevated dark surface */
  --ivory:      #FBF6EA;  /* primary light bg AND text on dark */
  --cream:      #F3EAD6;  /* secondary light bg */

  /* Structure */
  --emerald:    #0E6B54;  /* primary brand */
  --teal:       #0B5C63;
  --teal-blue:  #1C6E7A;
  --royal:      #223A82;

  /* Accents */
  --berry:      #6C2D5A;
  --burnt:      #C15427;
  --mustard:    #D9A23A;  /* data, statistics */
  --coral:      #E17356;  /* warmth, pull quotes, "Silence." */
  --gold:       #C8A24C;  /* eyebrows, CTA buttons, fine rules */
  --wood:       #9A6A3E;

  /* Semantic */
  --text-on-dark:        #FBF6EA;
  --text-on-dark-muted:  #A9A294;
  --text-on-light:       #14130E;
  --text-on-light-muted: #6D6656;
  --border-on-dark:  rgba(251,246,234,.13);
  --border-on-light: rgba(20,19,14,.12);
  --action-primary:  #0E6B54;
  --action-accent:   #C8A24C;
}
```

## 3.2 THE CONTRAST LAW — non-negotiable
> **Dark background → ivory `#FBF6EA` text.**
> **Light background → soft black `#14130E` text.**
> **NEVER ivory or cream text on a light background. NEVER dark text on dark.**
> Never mix modes inside one section, card, or table row.

**Verified safe pairs:** ink+ivory · ink+mustard · ink+gold · ivory+ink · ivory+emerald · ivory+royal · emerald+white
**Never as text on light:** mustard, gold, coral (decorative/large display only)

## 3.3 Proportion
≈60% neutral · 30% structural · 10% accent. If a layout feels loud, an accent has exceeded 10%.

---

# 4. TYPOGRAPHY

| Role | Face | Stack |
|---|---|---|
| Display | **Fraunces** 600 (italic for emphasis) | `Fraunces, 'Playfair Display', Georgia, serif` |
| Body/UI | **Inter** 400/500/600/700 | `Inter, -apple-system, 'Segoe UI', sans-serif` |
| Utility | **Space Mono** 400/700 | `'Space Mono', 'Courier New', monospace` |

## 4.1 Scale (desktop → mobile)
| Token | Desktop | Mobile | Face | Line-height |
|---|---|---|---|---|
| display-xl | 72px | 40px | Fraunces 600 | 1.02 |
| display-l | 56px | 34px | Fraunces 600 | 1.05 |
| h1 | 44px | 30px | Fraunces 600 | 1.1 |
| h2 | 34px | 26px | Fraunces 600 | 1.15 |
| h3 | 24px | 21px | Fraunces 600 | 1.25 |
| body-l | 19px | 17px | Inter 400 | 1.65 |
| body | 17px | 16px | Inter 400 | 1.62 |
| small | 14px | 14px | Inter 400 | 1.55 |
| eyebrow | 12px | 11px | Space Mono | 1.4, `letter-spacing:.14em`, uppercase |
| stat | 56px | 40px | Fraunces 600 | 1.0 |

**Rules:** body never below 16px (prevents iOS zoom-on-focus) · line length 60–75ch · never justify · eyebrows always Space Mono uppercase tracked · max two competing sizes per block.

---

# 5. SPACING, GRID, SHAPE

**Spacing scale (use only these):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`
**Section padding:** 112px desktop / 56px mobile (vertical)
**Grid:** 12 columns, max content width 1200px, gutter 24px
**Breakpoints:** `640 · 768 · 1024 · 1280`
**Radius:** 8px inputs · 12px cards · 20px panels · 999px pills
**Photo frames:** soft rounded rectangle, 12–16px radius. **NEVER circular crops.**
**Shadows:** avoid on dark (use border + elevation instead). On light: `0 10px 30px -20px rgba(0,0,0,.35)`.

---

# 6. THE SIGNATURE DEVICE — HER OWNABLE VISUAL

## The sound-wave / equalizer motif
Drawn directly from **"Break the Silence."** — silence made visible as a waveform.

**Why it works:** conceptually tied to her actual message, asset-free (pure CSS/SVG), scales from favicon to full-width, and no competitor can use it.

**Where it appears (maximum 3 per page — it's a signature, not wallpaper):**
- Hero: slow animated waveform behind the text column, 6% opacity
- Section dividers: thin waveform rule instead of a plain line
- Credibility bar: bars rise on scroll-into-view
- Footer: full-width waveform at 8% opacity
- Favicon/monogram: abstracted waveform mark

---

# 7. LAYOUT SYSTEM

## 7.1 Alternating-mode rhythm (the primary pacing device)
```
HERO           dark      — drama, first impression
CREDIBILITY    emerald   — accent strip, punctuation
MEET TIFFANY   light     — warmth, readability
EXPERTISE      dark      — focus, cards pop
FORMATS        light     — scannable
SPEAKER REEL   dark      — video sits best on dark
IMPACT         light     — long content, easy reading
PROOF          cream     — subtle shift, not white
GFG TEASER     dark      — distinct sub-brand moment
INSIGHTS       light
NEWSLETTER     cream
BOOKING        dark      — final drama, CTA glows
FOOTER         charcoal
```
**Never more than two consecutive sections in the same mode** — the page flattens.

## 7.2 Only five section patterns (repetition = design; variety = noise)
1. **Split 60/40** — copy + image (hero, meet, reel)
2. **Full-bleed band** — one centered message (credibility, mission, CTA)
3. **Card grid** — 3×2 (expertise, formats, audiences)
4. **Editorial stack** — eyebrow → heading → supporting → content *(default)*
5. **Asymmetric feature** — large element + supporting column (case studies, articles)

## 7.3 The signature pattern (repeated site-wide)
```
EYEBROW · SPACE MONO · GOLD · TRACKED
Heading in Fraunces
One supporting line in Inter, muted
```
Consistency here is what makes the site read as systematically designed.

---

# 8. COMPONENT SPECIFICATIONS

**Primary button** — fill `--gold`, text `--ink`, padding 15px 30px, radius 999px, Inter 600 16px. Contains a `→` that shifts right 3px on hover. Hover: darken 8% + translateY(-1px), 180ms.
**Secondary button** — transparent, 1px ivory border, ivory text. Hover: border → gold.
**Card** — bg `--char` (dark) / `#FFFFFF` (light), 1px border, 12px radius, 28px padding, 4px coloured left border for category. Hover: translateY(-4px) + border brighten. Entire card clickable.
**Form field** — bg `rgba(0,0,0,.35)` on dark, 1px border, 8px radius, 13px padding. Focus: border → gold, 2px gold outline offset 2px. **Visible label always — never placeholder-only.**
**Accordion** — height animates 350ms, chevron rotates 45°, coloured left border per track.
**Nav** — sticky, 80px tall, compresses to 64px after 100px scroll with background blur. Active page underlined in gold. Mobile: hamburger + **persistent visible CTA button**.
**Stat block** — number in Fraunces `--mustard` on dark, Space Mono uppercase label beneath.
**Divider** — 1px line at 12% opacity of the opposing mode, or a waveform rule.

---

# 9. PER-SECTION UI DIRECTION

**Hero** — Split 60/40, full viewport minus nav, dark. Portrait right in rounded-rect frame, 4:5. Waveform 6% opacity behind text. Two CTAs, gold primary dominant. Small credibility line beneath.

**Credibility bar** — Emerald band, 76px tall, Space Mono tracked, centered, dot separators. Counters animate once on scroll-in. Mobile: 3 stacked rows, band retained.

**Meet Tiffany** — Light. Photo left (different image from hero), copy right, text column max 60ch.

**Expertise pillars** — Dark, 3×2 grid. Each card: coloured left border, number, title, one line. Hover reveals detail. Mobile: single column.

**Formats** — Light, 3×2 cards. Use icons here (numbers on expertise) so the two grids read differently.

**Speaker reel** — Dark. 16:9 player left (60%), copy right. Play button: gold circle, scales 1.08 on hover. **Empty state: styled card, stage photo, waveform overlay, "Speaker reel — coming soon" in mono. Must look deliberate.**

**Impact** — Light. Stats row → audience grid (8 cells, thin-line icons) → photography.

**Proof** — Cream. Large pull-quote in Fraunces italic with coral left border. Logo row greyscale at 70%, colour on hover. **Must look complete with 2 quotes and 3 logos.**

**GambleFreeGear teaser** — Dark single band, apparel photo left, copy right, slightly bolder type to signal the sub-brand shift.

**Insights** — Light, 3 cards: image, category chip, title, excerpt, read time.

**Newsletter** — Cream, centered, max 520px, field + button inline desktop / stacked mobile.

**Booking** — Dark, centered form max 680px, two-column fields desktop / single mobile, gold submit, waveform at very low opacity behind.

**Footer** — Charcoal, 4 columns → 2 tablet → 1 mobile, full-width waveform at 8%.

---

# 10. MOBILE (design the booking flow here first)

Most conference organisers will open this on a phone.
- Every two-column grid collapses below **768px**
- Hero: text above image, headline 40px, CTAs full-width stacked
- Nav: hamburger + **persistent visible "Invite Tiffany" button** — never hide the CTA in a menu
- Form: single column, correct `inputmode` per field (`email`, `tel`, `numeric`)
- Tap targets ≥ 44×44px
- Test at 375px, 393px, 768px, 1440px

---

# 11. THE FIVE-SECOND TEST

Landing cold, a programmer must instantly know:
1. **Who** — Tiffany Webb (large)
2. **What** — Community Impact Strategist · Public Health Educator & Speaker (eyebrow)
3. **About what** — gambling harm prevention (sub-headline)
4. **Credible?** — 15+ years · 4,000+ hours (credibility bar)
5. **Next action** — Invite Tiffany to Speak (gold, unmissable)

If any is unclear in the top 900px, the hero has failed.

---

# 12. DESIGN QUALITY CHECKLIST

- [ ] Every section works with assets that exist today
- [ ] No container can look half-full
- [ ] Empty states designed, not broken
- [ ] Focus states visible and styled on every interactive element
- [ ] Contrast law enforced everywhere
- [ ] Photo frames rounded-rect, never circular
- [ ] Waveform ≤3 appearances per page
- [ ] Zero gambling imagery
- [ ] Hero passes the five-second test
- [ ] Mobile booking completes in under 60 seconds
