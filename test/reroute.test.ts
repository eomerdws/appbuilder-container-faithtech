import { describe, expect, it } from 'vitest';
import { reroute } from '../src/hooks';

describe('universal reroute hook', () => {
  function routeFor(url: string): string {
    return reroute({ url: new URL(url) } as never) as string;
  }

  it('leaves an unprefixed path untouched', () => {
    expect(routeFor('https://worker.test/')).toBe('/');
    expect(routeFor('https://worker.test/packages/abc-123')).toBe('/packages/abc-123');
  });

  it('strips a locale prefix before SvelteKit sees the route', () => {
    expect(routeFor('https://worker.test/es/')).toBe('/');
    expect(routeFor('https://worker.test/ar/admin/settings')).toBe('/admin/settings');
    expect(routeFor('https://worker.test/zh/packages/abc-123')).toBe('/packages/abc-123');
  });

  it('does not treat an unknown locale-like segment as a prefix', () => {
    expect(routeFor('https://worker.test/xx/admin')).toBe('/xx/admin');
  });
});
