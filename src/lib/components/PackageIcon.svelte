<script lang="ts">
  let {
    seed = "package",
    size = "medium",
  }: {
    seed?: string;
    size?: "small" | "medium" | "large";
  } = $props();

  const colors = ["#ffbc73", "#67d0f7", "#a98af8", "#ff6e79", "#cbeeff"];
  let index = $derived(
    [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0) %
      colors.length,
  );
  let background = $derived(colors[index]);
</script>

<span class="package-icon {size}" style:background aria-hidden="true">
  <svg viewBox="0 0 64 64" role="presentation">
    <path d="M9 14.5c7-2.5 14-1.6 21 2.6v34c-7-4.2-14-5.1-21-2.6z" />
    <path d="M55 14.5c-7-2.5-14-1.6-21 2.6v34c7-4.2 14-5.1 21-2.6z" />
    <path class="line" d="M14 23c4.6-.7 8.6 0 12 2M14 31c4.6-.7 8.6 0 12 2M14 39c4.6-.7 8.6 0 12 2M50 23c-4.6-.7-8.6 0-12 2M50 31c-4.6-.7-8.6 0-12 2M50 39c-4.6-.7-8.6 0-12 2" />
  </svg>
</span>

<style>
  .package-icon {
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 18%);
  }

  .small {
    width: 2.35rem;
    height: 2.35rem;
  }

  .medium {
    width: 4.2rem;
    height: 4.2rem;
  }

  .large {
    width: clamp(7rem, 24vw, 10rem);
    height: clamp(7rem, 24vw, 10rem);
  }

  svg {
    width: 58%;
    height: 58%;
    overflow: visible;
    fill: #fff9ee;
    stroke: #c97728;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .line {
    fill: none;
    stroke-width: 1.25;
  }
</style>
