<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages';
  import {
    type Locale,
    deLocalizeUrl,
    getLocale,
    localizeHref,
    setLocale
  } from '$lib/paraglide/runtime';
  import '../app.css';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let isAdmin = $derived(deLocalizeUrl(page.url).pathname.startsWith('/admin'));
  let isAuth = $derived(deLocalizeUrl(page.url).pathname === '/login');

  // Custom theme colors are only reflected on the public catalog/package pages
  // — the admin console always stays on the default look so a bad color
  // choice can never make the settings UI itself unreadable. Set as an inline
  // style (rather than a global :root override) so they only ever apply to
  // this element and its descendants, never leaking into the admin shell.
  let themeStyle = $derived(
    isAdmin || isAuth
      ? undefined
      : [
          data?.themeButtonColor && `--theme-button: ${data.themeButtonColor}`,
          data?.themeRowColor && `--theme-row: ${data.themeRowColor}`,
          data?.themeBackgroundColor && `--theme-background: ${data.themeBackgroundColor}`,
          data?.themeTextColor && `--theme-text: ${data.themeTextColor}`,
          data?.themeIconColor && `--theme-icon: ${data.themeIconColor}`
        ]
          .filter(Boolean)
          .join('; ') || undefined
  );

  const localeOptions: Array<{ code: Locale; flag: string; name: () => string }> = [
    { code: 'en', flag: '🇬🇧', name: m.nav_language_english },
    { code: 'es', flag: '🇪🇸', name: m.nav_language_spanish },
    { code: 'ar', flag: '🇸🇦', name: m.nav_language_arabic },
    { code: 'de', flag: '🇩🇪', name: m.nav_language_german },
    { code: 'tl', flag: '🇵🇭', name: m.nav_language_tagalog },
    { code: 'fr', flag: '🇫🇷', name: m.nav_language_french },
    { code: 'id', flag: '🇮🇩', name: m.nav_language_indonesian },
    { code: 'ru', flag: '🇷🇺', name: m.nav_language_russian },
    { code: 'zh', flag: '🇨🇳', name: m.nav_language_chinese }
  ];

  let locale = $derived(getLocale());
  let currentOption = $derived(
    localeOptions.find((option) => option.code === locale) ?? localeOptions[0]
  );
</script>

<div class:admin-shell={isAdmin} class:auth-shell={isAuth} class="app-shell" style={themeStyle}>
  <header class:admin-header={isAdmin} class="site-header">
    {#if isAdmin}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
      <a href={localizeHref(resolve('/admin'))} class="admin-brand">{m.nav_admin_panel()}</a>
      <div class="admin-header-actions">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
        <a href={localizeHref(resolve('/'))} class="icon-button" aria-label={m.nav_home()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3.5 10.6 12 3.8l8.5 6.8v9a.9.9 0 0 1-.9.9h-5.1v-6.1h-5v6.1H4.4a.9.9 0 0 1-.9-.9v-9Z"
            />
          </svg>
        </a>
        <div class="admin-identity" aria-label={m.nav_signed_in_admin()}>AD</div>
      </div>
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
            aria-label={m.nav_language_switcher_aria({ language: currentOption.name() })}
          >
            <span class="flag" aria-hidden="true">{currentOption.flag}</span>
            <span>{locale.toUpperCase()}</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
          </summary>
          <div class="language-options" aria-label={m.nav_language_options_aria()}>
            {#each localeOptions as option (option.code)}
              <button
                type="button"
                class="language-option"
                class:current={locale === option.code}
                lang={option.code}
                disabled={locale === option.code}
                onclick={() => setLocale(option.code)}
              >
                <span class="flag" aria-hidden="true">{option.flag}</span>
                <span
                  ><strong>{option.name()}</strong>
                  {#if locale === option.code}<small>{m.nav_language_current()}</small>{/if}</span
                >
                {#if locale === option.code}<span class="check" aria-hidden="true">✓</span>{/if}
              </button>
            {/each}
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
    background:
      radial-gradient(circle at 50% 120%, rgb(38 89 150 / 42%), transparent 48%),
      var(--theme-background, #090c10);
    color: var(--theme-text, var(--ink));
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
    stroke: var(--theme-icon, currentColor);
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
    stroke: var(--theme-icon, currentColor);
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

  .admin-header-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
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
