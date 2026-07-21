# Miraz World — Flavor Passport

A real, working implementation of the **Miraz World Flavor Passport** loyalty
experience, built to the client brief (`Document_12.docx`) on top of the Miraz
design system (`../project`). Guests open a real olive-and-gold passport, earn a
stamp with every main course across six countries (36 stamps total), climb the
rewards ladder, and complete the book to unlock the Miraz World grand rewards.

Built with **React + Vite**, recreating the design-system prototype
(`project/ui_kits/passport/`) as modular production components.

## Run

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## The flow — a real 3D passport

1. **On the table** — the closed passport rests as a physical object in a lit
   dark scene: charcoal leather grain, gilt frames, gold-foil embossing, a
   blind-embossed landmark frieze, visible page-block edges, a contact shadow,
   and a slow idle float. Tap the book itself to open it.
2. **It opens like a book** — the passport lifts to fill the screen while the
   hardcover swings on its right-hand spine (RTL, `preserve-3d`); the endpaper
   is visible on the cover's inner face as it turns, and the cover's cast
   shadow slides off the first page.
3. **Real pages** — guilloché security pattern with paper grain, a spine-gutter
   shadow, page fore-edge stripes; the identity page ("جمهورية النكهة /
   Republic of Flavour", holder fields, photo box, MRZ strip) then the visa
   pages with six destination slots and a progress bar.
4. **Check-in** — tap a slot → a sheet slides up → confirm **اختم الجواز · Stamp**.
5. **Stamp press** — a turned-wood stamp tool with a brass collar and a
   *mirrored* rubber die drops in perspective **onto the exact slot you
   tapped**, bottoms out with a bounce (the book jolts, its shadow grows as it
   falls), and leaves a speckle-masked, multiply-blended ink impression at the
   slot's own tilt — the same impression that stays on the page.
6. **Reward** — complete all six → the **اكتملت رحلتك!** banner → claim the
   **Chef's Table for two** with a redemption code.

**No scrolling.** The interior is a stack of fixed leaves; you move through
the book with real 3D page turns over the spine (RTL) — swipe across the page,
tap the chevrons at the foot, or use the arrow keys. Each leaf has a recto and
a verso and darkens as it lifts, exactly like the cover.

On desktop the app renders inside an iOS device frame; on an actual phone
(≤500px) it runs full-bleed — the phone is the frame.

## Structure

```
src/
  main.jsx                 app entry
  App.jsx                  passport state machine (cover → visas → press → reward)
  styles.css               DS entry + passport keyframes
  tokens/                  colors, typography, spacing, fonts (from the DS)
  assets/                  folded-map marks, wordmark, landmark frieze (from the DS)
  data/destinations.js     the six destinations + ink map + guilloché background
  data/textures.js         procedural SVG noise (leather/paper grain, ink speckle mask)
  components/
    IOSFrame.jsx           iOS 26 device frame (bezel, dynamic island, status bar)
    Button.jsx, Eyebrow.jsx  ported DS primitives
    Stamp.jsx              speckled ink postmark + empty visa slot
    Book.jsx               the 3D passport (leather covers, endpaper, page block, pages)
    CheckIn.jsx            check-in confirm sheet
    StampPress.jsx         slot-targeted rubber-stamp press
    Reward.jsx             journey-complete reward screen
```

`npm run build` emits a **single self-contained `dist/index.html`**
(vite-plugin-singlefile + inlined SVG assets) — easy to host anywhere or wrap.

## Caveats (inherited from the design system)

- **Fonts are Google Fonts substitutes** — Cormorant Garamond + Jost (Latin),
  Reem Kufi + Tajawal (Arabic). Loaded via `tokens/fonts.css`. Swap for the
  licensed Miraz brand fonts when available.
- **Photography is placeholder** (Unsplash) on the check-in sheet. Replace the
  `img` fields in `data/destinations.js` with real Miraz destination imagery.
- **Data is illustrative** — the six destinations, the reward, and the redemption
  code are static placeholders. In production, stamping would be gated by an
  in-restaurant check-in (QR / geofence) rather than a tap.
