---
version: alpha
name: Ahmet Fatihoglu Portfolio — Chat Assistant
description: Terminal-inspired dark theme with bright green accent for an AI-powered developer portfolio chat assistant.
colors:
  primary: "#00EE00"
  secondary: "#008100"
  tertiary: "#00CC00"
  error: "#ad3737"
  warning: "#ad8837"
  success: "#00EE00"
  background:
    default: "#000000"
    paper: "#0D1711"
    card: "#162018"
    surface: "#212D24"
  text:
    primary: "#FFFFFF"
    secondary: "#6E7D73"
    disabled: "#304139"
    on-primary: "#000000"
  border:
    default: "#304139"
    focus: "#00EE00"
  usage:
    safe: "#00EE00"
    warning: "#ad8837"
    danger: "#ad3737"
    cache: "#6E7D73"
typography:
  fontFamily: "'Cascadia Code', Consolas, monospace"
  fontSize: 15
  fontWeightLight: 200
  fontWeightRegular: 300
  fontWeightMedium: 500
  fontWeightBold: 600
  h1:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
  body-sm:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: 0.75rem
    fontWeight: 300
    lineHeight: 1.4
  label-caps:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: 0.625rem
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  mono:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  usage-indicator:
    backgroundColor: "{colors.background.surface}"
    borderColor: "{colors.border.default}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    gap: "{spacing.sm}"
  usage-indicator-compact:
    backgroundColor: "{colors.background.surface}"
    borderColor: "{colors.border.default}"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: "4px 8px"
    gap: "{spacing.xs}"
  usage-bar:
    backgroundColor: "{colors.background.card}"
    rounded: "{rounded.full}"
    height: 6px
  usage-bar-fill-safe:
    backgroundColor: "{colors.usage.safe}"
  usage-bar-fill-warning:
    backgroundColor: "{colors.usage.warning}"
  usage-bar-fill-danger:
    backgroundColor: "{colors.usage.danger}"
  usage-bar-fill-cache:
    backgroundColor: "{colors.usage.cache}"
  usage-label:
    typography: "{typography.label-caps}"
    color: "{colors.text.secondary}"
  usage-value:
    typography: "{typography.mono}"
    color: "{colors.text.primary}"
  usage-value-safe:
    typography: "{typography.mono}"
    color: "{colors.usage.safe}"
  usage-value-warning:
    typography: "{typography.mono}"
    color: "{colors.usage.warning}"
  usage-value-danger:
    typography: "{typography.mono}"
    color: "{colors.usage.danger}"
  compaction-indicator:
    backgroundColor: "{colors.usage.cache}"
    color: "{colors.text.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    typography: "{typography.body-sm}"
  model-badge:
    backgroundColor: "{colors.background.card}"
    borderColor: "{colors.border.default}"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    typography: "{typography.body-sm}"
    color: "{colors.text.secondary}"
---

## Overview

Terminal-inspired developer portfolio chat assistant. The visual identity draws from classic terminal aesthetics — dark backgrounds, monospace typography, and a bright green (#00EE00) accent that signals "live" and "active" state. The design feels like a modern CLI tool: functional, information-dense, and precise. Every pixel serves a purpose.

## Colors

- **Primary (#00EE00):** The signature "terminal green" — used for primary actions, active states, successful operations, and safe usage levels.
- **Secondary (#008100):** Muted green for hover states and secondary emphasis.
- **Tertiary (#00CC00):** Intermediate green for subtle highlights.
- **Error (#ad3737):** Muted red for destructive actions and danger states (usage > 80%).
- **Warning (#ad8837):** Amber for caution states (usage 60-80%).
- **Background Default (#000000):** True black page background.
- **Background Paper (#0D1711):** Dark green-tinted surface for the chat container.
- **Background Card (#162018):** Elevated surfaces (message bubbles, input area).
- **Background Surface (#212D24):** Higher elevation surfaces (usage indicator bar).
- **Text Primary (#FFFFFF):** High-contrast text on dark surfaces.
- **Text Secondary (#6E7D73):** Muted text for labels, metadata, placeholders.
- **Text Disabled (#304139):** Lowest emphasis text.
- **Border Default (#304139):** Subtle borders on cards and inputs.
- **Border Focus (#00EE00):** Active focus ring color.
- **Usage Safe (#00EE00):** Context usage < 60% — comfortable headroom.
- **Usage Warning (#ad8837):** Context usage 60-80% — approaching limit.
- **Usage Danger (#ad3737):** Context usage > 80% — compaction imminent.
- **Usage Cache (#6E7D73):** Cached token indicator (input_cache_read).

## Typography

Cascadia Code (monospace) for everything — headings, body, labels, code. This reinforces the terminal/CLI aesthetic. Weights carry hierarchy: Regular (300) for body, Medium (500) for emphasis, Bold (600) for headings. Tight letter-spacing on display sizes; default tracking on body. All-caps labels use 0.08em letter-spacing for scanning.

## Layout

4px baseline spacing scale. `sm` (8px) for intra-component gaps, `md` (16px) for inter-component gaps, `lg` (24px) for section breaks. The usage indicator sits in the input area with compact horizontal layout.

## Shapes

Rounded corners are modest: `sm` (4px) on pills/badges, `md` (8px) on cards and the usage indicator container, `full` (9999px) on progress bar caps. The usage bar uses `height: 6px` with `full` radius.

## Components

### Usage Indicator (Primary)

A horizontal bar showing context window utilization with three segments:
- **Safe zone** (green): 0-60% usage
- **Warning zone** (amber): 60-80% usage
- **Danger zone** (red): 80-100% usage — compaction triggers at 80%

Below the bar: token counts (prompt + cache read / total context window), model badge, and optional compaction status pill.

Compact variant for tight spaces: shows only percentage + mini bar.

### Usage Bar

Segmented progress bar with color-coded fills. Each segment animates smoothly on update. Cache tokens shown as a subtle overlay segment.

### Compaction Indicator

Small pill badge appearing when background compaction runs. Uses cache color (#6E7D73) with "HistorySummarizing..." text and spinner.

### Model Badge

Compact badge showing the active model (e.g., "gpt-oss-120b"). Uses card surface with subtle border.

## Do's and Don'ts

- **Do** use token references (`{colors.primary}`) instead of literal hex in component definitions.
- **Do** animate the usage bar fill smoothly (150-200ms ease-out) when values change.
- **Do** show exact token counts on hover/focus for precision.
- **Don't** introduce colors outside the palette — extend the palette first.
- **Don't** nest component variants. `usage-indicator-compact` is a sibling, not a child.
- **Don't** use `body-md` for token counts — use `mono` for tabular alignment.
- **Don't** show the compaction indicator unless actively running — avoid noise.
- **Don't** use the danger color for anything other than >80% usage or destructive actions.