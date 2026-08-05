# Glacier Monolith Design System Specification

A pristine, high-contrast, light-mode design system. This system relies on a stark, spacious black-and-white canvas with a single, highly deliberate 2-color gradient used strictly for micro-accents to avoid visual fatigue and overstimulation.

---

## 1. Core Design Philosophy
The "Absolute Zero" ethos prioritizes breathing room, typographic clarity, and structural honesty. By utilizing soft value shifts instead of heavy borders, the interface remains calm and focused. High-contrast colors and gradients are used exclusively for active states and critical micro-interactions.

---

## 2. Visual Tokens

### 2.1 Color Palette & Variables
The canvas relies on a color ratio of roughly 90% pristine whites and cool grays, 8% deep slate text/strokes, and 2% active color accents.

| Token | CSS/HEX Value | Role / Usage |
| :--- | :--- | :--- |
| **Primary Canvas** | `#F8FAFC` | The page-level background canvas. |
| **Surfaces / Cards** | `#FFFFFF` | Core content containers, code inputs, and UI panels. |
| **Primary Text & Stroke** | `#0F172A` | Deep Slate. Used for body text, headers, and highly-visible active strokes. |
| **Muted Text & Stroke** | `#64748B` | Medium Slate. Used for secondary labels, inactive code, and file names. |
| **Whisper Divider** | `#F1F5F9` | Barely-visible lines when spatial separation is strictly required. |
| **Glacier Gradient** | `linear-gradient(90deg, #0284C7 0%, #0D9488 100%)` | Glacier Blue (`#0284C7`) to Frosty Teal (`#0D9488`). **Do not use on large surfaces.** |

### 2.2 Typography Specification
The typographic philosophy pairs a high-end, expressive literary serif for display states with a highly structured, geometric sans-serif for functional UI.

* **Display Typography (Hero Headers, Titles, Brand Marks):**
  * **Font Family:** *Fraunces* or *Ogg*
  * **Weight:** Regular (`400`) or Medium (`500`)
  * **Tracking:** `tracking-tight` (subtly compressed letter-spacing)
* **UI & Interface Typography (Labels, Buttons, Alerts):**
  * **Font Family:** *Cabinet Grotesk* or *Satoshi*
  * **Weight:** Light (`300`), Regular (`400`), or Medium (`500`)
* **Code & Monospace Typography (Source Code Inputs):**
  * **Font Family:** *Intel One Mono* or *JetBrains Mono*
  * **Weight:** Regular (`400`)
  * **Syntax Highlight Philosophy:** Styled in light mode. Most code lines remain `#334155` (muted slate). Active, highlighted, or matched parameters are highlighted with a soft background overlay: `background: rgba(13, 148, 136, 0.08)`.

### 2.3 Elevation & Shadows (Replacing Heavy Borders)
To prevent visual clutter, components resting on the `#F8FAFC` background use a soft shadow rather than outlines.

## 3. Layout & Workspace Geometry

### 3.1 Card Container Specifications
* **Background:** #FFFFFF (resting on the #F8FAFC canvas)
* **Border:** None (completely borderless)
* **Border Radius:** 8px or 12px (soft but structured)
* **Padding:** Generous internal padding (minimum 24px to 32px) to let data breathe.

### 3.2 Workspace Grid Layout (e.g., Frontend, Backend, Database)
* Place components side-by-side using a strict grid layout with a minimum gap of 24px.
* **No physical connection lines:** Completely avoid the use of vector lines, connection nodes, or arrows to link panels. The proximity of the side-by-side columns naturally establishes their structural relationship.

## 4. Interactive Elements & Micro-Primitives

### 4.1 Buttons & CTA Highlights
* **Primary Button (e.g., "Run Check"):** Stark white (#FFFFFF) with a thin 1px border styled with the Glacier Gradient. On hover, the button fills with a faint ice-blue tint (#F0FDF4), and the text shifts to deep glacier blue.
* **Secondary Actions:** Flat gray backgrounds or whisper-thin outlines (#E2E8F0) that fade softly on hover.

### 4.2 Form Inputs, Dropdowns & Focus States
* **Default Input State:** Transparent background, no fill, and a thin gray border (#E2E8F0).
* **Active/Focus State:** Transform the border into a thin, 1px Glacier Teal focus stroke or a subtle inner shadow. Avoid coloring the input's background when active.
* **Focus Rings:** Avoid default browser focus rings. Use a custom, high-density `:focus-visible` outline.

### 4.3 Overlay & Backdrop States (Frosted Glass)
For dropdowns, flyout panels, and modals, use a high-blur, low-opacity white backdrop mask to mimic a sheet of ice resting over the page.

**CSS Specification:**

```css
backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.5);
```

### 4.4 Loading Skeletons & Custom Scrollbars
* **Loaders:** Avoid spinning progress wheels. Use flat, low-contrast pulsing blocks shifting from #F1F5F9 to #F8FAFC.
* **Custom Scrollbars:** Ensure thick default scrollbars do not break alignment.

```css
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 4px;
}
```

### 4.5 Tooltips
Style tooltips in high-contrast dark-slate to stand out instantly against the light background.

* **Styling:** Background #0F172A, text color #FFFFFF (using Satoshi, small font size), border-radius 4px.

## 5. Tactical Guidelines

### Do's
* **Do use vertical whitespace for separation:** Instead of inserting lines to separate page blocks, use a consistent vertical gap (e.g., 64px or 96px).
* **Do keep icons consistently thin:** If icons are used, ensure they are strictly outlined vector shapes (1px or 1.5px stroke weight) that match the weight of your UI text.
* **Do rely on font weights for hierarchy:** Differentiate text priority by contrasting thin display serifs with clean sans-serif UI labels rather than relying on color or size shifts.
* **Do align elements strictly to a grid:** Keep all margins, cards, and labels aligned to a clean, consistent 8px grid system.

### Don'ts
* **Don't use colored background banners for alerts:** Never use saturated red, orange, or green backgrounds for success/error messages. Instead, write the alert text in deep charcoal on a soft gray box, utilizing a tiny colored indicator next to the message.
* **Don't use pure black on pure white:** Avoid #000000 text on a #FFFFFF canvas. It causes high contrast eye strain. Always utilize deep slate (#0F172A).
* **Don't apply the Glacier Gradient to large surfaces:** The gradient is a premium accent. Do not use it as a solid background for cards, buttons, or large headers. Keep it constrained to lines less than 2px thick (underlines, borders, indicators).
* **Don't stack borders:** Avoid placing a bordered input inside a bordered container that sits inside a bordered card. If nesting components, ensure only the outermost or innermost container utilizes a visible divider.
* **Don't use illustration or clip-art:** Keep empty states, error pages, and welcome screens completely typographical to maintain a premium feel.
