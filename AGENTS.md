# MainQuest Brand & Interface Guide

This file is the shared source of truth for anyone designing or building MainQuest experiences in this repository.

## Brand idea

MainQuest helps ambitious young people move from uncertainty to direction, community, and meaningful action. The identity should feel bold, modern, expressive, optimistic, and timeless. It should never feel corporate, childish, or overly polished.

## Colour system

Use these exact values. Cream is the default page background; black is the default text colour.

| Role | Name | Hex | Recommended use |
| --- | --- | --- | --- |
| Core | Bright Red | `#FB1422` | Calls to action, highlights, urgency |
| Core | Deep Navy Blue | `#020282` | Strong panels, trust, section contrast |
| Core | Deep Green | `#014601` | Growth, programme outcomes, dark accents |
| Accent | Primary Orange | `#F0440A` | Energy, labels, secondary accents |
| Accent | Warm Yellow | `#FEDD55` | Optimism, badges, focus states |
| Accent | Aqua / Cyan | `#35E4E5` | Fresh highlights, interactive details |
| Neutral | Black | `#000000` | Type, borders, graphic linework |
| Neutral | White | `#FFFFFF` | Cards and text on dark backgrounds |
| Neutral | Warm Cream | `#F1ECD8` | Primary canvas and soft surfaces |

### Colour rules

- Prefer bold, flat blocks of colour over gradients.
- Maintain high contrast. Use black on yellow, aqua, cream, and white. Use white on navy, green, red, and orange.
- Use red sparingly for the primary action and important emphasis.
- Do not introduce substitute brand colours. Tints may be created with opacity only for subtle backgrounds.
- Visible focus states should use warm yellow or aqua with a black offset.

## Visual language

- Typography: use a strong grotesk sans serif. The website uses `Arial`, `Helvetica Neue`, and system sans-serif so it remains dependency-free.
- Headlines should be compact, oversized, and assertive, with slightly tight tracking.
- Use hard black outlines, offset shadows, stickers, underlines, arrows, circles, and rotated geometric shapes.
- Corners may be gently rounded, but avoid soft, generic “SaaS” cards.
- Motion should be purposeful and respect `prefers-reduced-motion`.
- Avoid stock photography unless it genuinely documents MainQuest participants. Graphic compositions are preferred.

## Voice

- Direct, warm, encouraging, and specific.
- Speak to the reader as “you.”
- Lead with outcomes and possibility, not institutional language.
- Prefer short sentences and active verbs.
- Never use inflated claims, vague buzzwords, or pressure tactics.

## UX rules

- Every page must have one obvious primary action.
- Forms require visible labels, inline validation, keyboard access, and a clear success state.
- Minimum interactive target size is 44 × 44 px.
- All meaningful colours must meet WCAG AA contrast.
- Mobile layouts are first-class, not compressed desktop layouts.
- Keep the site functional without third-party frameworks or JavaScript dependencies unless explicitly approved.

## Current site structure

- `index.html` contains semantic page content and the registration form.
- `styles.css` contains the design system, layout, components, and responsive behaviour.
- `script.js` contains navigation, reveal effects, registration validation, and the success state.

