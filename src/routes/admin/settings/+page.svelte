<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { goto, invalidate } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { daisyThemes } from '$lib/themes';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Intentionally initializes once from the server-loaded page data, then is
  // edited locally until the form is submitted.
  // svelte-ignore state_referenced_locally
  let themeName = $state(data.themeName ?? '');

  let themeFieldErrors = $derived(form?.fieldErrors ?? {});

  $effect(() => {
    if (form?.success && 'reset' in form && form.reset) {
      themeName = '';
    }
  });

  $effect(() => {
    if (form?.success) {
      const timeout = setTimeout(() => {
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref()
        goto(localizeHref(resolve('/admin')));
      }, 10_000);
      return () => clearTimeout(timeout);
    }
  });
</script>

<svelte:head><title>{m.admin_settings_title()}</title></svelte:head>

<header class="content-heading">
  <div>
    <p>{m.admin_settings_eyebrow()}</p>
    <h1>{m.admin_settings_heading()}</h1>
    <span>{m.admin_settings_description()}</span>
  </div>
</header>

{#if form?.error}
  <p class="notice error" role="alert">{form.error}</p>
{:else if form?.success}
  <p class="notice success" role="status">{form.message}</p>
  <p class="notice redirect" role="status">{m.admin_settings_redirect_notice()}</p>
{/if}

<section class="title-section" aria-labelledby="title-section-heading">
  <h2 id="title-section-heading">{m.admin_settings_title_section_heading()}</h2>
  <form method="post" action="?/updateTitle" use:enhance>
    <label for="siteTitle">{m.admin_settings_title_label()}</label>
    <input
      id="siteTitle"
      type="text"
      name="siteTitle"
      maxlength="200"
      value={data.siteTitle ?? ''}
    />
    <p class="hint">{m.admin_settings_title_hint()}</p>
    <button type="submit">{m.admin_settings_title_button()}</button>
  </form>
</section>

<section class="current-image" aria-labelledby="current-image-heading">
  <h2 id="current-image-heading">{m.admin_settings_current_heading()}</h2>
  {#if data.hasHeroBackgroundImage}
    <img src="/hero-background" alt={m.admin_settings_current_heading()} />
  {:else}
    <p class="empty">{m.admin_settings_current_none()}</p>
  {/if}
</section>

<form
  class="upload-form"
  method="post"
  action="?/uploadHeroImage"
  enctype="multipart/form-data"
  use:enhance
>
  <label for="heroImage">{m.admin_settings_upload_label()}</label>
  <input
    id="heroImage"
    type="file"
    name="heroImage"
    accept="image/jpeg,image/png,image/webp"
    required
  />
  <p class="hint">{m.admin_settings_upload_hint()}</p>
  <button type="submit">{m.admin_settings_upload_button()}</button>
</form>

<section class="theme-section" aria-labelledby="theme-section-heading">
  <h2 id="theme-section-heading">{m.admin_settings_theme_section_heading()}</h2>
  <form
    method="post"
    action="?/updateTheme"
    use:enhance={() => {
      return async ({ update }) => {
        await update();
        await invalidate('app:theme');
      };
    }}
  >
    <div class="theme-field">
      <label for="themeName">{m.admin_settings_theme_select_label()}</label>
      <select
        id="themeName"
        name="themeName"
        bind:value={themeName}
        class:invalid={Boolean(themeFieldErrors.themeName)}
        aria-invalid={themeFieldErrors.themeName ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeName ? 'themeName-error' : undefined}
      >
        <option value="">{m.admin_settings_theme_default_option()}</option>
        {#each daisyThemes as theme (theme)}
          <option value={theme}>{theme}</option>
        {/each}
      </select>
      {#if themeFieldErrors.themeName}
        <p id="themeName-error" class="field-error" role="alert">
          {themeFieldErrors.themeName}
        </p>
      {/if}
    </div>

    <div class="theme-preview" data-theme={themeName || undefined}>
      <div class="theme-preview-row">
        <svg class="theme-preview-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
          <circle cx="12" cy="12" r="9" stroke-width="2" />
        </svg>
        <span>{m.admin_settings_theme_section_heading()}</span>
        <button type="button">{m.admin_settings_theme_button()}</button>
      </div>
    </div>

    <p class="hint">{m.admin_settings_theme_hint()}</p>
    <div class="theme-buttons">
      <button type="submit">{m.admin_settings_theme_button()}</button>
      <button type="submit" formaction="?/resetTheme" class="secondary">
        {m.admin_settings_theme_reset_button()}
      </button>
    </div>
  </form>
</section>

<style>
  .content-heading {
    margin-bottom: 2rem;
  }

  .content-heading p {
    margin: 0 0 0.4rem;
    color: var(--blue);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .content-heading h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: -0.04em;
  }

  .content-heading span {
    display: block;
    max-width: 40rem;
    margin-top: 0.35rem;
    color: #9aa4b3;
  }

  .notice {
    margin-bottom: 1.25rem;
    border-radius: 0.75rem;
    padding: 0.9rem 1rem;
  }

  .notice.error {
    background: rgb(255 110 121 / 12%);
    color: #ffabb2;
  }
  .notice.success {
    background: rgb(88 214 154 / 12%);
    color: #8ce9bd;
  }

  .notice.redirect {
    background: transparent;
    color: var(--muted);
    padding: 0 1rem;
    font-size: 0.82rem;
  }

  .title-section {
    margin-bottom: 2rem;
  }

  .title-section h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }

  .title-section input[type='text'] {
    border: 1px solid #303844;
    border-radius: 0.5rem;
    background: #1b2027;
    padding: 0.6rem 0.75rem;
    color: #d8dce3;
    max-width: 32rem;
  }

  .current-image {
    margin-bottom: 1.5rem;
  }

  .current-image h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }

  .current-image img {
    width: 100%;
    max-width: 24rem;
    border: 1px solid #303844;
    border-radius: 0.75rem;
  }

  .current-image .empty {
    color: var(--muted);
  }

  .theme-section {
    margin-bottom: 1.5rem;
  }

  .theme-section h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }

  .theme-field {
    display: grid;
    gap: 0.35rem;
  }

  .theme-field select {
    border: 1px solid #303844;
    border-radius: 0.5rem;
    background: #1b2027;
    padding: 0.6rem 0.75rem;
    color: #d8dce3;
    max-width: 16rem;
    text-transform: capitalize;
  }

  .theme-field select.invalid {
    border-color: #ff6e79;
    outline-color: #ff6e79;
    background: rgb(255 110 121 / 8%);
  }

  .field-error {
    margin: 0;
    color: #ffabb2;
    font-size: 0.78rem;
  }

  /* Deliberately hardcoded, not DaisyUI-var-driven: the preview mirrors the
     real site, which never themes its background/row/text/icon — only the
     button below reflects the chosen theme's primary color. */
  .theme-preview {
    border: 1px solid #303844;
    border-radius: 0.75rem;
    background: #07090c;
    padding: 1rem;
  }

  .theme-preview-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 0.6rem;
    background: #171c23;
    padding: 0.75rem 1rem;
  }

  .theme-preview-row span {
    flex: 1;
    color: #f7f8fb;
    font-weight: 700;
  }

  .theme-preview-icon {
    flex-shrink: 0;
    stroke: #f7f8fb;
  }

  .theme-preview-row button {
    min-height: 2.2rem;
    border: 0;
    border-radius: 0.5rem;
    background: var(--color-primary, #2f6feb);
    color: var(--color-primary-content, #061322);
    padding: 0 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.15s;
  }

  form {
    display: grid;
    max-width: 32rem;
    gap: 0.6rem;
    border: 1px solid #303844;
    border-radius: 1rem;
    background: #1b2027;
    padding: 1.25rem;
  }

  input[type='file'] {
    color: #d8dce3;
  }

  .upload-form input[type='file']::file-selector-button,
  .upload-form button[type='submit'] {
    width: 11rem;
  }

  .upload-form input[type='file']::file-selector-button {
    min-height: 2.8rem;
    border: 0;
    border-radius: 0.65rem;
    background: var(--blue);
    color: #061322;
    padding: 0 1.25rem;
    font-family: inherit;
    font-size: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .hint {
    margin: 0;
    color: #8e98a7;
    font-size: 0.8rem;
  }

  button {
    justify-self: start;
    min-height: 2.8rem;
    border: 0;
    border-radius: 0.65rem;
    background: var(--blue);
    color: #061322;
    padding: 0 1.25rem;
    font-weight: 800;
    cursor: pointer;
  }

  .theme-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .theme-buttons button.secondary {
    border: 1px solid #3b4552;
    background: transparent;
    color: #d8dce3;
  }
</style>
