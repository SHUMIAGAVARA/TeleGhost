<script>
  /**
   * DarkVeil Universal Component
   * Автоматически выбирает оптимальную версию для текущей платформы
   */

  import { platformDetector, componentSelector, darkVeilStore } from '../lib/darkVeilUtils.js';
  import DarkVeil from './DarkVeil.svelte';
  import DarkVeilMobile from './DarkVeilMobile.svelte';

  export let visible = true;
  export let quality = 'auto';
  export let intensity = 'auto';

  let useMobile = false;
  let optimalProps = {};
  let platform = {};

  function initialize() {
    platform = platformDetector.getPlatform();
    useMobile = componentSelector.shouldUseMobileVersion();
    optimalProps = componentSelector.getOptimalProps();

    // Переопределяем пользовательские настройки
    if (quality !== 'auto') {
      optimalProps.quality = quality;
    }
    if (intensity !== 'auto') {
      optimalProps.intensity = intensity;
    }

    darkVeilStore.update();
  }

  function handleResize() {
    initialize();
  }

  function handleOrientationChange() {
    initialize();
  }
</script>

<svelte:window on:resize={handleResize} on:orientationchange={handleOrientationChange} />

{#if !optimalProps.disabled && visible}
  <div class="darkveil-wrapper" data-platform={platform.name?.toLowerCase()}>
    {#if useMobile}
      <DarkVeilMobile {intensity} orientation={platform.isMobile ? 'auto' : 'portrait'} />
    {:else}
      <DarkVeil
        quality={optimalProps.quality}
        hueShift={optimalProps.hueShift}
        noiseIntensity={optimalProps.noiseIntensity}
        scanlineIntensity={optimalProps.scanlineIntensity}
        speed={optimalProps.speed}
        scanlineFrequency={optimalProps.scanlineFrequency}
        warpAmount={optimalProps.warpAmount}
        disabled={optimalProps.disabled}
      />
    {/if}
  </div>
{/if}

<style>
  :global {
    .darkveil-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* Mobile styles */
    @media (max-width: 599px) {
      .darkveil-wrapper {
        position: fixed;
      }
    }

    /* Tablet styles */
    @media (min-width: 600px) and (max-width: 1024px) {
      .darkveil-wrapper {
        position: relative;
      }
    }

    /* Desktop styles */
    @media (min-width: 1025px) {
      .darkveil-wrapper {
        position: absolute;
      }
    }
</style>
