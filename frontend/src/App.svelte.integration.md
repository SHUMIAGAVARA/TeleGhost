<!--
  Integration Guide for App.svelte
  Руководство по интеграции DarkVeil в главный компонент приложения
-->

<script>
  import { onMount } from 'svelte';
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import Toasts from './components/Toasts.svelte';
  import Auth from './components/Auth.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Chat from './components/Chat.svelte';
  import Settings from './components/Settings.svelte';
  import Modals from './components/Modals.svelte';
  import QRModal from './components/QRModal.svelte';
  import { showToast } from './stores.js';
  import { platformDetector, darkVeilStore } from './lib/darkVeilUtils.js';

  // Global state
  let screen = 'login'; // login | main
  let darkVeilVisible = true;
  let darkVeilQuality = 'auto';
  let darkVeilIntensity = 'auto';

  onMount(() => {
    // Инициализация DarkVeil состояния
    const platform = platformDetector.getPlatform();
    
    // Опциональное: отключить на очень слабых устройствах
    if (platform.isMobile && !platformDetector.getDeviceCapabilities().webgl) {
      darkVeilVisible = false;
      showToast('WebGL not supported, visual effects disabled', 'info');
    }

    // Отслеживать режимы устройства
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  });

  function handleOrientationChange() {
    // При необходимости перестроить DarkVeil при смене ориентации
    darkVeilStore.update();
  }

  function toggleDarkVeil() {
    darkVeilVisible = !darkVeilVisible;
  }
</script>

<svelte:window />

<main id="app">
  <!-- ============ DarkVeil Background ============ -->
  <DarkVeilWrapper 
    visible={darkVeilVisible && screen === 'main'} 
    quality={darkVeilQuality}
    intensity={darkVeilIntensity}
  />

  <!-- ============ UI Layer ============ -->
  <div class="ui-layer">
    {#if screen === 'login'}
      <!-- Login screen doesn't show DarkVeil normally -->
      <Auth on:login={() => screen = 'main'} />
    {:else if screen === 'main'}
      <div class="main-layout">
        <Sidebar />
        <Chat />
        <Settings />
      </div>
    {/if}
  </div>

  <!-- ============ Modals and Overlays ============ -->
  <Modals />
  <QRModal />
  <Toasts />
</main>

<style>
  :global {
    #app {
      display: flex;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      position: relative;
      background: var(--bg-primary, #0f0f0f);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: var(--text-primary, #ffffff);
    }

    .ui-layer {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: rgba(15, 15, 15, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .main-layout {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 0;
    }

    /* Desktop layout */
    @media (min-width: 1025px) {
      #app {
        flex-direction: row;
      }

      .main-layout {
        flex-direction: row;
      }
    }

    /* Tablet layout */
    @media (min-width: 600px) and (max-width: 1024px) {
      #app {
        flex-direction: column;
      }

      .main-layout {
        flex-direction: row;
        width: 100%;
        height: calc(100vh - 60px);
      }

      .ui-layer {
        height: 100%;
      }
    }

    /* Mobile layout */
    @media (max-width: 599px) {
      #app {
        flex-direction: column;
      }

      .ui-layer {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: none;
        border: none;
      }

      .main-layout {
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: more) {
      .ui-layer {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: none;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .ui-layer {
        transition: none;
      }
    }
  }
</style>

<!-- 
  ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ:
  
  1. Добавьте импорт DarkVeilWrapper в начало файла:
     import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
     import { platformDetector } from './lib/darkVeilUtils.js';

  2. Добавьте DarkVeilWrapper как первый элемент в main:
     <DarkVeilWrapper 
       visible={true} 
       quality="auto" 
       intensity="auto"
     />

  3. Убедитесь, что у вашего основного контента z-index >= 1

  4. При необходимости вы можете управлять видимостью:
     - darkVeilVisible - булево управление видимостью
     - darkVeilQuality - 'auto', 'high', 'medium', 'low'
     - darkVeilIntensity - 'auto', 'heavy', 'normal', 'light'

  5. Для отключения на определенных экранах:
     visible={darkVeilVisible && screen === 'main'}

  6. Для сохранения настроек пользователя:
     ```javascript
     onMount(() => {
       const saved = localStorage.getItem('darkveil-settings');
       if (saved) {
         const { quality, intensity } = JSON.parse(saved);
         darkVeilQuality = quality;
         darkVeilIntensity = intensity;
       }
     });
     
     function saveSettings() {
       localStorage.setItem('darkveil-settings', 
         JSON.stringify({ quality: darkVeilQuality, intensity: darkVeilIntensity })
       );
     }
     ```
-->
