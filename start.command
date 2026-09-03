#!/usr/bin/env bash
# ==============================================================================
# GRAVY v2.0 - Lanzador Finder macOS (Doble Clic)
# ==============================================================================
cd "$(dirname "$0")"
chmod +x ./start.sh ./stop.sh ./instalar.sh ./pocketbase 2>/dev/null || true
./start.sh
