# TeleGhost Project Context

## Overview
TeleGhost is a decentralized, serverless messenger running on the I2P network.
Goal: A "Telegram-like" UX with maximum anonymity. No phone numbers, no central servers.

## Tech Stack
- **Language:** Go (Golang) 1.23+
- **GUI Framework:** Wails v2 (Go + Webview)
- **Frontend:** Svelte 5 + Tailwind CSS
- **Database:** SQLite (with encryption hooks capability)
- **Network Core:** Pure Go I2P Router (`github.com/go-i2p/go-i2p`) + SAM Client (`github.com/go-i2p/sam3`)
- **Protocol:** Custom Protobuf over I2P Streaming (TCP-like)

## Key Architecture Decisions
1.  **Pure Go Router:** We use the native Go implementation for the MVP to ensure easy cross-compilation (Linux/Windows/Android).
2.  **Adapter Pattern:** The network layer must be behind an interface (`NetworkRouter`) to allow swapping the engine for C++ `i2pd` in the future.
3.  **Identity:** Based on BIP-39 Mnemonic phrases. Keys are deterministic.
4.  **UX Philosophy:** Optimistic UI (don't wait for network), "Smart Paste" for adding contacts (parsing clipboard for keys).