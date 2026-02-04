# TeleGhost - Тестирование

## 1. Проверка компиляции Go

```bash
# Компиляция всех пакетов
go build ./...

# Проверка зависимостей
go mod verify
go mod tidy
```

## 2. Тестирование Wails приложения

```bash
# Запуск в режиме разработки (hot reload)
wails dev

# Или с дополнительными флагами
wails dev -v -browser
```

**Ожидаемый результат:**
- Откроется окно приложения с Svelte UI
- В консоли не должно быть ошибок
- Hot reload работает при изменении файлов

## 3. Генерация Protobuf кода

```bash
# Установка protoc-gen-go (если нет)
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# Генерация Go кода из .proto файлов
protoc --go_out=. --go_opt=paths=source_relative proto/teleghost.proto

# Перемещение в internal/proto
mkdir -p internal/proto
mv proto/*.pb.go internal/proto/ 2>/dev/null || true
```

## 4. Проверка структуры проекта

```bash
# Показать структуру
tree -L 3 -I 'node_modules|frontend/dist|build'

# Или с помощью find
find . -type d -name ".*" -prune -o -type d -print | head -20
```

## 5. Сборка production версии

```bash
# Сборка для текущей платформы
wails build

# Результат в build/bin/
ls -lh build/bin/
```

## 6. Тестирование моделей (пример)

Создайте файл `internal/core/models_test.go`:

```go
package core

import (
	"testing"
	"time"
)

func TestUserModel(t *testing.T) {
	user := &User{
		ID:        "test-id",
		Nickname:  "TestUser",
		CreatedAt: time.Now(),
	}
	
	if user.Nickname != "TestUser" {
		t.Errorf("Expected nickname TestUser, got %s", user.Nickname)
	}
}
```

Запуск:
```bash
go test ./internal/core/...
```

## 7. Git workflow

```bash
# Проверка статуса
git status

# Просмотр истории
git log --oneline

# Создание новой ветки для фичи
git checkout -b feature/sqlite-repository

# После изменений
git add .
git commit -m "feat: implement SQLite repository"
```

## Чеклист готовности

- [x] Go компилируется без ошибок
- [x] Git инициализирован
- [ ] `wails dev` запускается
- [ ] Protobuf код сгенерирован
- [ ] Тесты написаны и проходят
- [ ] Production build создаётся

## Возможные проблемы

### Wails не найден
```bash
export PATH=$PATH:$(go env GOPATH)/bin
```

### protoc не установлен
```bash
# Ubuntu/Debian
sudo apt install protobuf-compiler

# macOS
brew install protobuf

# Или скачать с https://github.com/protocolbuffers/protobuf/releases
```

### SQLite ошибки компиляции
```bash
# Нужен gcc для cgo
sudo apt install build-essential  # Ubuntu/Debian
```
