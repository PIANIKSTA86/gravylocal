#!/usr/bin/env bash
# ==============================================================================
# GRAVY v2.0 - Script de Instalación y Preparación para macOS / Linux
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          GRAVY v2.0 - Instalador para macOS / Linux          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar Node.js
echo "🔍 [1/4] Verificando entorno Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js no está instalado en el sistema."
    echo "👉 En macOS, puedes instalarlo fácilmente con Homebrew:"
    echo "     brew install node"
    echo "   O descargando el instalador oficial desde https://nodejs.org"
    echo ""
    exit 1
fi
NODE_VER=$(node -v)
echo "✅ Node.js detectado: $NODE_VER"

# 2. Descargar / Verificar binario nativo de PocketBase para Darwin
echo ""
echo "📦 [2/4] Verificando binario nativo de PocketBase..."
PB_VERSION="0.22.20"
UNAME_S=$(uname -s)
UNAME_M=$(uname -m)

if [ ! -f "$DIR/pocketbase" ]; then
    if [ "$UNAME_S" = "Darwin" ]; then
        if [ "$UNAME_M" = "arm64" ]; then
            PB_ARCH="darwin_arm64"
            echo "🍏 Detectado macOS Apple Silicon (M1/M2/M3/M4)..."
        else
            PB_ARCH="darwin_amd64"
            echo "🍏 Detectado macOS Intel (x86_64)..."
        fi
        
        PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip"
        echo "⬇️  Descargando PocketBase v${PB_VERSION} (${PB_ARCH})..."
        curl -L -o "$DIR/temp_pb.zip" "$PB_URL"
        
        echo "📂 Descomprimiendo binario..."
        unzip -o -q "$DIR/temp_pb.zip" "pocketbase" -d "$DIR"
        rm -f "$DIR/temp_pb.zip"
    elif [ "$UNAME_S" = "Linux" ]; then
        if [ "$UNAME_M" = "aarch64" ] || [ "$UNAME_M" = "arm64" ]; then
            PB_ARCH="linux_arm64"
        else
            PB_ARCH="linux_amd64"
        fi
        PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip"
        echo "🐧 Descargando PocketBase v${PB_VERSION} para Linux (${PB_ARCH})..."
        curl -L -o "$DIR/temp_pb.zip" "$PB_URL"
        unzip -o -q "$DIR/temp_pb.zip" "pocketbase" -d "$DIR"
        rm -f "$DIR/temp_pb.zip"
    fi
else
    echo "✅ Binario de PocketBase ya presente en el proyecto."
fi

# 3. Asignar permisos ejecutables y remover cuarentena de macOS Gatekeeper
echo ""
echo "🔑 [3/4] Configurando permisos de ejecución (chmod +x)..."
chmod +x "$DIR/pocketbase" 2>/dev/null || true
chmod +x "$DIR/"*.sh 2>/dev/null || true
chmod +x "$DIR/"*.command 2>/dev/null || true

if [ "$UNAME_S" = "Darwin" ]; then
    xattr -d com.apple.quarantine "$DIR/pocketbase" 2>/dev/null || true
    xattr -d com.apple.quarantine "$DIR/"*.command 2>/dev/null || true
fi
echo "✅ Permisos establecidos correctamente."

# 4. Instalar dependencias npm del Hub
echo ""
echo "📚 [4/4] Verificando dependencias del Orquestador (Hub)..."
if [ -d "$DIR/hub" ]; then
    cd "$DIR/hub"
    if [ ! -d "node_modules" ]; then
        echo "📥 Instalando paquetes npm en hub..."
        npm install --production --silent
    else
        echo "✅ node_modules presente en hub."
    fi
    cd "$DIR"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  🎉 ¡INSTALACIÓN COMPLETADA CON ÉXITO!"
echo "══════════════════════════════════════════════════════════════"
echo "  Para iniciar GRAVY en macOS:"
echo "    - Opción 1: Doble clic en 'start.command' desde Finder"
echo "    - Opción 2: Ejecuta './start.sh' en la terminal"
echo "══════════════════════════════════════════════════════════════"
echo ""
