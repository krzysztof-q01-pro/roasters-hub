# Design System: Editorial Minimalism for Specialty Coffee

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sensory Curator."** 

In the world of specialty coffee, the experience is about clarity, origin, and warmth. This system moves away from the "generic tech" aesthetic by adopting an editorial layout style reminiscent of high-end independent magazines (*Kinfolk*, *Drift*). We break the traditional digital grid through **intentional asymmetry**, generous use of whitespace (breathing room), and a dramatic typographic scale. 

The goal is to make the user feel they are browsing a curated physical catalog rather than a database. We achieve "Premium" not through complexity, but through the precision of our constraints.

---

### 2. Colors & Surface Philosophy
We utilize a warm, high-end palette that evokes the tactility of unbleached paper and natural light.

#### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Conventional dividers create visual noise that interrupts the "flow" of a curated experience. Instead, define boundaries through:
- **Background Shifts:** Transitioning from `surface` (#FFFFFF) to `surface-container-low` (#F4F4F2).
- **Whitespace:** Using the `12` (4rem) or `16` (5.5rem) spacing tokens to signal a change in context.

#### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper sheets. 
- **Base:** `background` (#F9F9F7) acts as the table.
- **Sections:** `surface-container` (#EEEEEC) defines large content areas.
- **Interactive Elements:** Cards use `surface-container-lowest` (#FFFFFF) to "lift" off the page naturally.

#### The "Glass & Signature Texture" Rule
For floating navigation or top-level overlays, use **Glassmorphism**. Apply `surface` at 80% opacity with a `20px` backdrop-blur. To add "soul," use a very subtle linear gradient on primary CTAs: `primary` (#974400) to `primary-container` (#B95A14) at a 135° angle. This prevents the "flat-asset" look and adds a sun-drenched, organic quality.

---

### 3. Typography: The Editorial Voice
Our typography pairing contrasts the rhythmic, humanistic serif of *Fraunces* (Newsreader in our scale) with the functional precision of *Inter*.

| Role | Font | Scale | Usage |
| :--- | :--- | :--- | :--- |
| **Display** | Newsreader | `display-lg` (3.5rem) | Hero statements; high-impact "Moments." |
| **Headline** | Newsreader | `headline-md` (1.75rem) | Roaster names, article titles. |
| **Title** | Inter | `title-md` (1.125rem) | Card headers, navigation labels. |
| **Body** | Inter | `body-lg` (1rem) | Tasting notes, roaster descriptions. |
| **Label** | Inter | `label-sm` (0.6875rem) | Metadata (Origin, Altitude, Process). |

**Note on Kerning:** For `display` and `headline` styles, decrease letter-spacing by `-0.02em` to create a tight, professional editorial "lockup."

---

### 4. Elevation & Depth
We reject heavy drop shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card (Pure White) on a `surface-container-low` background. The contrast is enough to define the shape without "dirtying" the design with grey shadows.
- **Ambient Shadows:** When a card requires a floating state (e.g., a hover effect), use a shadow with a `40px` blur and `4%` opacity. The shadow color must be a tinted version of `on-surface` (#1A1C1B) rather than pure black.
- **The Ghost Border Fallback:** If a border is required for accessibility, use `outline-variant` (#DCC1B3) at **15% opacity**. It should be felt, not seen.

---

### 5. Components

#### Buttons
- **Primary:** Burnt Orange (`primary`), `0.375rem` (6px) radius. High-contrast white text.
- **Secondary:** Semi-transparent `surface-variant`. No border.
- **Tertiary:** Text-only in `primary` with an underline that appears only on hover.

#### Cards (The Discovery Vessel)
- **Style:** `1rem` (16px) radius (interpreted from the `lg` scale). 
- **Structure:** No dividers. Use `3.5` (1.2rem) spacing to separate the image from the tasting notes.
- **Verified Badge:** A deep green (`secondary`) pill with a `9999px` radius, placed as an overlapping element on the top-right of images.

#### Pill-Shaped Tags (The Metadata)
- **Style:** `full` (9999px) radius. 
- **Color:** Background `surface-container-high` (#E8E8E6) with `on-surface-variant` text.
- **Interaction:** Filter chips turn to `primary` (#974400) when active.

#### Input Fields
- **Style:** Underline-only or subtle "Ghost Border" containers.
- **Focus State:** Transition the bottom border to `primary` (#974400) with a `2px` weight. Avoid the heavy "box" focus state common in SaaS apps.

---

### 6. Do's and Don'ts

#### Do
- **Use Asymmetry:** Place a large image on the left and offset the headline to the right for a "magazine" feel.
- **Embrace Whitespace:** If you think there is enough space, add `1.4rem` more.
- **Respect the Grain:** Use the warm off-white `background` (#F9F9F7) globally to ensure the app doesn't feel clinical or "cold."

#### Don't
- **No 1px Dividers:** Never use a line to separate content. Use a background tone shift or space.
- **No Heavy Shadows:** If a shadow looks like a shadow, it’s too dark. It should look like "ambient occlusion."
- **No Pure Black:** Ensure all text uses `on-background` (#1A1C1B) to maintain softness against the warm background.
- **No Generic Coffee Brown:** If the design feels too "brown," lean harder into the `secondary` (Deep Green) or `background` (Warm Off-White) to refresh the palette.