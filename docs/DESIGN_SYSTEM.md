# Design System — Sway

> The visual language for Sway, the TikTok-style video speed-dating app.
> This is the single source of truth for color, type, spacing, motion and the
> shared component primitives. Every screen spec in `SCREENS.md` references the
> tokens defined here. Update this file whenever a token or primitive changes.

---

## 0. Brand

| Attribute | Value |
|---|---|
| Product name | **Sway** |
| Wordmark | "Sway" set in **Cormorant Garamond, italic, 600** |
| Personality | Minimalist · sensual · warm · playful (not explicit, not cold) |
| Motif | Curves — pill shapes, generous radii, floating organic "blobs", fluid micro-motion |
| Language | English (US) |

The brand expresses heat through **warmth, not darkness**: a near-white canvas for
creation surfaces, deep warm video surfaces, and a rose↔coral accent flirt. **No
purple / violet / magenta anywhere.**

---

## 1. Color

### 1.1 Core palette

```css
:root {
  /* Accents — the rose↔coral "flirt" */
  --accent-coral:   #f5714a;   /* warm orange-coral — gradient start */
  --accent-mid:     #f05a7a;   /* transition stop between coral & rose */
  --accent-rose:    #f0577f;   /* primary rose — buttons, links, active states */
  --accent-hot:     #ff486f;   /* hot red — REC dot, like heart (highest energy) */

  /* Light surfaces (creation flow: Sign-up, Prompts) */
  --canvas:         #fdfaf8;   /* warm near-white — predominant background */
  --ink:            #1a0e12;   /* primary text on light */
  --ink-2:          #2a1016;   /* secondary text on light */

  /* Dark/video surfaces (Recording, Preview, Filters, Feed) */
  --video-ink-a:    #170a0f;   /* recording / preview / filters base */
  --video-ink-b:    #160a0f;   /* feed base */
  --on-dark:        #ffffff;   /* primary text on video */
  --on-dark-soft:   #fbeef0;   /* slightly warm white on video */
  --on-dark-blush:  #ffd9e1;   /* blush highlight on video (tone chips, accents) */
}
```

### 1.2 Text opacity ramp (on light `--canvas`)

Text on light surfaces is always `--ink` / `--ink-2` at a decreasing alpha.
Never use the blush whites from the dark scale on a light surface.

| Token | Value | Use |
|---|---|---|
| `ink/100` | `#1a0e12` | Headlines, field values, "Add a photo" |
| `ink/85` | `#2a1016` | Prompt body text, inactive card text |
| `ink/55` | `rgba(26,14,18,0.55)` | Subtitles / supporting copy |
| `ink/50` | `rgba(26,14,18,0.5)` | Inactive prompt index, "tap to fill" text, footer |
| `ink/45` | `rgba(26,14,18,0.45)` | Disabled / placeholder field text |
| `ink/42` | `rgba(26,14,18,0.42)` | Field helper text |
| `ink/40` | `rgba(26,14,18,0.4)` | Eyebrow / field labels (uppercase) |
| `ink/35` | `rgba(26,14,18,0.35)` | Faint hints |
| `ink/30` | `rgba(26,14,18,0.3)` | Lowest-emphasis |

### 1.3 Text opacity ramp (on dark/video surfaces)

| Token | Value | Use |
|---|---|---|
| `on-dark/100` | `#ffffff` | Names, primary overlay text, button labels |
| `on-dark/soft` | `#fbeef0` | Top-bar labels, icons |
| `on-dark/blush` | `#ffd9e1` | Tone chip text, accent words inside captions |
| `on-dark/88` | `rgba(255,255,255,0.88)` | Caption body |
| `on-dark/85` | `rgba(255,255,255,0.85)` | Meta chips |
| `on-dark/75…0.45` | `rgba(247,232,236, …)` | Secondary overlay text (eyebrows, timers, "/0:45") |
| `on-dark/0.26–0.30` | `rgba(247,232,236,0.26–0.30)` | Monospace placeholder tags |

### 1.4 Gradients

All accent gradients run **coral → rose** (warm to cool). Never reverse to a
purple-leaning hue.

```css
--grad-cta:      linear-gradient(110deg, #f5714a, #f05a7a 48%, #f0577f); /* primary buttons */
--grad-pill:     linear-gradient(120deg, #f5714a, #f0577f);             /* token pills, label chips */
--grad-progress: linear-gradient(90deg,  #f5714a, #f0577f);             /* progress bars / segments */
--grad-chip:     linear-gradient(135deg, #f5714a, #f0577f);             /* numbered badges, follow +, record square */
--grad-avatar:   linear-gradient(150deg, #f5714a, #f0577f);             /* avatar placeholders */
```

**Light-surface ambient blobs** (decorative, low alpha, blurred):
```css
/* rose blob */   radial-gradient(circle, rgba(240,87,127,0.22), transparent 70%)
/* coral blob */  radial-gradient(circle, rgba(245,113,74,0.22), transparent 70%)
/* canvas wash */ radial-gradient(120% 70% at 85% -8%, rgba(240,87,127,0.20), transparent 55%),
                  radial-gradient(100% 60% at -15% 112%, rgba(245,113,74,0.18), transparent 55%)
```

**Dark video surfaces** — simulate a warm-lit portrait (replace with real `<video>` in prod):
```css
/* warm key-light + body + vignette, layered top→bottom */
background:
  radial-gradient(72% 44% at 50% 24%, rgba(255,192,176,0.34), transparent 62%),
  linear-gradient(180deg, #3c1c24 0%, #2a1016 56%, #170a0f 100%);
/* + film grain overlay: */
background-image: repeating-linear-gradient(118deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 11px);
/* + vignette: */
background: radial-gradient(120% 95% at 50% 48%, transparent 52%, rgba(10,4,6,0.6));
```
Camera-base hues per screen: Recording `#3c1c24→#2a1016→#170a0f`; Preview
`#3a1d26→#281017→#160a0f`; Filters (vivid) `#46203a→#2c1222→#160a10`; Feed
`#3c1d26→#2a1117→#160a0f`.

---

## 2. Typography

### 2.1 Families

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

| Role | Family | Notes |
|---|---|---|
| **Display** | `'Cormorant Garamond', serif` | **Italic** is the signature voice. Used for the wordmark, all headlines, spoken-prompt quotes, profile names, and the filter "T" tool glyph. Weights 500 / 600 / 700. |
| **UI / body** | `'Outfit', sans-serif` | Geometric, soft-cornered. Body copy, labels, buttons, meta, counts. Weights 300–700. |
| **Mono** | system `monospace` | Only for `[ placeholder ]` tags in video areas. |

### 2.2 Type scale

| Token | Size / line | Family · weight · style | Used for |
|---|---|---|---|
| `display-xl` | 72px / 1.0 | Cormorant · 600 · italic | Canvas title block only |
| `display-1` | 46px / 0.98 | Cormorant · 500 · italic | Sign-up headline ("Make your entrance") |
| `display-2` | 42px / 1.0 | Cormorant · 500 · italic | Prompts headline ("Make it yours") |
| `display-3` | 30px / 1.0 | Cormorant · 500 · italic | Preview headline; Feed-B name (n/a here) |
| `quote` | 27px / 1.28 | Cormorant · 500 · italic | Recording spoken-prompt quote |
| `name` | 25px / 1.0 | Cormorant · 600 · italic | Feed profile name |
| `wordmark-sm` | 26px | Cormorant · 600 · italic | In-screen "Sway" (sign-up) |
| `wordmark-feed` | 19px | Cormorant · 600 · italic | Feed top brand |
| `card-index` | 22px | Cormorant · 600 · italic | Prompt card numbers (01/02/03) |
| `body` | 14.5–16px / 1.5–1.7 | Outfit · 400 | Supporting copy, prompt body, captions |
| `button` | 15.5–17px | Outfit · 600 | CTA labels |
| `field` | 16.5px | Outfit · 400 | Input values |
| `meta` | 11–13.5px | Outfit · 400–600 | Counts, chips, timers, hints |
| `eyebrow` | 10.5–11px, `letter-spacing:1.6–2px`, `text-transform:uppercase` | Outfit · 400–500 | Field labels, section eyebrows |

Always apply `-webkit-font-smoothing:antialiased` (the device frame already sets it).

---

## 3. Spacing, radii, layout

### 3.1 Device frame
All screens render inside `IOSDevice` (see `ios-frame.jsx`): **402 × 874 px**,
corner radius **48px**, dark dynamic island, status bar forced white via
`dark={true}`, bottom home indicator. Screen content is a single
`position:relative; width:100%; height:100%; overflow:hidden` root.

### 3.2 Safe-area padding
| Edge | Value | Reason |
|---|---|---|
| Top of content | **78px** (light screens) / first element at **64–66px** (video screens) | Clears status bar + dynamic island |
| Sides | **26–30px** (light), **18px** (video overlays) | — |
| Bottom | **26–30px** (light), **46–62px** (video controls) | Clears home indicator |

### 3.3 Radii

| Token | Value | Use |
|---|---|---|
| `r-pill` | `999px` | Buttons, chips, tokens, segments, glass bars |
| `r-field` | `17px` | Text inputs |
| `r-card` | `24px` | Prompt cards |
| `r-thumb` | `18px` | Filter thumbnails (active: `20px`) |
| `r-sticker` | `14px` | Emoji sticker selection box |
| `r-square` | `9px` | Record-button inner square |
| `r-device` | `48px` | Device bezel (from frame) |

### 3.4 Vertical rhythm (gaps)
- Field stack / card stack: **13–14px**
- Between content groups (headline→avatar, fields→CTA): **24–30px**
- Right-rail action items (feed): **22px**
- Inline icon↔label: **5–9px**

---

## 4. Elevation & surfaces

| Token | Value | Use |
|---|---|---|
| `shadow-cta` | `0 12px 32px rgba(245,113,74,0.40)` | Primary buttons |
| `shadow-card-glow` | `0 0 30px rgba(240,87,127,0.18)` | Active prompt card |
| `shadow-chip` | `0 6px 18px rgba(245,113,74,0.45)` | Active filter tool button |
| `shadow-label` | `0 1px 3px rgba(0,0,0,0.08)` | Canvas frame labels |
| `shadow-icon-video` | `drop-shadow(0 2px 6px rgba(0,0,0,0.4))` | Icons / text over video |
| `glow-segment` | `0 0 10px rgba(240,87,127,0.5)` | Active recording segment |

**Glass (Liquid-glass) surface** — used for every floating control over video:
```css
background: rgba(20,10,14,0.42–0.50);
backdrop-filter: blur(12–14px); -webkit-backdrop-filter: blur(12–14px);
border: 1px solid rgba(255,255,255,0.12–0.16);
```
Light translucent variant (re-record button, play badge): `background:rgba(255,255,255,0.07–0.14); border:1px solid rgba(255,255,255,0.18–0.22)`.

**Light-surface inputs:** `background:rgba(240,87,127,0.05); border:1px solid rgba(26,14,18,0.12)`.
**Light-surface cards (inactive):** `background:rgba(255,255,255,0.92); border:1px solid rgba(240,87,127,0.25)`.
**Light-surface card (active):** `background:rgba(240,87,127,0.08); border:1.5px solid rgba(240,87,127,0.55)` + `shadow-card-glow`.

---

## 5. Iconography

- **Style:** thin line icons, `stroke-width` **1.6–1.8**, `stroke-linecap/linejoin:round`, 20–24px viewBox. Filled only for emphasis (heart, REC dot, comment bubble in feed).
- **Color:** `--on-dark-soft` (`#fbeef0`) on video; `--ink` on light.
- **Heart (like):** filled `--accent-hot` `#ff486f`.
- **Over-video icons:** always add `shadow-icon-video`.
- Never hand-draw illustrative SVG — only functional UI glyphs. Real photographic
  content is a `<video>`/`<img>`; here it is a placeholder (see §7).

---

## 6. Motion

Curved, soft, ambient. All easing `ease-in-out` unless noted. Defined as global keyframes:

```css
@keyframes swayBlob  { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(16px,-20px) scale(1.1);} }
@keyframes swayBlob2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-18px,14px) scale(1.12);} }
@keyframes recPulse  { 0%,100%{opacity:1;} 50%{opacity:0.3;} }           /* REC dot */
@keyframes ringOut   { 0%{transform:scale(1);opacity:0.6;} 75%{transform:scale(1.5);opacity:0;} 100%{opacity:0;} } /* record button halo */
@keyframes caretBlink{ 0%,100%{opacity:1;} 50%{opacity:0;} }            /* typing caret (step-end) */
@keyframes bob       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-7px);} } /* pose hint, swipe hint */
```

| Animation | Target | Timing |
|---|---|---|
| `swayBlob` | Sign-up rose blob | `9s ease-in-out infinite` |
| `swayBlob2` | Prompts coral blob | `11s ease-in-out infinite` |
| `recPulse` | Recording REC dot | `1.1s ease-in-out infinite` |
| `ringOut` | Record-button halo ring | `1.8s ease-out infinite` |
| `caretBlink` | Prompt typing caret | `1s step-end infinite` |
| `bob` | Pose hint `4s`, swipe hint `2.4s` | `ease-in-out infinite` |

Transitions between screens (real app): use soft fades / slide-ups, 250–350ms, `cubic-bezier(0.22,0.61,0.36,1)`.

---

## 7. Media placeholders → real content

In this prototype every video/photo is a CSS placeholder. In production:

| Placeholder | Replace with |
|---|---|
| Camera/video gradient + grain + vignette + `[ … ]` mono tag | Live `<video>` (recording) or Mux `<video playsinline autoplay>` (feed/preview). Keep the **vignette + bottom scrim** overlays for text legibility. |
| Avatar gradient circles | User `avatarUrl` (`object-fit:cover`) with the same border treatment |
| Filter thumbnails (gradient swatches) | Real filtered frame thumbnails |

Keep the scrim gradients (`linear-gradient(180deg, rgba(10,4,6,0.45)…rgba(10,4,6,0.85))`) over real video so overlay text stays readable.

---

## 8. Component primitives

> Map to `src/components/ui/` (shadcn-based) where possible.

### 8.1 Primary button (`<Button variant="primary">`)
```
height: 56–58px; border-radius: 999px;
background: var(--grad-cta);
color: #fff; font: Outfit 600 / 15.5–17px; letter-spacing:0.2px;
box-shadow: var(--shadow-cta);
/* optional trailing chevron / leading check icon, 17px, stroke #fff */
```

### 8.2 Ghost button (`variant="ghost"`, over video)
```
height: 56px; border-radius: 999px;
background: rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18);
color: #fbeef0; font: Outfit 500 / 15.5px;
```

### 8.3 Text field (light)
```
height: 52px; border-radius: 17px;
background: rgba(240,87,127,0.05); border:1px solid rgba(26,14,18,0.12);
padding: 0 18px; font: Outfit 400 / 16.5px; color: var(--ink);
/* label above: eyebrow token, color ink/40, margin-bottom 7px, padding-left 4px */
```

### 8.4 Token pill (fill-in-the-blank, filled)
```
display:inline-block; border-radius:999px; padding:1px 11px;
background: var(--grad-pill); color:#fff; font: Outfit 500 / 14.5px;
vertical-align:middle;
```
Empty variant: `border:1.3px dashed rgba(240,87,127,0.55); color:ink/50; padding:1px 13px; font-size:13.5px;` label "tap to fill".

### 8.5 Glass pill / bar (over video)
See §4 "Glass". Heights: 38px (top bar), 40–44px (icon circles), 999px radius.

### 8.6 Meta chip
```
font: Outfit 400 / 11.5px; padding:4px 11px; border-radius:999px;
/* on video */ background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.85);
```

### 8.7 Action item (feed rail): icon (28–32px) + count (Outfit 600 / 12.5px, `#fff`), stacked, gap 5px. Heart filled `#ff486f`.

### 8.8 Canvas frame label (design-doc chrome only — not in app)
Pill `rgba(255,255,255,0.72)`, `shadow-label`, numbered badge `var(--grad-chip)`.

---

## 9. Hard rules

1. **No purple / violet / magenta.** Accents are coral `#f5714a` ↔ rose `#f0577f` only.
2. Light creation surfaces use `--canvas #fdfaf8`; video surfaces stay deep & warm.
3. Headlines, names, the wordmark and spoken prompts are **always Cormorant italic**.
4. Everything functional (buttons, fields, labels, counts) is **Outfit**.
5. Corners are generous: pills `999px`, cards `24px`, fields `17px`. No sharp 0–4px corners except the record square.
6. Motion is slow and curved; nothing snappy or linear.
7. Over real video, always keep a vignette + bottom scrim for legibility.
