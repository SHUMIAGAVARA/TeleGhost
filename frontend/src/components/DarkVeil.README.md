# DarkVeil - Универсальный компонент визуализации

## Описание

DarkVeil - это мощный, полностью оптимизированный компонент визуализации WebGL на основе CPPN (Compositional Pattern Producing Network). Компонент автоматически адаптируется к любой платформе и устройству, предоставляя оптимальный уровень производительности и качества.

## Особенности

### 🎯 Кроссплатформенность
- ✅ **Desktop** (Windows, macOS, Linux)
- ✅ **Mobile** (iOS, Android)
- ✅ **Tablet** (iPad, Android tablets)
- ✅ **Wails приложения** (Desktop + Mobile)

### 📱 Адаптивность
- Автоматическое определение типа устройства
- Масштабирование для разных разрешений
- Поддержка нескольких ориентаций
- Реагирует на режимы энергосбережения

### ⚡ Производительность
- Оптимизация качества в зависимости от мощности устройства
- Уменьшение FPS на слабых устройствах
- Поддержка режима низкого энергопотребления
- WebGL 1.0 и 2.0 поддержка

### ♿ Доступность
- Поддержка `prefers-reduced-motion`
- Поддержка высокого контраста
- Поддержка темного режима
- Совместимость с assistive technologies

## Установка

### 1. Скопируйте компоненты

Компоненты уже находятся в:
```
frontend/src/components/
├── DarkVeil.svelte           # Основной компонент (Desktop/Tablet)
├── DarkVeilMobile.svelte     # Мобильная версия (iOS/Android)
├── DarkVeilWrapper.svelte    # Универсальная обёртка
└── DarkVeil.css              # Стили для всех платформ
```

### 2. Скопируйте утилиты

```
frontend/src/lib/
└── darkVeilUtils.js          # Утилиты для определения платформы
```

### 3. Импортируйте стили

В `frontend/src/style.css` уже добавлена интеграция.

## Использование

### Простое использование (Рекомендуется)

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
</script>

<DarkVeilWrapper visible={true} quality="auto" intensity="auto" />
```

### Расширенное использование

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let showEffect = true;
  let qualityLevel = 'auto'; // 'auto', 'high', 'medium', 'low'
  let effectIntensity = 'auto'; // 'auto', 'heavy', 'normal', 'light'
</script>

<DarkVeilWrapper 
  visible={showEffect} 
  quality={qualityLevel} 
  intensity={effectIntensity}
/>

<button on:click={() => qualityLevel = 'high'}>High Quality</button>
<button on:click={() => qualityLevel = 'low'}>Low Quality</button>
```

### Прямое использование компонентов

```svelte
<script>
  import DarkVeil from './components/DarkVeil.svelte';
  import DarkVeilMobile from './components/DarkVeilMobile.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';

  const platform = platformDetector.getPlatform();
</script>

{#if platform.isMobile}
  <DarkVeilMobile intensity="normal" visible={true} />
{:else}
  <DarkVeil quality="high" disabled={false} />
{/if}
```

## Свойства (Props)

### DarkVeilWrapper (Универсальная обёртка)

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|---------|
| `visible` | boolean | `true` | Показывать ли эффект |
| `quality` | string | `'auto'` | Качество: `'auto'`, `'high'`, `'medium'`, `'low'` |
| `intensity` | string | `'auto'` | Интенсивность: `'auto'`, `'heavy'`, `'normal'`, `'light'` |

### DarkVeil (Desktop версия)

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|---------|
| `hueShift` | number | `0` | Сдвиг цветового тона (-180 до 180) |
| `noiseIntensity` | number | `0` | Интенсивность шума (0 до 1) |
| `scanlineIntensity` | number | `0` | Интенсивность линий сканирования (0 до 1) |
| `speed` | number | `0.5` | Скорость анимации |
| `scanlineFrequency` | number | `0` | Частота линий сканирования |
| `warpAmount` | number | `0` | Количество искажения |
| `disabled` | boolean | `false` | Отключить эффект |
| `quality` | string | `'auto'` | Качество отрисовки |

### DarkVeilMobile (Мобильная версия)

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|---------|
| `visible` | boolean | `true` | Показывать ли эффект |
| `intensity` | string | `'normal'` | Интенсивность: `'light'`, `'normal'`, `'heavy'` |
| `orientation` | string | `'auto'` | Ориентация: `'auto'`, `'portrait'`, `'landscape'` |

## Утилиты

### platformDetector

```javascript
import { platformDetector } from './lib/darkVeilUtils.js';

// Получить информацию о платформе
const platform = platformDetector.getPlatform();
console.log(platform);
// { 
//   name: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown',
//   isMobile: boolean,
//   isTablet: boolean,
//   isHandset: boolean,
//   version: string
// }

// Получить возможности устройства
const capabilities = platformDetector.getDeviceCapabilities();
console.log(capabilities);
// {
//   webgl: boolean,
//   webgl2: boolean,
//   hardwareConcurrency: number,
//   deviceMemory: number,
//   maxDPR: number,
//   orientation: 'portrait' | 'landscape',
//   performanceClass: 'high' | 'medium' | 'low'
// }

// Рекомендованное качество
const quality = platformDetector.recommendedQuality(); // 'high', 'medium', 'low'

// Рекомендованная интенсивность
const intensity = platformDetector.recommendedIntensity(); // 'heavy', 'normal', 'light'
```

### componentSelector

```javascript
import { componentSelector } from './lib/darkVeilUtils.js';

// Нужна ли мобильная версия?
const useMobile = componentSelector.shouldUseMobileVersion();

// Получить оптимальные свойства
const props = componentSelector.getOptimalProps();
```

### darkVeilStore

```javascript
import { darkVeilStore } from './lib/darkVeilUtils.js';

// Текущие параметры
console.log(darkVeilStore.platform);
console.log(darkVeilStore.capabilities);
console.log(darkVeilStore.useMobileVersion);

// Установить пользовательское качество
darkVeilStore.setQuality('high');

// Установить пользовательскую интенсивность
darkVeilStore.setIntensity('light');

// Получить текущие настройки
const settings = darkVeilStore.getCurrentSettings();
```

## Примеры интеграции

### Пример 1: Интеграция в App.svelte

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Chat from './components/Chat.svelte';
</script>

<div id="app">
  <DarkVeilWrapper visible={true} quality="auto" intensity="auto" />
  
  <div class="main-layout">
    <Sidebar />
    <Chat />
  </div>
</div>

<style>
  :global(#app) {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  .main-layout {
    display: flex;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
</style>
```

### Пример 2: Условный рендеринг

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const platform = platformDetector.getPlatform();
  let effectEnabled = !platform.isMobile; // Отключить на мобильных по умолчанию
</script>

<DarkVeilWrapper visible={effectEnabled} />

<button on:click={() => effectEnabled = !effectEnabled}>
  {effectEnabled ? 'Disable' : 'Enable'} Background
</button>
```

### Пример 3: Адаптивное качество

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const capabilities = platformDetector.getDeviceCapabilities();
  let quality = capabilities.performanceClass === 'high' ? 'high' : 'medium';
</script>

<DarkVeilWrapper visible={true} quality={quality} />
```

## Оптимизация производительности

### Советы для получения максимальной производительности

1. **На мобильных устройствах используйте `intensity="light"`**
   ```svelte
   <DarkVeilWrapper visible={true} intensity="light" />
   ```

2. **Отключайте эффект когда не нужен**
   ```svelte
   <DarkVeilWrapper visible={showMenu} /> <!-- Отключается вне экрана меню -->
   ```

3. **Используйте `prefers-reduced-motion` для хозяйства батареей**
   - Компонент автоматически обнаруживает эту настройку

4. **На планшетах используйте среднее качество**
   ```svelte
   <DarkVeilWrapper quality="medium" />
   ```

## Совместимость браузеров

| Браузер | Desktop | Mobile | Поддержка |
|---------|---------|--------|-----------|
| Chrome | ✅ | ✅ | Полная |
| Firefox | ✅ | ✅ | Полная |
| Safari | ✅ | ✅ | Полная |
| Edge | ✅ | ✅ | Полная |
| Opera | ✅ | ✅ | Полная |
| IE 11 | ❌ | ❌ | Не поддерживается |

## Поддержка WebGL

- WebGL 1.0: ✅ Поддерживается
- WebGL 2.0: ✅ Поддерживается с автоматическим fallback

Если WebGL не поддерживается, компонент автоматически отключается.

## Снижение проблем

### Проблема: Черный экран вместо эффекта

**Решение:**
1. Проверьте, есть ли WebGL поддержка:
   ```javascript
   import { platformDetector } from './lib/darkVeilUtils.js';
   const caps = platformDetector.getDeviceCapabilities();
   console.log(caps.webgl, caps.webgl2);
   ```

2. Проверьте консоль браузера на ошибки шейдеров

### Проблема: Низкая производительность на мобильных

**Решение:**
```svelte
<DarkVeilWrapper intensity="light" quality="low" />
```

### Проблема: Неправильно определяется платформа

**Решение:**
```javascript
import { platformDetector } from './lib/darkVeilUtils.js';
const platform = platformDetector.getPlatform();
console.log('Detected:', platform.name);
```

## Лицензия

MIT

## Автор

TeleGhost Development Team
