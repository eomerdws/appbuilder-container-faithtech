import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/packages/[id]/+page.svelte';

function packageData(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    package: {
      id: 'pkg-1',
      iso6393: 'gvs',
      regionCode: 'PG',
      regionName: 'Papua New Guinea',
      localName: 'Gumawana',
      sizeBytes: 11_351_769,
      appBuilderVersion: '9.3',
      publishUrl: 'https://example.com/gumawana.zip',
      listings: [{ title: 'Gumawana Bible' }],
      ...overrides
    }
  };
}

describe('packages/[id]/+page.svelte', () => {
  it('renders the package details and a download link', () => {
    const { getByRole, getByText } = render(Page, {
      props: { data: packageData() as never }
    });

    expect(getByRole('heading', { name: 'Gumawana Bible' })).toBeTruthy();
    expect(getByText('Language code: gvs', { exact: false })).toBeTruthy();
    expect(getByText('11.4 MB')).toBeTruthy();
    expect(getByText('9.3')).toBeTruthy();

    const downloadLink = getByRole('link', { name: 'Download package' });
    expect(downloadLink.getAttribute('href')).toBe('https://example.com/gumawana.zip');
  });

  it('falls back to the package local name when no listing title exists', () => {
    const { getByRole } = render(Page, {
      props: { data: packageData({ listings: [] }) as never }
    });

    expect(getByRole('heading', { name: 'Gumawana' })).toBeTruthy();
  });

  it('shows download confirmation feedback after the download link is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(Page, {
      props: { data: packageData() as never }
    });

    expect(queryByRole('status')).toBeNull();

    await user.click(getByRole('link', { name: 'Download package' }));

    expect(getByRole('link', { name: 'Download opened' })).toBeTruthy();
    expect(getByRole('status')).toBeTruthy();
  });
});
