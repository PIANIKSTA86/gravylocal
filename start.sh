#!/usr/bin/env bash
# ==============================================================================
# GRAVY v2.0 - Lanzador Unificado de Servicios para macOS / Linux
# ==============================================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Asegurar permisos de ejecución
chmod +x "$DIR/pocketbase" 2>/dev/null || true

if [ ! -f "$DIR/pocketbase" ]; then
    echo ""
    echo "❌ [ERROR] No se encontró el binario 'pocketbase' en $DIR"
    echo "👉 Ejecuta primero './instalar.sh' para descargar el binario automáticamente."
    echo ""
    exit 1
fi

MODE="$1"

if [ -z "$MODE" ]; then
    echo ""
    echo "==============================================="
    echo "  GRAVY v2.0 - Lanzador Unificado de Servicios"
    echo "==============================================="
    echo "  [1] Modo Local     (Solo este equipo - 127.0.0.1)"
    echo "  [2] Modo LAN       (Red Local / WiFi - 0.0.0.0)"
    echo "  [3] Modo Cloud     (Acceso Nube / Cloudflare)"
    echo "==============================================="
    echo ""
    read -p "Seleccione una opción (1-3) [Por defecto: 1]: " CHOICE
    case "$CHOICE" in
        2) MODE="lan" ;;
        3) MODE="cloud" ;;
        *) MODE="local" ;;
    esac
fi

case "$MODE" in
    --lan|-lan|lan) MODE="lan" ;;
    --cloud|-cloud|cloud) MODE="cloud" ;;
    *) MODE="local" ;;
esac

echo ""
echo "-----------------------------------------------"
echo "  Iniciando GRAVY v2.0 en Modo: $MODE"
echo "-----------------------------------------------"

# 1. Limpieza de procesos en puertos de GRAVY (8080-8150)
echo "🧹 [1/4] Cerrando procesos anteriores en puertos 8080-8150..."
if command -v lsof &> /dev/null; then
    for port in $(seq 8080 8150); do
        PIDS=$(lsof -ti :$port 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            kill -9 $PIDS 2>/dev/null || true
        fi
    done
fi
sleep 1

# 2. Configurar IPs
BIND_IP="127.0.0.1"
LOCAL_IP="localhost"

if [ "$MODE" = "lan" ]; then
    BIND_IP="0.0.0.0"
    if [ "$(uname -s)" = "Darwin" ]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    fi
fi

mkdir -p "$DIR/logs"

# 3. Iniciar GRAVY HUB (Puerto 8089)
echo "🚀 [2/4] Iniciando GRAVY HUB ($BIND_IP:8089)..."
"$DIR/pocketbase" serve --http="$BIND_IP:8089" --dir="$DIR/hub/pb_data" --hooksDir="$DIR/hub/pb_hooks" > "$DIR/logs/hub.log" 2>&1 &
HUB_PID=$!

# 4. Iniciar Orquestador (Puerto 8088)
echo "⚙️  [3/4] Iniciando Orquestador (Puerto 8088)..."
export GRAVY_BIND_IP="$BIND_IP"
node "$DIR/hub/orchestrator.js" > "$DIR/logs/orchestrator.log" 2>&1 &
ORCH_PID=$!

# 5. Iniciar Empresa Principal (Puerto 8090)
echo "🏢 [4/4] Iniciando Empresa Principal ($BIND_IP:8090)..."
"$DIR/pocketbase" serve --http="$BIND_IP:8090" --dir="$DIR/pb_data" --publicDir="$DIR/pb_public" --hooksDir="$DIR/pb_hooks" > "$DIR/logs/empresa_principal.log" 2>&1 &
MAIN_PID=$!

echo ""
echo "================================================"
echo "  🎉 GRAVY v2.0 listo en modo: $MODE"
echo ""
if [ "$MODE" = "lan" ]; then
    echo "   - Web/Backend (Mac Local):  http://localhost:8090"
    echo "   - Web/Backend (Red LAN):   http://$LOCAL_IP:8090"
    echo "   - Hub (Mac Local):          http://localhost:8089"
    echo "   - Hub (Red LAN):           http://$LOCAL_IP:8089"
elif [ "$MODE" = "cloud" ]; then
    echo "   - Web/App (Nube):          https://app.gravy-ms.com"
    echo "   - Hub (Nube):              https://hub.gravy-ms.com"
    echo "   - Local:                   http://localhost:8090"
else
    echo "   - Web/Backend:             http://localhost:8090"
    echo "   - Hub:                     http://localhost:8089"
fi
echo "================================================"
echo ""
echo "💡 Para detener todos los servicios, ejecuta: ./stop.sh o haz doble clic en stop.command"
echo ""

# Abrir en el navegador predeterminado
sleep 2
if [ "$MODE" = "cloud" ]; then
    TARGET_URL="https://app.gravy-ms.com"
else
    TARGET_URL="http://localhost:8090"
fi

if command -v open &> /dev/null; then
    open "$TARGET_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$TARGET_URL"
fi
