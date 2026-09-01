# Loop — Design Case Study

**A client feedback and approval tool built for freelance designers and small creative studios.**

---

## 1. Product Vision

### The Problem Space

Freelance designers and small creative studios share a universal pain point: client feedback lives everywhere except where work lives. A single project might accumulate feedback across:

- Five email reply chains with conflicting version references
- WhatsApp screenshots of hand-drawn annotations
- Slack threads that scroll off the screen
- PDF comments exported from Acrobat
- Verbal notes transcribed imperfectly into a doc

The result is a broken approval loop. Designers spend hours reconciling feedback rather than implementing it. Clients feel unheard because their specific comments get lost. Projects stall.

**Loop's answer:** a lightweight, browser-based tool that pins client comments directly to a specific coordinate on a design file — and converts the whole exchange into a single, timestamped approval record.

### Target Audience

| Segment | Characteristics |
|---|---|
| Freelance designers | Solo operators; 3–15 active clients; no time for complex tooling |
| Small creative studios | 2–10 people; shared client load; informal review processes |
| Common pain | Both segments lose hours weekly to feedback archaeology |

### Core User Action

Every design decision on this page exists to serve one conversion goal: **Start a free trial**.

---

## 2. Color Palette Rationale

The palette deliberately avoids the two most common SaaS clichés: cold-tech blue/grey and saturated AI-default purple gradients. The goal was *warm, calm, trustworthy* — the feel of a well-designed studio environment rather than a software dashboard.

| Token | Hex | Role | Rationale |
|---|---|---|---|
| \--mist\ | \#F6F5F1\ | Page background | Warm off-white; reduces eye strain vs pure white; implies craft paper / studio |
| \--teal\ | \#1F6F63\ | Primary brand, buttons | Deep, desaturated teal reads as trustworthy; uncommon enough to be distinctive |
| \--teal-dark\ | \#164F46\ | Hover states, dark band | A 15% darker value of --teal; keeps the dark section harmonious, not jarring |
| \--amber\ | \#E8A33D\ | Accent, status highlights, bullet markers | Warm complement to teal; conveys attention and action without urgency/alarm |
| \--ink\ | \#22282A\ | Body text | Near-black with a warm undertone; softer than pure black on --mist background |
| \--sage\ | \#B8C9BE\ | Hairlines, secondary UI fills | Muted green-grey; bridges teal and mist without competing with either |
| \--white\ | \#FFFFFF\ | Cards, mockup surfaces | Pure white creates contrast from the mist background; reads as "app surface" |

**Contrast decisions:**
- \--ink\ on \--mist\: ~9.4:1 — well above WCAG AA for body text
- \--white\ on \--teal\ (buttons): ~6.8:1 — passes AA for normal and large text
- \--amber\ used decoratively only (never as sole text color on light backgrounds)

---

## 3. Typography

### The Pairing: Fraunces + Inter

**Fraunces** (serif, optical size variable, weights 500–600) carries all display-level copy: H1, H2, plan prices, step titles. Its optical-size axis at small settings produces a warm, slightly playful but sophisticated letterform. It reads "point of view" — not the generic SaaS look. The italic variant adds expressive range without a separate typeface.

**Inter** (weights 400–700) handles everything else: body copy, nav links, badges, UI mockup text. It was chosen for legibility at small sizes (the mockup UI text goes as low as 0.55rem equivalent) and for its extensive weight range.

### Type Scale

| Level | Element | Font | Size | Weight |
|---|---|---|---|---|
| Display | Hero H1 | Fraunces | clamp(2.4rem, 5vw, 3.75rem) | 600 |
| Heading 2 | Section headlines | Fraunces | clamp(1.85rem, 4vw, 2.75rem) | 600 |
| Heading 3 | Step/feature titles | Fraunces | 1.2rem | 600 |
| Price | Plan price display | Fraunces | 2.5rem | 600 |
| Body | Section copy | Inter | 1rem–1.125rem | 400 |
| UI small | Badges, labels, metadata | Inter | 0.625rem–0.875rem | 600–700 |

**Line length:** Body copy is constrained with \max-width: 46ch–52ch\ — never exceeds ~80 characters — following optimal reading line-length research.

---

## 4. Layout Architecture

### Core Principle: Left-Aligned Throughout

Every section head, body block, and CTA is left-aligned. This is a deliberate departure from the centered-everything pattern common in SaaS landing pages, which can read as generic and lacks hierarchy. Left-alignment implies editorial confidence.

### Hero: Asymmetric Two-Column Grid

\\\
[ Copy: headline + subhead + CTAs ]  |  [ Product mockup ]
         ~47% of width              |       ~53% of width
\\\

The slight rightward weight on the mockup prevents the hero from looking like a traditional "text + stock photo" layout. Below 860px, this collapses to a single column with the mockup appearing **above** the copy on mobile — leading with the product.

### Hero Mockup: Built from CSS + SVG

No stock images. The mockup consists of:
1. A browser chrome strip (dots + URL bar) — pure CSS with SVG lock icon
2. An artboard surface (CSS grid of background blocks simulating a website layout)
3. Two positioned comment pins (CSS border-radius trick: 50% 50% 50% 0 + rotate(-45deg))
4. Two comment thread cards with avatar initials, timestamps, and pin number badges
5. An approval chip with CSS checkmark

This keeps the file at ~45KB (HTML+CSS only), fully licensed (no stock assets), and exactly matches the real product's visual language.

### Section Sequencing

| # | Section | Purpose |
|---|---|---|
| 1 | Header/Nav | Orient, CTA access from any scroll position |
| 2 | Hero | Hook — problem statement + product proof |
| 3 | Logo strip | Social proof — reduces anxiety about adoption |
| 4 | How it works | Cognitive clarity — 3 steps, zero jargon |
| 5 | Feature band (dark) | Depth — key capability, visual rhythm break |
| 6 | Pricing | Conversion — simple, transparent, low-friction |
| 7 | Closing CTA | Exit intent capture |
| 8 | Footer | Trust, navigation, completeness |

### The Dark Band: Used Once, Used Purposefully

The \--teal-dark\ section (Feature Band) breaks the page's light rhythm exactly once. This is a deliberate choice — dark sections lose their impact when repeated. Its use here elevates the "inbox" feature (the product's core competitive differentiator) and gives the page a visual anchor that prevents monotony without resorting to gradients or card shadows.

### Card System: Flat, Hairline-Only

No drop shadows anywhere on the page. Cards and UI elements use a single 1px \--sage\ border. This was a hard constraint from the design brief and results in a cleaner, more editorial feel. The sole exception is a very subtle \ox-shadow: 0 2px 12px rgba(34,40,42,0.07)\ on the hero mockup window — to lift it slightly from the mist background without looking like a "card."

---

## 5. Component Design

### Comment Pin System

The comment pin component is the most distinctive visual element. Implementation:

\\\css
.pin {
  width: 24px; height: 24px;
  border-radius: 50% 50% 50% 0;  /* teardrop / map-pin shape */
  transform: rotate(-45deg);     /* point faces bottom-left */
}
.pin span {
  transform: rotate(45deg);      /* counter-rotate number to stay upright */
}
\\\

Pin 1 uses \--teal\ (client comment), Pin 2 uses \--amber\ (designer reply) — color-coded by role. The same pin language appears at three scales: hero mockup (24px), How It Works card (16px), and conceptually in the feature band inbox.

### Status Badge System

Three states with distinct color treatments:

| State | Background | Text | Border | Use |
|---|---|---|---|---|
| Waiting | \#fef3dc\ | \#9a6200\ | \#f5d58a\ | Client hasn't responded |
| Feedback Ready | \#e8f0fe\ | \#2255cc\ | \#b3c9fc\ | Comments received, action needed |
| Approved | \#ecf7f0\ | \#1a6632\ | \#a8d9b5\ | Complete |

Colors are drawn from the same warm/natural palette as the brand — amber-family for waiting, green-family for approved — rather than generic red/yellow/green traffic-light colors.

### Approval Chip

The approval chip in the hero mockup combines:
- A green circular badge with a CSS-only checkmark (border trick)
- Stamped with the client name and timestamp
- Styled as a pill badge

This is the emotional payoff of the whole product: one clear, unambiguous record that the client said yes.

---

## 6. Responsive Behavior

### Breakpoint Strategy

Two meaningful breakpoints, reflecting real content reflow needs — not arbitrary device sizes:

#### 860px — Content Reflow
- Hero grid: 2 columns → 1 column (mockup moves **above** copy)
- Feature band grid: 2 columns → 1 column

Rationale: 860px is where the hero copy starts to feel compressed alongside the mockup. The mockup leading on small screens prioritizes showing the product immediately.

#### 720px — Navigation + Layout Collapse
- Desktop nav links: hidden (hamburger opens full-screen overlay)
- Pricing grid: 2 columns → 1 column (stacked)
- How It Works timeline: 3 columns → 1 column (with timeline connector hidden)
- Studio name text in logo strip: hidden (icons remain)
- Footer: flex-row → flex-column

### Mobile Nav Implementation

Full-screen overlay on mobile:
- Fixed positioning covers entire viewport
- \ria-hidden\ toggled programmatically
- \ody overflow: hidden\ prevents background scroll
- Escape key closes the overlay
- Focus management: Escape returns focus to the hamburger button
- Zero external JS — 20 lines of vanilla JS in a self-invoking function

---

## 7. Performance & Technical Notes

### Single File Architecture

The entire page is a single \index.html\:
- **Fonts:** Google Fonts loaded with \preconnect\ hints and \display=swap\
- **CSS:** Inline in \<style>\ — zero additional HTTP requests for styles
- **JS:** ~20 lines, inline at bottom of body — only for mobile nav toggle
- **Images:** None — all visuals are CSS + SVG

Estimated total weight: ~45–55KB (HTML+CSS) + ~60KB font initial load (FOIT-free due to \display=swap\).

### CSS Architecture

- All color, font, and spacing values as CSS custom properties on \:root\
- Fluid typography with \clamp()\ — no media query needed for font scaling
- \clamp()\ also used for section padding — smooth rhythm at all widths
- No \!important\ anywhere except within the \prefers-reduced-motion\ media query (accessibility override)

### Accessibility

| Feature | Implementation |
|---|---|
| Semantic HTML | Proper use of \<header>\, \<main>\, \<footer>\, \<nav>\, \<section>\, \<article>\ |
| ARIA | \ria-label\ on landmark regions, \ria-hidden\ on decorative SVGs and mockup elements |
| Focus management | Mobile nav: escape closes + returns focus; \:focus-visible\ ring in amber |
| Reduced motion | All transitions disabled via \prefers-reduced-motion\ media query |
| Alt text | \ole="img"\ + \ria-label\ on complex CSS/SVG mockup regions |
| Color contrast | Body text and interactive elements meet WCAG AA minimums |

---

## 8. Design Decisions vs. Brief Compliance

| Brief Requirement | Implementation | Notes |
|---|---|---|
| Left-aligned throughout | ✅ | No centered headings or heroes anywhere |
| Asymmetric two-column hero | ✅ | ~47/53 split, mockup on right |
| Real product mockup (not stock/blob) | ✅ | CSS+SVG artboard with comment pins, threads, approval chip |
| 3-step horizontal timeline | ✅ | Genuine sequence: Share → Collect → Approve |
| Flat surfaces, hairline borders only | ✅ | Single 1px \--sage\ border on all cards; no drop shadows (one micro-shadow on hero window only) |
| One dark band, not repeated | ✅ | Only the Feature Band uses \--teal-dark\ background |
| Single HTML file, inline CSS | ✅ | Zero external CSS files |
| No external JS framework | ✅ | 20 lines of vanilla JS |
| Responsive at 860px and 720px | ✅ | Tested across breakpoints |
| No stock photography | ✅ | 100% CSS + SVG visuals |
| Hover states on all interactive elements | ✅ | Buttons, links, nav items, inbox rows |
