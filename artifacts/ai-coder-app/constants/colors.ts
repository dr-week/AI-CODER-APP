/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0a0a0a',
    tint: '#F97316',

    // Core surfaces
    background: '#171717',
    foreground: '#FAFAF9',

    // Cards / elevated surfaces
    card: '#242424',
    cardForeground: '#FAFAF9',

    // Primary action color (buttons, links, active states)
    primary: '#F97316',
    primaryForeground: '#171717',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#333333',
    secondaryForeground: '#E7E5E4',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#2A2A2A',
    mutedForeground: '#A8A29E',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#3A2418',
    accentForeground: '#FED7AA',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#3F3F46',
    input: '#3F3F46',
  },
  dark: {
    text: '#FAFAF9',
    tint: '#FB923C',
    background: '#171717',
    foreground: '#FAFAF9',
    card: '#242424',
    cardForeground: '#FAFAF9',
    primary: '#FB923C',
    primaryForeground: '#171717',
    secondary: '#333333',
    secondaryForeground: '#E7E5E4',
    muted: '#2A2A2A',
    mutedForeground: '#A8A29E',
    accent: '#3A2418',
    accentForeground: '#FED7AA',
    destructive: '#F87171',
    destructiveForeground: '#1C0A0A',
    border: '#3F3F46',
    input: '#44403C',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
