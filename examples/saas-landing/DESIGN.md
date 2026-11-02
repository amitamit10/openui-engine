---
version: alpha
name: "Lumen"
description: "Aurora Dark art direction for Lumen. Deep ink canvas, soft violet/cyan light bleeding from behind a product shot. Calm, precise, premium."
colors:
  primary: "#0ea5e9"
  on-primary: "#06060a"
  secondary: "#f36882"
  neutral: "#07070c"
  surface: "#0e0e16"
  surface-raised: "#151522"
  border: "#26263a"
  text: "#f4f4f8"
  text-muted: "#9a9ab2"
typography:
  display:
    fontFamily: "Inter Tight"
    fontSize: 52px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Inter Tight"
    fontSize: 42px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Inter Tight"
    fontSize: 33px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "Inter Tight"
    fontSize: 27px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  small:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 999px
spacing:
  s0: 0px
  s1: 4px
  s2: 8px
  s3: 12px
  s4: 16px
  s5: 24px
  s6: 32px
  s7: 48px
  s8: 64px
  s9: 96px
  s10: 128px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text}"
  card-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
  divider:
    backgroundColor: "{colors.border}"
  caption:
    textColor: "{colors.text-muted}"
    backgroundColor: "{colors.neutral}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

Deep ink canvas, soft violet/cyan light bleeding from behind a product shot. Calm, precise, premium.

**Art direction — Aurora Dark.** Product UI framed in a 1px hairline card with a soft accent glow behind; no stock photography.

Signatures:
- Hairline 1px borders on every surface
- Accent glow behind the hero product frame
- Tight display tracking (-0.03em) with generous body leading

## Colors

- **Primary (#0ea5e9):** the only call-to-action fill. Foreground on it is #06060a.
- **Secondary (#f36882):** a derived accent for data and illustrations only, never for buttons.
- **Neutral (#07070c) / Surface (#0e0e16) / Surface-raised (#151522):** the elevation ladder; each nested layer steps up one surface.
- **Text (#f4f4f8) / Text-muted (#9a9ab2):** both meet WCAG AA on every surface.

## Typography

Display: Inter Tight. Body: Inter. Mono: JetBrains Mono.
Modular scale ratio 1.25; sizes are fluid between a 375px and a 1280px viewport. Only the steps defined in the front matter may be used.

## Layout

Container 1200px, 12-column grid, 24px gutters. Spacing is a 4px base unit; section padding is fluid 56–104px.
Section transitions: Hairline dividers and radial accent glows; surfaces step up one elevation per layer.

## Elevation & Depth

- sm: `0 1px 2px rgba(0,0,0,.4)`
- md: `0 8px 24px -8px rgba(0,0,0,.6)`
- lg: `0 32px 80px -24px rgba(0,0,0,.8)`

## Shapes

Radii: sm 8px, md 12px, lg 16px, xl 24px, pill 999px. Border width 1px.

## Components

`button-primary` is the single highest-emphasis action per viewport. Hero composition: **centered-product**. CTA hierarchy: **one-primary-one-ghost**. Motion intensity 2/3 (all motion respects `prefers-reduced-motion`).

## Do's and Don'ts

- ❌ Do not use pure #000 or pure #fff
- ❌ Do not stack more than one glow per viewport
- ❌ Do not use more than one accent hue per section
- ✅ Reference tokens by variable (`var(--c-accent)`), never by literal value.
- ✅ Keep one primary CTA per viewport.
