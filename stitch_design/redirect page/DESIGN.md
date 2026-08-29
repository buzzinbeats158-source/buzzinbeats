# Solar Kinetic Design System

## 1. Overview & Creative North Star
**Creative North Star: The Kinetic Warmth**
Solar Kinetic is a design system built for the high-energy "Creator Economy." It moves away from the sterile, blue-heavy tech aesthetic toward a palette that feels organic, urgent, and human. The system is designed to act as a "digital bridge"—unifying physical presence (QR codes) with digital destinations through high-contrast typography, energetic gradients, and depth created through tonal stacking.

The layout philosophy rejects rigid grids in favor of **intentional asymmetry**. Floating elements, overlapping cards, and "mesh" background gradients create a sense of motion and vitality that prevents the UI from feeling static or "templated."

## 2. Colors
The palette is centered around the vibration between #e06419 (Solar Orange) and #FF6347 (Kinetic Coral).

*   **The "No-Line" Rule:** Direct structural sectioning must avoid 1px solid black or grey borders. Instead, boundaries are defined by shifting from `surface` (#FAF9F6) to `surface_container_low` (#f8f7f6) or using the `outline_variant` at 10% opacity.
*   **Surface Hierarchy & Nesting:** Depth is achieved by placing `surface_bright` (#ffffff) cards atop `surface` backgrounds. Sub-elements within cards use `surface_container` or `primary/5` to create internal hierarchy without adding visual weight.
*   **The Glass & Gradient Rule:** Navigation and floating alerts must utilize a `backdrop-blur-md` (80% opacity) to maintain context of the underlying "Mesh" background.
*   **Signature Textures:** Use radial mesh gradients (Solar Orange at 8% opacity) in the top-left and bottom-right corners of large sections to provide a soft, non-distracting glow.

## 3. Typography
Solar Kinetic uses a dual-font strategy to balance authority with accessibility.

*   **Display & Headlines:** *Plus Jakarta Sans*. A modern geometric sans-serif with high x-height. Used for impact.
*   **Body & Interface:** *Inter*. Used for maximum readability in functional areas.

**Typography Scale (Calibrated):**
*   **Display Large:** 3rem (48px) — Extra Bold, Tracking -0.02em.
*   **Headline Medium:** 2.25rem (36px) — Bold.
*   **Title Large:** 1.875rem (30px) — Bold.
*   **Body Large:** 1.25rem (20px) — Regular, Leading 1.6.
*   **Body Medium:** 1.125rem (18px) — Standard reading size.
*   **Label Small:** 0.875rem (14px) — Bold, Uppercase for "NEW" tags or category headers.

## 4. Elevation & Depth
Elevation in Solar Kinetic is "soft but heavy." It mimics a studio lighting environment where objects cast broad, diffused shadows.

*   **The Layering Principle:** Use `surface_container_lowest` (#ffffff) for the primary interactive layer. Stack secondary interactive elements using a subtle 10% Primary tint background.
*   **Ambient Shadows (Ground Truth):**
    *   **Level 1 (Standard Cards):** `shadow-lg` — used for feature cards.
    *   **Level 2 (Active States):** `shadow-xl` — used for hover states and primary CTAs.
    *   **Level 3 (Hero/Modal):** `shadow-2xl` — used for floating QR code containers to create significant separation from the background.
*   **Shadow Tinting:** Shadows should not be neutral. For primary elements, use a 25-40% opacity tint of the seed color (`shadow-primary/30`) to create a "glow" effect rather than a traditional shadow.

## 5. Components
*   **Buttons:** Primary buttons use a linear gradient from `primary` to `secondary`. They feature a minimum padding of `px-8 py-4` and a `rounded-xl` (12px) corner radius.
*   **Chips/Tags:** Status tags (e.g., "NEW") use a pill-shape (`rounded-full`) with a 10% opacity primary background and a pulsing animation dot for "live" elements.
*   **Cards:** Feature cards use `border border-primary/10` and `transition-all`. On hover, they should translate -8px on the Y-axis and increase shadow intensity.
*   **QR Containers:** High-importance containers use a `rounded-[2.5rem]` (40px) radius to emphasize the "friendly" and "modern" nature of the tech.
*   **Inputs:** Use `surface_container_low` with a 2px bottom border that transitions to `primary` on focus.

## 6. Do's and Don'ts
### Do:
*   Use gradients to lead the eye toward primary conversion points.
*   Apply `backdrop-blur` on all sticky navigation elements.
*   Mix `Plus Jakarta Sans` (Headings) and `Inter` (Body) to maintain a professional yet energetic rhythm.
*   Use asymmetric placement for decorative elements (like the trending icon floating outside the main card).

### Don't:
*   Use pure black (#000000) for text; use `on_surface` (#211711) to maintain warmth.
*   Apply heavy borders to cards; let the shadow and subtle background shift do the work.
*   Use standard blue for links; all interactive highlights must stay within the Solar/Kinetic orange spectrum.
*   Overcrowd the layout; maintain "Spacious" density to evoke an editorial feel.