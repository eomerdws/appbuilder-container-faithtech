import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// @testing-library/svelte does not auto-cleanup between tests the way its
// React counterpart does, so an unmounted-but-still-rendered component from a
// previous test can leak into the next one's jsdom document.
afterEach(() => {
  cleanup();
});
