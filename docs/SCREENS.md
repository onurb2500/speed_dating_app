# Screen Specs — Sway

> Pixel-precise build instructions for every screen, for implementation against
> the React/Next.js codebase described in `ARCHITECTURE.md` and the journeys in
> `FLOWS.md`. All tokens (colors, gradients, type, radii, shadows, motion) are
> defined in `DESIGN_SYSTEM.md` — this doc references them and gives the exact
> per-element values.
>
> **Reference canvas size:** every screen is a `402 × 874` viewport rendered inside
> the `IOSDevice` frame (radius 48, dynamic island, white status bar, home
> indicator). Coordinates below are relative to that 402×874 content box. "from
> top" = distance from the very top of the screen (status bar overlays the top
> ~60px; keep primary content below it).
>
> Build order follows `FLOWS.md`: Sign-up → Prompt customization → Recording →
> Preview → Filters/Emoji → Feed.

---

## Conventions

- **Root of every screen:** `position:relative; width:100%; height:100%; overflow:hidden;` + the screen's base `background` + base `font-family:'Outfit'` + base text color.
- **Light screens** (1–2): base `background:#fdfaf8; color:#1a0e12`. Column layout, `padding:78px <side> <bottom>`, a `flex:1` spacer pushes the CTA to the bottom.
- **Video screens** (3–6): base dark; the camera/video fills `position:absolute; inset:0`; all UI is absolutely positioned over it.
- Routes/components reference `ARCHITECTURE.md`'s frontend tree.

---

## 1. Sign-up / Profile setup

- **Route:** `src/app/(auth)/` → on success continue to profile setup, then `POST /users/me`.
- **Flow ref:** FLOWS §1 (Registration & Onboarding).
- **Component:** `AuthProfileScreen` (form fields + avatar uploader).
- **Surface:** LIGHT.

### Background
- Root `background:#fdfaf8`.
- Ambient wash (`absolute; inset:0`):
  `radial-gradient(120% 70% at 85% -8%, rgba(240,87,127,0.20), transparent 55%), radial-gradient(100% 60% at -15% 112%, rgba(245,113,74,0.18), transparent 55%), #fdfaf8`.
- Floating rose blob: `300×300`, `top:-90px; right:-90px`, `radial-gradient(circle, rgba(240,87,127,0.22), transparent 70%)`, `filter:blur(20px)`, `animation:swayBlob 9s ease-in-out infinite`.

### Layout map (top → bottom), content padding `78px 30px 30px`, flex column
1. **Wordmark "Sway"** — Cormorant italic 600, 26px, `letter-spacing:0.5px`, color `#1a0e12`.
2. **Headline "Make your<br>entrance"** — `margin-top:26px`; Cormorant italic 500, **46px**, `line-height:0.98`, `#1a0e12`.
3. **Subtitle** — `margin-top:14px`; Outfit 15px / 1.5; `color:rgba(26,14,18,0.55)`; `max-width:280px`. Copy: "A name, a face — that's all it takes before the camera rolls."
4. **Avatar uploader row** — `margin-top:30px; display:flex; align-items:center; gap:16px`:
   - Circle `84×84`, `border-radius:50%`, `background:linear-gradient(150deg, rgba(240,87,127,0.18), rgba(245,113,74,0.18))`, `border:1.5px dashed rgba(240,87,127,0.55)`, centered `+` glyph (30px, weight 300, `rgba(26,14,18,0.65)`). → opens file picker; on select, fill with `avatarUrl` `object-fit:cover`.
   - Text block: title "Add a photo" (Outfit 500 / 15px, `#1a0e12`) + helper "Soft light works wonders" (Outfit 13px, `rgba(26,14,18,0.42)`, `margin-top:2px`).
5. **Field stack** — `margin-top:26px; display:flex; flex-direction:column; gap:13px`. Each field = label + input:
   - Label (eyebrow): Outfit 10.5px, `letter-spacing:1.6px`, uppercase, `color:rgba(26,14,18,0.4)`, `margin-bottom:7px; padding-left:4px`.
   - Input: `height:52px; border-radius:17px; background:rgba(240,87,127,0.05); border:1px solid rgba(26,14,18,0.12); padding:0 18px;`.
   - **Display name** — value Outfit 16.5px `#1a0e12` (e.g. "Luna").
   - **Email** — placeholder Outfit 16.5px `rgba(26,14,18,0.4)` ("luna@email.com"); `type=email`.
   - **Password** — `font-size:20px; letter-spacing:3px; color:rgba(26,14,18,0.65)` dots; `type=password`.
6. **Spacer** `flex:1`.
7. **Primary CTA "Start swaying"** — `height:58px; border-radius:999px; background:linear-gradient(110deg,#f5714a,#f05a7a 48%,#f0577f); color:#fff; Outfit 600 / 17px; letter-spacing:0.2px; box-shadow:0 12px 32px rgba(245,113,74,0.40)`. → `POST /auth/register` then `POST /users/me`.
8. **Footer** — `margin-top:16px; text-align:center;` Outfit 13.5px `rgba(26,14,18,0.5)`: "Already swaying? " + `<a>`Log in`</a>` (`color:#f0577f; font-weight:500`).

### States
- Inline validation error (e.g. email taken, FLOWS §1): show 12px message in `--accent-rose` directly under the offending field; field border → `1px solid #f0577f`.
- CTA disabled until name + valid email + password ≥ 8: reduce gradient to 45% opacity, remove shadow.

---

## 2. Prompt customization

- **Route:** `src/app/record/prompts/` (pre-recording). **Flow ref:** FLOWS §2.2.
- **Component:** `PromptCustomizer` → 3 `PromptCard`s with editable fill-in tokens.
- **Surface:** LIGHT.

### Background
- Root `#fdfaf8`. Wash: `radial-gradient(110% 60% at -10% -8%, rgba(240,87,127,0.18), transparent 55%), radial-gradient(110% 60% at 110% 108%, rgba(245,113,74,0.16), transparent 55%), #fdfaf8`.
- Coral blob: `260×260`, `bottom:-80px; left:-70px`, `radial-gradient(circle, rgba(245,113,74,0.22), transparent 70%)`, `filter:blur(22px)`, `animation:swayBlob2 11s ease-in-out infinite`.

### Layout map, content padding `78px 26px 26px`, flex column
1. **Headline "Make it yours"** — Cormorant italic 500, **42px**, `line-height:1`, `#1a0e12`.
2. **Subtitle** — `margin-top:12px`; Outfit 14.5px / 1.5; `rgba(26,14,18,0.55)`; `max-width:300px`: "Fill in the blanks. The little details make people grin."
3. **Card stack** — `margin-top:24px; display:flex; flex-direction:column; gap:14px`. Three `PromptCard`s:

   **Active card (card 1):** `border-radius:24px; padding:18px 18px 19px; background:rgba(240,87,127,0.08); border:1.5px solid rgba(240,87,127,0.55); box-shadow:0 0 30px rgba(240,87,127,0.18)`.
   - Index "01": Cormorant italic 600, 22px, `color:#f0577f`, `margin-bottom:9px`.
   - Body: Outfit 16px / 1.7, `#1a0e12`, with inline **filled tokens**: `display:inline-block; background:linear-gradient(120deg,#f5714a,#f0577f); color:#fff; padding:1px 11px; border-radius:999px; font:Outfit 500/14.5px; vertical-align:middle`.
   - Caret (in the actively-edited token): `display:inline-block; width:1.5px; height:14px; background:#f0577f; margin-left:3px; vertical-align:-2px; animation:caretBlink 1s step-end infinite`.
   - Copy: "My favorite Disney character is `[Minnie]` — but not the classic one. Mine's `[in sneakers, ripped]`".

   **Inactive cards (2, 3):** `border-radius:24px; padding:18px; background:rgba(255,255,255,0.92); border:1px solid rgba(240,87,127,0.25)`.
   - Index "02"/"03": Cormorant italic 600, 22px, `color:rgba(26,14,18,0.5)`.
   - Body: Outfit 16px / 1.7, `#2a1016`, with **empty token**: `border:1.3px dashed rgba(240,87,127,0.55); color:rgba(26,14,18,0.5); padding:1px 13px; border-radius:999px; font-size:13.5px` → label "tap to fill".
   - Copy 2: "If I could instantly master one skill, it'd be `[tap to fill]`". Copy 3: "My perfect lazy afternoon looks like `[tap to fill]`".
4. **Spacer** `flex:1`.
5. **Primary CTA "Looks good — let's record"** — same as §1.7 CTA (gap:9px to a trailing arrow SVG 17px, stroke `#fff`, path `M5 12h14M13 6l6 6-6 6`). → navigate to Recording with the personalized prompt array.

### Interaction
- Tapping a token turns it into an inline text input; live-update the body text (FLOWS §2.2 "Live preview"). The card being edited gets the active treatment; others revert to inactive.

---

## 3. Recording (with prompt + pose overlay)

- **Route:** `src/app/record/`. **Flow ref:** FLOWS §2 / §2.1.
- **Components:** `RecordingScreen` (camera) + `RecordingTopBar` + `SegmentBar` + `PoseGuide` + `PromptOverlay` + `RecordControls` (+ `CountdownTimer` precedes recording).
- **Surface:** VIDEO/DARK. Base `background:#170a0f; color:#f7e8ec`.

### Camera (absolute, inset:0 — replace with live `<video>`)
- Key-light + body gradient: `radial-gradient(72% 44% at 50% 24%, rgba(255,192,176,0.34), transparent 62%), linear-gradient(180deg,#3c1c24 0%,#2a1016 56%,#170a0f 100%)`.
- Grain overlay: `repeating-linear-gradient(118deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 11px)`.
- Vignette: `radial-gradient(120% 95% at 50% 48%, transparent 52%, rgba(10,4,6,0.6))`.
- Center mono tag `[ LIVE CAMERA ]` at `top:43%` — remove in prod.

### Overlay elements (all absolute)
1. **Top bar** — `top:66px; left:18px; right:18px; height:38px; border-radius:999px; padding:0 8px 0 16px`; glass (`background:rgba(20,10,14,0.5); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.12)`); `display:flex; align-items:center; justify-content:space-between`:
   - Left: "Q1 " (Outfit 600 / 13px `#fbeef0`) + "of 3" (Outfit 400, `rgba(247,232,236,0.5)`). Drives off `currentPromptIndex`.
   - Center: timer "0:12 " `#fbeef0` + "/ 0:45" `rgba(247,232,236,0.45)`, Outfit 500 / 14px, `font-variant-numeric:tabular-nums`.
   - Right: REC capsule `background:rgba(240,87,127,0.18); border-radius:999px; padding:5px 11px 5px 9px; gap:6px` → dot `8×8` circle `#ff486f`, `box-shadow:0 0 8px #ff486f`, `animation:recPulse 1.1s ease-in-out infinite` + "REC" (Outfit 700 / 11.5px, `letter-spacing:1px`, `#ffd9e1`).
2. **Segment bar** — `top:114px; left:18px; right:18px; display:flex; gap:6px`. Three bars `flex:1; height:4px; border-radius:99px`. Active (current question) = `linear-gradient(90deg,#f5714a,#f0577f)` + `box-shadow:0 0 10px rgba(240,87,127,0.5)`; inactive = `rgba(255,255,255,0.18)`.
3. **Pose hint** — `top:150px; left:50%; transform:translateX(-50%)`; glass pill (`background:rgba(20,10,14,0.42); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.12); border-radius:999px; padding:9px 16px; gap:9px`); `animation:bob 4s ease-in-out infinite`. Contents: sparkle SVG 16px (fill `#ffd9e1`) + text Outfit 13.5px `#fbeef0` ("Lean in. Soften the smile."). Text cycles with the pose schedule (FLOWS §2.1).
4. **Current spoken prompt** — block `left:26px; right:26px; bottom:188px; text-align:center`:
   - Eyebrow "Say it your way": Outfit 11px, `letter-spacing:2px`, uppercase, `rgba(247,232,236,0.5)`, `margin-bottom:12px`.
   - Quote: Cormorant italic 500, **27px** / 1.28, `color:#fff`, `text-shadow:0 2px 18px rgba(0,0,0,0.5)`. E.g. "“My favorite Disney character is…”".
   - Tone chip (`margin-top:16px`, inline-flex, `background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.16); border-radius:999px; padding:6px 14px; gap:7px`): "tone" (12px `rgba(247,232,236,0.6)`) · 3px dot · "warm & playful" (Outfit 500 / 12.5px `#ffd9e1`).
5. **Controls row** — `bottom:62px; left:0; right:0; display:flex; align-items:center; justify-content:center; gap:46px`:
   - **Flip camera** (left): `46×46` circle, `background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.16)`, camera-rotate SVG 22px stroke `#fbeef0`.
   - **Record button** (center): `80×80` wrapper; halo ring `absolute; inset:0; border-radius:50%; border:2px solid rgba(240,87,127,0.6); animation:ringOut 1.8s ease-out infinite`; ring `80×80; border:4px solid #fff; border-radius:50%`; inner square `30×30; border-radius:9px; background:linear-gradient(135deg,#f5714a,#f0577f)` (square = "recording"; show a filled circle when idle). → start/stop `MediaRecorder`.
   - **Gallery** (right): `46×46; border-radius:14px`, glass, thumbnail `linear-gradient(135deg,#3c1c24,#f5714a)`.

### Pre-roll
`CountdownTimer`: full-screen 3-2-1 over the camera before recording (FLOWS §2). Big Cormorant italic numerals, center, fade each.

---

## 4. Preview the take

- **Route:** `src/app/record/preview/`. **Flow ref:** FLOWS §2 (Preview screen).
- **Components:** `PreviewScreen` + `VideoScrubber` + decision buttons.
- **Surface:** VIDEO/DARK. Base `background:#170a0f; color:#f7e8ec`.

### Video (absolute, inset:0 — autoplay recorded blob, looped)
- `radial-gradient(70% 42% at 50% 30%, rgba(255,200,182,0.32), transparent 62%), linear-gradient(180deg,#3a1d26 0%,#281017 56%,#160a0f 100%)` + same grain + vignette `radial-gradient(120% 95% at 50% 45%, transparent 50%, rgba(10,4,6,0.62))`. Mono tag `[ YOUR VIDEO ]` at `top:40%`.

### Overlay elements
1. **Top row** — `top:66px; left:18px; right:18px; flex; justify-content:space-between`:
   - Close `40×40` glass circle + X SVG 16px stroke `#fbeef0` (→ discard / back).
   - Center label pill "Preview · 0:45" (Outfit 500 / 13px, `rgba(247,232,236,0.75)`, glass `rgba(20,10,14,0.45)`, `padding:7px 15px; border-radius:999px`).
   - 40px spacer (balances the close button).
2. **Play badge** — center `top:54%`, `64×64` circle, `background:rgba(255,255,255,0.14); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.22)`, play triangle SVG 22px `#fff`. Toggles play/pause.
3. **Bottom block** — `left:24px; right:24px; bottom:54px`:
   - Headline "Happy with this take?" — Cormorant italic 500, 30px, `#fff`, `text-shadow:0 2px 16px rgba(0,0,0,0.5)`, centered.
   - Subtitle "You've got all the time in the world to nail it." — Outfit 13.5px, `rgba(247,232,236,0.6)`, `margin-top:7px`, centered.
   - **Scrubber** (`margin-top:20px; display:flex; align-items:center; gap:10px`): current "0:18" + track + total "0:45" (both 11px `rgba(247,232,236,0.55)` tabular). Track `flex:1; height:4px; border-radius:99px; background:rgba(255,255,255,0.18)`; fill `width:40%; background:linear-gradient(90deg,#f5714a,#f0577f)`; knob `13×13` circle `#fff` at fill end, `box-shadow:0 0 10px rgba(240,87,127,0.7)`.
   - **Decision buttons** (`margin-top:22px; display:flex; gap:12px`):
     - "Re-record" — `flex:1; height:56px`, ghost (`background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18); color:#fbeef0; Outfit 500/15.5px`), leading rotate-arrow SVG 16px. → back to Recording (FLOWS §2 "Re-record").
     - "Looks good" — `flex:1.3; height:56px`, primary CTA gradient `linear-gradient(110deg,#f5714a,#f05a7a 48%,#f0577f)`, `box-shadow:0 12px 30px rgba(245,113,74,0.40)`, leading check SVG 17px, Outfit 600 / 15.5px `#fff`. → Upload flow (FLOWS §3).

---

## 5. Filters + emoji overlay

- **Route:** part of `src/app/record/` (pre-record tooling). **Flow ref:** FLOWS §8.
- **Components:** `FilterPicker` (carousel) + `EmojiOverlay` (palette + draggable sticker) + tool rail.
- **Surface:** VIDEO/DARK. Base `background:#170a0f; color:#f7e8ec`.

### Camera (vivid filter preview, absolute inset:0)
- `radial-gradient(72% 44% at 50% 26%, rgba(255,160,190,0.4), transparent 62%), linear-gradient(180deg,#46203a 0%,#2c1222 54%,#160a10 100%)` + grain + vignette `rgba(10,4,6,0.55)`. Mono tag `[ vivid filter ]` at `top:30%`.

### Overlay elements
1. **Tool rail** — `top:66px; right:18px; display:flex; flex-direction:column; gap:12px`. Three `44×44` circles:
   - Filter tool (inactive glass): aperture SVG.
   - **Emoji tool (active):** `background:linear-gradient(135deg,#f5714a,#f0577f); border:1px solid rgba(255,255,255,0.3); box-shadow:0 6px 18px rgba(245,113,74,0.45)`; smiley SVG 20px `#fff`.
   - Text tool (inactive glass): Cormorant 700 "T", 20px `#fbeef0`.
2. **Draggable emoji sticker** — `left:34%; top:40%; transform:translate(-50%,-50%) rotate(-12deg)`. Selection box `padding:6px` + `border:1.5px dashed rgba(255,255,255,0.55); border-radius:14px`. Emoji glyph 52px (`❤️`) with `filter:drop-shadow(0 4px 10px rgba(0,0,0,0.4))`. Delete handle: `18×18` white circle top-right with an X SVG (stroke `#f0527a`). → drag to reposition, pinch to scale/rotate; composited onto the canvas stream when recording (FLOWS §8).
3. **Bottom panel** — `left:0; right:0; bottom:46px; padding:0 16px`:
   - **Emoji palette** (`display:flex; gap:8px; justify-content:space-between; margin-bottom:18px; padding:0 4px`): 30px glyphs — `❤️ 🔥 ✨ 😏 🌙 💋 🍒`. Tap → drop a new sticker on the canvas.
   - **Filter carousel** (`display:flex; gap:11px; align-items:flex-end; overflow:hidden`): each item = swatch + label (Outfit 11px `rgba(247,232,236,0.6)`, `margin-top:6px`):
     - natural `54×54 r18` `linear-gradient(160deg,#5a3a3a,#7a5a52)`
     - vintage `54×54 r18` `linear-gradient(160deg,#7a5a3a,#9a7a4a); filter:sepia(0.4)`
     - **vivid (active)** `62×62 r20` `linear-gradient(160deg,#f0577f,#f5714a); border:2.5px solid #fff; box-shadow:0 0 20px rgba(240,87,127,0.5)`; label Outfit 600 / 11.5px `#fff`
     - b&w `54×54 r18` `linear-gradient(160deg,#444,#999)`
     - warm `54×54 r18` `linear-gradient(160deg,#c0623a,#e09a5a)`
   - Active filter = larger thumb + white border + glow. Selecting applies a CSS/WebGL filter to the live camera (FLOWS §8).

---

## 6. Feed (vertical, TikTok-style)

- **Route:** `src/app/feed/`. **Flow ref:** FLOWS §4 (Feed) + §7 (Like/Comment).
- **Components:** `FeedScroller` (vertical snap pager) → `VideoCard` = video + `SegmentBar` + brand + `ActionRail` + `Caption` + swipe hint.
- **Surface:** VIDEO/DARK. Base `background:#160a0f; color:#f7e8ec`. One card shown per FLOWS §4; full-screen vertical snap-scroll between cards.

### Video (absolute, inset:0 — Mux `<video>` per item)
- `radial-gradient(70% 44% at 42% 26%, rgba(255,190,176,0.34), transparent 62%), linear-gradient(180deg,#3c1d26 0%,#2a1117 54%,#160a0f 100%)` + grain.
- **Readability scrim** (keep over real video): `linear-gradient(180deg, rgba(10,4,6,0.45) 0%, transparent 22%, transparent 52%, rgba(10,4,6,0.85) 100%)`.
- Mono tag `[ user video ]` at `top:38%`.

### Overlay elements
1. **Segment bar** — `top:64px; left:18px; right:18px; gap:5px`. Three `height:3px; border-radius:99px`: first = `linear-gradient(90deg,#f5714a,#f0577f)`, rest `rgba(255,255,255,0.22)`. Represents the 3 prompt sections of the 45s clip.
2. **Brand "Sway"** — `top:80px`, centered, Cormorant italic 600, 19px, `rgba(255,255,255,0.92)`, `text-shadow:0 1px 8px rgba(0,0,0,0.4)`.
3. **Action rail** — `right:14px; bottom:118px; display:flex; flex-direction:column; align-items:center; gap:22px`:
   - **Avatar + follow:** `48×48` circle `linear-gradient(150deg,#f5714a,#f0577f); border:2px solid #fff` (→ creator `avatarUrl`); follow badge `20×20` circle `#f0577f; border:2px solid #160a0f` with `+` SVG, `bottom:-7px` centered.
   - **Like:** filled heart SVG 32px `#ff486f` + count "1.2k" (Outfit 600 / 12.5px `#fff`). Optimistic toggle → `POST /videos/:id/likes` (FLOWS §7); add a pop/scale on tap.
   - **Comment:** filled bubble SVG 31px `#fff` + count "84". → opens `CommentsDrawer` (slide-up; `GET /videos/:id/comments`).
   - All rail icons carry `filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))`. (Share was intentionally removed — do not add it.)
4. **Caption** — `left:20px; right:84px; bottom:120px` (right inset clears the rail):
   - Name row (`gap:8px; margin-bottom:9px`): "Camila, 26" Cormorant italic 600, 25px `#fff` + verified badge `17×17` circle `#f0577f` with check SVG.
   - Prompt caption: Outfit 14.5px / 1.5, `rgba(255,255,255,0.88)`, `text-shadow:0 1px 8px rgba(0,0,0,0.5)`; accent clause in `#ffd9e1`. E.g. "“My perfect lazy afternoon looks like… *slow coffee and zero plans.*”".
   - Meta chips (`gap:8px; margin-top:12px`): "📍 São Paulo", "2 km away" — Outfit 11.5px `rgba(255,255,255,0.85)`, `background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.18); padding:4px 11px; border-radius:999px`.
5. **Swipe hint** — `bottom:58px`, centered column, `gap:3px`, `animation:bob 2.4s ease-in-out infinite`: chevron-up SVG 18px (`rgba(255,255,255,0.7)`) + "swipe for next" (Outfit 11px, `letter-spacing:1px`, `rgba(255,255,255,0.65)`). Hide after first advance.

### Behavior
- Vertical snap pager; autoplay current, prefetch next (FLOWS §4). Auto-advance on clip end or swipe-up.
- Empty state (no videos): centered Cormorant italic message "Be the first! Your video is awaiting its first match." on the dark surface.
- Comments drawer: bottom sheet, `border-radius:34px 34px 0 0`, dark glass; paginated list; composer at the bottom; `POST` prepends new comment (FLOWS §7).

---

## Cross-screen notes

- **Transitions:** soft fade / slide-up 250–350ms `cubic-bezier(0.22,0.61,0.36,1)` between routes; never hard cuts.
- **Status bar:** the device frame renders it white (`dark`); keep top content below 64px.
- **Real media:** swap every gradient placeholder for `<video>`/`<img>` but keep the vignette + scrim layers so overlay text stays legible.
- **Accessibility:** all tappable targets ≥ 44px (record 80px, rail icons 31–32px glyph in ≥44px hit area, buttons 56–58px). Maintain AA contrast — overlay text always sits on a scrim or glass.
- **No purple** and **Cormorant-italic for all display type** — see `DESIGN_SYSTEM.md` §9 hard rules.
