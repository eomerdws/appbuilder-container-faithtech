// Stand-in for SvelteKit's $app/paths, aliased in vitest.config.components.ts.
// The real resolve() also prefixes the configured `base` path; these
// components never rely on a non-empty base, so returning the route as-is
// (with [param] substitution) is enough for component tests.
export function resolve(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  return Object.entries(params).reduce(
    (withSubstitutions, [key, value]) => withSubstitutions.replaceAll(`[${key}]`, value),
    path
  );
}

export const base = '';
export const assets = '';
