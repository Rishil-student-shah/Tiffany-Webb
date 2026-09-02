# FILE 3 — MOTION & INTERACTION SPECIFICATION
## Every animation, transition, hover, and scroll behaviour on the site.
**Prerequisites: FILE 1 (Master Brain), FILE 2 (UI/UX).**

---

# 1. THE MOTION PHILOSOPHY

**One meaningful interaction per section. Motion supports content; it never becomes the content.**

The most common failure in "premium" builds is animating everything — every card fading, every heading sliding, every scroll triggering. The result feels cheap and busy, and it slows the page. Restraint reads as expensive.

**Three tests before adding any animation:**
1. Does it help the visitor understand something? (hierarchy, causality, state)
2. Would the page feel worse without it?
3. Does it still work if the user disables motion?

If any answer is no, remove it.

---

# 2. THE EASING & TIMING SYSTEM

```css
:root{
  /* Easing */
  --ease-out:    cubic-bezier(.16, 1, .3, 1);      /* entrances — the signature curve */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);     /* state changes */
  --ease-subtle: cubic-bezier(.25, .46, .45, .94); /* micro-interactions */

  /* Duration */
  --t-instant: 120ms;  /* toggles */
  --t-fast:    180ms;  /* hovers */
  --t-base:    250ms;  /* standard transitions */
  --t-medium:  400ms;  /* accordions, reveals */
  --t-slow:    700ms;  /* section entrances */
  --t-hero:    900ms;  /* hero reveal */
}
```

**Rule:** anything a user triggers directly (hover, click) must respond in **under 200ms** or it feels laggy. Anything triggered by scroll can be slower and more cinematic.

---

# 3. PAGE LOAD SEQUENCE

The first 1.5 seconds set the entire quality perception.

```
0ms      Background colour paints (no white flash — set bg on <html>)
0-100ms  Nav fades in, translateY(-8px) → 0
150ms    Hero eyebrow fades in
230ms    Hero headline line 1 fades + translateY(20px) → 0
310ms    Hero headline line 2 (the italic "Silence.")
390ms    Sub-headline
470ms    CTA buttons (together)
200ms    Hero image begins mask reveal (runs 900ms, parallel)
600ms    Waveform begins its slow loop
```

**Critical:** never delay text behind image loading. If the photo is slow, the words still appear on schedule. Use a blur-up placeholder so there is no layout shift.

```css
@keyframes riseIn{ from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:none} }
.hero-el{ opacity:0; animation:riseIn var(--t-slow) var(--ease-out) forwards; }
.hero-eyebrow{ animation-delay:150ms }
.hero-h1-a  { animation-delay:230ms }
.hero-h1-b  { animation-delay:310ms }
.hero-sub   { animation-delay:390ms }
.hero-cta   { animation-delay:470ms }
```

## 3.1 The hero image mask reveal
```css
@keyframes maskUp{ from{clip-path:inset(100% 0 0 0)} to{clip-path:inset(0 0 0 0)} }
.hero-img{
  animation: maskUp var(--t-hero) var(--ease-out) 200ms both;
}
.hero-img img{
  animation: slowScale 1400ms var(--ease-out) 200ms both;
}
@keyframes slowScale{ from{transform:scale(1.08)} to{transform:scale(1)} }
```
The image scales down slightly as it reveals — a subtle "settling" that reads as expensive.

---

# 4. SCROLL-TRIGGERED ENTRANCES

## 4.1 The standard section reveal
Every major section uses **one** pattern. Do not vary it per section.

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);          // animate once, never repeat
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
```
```css
[data-reveal]{ opacity:0; transform:translateY(24px);
  transition:opacity var(--t-slow) var(--ease-out), transform var(--t-slow) var(--ease-out); }
[data-reveal].in{ opacity:1; transform:none }
```

**Never re-animate on scroll back up.** Elements that replay are the clearest signal of an amateur build.

## 4.2 Staggered children (cards, grids)
```css
[data-reveal] .stagger > *{ opacity:0; transform:translateY(16px);
  transition:opacity 600ms var(--ease-out), transform 600ms var(--ease-out); }
[data-reveal].in .stagger > *{ opacity:1; transform:none }
[data-reveal].in .stagger > *:nth-child(1){ transition-delay:0ms }
[data-reveal].in .stagger > *:nth-child(2){ transition-delay:70ms }
[data-reveal].in .stagger > *:nth-child(3){ transition-delay:140ms }
[data-reveal].in .stagger > *:nth-child(4){ transition-delay:210ms }
[data-reveal].in .stagger > *:nth-child(5){ transition-delay:280ms }
[data-reveal].in .stagger > *:nth-child(6){ transition-delay:350ms }
```
**Cap stagger at 6 items / 350ms.** Beyond that the last item feels broken.

## 4.3 Statistic counters
Count from 0 to target over 1400ms, ease-out, **once only**.
```js
function countUp(el, target, dur = 1400){
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);            // ease-out cubic
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + '+';
  };
  requestAnimationFrame(step);
}
```
Applies to: `15+`, `4,000+`, `21`. Reduced-motion: render the final value instantly.

---

# 5. THE SIGNATURE WAVEFORM ANIMATION

Her ownable device — silence made visible. Pure CSS, no assets.

```css
.waveform{ display:flex; align-items:flex-end; gap:4px; height:64px; opacity:.06; }
.waveform span{
  flex:1; background:currentColor; border-radius:3px 3px 0 0;
  animation: wave 3.2s var(--ease-in-out) infinite;
}
@keyframes wave{ 0%,100%{height:18%} 50%{height:76%} }
```
Delay each bar by `i * 60ms` so the wave travels rather than pulsing in unison.

**Placement rules:** maximum **3 per page**. Hero (6% opacity, slow) · credibility bar (bars rise on scroll-in, then hold) · footer (8% opacity, very slow, 12s). It is a signature — never a background texture.

---

# 6. MICRO-INTERACTIONS

| Element | Behaviour | Timing |
|---|---|---|
| **Primary button** | Darken 8%, `translateY(-1px)`, arrow `→` shifts right 3px | 180ms `--ease-subtle` |
| **Secondary button** | Border ivory → gold, text brightens | 180ms |
| **Card** | `translateY(-4px)`, border brightens, left accent widens 4→6px | 250ms |
| **Text link** | Underline draws left → right | 250ms |
| **Nav item** | Gold underline draws from left; active stays lit | 250ms |
| **Nav bar** | Height 80→64px, background blur in, after 100px scroll | 300ms |
| **Form field** | Border → gold, label lifts & shrinks | 180ms |
| **Form error** | Single horizontal shake (skip if reduced-motion) | 400ms |
| **Accordion** | max-height animates, chevron rotates 45° | 400ms `--ease-in-out` |
| **Play button** | `scale(1.08)`, ring expands outward | 250ms |
| **Image (card)** | `scale(1.04)` inside fixed overflow-hidden frame | 500ms |
| **Focus ring** | 2px gold outline, 2px offset, appears instantly | 0ms |

## 6.1 Link underline
```css
.link{ position:relative; text-decoration:none }
.link::after{
  content:""; position:absolute; left:0; bottom:-2px; height:1px; width:100%;
  background:currentColor; transform:scaleX(0); transform-origin:left;
  transition:transform var(--t-base) var(--ease-out);
}
.link:hover::after{ transform:scaleX(1) }
```

## 6.2 Focus — designed, never removed
```css
:focus-visible{ outline:2px solid var(--gold); outline-offset:2px; border-radius:4px }
```
**Never write `outline:none` without an equal or better replacement.** Keyboard users must always see where they are.

---

# 7. PAGE TRANSITIONS

Keep short. Long transitions feel slow, not premium.
```
Exit:  fade to 0 + translateY(-8px), 200ms
Enter: fade from 0 + translateY(8px),  250ms
```
Scroll position resets to top on navigation. Nav bar itself never re-animates between pages.

---

# 8. FORBIDDEN MOTION

| Never | Why |
|---|---|
| Scroll-jacking | Breaks user control and accessibility. Never hijack the wheel. |
| Constant parallax | Dated, causes motion sickness, hurts performance. |
| Cursor followers / custom cursors | Portfolio-developer signal — wrong for a public-health professional. |
| WebGL / heavy 3D | Kills mobile performance for zero conversion benefit. |
| Autoplay video with sound | Hostile. Muted preview only. |
| Animation on every element | The clearest amateur tell. |
| Re-animating on scroll-up | Feels broken. |
| Loading screens / preloaders | Adds delay to solve nothing. |
| Text that animates letter-by-letter | Slows reading, hurts screen readers. |
| Anything delaying first content paint | Directly damages conversion. |

---

# 9. ACCESSIBILITY — REDUCED MOTION

Non-negotiable. She is a public-health professional; an inaccessible site contradicts her credibility.

```css
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
    scroll-behavior:auto !important;
  }
  .waveform span{ animation:none; height:40% }
  [data-reveal]{ opacity:1; transform:none }
}
```
```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) { /* render counters at final value, skip mask reveal */ }
```
**Content must never depend on motion to be readable or reachable.**

---

# 10. PERFORMANCE RULES FOR MOTION

- Animate **only** `transform` and `opacity`. Never `width`, `height`, `top`, `left`, or `margin` — they force layout recalculation.
- Use `will-change` sparingly and remove it after the animation completes.
- All scroll effects use `IntersectionObserver`, never a `scroll` event listener.
- If a scroll listener is unavoidable, throttle with `requestAnimationFrame` and mark it `{passive:true}`.
- Target 60fps. Test on a mid-range Android, not just desktop Chrome.
- Total JS for motion should stay under ~15KB. This site needs no animation library — vanilla CSS + IntersectionObserver is sufficient.

---

# 11. MOTION QA CHECKLIST

- [ ] Page content is readable within 1s, regardless of image load
- [ ] No element animates more than once
- [ ] No scroll-jacking anywhere
- [ ] All animations use only transform/opacity
- [ ] `prefers-reduced-motion` fully honoured and manually tested
- [ ] Every interactive element has a visible, styled focus state
- [ ] Hover states respond in under 200ms
- [ ] Waveform appears no more than 3 times per page
- [ ] Stagger never exceeds 6 items
- [ ] 60fps sustained on a mid-range Android device
- [ ] Site remains fully usable with JavaScript disabled
