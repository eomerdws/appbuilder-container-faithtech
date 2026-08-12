/**
 * DaisyUI 5's built-in theme names, in the order DaisyUI itself defines them
 * (node_modules/daisyui/functions/themeOrder.js). Kept as a hand-copied list
 * (not imported from daisyui) so it stays a plain value usable in both the
 * admin dropdown and the Valibot picklist without pulling a Tailwind plugin
 * into server code. Must be kept in sync with `@plugin "daisyui" { themes: all }`
 * in src/app.css if that config ever changes to a subset.
 */
export const daisyThemes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk'
] as const;

export type DaisyTheme = (typeof daisyThemes)[number];
