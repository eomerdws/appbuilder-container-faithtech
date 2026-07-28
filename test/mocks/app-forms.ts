// Stand-in for SvelteKit's $app/forms, aliased in vitest.config.components.ts.
// Component tests render forms but don't exercise real network submission, so
// `enhance` is a no-op action rather than one that attaches a submit listener.
export function enhance(): { destroy(): void } {
  return { destroy() {} };
}

export async function applyAction(): Promise<void> {}

export function deserialize(): never {
  throw new Error('deserialize() is not implemented in the test $app/forms mock');
}
