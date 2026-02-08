#!/bin/bash
# Windows (MSYS2) Build script for i2pd integration with TeleGhost
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I2PD_DIR="$SCRIPT_DIR/i2pd"

echo "=== TeleGhost i2pd Windows (MSYS2) Build Script ==="

# i2pd should be vendored in repo
if [ ! -f "$I2PD_DIR/build/CMakeLists.txt" ]; then
    echo "ERROR: i2pd source code not found in '$I2PD_DIR'. Please vendor the source code."
    exit 1
fi

echo "Using local i2pd source..."

# Build libi2pd static library
cd "$I2PD_DIR/build"
rm -rf obj && mkdir -p obj && cd obj

echo "Configuring for Windows (MinGW64)..."
cmake -G "MinGW Makefiles" \
      -DWITH_STATIC=ON \
      -DWITH_BINARY=OFF \
      -DWITH_UPNP=OFF \
      -DCMAKE_BUILD_TYPE=Release \
      -DOPENSSL_USE_STATIC_LIBS=ON \
      -DBOOST_STATIC=ON \
      ..

echo "Building targets..."
cmake --build . --target libi2pd libi2pdclient libi2pdlang -- -j$(nproc)

# Copy library to current directory for CGO
cp libi2pd.a libi2pdclient.a libi2pdlang.a "$SCRIPT_DIR/"
echo "Windows Build Complete ✓"
