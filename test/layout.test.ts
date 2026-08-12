import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Layout from '../src/routes/+layout.svelte';
import { page } from '$app/state';

function childrenSnippet(text = 'page content') {
  return createRawSnippet(() => ({
    render: () => `<div data-testid="child-content">${text}</div>`
  }));
}

describe('+layout.svelte', () => {
  it('renders the public header and the routed content on the home page', () => {
    // svelte-check resolves $app/state's real (route-restricted) type here,
    // even though the jsdom test run aliases it to test/mocks/app-state.ts.
    page.url = new URL('https://example.com/') as typeof page.url;
    const { getByLabelText, getByText, queryByLabelText } = render(Layout, {
      props: { children: childrenSnippet() }
    });

    expect(getByLabelText('Home')).toBeTruthy();
    expect(getByText('page content')).toBeTruthy();
    expect(queryByLabelText('Signed in administrator')).toBeNull();
  });

  it('renders the admin header when the route is under /admin', () => {
    page.url = new URL('https://example.com/admin') as typeof page.url;
    const { getByText, getByLabelText } = render(Layout, {
      props: { children: childrenSnippet() }
    });

    expect(getByText('Administrator Panel')).toBeTruthy();
    expect(getByLabelText('Signed in administrator')).toBeTruthy();
  });

  it('renders the admin header for a locale-prefixed /en/admin URL', () => {
    // The real browser URL carries a locale prefix (paraglide's URL strategy) —
    // isAdmin must de-localize the pathname before matching, not compare it raw.
    page.url = new URL('https://example.com/en/admin') as typeof page.url;
    const { getByText, getByLabelText } = render(Layout, {
      props: { children: childrenSnippet() }
    });

    expect(getByText('Administrator Panel')).toBeTruthy();
    expect(getByLabelText('Signed in administrator')).toBeTruthy();
  });

  it('marks the shell as the auth layout on the login page', () => {
    page.url = new URL('https://example.com/login') as typeof page.url;
    const { container } = render(Layout, { props: { children: childrenSnippet() } });

    expect(container.querySelector('.app-shell.auth-shell')).toBeTruthy();
    expect(container.querySelector('.app-shell.admin-shell')).toBeNull();
  });

  it('marks the shell as the auth layout for a locale-prefixed /es/login URL', () => {
    page.url = new URL('https://example.com/es/login') as typeof page.url;
    const { container } = render(Layout, { props: { children: childrenSnippet() } });

    expect(container.querySelector('.app-shell.auth-shell')).toBeTruthy();
    expect(container.querySelector('.app-shell.admin-shell')).toBeNull();
  });

  const themeData = { themeName: 'dracula' };

  it('applies the chosen theme name and button color mapping on the public catalog', () => {
    page.url = new URL('https://example.com/') as typeof page.url;
    const { container } = render(Layout, {
      props: { children: childrenSnippet(), data: themeData as never }
    });

    const shell = container.querySelector('.app-shell') as HTMLElement;
    expect(shell.getAttribute('data-theme')).toBe('dracula');
    expect(shell.style.getPropertyValue('--theme-button')).toBe('var(--color-primary)');
    expect(shell.style.getPropertyValue('--theme-button-content')).toBe(
      'var(--color-primary-content)'
    );
    // The background/row/text/icon are never themed — the site's dark shell
    // stays put regardless of which DaisyUI theme is chosen.
    expect(shell.style.getPropertyValue('--theme-row')).toBe('');
    expect(shell.style.getPropertyValue('--theme-background')).toBe('');
    expect(shell.style.getPropertyValue('--theme-text')).toBe('');
    expect(shell.style.getPropertyValue('--theme-icon')).toBe('');
  });

  it('omits data-theme and the style attribute when no theme is set', () => {
    page.url = new URL('https://example.com/') as typeof page.url;
    const { container } = render(Layout, {
      props: { children: childrenSnippet(), data: { themeName: null } as never }
    });

    const shell = container.querySelector('.app-shell');
    expect(shell?.hasAttribute('data-theme')).toBe(false);
    expect(shell?.hasAttribute('style')).toBe(false);
  });

  it('never applies the chosen theme to the admin console, even if set', () => {
    page.url = new URL('https://example.com/admin') as typeof page.url;
    const { container } = render(Layout, {
      props: { children: childrenSnippet(), data: themeData as never }
    });

    const shell = container.querySelector('.app-shell');
    expect(shell?.hasAttribute('data-theme')).toBe(false);
    expect(shell?.hasAttribute('style')).toBe(false);
  });

  it('never applies the chosen theme to the login page, even if set', () => {
    page.url = new URL('https://example.com/login') as typeof page.url;
    const { container } = render(Layout, {
      props: { children: childrenSnippet(), data: themeData as never }
    });

    const shell = container.querySelector('.app-shell');
    expect(shell?.hasAttribute('data-theme')).toBe(false);
    expect(shell?.hasAttribute('style')).toBe(false);
  });
});
