<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { goto, invalidate } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // These fields intentionally initialize once from the server-loaded page data,
  // then are edited locally until the form is submitted.
  // svelte-ignore state_referenced_locally
  let themeButtonColor = $state(data.themeButtonColor ?? '');
  // svelte-ignore state_referenced_locally
  let themeRowColor = $state(data.themeRowColor ?? '');
  // svelte-ignore state_referenced_locally
  let themeBackgroundColor = $state(data.themeBackgroundColor ?? '');
  // svelte-ignore state_referenced_locally
  let themeTextColor = $state(data.themeTextColor ?? '');
  // svelte-ignore state_referenced_locally
  let themeIconColor = $state(data.themeIconColor ?? '');

  const defaultButtonColor = '#2f6feb';
  const defaultRowColor = '#171c23';
  const defaultBackgroundColor = '#07090c';
  const defaultTextColor = '#f7f8fb';
  const defaultIconColor = '#f7f8fb';

  let previewButtonColor = $derived(themeButtonColor || defaultButtonColor);
  let previewRowColor = $derived(themeRowColor || defaultRowColor);
  let previewBackgroundColor = $derived(themeBackgroundColor || defaultBackgroundColor);
  let previewTextColor = $derived(themeTextColor || defaultTextColor);
  let previewIconColor = $derived(themeIconColor || defaultIconColor);

  let themeFieldErrors = $derived(form?.fieldErrors ?? {});

  $effect(() => {
    if (form?.success && 'reset' in form && form.reset) {
      themeButtonColor = '';
      themeRowColor = '';
      themeBackgroundColor = '';
      themeTextColor = '';
      themeIconColor = '';
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

<form method="post" action="?/uploadHeroImage" enctype="multipart/form-data" use:enhance>
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
    <div class="color-field">
      <label for="themeButtonColor">{m.admin_settings_theme_button_label()}</label>
      <input
        id="themeButtonColor"
        type="text"
        name="themeButtonColor"
        maxlength="7"
        placeholder={defaultButtonColor}
        bind:value={themeButtonColor}
        class:invalid={Boolean(themeFieldErrors.themeButtonColor)}
        aria-invalid={themeFieldErrors.themeButtonColor ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeButtonColor ? 'themeButtonColor-error' : undefined}
      />
      {#if themeFieldErrors.themeButtonColor}
        <p id="themeButtonColor-error" class="field-error" role="alert">
          {themeFieldErrors.themeButtonColor}
        </p>
      {/if}
    </div>
    <div class="color-field">
      <label for="themeRowColor">{m.admin_settings_theme_row_label()}</label>
      <input
        id="themeRowColor"
        type="text"
        name="themeRowColor"
        maxlength="7"
        placeholder={defaultRowColor}
        bind:value={themeRowColor}
        class:invalid={Boolean(themeFieldErrors.themeRowColor)}
        aria-invalid={themeFieldErrors.themeRowColor ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeRowColor ? 'themeRowColor-error' : undefined}
      />
      {#if themeFieldErrors.themeRowColor}
        <p id="themeRowColor-error" class="field-error" role="alert">
          {themeFieldErrors.themeRowColor}
        </p>
      {/if}
    </div>
    <div class="color-field">
      <label for="themeBackgroundColor">{m.admin_settings_theme_background_label()}</label>
      <input
        id="themeBackgroundColor"
        type="text"
        name="themeBackgroundColor"
        maxlength="7"
        placeholder={defaultBackgroundColor}
        bind:value={themeBackgroundColor}
        class:invalid={Boolean(themeFieldErrors.themeBackgroundColor)}
        aria-invalid={themeFieldErrors.themeBackgroundColor ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeBackgroundColor
          ? 'themeBackgroundColor-error'
          : undefined}
      />
      {#if themeFieldErrors.themeBackgroundColor}
        <p id="themeBackgroundColor-error" class="field-error" role="alert">
          {themeFieldErrors.themeBackgroundColor}
        </p>
      {/if}
    </div>
    <div class="color-field">
      <label for="themeTextColor">{m.admin_settings_theme_text_label()}</label>
      <input
        id="themeTextColor"
        type="text"
        name="themeTextColor"
        maxlength="7"
        placeholder={defaultTextColor}
        bind:value={themeTextColor}
        class:invalid={Boolean(themeFieldErrors.themeTextColor)}
        aria-invalid={themeFieldErrors.themeTextColor ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeTextColor ? 'themeTextColor-error' : undefined}
      />
      {#if themeFieldErrors.themeTextColor}
        <p id="themeTextColor-error" class="field-error" role="alert">
          {themeFieldErrors.themeTextColor}
        </p>
      {/if}
    </div>
    <div class="color-field">
      <label for="themeIconColor">{m.admin_settings_theme_icon_label()}</label>
      <input
        id="themeIconColor"
        type="text"
        name="themeIconColor"
        maxlength="7"
        placeholder={defaultIconColor}
        bind:value={themeIconColor}
        class:invalid={Boolean(themeFieldErrors.themeIconColor)}
        aria-invalid={themeFieldErrors.themeIconColor ? 'true' : undefined}
        aria-describedby={themeFieldErrors.themeIconColor ? 'themeIconColor-error' : undefined}
      />
      {#if themeFieldErrors.themeIconColor}
        <p id="themeIconColor-error" class="field-error" role="alert">
          {themeFieldErrors.themeIconColor}
        </p>
      {/if}
    </div>

    <div
      class="theme-preview"
      style:background={previewBackgroundColor}
      style:border-color={previewRowColor}
    >
      <div class="theme-preview-row" style:background={previewRowColor}>
        <svg
          class="theme-preview-icon"
          style:stroke={previewIconColor}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
        >
          <circle cx="12" cy="12" r="9" stroke-width="2" />
        </svg>
        <span style:color={previewTextColor}>{m.admin_settings_theme_section_heading()}</span>
        <button type="button" style:background={previewButtonColor}>
          {m.admin_settings_theme_button()}
        </button>
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

  .color-field {
    display: grid;
    gap: 0.35rem;
  }

  .color-field input[type='text'] {
    border: 1px solid #303844;
    border-radius: 0.5rem;
    background: #1b2027;
    padding: 0.6rem 0.75rem;
    color: #d8dce3;
    max-width: 12rem;
    font-family: monospace;
  }

  .color-field input[type='text'].invalid {
    border-color: #ff6e79;
    outline-color: #ff6e79;
    background: rgb(255 110 121 / 8%);
  }

  .field-error {
    margin: 0;
    color: #ffabb2;
    font-size: 0.78rem;
  }

  .theme-preview {
    border: 1px solid #303844;
    border-radius: 0.75rem;
    padding: 1rem;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .theme-preview-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 0.6rem;
    padding: 0.75rem 1rem;
    transition: background 0.15s;
  }

  .theme-preview-row span {
    flex: 1;
    font-weight: 700;
    transition: color 0.15s;
  }

  .theme-preview-icon {
    flex-shrink: 0;
    transition: stroke 0.15s;
  }

  .theme-preview-row button {
    min-height: 2.2rem;
    border: 0;
    border-radius: 0.5rem;
    color: #061322;
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
