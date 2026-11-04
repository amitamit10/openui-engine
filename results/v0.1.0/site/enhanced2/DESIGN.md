---
version: alpha
name: "Northstar"
description: "Clarity Light art direction for Northstar. Bright, airy and trustworthy. Crisp white surfaces, one confident blue-violet accent, layered soft shadows."
colors:
  primary: "#4f46e5"
  on-primary: "#ffffff"
  secondary: "#aa1fe0"
  neutral: "#ffffff"
  surface: "#f7f8fb"
  surface-raised: "#eef0f6"
  border: "#e3e6ee"
  text: "#0f1222"
  text-muted: "#566074"
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

Bright, airy and trustworthy. Crisp white surfaces, one confident blue-violet accent, layered soft shadows.

**Art direction — Clarity Light.** Product UI on a tinted surface panel with layered soft shadows; subtle grid or dot texture at 4% opacity.

Signatures:
- Layered soft shadows instead of borders
- Single accent used for CTAs and key data only
- Tinted surface bands alternate with white

## Colors

- **Primary (#4f46e5):** the only call-to-action fill. Foreground on it is #ffffff.
- **Secondary (#aa1fe0):** a derived accent for data and illustrations only, never for buttons.
- **Neutral (#ffffff) / Surface (#f7f8fb) / Surface-raised (#eef0f6):** the elevation ladder; each nested layer steps up one surface.
- **Text (#0f1222) / Text-muted (#566074):** both meet WCAG AA on every surface.

## Typography

Display: Inter Tight. Body: Inter. Mono: JetBrains Mono.
Modular scale ratio 1.25; sizes are fluid between a 375px and a 1280px viewport. Only the steps defined in the front matter may be used.

## Layout

Container 1200px, 12-column grid, 24px gutters. Spacing is a 4px base unit; section padding is fluid 72–128px.
Section transitions: Alternating white and tinted surface bands; no hard borders between bands.

## Elevation & Depth

- sm: `0 1px 2px rgba(16,24,40,.06)`
- md: `0 4px 6px -2px rgba(16,24,40,.05), 0 12px 24px -8px rgba(16,24,40,.10)`
- lg: `0 24px 64px -16px rgba(16,24,40,.22)`

## Shapes

Radii: sm 8px, md 12px, lg 16px, xl 24px, pill 999px. Border width 1px.

## Components

`button-primary` is the single highest-emphasis action per viewport. Hero composition: **centered-product**. CTA hierarchy: **one-primary-one-ghost**. Motion intensity 1/3 (all motion respects `prefers-reduced-motion`).

## Do's and Don'ts

- ❌ Do not use colored shadows heavier than 25% alpha
- ❌ Do not mix more than two radii on one screen
- ❌ Do not use gradient text on body copy
- ✅ Reference tokens by variable (`var(--c-accent)`), never by literal value.
- ✅ Keep one primary CTA per viewport.
