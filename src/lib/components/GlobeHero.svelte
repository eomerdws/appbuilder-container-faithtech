<script lang="ts">
  let { variant = "home" }: { variant?: "home" | "results" } = $props();

  const markers = [
    { label: "North America", x: 31, y: 42, delay: "0s" },
    { label: "Central America", x: 39, y: 56, delay: "0.7s" },
    { label: "South America", x: 54, y: 70, delay: "1.4s" },
  ];
</script>

<div class="globe-stage" class:results={variant === "results"} aria-hidden="true">
  <div class="ambient-glow"></div>
  <div class="orbit orbit-one"></div>
  <div class="orbit orbit-two"></div>

  <div class="globe">
    <img src="/earth-cut.jpg" alt="" />
    <div class="atmosphere"></div>
    <div class="night-shade"></div>

    {#each markers as marker}
      <span
        class="marker"
        style:--marker-x={`${marker.x}%`}
        style:--marker-y={`${marker.y}%`}
        style:--marker-delay={marker.delay}
      >
        <span class="sr-only">{marker.label}</span>
      </span>
    {/each}
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
    content: "";
  }

  .ambient-glow {
    position: absolute;
    inset: 5%;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(63 154 255 / 24%), rgb(18 68 122 / 9%) 48%, transparent 70%);
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
      radial-gradient(circle at 38% 28%, transparent 28%, rgb(0 6 15 / 7%) 56%, rgb(0 5 13 / 72%) 100%),
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

  .marker {
    position: absolute;
    top: var(--marker-y);
    left: var(--marker-x);
    width: 0.55rem;
    height: 0.55rem;
    border: 2px solid #d9f1ff;
    border-radius: 50%;
    background: #4fc3ff;
    box-shadow: 0 0 1rem #39aefa;
  }

  .marker::before,
  .marker::after {
    position: absolute;
    inset: 50% auto auto 50%;
    width: 1.7rem;
    height: 1.7rem;
    border: 1px solid rgb(91 194 255 / 62%);
    border-radius: 50%;
    content: "";
    transform: translate(-50%, -50%);
    animation: marker-pulse 2.8s var(--marker-delay) ease-out infinite;
  }

  .marker::after {
    animation-delay: calc(var(--marker-delay) + 1.4s);
  }

  @keyframes earth-drift {
    from { transform: scale(1.035) translateX(-0.6%); }
    to { transform: scale(1.055) translateX(0.6%); }
  }

  @keyframes marker-pulse {
    0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.25); }
    75%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); }
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

    .marker {
      width: 0.45rem;
      height: 0.45rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .globe img,
    .marker::before,
    .marker::after {
      animation: none;
    }
  }
</style>
