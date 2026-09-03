#!/usr/bin/env bash
# ==============================================================================
# GRAVY v2.0 - Script de Parada para macOS / Linux
# ==============================================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo ""
echo "🛑 Deteniendo todos los servicios de GRAVY v2.0 (Puertos 8080-8150)..."

# Detener PM2 si está en ejecución
if command -v pm2 &> /dev/null; then
    pm2 stop gravy-orchestrator 2>/dev/null || true
fi

# Detener procesos en puertos 8080 a 8150
if command -v lsof &> /dev/null; then
    COUNT=0
    for port in $(seq 8080 8150); do
        PIDS=$(lsof -ti :$port 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            kill -9 $PIDS 2>/dev/null || true
            COUNT=$((COUNT + 1))
        fi
    done
    echo "✅ Procesos finalizados en puertos de la suite GRAVY ($COUNT puertos liberados)."
else
    # Fallback si no está lsof
    pkill -f "pocketbase serve" 2>/dev/null || true
    pkill -f "orchestrator.js" 2>/dev/null || true
    echo "✅ Señal de parada enviada a pocketbase y orchestrator."
fi

echo "🏁 Todos los servicios se han detenido correctamente."
echo ""
