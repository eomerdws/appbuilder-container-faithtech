import { render } from '@testing-library/svelte';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/login/+page.svelte';
import { credentialsSchema } from '$lib/validation';

describe('login/+page.svelte', () => {
  it('renders empty email/password fields with no top-level error', async () => {
    const form = await superValidate(valibot(credentialsSchema));
    const { getByLabelText, queryByRole } = render(Page, {
      props: { data: { form, isLocal: false } as never }
    });

    expect((getByLabelText('Email address') as HTMLInputElement).value).toBe('');
    expect((getByLabelText('Password') as HTMLInputElement).value).toBe('');
    expect(queryByRole('alert')).toBeNull();
  });

  it('shows the local dev login hint only when isLocal is true', async () => {
    const form = await superValidate(valibot(credentialsSchema));
    const { queryByText } = render(Page, {
      props: { data: { form, isLocal: true } as never }
    });

    expect(queryByText('Local development login')).toBeTruthy();
  });

  it('hides the local dev login hint outside local development', async () => {
    const form = await superValidate(valibot(credentialsSchema));
    const { queryByText } = render(Page, {
      props: { data: { form, isLocal: false } as never }
    });

    expect(queryByText('Local development login')).toBeNull();
  });

  it('shows field-level validation errors from a failed submission', async () => {
    const form = await superValidate(
      { email: 'not-an-email', password: '' },
      valibot(credentialsSchema)
    );
    expect(form.valid).toBe(false);

    const { getByText } = render(Page, { props: { data: { form, isLocal: false } as never } });

    expect(getByText(form.errors.email![0]!)).toBeTruthy();
    expect(getByText(form.errors.password![0]!)).toBeTruthy();
  });

  it('shows a top-level message from a failed authentication attempt', async () => {
    const validated = await superValidate(valibot(credentialsSchema));
    const form = { ...validated, message: 'Invalid email or password' };

    const { getByRole } = render(Page, { props: { data: { form, isLocal: false } as never } });

    expect(getByRole('alert')).toHaveProperty('textContent', 'Invalid email or password');
  });
});
