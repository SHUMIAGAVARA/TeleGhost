/*
 * C wrapper for i2pd C++ API
 * This file provides C-compatible functions that can be called via CGO
 *
 * Build with:
 *   g++ -std=c++17 -c i2pd_wrapper.cpp -I../i2pd/libi2pd -I../i2pd/i18n
 * -I../i2pd
 */

#include <atomic>
#include <cstring>
#include <fstream>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <vector>

// i2pd includes
#include "ClientContext.h"
#include "Config.h"
#include "FS.h"
#include "Log.h"
#include "RouterContext.h"
#include "api.h"

static std::atomic<bool> g_running{false};
static std::string g_b32_address;
static std::string g_datadir;

extern "C" {

// Initialize i2pd with configuration
void i2pd_init(const char *datadir, int sam_enabled, int sam_port) {
  g_datadir = datadir ? datadir : ".i2pd";

  // Storage for strings to ensure they stay alive until InitI2P call
  static std::vector<std::string> args_storage;
  args_storage.clear();

  // Prepare arguments for i2pd
  args_storage.push_back("teleghost"); // argv[0]

  args_storage.push_back("--datadir=" + g_datadir);

  // SAM configuration
  if (sam_enabled) {
    args_storage.push_back("--sam.enabled=true");
    args_storage.push_back("--sam.address=127.0.0.1");
    args_storage.push_back("--sam.port=" + std::to_string(sam_port));
  } else {
    args_storage.push_back("--sam.enabled=false");
  }

  // Enable NTCP2 and SSU2 for NAT traversal
  args_storage.push_back("--ntcp2.enabled=true");
  args_storage.push_back("--ssu2.enabled=true");

  // Disable HTTP console and other services we don't need
  args_storage.push_back("--http.enabled=false");
  args_storage.push_back("--httpproxy.enabled=false");
  args_storage.push_back("--socksproxy.enabled=false");
  args_storage.push_back("--bob.enabled=false");
  args_storage.push_back("--i2cp.enabled=false");
  args_storage.push_back("--i2pcontrol.enabled=false");

  // Floodfill off for client mode
  // args_storage.push_back("--floodfill=false"); // Error: does not take
  // arguments (implicit false)

  // Logging to stdout for debugging
  args_storage.push_back("--log=stdout");
  args_storage.push_back("--loglevel=info");

  // Bandwidth settings for faster bootstrap
  args_storage.push_back("--bandwidth=O"); // 256 Kbps

  // Create argv pointers
  std::vector<char *> args_ptrs;
  std::cout << "DEBUG: i2pd args:" << std::endl;
  for (auto &arg : args_storage) {
    args_ptrs.push_back(const_cast<char *>(arg.c_str()));
    std::cout << "  " << arg << std::endl;
  }
  std::cout << "-----------------" << std::endl;

  // Initialize i2pd
  i2p::api::InitI2P(args_ptrs.size(), args_ptrs.data(), "TeleGhost");
}

// Start i2pd router
void i2pd_start() {
  if (g_running)
    return;

  // Start with no log stream (use file logging)
  i2p::api::StartI2P(nullptr);
  g_running = true;
}

// Stop i2pd router
void i2pd_stop() {
  if (!g_running)
    return;

  i2p::api::StopI2P();
  g_running = false;
}

// Terminate and cleanup
void i2pd_terminate() {
  i2p::api::TerminateI2P();
  g_b32_address.clear();
}

// Check if router is running
int i2pd_is_running() { return g_running ? 1 : 0; }

// Get router's B32 address
const char *i2pd_get_b32_address() {
  if (!g_running)
    return nullptr;

  try {
    auto &context = i2p::context;
    auto ident = context.GetRouterInfo().GetIdentHash();
    g_b32_address = ident.ToBase32() + ".b32.i2p";
    return g_b32_address.c_str();
  } catch (...) {
    return nullptr;
  }
}

} // extern "C"
