<script lang="ts">
  import PackageIcon from "$lib/components/PackageIcon.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let downloadStarted = $state(false);

  let pkg = $derived(data.package);
  let title = $derived(pkg.listings[0]?.title || pkg.localName);

  function megabytes(bytes: number): string {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }
</script>

<svelte:head>
  <title>Download {title}</title>
</svelte:head>

<section class="download-page" aria-labelledby="download-title">
  <div class="download-heading">
    <a href="/?q={encodeURIComponent(pkg.localName)}" aria-label="Back to search results">←</a>
    <div>
      <p>Approved package</p>
      <h1 id="download-title">Download package</h1>
    </div>
  </div>

  <div class="download-card">
    <PackageIcon seed={pkg.id} size="large" />
    <h2>{title}</h2>
    <p class="package-location">
      Language code: {pkg.iso6393}
      <span aria-hidden="true">•</span>
      Region: {pkg.regionName || pkg.regionCode || "Not specified"}
    </p>

    <dl>
      <div><dt>Status</dt><dd>Approved</dd></div>
      <div><dt>Package size</dt><dd>{megabytes(pkg.sizeBytes)}</dd></div>
      <div><dt>Source</dt><dd>Verified package catalogue</dd></div>
      <div><dt>Version</dt><dd>{pkg.appBuilderVersion}</dd></div>
    </dl>
  </div>

  <a
    class="download-button"
    href={pkg.publishUrl}
    target="_blank"
    rel="external noreferrer"
    onclick={() => (downloadStarted = true)}
  >
    {downloadStarted ? "Download opened" : "Download package"}
  </a>

  {#if downloadStarted}
    <div class="download-feedback" role="status">
      <span aria-hidden="true">✓</span>
      <div>
        <strong>Your download was opened.</strong>
        <p>If it did not begin, use the button again.</p>
      </div>
    </div>
  {/if}

  <p class="download-note">
    After download, the container app can open the package locally.
  </p>
</section>

<style>
  .download-page {
    width: min(100%, 48rem);
    min-height: calc(100vh - 7.5rem);
    margin: 0 auto;
    padding: 1.5rem 0 3rem;
  }

  .download-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .download-heading > a {
    display: grid;
    width: 2.8rem;
    height: 2.8rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid #3b4552;
    border-radius: 0.8rem;
    background: #242a33;
    color: #fff;
    text-decoration: none;
  }

  .download-heading p {
    margin: 0 0 0.3rem;
    color: var(--blue);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 6vw, 3rem);
    letter-spacing: -0.04em;
  }

  .download-card {
    display: grid;
    justify-items: center;
    border: 1px solid #3a4451;
    border-radius: 1.5rem;
    background: #1b2027;
    padding: clamp(1.5rem, 5vw, 3.5rem);
    box-shadow: 0 2rem 5rem rgb(0 0 0 / 22%);
  }

  .download-card h2 {
    margin: 1.6rem 0 0.35rem;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    text-align: center;
  }

  .package-location {
    margin: 0;
    color: var(--muted);
    text-align: center;
  }

  .package-location span {
    margin: 0 0.5rem;
  }

  dl {
    width: 100%;
    margin: 2.5rem 0 0;
  }

  dl div {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    border-bottom: 1px solid #39424d;
    padding: 0.75rem 0;
  }

  dt { color: #8e98a7; }
  dd { margin: 0; text-align: right; font-weight: 700; }

  .download-button {
    display: grid;
    min-height: 4rem;
    place-items: center;
    margin-top: 2rem;
    border-radius: 1rem;
    background: var(--green);
    color: #051a11;
    font-weight: 850;
    text-decoration: none;
  }

  .download-feedback {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    border: 1px solid rgb(88 214 154 / 40%);
    border-radius: 1rem;
    background: rgb(88 214 154 / 9%);
    padding: 1rem;
  }

  .download-feedback > span {
    display: grid;
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 999px;
    background: var(--green);
    color: #082317;
    font-weight: 900;
  }

  .download-feedback p {
    margin: 0.15rem 0 0;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .download-note {
    margin: clamp(3rem, 10vh, 7rem) 0 0;
    color: #8993a2;
    font-size: 0.85rem;
    text-align: center;
  }

  @media (max-width: 520px) {
    .download-heading {
      align-items: flex-start;
    }

    dl div {
      gap: 1rem;
    }

    dt,
    dd {
      font-size: 0.88rem;
    }
  }
</style>
