# TIFFANY WEBB — LANDING PAGE BUILD PROMPT (v1, FINAL)
### Paste this whole file as your first message in Claude Code, in the project repo for tiffanywebb.com.

---

## HOW TO USE THIS

This is a complete build spec: tokens, global rules, and a section-by-section layout/typography/animation spec for all 15 scenes (nav + 14 content sections). Build in the two phases marked at the bottom — do not build all 15 sections in one pass. Where a field says "confirm/replace," that's copy or a small decision still pending from Yash/Tiffany — build the structure now with a clearly-labeled placeholder, don't invent final wording.

---

## 1. TECH STACK

- **Static HTML/CSS/JS** — no framework. This is a single scrolling page; a framework adds build complexity with no benefit here.
- **GSAP + ScrollTrigger** (CDN import) for all scroll-driven reveals, staggers, and the number count-ups. Do not hand-roll IntersectionObserver animations when GSAP is already loaded — one animation engine, not two.
- **Fonts:** Google Fonts — Fraunces (display), Inter (body), Space Mono (utility/eyebrow). Always define system-font fallbacks.
- **Deploy target:** static output → Hostinger shared hosting (production). The booking form posts to an API endpoint on the Render service (shared with the WhatsApp bot) — do not build a PHP mail handler; keep Hostinger pure static.
- **File structure:** `index.html`, `styles.css` (or a `/css` split by section if it gets long), `main.js` for GSAP/ScrollTrigger init, `/assets` for images. Keep it simple — this is one page, not an app.

---

## 2. DESIGN TOKENS

### 2.1 Color (from Design System v1.0 — use these CSS custom properties verbatim, never raw hex)

```css
:root{
  --ink:#14130E; --char:#23211B; --ivory:#FBF6EA; --cream:#F3EAD6;
  --emerald:#0E6B54; --teal:#0B5C63; --teal-blue:#1C6E7A; --royal:#223A82;
  --berry:#6C2D5A; --burnt:#C15427; --mustard:#D9A23A; --coral:#E17356;
  --gold:#C8A24C; --wood:#9A6A3E;
  --text-on-dark:#FBF6EA; --text-on-dark-muted:#A9A294;
  --text-on-light:#14130E; --text-on-light-muted:#6D6656;
  --border-on-dark:rgba(251,246,234,.13); --border-on-light:rgba(20,19,14,.12);
}
```

**Contrast law (non-negotiable):** dark background → `--ivory` text. Light background → `--ink` text. Never mix within one section. Never ivory/cream on white.

### 2.2 Typography

| Token | Size (web) | Face | Use |
|---|---|---|---|
| `display-xl` | 64px / 40px mobile | Fraunces 600 | Hero headline only |
| `h1` | 40px / 30px mobile | Fraunces 600 | Page-level titles (none on this page — reserved) |
| `h2` | 32px / 26px mobile | Fraunces 600 | Every section heading |
| `h3` | 24px | Fraunces 600 | Card titles |
| `body-l` | 18px | Inter 400 | Lead paragraphs (hero subhead, mission line) |
| `body` | 16px | Inter 400 | Default — never smaller on web |
| `eyebrow` | 12px | Space Mono 400, uppercase, `letter-spacing:.14em` | Every section's label-above-heading |
| `stat` | 40–64px | Fraunces 600 | Big numbers |

**Pattern used constantly:** eyebrow (gold, Space Mono, tracked) → heading (Fraunces) → one supporting line (Inter, muted). This is the strongest recognizable device in the system — use it at the top of every section without exception.

### 2.3 Spacing & shape
Scale: `4·8·12·16·24·32·48·64·96·128`px. Section vertical padding: 96px desktop / 48px mobile. Cards: 12px radius. Photo frames: 12–16px rounded rectangle — **never circular crops.** Buttons: 999px pill, 44×44px minimum tap target.

### 2.4 Motion tokens (new — lock these)

```css
:root{
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-micro: 150ms;
  --dur-standard: 400ms;
  --dur-hero: 700ms;
}
```

- Scroll-trigger fire point: **15% of element in viewport**, fires once, never re-triggers scrolling back up.
- Stagger between sibling elements: **80–120ms.**
- **Every animation must have a `prefers-reduced-motion` fallback** that keeps opacity fades only and removes movement/scale entirely. This is not optional polish — build it into the base GSAP config once, not per-section.
- Keyboard focus must remain visible on every interactive element at all times (focus-visible outline in `--gold`), regardless of motion state.

---

## 3. GLOBAL RULES (apply to all 14 sections)

1. **One major interaction per section.** Do not stack multiple animation types (fade + scale + blur + parallax) on one element. Pick one per section from the list below and execute it well.
2. **The sound-wave / equalizer-bar motif is the page's signature element** (drawn from "Break the Silence"). It appears exactly twice: as a subtle ambient texture behind the Hero, and as a section divider bookending the final Book Tiffany section. Nowhere else. This is the one place slightly more visual attention is earned — everything else stays quiet by comparison.
3. **Glassmorphism appears exactly once:** the sticky nav, which transitions from transparent-over-hero to a frosted (`backdrop-filter: blur(12px)`) cream bar with a soft shadow once scrolled past the hero. No glass anywhere else on the page.
4. **No circular photo crops anywhere.** Rounded-rectangle frames only.
5. **No dice, cards, chips (playing-card sense), roulette, or slot iconography** anywhere on the page, including in decorative textures.
6. **One CTA label for one action, everywhere:** primary action is **"Book Tiffany to Speak"** (nav can shorten to "Book Tiffany" only if space genuinely requires it). Do not introduce alternate phrasings ("Request," "Invite," "Hire") for the same action anywhere on the page.
7. **Photography:** no image repeated twice on the page. Rounded-rectangle frames, warm natural light, no heavy filters, never desaturate skin tones.
8. **Never fabricate a statistic, quote, or attribution.** Where real content isn't supplied yet, build the component with a clearly labeled placeholder state — do not invent plausible-sounding filler.

---

## 4. SECTION-BY-SECTION BUILD SPEC

---

### 0 · NAV (sticky)
**Layout:** Logo/wordmark left, anchor links center (Home / About / Expertise / Speaking / Partnerships / Media / Contact), "Book Tiffany" gold pill button right. Collapses to a hamburger + drawer under 768px.
**Typography:** Nav links — Inter 600, 14px.
**Animation:** Transparent over the hero. On scroll past hero (~90% of hero height), transitions to frosted cream background (the one glassmorphism moment, `--dur-standard`, `--ease-standard`) with a 1px bottom border and soft shadow. No animation beyond this single state change.
**Notes:** This is the one non-scroll-triggered, scroll-*position*-driven effect — separate logic from the ScrollTrigger reveals below.

---

### 1 · HERO
**Purpose:** Answer "who is she / what does she do / what do I do next" within 5–10 seconds.
**Layout:** Full-bleed dark (`--ink`) background. Left: eyebrow, headline, one-line subhead, two CTAs stacked/inline. Right: large speaking/stage photograph, rounded-rectangle frame, positioned so there's negative space for the type on the left.
**Content (confirm/replace with Yash):**
- Eyebrow: `COMMUNITY IMPACT STRATEGIST · PUBLIC HEALTH EDUCATOR & SPEAKER` — this is the corrected positioning line. Do NOT use "Gambling Prevention Coordinator" as the lead line anywhere in the hero — Codex Flag 6 demotes it to a supporting credential only, referenced lower on the page (Career Highlights), never here.
- Headline: `display-xl`, Fraunces 600. Exact wording pending Yash — either the locked flagship line ("Break the Silence." with *Silence.* in Fraunces italic `--coral`) or an editorial variant. Build the markup to support an italic accent word regardless of final copy.
- Subhead: `body-l`, one sentence.
- Primary CTA: "Book Tiffany to Speak" (gold fill). Secondary: "Explore My Work" (outline, ivory border) — scrolls to Speaking Topics.
**Animation:** Page load — staggered entrance, `--dur-hero` total: eyebrow → headline → subhead → CTAs → photo, `--stagger 80–120ms` between each, `--ease-entrance`. Photo: slow ambient scale, 1.0 → 1.04 over 8s, imperceptible, looping — not scroll-linked, not parallax. Sound-wave motif: faint, low-opacity texture behind the type, static or very slow drift — do not let it compete with the headline.
**On scroll away:** hero content fades to ~40% opacity as the next section rises over it. No hard cut, no aggressive parallax.

---

### 2 · CREDIBILITY BAR
**Layout:** Full-width `--emerald` band. Three stats in a row: `15+ YEARS`, `4,000+ HOURS OF OUTREACH`, `21 SPEAKING TOPICS`.
**Typography:** Numbers — `stat` token, Fraunces 600, white. Labels beneath — Space Mono, uppercase, tracked.
**Animation:** Numbers count up from 0 when the band enters the viewport (GSAP + a simple tween on a text node), ~1.2s duration, `--ease-standard`. This is the only count-up moment on the page besides Career Highlights (§7) — intentional reuse of the same device, not a new effect.

---

### 3 · MEET TIFFANY
**Layout:** Light band (`--ivory`). Two-column: portrait left (rounded-rectangle), story right — short bio + "My Mission" subhead + mission line + "Learn more about Tiffany" link.
**Content source:** Codex medium bio (~90 words), mission line from Codex Section B.
**Typography:** `h2` heading, `body` for bio text, `eyebrow`+heading pattern at top ("MEET" / "Tiffany Webb").
**Animation:** Standard scroll entrance (fade + 24px slide-up, `--dur-standard`, `--ease-standard`). Photo uses a clip-path mask-reveal on entrance (wipes in from one edge) rather than a plain fade — the one "premium reveal" moment for this section.

---

### 4 · PROFESSIONAL EXPERTISE
**Layout:** Light/cream band. 12-item icon grid (4×3 desktop, 2×6 mobile): Gambling Prevention, Behavioral Health, Public Health, Youth Prevention, Community Outreach, Coalition Building, Strategic Partnerships, Program Development, Community Engagement, Training & Education, Screening & Early Intervention, Health Equity. Each: colored circular icon badge (rotate through emerald/royal/berry/burnt/teal) + label beneath.
**Typography:** Labels — Inter 600, 14px. Section eyebrow "PROFESSIONAL" + `h2` "Expertise" (italic accent on "Expertise" acceptable here, echoes the hero's italic device).
**Animation:** Icons pop in with stagger as the grid enters viewport — scale 0.9→1 + fade, 80ms stagger, `--dur-micro` per icon. This should feel like items "arriving," not flying in — keep the scale delta small.
**Icons:** thin-line, 1.5–2px stroke, single color, rounded caps — per Design System §7. No filled/cartoon icons.

---

### 5 · SPEAKING TOPICS
**Layout:** 4 cards, one per track (Prevention & Awareness / Clinical & Professional Training / Family & Community Impact / Creative & Promotional Engagement), each with a 4–5px colored left border (emerald/teal/royal/berry) per Design System §5.2. Each card: track name, 2–3 representative topics from her real 21-topic list, not all of them.
**Content source:** Codex Section G signature-talk portfolio — use her real topics verbatim, never generic placeholders.
**Animation:** Scroll-entrance stagger across the 4 cards (`--dur-standard`, 100ms stagger). Hover: card lifts 4px (`translateY(-4px)`), border color intensifies, `--dur-micro`.

---

### 6 · AUDIENCES SERVED
**Layout:** `--teal` or `--emerald` band. Centered eyebrow + heading, then a chip/pill cloud (not a list): Nonprofits, Hospitals, Schools, Colleges & Universities, Community Coalitions, Government Agencies, Public Health Organizations, Behavioral Health Providers, Faith Communities, Recovery Organizations, Conference Organizers.
**Typography:** Chips — Inter 600, 14px, white text on translucent white-fill pill (`rgba(255,255,255,.12)` background, 1px border).
**Animation:** Chips fade+pop in with stagger, 60ms between chips (light — there are 11 of them, keep total sequence under 1.5s). Hover: chip background fills solid with a rotating accent color from the palette.

---

### 7 · CAREER HIGHLIGHTS
**Layout:** Dark (`--char` or `--ink`) band. Left: the same two stats as the Credibility Bar (15+ years, 4,000+ hours) — reused deliberately, not duplicated content — paired here with a real speaking photo and a short highlights list pulled from her existing media kit: Community Screenings, Workshop Facilitator, Coalition Leader, Public Health Advocate, Community Partnerships Across Illinois, Evidence-Informed Prevention. This is also where the demoted "Gambling Prevention Coordinator" title can appear as a supporting credential line — never as the page's lead positioning.
**Animation:** Same count-up treatment as §2 (consistency, not a new effect). Highlights list items fade in with a small stagger as a simple list, no icons needed beyond a subtle bullet mark.

---

### 8 · WHAT SHE OFFERS (SPEAK / PARTNER / STRATEGIZE / STRENGTHEN)
**Layout:** 4-card grid, one card per pillar, each with a distinct fill color (emerald / burnt / royal / gold) per the existing framework. Each card lists 4–5 items (Keynotes/Workshops/Panels under SPEAK; Resource Tables/Conferences/Coalition Meetings under PARTNER; etc. — content already exists in her media kit, carry it over).
**Content source:** the SPEAK/PARTNER/STRATEGIZE/STRENGTHEN framework already established for this brand — do not rebuild this as a separate generic "Services" list; this section replaces that.
**Typography:** Card header — `h3`, white on the fill color. Items — Inter 400, 15px.
**Animation:** Scroll-entrance stagger (same pattern as §5). Hover: lift + slight brightness increase on the fill.

---

### 9 · ORGANIZATIONS & PARTNERSHIPS
**Layout:** Cream band. Left: text list of real affiliations (Healthcare Alternative Systems, Illinois Council on Problem Gambling, "Are You Really Winning?" Campaign, Schools, Hospitals, Community Coalitions, Behavioral Health Organizations, Public Health Partners, Recovery Organizations, Community-Based Organizations). Right: a small photo grid (real event/community photos as they become available). Centered below: a circular gold badge — "Rooted in Community. Committed to Change."
**Note:** this section functions as the page's primary trust/credibility proof, standing in for testimonials until real, verified quotes exist (see §7 of the deferred list below).
**Animation:** List items fade in sequentially, light stagger. Photo grid: fade+scale-in. Badge: single gentle rotate-in (0° from -8°) on entrance — the one slightly playful touch on the page, used exactly once, appropriate for a badge/seal element.

---

### 10 · WHY ORGANIZATIONS CHOOSE TIFFANY
**Layout:** Simple two-column — photo left, short bulleted list right (Professional, Engaging, Evidence-Based, Interactive, Collaborative, Mission-Focused / Practical, Community-Centered, Strategic Thinker, Relationship Builder, Trusted Public Health Professional).
**Animation:** Standard fade+slide-up only. Deliberately the quietest section on the page — no new effect introduced here.

---

### 11 · GAMBLEFREEGEAR
**Layout:** One compact card, not a full section — "GambleFreeGear, founded by Tiffany Webb," her real tagline ("Break the Silence"), one product photo, link-out button to her existing GambleFreeGear channel. **No cart, no product grid, no checkout logic** — purchasing on this site is not confirmed and is out of scope for this build.
**Typography:** Slightly bolder treatment than surrounding sections is appropriate here — GFG's brand energy is intentionally more street-leaning per the Codex, so a marginally more energetic hover state is content-justified, not arbitrary.
**Animation:** Card entrance — standard fade+slide. Hover: product image slight scale (1.0→1.03) + tilt (1–2deg) — the one place on the page allowed a touch more motion than elsewhere.

---

### 12 · MEDIA RESOURCES
**Layout:** Cream band. Short heading + "Available Upon Request" subhead, bullet list of available assets (headshots, bio, speaker one-sheet, logos), two buttons: "Request Media Kit" / "Download Speaker Sheet."
**Animation:** Fade only. This is a utility section — do not add a new interaction type here.

---

### 13 · BOOK TIFFANY (Final CTA + Form + Newsletter)
**Layout:** Dark band. Left: photo, "Book Tiffany for:" list, social icons. Right: the inquiry form. Below the form: closing tagline quote ("Every conversation is an opportunity to plant a seed of hope, strengthen a community, and inspire meaningful change.") + a single newsletter email capture. **Only one newsletter signup on the entire page — this is it.** Do not add a second one elsewhere.
**Form fields (confirmed from her draft, one field added):**
Name · Organization · Email · Phone · Type of Request (dropdown: Keynote / Workshop or Training / Panel or Moderation / Consulting or Partnership Discussion / Media or Podcast / Other — confirm/replace) · Event Date · Location · Estimated Audience Size · **Budget Range (dropdown, optional — confirm/replace with real bands)** · Message.
*Why the budget field exists even though it wasn't in her draft:* the Codex's own booking guidance is to never print fees and instead begin negotiation from the event's stated budget — this field is the mechanism that makes that practice possible. It should be optional, not required, so it doesn't create friction for someone who doesn't know yet.
**Field styling:** per Design System §5.5 — visible labels always (never placeholder-only text), `rgba(0,0,0,.35)` background on dark, `--gold` border on focus.
**Animation:** Sound-wave motif reappears here as a section divider — the bookend to the hero's opening use of the same motif. Form field focus: border-color transition, `--dur-micro`. On submit: button shows a brief inline loading state, then the form is replaced by a success message in place — no page reload, no redirect.

---

### 14 · FOOTER
**Layout:** Nav recap, social icons, contact, legal links (Privacy Policy — required live before WhatsApp goes to production; Terms; Accessibility), corrected tagline: **"Community Impact Strategist · Public Health Educator & Speaker"** — not the job-title stack. Copyright line.
**Animation:** None. Fully static — footers are utility, not a stage for delight.

---

## 5. BUILD PHASING

**Phase 1 (build first, stop, wait for review):** Nav + Hero + Credibility Bar + one Speaking Topics card. This is enough to judge whether the motion timing, easing, and the sound-wave motif actually feel right before the remaining 11 sections are built on the same pattern.

**Phase 2 (only after Phase 1 is approved):** everything else, in the order listed above.

---

## 6. ACCESSIBILITY & PERFORMANCE — NON-NEGOTIABLE

- Alt text on every image.
- Full keyboard navigation; visible focus states in `--gold` on every interactive element, in every motion state.
- `prefers-reduced-motion` fallback active globally, not per-section.
- Contrast law enforced on every text/background pairing — no exceptions.
- Compressed images, lazy-loaded below the fold.
- Body text never below 16px on web.

---

## 7. DEFERRED — DO NOT BUILD IN V1

- **Upcoming Events** — needs at least one real, confirmed date before it ships. A section full of `[Event Title]` placeholders is worse than no section.
- **Testimonials with named attribution** — none verified yet. The "Midwest Public Health Alliance" quote in the early draft is an example, not a real testimonial, and does not ship under any organization's name until Tiffany confirms a real one.
- **Blog / Insights** — no content exists yet; this is a content-production task, not a landing-page build task.
- **Any purchase flow for ebooks or GambleFreeGear apparel** — not confirmed. Link-out only.
