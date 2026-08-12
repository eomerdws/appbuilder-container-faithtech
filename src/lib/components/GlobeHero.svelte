<script lang="ts">
  let {
    variant = 'home',
    backgroundImageUrl = '/earth-asia.png',
    flat = false
  }: { variant?: 'home' | 'results'; backgroundImageUrl?: string; flat?: boolean } = $props();
</script>

<div class="globe-stage" class:results={variant === 'results'} class:flat aria-hidden="true">
  {#if !flat}
    <div class="ambient-glow"></div>
    <div class="orbit orbit-one"></div>
    <div class="orbit orbit-two"></div>
  {/if}

  <div class="globe" class:flat>
    <img src={backgroundImageUrl} alt="" />
    {#if !flat}
      <div class="atmosphere"></div>
      <div class="night-shade"></div>
    {/if}
  </div>
</div>

<style>
  .globe-stage {
    position: absolute;
    z-index: 0;
    top: clamp(16rem, 34vh, 23rem);
    left: 50%;
    width: min(70rem, 104vw);
    aspect-ratio: 1;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .globe-stage.results {
    top: 4.5rem;
    width: min(62rem, 108vw);
    opacity: 0.6;
    filter: saturate(0.72);
  }

  .globe-stage.results::after {
    position: absolute;
    inset: -1px;
    background: linear-gradient(to bottom, transparent 18%, rgb(7 10 14 / 25%) 52%, #070a0e 89%);
    content: '';
  }

  .ambient-glow {
    position: absolute;
    inset: 5%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(63 154 255 / 24%),
      rgb(18 68 122 / 9%) 48%,
      transparent 70%
    );
    filter: blur(2.5rem);
  }

  .globe {
    position: absolute;
    inset: 10%;
    overflow: hidden;
    border: 1px solid rgb(147 206 255 / 28%);
    border-radius: 50%;
    background: #061426;
    box-shadow:
      0 0 0 1px rgb(93 173 255 / 9%),
      0 -1.1rem 4rem rgb(61 148 255 / 26%),
      0 2rem 8rem rgb(0 0 0 / 72%),
      inset -2rem -2rem 5rem rgb(0 0 0 / 55%);
  }

  .globe img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.035);
    filter: saturate(0.76) brightness(0.72) contrast(1.1) hue-rotate(4deg);
    animation: earth-drift 30s ease-in-out infinite alternate;
  }

  /* A custom-uploaded background is a flat 1200x1200 graphic, not a globe
     photo — it still occupies the same stage area/position as the bundled
     globe images, just without the circular crop, atmosphere glow, and
     orbit rings that only make sense curving around a sphere. (The
     surrounding .catalogue-scene also drops its curved-bottom clip for a
     flat image — see src/routes/+page.svelte — so the full square is
     visible instead of being cropped by that curve.) */
  .globe-stage.results.flat::after {
    content: none;
  }

  .globe.flat {
    border-radius: 1.5rem;
    box-shadow:
      0 0 0 1px rgb(93 173 255 / 9%),
      0 2rem 8rem rgb(0 0 0 / 55%);
  }

  .globe.flat img {
    transform: none;
    filter: none;
    animation: none;
  }

  .atmosphere,
  .night-shade {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .atmosphere {
    background:
      radial-gradient(circle at 42% 28%, rgb(255 255 255 / 15%), transparent 29%),
      linear-gradient(145deg, rgb(90 177 255 / 12%), transparent 48%);
    box-shadow: inset 0 0 2.2rem rgb(122 203 255 / 35%);
  }

  .night-shade {
    background:
      radial-gradient(
        circle at 38% 28%,
        transparent 28%,
        rgb(0 6 15 / 7%) 56%,
        rgb(0 5 13 / 72%) 100%
      ),
      linear-gradient(to bottom, rgb(2 7 14 / 3%) 55%, rgb(2 7 14 / 42%) 100%);
  }

  .orbit {
    position: absolute;
    inset: 2%;
    border: 1px solid rgb(120 195 255 / 10%);
    border-radius: 50%;
    transform: rotate(-13deg) scaleY(0.34);
  }

  .orbit-two {
    inset: 0;
    border-color: rgb(110 200 255 / 7%);
    transform: rotate(21deg) scaleY(0.29);
  }

  @keyframes earth-drift {
    from {
      transform: scale(1.035) translateX(-0.6%);
    }
    to {
      transform: scale(1.055) translateX(0.6%);
    }
  }

  @media (max-width: 620px) {
    .globe-stage {
      top: 18rem;
      width: 135vw;
    }

    .globe {
      inset: 8%;
    }

    .globe-stage.results {
      top: 8rem;
      width: 145vw;
      opacity: 0.46;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .globe img {
      animation: none;
    }
  }
</style>
