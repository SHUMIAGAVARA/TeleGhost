#!/bin/bash
# Linux Build script for i2pd integration with TeleGhost
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I2PD_DIR="$SCRIPT_DIR/i2pd"

echo "=== TeleGhost i2pd Linux Build Script ==="

# i2pd should be vendored in repo
if [ ! -f "$I2PD_DIR/build/CMakeLists.txt" ]; then
    echo "ERROR: i2pd source code not found in '$I2PD_DIR'. Please vendor the source code."
    exit 1
fi

echo "Using local i2pd source..."

# Build libi2pd static library
cd "$I2PD_DIR/build"
rm -rf obj && mkdir -p obj && cd obj

echo "Configuring for Linux..."
cmake -DWITH_STATIC=ON \
      -DWITH_BINARY=OFF \
      -DWITH_UPNP=ON \
      -DWITH_SAM=ON \
      -DCMAKE_BUILD_TYPE=Release \
      -DBOOST_STATIC=ON \
      -DOPENSSL_CRYPTO_LIBRARY=/usr/lib/libcrypto.so \
      -DOPENSSL_SSL_LIBRARY=/usr/lib/libssl.so \
      -DMINIUPNPC_LIBRARY=/usr/lib/libminiupnpc.so \
      -DMINIUPNPC_INCLUDE_DIR=/usr/include/miniupnpc \
      ..

make -j$(nproc) libi2pd libi2pdclient libi2pdlang

# Copy library to current directory for CGO
cp libi2pd.a libi2pdclient.a libi2pdlang.a "$SCRIPT_DIR/"
echo "Linux Build Complete ✓"
