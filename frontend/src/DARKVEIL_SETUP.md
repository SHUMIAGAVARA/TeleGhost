# 🚀 DarkVeil - Quick Start Guide

## ✅ Статус реализации

**ПОЛНОСТЬЮ ГОТОВО К ИСПОЛЬЗОВАНИЮ** ✓

Все компоненты, утилиты и стили уже созданы и оптимизированы для:
- ✅ Windows Desktop
- ✅ macOS Desktop  
- ✅ Linux Desktop
- ✅ iPhone/iPad (iOS)
- ✅ Android смартфоны и планшеты
- ✅ Wails приложения (Desktop + Mobile)

## 📦 Созданные файлы

### Компоненты Svelte
```
frontend/src/components/
├── DarkVeil.svelte           # Desktop + Tablet
├── DarkVeilMobile.svelte     # Мобильная оптимизация
├── DarkVeilWrapper.svelte    # Универсальная обёртка (рекомендуется)
└── DarkVeil.css              # Платформо-специфичные стили
```

### Утилиты и Конфигурация
```
frontend/src/lib/
├── darkVeilUtils.js          # Определение платформы
├── darkVeilConfig.js         # Конфигурация для каждой платформы
└── darkVeilValidator.js      # Валидатор реализации
```

### Документация
```
frontend/src/components/
├── DarkVeil.README.md        # Полная документация
├── DarkVeil.EXAMPLES.md      # 12 примеров использования
└── App.svelte.integration.md # Инструкции интеграции
```

## 🚀 Быстрый старт (30 секунд)

### Вариант 1: Самый простой (Рекомендуется)

Добавьте в `App.svelte`:

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
</script>

<DarkVeilWrapper />

<!-- Ваш контент приложения -->
```

**Готово!** Компонент автоматически:
- Определит платформу (iOS, Android, Windows, macOS, Linux)
- Выберет оптимальное качество для устройства
- Адаптируется к ориентации экрана
- Применит правильные стили

### Вариант 2: С управлением

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  
  let visible = true;
  let quality = 'auto'; // или 'high', 'medium', 'low'
  let intensity = 'auto'; // или 'heavy', 'normal', 'light'
</script>

<button on:click={() => visible = !visible}>Toggle Effect</button>

<DarkVeilWrapper {visible} {quality} {intensity} />
```

### Вариант 3: С информацией о платформе

```svelte
<script>
  import DarkVeilWrapper from './components/DarkVeilWrapper.svelte';
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const platform = platformDetector.getPlatform();
  const capabilities = platformDetector.getDeviceCapabilities();
</script>

{#if capabilities.performanceClass === 'high'}
  <DarkVeilWrapper intensity="heavy" />
{:else if capabilities.performanceClass === 'medium'}
  <DarkVeilWrapper intensity="normal" />
{:else}
  <DarkVeilWrapper intensity="light" />
{/if}

<p>Platform: {platform.name}</p>
```

## 📋 Чек-лист интеграции

- [ ] Скопированы все файлы из `components/` 
- [ ] Скопированы все файлы из `lib/`
- [ ] Обновлены стили в `style.css` (уже добавлены)
- [ ] Добавлен `DarkVeilWrapper` в `App.svelte`
- [ ] Убедиться что UI контент имеет `z-index >= 1`
- [ ] Протестировано на Desktop (Chrome/Firefox/Safari/Edge)
- [ ] Протестировано на Mobile (iOS Safari/Android Chrome)

## 🎨 Примеры использования

### Пример 1: Только на главный экран
```svelte
<DarkVeilWrapper visible={screen === 'main'} />
```

### Пример 2: С сохранением настроек пользователя
```svelte
<script>
  let quality = JSON.parse(localStorage.getItem('dvQuality') || '"auto"');
  
  function saveQuality(q) {
    quality = q;
    localStorage.setItem('dvQuality', JSON.stringify(q));
  }
</script>

<select value={quality} on:change={(e) => saveQuality(e.target.value)}>
  <option value="auto">Auto</option>
  <option value="high">High</option>
  <option value="medium">Medium</option>
  <option value="low">Low</option>
</select>

<DarkVeilWrapper {quality} />
```

### Пример 3: Отключить на очень слабых устройствах
```svelte
<script>
  import { platformDetector } from './lib/darkVeilUtils.js';
  
  const isSupported = platformDetector.getDeviceCapabilities().webgl;
</script>

{#if isSupported}
  <DarkVeilWrapper />
{/if}
```

## ⚡ Производительность

### Автоматическая оптимизация:

| Устройство | Качество | FPS | Эффекты |
|-----------|----------|-----|----------|
| High-end Desktop | High | 60 | Все |
| Medium Desktop | Medium | 30 | Основные |
| Low-end Desktop | Low | 24 | Минимум |
| Tablet | Medium | 30 | Большинство |
| Powerful Mobile | Medium | 30 | Основные |
| Standard Mobile | Low | 24 | Минимум |
| Low-end Mobile | Low | 12 | Отключены |

### Советы для оптимизации:

```svelte
<!-- На мобильных используйте light интенсивность -->
<DarkVeilWrapper intensity="light" />

<!-- Отключайте эффект вне основного экрана -->
<DarkVeilWrapper visible={isMainScreen} />

<!-- Используйте auto качество (автоматическое определение) -->
<DarkVeilWrapper quality="auto" />
```

## 🧪 Тестирование

### Проверка работы компонента:

```javascript
// В браузер-консоли:
import { printChecklist } from './lib/darkVeilValidator.js';
printChecklist();
```

### Проверка информации об устройстве:

```javascript
import { platformDetector } from './lib/darkVeilUtils.js';

const platform = platformDetector.getPlatform();
const capabilities = platformDetector.getDeviceCapabilities();

console.log('Platform:', platform);
console.log('Capabilities:', capabilities);
```

## 🐛 Решение проблем

### Проблема: Черный экран вместо эффекта

**Решение:**
1. Проверьте консоль браузера на ошибки
2. Убедитесь что WebGL поддерживается:
   ```javascript
   const { platformDetector } = require('./lib/darkVeilUtils.js');
   console.log(platformDetector.getDeviceCapabilities());
   ```
3. Проверьте что z-index установлен правильно

### Проблема: Низкая производительность

**Решение:**
```svelte
<!-- Используйте низкую интенсивность на мобильных -->
<DarkVeilWrapper quality="low" intensity="light" />
```

### Проблема: Не работает на iOS

**Решение:**
1. Убедитесь что Safari имеет WebGL2 support
2. Проверьте что используется HTTPS (если нужно)
3. Попробуйте отключить режим `prefers-reduced-motion`

## 📚 Дополнительные ресурсы

- **Полная документация**: [DarkVeil.README.md](./DarkVeil.README.md)
- **12 Примеров**: [DarkVeil.EXAMPLES.md](./DarkVeil.EXAMPLES.md)
- **Интеграция в App.svelte**: [App.svelte.integration.md](../App.svelte.integration.md)

## 🎯 Поддерживаемые функции

- ✅ Кроссплатформенная поддержка
- ✅ Адаптивные стили для всех разрешений
- ✅ Автоматическое определение качества
- ✅ Поддержка высокого DPI
- ✅ Режим экономии энергии
- ✅ Поддержка `prefers-reduced-motion`
- ✅ Поддержка `prefers-color-scheme`
- ✅ Safe Area для iPhone X+
- ✅ Поддержка notch экранов
- ✅ WebGL 1.0 и 2.0
- ✅ Кэширование (опционально)
- ✅ Отладочные режимы

## 📞 Поддержка

### Если что-то не работает:

1. Проверьте консоль браузера на ошибки
2. Используйте `printChecklist()` для валидации
3. Проверьте совместимость браузера/устройства
4. Используйте режим `quality="low"` для тестирования

## 🎉 Готово!

Компонент полностью готов к использованию. Просто добавьте `<DarkVeilWrapper />` в ваше приложение и наслаждайтесь!

---

**Создано для:** TeleGhost v2  
**Статус:** ✅ Полностью реализовано  
**Последнее обновление:** 14 февраля 2026
