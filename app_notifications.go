package main

import (
	"fmt"
	"log"

	"github.com/gen2brain/beeep"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// sendNotification отправляет системное уведомление
func (a *App) sendNotification(senderName, content, contentType string) {
	if a.ctx == nil {
		return
	}

	// Проверяем, скрыто ли окно
	// Если окно видимо, не показываем системное уведомление
	if a.trayManager != nil && a.trayManager.isVisible {
		return
	}

	title := fmt.Sprintf("TeleGhost - %s", senderName)
	message := content

	// Для разных типов контента формируем разные сообщения
	switch contentType {
	case "file_offer":
		message = "📎 Отправил(а) файл"
	case "mixed":
		if content == "" {
			message = "📷 Отправил(а) изображение"
		} else {
			message = fmt.Sprintf("📷 %s", content)
		}
	case "text":
		// Ограничиваем длину сообщения для уведомления
		if len(message) > 100 {
			message = message[:97] + "..."
		}
	}

	// Отправляем системное уведомление
	err := beeep.Notify(title, message, "")
	if err != nil {
		log.Printf("[Notifications] Failed to send notification: %v", err)
	}
}

// updateUnreadCount обновляет счетчик непрочитанных сообщений
func (a *App) updateUnreadCount() {
	if a.repo == nil || a.ctx == nil {
		return
	}

	// Получаем количество непрочитанных сообщений
	unreadCount, err := a.repo.GetUnreadCount(a.ctx)
	if err != nil {
		log.Printf("[Notifications] Failed to get unread count: %v", err)
		return
	}

	// Обновляем заголовок в трее
	if a.trayManager != nil {
		a.trayManager.updateUnreadCount(unreadCount)
	}

	// Отправляем событие во фронтенд
	runtime.EventsEmit(a.ctx, "unread_count", unreadCount)
}

// GetUnreadCount возвращает количество непрочитанных сообщений
func (a *App) GetUnreadCount() (int, error) {
	if a.repo == nil {
		return 0, fmt.Errorf("repository not initialized")
	}
	return a.repo.GetUnreadCount(a.ctx)
}

// MarkChatAsRead помечает все сообщения в чате как прочитанные
func (a *App) MarkChatAsRead(chatID string) error {
	if a.repo == nil {
		return fmt.Errorf("repository not initialized")
	}

	err := a.repo.MarkChatAsRead(a.ctx, chatID)
	if err != nil {
		return err
	}

	// Обновляем счетчик
	go a.updateUnreadCount()
	return nil
}
