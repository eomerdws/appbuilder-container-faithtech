<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>{m.admin_settings_title()}</title></svelte:head>

<div class="settings-page">
  <header>
    <p class="eyebrow">{m.admin_settings_eyebrow()}</p>
    <h1>{m.admin_settings_heading()}</h1>
    <p class="description">{m.admin_settings_description()}</p>
  </header>

  {#if form?.error}
    <p class="notice error" role="alert">{form.error}</p>
  {:else if form?.success}
    <p class="notice success" role="status">{form.message}</p>
  {/if}

  <section class="current-image" aria-labelledby="current-image-heading">
    <h2 id="current-image-heading">{m.admin_settings_current_heading()}</h2>
    {#if data.heroBackgroundImageKey}
      <img src="/hero-background" alt={m.admin_settings_current_heading()} />
    {:else}
      <p class="empty">{m.admin_settings_current_none()}</p>
    {/if}
  </section>

  <form method="post" enctype="multipart/form-data" use:enhance>
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
</div>

<style>
  .settings-page {
    display: grid;
    max-width: 40rem;
    gap: 1.5rem;
  }

  .eyebrow {
    margin: 0 0 0.4rem;
    color: var(--blue);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
  }

  .description {
    margin: 0.4rem 0 0;
    color: #9aa4b3;
  }

  .notice {
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
