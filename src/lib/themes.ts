/**
 * DaisyUI 5's built-in theme names, in the order DaisyUI itself defines them
 * (node_modules/daisyui/functions/themeOrder.js). Kept as a hand-copied list
 * (not imported from daisyui) so it stays a plain value usable in both the
 * admin dropdown and the Valibot picklist without pulling a Tailwind plugin
 * into server code. Must be kept in sync with `@plugin "daisyui" { themes: all }`
 * in src/app.css if that config ever changes to a subset.
 *
 * Since the app only themes the accent button (`--color-primary` /
 * `--color-primary-content`, see src/routes/+layout.svelte) and no longer
 * themes the page background/text, a theme is only useful here if its button
 * text color is visually distinct from the fixed page text color — otherwise
 * the button just reads as another plain white-text button, indistinguishable
 * from several other themes and cluttering the dropdown with duplicates.
 * Themes pruned for that reason: light, dark, corporate, valentine, garden,
 * lofi, black, caramellatte, winter, business, fantasy, autumn. A second pass
 * removed near-duplicate *button* looks (near-identical primary/primary-content
 * pairs), keeping the dark-scheme theme of each pair: cmyk (kept night),
 * cupcake (kept aqua), coffee (kept sunset), cyberpunk (kept dracula).
 */
export const daisyThemes = [
  'bumblebee',
  'emerald',
  'synthwave',
  'retro',
  'halloween',
  'forest',
  'aqua',
  'pastel',
  'wireframe',
  'luxury',
  'dracula',
  'acid',
  'lemonade',
  'night',
  'dim',
  'nord',
  'sunset',
  'abyss',
  'silk'
] as const;

export type DaisyTheme = (typeof daisyThemes)[number];
