/**
 * The GlobeHero background is a choice between two images bundled with the
 * app (static/) or an admin-uploaded "custom" image — kept as a plain value
 * usable in both the admin radio choices and the Valibot picklist without
 * pulling in server-only code. The 'custom' image's bytes live in the
 * database (see src/lib/server/settings.ts) and are streamed by the
 * /hero-background route rather than having a static path here.
 */
export const heroBackgroundImages = ['earth-asia', 'earth-americas', 'custom'] as const;

export type HeroBackgroundImage = (typeof heroBackgroundImages)[number];

export const defaultHeroBackgroundImage: HeroBackgroundImage = 'earth-asia';

export const customHeroBackgroundImagePath = '/hero-background';

const presetHeroBackgroundImagePaths: Record<Exclude<HeroBackgroundImage, 'custom'>, string> = {
  'earth-asia': '/earth-asia.png',
  'earth-americas': '/earth-americas.jpg'
};

export function heroBackgroundImagePath(image: HeroBackgroundImage): string {
  return image === 'custom' ? customHeroBackgroundImagePath : presetHeroBackgroundImagePaths[image];
}

/**
 * Preset GlobeHero backgrounds are photographic globes rendered inside a
 * circular "globe" shape with an atmosphere/night-shade overlay. A
 * custom-uploaded image is assumed to be a flat 1200x1200 graphic, not a
 * globe photo, so it's rendered flat (no circular crop, no atmosphere).
 */
export function isFlatHeroBackgroundImage(image: HeroBackgroundImage): boolean {
  return image === 'custom';
}
