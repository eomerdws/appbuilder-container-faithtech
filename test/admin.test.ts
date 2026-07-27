import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/admin/+page.svelte';

function pkg(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pkg-1',
    iso6393: 'gvs',
    projectName: 'gvs Gumawana',
    regionName: 'Papua New Guinea',
    localName: 'Gumawana',
    languageTag: 'gvs-Latn-PG',
    appBuilder: 'scripture-app-builder',
    appBuilderVersion: '9.3',
    rejectionReason: null,
    listings: [{ title: 'Gumawana Bible' }],
    ...overrides
  };
}

function data(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    selected: 'PENDING',
    counts: { PENDING: 1, ACTIVE: 0, REJECTED: 0, INACTIVE: 0 },
    packages: [pkg()],
    ...overrides
  };
}

describe('admin/+page.svelte', () => {
  it('renders the pending queue with approve/reject actions', () => {
    const { getByRole, getByText } = render(Page, {
      props: { data: data() as never, form: undefined as never }
    });

    expect(getByRole('heading', { name: 'Incoming packages' })).toBeTruthy();
    expect(getByText('Gumawana Bible')).toBeTruthy();
    expect(getByText('gvs · gvs Gumawana')).toBeTruthy();
    expect(getByRole('button', { name: 'Approve' })).toBeTruthy();
    expect(getByRole('button', { name: 'Reject' })).toBeTruthy();
  });

  it('requires a reason input alongside the reject action', () => {
    const { getByRole } = render(Page, {
      props: { data: data() as never, form: undefined as never }
    });

    const reasonInput = getByRole('textbox', { name: /reason for rejecting/i });
    expect(reasonInput.getAttribute('required')).not.toBeNull();
  });

  it('shows the deactivate action for active packages', () => {
    const { getByRole, queryByRole } = render(Page, {
      props: {
        data: data({
          selected: 'ACTIVE',
          packages: [pkg({ rejectionReason: null })]
        }) as never,
        form: undefined as never
      }
    });

    expect(getByRole('heading', { name: 'Active packages' })).toBeTruthy();
    expect(getByRole('button', { name: 'Deactivate' })).toBeTruthy();
    expect(queryByRole('button', { name: 'Approve' })).toBeNull();
  });

  it('shows the rejection reason and reopen action for rejected packages', () => {
    const { getByRole, getByText } = render(Page, {
      props: {
        data: data({
          selected: 'REJECTED',
          packages: [pkg({ rejectionReason: 'Missing licensing information' })]
        }) as never,
        form: undefined as never
      }
    });

    expect(getByRole('heading', { name: 'Rejected packages' })).toBeTruthy();
    expect(getByText('Rejected: Missing licensing information')).toBeTruthy();
    expect(getByRole('button', { name: 'Reopen' })).toBeTruthy();
  });

  it('shows an empty state when the selected queue has no packages', () => {
    const { getByText } = render(Page, {
      props: {
        data: data({ selected: 'INACTIVE', packages: [] }) as never,
        form: undefined as never
      }
    });

    expect(getByText('Nothing here right now')).toBeTruthy();
    expect(getByText('There are no inactive packages.')).toBeTruthy();
  });

  it('shows a moderation error message from the form action result', () => {
    const { getByRole } = render(Page, {
      props: {
        data: data() as never,
        form: { error: 'Invalid moderation request' } as never
      }
    });

    expect(getByRole('alert')).toHaveProperty('textContent', 'Invalid moderation request');
  });

  it('shows a moderation success message from the form action result', () => {
    const { getByRole } = render(Page, {
      props: {
        data: data() as never,
        form: { success: true, message: 'Package active.' } as never
      }
    });

    expect(getByRole('status')).toHaveProperty('textContent', 'Package active.');
  });
});
