<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import PackageIcon from '$lib/components/PackageIcon.svelte';
  import * as m from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { packageStatuses } from '$lib/validation';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const nextActions: Record<
    string,
    Array<{ to: string; label: string; danger?: boolean; needsReason?: boolean }>
  > = {
    PENDING: [
      { to: 'ACTIVE', label: m.admin_action_approve() },
      { to: 'REJECTED', label: m.admin_action_reject(), danger: true, needsReason: true }
    ],
    ACTIVE: [{ to: 'INACTIVE', label: m.admin_action_deactivate(), danger: true }],
    INACTIVE: [{ to: 'ACTIVE', label: m.admin_action_reactivate() }],
    REJECTED: [{ to: 'PENDING', label: m.admin_action_reopen() }]
  };

  const labels: Record<string, { title: string; description: string }> = {
    PENDING: {
      title: m.admin_status_pending_title(),
      description: m.admin_status_pending_description()
    },
    ACTIVE: {
      title: m.admin_status_active_title(),
      description: m.admin_status_active_description()
    },
    REJECTED: {
      title: m.admin_status_rejected_title(),
      description: m.admin_status_rejected_description()
    },
    INACTIVE: {
      title: m.admin_status_inactive_title(),
      description: m.admin_status_inactive_description()
    }
  };

  const statusLabels: Record<string, string> = {
    PENDING: m.admin_status_label_pending(),
    ACTIVE: m.admin_status_label_active(),
    REJECTED: m.admin_status_label_rejected(),
    INACTIVE: m.admin_status_label_inactive()
  };

  const emptyQueueMessages: Record<string, string> = {
    PENDING: m.admin_empty_body_pending(),
    ACTIVE: m.admin_empty_body_active(),
    REJECTED: m.admin_empty_body_rejected(),
    INACTIVE: m.admin_empty_body_inactive()
  };

  function displayName(pkg: PageData['packages'][number]): string {
    return pkg.listings[0]?.title || pkg.localName;
  }
</script>

<svelte:head><title>{labels[data.selected]?.title ?? m.admin_title_fallback()}</title></svelte:head>

<header class="content-heading">
  <div>
    <p>{m.admin_content_eyebrow()}</p>
    <h1>{labels[data.selected]?.title ?? m.admin_title_fallback()}</h1>
    <span>{labels[data.selected]?.description}</span>
  </div>
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
  <a href={localizeHref(resolve('/'))} target="_blank" rel="noreferrer"
    >{m.admin_view_public_catalogue()}</a
  >
</header>

<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() runs inside localizeHref() -->
<div class="mobile-tabs" role="tablist" aria-label={m.admin_tablist_aria()}>
  {#each packageStatuses as status (status)}
    <a
      role="tab"
      aria-selected={data.selected === status}
      href={localizeHref(resolve(`/admin?status=${status}`))}
      class:active={data.selected === status}
    >
      {statusLabels[status]}
      <span>{data.counts[status] ?? 0}</span>
    </a>
  {/each}
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

{#if form?.error}
  <p class="notice error" role="alert">{form.error}</p>
{:else if form?.success}
  <p class="notice success" role="status">{form.message}</p>
{/if}

<section class="queue-summary" aria-label={m.admin_queue_summary_aria()}>
  <div>
    <span>{m.admin_pending_review()}</span>
    <strong class="orange">{data.counts.PENDING ?? 0}</strong>
  </div>
  <div>
    <span>{m.admin_public_packages()}</span>
    <strong class="green">{data.counts.ACTIVE ?? 0}</strong>
  </div>
  <p>{m.admin_queue_summary_note()}</p>
</section>

{#if data.packages.length === 0}
  <div class="empty-queue">
    <h2>{m.admin_empty_heading()}</h2>
    <p>{emptyQueueMessages[data.selected]}</p>
  </div>
{:else}
  <div class="review-table" role="table" aria-label={labels[data.selected]?.title}>
    <div class="table-header" role="row">
      <span role="columnheader">{m.admin_column_package()}</span>
      <span role="columnheader">{m.admin_column_region()}</span>
      <span role="columnheader">{m.admin_column_status()}</span>
      <span role="columnheader">{m.admin_column_actions()}</span>
    </div>

    {#each data.packages as pkg (pkg.id)}
      <div class="review-row" role="row">
        <div class="package-cell" role="cell">
          <PackageIcon seed={pkg.id} size="small" />
          <div>
            <strong>{displayName(pkg)}</strong>
            <span>{pkg.iso6393} · {pkg.projectName}</span>
          </div>
        </div>
        <div class="region-cell" role="cell">
          <span class="mobile-label">{m.admin_region_mobile_label()}</span>
          {pkg.regionName || m.format_not_specified()}
        </div>
        <div role="cell">
          <span class="status-badge {data.selected.toLowerCase()}">
            {statusLabels[data.selected]}
          </span>
        </div>
        <div class="action-cell" role="cell">
          <details>
            <summary>{m.admin_view_toggle()}</summary>
            <div class="details-panel">
              <dl>
                <div>
                  <dt>{m.admin_detail_language_tag()}</dt>
                  <dd>{pkg.languageTag}</dd>
                </div>
                <div>
                  <dt>{m.admin_detail_builder()}</dt>
                  <dd>{pkg.appBuilder}</dd>
                </div>
                <div>
                  <dt>{m.admin_detail_version()}</dt>
                  <dd>{pkg.appBuilderVersion}</dd>
                </div>
              </dl>
              {#if pkg.rejectionReason}
                <p class="rejection">
                  {m.admin_rejected_reason_prefix({ reason: pkg.rejectionReason })}
                </p>
              {/if}
            </div>
          </details>

          {#each nextActions[data.selected] ?? [] as action (action.to)}
            <form method="post" action="?/moderate" use:enhance>
              <input type="hidden" name="id" value={pkg.id} />
              <input type="hidden" name="status" value={action.to} />
              {#if action.needsReason}
                <label>
                  <span class="sr-only"
                    >{m.admin_rejection_reason_sr_label({ name: displayName(pkg) })}</span
                  >
                  <input
                    type="text"
                    name="reason"
                    required
                    maxlength="2000"
                    placeholder={m.admin_rejection_reason_placeholder()}
                  />
                </label>
              {/if}
              <button type="submit" class:danger={action.danger}>{action.label}</button>
            </form>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .content-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
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
    text-transform: capitalize;
  }

  .content-heading span {
    display: block;
    margin-top: 0.35rem;
    color: #9aa4b3;
  }

  .content-heading > a {
    flex: 0 0 auto;
    color: #b8c1cd;
    font-size: 0.82rem;
    text-decoration: none;
  }

  .mobile-tabs {
    display: none;
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

  .queue-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(8rem, 12rem)) minmax(13rem, 1fr);
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.25rem;
    border: 1px solid #303844;
    border-radius: 1rem;
    background: #1b2027;
    padding: 1rem 1.25rem;
  }

  .queue-summary div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .queue-summary span,
  .queue-summary p {
    color: #8e98a7;
    font-size: 0.8rem;
  }

  .queue-summary strong {
    font-size: 1.6rem;
  }

  .queue-summary .orange {
    color: var(--orange);
  }
  .queue-summary .green {
    color: var(--green);
  }
  .queue-summary p {
    margin: 0;
    text-align: right;
  }

  .review-table {
    border-top: 1px solid #2e3540;
  }

  .table-header,
  .review-row {
    display: grid;
    grid-template-columns: minmax(16rem, 1.35fr) minmax(10rem, 0.9fr) 8rem minmax(17rem, 1fr);
    gap: 1rem;
    align-items: center;
  }

  .table-header {
    min-height: 3rem;
    color: #7f8998;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .review-row {
    min-height: 5.6rem;
    border-top: 1px solid #242b34;
    padding: 0.9rem 0;
  }

  .package-cell {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.9rem;
  }

  .package-cell > div {
    min-width: 0;
  }

  .package-cell strong,
  .package-cell span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .package-cell span,
  .region-cell {
    margin-top: 0.2rem;
    color: #8f99a8;
    font-size: 0.8rem;
  }

  .mobile-label {
    display: none;
  }

  .status-badge {
    display: inline-flex;
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 0.35rem 0.65rem;
    font-size: 0.7rem;
    font-weight: 750;
  }

  .status-badge.pending,
  .status-badge.inactive {
    color: var(--orange);
    background: rgb(255 154 70 / 10%);
  }
  .status-badge.active {
    color: var(--green);
    background: rgb(88 214 154 / 10%);
  }
  .status-badge.rejected {
    color: #ff7883;
    background: rgb(255 110 121 / 10%);
  }

  .action-cell {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  details {
    position: relative;
  }

  summary,
  .action-cell button {
    display: inline-grid;
    min-height: 2.4rem;
    place-items: center;
    border: 1px solid #3b4552;
    border-radius: 0.55rem;
    background: #242b34;
    color: #e5e8ec;
    padding: 0 0.75rem;
    font-size: 0.78rem;
    list-style: none;
    cursor: pointer;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .details-panel {
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 18rem;
    border: 1px solid #3a4451;
    border-radius: 0.8rem;
    background: #1b2027;
    padding: 1rem;
    box-shadow: 0 1.2rem 3rem rgb(0 0 0 / 45%);
  }

  dl,
  .details-panel p {
    margin: 0;
  }

  dl div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.35rem 0;
    font-size: 0.75rem;
  }

  dt {
    color: #8791a0;
  }
  dd {
    margin: 0;
    text-align: right;
  }
  .rejection {
    margin-top: 0.75rem !important;
    color: #ff929b;
    font-size: 0.75rem;
  }

  .action-cell form {
    display: flex;
    gap: 0.4rem;
  }

  .action-cell input[type='text'] {
    width: 9rem;
    min-height: 2.4rem;
    border: 1px solid #3b4552;
    border-radius: 0.55rem;
    background: #11151a;
    color: #fff;
    padding: 0 0.6rem;
    font-size: 0.75rem;
  }

  .action-cell button {
    border-color: #2c8f61;
    background: rgb(88 214 154 / 10%);
    color: var(--green);
  }

  .action-cell button.danger {
    border-color: #a8652c;
    background: rgb(255 154 70 / 10%);
    color: var(--orange);
  }

  .empty-queue {
    border: 1px dashed #303844;
    border-radius: 1rem;
    padding: 4rem 1rem;
    text-align: center;
  }

  .empty-queue h2 {
    margin: 0;
  }
  .empty-queue p {
    margin: 0.35rem 0 0;
    color: var(--muted);
  }

  @media (max-width: 1200px) {
    .mobile-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      margin: 0 0 1.25rem;
      padding-bottom: 0.35rem;
    }

    .mobile-tabs a {
      display: flex;
      flex: 0 0 auto;
      gap: 0.5rem;
      border: 1px solid #303844;
      border-radius: 999px;
      color: #aeb6c2;
      padding: 0.55rem 0.8rem;
      text-decoration: none;
    }

    .mobile-tabs a.active {
      border-color: var(--blue);
      background: rgb(120 180 255 / 10%);
      color: #fff;
    }
  }

  @media (max-width: 900px) {
    .table-header {
      display: none;
    }

    .review-table {
      display: grid;
      gap: 0.75rem;
      border: 0;
    }

    .review-row {
      grid-template-columns: 1fr auto;
      gap: 0.8rem;
      border: 1px solid #2d3540;
      border-radius: 0.9rem;
      background: #13181e;
      padding: 1rem;
    }

    .region-cell {
      grid-column: 1;
    }

    .mobile-label {
      display: inline;
      color: #616b79;
    }

    .action-cell {
      grid-column: 1 / -1;
      border-top: 1px solid #2a313a;
      padding-top: 0.8rem;
    }

    .details-panel {
      right: auto;
      left: 0;
    }
  }

  @media (max-width: 620px) {
    .content-heading {
      align-items: flex-start;
    }

    .content-heading > a {
      display: none;
    }

    .queue-summary {
      grid-template-columns: 1fr 1fr;
    }

    .queue-summary p {
      grid-column: 1 / -1;
      text-align: left;
    }

    .action-cell form {
      flex: 1 1 100%;
    }

    .action-cell input[type='text'] {
      flex: 1;
      width: auto;
    }
  }
</style>
