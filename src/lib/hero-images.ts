/**
 * The GlobeHero background is a choice between two images bundled with the
 * app (static/), not an admin-uploaded file — kept as a plain value usable
 * in both the admin radio choices and the Valibot picklist without pulling
 * in server-only code.
 */
export const heroBackgroundImages = ['earth-asia', 'earth-americas'] as const;

export type HeroBackgroundImage = (typeof heroBackgroundImages)[number];

export const defaultHeroBackgroundImage: HeroBackgroundImage = 'earth-asia';

const heroBackgroundImagePaths: Record<HeroBackgroundImage, string> = {
  'earth-asia': '/earth-asia.png',
  'earth-americas': '/earth-americas.jpg'
};

export function heroBackgroundImagePath(image: HeroBackgroundImage): string {
  return heroBackgroundImagePaths[image];
}
