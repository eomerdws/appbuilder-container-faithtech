// Stand-in for SvelteKit's $app/state, aliased in vitest.config.components.ts.
// Not reactive like the real module — tests import `page` and mutate it
// directly before render() to simulate a given route.
export const page = {
  url: new URL('https://example.com/')
};
