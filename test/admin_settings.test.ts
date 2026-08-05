import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/admin/settings/+page.svelte';

function data(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    heroBackgroundImageKey: null,
    siteTitle: null,
    themeButtonColor: null,
    themeRowColor: null,
    themeBackgroundColor: null,
    themeTextColor: null,
    themeIconColor: null,
    ...overrides
  };
}

describe('admin/settings/+page.svelte', () => {
  it('pre-fills the theme section inputs from custom theme values', () => {
    const { getByLabelText } = render(Page, {
      props: {
        data: data({
          themeButtonColor: '#ff0000',
          themeRowColor: '#00ff00',
          themeBackgroundColor: '#0000ff',
          themeTextColor: '#ffffff',
          themeIconColor: '#123456'
        }) as never,
        form: undefined as never
      }
    });

    expect((getByLabelText('Button color') as HTMLInputElement).value).toBe('#ff0000');
    expect((getByLabelText('Row color') as HTMLInputElement).value).toBe('#00ff00');
    expect((getByLabelText('Background color') as HTMLInputElement).value).toBe('#0000ff');
    expect((getByLabelText('Text color') as HTMLInputElement).value).toBe('#ffffff');
    expect((getByLabelText('Icon color') as HTMLInputElement).value).toBe('#123456');
  });

  it('renders empty theme inputs when no custom colors are set', () => {
    const { getByLabelText } = render(Page, {
      props: { data: data() as never, form: undefined as never }
    });

    expect((getByLabelText('Button color') as HTMLInputElement).value).toBe('');
    expect((getByLabelText('Row color') as HTMLInputElement).value).toBe('');
    expect((getByLabelText('Background color') as HTMLInputElement).value).toBe('');
    expect((getByLabelText('Text color') as HTMLInputElement).value).toBe('');
    expect((getByLabelText('Icon color') as HTMLInputElement).value).toBe('');
  });

  it('still renders the site title and hero image sections unaffected', () => {
    const { getByLabelText, getByText } = render(Page, {
      props: {
        data: data({
          siteTitle: 'Custom Bible Apps',
          themeButtonColor: '#ff0000'
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
});
