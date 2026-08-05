<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages';
  import { deLocalizeUrl, localizeHref } from '$lib/paraglide/runtime';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let pathname = $derived(deLocalizeUrl(page.url).pathname);
  let currentStatus = $derived(
    pathname === '/admin' ? (page.url.searchParams.get('status') ?? 'PENDING') : null
  );
</script>

<div class="admin-layout">
  <aside class="admin-sidebar" aria-label={m.admin_nav_aria()}>
    <!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
    <nav>
      <a
        class:current={currentStatus === 'ACTIVE'}
        href={localizeHref(resolve('/admin?status=ACTIVE'))}
      >
        <span>{m.admin_nav_active()}</span>
        <strong>{data.counts.ACTIVE ?? 0}</strong>
      </a>
      <a
        class:current={currentStatus === 'PENDING'}
        href={localizeHref(resolve('/admin?status=PENDING'))}
      >
        <span>{m.admin_nav_pending()}</span>
        <strong class="pending-count">{data.counts.PENDING ?? 0}</strong>
      </a>
      <a
        class:current={currentStatus === 'REJECTED'}
        href={localizeHref(resolve('/admin?status=REJECTED'))}
      >
        <span>{m.admin_nav_rejected()}</span>
        <strong>{data.counts.REJECTED ?? 0}</strong>
      </a>
      <a
        class:current={currentStatus === 'INACTIVE'}
        href={localizeHref(resolve('/admin?status=INACTIVE'))}
      >
        <span>{m.admin_nav_inactive()}</span>
        <strong>{data.counts.INACTIVE ?? 0}</strong>
      </a>
    </nav>
    <!-- eslint-enable svelte/no-navigation-without-resolve -->

    <!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
    <a
      class="settings-link"
      class:current={pathname === '/admin/settings'}
      href={localizeHref(resolve('/admin/settings'))}>{m.admin_nav_settings()}</a
    >
    <!-- eslint-enable svelte/no-navigation-without-resolve -->

    <form method="post" action="/logout">
      <button type="submit">{m.admin_sign_out()}</button>
    </form>
  </aside>

  <main class="admin-content">
    {@render children()}
  </main>
</div>

<style>
  .admin-layout {
    display: grid;
    min-height: calc(100vh - 4.75rem);
    grid-template-columns: clamp(15rem, 19vw, 17rem) minmax(0, 1fr);
  }

  .admin-sidebar {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #242b34;
    background: #151a20;
    padding: 1.25rem;
  }

  nav {
    display: grid;
    gap: 0.35rem;
  }

  nav a {
    display: flex;
    min-height: 3.25rem;
    align-items: center;
    justify-content: space-between;
    border-radius: 0.65rem;
    color: #d8dce3;
    padding: 0 0.9rem;
    text-decoration: none;
  }

  nav a:hover,
  nav a.current {
    background: #303741;
    color: #fff;
  }

  nav strong {
    color: #8f9aaa;
    font-size: 0.82rem;
  }

  nav .pending-count {
    color: var(--orange);
  }

  .settings-link {
    display: flex;
    min-height: 3.25rem;
    align-items: center;
    margin-top: 0.75rem;
    border-radius: 0.65rem;
    color: #d8dce3;
    padding: 0 0.9rem;
    text-decoration: none;
  }

  .settings-link:hover,
  .settings-link.current {
    background: #303741;
    color: #fff;
  }

  .future-nav {
    display: grid;
    gap: 0.2rem;
    margin-top: 1.5rem;
    border-top: 1px solid #2a313a;
    padding-top: 1.25rem;
  }

  .future-nav p {
    margin: 0 0 0.35rem;
    color: #616c7b;
    padding: 0 0.7rem;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .future-nav > span {
    overflow: hidden;
    color: #8993a2;
    padding: 0.55rem 0.7rem;
    font-size: 0.82rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-sidebar > form {
    margin-top: auto;
    padding-top: 2rem;
  }

  .admin-sidebar > form button {
    width: 100%;
    min-height: 2.8rem;
    border: 1px solid #3b4551;
    border-radius: 0.65rem;
    background: transparent;
    color: #c5cbd4;
    cursor: pointer;
  }

  .admin-content {
    position: relative;
    min-width: 0;
    padding: clamp(1.5rem, 4vw, 3.5rem);
  }

  @media (max-width: 1200px) {
    .admin-layout {
      grid-template-columns: 1fr;
    }

    .admin-sidebar {
      display: none;
    }
  }

  @media (max-width: 620px) {
    .admin-content {
      padding: 1.25rem 1rem 3rem;
    }
  }
</style>
