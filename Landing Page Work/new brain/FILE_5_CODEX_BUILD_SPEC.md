# FILE 5 — BUILD SPECIFICATION
## How to build the Tiffany Webb website. Technical instructions.
**Read FILES 1–4 first. This file assembles them.**

---

# 1. WHAT YOU ARE BUILDING

The complete production website for Tiffany Webb — a gambling-harm prevention speaker and public health educator — at **tiffanywebb.com**.

**13 pages.** All copy is written and final in FILE 4. Use it verbatim. Do not paraphrase, shorten, or rewrite it. Do not generate placeholder text — there is none to generate; every word already exists.

Items marked ⏳ in FILE 4 await client photography and video. Build those sections completely with the copy provided and a designed empty state. Do not skip them, and do not fake them.

**The site has one job: turn a stranger into a booking enquiry.**

---

# 2. FILE MAP

| File | Contains | Use it for |
|---|---|---|
| **FILE 1** | Master Brain | Who she is, constraints, verified facts, audiences |
| **FILE 2** | UI/UX & Design | Colors, type, spacing, components, layout |
| **FILE 3** | Motion | Every animation, timing, easing, accessibility |
| **FILE 4** | Complete Content | Every word on every page |
| **FILE 5** | This file | Stack, architecture, build order, QA |

---

# 3. TECHNICAL STACK

**Recommended:** Next.js (App Router) + TypeScript + Tailwind CSS.
Acceptable alternative: Astro, or plain HTML/CSS/JS if the project prefers zero framework.

**Requirements regardless of stack:**
- Static generation or SSG-equivalent (this is a marketing site — no server rendering needed per request)
- No animation library. Vanilla CSS + IntersectionObserver is sufficient (FILE 3).
- No UI kit that imposes its own visual language. The design system in FILE 2 is the design system.
- Total JS budget: **under 100KB** gzipped.

---

# 4. PAGE / ROUTE MAP

| Route | Page | Priority |
|---|---|---|
| `/` | Home | ★ Highest — most visitors see only this |
| `/about` | About | High |
| `/speaking` | Speaking | ★ Highest — commercial sales page |
| `/impact` | Impact | Medium |
| `/speaker-reel` | Speaker Reel ⏳ | Medium |
| `/book` | Book Tiffany | ★ Highest — conversion |
| `/media` | Media & Press | Medium |
| `/insights` | Insights index | Medium |
| `/insights/[slug]` | Article template (3 articles written) | Medium |
| `/gamblefreegear` | GambleFreeGear | Low |
| `/resources` | Resources ⏳ | Low |
| `/privacy` | Privacy Policy | ⚠ **Required** |
| `/terms` | Terms of Use | Required |
| `404` | Not found | Required |

> ⚠ `/privacy` must be a real, live, publicly reachable URL — not a placeholder link. It is legally required and is a prerequisite for connecting business messaging services later.

---

# 5. COMPONENT ARCHITECTURE

```
/components
  /layout       Nav, Footer, Layout, SkipLink
  /sections     Hero, CredibilityBar, MeetTiffany, ExpertiseGrid,
                FormatsGrid, SpeakerReel, ImpactStats, AudienceGrid,
                ProofSection, GFGTeaser, InsightsPreview, Newsletter,
                BookingSection, PageHero, ClosingCTA
  /ui           Button, Card, Eyebrow, Heading, StatBlock, Accordion,
                FormField, Select, Textarea, Waveform, PlaceholderCard,
                ArticleCard, CopyButton
  /motion       Reveal (IntersectionObserver wrapper), CountUp, StaggerGroup
/content        pages.ts, topics.ts, articles.ts, faq.ts, bios.ts
/styles         tokens.css, globals.css
/public         images, og, favicon, downloads
```

**Content separation is mandatory.** All copy from FILE 4 lives in `/content` as structured data, never hardcoded in components. Client edits must be possible without touching JSX.

---

# 6. BUILD ORDER

Build in this sequence. Each step depends on the previous.

**Step 1 — Foundation**
Design tokens from FILE 2 §3–5 as CSS custom properties. Font loading (Fraunces, Inter, Space Mono) with `font-display:swap` and preload. Global reset, base typography, the reduced-motion block from FILE 3 §9.

**Step 2 — Primitives**
Button, Card, Eyebrow, Heading, StatBlock, FormField, Waveform, PlaceholderCard. Build every state now: default, hover, focus, active, disabled, error. **Focus states are not optional.**

**Step 3 — Layout shell**
Nav (sticky, compressing, mobile hamburger with persistent CTA), Footer, SkipLink, page wrapper.

**Step 4 — Motion layer**
The `Reveal` wrapper, `CountUp`, `StaggerGroup` per FILE 3. Verify reduced-motion works before proceeding.

**Step 5 — Home page**
Build all 12 sections in order using FILE 4 §PAGE 1. This is the reference implementation — get it right, then reuse.

**Step 6 — Speaking page**
Including the 21-topic accordion. Highest content density on the site.

**Step 7 — Booking page + form**
Full field set, validation, spam protection, submission handling, success state.

**Step 8 — Remaining pages**
About, Impact, Media, Insights + article template, GambleFreeGear, Resources, Privacy, Terms, 404.

**Step 9 — SEO, metadata, structured data**

**Step 10 — Accessibility + performance audit**

---

# 7. THE BOOKING FORM (most important interactive element)

## 7.1 Fields
Per FILE 4 §PAGE 6.4. Required: name, organization, email, event type, consent. All others optional.

## 7.2 Validation
- Client-side on blur, not on every keystroke
- Server-side always — never trust the client
- Error messages use the exact strings from FILE 4's microcopy library
- Errors announced via `aria-live="polite"`, linked with `aria-describedby`
- Inline field errors, plus one summary at the top if multiple

## 7.3 Spam protection (layered — no CAPTCHA unless spam actually appears)
1. **Honeypot** — hidden field; if filled, accept silently and discard
2. **Time trap** — reject submissions completed in under 3 seconds
3. **Rate limit** — max 3 submissions per IP per hour
4. **Server-side validation** of every field
5. Escalate to Cloudflare Turnstile only if spam persists (better privacy/accessibility than reCAPTCHA)

## 7.4 On submit
1. **Email** → `booking@tiffanywebb.com` with all fields, clear subject line
2. **Auto-reply** to the sender — subject `Thank you for your interest in booking Tiffany Webb`, body from FILE 4 success copy, plus the one-sheet link
3. **CRM record** (when configured) — stage `New Enquiry`
4. **Success state** renders inline, no page reload, announced to screen readers

## 7.5 Accessibility
Visible `<label>` on every field — never placeholder-only. Correct `inputmode` (`email`, `tel`, `numeric`). Tap targets ≥44×44px. Full keyboard operation. Focus visible throughout.

---

# 8. SEO & METADATA

## 8.1 Per-page metadata
```html
<title>Tiffany Webb — Gambling Prevention Speaker & Public Health Educator</title>
<meta name="description" content="Book Tiffany Webb — Community Impact Strategist and public health educator with 15+ years and 4,000+ hours in gambling-harm prevention. Keynotes, workshops, and training for conferences, schools, and health systems.">
<link rel="canonical" href="https://tiffanywebb.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="Tiffany Webb — Break the Silence">
<meta property="og:description" content="Gambling prevention speaker and public health educator.">
<meta property="og:image" content="https://tiffanywebb.com/og-image.jpg">
<meta property="og:url" content="https://tiffanywebb.com/">
<meta name="twitter:card" content="summary_large_image">
```

**Per-page titles:**
| Route | Title |
|---|---|
| `/` | Tiffany Webb — Gambling Prevention Speaker & Public Health Educator |
| `/about` | About Tiffany Webb — Community Impact Strategist |
| `/speaking` | Speaking Topics & Formats — Tiffany Webb |
| `/impact` | Impact & Community Work — Tiffany Webb |
| `/book` | Book Tiffany Webb to Speak |
| `/media` | Media & Press Resources — Tiffany Webb |
| `/insights` | Insights on Gambling Prevention — Tiffany Webb |
| `/gamblefreegear` | GambleFreeGear — by Tiffany Webb |

**Target search phrases:** gambling prevention speaker · problem gambling keynote speaker · public health speaker · youth gambling prevention speaker · gambling prevention training

## 8.2 Structured data
`Person` schema on Home and About (name, jobTitle, description, sameAs social links). `Article` schema on each article. `BreadcrumbList` sitewide.

## 8.3 Required files
`sitemap.xml` · `robots.txt` · `og-image.jpg` (1200×630) · favicon set (32, 180, 512) · `site.webmanifest`

---

# 9. ACCESSIBILITY — WCAG 2.1 AA (non-negotiable)

She is a public-health professional; an inaccessible site is a credibility contradiction.

- Contrast law from FILE 2 §3.2 enforced everywhere. **Never ivory text on light backgrounds.**
- Semantic HTML: real `<nav>`, `<main>`, `<article>`, `<footer>`. One `<h1>` per page, no skipped levels.
- Alt text on every meaningful image; `alt=""` on decorative.
- Skip-to-content link, first focusable element.
- Full keyboard operability; visible focus everywhere; logical tab order.
- `prefers-reduced-motion` honoured completely.
- Form labels visible; errors announced.
- Body text never below 16px.
- Test with a screen reader (VoiceOver or NVDA) before shipping.

---

# 10. PERFORMANCE

**Targets:** LCP < 2.5s · CLS < 0.1 · INP < 200ms · Lighthouse ≥ 90 across all four categories · total page weight < 1.5MB

- WebP/AVIF with fallbacks; `srcset` responsive images; explicit `width`/`height` on every image to prevent layout shift
- Lazy-load everything below the fold; **eager-load the hero image only**
- Fonts: `font-display:swap`, preload the display font, subset to Latin
- Animate only `transform` and `opacity`
- Defer non-critical JS; inline critical CSS
- No animation library, no jQuery, no heavy dependencies

---

# 11. RESPONSIVE

Breakpoints `640 · 768 · 1024 · 1280`.
Every two-column layout collapses to single column below 768px. Nav becomes hamburger + **persistent visible CTA** below 768px. Test at 375px, 393px, 768px, 1440px on real devices, not just devtools.

---

# 12. PLACEHOLDER HANDLING ⏳

Sections awaiting client assets: hero photo, portrait, stage photography, speaker reel video, testimonials, partner logos, case studies, product photography, resources.

**Rules:**
1. Build the section completely with the FILE 4 copy.
2. Render a **designed** empty state — see FILE 4's microcopy library for exact strings.
3. Mark every placeholder element `data-placeholder="true"` so all can be found with one query.
4. Never use lorem ipsum. Never invent a testimonial, logo, statistic, or case study.
5. Empty states must look intentional. A styled "coming soon" card is acceptable; a broken embed or empty grid is not.

---

# 13. CONTENT INTEGRITY RULES (violating these damages the client)

1. Use FILE 4 copy **verbatim**. No rewriting, no "improving."
2. All 21 topics exactly as written — never invent, rename, or substitute.
3. Never print speaking fees anywhere.
4. Only `booking@tiffanywebb.com`. No other email address appears on this site.
5. `"Are You Really Winning?"` — the only permitted phrasing is `Participant in the statewide "Are You Really Winning?" awareness campaign.`
6. Never publish internal strategy vocabulary.
7. Every statistic carries its named source.
8. Zero gambling imagery — no dice, cards, chips, roulette, slots, casino neon.
9. Never geographically limit her to Chicago.
10. Never invent testimonials, logos, credentials, dates, or case studies.

---

# 14. PRE-LAUNCH QA CHECKLIST

**Content**
- [ ] Every word matches FILE 4 exactly
- [ ] All 21 topics present with full descriptions
- [ ] All 3 articles published in full
- [ ] No lorem ipsum anywhere
- [ ] All `data-placeholder="true"` elements catalogued for client swap
- [ ] No fees printed
- [ ] Only `booking@tiffanywebb.com` appears
- [ ] "Are You Really Winning?" phrasing correct
- [ ] No internal jargon in the DOM

**Functionality**
- [ ] Every link works, no dead `href="#"`
- [ ] Every nav item routes correctly
- [ ] Accordion opens and closes each of the 21 topics
- [ ] Form submits end-to-end and email arrives from an external address
- [ ] Auto-reply fires
- [ ] Validation and error states work
- [ ] Spam protections active
- [ ] Newsletter submits
- [ ] Copy-to-clipboard works on all three bios
- [ ] 404 renders

**Design & motion**
- [ ] Contrast law holds on every section
- [ ] No circular photo crops
- [ ] Focus visible on every interactive element
- [ ] Nothing animates more than once
- [ ] Reduced-motion tested manually
- [ ] Waveform ≤3 per page

**Technical**
- [ ] Lighthouse ≥90 all four categories
- [ ] Tested on real iOS and Android
- [ ] Metadata and OG tags on every page
- [ ] `sitemap.xml` and `robots.txt` present
- [ ] `/privacy` live and reachable
- [ ] Screen-reader pass completed
- [ ] Works with JavaScript disabled (content readable)
