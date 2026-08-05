<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

  let { data, form }: { data: PageData; form: ActionData } = $props();

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
  {#if data.heroBackgroundImageKey}
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
</style>
