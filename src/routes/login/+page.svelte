<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

  let { data }: { data: PageData } = $props();
  // The form intentionally initializes once from the server-loaded page data.
  // svelte-ignore state_referenced_locally
  const { form, errors, message, enhance, submitting } = superForm(data.form);

  let showPassword = $state(false);
</script>

<svelte:head><title>{m.login_title()}</title></svelte:head>

<section class="login-panel" aria-labelledby="login-title">
  <div class="login-intro">
    <p>{m.login_eyebrow()}</p>
    <h1 id="login-title">{m.login_heading()}</h1>
    <span>{m.login_subtext()}</span>
  </div>

  {#if data.isLocal}
    <aside class="dev-login" aria-label={m.login_dev_aside_aria()}>
      <strong>{m.login_dev_aside_heading()}</strong>
      <code>admin@example.invalid</code>
      <code>demo-password-123</code>
      <small
        >{m.login_dev_aside_instruction_prefix()}
        <code>npm run db:seed:dev</code>
        {m.login_dev_aside_instruction_suffix()}</small
      >
    </aside>
  {/if}

  <form method="post" use:enhance>
    {#if $message}
      <p class="form-message" role="alert">{$message}</p>
    {/if}

    <label>
      <span>{m.login_email_label()}</span>
      <input
        type="email"
        name="email"
        autocomplete="username"
        bind:value={$form.email}
        aria-invalid={$errors.email ? 'true' : undefined}
        required
      />
      {#if $errors.email}<small class="field-error">{$errors.email}</small>{/if}
    </label>

    <label>
      <span>{m.login_password_label()}</span>
      <div class="password-field">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          autocomplete="current-password"
          bind:value={$form.password}
          aria-invalid={$errors.password ? 'true' : undefined}
          required
        />
        <button
          type="button"
          class="toggle-password"
          aria-label={showPassword ? m.login_hide_password() : m.login_show_password()}
          aria-pressed={showPassword}
          onclick={() => (showPassword = !showPassword)}
        >
          {#if showPassword}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.6 6.7C4.1 8.3 2.3 10.6 1.5 12c1.7 3 5.6 7.5 10.5 7.5 1.7 0 3.3-.5 4.7-1.2M9.9 4.7A10.9 10.9 0 0 1 12 4.5c4.9 0 8.8 4.5 10.5 7.5-.6 1-1.4 2.2-2.4 3.4"
              />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          {/if}
        </button>
      </div>
      {#if $errors.password}<small class="field-error">{$errors.password}</small>{/if}
    </label>

    <button type="submit" disabled={$submitting}>
      {$submitting ? m.login_submit_pending() : m.login_submit_default()}
    </button>
  </form>

  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
  <a href={localizeHref(resolve('/'))} class="catalogue-link"
    ><span aria-hidden="true">←</span> {m.login_return_link()}</a
  >
</section>

<style>
  .login-panel {
    width: min(100%, 27rem);
    border: 1px solid #303844;
    border-radius: 1.4rem;
    background: rgb(20 25 31 / 94%);
    padding: clamp(1.4rem, 5vw, 2.25rem);
    box-shadow: 0 2rem 6rem rgb(0 0 0 / 35%);
  }

  .login-intro p {
    margin: 0 0 0.4rem;
    color: var(--blue);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .login-intro h1 {
    margin: 0;
    font-size: 2.2rem;
    letter-spacing: -0.04em;
  }

  .login-intro > span {
    display: block;
    margin-top: 0.4rem;
    color: var(--muted);
  }

  .dev-login {
    display: grid;
    gap: 0.25rem;
    margin-top: 1.4rem;
    border: 1px solid rgb(120 180 255 / 28%);
    border-radius: 0.8rem;
    background: rgb(120 180 255 / 7%);
    padding: 0.9rem;
  }

  .dev-login strong {
    margin-bottom: 0.25rem;
    font-size: 0.78rem;
  }

  .dev-login code {
    color: #b8d8ff;
    font-size: 0.74rem;
  }

  .dev-login small {
    margin-top: 0.35rem;
    color: #7f8998;
    line-height: 1.45;
  }

  form {
    display: grid;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  label,
  label > span {
    display: grid;
    gap: 0.45rem;
  }

  label > span {
    color: #c5cbd4;
    font-size: 0.82rem;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 3.1rem;
    border: 1px solid #3a4451;
    border-radius: 0.75rem;
    background: #0f1318;
    color: #fff;
    padding: 0 0.9rem;
  }

  input[aria-invalid='true'] {
    border-color: #ff7883;
  }

  .password-field {
    position: relative;
  }

  .password-field input {
    padding-right: 2.9rem;
  }

  .toggle-password {
    position: absolute;
    top: 0;
    right: 0.35rem;
    display: grid;
    height: 100%;
    width: 2.4rem;
    place-items: center;
    border: 0;
    background: transparent;
    color: #909aa8;
    cursor: pointer;
  }

  .toggle-password:hover,
  .toggle-password:focus-visible {
    color: #fff;
  }

  .toggle-password svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .field-error,
  .form-message {
    color: #ff9da5;
    font-size: 0.75rem;
  }

  .form-message {
    margin: 0;
    border-radius: 0.65rem;
    background: rgb(255 110 121 / 10%);
    padding: 0.75rem;
  }

  form button {
    min-height: 3.2rem;
    border: 0;
    border-radius: 0.8rem;
    background: var(--blue);
    color: #061322;
    font-weight: 850;
    cursor: pointer;
  }

  form button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .catalogue-link {
    display: block;
    margin-top: 1.25rem;
    color: #909aa8;
    font-size: 0.78rem;
    text-align: center;
    text-decoration: none;
  }
</style>
