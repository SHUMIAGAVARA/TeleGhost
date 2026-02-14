<!--
  Примеры использования DarkVeil в различных сценариях
  Копируйте нужный вам пример в свой проект
-->

<!-- ============================================
     ПРИМЕР 1: Базовое использование
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
</script>

<DarkVeilWrapper />

<!-- ============================================
     ПРИМЕР 2: С контролем видимости
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let showBackground = true;
</script>

<button on:click={() => showBackground = !showBackground}>
  {showBackground ? 'Hide' : 'Show'} Background
</button>

<DarkVeilWrapper visible={showBackground} />

<!-- ============================================
     ПРИМЕР 3: С выбором качества
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let quality = 'auto';
</script>

<div class="quality-selector">
  <label>
    <input type="radio" bind:group={quality} value="auto" />
    Auto
  </label>
  <label>
    <input type="radio" bind:group={quality} value="high" />
    High
  </label>
  <label>
    <input type="radio" bind:group={quality} value="medium" />
    Medium
  </label>
  <label>
    <input type="radio" bind:group={quality} value="low" />
    Low
  </label>
</div>

<DarkVeilWrapper {quality} />

<!-- ============================================
     ПРИМЕР 4: С выбором интенсивности
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let intensity = 'auto';
</script>

<div class="intensity-selector">
  <label>
    <input type="radio" bind:group={intensity} value="auto" />
    Auto
  </label>
  <label>
    <input type="radio" bind:group={intensity} value="heavy" />
    Heavy
  </label>
  <label>
    <input type="radio" bind:group={intensity} value="normal" />
    Normal
  </label>
  <label>
    <input type="radio" bind:group={intensity} value="light" />
    Light
  </label>
</div>

<DarkVeilWrapper {intensity} />

<!-- ============================================
     ПРИМЕР 5: Только для мобильных
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const isMobile = platformDetector.getPlatform().isMobile;
</script>

{#if isMobile}
  <DarkVeilWrapper intensity="light" />
{/if}

<!-- ============================================
     ПРИМЕР 6: Только для десктопа
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const isDesktop = !platformDetector.getPlatform().isMobile;
</script>

{#if isDesktop}
  <DarkVeilWrapper quality="high" />
{/if}

<!-- ============================================
     ПРИМЕР 7: С информацией о платформе
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const platform = platformDetector.getPlatform();
  const capabilities = platformDetector.getDeviceCapabilities();
</script>

<div class="device-info">
  <p>Platform: {platform.name} v{platform.version}</p>
  <p>Device Type: {platform.isTablet ? 'Tablet' : platform.isHandset ? 'Handset' : 'Desktop'}</p>
  <p>Performance: {capabilities.performanceClass}</p>
  <p>WebGL: {capabilities.webgl2 ? 'WebGL 2.0' : capabilities.webgl ? 'WebGL 1.0' : 'Not supported'}</p>
</div>

<DarkVeilWrapper quality="auto" intensity="auto" />

<!-- ============================================
     ПРИМЕР 8: Адаптивный с памятью устройства
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const capabilities = platformDetector.getDeviceCapabilities();
  
  let quality = 'auto';
  let intensity = 'auto';
  
  // Установить качество на основе памяти устройства
  if (capabilities.deviceMemory < 4) {
    quality = 'low';
    intensity = 'light';
  } else if (capabilities.deviceMemory < 8) {
    quality = 'medium';
    intensity = 'normal';
  } else {
    quality = 'high';
    intensity = 'normal';
  }
</script>

<DarkVeilWrapper {quality} {intensity} />

<!-- ============================================
     ПРИМЕР 9: С сохранением настроек
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { onMount } from 'svelte';
  
  let quality = 'auto';
  let visible = true;
  
  onMount(() => {
    // Загрузить сохраненные настройки
    const saved = localStorage.getItem('darkveil-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      quality = settings.quality;
      visible = settings.visible;
    }
  });
  
  function saveSettings() {
    const settings = { quality, visible };
    localStorage.setItem('darkveil-settings', JSON.stringify(settings));
  }
  
  $: {
    quality;
    visible;
    saveSettings();
  }
</script>

<button on:click={() => visible = !visible}>
  {visible ? 'Hide' : 'Show'} Background
</button>

<select bind:value={quality} on:change={saveSettings}>
  <option value="auto">Auto</option>
  <option value="high">High</option>
  <option value="medium">Medium</option>
  <option value="low">Low</option>
</select>

<DarkVeilWrapper {visible} {quality} />

<!-- ============================================
     ПРИМЕР 10: С лоадинг индикатором
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let isLoading = false;
</script>

<DarkVeilWrapper visible={true} />

<div class="content">
  <button on:click={() => { isLoading = true; setTimeout(() => isLoading = false, 2000); }}>
    Do Something
  </button>
  
  {#if isLoading}
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {/if}
</div>

<style>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

<!-- ============================================
     ПРИМЕР 11: С темным режимом
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
</script>

<button on:click={() => {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
}}>
  {darkMode ? '☀️ Light' : '🌙 Dark'} Mode
</button>

<DarkVeilWrapper visible={darkMode} />

<!-- ============================================
     ПРИМЕР 12: Полная интеграция в приложение
     ============================================ -->
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector, componentSelector } from './lib/darkVeilUtils.js';
  import { onMount } from 'svelte';
  
  let showUI = true;
  let quality = 'auto';
  let visible = true;
  let platform = {};
  
  onMount(() => {
    platform = platformDetector.getPlatform();
    
    // Отключить эффект на старых мобильных устройствах
    if (platform.isMobile && platformDetector.getDeviceCapabilities().performanceClass === 'low') {
      visible = false;
    }
  });
</script>

<svelte:body />

<div class="app-container">
  <DarkVeilWrapper {visible} {quality} />
  
  <div class="ui-container" class:hidden={!showUI}>
    <header class="app-header">
      <div class="header-content">
        <h1>TeleGhost</h1>
        <button on:click={() => showUI = !showUI} class="minimize-btn">
          {showUI ? '−' : '+'}
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <!-- Основной контент приложения -->
    </main>
    
    <footer class="app-footer">
      <small>Platform: {platform.name} • Device: {platform.isTablet ? 'Tablet' : platform.isMobile ? 'Mobile' : 'Desktop'}</small>
    </footer>
  </div>
</div>

<style>
  :global {
    .app-container {
      min-height: 100vh;
      position: relative;
      z-index: 0;
      display: flex;
      flex-direction: column;
    }
    
    .ui-container {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      background: rgba(15, 15, 15, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .ui-container.hidden .app-main {
      display: none;
    }
    
    .app-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .minimize-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    .app-main {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    
    .app-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
    }
  }
</style>
