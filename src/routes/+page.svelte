<script lang="ts">
  import type { PageData } from './$types';
  import { resolve } from '$app/paths';
  import GlobeHero from '$lib/components/GlobeHero.svelte';
  import PackageIcon from '$lib/components/PackageIcon.svelte';
  import { formatMegabytes, regionLabel } from '$lib/format';
  import * as m from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';

  let { data }: { data: PageData } = $props();

  const suggestions = ['Gumawana', 'Hawaiian Pidgin', 'Klingon', 'Quenya'];

  function titleFor(pkg: PageData['packages'][number]): string {
    return pkg.listings[0]?.title || pkg.localName;
  }

  function alternateNames(pkg: PageData['packages'][number]): string {
    return pkg.names
      .filter((name) => name.kind !== 'PRIMARY')
      .map((name) => name.name)
      .slice(0, 3)
      .join(', ');
  }
</script>

<svelte:head>
  <title>{data.q ? m.catalog_title_search({ query: data.q }) : m.catalog_title_default()}</title>
  <meta name="description" content={m.catalog_meta_description()} />
</svelte:head>

<div class="catalogue-scene" class:results-scene={Boolean(data.q)}>
  <div class="star-field" aria-hidden="true"></div>

  {#if !data.q}
    <GlobeHero backgroundImageUrl={data.heroBackgroundImageUrl} />
    <section class="home-content" aria-labelledby="catalogue-title">
      <div class="hero-copy">
        <p class="eyebrow">{m.catalog_eyebrow()}</p>
        <h1 id="catalogue-title">{m.catalog_heading()}</h1>
        <p>{m.catalog_subheading()}</p>
      </div>

      <form method="get" class="search-card" aria-label={m.catalog_search_form_aria()}>
        <label for="catalogue-search" class="sr-only">{m.catalog_search_label()}</label>
        <input
          id="catalogue-search"
          type="search"
          name="q"
          placeholder={m.catalog_search_placeholder()}
          autocomplete="off"
          enterkeyhint="search"
          required
        />
        <button type="submit">{m.catalog_search_button()}</button>
      </form>

      <div class="suggestions" aria-labelledby="suggested-title">
        <h2 id="suggested-title">{m.catalog_suggested_heading()}</h2>
        <div class="suggestion-list">
          {#each suggestions as suggestion (suggestion)}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
            <a href={localizeHref(resolve(`/?q=${encodeURIComponent(suggestion)}`))}>{suggestion}</a
            >
          {/each}
        </div>
      </div>
    </section>
  {:else}
    <GlobeHero variant="results" backgroundImageUrl={data.heroBackgroundImageUrl} />
    <section class="results-content" aria-labelledby="results-title">
      <div class="results-heading">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
        <a href={localizeHref(resolve('/'))} class="back-link" aria-label={m.catalog_back_aria()}
          >←</a
        >
        <div>
          <p class="eyebrow">{m.catalog_results_eyebrow()}</p>
          <h1 id="results-title">{m.catalog_results_heading()}</h1>
        </div>
      </div>

      <form method="get" class="results-search" role="search">
        <label for="results-search" class="sr-only">{m.catalog_results_search_aria()}</label>
        <input id="results-search" type="search" name="q" value={data.q} />
        <button type="submit" aria-label={m.catalog_results_search_button_aria()}
          >{m.catalog_results_search_button()}</button
        >
      </form>

      <p class="result-count">
        {m.catalog_results_count({ count: data.packages.length })}
      </p>

      {#if data.packages.length === 0}
        <div class="empty-state">
          <PackageIcon seed={data.q} size="medium" />
          <h2>{m.catalog_empty_heading()}</h2>
          <p>{m.catalog_empty_body()}</p>
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
          <a href={localizeHref(resolve('/'))}>{m.catalog_empty_cta()}</a>
        </div>
      {:else}
        <ul class="result-list">
          {#each data.packages as pkg (pkg.id)}
            <li class="package-card">
              <div class="package-copy">
                <h2>{titleFor(pkg)}</h2>
                <p>
                  {m.catalog_card_region({
                    region: regionLabel(pkg.regionName, pkg.regionCode, m.format_not_specified())
                  })}
                </p>
                <p>{m.catalog_card_language_code({ code: pkg.iso6393 })}</p>
                {#if alternateNames(pkg)}
                  <p class="secondary">
                    {m.catalog_card_alternate_names({ names: alternateNames(pkg) })}
                  </p>
                {/if}
                <p class="secondary">
                  {m.catalog_card_size({ size: formatMegabytes(pkg.sizeBytes, getLocale()) })}
                </p>
              </div>
              <div class="package-cta">
                <PackageIcon seed={pkg.id} size="medium" />
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
                <a href={localizeHref(resolve('/packages/[id]', { id: pkg.id }))}>
                  <span class="desktop-cta">{m.catalog_card_cta_desktop()}</span>
                  <span class="mobile-cta">{m.catalog_card_cta_mobile()}</span>
                </a>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</div>

<style>
  .catalogue-scene {
    position: relative;
    min-height: calc(100vh - 4.5rem);
    overflow: hidden;
    border-radius: 0 0 45% 45% / 0 0 12% 12%;
  }

  .star-field {
    position: absolute;
    inset: 0;
    opacity: 0.8;
    background-image:
      radial-gradient(circle at 8% 18%, #fff 0 1px, transparent 1.5px),
      radial-gradient(circle at 24% 31%, #fff 0 1.3px, transparent 1.8px),
      radial-gradient(circle at 42% 15%, #fff 0 1px, transparent 1.6px),
      radial-gradient(circle at 63% 27%, #fff 0 1.1px, transparent 1.6px),
      radial-gradient(circle at 78% 13%, #fff 0 1px, transparent 1.5px),
      radial-gradient(circle at 92% 35%, #fff 0 1px, transparent 1.5px);
    background-size: 23rem 18rem;
  }

  .home-content,
  .results-content {
    position: relative;
    z-index: 2;
    width: min(100%, 58rem);
    margin: 0 auto;
  }

  .home-content {
    display: flex;
    min-height: calc(100vh - 7rem);
    flex-direction: column;
    align-items: center;
    padding: clamp(3rem, 9vh, 7rem) 0 2.5rem;
    text-align: center;
  }

  .home-content::before {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 50%;
    width: min(62rem, 112vw);
    height: 32rem;
    background: radial-gradient(ellipse at top, rgb(5 9 14 / 86%) 0 28%, transparent 72%);
    content: '';
    transform: translateX(-50%);
    pointer-events: none;
  }

  .hero-copy h1,
  .results-heading h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(2.6rem, 8vw, 5rem);
    font-weight: 850;
    letter-spacing: -0.05em;
  }

  .hero-copy > p:last-child {
    margin: 0.5rem auto 0;
    color: var(--muted);
    font-size: clamp(1rem, 3vw, 1.3rem);
  }

  .eyebrow {
    margin: 0 0 0.6rem;
    color: var(--blue);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .search-card {
    display: grid;
    width: min(100%, 46rem);
    gap: 0.75rem;
    margin-top: clamp(3rem, 8vh, 5.5rem);
    border: 1px solid rgb(130 181 226 / 14%);
    border-radius: 1.35rem;
    background: rgb(6 11 18 / 62%);
    padding: 0.75rem;
    box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 30%);
    backdrop-filter: blur(12px);
  }

  .search-card input,
  .results-search input {
    width: 100%;
    min-height: 3.6rem;
    border: 1px solid #46515f;
    border-radius: 1rem;
    background: #2a3039;
    color: #fff;
    padding: 0 1.15rem;
    font-size: 1rem;
  }

  .search-card input::placeholder,
  .results-search input::placeholder {
    color: #abb3bf;
  }

  .search-card button,
  .results-search button,
  .package-cta a,
  .empty-state a {
    min-height: 3.5rem;
    border: 0;
    border-radius: 1rem;
    background: var(--blue);
    color: #061322;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .suggestions {
    width: min(100%, 46rem);
    margin-top: clamp(3rem, 8vh, 5.5rem);
    text-align: left;
  }

  .suggestions h2 {
    margin: 0 0 0.8rem;
    font-size: 1rem;
  }

  .suggestion-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .suggestion-list a {
    border: 1px solid #45505d;
    border-radius: 999px;
    background: #20262d;
    color: #f0f2f5;
    padding: 0.55rem 1rem;
    font-size: 0.85rem;
    text-decoration: none;
  }

  .home-footnote {
    margin: auto 0 0;
    padding-top: 4rem;
    color: #929baa;
    font-size: 0.8rem;
  }

  .results-content {
    padding: 1.5rem 0 5rem;
  }

  .results-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .results-heading h1 {
    font-size: clamp(2rem, 5vw, 3.2rem);
  }

  .back-link {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid #3c4652;
    border-radius: 0.8rem;
    background: #222831;
    color: #fff;
    font-size: 1.25rem;
    text-decoration: none;
  }

  .results-search {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    margin: 2rem 0 1.6rem;
  }

  .results-search input {
    border-color: var(--blue);
  }

  .results-search button {
    padding: 0 1.5rem;
  }

  .result-count {
    margin: 0 0 1rem;
    color: #d8dce3;
  }

  .result-list {
    display: grid;
    gap: 0.9rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .package-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    border: 1px solid #262d36;
    border-radius: 1.2rem;
    background: rgb(3 5 7 / 92%);
    padding: 1.25rem;
    box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 20%);
  }

  .package-copy h2 {
    margin: 0 0 0.35rem;
    font-size: clamp(1.15rem, 3vw, 1.45rem);
  }

  .package-copy p {
    margin: 0.18rem 0;
    color: #b8bfca;
    font-size: 0.9rem;
  }

  .package-copy .secondary {
    color: #7f8998;
    font-size: 0.78rem;
  }

  .package-cta {
    display: grid;
    min-width: 9.5rem;
    justify-items: center;
    gap: 0.75rem;
  }

  .package-cta a {
    display: grid;
    min-height: 2.8rem;
    width: 100%;
    place-items: center;
    border-radius: 999px;
    background: var(--green);
    padding: 0 1rem;
    font-size: 0.82rem;
  }

  .mobile-cta {
    display: none;
  }

  .empty-state {
    display: grid;
    justify-items: center;
    border: 1px solid #2b333e;
    border-radius: 1.2rem;
    background: rgb(12 16 21 / 90%);
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .empty-state h2 {
    margin: 1rem 0 0.35rem;
  }
  .empty-state p {
    max-width: 30rem;
    margin: 0;
    color: var(--muted);
  }
  .empty-state a {
    display: grid;
    min-height: 2.8rem;
    place-items: center;
    margin-top: 1.3rem;
    padding: 0 1.2rem;
  }

  @media (max-width: 620px) {
    .catalogue-scene {
      border-radius: 0 0 45% 45% / 0 0 6% 6%;
    }

    .home-content {
      min-height: calc(100vh - 5.5rem);
      padding-top: 3rem;
    }

    .search-card {
      margin-top: 3rem;
    }

    .suggestions {
      margin-top: 3.5rem;
    }

    .results-search {
      grid-template-columns: 1fr;
    }

    .package-card {
      grid-template-columns: 1fr auto;
      padding: 1rem;
    }

    .package-cta {
      min-width: 4.5rem;
    }

    .package-cta a {
      min-width: 5.4rem;
      width: 5.4rem;
      color: #061322;
    }

    .desktop-cta {
      display: none;
    }

    .mobile-cta {
      display: inline;
    }

    .package-copy .secondary {
      display: none;
    }
  }
</style>
