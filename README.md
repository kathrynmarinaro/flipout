# Flipout — landing page

A single-page, pre-launch waitlist site for Flipout: small-batch, laser-cut hardwood
light switch covers.

Static HTML, CSS and vanilla JS. No build step, no framework, no dependencies to
install. Open `index.html` in a browser and it runs.

```
index.html          all page content and copy
css/styles.css      all styling
js/main.js          form handling + the wood/cap picker  ← config lives here
assets/images/      placeholder images, sized to final ratios
assets/favicon.svg
```

---

## Before you go live — 3 things

### 1. Switch on email capture (required)

The forms don't collect anything until you give them a Kit (formerly ConvertKit)
form ID. Until then they show a visible "signup isn't switched on yet" message and
stay disabled, rather than silently dropping signups.

1. Sign up at [kit.com](https://kit.com) — free up to 10,000 subscribers.
2. **Grow → Landing Pages & Forms → New form → Inline.**
3. Open the form's **Embed → HTML** tab. You'll see a URL like
   `https://app.kit.com/forms/1234567/subscriptions` — the number is your form ID.
4. Open `js/main.js` and put it on line 20:

   ```js
   var KIT_FORM_ID = '1234567';
   ```

That's it — both forms on the page use it. Worth doing while you're in Kit: set up
the automatic confirmation email, since people are waiting a while between signing
up and hearing from you.

**Switching services later** is a small job, not a rebuild: replace `KIT_ENDPOINT`
and the `email_address` field name in `js/main.js` (Mailchimp calls it `EMAIL`,
Formspree calls it whatever you like).

### 2. Update the Instagram link

The account doesn't exist yet, so `@flip_out_co` is a placeholder. It appears in
exactly one place — search `index.html` for `INSTAGRAM` and you'll find a comment
marking it. Change both the `href` and the visible text.

### 3. Drop in real photography

Everything in `assets/images/` is a labelled placeholder at the exact aspect ratio
the layout expects. Replace each file with a real photo at the same ratio and
nothing shifts.

| File | Size | Shot |
|---|---|---|
| `hero-cover-on-wall.svg` | 900 × 1100 (9:11) | Cover installed on a wall, straight on |
| `single-gang.svg` | 800 × 1000 (4:5) | One cover, flat lay or on-wall |
| `triple-gang.svg` | 1200 × 1000 (6:5) | Three-gang cover, shot wide |
| `detail-cap.svg` | 800 × 800 (1:1) | Macro of a screw cap in the wood face |
| `detail-edge.svg` | 800 × 800 (1:1) | Macro of the sanded, sealed edge |
| `detail-grain.svg` | 800 × 800 (1:1) | Macro of grain under the finish |
| `maker.svg` | 900 × 1000 (9:10) | Your workshop portrait |
| `og-image.svg` | 1200 × 630 | Social preview card |

Saving as `.jpg`? Update the `src` in `index.html` to match the new extension, and
update the `alt` text while you're there — it currently describes the intended shot.

Every photo is clipped into a blob silhouette, so **keep the subject centred** and
leave breathing room at the edges; the corners get cut away.

---

## Editing content

**Copy** is all in `index.html` as plain text. The headline, product blurbs, process
steps and maker bio are drafts written to sound like you — change anything that
doesn't. The maker section especially is worth making properly yours.

**Wood species and cap colours** are data, not markup. They live in two arrays at the
top of section 2 in `js/main.js`:

```js
var WOODS = [ { id, name, species, desc, light, base, dark }, … ];
var CAPS  = [ { id, name, color, desc }, … ];
```

Add, remove or rename an entry and the swatches, descriptions, readout and live
preview all rebuild themselves. The three wood hexes are the highlight, midtone and
shadow of the grain gradient in the preview.

**The batch size (50)** appears in two places in `index.html` — the hero note and the
second CTA heading. Search for `50` if that number changes.

---

## Deploying

Any static host works. Drag the folder onto [Netlify Drop](https://app.netlify.com/drop),
or push this repo and point Netlify, Vercel or GitHub Pages at it. There's no build
command and no server.

If you use GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root.**

---

## Notes on the build

- **Mobile-first.** Layout is written for a phone and enhanced upward at 720px and
  940px, since most traffic will arrive from Instagram links.
- **Blob motif.** The freeform silhouette recurs as the photo frames (SVG clip paths
  in `index.html`), the signup buttons, swatches, step numbers, the sticky-note badges
  and the drifting background shapes. Frames use `clipPathUnits="objectBoundingBox"`
  so one path scales to every breakpoint.
- **Accessibility.** Real form labels, live-region status messages, visible focus
  rings, a skip link, and all ambient motion disabled under
  `prefers-reduced-motion`.
- **Performance.** No libraries; two Google Fonts; images lazy-loaded below the fold.
- **Spam.** Both forms carry a hidden honeypot field. Bots that fill it get a fake
  success message and are never submitted.
