// Package router предоставляет абстракцию I2P роутера через SAM3 API
package router

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"github.com/go-i2p/i2pkeys"
	"github.com/go-i2p/sam3"
)

// Router — интерфейс I2P роутера
type Router interface {
	// Start запускает роутер
	Start(ctx context.Context) error

	// Stop останавливает роутер
	Stop() error

	// GetSAMAddress возвращает адрес SAM Bridge
	GetSAMAddress() string

	// GetDestination возвращает наш I2P Destination
	GetDestination() string

	// IsReady проверяет готовность роутера
	IsReady() bool
}

// Config конфигурация роутера
type Config struct {
	// SAMAddress — адрес SAM bridge
	SAMAddress string

	// DataDir — директория для данных I2P
	DataDir string

	// SessionName — имя SAM сессии
	SessionName string

	// InboundLength — длина входящего туннеля
	InboundLength int

	// OutboundLength — длина исходящего туннеля
	OutboundLength int

	// InboundQuantity — количество входящих туннелей
	InboundQuantity int

	// OutboundQuantity — количество исходящих туннелей
	OutboundQuantity int

	// UseNTCP2Only — использовать только NTCP2 (SSU2 нестабилен)
	UseNTCP2Only bool
}

// DefaultConfig возвращает конфигурацию по умолчанию
func DefaultConfig() *Config {
	return &Config{
		SAMAddress:       "127.0.0.1:7656",
		DataDir:          ".teleghost/i2p",
		SessionName:      "TeleGhost",
		InboundLength:    3,
		OutboundLength:   3,
		InboundQuantity:  2,
		OutboundQuantity: 2,
		UseNTCP2Only:     true,
	}
}

// SAMRouter — реализация роутера через SAM API
type SAMRouter struct {
	config      *Config
	sam         *sam3.SAM
	session     *sam3.StreamSession
	keys        i2pkeys.I2PKeys
	destination string
	listener    *sam3.StreamListener
	ready       bool
	mu          sync.RWMutex
	ctx         context.Context
	cancel      context.CancelFunc
}

// NewSAMRouter создаёт новый SAM роутер
func NewSAMRouter(config *Config) *SAMRouter {
	if config == nil {
		config = DefaultConfig()
	}
	return &SAMRouter{
		config: config,
	}
}

// Start подключается к SAM и создаёт сессию
func (r *SAMRouter) Start(ctx context.Context) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.ctx, r.cancel = context.WithCancel(ctx)

	// Пробуем подключиться к SAM с ретраями
	var samConn *sam3.SAM
	var err error

	for i := 0; i < 5; i++ {
		samConn, err = sam3.NewSAM(r.config.SAMAddress)
		if err == nil {
			break
		}
		log.Printf("[SAMRouter] Retry %d: waiting for SAM at %s...", i+1, r.config.SAMAddress)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(2 * time.Second):
		}
	}

	if err != nil {
		return fmt.Errorf("failed to connect to SAM at %s: %w", r.config.SAMAddress, err)
	}

	r.sam = samConn

	// Генерируем новые ключи для сессии
	keys, err := samConn.NewKeys()
	if err != nil {
		return fmt.Errorf("failed to generate I2P keys: %w", err)
	}
	r.keys = keys
	r.destination = keys.Addr().Base64()

	// Формируем опции для сессии
	opts := []string{
		fmt.Sprintf("inbound.length=%d", r.config.InboundLength),
		fmt.Sprintf("outbound.length=%d", r.config.OutboundLength),
		fmt.Sprintf("inbound.quantity=%d", r.config.InboundQuantity),
		fmt.Sprintf("outbound.quantity=%d", r.config.OutboundQuantity),
		"inbound.allowZeroHop=false",
		"outbound.allowZeroHop=false",
	}

	// Создаём Streaming сессию
	session, err := samConn.NewStreamSession(r.config.SessionName, keys, opts)
	if err != nil {
		return fmt.Errorf("failed to create SAM session: %w", err)
	}

	r.session = session
	r.ready = true

	log.Printf("[SAMRouter] Started. Destination: %s...", r.destination[:32])

	return nil
}

// Stop останавливает роутер
func (r *SAMRouter) Stop() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.cancel != nil {
		r.cancel()
	}

	r.ready = false

	if r.listener != nil {
		r.listener.Close()
		r.listener = nil
	}

	if r.session != nil {
		r.session.Close()
		r.session = nil
	}

	if r.sam != nil {
		r.sam.Close()
		r.sam = nil
	}

	log.Printf("[SAMRouter] Stopped")
	return nil
}

// GetSAMAddress возвращает адрес SAM Bridge
func (r *SAMRouter) GetSAMAddress() string {
	return r.config.SAMAddress
}

// GetDestination возвращает наш I2P Destination (base64)
func (r *SAMRouter) GetDestination() string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.destination
}

// IsReady проверяет готовность
func (r *SAMRouter) IsReady() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.ready
}

// GetSession возвращает SAM сессию
func (r *SAMRouter) GetSession() *sam3.StreamSession {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.session
}

// GetKeys возвращает I2P ключи
func (r *SAMRouter) GetKeys() i2pkeys.I2PKeys {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.keys
}

// Dial устанавливает соединение с удалённым пиром
func (r *SAMRouter) Dial(destination string) (net.Conn, error) {
	r.mu.RLock()
	session := r.session
	samConn := r.sam
	r.mu.RUnlock()

	if session == nil || samConn == nil {
		return nil, fmt.Errorf("router not started")
	}

	// Парсим destination address
	addr, err := samConn.Lookup(destination)
	if err != nil {
		// Пробуем создать адрес напрямую из строки
		addr, err = i2pkeys.NewI2PAddrFromString(destination)
		if err != nil {
			return nil, fmt.Errorf("invalid destination: %w", err)
		}
	}

	conn, err := session.DialI2P(addr)
	if err != nil {
		return nil, fmt.Errorf("dial failed: %w", err)
	}

	return conn, nil
}

// Listen создаёт listener для входящих соединений
func (r *SAMRouter) Listen() (*sam3.StreamListener, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.session == nil {
		return nil, fmt.Errorf("router not started")
	}

	if r.listener == nil {
		listener, err := r.session.Listen()
		if err != nil {
			return nil, fmt.Errorf("failed to create listener: %w", err)
		}
		r.listener = listener
	}

	return r.listener, nil
}

// Accept ожидает входящее соединение
func (r *SAMRouter) Accept() (net.Conn, error) {
	listener, err := r.Listen()
	if err != nil {
		return nil, err
	}

	return listener.Accept()
}
