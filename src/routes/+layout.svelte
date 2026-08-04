<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages';
  import { deLocalizeUrl, getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime';
  import '../app.css';

  let { children } = $props();

  let isAdmin = $derived(deLocalizeUrl(page.url).pathname.startsWith('/admin'));
  let isAuth = $derived(deLocalizeUrl(page.url).pathname === '/login');

  let locale = $derived(getLocale());
  let currentLanguageName = $derived(
    locale === 'es' ? m.nav_language_spanish() : m.nav_language_english()
  );
</script>

<div class:admin-shell={isAdmin} class:auth-shell={isAuth} class="app-shell">
  <header class:admin-header={isAdmin} class="site-header">
    {#if isAdmin}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
      <a href={localizeHref(resolve('/admin'))} class="admin-brand">{m.nav_admin_panel()}</a>
      <div class="admin-identity" aria-label={m.nav_signed_in_admin()}>AD</div>
    {:else}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
      <a href={localizeHref(resolve('/'))} class="icon-button" aria-label={m.nav_home()}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3.5 10.6 12 3.8l8.5 6.8v9a.9.9 0 0 1-.9.9h-5.1v-6.1h-5v6.1H4.4a.9.9 0 0 1-.9-.9v-9Z"
          />
        </svg>
      </a>
      <div class="header-actions">
        <details class="language-menu">
          <summary
            class="language-pill"
            aria-label={m.nav_language_switcher_aria({ language: currentLanguageName })}
          >
            <span class="flag" aria-hidden="true">{locale === 'es' ? '🇪🇸' : '🇬🇧'}</span>
            <span>{locale.toUpperCase()}</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
          </summary>
          <div class="language-options" aria-label={m.nav_language_options_aria()}>
            <button
              type="button"
              class="language-option"
              class:current={locale === 'en'}
              lang="en"
              disabled={locale === 'en'}
              onclick={() => setLocale('en')}
            >
              <span class="flag" aria-hidden="true">🇬🇧</span>
              <span
                ><strong>{m.nav_language_english()}</strong>
                {#if locale === 'en'}<small>{m.nav_language_current()}</small>{/if}</span
              >
              {#if locale === 'en'}<span class="check" aria-hidden="true">✓</span>{/if}
            </button>
            <button
              type="button"
              class="language-option"
              class:current={locale === 'es'}
              lang="es"
              disabled={locale === 'es'}
              onclick={() => setLocale('es')}
            >
              <span class="flag" aria-hidden="true">🇪🇸</span>
              <span
                ><strong>{m.nav_language_spanish()}</strong>
                {#if locale === 'es'}<small>{m.nav_language_current()}</small>{/if}</span
              >
              {#if locale === 'es'}<span class="check" aria-hidden="true">✓</span>{/if}
            </button>
            <div class="language-option upcoming" lang="fr" aria-disabled="true">
              <span class="flag" aria-hidden="true">🇫🇷</span>
              <span
                ><strong>{m.nav_language_french()}</strong>
                <small>{m.nav_language_coming_soon()}</small></span
              >
            </div>
            <div class="language-option upcoming" lang="pt-BR" aria-disabled="true">
              <span class="flag" aria-hidden="true">🇧🇷</span>
              <span
                ><strong>{m.nav_language_portuguese()}</strong>
                <small>{m.nav_language_coming_soon()}</small></span
              >
            </div>
          </div>
        </details>
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
        <a href={localizeHref(resolve('/admin'))} class="admin-link">{m.nav_admin_link()}</a>
      </div>
    {/if}
  </header>
  <main class="page-frame">
    {@render children()}
  </main>
</div>

<style>
  .app-shell {
    min-height: 100vh;
    background: radial-gradient(circle at 50% 120%, rgb(38 89 150 / 42%), transparent 48%), #090c10;
  }

  .site-header {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: min(100%, 76rem);
    min-height: 4.5rem;
    margin: 0 auto;
    padding: 0.9rem clamp(1rem, 3vw, 2.5rem);
  }

  .icon-button,
  .language-pill,
  .admin-link {
    display: inline-flex;
    min-height: 2.5rem;
    align-items: center;
    justify-content: center;
    border: 1px solid #3b4552;
    border-radius: 0.8rem;
    background: #242a33;
    color: #f7f8fb;
    text-decoration: none;
  }

  .icon-button {
    width: 2.5rem;
    font-weight: 800;
  }

  .icon-button svg {
    width: 1.08rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .language-pill,
  .admin-link {
    padding: 0 0.8rem;
    font-size: 0.75rem;
    font-weight: 750;
  }

  .admin-link {
    background: transparent;
  }

  .language-menu {
    position: relative;
  }

  .language-menu summary {
    gap: 0.42rem;
    list-style: none;
    cursor: pointer;
  }

  .language-menu summary::-webkit-details-marker {
    display: none;
  }

  .language-menu summary > svg {
    width: 0.72rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
    transition: transform 160ms ease;
  }

  .language-menu[open] summary > svg {
    transform: rotate(180deg);
  }

  .flag {
    font-size: 1rem;
    line-height: 1;
  }

  .language-options {
    position: absolute;
    top: calc(100% + 0.55rem);
    right: 0;
    width: 14rem;
    overflow: hidden;
    border: 1px solid #343e4b;
    border-radius: 1rem;
    background: rgb(17 22 29 / 98%);
    padding: 0.4rem;
    box-shadow: 0 1.2rem 3rem rgb(0 0 0 / 42%);
    backdrop-filter: blur(18px);
  }

  .language-option {
    display: grid;
    grid-template-columns: 1.5rem 1fr auto;
    gap: 0.65rem;
    align-items: center;
    width: 100%;
    border: 0;
    border-radius: 0.7rem;
    background: none;
    padding: 0.7rem 0.65rem;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .language-option:disabled {
    cursor: default;
  }

  .language-option.current {
    background: #242d38;
  }

  .language-option.upcoming {
    color: #8993a1;
  }

  .language-option strong,
  .language-option small {
    display: block;
  }

  .language-option strong {
    color: inherit;
    font-size: 0.82rem;
  }

  .language-option small {
    margin-top: 0.08rem;
    color: #778290;
    font-size: 0.65rem;
  }

  .language-option.current small,
  .check {
    color: var(--blue);
  }

  .page-frame {
    position: relative;
    z-index: 1;
    width: min(100%, 76rem);
    margin: 0 auto;
    padding: 0 clamp(1rem, 3vw, 2.5rem) 3rem;
  }

  .admin-shell {
    background: #0c1014;
  }

  .admin-header {
    width: 100%;
    max-width: none;
    min-height: 4.75rem;
    padding-inline: clamp(1rem, 3vw, 3rem);
    border-bottom: 1px solid #242b34;
    background: #050607;
  }

  .admin-shell .page-frame {
    width: 100%;
    max-width: none;
    padding: 0;
  }

  .admin-brand {
    color: #fff;
    font-size: clamp(1.25rem, 2.4vw, 2rem);
    font-weight: 800;
    text-decoration: none;
  }

  .admin-identity {
    display: grid;
    width: 2.65rem;
    height: 2.65rem;
    place-items: center;
    border-radius: 999px;
    background: #242a33;
    color: #fff;
    font-weight: 800;
  }

  .auth-shell .page-frame {
    display: grid;
    min-height: calc(100vh - 4.5rem);
    place-items: center;
    padding-bottom: 6rem;
  }

  @media (max-width: 560px) {
    .admin-link {
      display: none;
    }
  }
</style>
