package main

import (
	"fmt"
	"log"

	"fyne.io/systray"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// TrayManager управляет иконкой в системном трее
type TrayManager struct {
	app         *App
	iconData    []byte
	isVisible   bool
	unreadCount int
}

// NewTrayManager создаёт менеджер трея
func NewTrayManager(app *App, iconData []byte) *TrayManager {
	return &TrayManager{app: app, iconData: iconData, isVisible: true}
}

// Start запускает system tray в отдельной горутине
func (t *TrayManager) Start() {
	go func() {
		systray.Run(t.onReady, t.onExit)
	}()
}

// onReady вызывается когда трей готов
func (t *TrayManager) onReady() {
	systray.SetIcon(t.iconData)
	systray.SetTitle("TeleGhost")
	systray.SetTooltip("TeleGhost — Анонимный мессенджер I2P")

	// Обрабоботка клика по иконке (ЛКМ)
	// Используем SetOnTapped для fyne.io/systray v1.12.0+
	systray.SetOnTapped(func() {
		t.toggleWindow()
	})

	// Пункты меню (ПКМ)
	mShow := systray.AddMenuItem("Показать/Скрыть", "Переключить видимость окна")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Выход", "Закрыть приложение полностью")

	// Обработка кликов меню
	go func() {
		for {
			select {
			case <-mShow.ClickedCh:
				t.toggleWindow()
			case <-mQuit.ClickedCh:
				log.Println("[Tray] Quit requested")
				systray.Quit()
				if t.app != nil && t.app.ctx != nil {
					runtime.Quit(t.app.ctx)
				}
			}
		}
	}()
}

// toggleWindow переключает видимость окна
func (t *TrayManager) toggleWindow() {
	if t.app == nil || t.app.ctx == nil {
		return
	}

	if t.isVisible {
		runtime.WindowHide(t.app.ctx)
		t.isVisible = false
		if t.app.core != nil {
			t.app.core.IsVisible = false
		}
	} else {
		runtime.WindowShow(t.app.ctx)
		t.isVisible = true
		if t.app.core != nil {
			t.app.core.IsVisible = true
		}
	}
}

// Stop останавливает трей
func (t *TrayManager) Stop() {
	systray.Quit()
}

// updateUnreadCount обновляет счетчик непрочитанных сообщений
func (t *TrayManager) updateUnreadCount(count int) {
	t.unreadCount = count

	// Обновляем tooltip с количеством непрочитанных
	if count > 0 {
		systray.SetTitle("TeleGhost")
		systray.SetTooltip(fmt.Sprintf("TeleGhost — %d непрочитанных", count))
	} else {
		systray.SetTitle("TeleGhost")
		systray.SetTooltip("TeleGhost — Анонимный мессенджер I2P")
	}
}

// onExit вызывается при выходе
func (t *TrayManager) onExit() {
	log.Println("[Tray] Exiting...")
}
