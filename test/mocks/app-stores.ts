// Stand-in for SvelteKit's (legacy) $app/stores, aliased in vitest.config.components.ts.
// sveltekit-superforms still imports from here internally.
import { readable } from 'svelte/store';

export const page = readable({
  url: new URL('https://example.com/'),
  status: 200,
  error: null,
  data: {},
  form: undefined,
  params: {},
  route: { id: null },
  state: {}
});

export const navigating = readable(null);
export const updated = { subscribe: readable(false).subscribe, check: async () => false };
