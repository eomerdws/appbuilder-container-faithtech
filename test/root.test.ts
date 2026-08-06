import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Page from '../src/routes/+page.svelte';

function pkg(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pkg-1',
    iso6393: 'gvs',
    regionCode: 'PG',
    regionName: 'Papua New Guinea',
    localName: 'Gumawana',
    sizeBytes: 11_351_769,
    publishUrl: 'https://example.com/packages/pkg-1.zip',
    listings: [{ title: 'Gumawana Bible' }],
    names: [
      { name: 'Gumawana', kind: 'PRIMARY' },
      { name: 'Domdom', kind: 'ALTERNATE' }
    ],
    ...overrides
  };
}

describe('+page.svelte (public catalogue)', () => {
  it('shows the home hero and search form when there is no query', () => {
    const { getByRole, queryByText } = render(Page, {
      props: { data: { packages: [], q: '' } as never }
    });

    expect(getByRole('heading', { name: 'Bible Apps' })).toBeTruthy();
    expect(getByRole('button', { name: 'Search packages' })).toBeTruthy();
    expect(queryByText('matching packages')).toBeNull();
  });

  it('shows a result count and package cards for a query with matches', () => {
    const { getByText, getByRole } = render(Page, {
      props: {
        data: { packages: [pkg()], q: 'gumawana' } as never
      }
    });

    expect(getByRole('heading', { name: 'Search results' })).toBeTruthy();
    expect(getByText('Gumawana Bible')).toBeTruthy();
    expect(getByText('Region: Papua New Guinea')).toBeTruthy();
    expect(getByText('Language code: gvs')).toBeTruthy();
    expect(getByText('Alternate names: Domdom')).toBeTruthy();
    expect(getByText('Package size: 11.4 MB')).toBeTruthy();
    expect(getByRole('link', { name: 'View' })).toBeTruthy();
  });

  it('downloads the package when the card body is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { getByRole } = render(Page, {
      props: {
        data: { packages: [pkg()], q: 'gumawana' } as never
      }
    });

    const card = getByRole('button', { name: /Gumawana Bible/ });
    await fireEvent.click(card);

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/packages/pkg-1.zip',
      '_blank',
      'noopener'
    );
    openSpy.mockRestore();
  });

  it('does not trigger a download when the View link is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { getByRole } = render(Page, {
      props: {
        data: { packages: [pkg()], q: 'gumawana' } as never
      }
    });

    const viewLink = getByRole('link', { name: 'View' });
    await fireEvent.click(viewLink);

    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('downloads the package when the card is activated with the keyboard', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { getByRole } = render(Page, {
      props: {
        data: { packages: [pkg()], q: 'gumawana' } as never
      }
    });

    const card = getByRole('button', { name: /Gumawana Bible/ });
    await fireEvent.keyDown(card, { key: 'Enter' });
    await fireEvent.keyDown(card, { key: ' ' });

    expect(openSpy).toHaveBeenCalledTimes(2);
    openSpy.mockRestore();
  });

  it('shows an empty state when a query returns no packages', () => {
    const { getByText, getByRole } = render(Page, {
      props: { data: { packages: [], q: 'nonexistent-language' } as never }
    });

    expect(getByText('No approved packages found')).toBeTruthy();
    expect(getByRole('link', { name: 'Start a new search' })).toBeTruthy();
  });

  it('falls back to the region code when no region name is set', () => {
    const { getByText } = render(Page, {
      props: {
        data: { packages: [pkg({ regionName: null })], q: 'gumawana' } as never
      }
    });

    expect(getByText('Region: PG')).toBeTruthy();
  });

  it('shows the custom site title in place of the default heading when set', () => {
    const { getByRole, queryByText } = render(Page, {
      props: {
        data: { packages: [], q: '', siteTitle: 'Custom Bible Apps' } as never
      }
    });

    expect(getByRole('heading', { name: 'Custom Bible Apps' })).toBeTruthy();
    expect(queryByText('Bible Apps')).toBeNull();
  });
});
