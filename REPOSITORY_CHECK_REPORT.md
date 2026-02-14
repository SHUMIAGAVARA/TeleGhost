# Отчёт проверки репозитория TeleGhost

## Выполненные проверки

### 1. Go (бэкенд)
- **`go build ./...`** — успешно (после сборки frontend)
- **`go build ./internal/...`** — успешно
- **`go vet ./...`** — успешно
- **`go test ./internal/...`** — частично:
  - **OK:** `internal/core/identity`, `internal/network/media`, `internal/network/profiles`
  - **FAIL:** `internal/repository/sqlite` — тесты требуют CGO (go-sqlite3). Ошибка: `Binary was compiled with 'CGO_ENABLED=0'`. Для прохождения тестов нужна сборка с `CGO_ENABLED=1` и установленный C-компилятор.

### 2. Frontend (Svelte + Vite)
- **`npx svelte-check`** — успешно (после исправлений)
- **`npm run build`** — успешно

### 3. Полная сборка приложения
- **`go build -o TeleGhost.exe .`** — успешно (собран исполняемый файл с встроенным frontend)

---

## Исправленные ошибки

### CSS (Svelte)
1. **`frontend/src/components/DarkVeil.svelte`**
   - Убрана лишняя закрывающая скобка `}` в `<style>`, из-за которой PostCSS выдавал "Unexpected }".
   - Исправлена вложенность: `@media (max-width: 768px)` вынесен на верхний уровень, для селектора внутри медиа-запроса добавлен `:global`.

2. **`frontend/src/components/DarkVeilWrapper.svelte`**
   - Добавлена закрывающая скобка `}` для блока `:global { ... }` (исправлено "Unclosed block").

3. **`frontend/src/components/DarkVeilMobile.svelte`**
   - Добавлена закрывающая скобка `}` для селектора `.darkveil-mobile.ios`.
   - Удалена лишняя `}` в конце `<style>`.

### API / Wails-биндинги
4. **`RequestProfileUpdate` не экспортировался из `wailsjs/go/main/App.js`**
   - В десктопе метод в Go называется **`RequestProfile`**.
   - В **`frontend/src/App.svelte`**: убран fallback на несуществующий `RequestProfileUpdate`, оставлен вызов `AppActions.RequestProfile(addr)`.
   - В **`frontend/src/lib/api_bridge.js`**: в списке методов заменено `'RequestProfileUpdate'` на `'RequestProfile'` для соответствия биндингу.

---

## Карта связей между пакетами и файлами

### Точка входа
- **`main.go`** — создаёт `App` (app.go), встраивает `frontend/dist`, запускает Wails.

### Слой приложения (desktop)
- **`app.go`** — структура `App`, все методы, вызываемые с фронта (Wails Bind).
  - Использует: `teleghost/internal/appcore`, `teleghost/internal/network/media`.
  - Создаёт `AppCore` через `appcore.NewAppCore(...)`.
  - Отдаёт медиа через `GetMediaHandler()` (media.Handler).

### Ядро (общее для desktop и mobile)
- **`internal/appcore/appcore.go`** — `AppCore`, общая бизнес-логика.
  - Зависимости: `internal/core`, `internal/core/identity`, `internal/network/messenger`, `internal/network/profiles`, `internal/network/router`, `internal/repository/sqlite`.
- **`internal/appcore/auth.go`** — профили, вход, ПИН → core, identity.
- **`internal/appcore/contacts.go`** — контакты → core.
- **`internal/appcore/folders.go`** — папки чатов → core.
- **`internal/appcore/messages.go`** — сообщения, вложения → core, identity, proto, utils.
- **`internal/appcore/settings.go`** — настройки (файлы).
- **`internal/appcore/reseed.go`** — reseed I2P (архивы).

### Сеть и мессенджер
- **`internal/network/router/router.go`** — реализация I2P через go-i2p/sam3 (SAM).
- **`internal/network/i2pd/router.go`** — реализация через встроенный i2pd (CGO).
- **`embedded_router.go`** — использует `internal/network/i2pd` (встроенный роутер).
- **`internal/network/messenger/messenger.go`** — протокол обмена сообщениями → core, identity, router, proto.
- **`internal/network/profiles/profiles.go`** — профили (nickname, avatar) → crypto.
- **`internal/network/media/media_crypt.go`** — шифрование медиа (Chacha20).

### Хранение и модели
- **`internal/repository/repository.go`** — интерфейс репозитория (core-типы).
- **`internal/repository/sqlite/repository.go`** — реализация на SQLite → core, identity.
- **`internal/core/models.go`** — модели (Chat, Message, Contact и т.д.).
- **`internal/core/identity/identity.go`** — ключи, мнемоника, handshake.
- **`internal/core/media_utils.go`** — работа с изображениями.
- **`internal/proto/teleghost.pb.go`** — сгенерированный protobuf (proto/teleghost.proto).

### Утилиты
- **`internal/utils/image.go`** — resize изображений (используется в appcore/messages и др.).

### Frontend → Backend
- **`frontend/wailsjs/go/main/App.js`** — сгенерированный Wails-клиент: все методы `App` из `app.go` экспортируются сюда и вызываются как `window['go']['main']['App']['MethodName'](...)`.
- **`frontend/src/App.svelte`** — импортирует `AppActions` из `wailsjs/go/main/App.js`, подписывается на события через `EventsOn` из `wailsjs/runtime/runtime.js`.
- Компоненты **Auth, Chat, Sidebar, Settings, Modals, QRModal** используют `AppActions` (и частично `api_bridge.js` для унификации с мобильной версией).

### Mobile
- **`mobile/mobile.go`** — HTTP API + SSE, создаёт свой `AppCore` с SSEEmitter и платформенными сервисами для Android; обрабатывает те же действия, что и десктоп (в т.ч. событие `RequestProfileUpdate` для мобильного API).

---

## Связь «от каждого к каждому» (кратко)

| Откуда        | Куда              | Связь |
|---------------|-------------------|--------|
| main.go       | app.go            | NewApp, GetMediaHandler |
| app.go        | appcore           | NewAppCore, все вызовы core.* |
| app.go        | network/media     | GetMediaHandler |
| appcore       | core, identity    | модели, ключи, handshake |
| appcore       | network/messenger | отправка/приём сообщений |
| appcore       | network/profiles  | загрузка/сохранение профилей |
| appcore       | network/router    | интерфейс NetworkRouter (Start, Connect, Accept) |
| appcore       | repository/sqlite| сохранение чатов, сообщений, контактов |
| messenger     | router            | Connect/Accept для I2P |
| messenger     | proto             | сериализация пакетов |
| repository/sqlite | core, identity | типы Message, Contact, Identity |
| embedded_router.go | network/i2pd  | встроенный I2P-роутер |
| Frontend      | wailsjs/go/main/App.js | все вызовы методов App |

Репозиторий согласован: все импорты и биндинги соответствуют друг другу.

---

## Оставшиеся предупреждения (не блокируют сборку)

- **A11y (accessibility):** кликабельные `div` без обработки клавиатуры (on:keydown), autofocus, label без связи с контролом. Рекомендуется постепенно добавлять `role`, `tabindex` и обработчики клавиш.
- **Unused CSS:** неиспользуемые селекторы в App.svelte, Sidebar.svelte, Chat.svelte, Auth.svelte, Settings.svelte (например `.btn-danger`, `.unread-badge`, `.mobile-layout .sidebar`). Можно удалить или использовать в разметке.
- **Tailwind:** в конфиге не задан `content` — сгенерированный CSS может не содержать нужные утилиты; стоит указать пути к шаблонам в `tailwind.config.js`.
- **Unused export:** в компонентах (Sidebar, Chat, Auth) есть `export let`, которые не используются внутри компонента — можно заменить на `export const` для только внешнего использования.

---

## Итог

- Критических ошибок после правок нет.
- Go-код собирается, vet проходит; тесты repository/sqlite требуют CGO.
- Frontend собирается, svelte-check проходит.
- Полная сборка приложения (desktop) выполняется успешно.
- Связи между файлами и пакетами проверены, несоответствий не найдено.
