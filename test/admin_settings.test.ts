import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/admin/settings/+page.svelte';

function data(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    hasHeroBackgroundImage: false,
    siteTitle: null,
    themeName: null,
    ...overrides
  };
}

describe('admin/settings/+page.svelte', () => {
  it('pre-fills the theme select from a custom theme value', () => {
    const { getByLabelText } = render(Page, {
      props: {
        data: data({ themeName: 'dracula' }) as never,
        form: undefined as never
      }
    });

    expect((getByLabelText('Theme') as unknown as HTMLSelectElement).value).toBe('dracula');
  });

  it('selects the default option when no custom theme is set', () => {
    const { getByLabelText } = render(Page, {
      props: { data: data() as never, form: undefined as never }
    });

    expect((getByLabelText('Theme') as unknown as HTMLSelectElement).value).toBe('');
  });

  it('still renders the site title and hero image sections unaffected', () => {
    const { getByLabelText, getByText } = render(Page, {
      props: {
        data: data({
          siteTitle: 'Custom Bible Apps',
          themeName: 'dracula'
        }) as never,
        form: undefined as never
      }
    });

    expect((getByLabelText('Display name') as HTMLInputElement).value).toBe('Custom Bible Apps');
    expect(
      getByText('No custom background image has been set yet — the default image is shown.')
    ).toBeTruthy();
  });

  it('shows a theme update success message from the form action result', () => {
    const { getByText } = render(Page, {
      props: {
        data: data() as never,
        form: { success: true, message: 'Theme updated.' } as never
      }
    });

    expect(getByText('Theme updated.')).toBeTruthy();
  });

  it('renders a Reset theme button targeting the resetTheme action', () => {
    const { getByText } = render(Page, {
      props: { data: data() as never, form: undefined as never }
    });

    const resetButton = getByText('Reset theme');
    expect(resetButton).toBeTruthy();
    expect(resetButton.getAttribute('formaction')).toBe('?/resetTheme');
  });

  it('highlights the theme select and shows its error message', () => {
    const { getByLabelText, container } = render(Page, {
      props: {
        data: data() as never,
        form: {
          error: 'Choose a valid theme.',
          fieldErrors: { themeName: 'Choose a valid theme.' }
        } as never
      }
    });

    const themeSelect = getByLabelText('Theme') as unknown as HTMLSelectElement;
    expect(themeSelect.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('#themeName-error')?.textContent?.trim()).toBe(
      'Choose a valid theme.'
    );
  });

  it('clears the theme select when the reset action reports success', () => {
    const { getByLabelText } = render(Page, {
      props: {
        data: data({ themeName: 'dracula' }) as never,
        form: { success: true, message: 'Theme reset to the default colors.', reset: true } as never
      }
    });

    expect((getByLabelText('Theme') as unknown as HTMLSelectElement).value).toBe('');
  });
});
